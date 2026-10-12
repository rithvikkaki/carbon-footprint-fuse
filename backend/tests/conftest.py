import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from backend.app.database import Base, get_db
from backend.app.main import app
from backend.app.models import User
from backend.app.security import get_password_hash, create_access_token
from backend.app.seed import seed_database

import os
# Strict database safety guard: automated tests must use only a dedicated test database
TEST_DB_URL = os.getenv("TEST_DATABASE_URL")
if not TEST_DB_URL:
    # If TEST_DATABASE_URL is not set, allow isolated SQLite in-memory only; refuse dev fallback!
    TEST_DB_URL = "sqlite:///:memory:"

# Prevent accidental destructive test runs against active development or production databases!
disallowed_keywords = ["/ecofuse", "localhost:5432/ecofuse", "127.0.0.1:5432/ecofuse", "db:5432/ecofuse"]
if any(kw in TEST_DB_URL.lower() for kw in disallowed_keywords) and "test" not in TEST_DB_URL.lower().split("/")[-1]:
    raise RuntimeError(
        f"CRITICAL SAFETY GUARD REJECTION: Attempted to run automated test suite against active database '{TEST_DB_URL}'. "
        "Automated tests must explicitly target a dedicated test database (e.g. 'ecofuse_test' or SQLite in-memory)."
    )

if TEST_DB_URL.startswith("sqlite"):
    engine = create_engine(
        TEST_DB_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    from sqlalchemy.pool import NullPool
    engine = create_engine(
        TEST_DB_URL,
        poolclass=NullPool,
    )
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # Clean tables in reverse dependency order for pristine isolation
    for table in reversed(Base.metadata.sorted_tables):
        db.execute(table.delete())
    db.commit()
    seed_database(db)
    try:
        yield db
    finally:
        db.close()
        # Clean tables after test
        clean_db = TestingSessionLocal()
        for table in reversed(Base.metadata.sorted_tables):
            clean_db.execute(table.delete())
        clean_db.commit()
        clean_db.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        session = TestingSessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def test_user(db_session):
    user = User(
        id="usr_test_101",
        email="tester@ecofuse.org",
        name="Test User",
        hashed_password=get_password_hash("testpass123"),
        credit_balance=100.0,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture(scope="function")
def auth_headers(test_user):
    token = create_access_token(data={"sub": test_user.id, "email": test_user.email})
    return {"Authorization": f"Bearer {token}"}
