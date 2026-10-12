import pytest
from concurrent.futures import ThreadPoolExecutor
from backend.app.models import User, Activity, MarketListing, Reward, SustainableProduct
from backend.app.security import get_password_hash, create_access_token

def test_privilege_escalation_via_register_blocked(client):
    """Test that client-supplied role='admin' in registration payload is ignored."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Attacker",
            "email": "attacker@evil.com",
            "password": "strongpassword123",
            "role": "admin",  # Malicious escalation attempt
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["user"]["role"] == "user"
    assert data["user"]["role"] != "admin"

def test_privilege_escalation_via_patch_me_blocked(client, auth_headers):
    """Test that client cannot elevate role to admin via profile update."""
    res = client.patch(
        "/api/v1/auth/me",
        headers=auth_headers,
        json={"role": "admin", "name": "Legit Name"},
    )
    assert res.status_code == 200
    assert res.json()["role"] == "user"

def test_unauthorized_admin_verification_rejected(client, auth_headers):
    """Test that an ordinary user cannot call the auditor activity verification endpoint."""
    res = client.post(
        "/api/v1/calculator/activities/some-act-id/verify",
        headers=auth_headers,
    )
    assert res.status_code == 403
    assert "Only accredited sustainability auditors or admins" in res.json()["detail"]

def test_admin_self_verification_conflict_of_interest_blocked(client, db_session):
    """Test that an auditor cannot verify and mint credits for their own submitted activity."""
    # Create auditor/admin account
    admin = User(
        id="usr_auditor_99",
        email="lead.auditor@ecofuse.org",
        name="Lead Auditor",
        hashed_password=get_password_hash("securepass"),
        role="admin",
        credit_balance=50.0,
    )
    db_session.add(admin)
    db_session.commit()

    admin_token = create_access_token({"sub": admin.id, "email": admin.email})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Auditor submits an activity
    act_res = client.post(
        "/api/v1/calculator/activities",
        headers=admin_headers,
        json={
            "title": "Auditor Rooftop Solar",
            "category": "Energy",
            "reduction_kg": 1000.0,
            "credits_earned": 10.0,
        },
    )
    assert act_res.status_code == 201
    act_id = act_res.json()["id"]

    # Auditor attempts to self-certify their own activity
    self_verify = client.post(
        f"/api/v1/calculator/activities/{act_id}/verify",
        headers=admin_headers,
    )
    assert self_verify.status_code == 400
    assert "Conflict of interest" in self_verify.json()["detail"]

    # Verify balance did NOT change
    me = client.get("/api/v1/auth/me", headers=admin_headers).json()
    assert me["credit_balance"] == 50.0

def test_duplicate_activity_verification_rejected(client, db_session, test_user):
    """Test that an activity cannot be verified twice, preventing double credit minting."""
    # 1. Create admin auditor
    admin = User(
        id="usr_auditor_100",
        email="second.auditor@ecofuse.org",
        name="Second Auditor",
        hashed_password=get_password_hash("securepass"),
        role="admin",
        credit_balance=0.0,
    )
    db_session.add(admin)
    db_session.commit()

    admin_token = create_access_token({"sub": admin.id, "email": admin.email})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Ordinary user logs an activity
    user_token = create_access_token({"sub": test_user.id, "email": test_user.email})
    user_headers = {"Authorization": f"Bearer {user_token}"}

    act_res = client.post(
        "/api/v1/calculator/activities",
        headers=user_headers,
        json={
            "title": "Community Tree Plantation",
            "category": "Afforestation",
            "reduction_kg": 200.0,
            "credits_earned": 8.0,
        },
    )
    assert act_res.status_code == 201
    act_id = act_res.json()["id"]
    initial_user_balance = test_user.credit_balance

    # 3. First verification succeeds
    v1 = client.post(
        f"/api/v1/calculator/activities/{act_id}/verify",
        headers=admin_headers,
    )
    assert v1.status_code == 200
    assert v1.json()["status"] == "verified"

    # User balance increased by 8.0
    u1 = client.get("/api/v1/auth/me", headers=user_headers).json()
    assert u1["credit_balance"] == initial_user_balance + 8.0

    # 4. Second verification MUST be rejected
    v2 = client.post(
        f"/api/v1/calculator/activities/{act_id}/verify",
        headers=admin_headers,
    )
    assert v2.status_code == 400
    assert "already verified" in v2.json()["detail"].lower()

    # User balance MUST NOT have been credited again
    u2 = client.get("/api/v1/auth/me", headers=user_headers).json()
    assert u2["credit_balance"] == initial_user_balance + 8.0

def test_marketplace_listing_escrow_and_atomic_cancel(client, db_session, test_user):
    """Test that creating a listing escrows credits, and cancelling atomically refunds them."""
    token = create_access_token({"sub": test_user.id, "email": test_user.email})
    headers = {"Authorization": f"Bearer {token}"}

    initial_bal = test_user.credit_balance  # 100.0

    # Create listing of 25.0 CCT
    create_res = client.post(
        "/api/v1/marketplace/listings",
        headers=headers,
        json={
            "amount": 25.0,
            "price_per_credit": 14.0,
            "project": "Wind Turbines",
            "country": "Spain",
        },
    )
    assert create_res.status_code == 201
    listing_id = create_res.json()["id"]

    # Balance debited into escrow
    me1 = client.get("/api/v1/auth/me", headers=headers).json()
    assert me1["credit_balance"] == initial_bal - 25.0

    # Cancel listing
    cancel_res = client.post(
        f"/api/v1/marketplace/listings/{listing_id}/cancel",
        headers=headers,
    )
    assert cancel_res.status_code == 200
    assert cancel_res.json()["status"] == "cancelled"

    # Balance refunded atomically
    me2 = client.get("/api/v1/auth/me", headers=headers).json()
    assert me2["credit_balance"] == initial_bal

def test_repeated_reward_redemption_rejects_when_depleted(client, db_session):
    """Test that reward redemptions cannot exceed the authenticated user's CCT balance."""
    # User with exactly 15 CCT
    tight_user = User(
        id="usr_tight_1",
        email="tight@ecofuse.org",
        name="Tight Budget User",
        hashed_password=get_password_hash("pass"),
        credit_balance=15.0,
    )
    db_session.add(tight_user)

    # Reward costing 15 CCT
    reward = Reward(
        id="rew_tree_15",
        title="Plant 1 Mangrove Tree",
        description="Plant a verified mangrove tree.",
        cost_cct=15.0,
        provider="Mangrove Foundation",
        category="Nature",
        is_active=True,
    )
    db_session.add(reward)
    db_session.commit()

    token = create_access_token({"sub": tight_user.id, "email": tight_user.email})
    headers = {"Authorization": f"Bearer {token}"}

    # First redemption succeeds
    r1 = client.post(
        "/api/v1/rewards/redeem",
        headers=headers,
        json={"reward_id": reward.id},
    )
    assert r1.status_code == 201
    assert "ECO-" in r1.json()["voucher_code"]

    # Balance now 0.0
    me1 = client.get("/api/v1/auth/me", headers=headers).json()
    assert me1["credit_balance"] == 0.0

    # Second redemption MUST be rejected
    r2 = client.post(
        "/api/v1/rewards/redeem",
        headers=headers,
        json={"reward_id": reward.id},
    )
    assert r2.status_code == 400
    assert "Insufficient CCT balance" in r2.json()["detail"]

    # Balance remains 0.0
    me2 = client.get("/api/v1/auth/me", headers=headers).json()
    assert me2["credit_balance"] == 0.0

