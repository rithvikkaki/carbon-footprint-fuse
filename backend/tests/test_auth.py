def test_user_registration(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Jane Green",
            "email": "jane@example.com",
            "password": "securepassword123",
            "organization": "Climate Org",
            "country": "Germany",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "jane@example.com"
    assert data["user"]["credit_balance"] == 420.0

def test_duplicate_email_registration_fails(client, test_user):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Duplicate User",
            "email": test_user.email,
            "password": "password123",
        },
    )
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]

def test_user_login_success(client, test_user):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "testpass123"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data

def test_user_login_invalid_password(client, test_user):
    res = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "wrongpassword"},
    )
    assert res.status_code == 401

def test_get_current_user_profile(client, auth_headers, test_user):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == test_user.email
    assert data["credit_balance"] == 100.0
