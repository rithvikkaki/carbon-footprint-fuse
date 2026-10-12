def test_list_rewards(client):
    res = client.get("/api/v1/rewards")
    assert res.status_code == 200
    rewards = res.json()
    assert len(rewards) >= 8

def test_redeem_reward_success(client, auth_headers, test_user, db_session):
    # rew-1 (Patagonia Gear Repair) costs 15 CCT, test_user has 100 CCT
    db_session.refresh(test_user)
    initial_db_balance = float(test_user.credit_balance)
    assert initial_db_balance == 100.0

    res = client.post(
        "/api/v1/rewards/redeem",
        headers=auth_headers,
        json={"reward_id": "rew-1"},
    )
    assert res.status_code == 201
    redemption = res.json()
    assert redemption["voucher_code"].startswith("ECO-")
    assert redemption["cost_cct"] == 15.0

    # User balance in database must be strictly decremented by cost_cct: 100 - 15 = 85 CCT
    db_session.expire_all()
    db_session.refresh(test_user)
    final_db_balance = float(test_user.credit_balance)
    assert final_db_balance == initial_db_balance - 15.0
    assert final_db_balance == 85.0

    # Endpoint balance must match exact database balance
    me = client.get("/api/v1/auth/me", headers=auth_headers).json()
    assert me["credit_balance"] == 85.0
    assert me["credit_balance"] == final_db_balance

def test_redeem_reward_insufficient_credits(client, auth_headers, test_user, db_session):
    # Set user balance to 2 CCT
    test_user.credit_balance = 2.0
    db_session.commit()

    res = client.post(
        "/api/v1/rewards/redeem",
        headers=auth_headers,
        json={"reward_id": "rew-1"},
    )
    assert res.status_code == 400
    assert "Insufficient CCT balance" in res.json()["detail"]

    # Database balance must remain untouched
    db_session.expire_all()
    db_session.refresh(test_user)
    assert float(test_user.credit_balance) == 2.0

def test_database_balance_deduction_exact_regression(client, auth_headers, test_user, db_session):
    """Regression test ensuring multiple successive redemptions deduct exact costs in PostgreSQL database."""
    test_user.credit_balance = 50.0
    db_session.commit()

    # Redeem rew-1 (15 CCT) -> 35 CCT
    res1 = client.post("/api/v1/rewards/redeem", headers=auth_headers, json={"reward_id": "rew-1"})
    assert res1.status_code == 201
    db_session.expire_all()
    db_session.refresh(test_user)
    assert float(test_user.credit_balance) == 35.0

    # Redeem rew-3 (10 CCT) -> 25 CCT
    res2 = client.post("/api/v1/rewards/redeem", headers=auth_headers, json={"reward_id": "rew-3"})
    assert res2.status_code == 201
    db_session.expire_all()
    db_session.refresh(test_user)
    assert float(test_user.credit_balance) == 25.0