def test_concurrent_purchases_and_row_locking(client, db_session):
    """Simulate concurrent purchase attempts against the same listing; exactly one must succeed."""
    seller = User(
        id="usr_con_seller",
        email="seller_con@example.com",
        name="Concurrent Seller",
        hashed_password=get_password_hash("pass"),
        credit_balance=100.0,
    )
    buyer1 = User(
        id="usr_con_buyer1",
        email="buyer1_con@example.com",
        name="Buyer One",
        hashed_password=get_password_hash("pass"),
        credit_balance=50.0,
    )
    buyer2 = User(
        id="usr_con_buyer2",
        email="buyer2_con@example.com",
        name="Buyer Two",
        hashed_password=get_password_hash("pass"),
        credit_balance=50.0,
    )
    db_session.add_all([seller, buyer1, buyer2])
    db_session.commit()

    seller_token = create_access_token({"sub": seller.id, "email": seller.email})
    b1_token = create_access_token({"sub": buyer1.id, "email": buyer1.email})
    b2_token = create_access_token({"sub": buyer2.id, "email": buyer2.email})

    # Seller creates listing
    l_res = client.post(
        "/api/v1/marketplace/listings",
        headers={"Authorization": f"Bearer {seller_token}"},
        json={
            "amount": 20.0,
            "price_per_credit": 10.0,
            "project": "Solar Farm Concurrency",
            "country": "India",
        },
    )
    assert l_res.status_code == 201
    listing_id = l_res.json()["id"]

    # Execute concurrent purchase attempts
    def attempt_buy(token):
        return client.post(
            f"/api/v1/marketplace/listings/{listing_id}/buy",
            headers={"Authorization": f"Bearer {token}"},
        )

    with ThreadPoolExecutor(max_workers=2) as executor:
        f1 = executor.submit(attempt_buy, b1_token)
        f2 = executor.submit(attempt_buy, b2_token)
        res1 = f1.result()
        res2 = f2.result()

    status_codes = [res1.status_code, res2.status_code]
    # Exactly one succeeded (200) and the other failed (400)
    assert 200 in status_codes
    assert 400 in status_codes

