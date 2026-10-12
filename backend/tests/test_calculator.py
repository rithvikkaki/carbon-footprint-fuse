from backend.app.calculation import calculate_footprint

def test_calculation_engine_math():
    inputs = {
        "electric_rickshaw": 50,  # 50 km * 52 weeks * 0.03 factor = 78 kg
        "solar": 150,             # 150 kWh * 12 months * 0.05 factor = 90 kg
    }
    result = calculate_footprint("US", inputs)
    assert result["total_annual_kg"] == 168.0
    assert result["total_metric_tons"] == 0.17
    assert result["rating"] == "A+"
    assert result["potential_credits"] >= 10.0

def test_calculator_api_endpoint(client, auth_headers):
    res = client.post(
        "/api/v1/calculator/calculate",
        headers=auth_headers,
        json={
            "country_code": "US",
            "sector_id": "transportation",
            "sub_sector_id": "electric_rickshaw",
            "inputs": {
                "electric_rickshaw": 100,
                "car_gasoline": 50,
            },
        },
    )
    assert res.status_code == 200
    data = res.json()
    # Credit issuance rule: Estimated calculations do NOT automatically award liquid credits
    assert data["awarded_credits"] == 0.0
    assert "activity_id" in data

    # Verify user credit balance was NOT inflated
    me = client.get("/api/v1/auth/me", headers=auth_headers).json()
    assert me["credit_balance"] == 100.0

def test_activity_verification_rules(client, auth_headers, db_session):
    from backend.app.models import User
    from backend.app.security import create_access_token

    # 1. Log a self-reported activity
    act_res = client.post(
        "/api/v1/calculator/activities",
        headers=auth_headers,
        json={
            "title": "Solar Installation",
            "category": "Energy",
            "reduction_kg": 500.0,
            "credits_earned": 5.0,
        },
    )
    assert act_res.status_code == 201
    act_data = act_res.json()
    assert act_data["status"] == "pending_verification"
    activity_id = act_data["id"]

    # 2. Attempt verification with regular user -> 403 Forbidden
    forbid_res = client.post(
        f"/api/v1/calculator/activities/{activity_id}/verify",
        headers=auth_headers,
    )
    assert forbid_res.status_code == 403

    # 3. Create admin user & token
    admin = User(
        id="usr_admin_101",
        email="auditor@ecofuse.org",
        name="Auditor User",
        hashed_password="pw",
        role="admin",
        credit_balance=0.0,
    )
    db_session.add(admin)
    db_session.commit()

    admin_token = create_access_token({"sub": admin.id, "email": admin.email})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 4. Admin verifies the activity -> 200 OK & status="verified"
    verify_res = client.post(
        f"/api/v1/calculator/activities/{activity_id}/verify",
        headers=admin_headers,
    )
    assert verify_res.status_code == 200
    assert verify_res.json()["status"] == "verified"

    # 5. Verify the user now has their earned credits credited
    me = client.get("/api/v1/auth/me", headers=auth_headers).json()
    assert me["credit_balance"] == 105.0
