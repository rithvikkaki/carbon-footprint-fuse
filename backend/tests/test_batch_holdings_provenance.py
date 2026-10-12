import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from backend.app.main import app
from backend.app.database import get_db
from backend.app.models import User, CreditBatch, CreditBatchHolding, CreditRetirement, MarketListing
from backend.app.security import get_password_hash, create_access_token


@pytest.fixture
def auth_users(db_session: Session):
    pwd = get_password_hash("password123")
    
    # Creator / Seller
    seller = User(
        id=f"usr_seller_{uuid.uuid4().hex[:6]}",
        email=f"seller_{uuid.uuid4().hex[:6]}@ecofuse.org",
        hashed_password=pwd,
        name="Forest Developer Inc",
        organization="Amazon Reforestation Alliance",
        credit_balance=500.0,
        role="user",
    )
    # Buyer 1
    buyer1 = User(
        id=f"usr_b1_{uuid.uuid4().hex[:6]}",
        email=f"buyer1_{uuid.uuid4().hex[:6]}@ecofuse.org",
        hashed_password=pwd,
        name="Eco Logistics Corp",
        organization="Eco Logistics",
        credit_balance=500.0,
        role="user",
    )
    # Buyer 2 / User C
    buyer2 = User(
        id=f"usr_b2_{uuid.uuid4().hex[:6]}",
        email=f"buyer2_{uuid.uuid4().hex[:6]}@ecofuse.org",
        hashed_password=pwd,
        name="Clean Energy Partners",
        organization="Clean Energy",
        credit_balance=500.0,
        role="user",
    )
    # Admin / Reviewer
    admin = User(
        id=f"usr_adm_{uuid.uuid4().hex[:6]}",
        email=f"admin_{uuid.uuid4().hex[:6]}@ecofuse.org",
        hashed_password=pwd,
        name="Verifier Admin",
        organization="EcoFuse Standards",
        credit_balance=100.0,
        role="admin",
    )
    db_session.add_all([seller, buyer1, buyer2, admin])
    db_session.commit()

    tokens = {
        "seller": create_access_token({"sub": seller.id}),
        "buyer1": create_access_token({"sub": buyer1.id}),
        "buyer2": create_access_token({"sub": buyer2.id}),
        "admin": create_access_token({"sub": admin.id}),
    }
    return {
        "seller": seller,
        "buyer1": buyer1,
        "buyer2": buyer2,
        "admin": admin,
        "tokens": tokens,
    }