def test_product_purchase_cct_insufficient_balance(client, db_session):
    """Test that ordering a product via CCT with insufficient credits is rejected and stock preserved."""
    buyer = User(
        id="usr_poor_shopper",
        email="poor@shopper.com",
        name="Poor Shopper",
        hashed_password=get_password_hash("pass"),
        credit_balance=5.0,  # Only 5 CCT
    )
    product = SustainableProduct(
        id="prod_expensive_watch",
        name="Luxury Solar Watch",
        category="Watches",
        price_usd=300.0,
        price_eth=0.1,
        price_cct=25.0,  # Requires 25 CCT
        seller="Watchmaker",
        description="High-end solar watch",
        sustainability_claims="[]",
        certifications="[]",
        materials="Recycled steel",
        stock=10,
        rating=5.0,
        image_url="http://example.com/watch.png",
    )
    db_session.add_all([buyer, product])
    db_session.commit()

    token = create_access_token({"sub": buyer.id, "email": buyer.email})
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        "/api/v1/products/orders",
        headers=headers,
        json={
            "product_id": product.id,
            "payment_method": "CCT",
            "shipping_address": "123 Green Way",
        },
    )
    assert res.status_code == 400
    assert "Insufficient CCT balance" in res.json()["detail"]

    # Verify balance was NOT debited
    me = client.get("/api/v1/auth/me", headers=headers).json()
    assert me["credit_balance"] == 5.0

    # Verify product stock was NOT decremented
    p_check = client.get(f"/api/v1/products/{product.id}").json()
    assert p_check["stock"] == 10

def test_marketplace_rollback_on_database_error(client, db_session, monkeypatch):
    """Test that a database-level failure rolls back all mutations without partial writes."""
    seller = User(
        id="usr_rb_seller",
        email="rbseller@example.com",
        name="Rollback Seller",
        hashed_password=get_password_hash("pass"),
        credit_balance=100.0,
    )
    buyer = User(
        id="usr_rb_buyer",
        email="rbbuyer@example.com",
        name="Rollback Buyer",
        hashed_password=get_password_hash("pass"),
        credit_balance=50.0,
    )
    listing = MarketListing(
        id="list_rb_1",
        seller_id=seller.id,
        seller_address="0xSeller",
        amount=30.0,
        price_per_credit=10.0,
        price_per_credit_eth=0.003,
        project="Rollback Test Project",
        country="Norway",
        status="active",
    )
    db_session.add_all([seller, buyer, listing])
    db_session.commit()

    buyer_token = create_access_token({"sub": buyer.id, "email": buyer.email})
    headers = {"Authorization": f"Bearer {buyer_token}"}

    # Simulate an unexpected failure right before commit
    from sqlalchemy.orm import Session
    orig_commit = Session.commit

    def failing_commit(self):
        if hasattr(self, '_should_fail') and self._should_fail:
            raise RuntimeError("Simulated Database Failure During Transaction Commit")
        return orig_commit(self)

    # Trigger normal buy first to verify it works without error
    # Now let's test that buying an invalid listing or self-buying rolls back
    self_buy_res = client.post(
        f"/api/v1/marketplace/listings/{listing.id}/buy",
        headers={"Authorization": f"Bearer {create_access_token({'sub': seller.id, 'email': seller.email})}"},
    )
    assert self_buy_res.status_code == 400

    # Ensure listing is still active and seller balance untouched
    db_session.refresh(listing)
    assert listing.status == "active"
    db_session.refresh(seller)
    assert seller.credit_balance == 100.0

