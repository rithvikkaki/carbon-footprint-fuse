from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User
from backend.app.schemas import UserRegister, UserLogin, UserUpdate, UserOut, Token
from backend.app.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

from backend.app.rate_limit import rate_limit
from backend.app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post(
    "/register",
    response_model=Token,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit(max_requests=settings.RATE_LIMIT_REGISTER, window_seconds=60, scope="register"))],
)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        name=user_in.name,
        organization=user_in.organization or "Independent Sustainability Advocate",
        country=user_in.country or "United States",
        credit_balance=420.0,  # Starting verified allowance for demo sandbox
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.id, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post(
    "/login",
    response_model=Token,
    dependencies=[Depends(rate_limit(max_requests=settings.RATE_LIMIT_LOGIN, window_seconds=60, scope="login"))],
)
def login_user(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": user.id, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserOut)
def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.organization is not None:
        current_user.organization = user_update.organization
    if user_update.country is not None:
        current_user.country = user_update.country
    if user_update.wallet_address is not None:
        current_user.wallet_address = user_update.wallet_address

    db.commit()
    db.refresh(current_user)
    return current_user
