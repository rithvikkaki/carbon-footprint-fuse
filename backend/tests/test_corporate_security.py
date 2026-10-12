import pytest
from backend.app.models import User, CorporateFacility, CorporateEmissionRecord
from backend.app.security import get_password_hash, create_access_token

def test_cross_tenant_facility_isolation(client, db_session):
    # Tenant A
    user_a = User(
        id="usr_org_a",
        email="corp.a@enterprise.com",
        name="Corp A Admin",
        hashed_password=get_password_hash("pass123"),
        organization="Enterprise Alpha",
        role="user",
    )
    # Tenant B
    user_b = User(
        id="usr_org_b",
        email="corp.b@enterprise.com",
        name="Corp B Admin",
        hashed_password=get_password_hash("pass123"),
        organization="Enterprise Beta",
        role="user",
    )
    db_session.add_all([user_a, user_b])
    db_session.commit()

    token_a = create_access_token({"sub": user_a.id, "email": user_a.email})
    token_b = create_access_token({"sub": user_b.id, "email": user_b.email})
    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Tenant A creates facility
    res_fac = client.post(
        "/api/v1/analytics/corporate/facilities",
        headers=headers_a,
        json={
            "organization_name": "Enterprise Alpha",
            "facility_name": "Alpha Data Center",
            "department": "IT Operations",
            "country": "Germany",
        },
    )
    assert res_fac.status_code == 201
    fac_a_id = res_fac.json()["id"]

    # Tenant B lists facilities -> must NOT see Tenant A's facility
    res_b_list = client.get("/api/v1/analytics/corporate/facilities", headers=headers_b)
    assert res_b_list.status_code == 200
    facilities_b = res_b_list.json()
    assert not any(f["id"] == fac_a_id for f in facilities_b)

    # Tenant B attempts to log corporate record against Tenant A's facility -> must 404
    res_tamper = client.post(
        "/api/v1/analytics/corporate/records",
        headers=headers_b,
        json={
            "facility_id": fac_a_id,
            "reporting_period": "2024-Q3",
            "scope": "Scope 1",
            "category": "Stationary Fuel",
            "activity_metric": 500,
            "metric_unit": "liters",
            "emissions_kg": 1340.0,
        },
    )
    assert res_tamper.status_code == 404
    assert "Corporate facility not found" in res_tamper.json()["detail"]


def test_cross_tenant_target_and_recommendation_isolation(client, db_session):
    user_x = User(
        id="usr_user_x",
        email="user.x@test.com",
        name="User X",
        hashed_password=get_password_hash("pass"),
    )
    user_y = User(
        id="usr_user_y",
        email="user.y@test.com",
        name="User Y",
        hashed_password=get_password_hash("pass"),
    )
    db_session.add_all([user_x, user_y])
    db_session.commit()

    headers_x = {"Authorization": f"Bearer {create_access_token({'sub': user_x.id, 'email': user_x.email})}"}
    headers_y = {"Authorization": f"Bearer {create_access_token({'sub': user_y.id, 'email': user_y.email})}"}

    # User X generates recommendations
    recs_x = client.get("/api/v1/analytics/recommendations", headers=headers_x).json()
    assert len(recs_x) > 0
    rec_x_id = recs_x[0]["id"]

    # User Y attempts to tamper with User X's recommendation status -> must 404
    res_patch = client.patch(
        f"/api/v1/analytics/recommendations/{rec_x_id}/status",
        headers=headers_y,
        json={"status": "completed"},
    )
    assert res_patch.status_code == 404
    assert "Recommendation not found" in res_patch.json()["detail"]