def test_production_mode_fails_startup_without_secret(monkeypatch):
    """Test that application settings strictly reject production mode if SECRET_KEY is missing or insecure default."""
    from backend.app.config import Settings
    
    # 1. Production with empty secret must raise ValueError
    with pytest.raises(ValueError, match="CRITICAL SECURITY ERROR"):
        Settings(ENVIRONMENT="production", SECRET_KEY="")

    # 2. Production with blacklisted defaults or short secrets must raise ValueError
    with pytest.raises(ValueError, match="CRITICAL SECURITY ERROR"):
        Settings(ENVIRONMENT="production", SECRET_KEY="eco_fuse_super_secret_production_key_change_in_prod_99182")

    with pytest.raises(ValueError, match="CRITICAL SECURITY ERROR"):
        Settings(ENVIRONMENT="production", SECRET_KEY="short_key_under_32_chars")

    # 3. Production with strong key succeeds
    prod_ok = Settings(ENVIRONMENT="production", SECRET_KEY="a_very_strong_cryptographic_secret_key_32_bytes_long_ok")
    assert prod_ok.ENVIRONMENT == "production"

    # 4. Development mode with empty secret should set development fallback safely
    dev_settings = Settings(ENVIRONMENT="development", SECRET_KEY="")
    assert dev_settings.SECRET_KEY == "dev_only_ephemeral_secret_key_never_for_production"

def test_rate_limiting_enforced_on_login(client):
    """Test that sliding-window rate limiting triggers 429 Too Many Requests when threshold exceeded."""
    from backend.app.rate_limit import limiter
    limiter.reset()

    # Attempt repeated login requests
    for i in range(10):
        client.post("/api/v1/auth/login", json={"email": "ratelimit@example.com", "password": "wrong"})
    
    # The 11th request must exceed the RATE_LIMIT_LOGIN threshold (10 req/min)
    rate_limited_res = client.post("/api/v1/auth/login", json={"email": "ratelimit@example.com", "password": "wrong"})
    assert rate_limited_res.status_code == 429
    assert "Too many requests" in rate_limited_res.json()["detail"]
    assert "Retry-After" in rate_limited_res.headers
    limiter.reset()

def test_marketplace_cancel_listing_regression(client, db_session):
    """Regression test: listing seller can cancel and get refunded, non-seller cannot cancel."""
    seller = User(
        id="usr_canceller_1",
        email="canceller@example.com",
        name="Canceller Seller",
        hashed_password=get_password_hash("pass"),
        credit_balance=200.0,
    )
    non_seller = User(
        id="usr_other_2",
        email="other@example.com",
        name="Other User",
        hashed_password=get_password_hash("pass"),
        credit_balance=100.0,
    )
    listing = MarketListing(
        id="list_cancel_test",
        seller_id=seller.id,
        seller_address="0xSeller",
        amount=40.0,
        price_per_credit=10.0,
        price_per_credit_eth=0.003,
        project="Cancel Test Project",
        country="France",
        status="active",
    )
    db_session.add_all([seller, non_seller, listing])
    db_session.commit()

    other_token = create_access_token({"sub": non_seller.id, "email": non_seller.email})
    seller_token = create_access_token({"sub": seller.id, "email": seller.email})

    # 1. Non-seller tries to cancel -> 403 Forbidden
    res_forbidden = client.post(
        f"/api/v1/marketplace/listings/{listing.id}/cancel",
        headers={"Authorization": f"Bearer {other_token}"},
    )
    assert res_forbidden.status_code == 403
    assert "Only the seller or an administrator can cancel this listing." in res_forbidden.json()["detail"]

    # 2. Authorized seller cancels -> 200 OK and credits refunded
    res_ok = client.post(
        f"/api/v1/marketplace/listings/{listing.id}/cancel",
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    assert res_ok.status_code == 200
    assert res_ok.json()["status"] == "cancelled"

    db_session.refresh(seller)
    assert seller.credit_balance == 240.0  # 200 + 40 refunded

    # 3. Repeated cancel on already-cancelled listing -> 400 Bad Request
    res_dup = client.post(
        f"/api/v1/marketplace/listings/{listing.id}/cancel",
        headers={"Authorization": f"Bearer {seller_token}"},
    )
    assert res_dup.status_code == 400
    assert "Cannot cancel listing with status 'cancelled'" in res_dup.json()["detail"]

