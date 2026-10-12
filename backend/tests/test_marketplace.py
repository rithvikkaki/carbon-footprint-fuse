from backend.app.models import User
from backend.app.security import get_password_hash, create_access_token

def test_create_listing_insufficient_balance(client, auth_headers):
    # test_user has 100 CCT balance, try to list 250 CCT
    res = client.post(
        "/api/v1/marketplace/listings",
        headers=auth_headers,
        json={
            "amount": 250.0,
            "price_per_credit": 15.0,
            "project": "Reforestation Project",
            "country": "Brazil",
        },
    )
    assert res.status_code == 400
    assert "Insufficient CCT balance" in res.json()["detail"]

def test_create_listing_success_and_escrow(client, auth_headers):
    # test_user has 100 CCT, list 30 CCT
    res = client.post(
        "/api/v1/marketplace/listings",
        headers=auth_headers,
        json={
            "amount": 30.0,
            "price_per_credit": 12.0,
            "project": "Local Solar Farm",
            "country": "India",
        },
    )
    assert res.status_code == 201
    listing = res.json()
    assert listing["amount"] == 30.0
    assert listing["status"] == "active"

    # Verify user balance was decremented by 30 into escrow
    me = client.get("/api/v1/auth/me", headers=auth_headers).json()
    assert me["credit_balance"] == 70.0

def test_purchase_listing_and_prevent_duplicate_buy(client, db_session, test_user):
    # Create seller
    seller = User(
        id="usr_seller_1",
        email="seller@example.com",
        name="Seller Corp",
        hashed_password=get_password_hash("pass"),
        credit_balance=200.0,
    )
    db_session.add(seller)
    db_session.commit()

    seller_token = create_access_token(data={"sub": seller.id, "email": seller.email})
    seller_headers = {"Authorization": f"Bearer {seller_token}"}

    # Seller creates listing of 40 CCT
    list_res = client.post(
        "/api/v1/marketplace/listings",
        headers=seller_headers,
        json={
            "amount": 40.0,
            "price_per_credit": 10.0,
            "project": "Clean Energy Wind Block",
            "country": "Denmark",
        },
    )
    listing_id = list_res.json()["id"]

    buyer_token = create_access_token(data={"sub": test_user.id, "email": test_user.email})
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    # Initial buyer balance: 100 CCT
    # Buyer buys listing
    buy_res = client.post(
        f"/api/v1/marketplace/listings/{listing_id}/buy",
        headers=buyer_headers,
    )
    assert buy_res.status_code == 200
    tx_data = buy_res.json()
    assert tx_data["amount_cct"] == 40.0
    assert tx_data["status"] == "Confirmed"

    # Buyer balance should now be 100 + 40 = 140 CCT
    buyer_me = client.get("/api/v1/auth/me", headers=buyer_headers).json()
    assert buyer_me["credit_balance"] == 140.0

    # DUPLICATE PURCHASE TEST: Attempting to buy the same listing again must fail!
    dup_res = client.post(
        f"/api/v1/marketplace/listings/{listing_id}/buy",
        headers=buyer_headers,
    )
    assert dup_res.status_code == 400
    assert "no longer active" in dup_res.json()["detail"].lower()

def test_cannot_buy_own_listing(client, auth_headers):
    # User creates listing
    list_res = client.post(
        "/api/v1/marketplace/listings",
        headers=auth_headers,
        json={
            "amount": 10.0,
            "price_per_credit": 15.0,
            "project": "Self Test Forest",
            "country": "Costa Rica",
        },
    )
    assert list_res.status_code == 201
    listing_id = list_res.json()["id"]

    # Attempt to purchase own listing
    self_buy_res = client.post(
        f"/api/v1/marketplace/listings/{listing_id}/buy",
        headers=auth_headers,
    )
    assert self_buy_res.status_code == 400
    assert "cannot purchase your own listing" in self_buy_res.json()["detail"].lower()