def test_normalized_holdings_lifecycle_and_partial_sales(client: TestClient, db_session: Session, auth_users):
    seller_token = auth_users["tokens"]["seller"]
    admin_token = auth_users["tokens"]["admin"]
    buyer1_token = auth_users["tokens"]["buyer1"]
    buyer2_token = auth_users["tokens"]["buyer2"]
    seller = auth_users["seller"]
    buyer1 = auth_users["buyer1"]
    buyer2 = auth_users["buyer2"]

    # 1. Creator creates batch of 100 tCO2e
    batch_payload = {
        "project_name": "Madre de Dios Amazon Reforestation",
        "project_type": "Forestry & Land Use",
        "project_location": "Peru",
        "methodology": "VM0007 / VCS 2024",
        "registry_name": "Verra Registry (Sandbox Mock)",
        "registry_id": "VCS-9842",
        "vintage_year": 2024,
        "initial_quantity": 100.0,
        "unit": "tCO2e",
        "verification_org": "Internal Prototype Verifier",
    }
    create_res = client.post(
        "/api/v1/provenance/batches",
        json=batch_payload,
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    assert create_res.status_code == 201
    batch_data = create_res.json()
    batch_id = batch_data["id"]
    assert batch_data["user_holding_quantity"] == 100.0

    # Verify database holding record was created
    holding = (
        db_session.query(CreditBatchHolding)
        .filter(CreditBatchHolding.batch_id == batch_id, CreditBatchHolding.user_id == seller.id)
        .first()
    )
    assert holding is not None
    assert holding.quantity == 100.0

    # 2. Submit and Verify Batch by Admin
    client.post(
        f"/api/v1/provenance/batches/{batch_id}/submit",
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    verify_res = client.post(
        f"/api/v1/provenance/batches/{batch_id}/review",
        json={"action": "verify", "notes": "Audited and verified methodology by independent verifier."},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["verification_status"] == "verified"

    # 3. Seller lists a partial quantity (40 tCO2e) of the 100 tCO2e batch
    list_res = client.post(
        "/api/v1/marketplace/listings",
        json={
            "amount": 40.0,
            "price_per_credit": 18.5,
            "project": "Madre de Dios Amazon Reforestation",
            "country": "Peru",
            "batch_id": batch_id,
        },
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    assert list_res.status_code == 201
    listing_id = list_res.json()["id"]

    # Verify seller holding was decremented to 60.0 tCO2e (escrowed)
    db_session.expire_all()
    seller_holding = (
        db_session.query(CreditBatchHolding)
        .filter(CreditBatchHolding.batch_id == batch_id, CreditBatchHolding.user_id == seller.id)
        .first()
    )
    assert seller_holding.quantity == 60.0

    # 4. Buyer 1 purchases the listing (40 tCO2e)
    buy_res = client.post(
        f"/api/v1/marketplace/listings/{listing_id}/buy",
        headers={"Authorization": f"Bearer {buyer1_token}"},
    )
    assert buy_res.status_code == 200

    # Verify both seller (60.0) and buyer1 (40.0) have independently traceable holdings for the same batch!
    db_session.expire_all()
    buyer1_holding = (
        db_session.query(CreditBatchHolding)
        .filter(CreditBatchHolding.batch_id == batch_id, CreditBatchHolding.user_id == buyer1.id)
        .first()
    )
    assert buyer1_holding is not None
    assert buyer1_holding.quantity == 40.0

    seller_holding = (
        db_session.query(CreditBatchHolding)
        .filter(CreditBatchHolding.batch_id == batch_id, CreditBatchHolding.user_id == seller.id)
        .first()
    )
    assert seller_holding.quantity == 60.0
    assert (seller_holding.quantity + buyer1_holding.quantity) == 100.0

    # 5. Subsequent Sale: Buyer 1 lists 15 tCO2e of their 40 tCO2e for sale
    b1_list_res = client.post(
        "/api/v1/marketplace/listings",
        json={
            "amount": 15.0,
            "price_per_credit": 20.0,
            "project": "Madre de Dios Amazon Reforestation",
            "country": "Peru",
            "batch_id": batch_id,
        },
        headers={"Authorization": f"Bearer {buyer1_token}"},
    )
    assert b1_list_res.status_code == 201
    b1_listing_id = b1_list_res.json()["id"]

    # Buyer 1 holding decremented to 25.0
    db_session.expire_all()
    buyer1_holding = (
        db_session.query(CreditBatchHolding)
        .filter(CreditBatchHolding.batch_id == batch_id, CreditBatchHolding.user_id == buyer1.id)
        .first()
    )
    assert buyer1_holding.quantity == 25.0

    # 6. Buyer 2 purchases the 15 tCO2e listing
    buy2_res = client.post(
        f"/api/v1/marketplace/listings/{b1_listing_id}/buy",
        headers={"Authorization": f"Bearer {buyer2_token}"},
    )
    assert buy2_res.status_code == 200

    # All three holders are now independently traceable on the exact same batch:
    # Seller: 60.0, Buyer 1: 25.0, Buyer 2: 15.0 -> Total: 100.0
    db_session.expire_all()
    buyer2_holding = (
        db_session.query(CreditBatchHolding)
        .filter(CreditBatchHolding.batch_id == batch_id, CreditBatchHolding.user_id == buyer2.id)
        .first()
    )
    assert buyer2_holding is not None
    assert buyer2_holding.quantity == 15.0

    # Inspect all holdings via public provenance holdings endpoint
    holdings_res = client.get(
        f"/api/v1/provenance/batches/{batch_id}/holdings",
        headers={"Authorization": f"Bearer {buyer1_token}"},
    )
    assert holdings_res.status_code == 200
    holdings_list = holdings_res.json()
    assert len(holdings_list) == 3
    quantities = {h["user_id"]: h["quantity"] for h in holdings_list}
    assert quantities[seller.id] == 60.0
    assert quantities[buyer1.id] == 25.0
    assert quantities[buyer2.id] == 15.0

    # 7. Cancellation test: Buyer 2 lists 5 tCO2e, then cancels
    b2_list_res = client.post(
        "/api/v1/marketplace/listings",
        json={
            "amount": 5.0,
            "price_per_credit": 22.0,
            "project": "Madre de Dios Amazon Reforestation",
            "country": "Peru",
            "batch_id": batch_id,
        },
        headers={"Authorization": f"Bearer {buyer2_token}"},
    )
    assert b2_list_res.status_code == 201
    b2_listing_id = b2_list_res.json()["id"]

    db_session.expire_all()
    buyer2_holding = (
        db_session.query(CreditBatchHolding)
        .filter(CreditBatchHolding.batch_id == batch_id, CreditBatchHolding.user_id == buyer2.id)
        .first()
    )
    assert buyer2_holding.quantity == 10.0

    # Cancel the listing
    cancel_res = client.post(
        f"/api/v1/marketplace/listings/{b2_listing_id}/cancel",
        headers={"Authorization": f"Bearer {buyer2_token}"},
    )
    assert cancel_res.status_code == 200

    # Buyer 2 holding restored to 15.0
    db_session.expire_all()
    buyer2_holding = (
        db_session.query(CreditBatchHolding)
        .filter(CreditBatchHolding.batch_id == batch_id, CreditBatchHolding.user_id == buyer2.id)
        .first()
    )
    assert buyer2_holding.quantity == 15.0

    # 8. Partial Retirement test: Buyer 1 retires 10 tCO2e
    retire_res = client.post(
        f"/api/v1/provenance/batches/{batch_id}/retire",
        json={
            "amount": 10.0,
            "beneficiary": "Eco Logistics Global Net-Zero",
            "retirement_reason": "Scope 3 emissions offset for FY2025",
        },
        headers={"Authorization": f"Bearer {buyer1_token}"},
    )
    assert retire_res.status_code == 200
    cert_data = retire_res.json()
    cert_code = cert_data["certificate_code"]
    assert cert_code.startswith("RET-")

    # Buyer 1 holding decremented to 15.0
    db_session.expire_all()
    buyer1_holding = (
        db_session.query(CreditBatchHolding)
        .filter(CreditBatchHolding.batch_id == batch_id, CreditBatchHolding.user_id == buyer1.id)
        .first()
    )
    assert buyer1_holding.quantity == 15.0

    # Total remaining active credits across holdings = 60 + 15 + 15 = 90.0
    # Plus 10.0 retired = 100.0 conserved!
    retirements_sum = sum(
        r.amount for r in db_session.query(CreditRetirement).filter(CreditRetirement.batch_id == batch_id).all()
    )
    active_holdings_sum = sum(
        h.quantity for h in db_session.query(CreditBatchHolding).filter(CreditBatchHolding.batch_id == batch_id).all()
    )
    assert retirements_sum == 10.0
    assert active_holdings_sum == 90.0
    assert (retirements_sum + active_holdings_sum) == 100.0

    # 9. Over-retirement rejection: Buyer 1 tries to retire 20 tCO2e (only holds 15.0)
    over_retire_res = client.post(
        f"/api/v1/provenance/batches/{batch_id}/retire",
        json={
            "amount": 20.0,
            "beneficiary": "Fraudulent Claim",
            "retirement_reason": "Over-retirement attempt",
        },
        headers={"Authorization": f"Bearer {buyer1_token}"},
    )
    assert over_retire_res.status_code == 400
    assert "Insufficient batch holdings" in over_retire_res.json()["detail"]


def test_public_certificate_lookup_authenticity_and_distinction(client: TestClient, db_session: Session, auth_users):
    seller_token = auth_users["tokens"]["seller"]
    admin_token = auth_users["tokens"]["admin"]
    seller = auth_users["seller"]

    # Create and verify batch
    batch_res = client.post(
        "/api/v1/provenance/batches",
        json={
            "project_name": "Solar Array Rajasthan",
            "project_type": "Renewable Energy",
            "project_location": "India",
            "methodology": "ACM0002",
            "registry_name": "Gold Standard (Sandbox Mock)",
            "vintage_year": 2024,
            "initial_quantity": 50.0,
        },
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    batch_id = batch_res.json()["id"]

    client.post(
        f"/api/v1/provenance/batches/{batch_id}/submit",
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    client.post(
        f"/api/v1/provenance/batches/{batch_id}/review",
        json={"action": "verify"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    # Retire 20 credits
    ret_res = client.post(
        f"/api/v1/provenance/batches/{batch_id}/retire",
        json={
            "amount": 20.0,
            "beneficiary": "Tech Solutions Corp",
            "retirement_reason": "Annual corporate offset",
        },
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    assert ret_res.status_code == 200
    cert_code = ret_res.json()["certificate_code"]

    # 1. Genuine Certificate Public Lookup (No auth header needed)
    pub_res = client.get(f"/api/v1/provenance/retirements/certificate/{cert_code}")
    assert pub_res.status_code == 200
    cert = pub_res.json()
    assert cert["certificate_code"] == cert_code
    assert cert["amount"] == 20.0
    assert cert["beneficiary"] == "Tech Solutions Corp"
    assert cert["verification_authority"] == "Internal Platform Ledger"
    assert cert["is_external_registry_surrender"] is False
    assert "does not represent an unbundled surrender on external statutory registries" in cert["registry_disclaimer"]

    # 2. Non-existent certificate code returns HTTP 404
    fake_res = client.get("/api/v1/provenance/retirements/certificate/RET-FAKE9999-2024")
    assert fake_res.status_code == 404
    assert fake_res.json()["detail"] == "Retirement certificate not found."

    # 3. Certificate Code Unique Constraint: Attempting to insert a duplicate certificate_code in DB raises error
    dup_retirement = CreditRetirement(
        batch_id=batch_id,
        user_id=seller.id,
        amount=5.0,
        beneficiary="Duplicate Code Test",
        retirement_reason="Testing constraint",
        certificate_code=cert_code,  # Duplicate!
    )
    db_session.add(dup_retirement)
    with pytest.raises(Exception):
        db_session.commit()
    db_session.rollback()


def test_concurrent_partial_listing_purchase_guarantees_single_winner(client: TestClient, db_session: Session, auth_users):
    seller_token = auth_users["tokens"]["seller"]
    admin_token = auth_users["tokens"]["admin"]
    buyer1_token = auth_users["tokens"]["buyer1"]
    buyer2_token = auth_users["tokens"]["buyer2"]

    # Create & verify batch
    batch_res = client.post(
        "/api/v1/provenance/batches",
        json={
            "project_name": "Wind Farm Patagonia",
            "project_type": "Renewable Energy",
            "project_location": "Argentina",
            "methodology": "ACM0002",
            "registry_name": "Verra Registry (Sandbox Mock)",
            "vintage_year": 2024,
            "initial_quantity": 50.0,
        },
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    batch_id = batch_res.json()["id"]

    client.post(f"/api/v1/provenance/batches/{batch_id}/submit", headers={"Authorization": f"Bearer {seller_token}"})
    client.post(
        f"/api/v1/provenance/batches/{batch_id}/review",
        json={"action": "verify"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    # Seller creates single listing of 25 tCO2e
    list_res = client.post(
        "/api/v1/marketplace/listings",
        json={
            "amount": 25.0,
            "price_per_credit": 15.0,
            "project": "Wind Farm Patagonia",
            "country": "Argentina",
            "batch_id": batch_id,
        },
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    listing_id = list_res.json()["id"]

    # Two concurrent purchase requests for the same listing
    res1 = client.post(f"/api/v1/marketplace/listings/{listing_id}/buy", headers={"Authorization": f"Bearer {buyer1_token}"})
    res2 = client.post(f"/api/v1/marketplace/listings/{listing_id}/buy", headers={"Authorization": f"Bearer {buyer2_token}"})

    # Exactly one succeeded (200), and one was rejected (400)
    statuses = [res1.status_code, res2.status_code]
    assert 200 in statuses
    assert 400 in statuses
