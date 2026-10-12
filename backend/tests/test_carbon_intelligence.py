import pytest
from backend.app.models import User, Activity, UserReductionTarget, ReductionRecommendation, CorporateFacility, CorporateEmissionRecord
from backend.app.security import create_access_token, get_password_hash
from backend.app.analytics import calculate_user_emissions_overview, ensure_user_recommendations, BENCHMARKS_CATALOG

def test_emissions_analytics_overview_endpoint(client, db_session, test_user, auth_headers):
    # Log activities for test_user
    act1 = Activity(
        user_id=test_user.id,
        title="Solar Generation Clean Energy",
        category="Energy",
        reduction_kg=450.0,
        credits_earned=15.0,
        status="verified",
    )
    act2 = Activity(
        user_id=test_user.id,
        title="Electric Rickshaw Commuting",
        category="Transportation",
        reduction_kg=120.0,
        credits_earned=4.0,
        status="verified",
    )
    db_session.add_all([act1, act2])
    db_session.commit()

    res = client.get("/api/v1/analytics/overview?period_days=90", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()

    assert data["total_emissions_kg"] == 570.0
    assert data["total_emissions_tons"] == 0.57
    assert "category_breakdown" in data
    assert data["category_breakdown"]["Energy"] == 450.0
    assert data["category_breakdown"]["Transportation"] == 120.0
    assert len(data["top_contributors"]) >= 2
    assert "explanation" in data
    assert len(data["monthly_trend"]) == 6

def test_analytics_category_filter(client, db_session, test_user, auth_headers):
    act = Activity(
        user_id=test_user.id,
        title="Industrial Equipment Efficiency",
        category="Industry",
        reduction_kg=800.0,
        credits_earned=25.0,
        status="verified",
    )
    db_session.add(act)
    db_session.commit()

    res = client.get("/api/v1/analytics/overview?period_days=90&category=Industry", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "Industry" in data["category_breakdown"]

def test_reference_benchmarks_endpoint(client, auth_headers):
    res = client.get("/api/v1/analytics/benchmarks", headers=auth_headers)
    assert res.status_code == 200
    benchmarks = res.json()
    assert len(benchmarks) >= 4

    # Ensure metadata attributes are present and transparent
    us_benchmark = next(b for b in benchmarks if b["region"] == "United States")
    assert us_benchmark["annual_tons"] == 14.8
    assert "EPA" in us_benchmark["source"]
    assert us_benchmark["is_corporate"] is False

    corporate_benchmark = next(b for b in benchmarks if b["is_corporate"] is True)
    assert corporate_benchmark["annual_tons"] > 50.0

def test_reduction_recommendations_workflow(client, db_session, test_user, auth_headers):
    # Fetch suggestions
    res = client.get("/api/v1/analytics/recommendations", headers=auth_headers)
    assert res.status_code == 200
    recs = res.json()
    assert len(recs) >= 3

    target_rec = recs[0]
    rec_id = target_rec["id"]
    assert target_rec["status"] == "suggested"
    assert target_rec["estimated_annual_saving_kg"] > 0
    assert len(target_rec["assumptions"]) > 10

    # User transitions recommendation to "planned"
    patch_res = client.patch(
        f"/api/v1/analytics/recommendations/{rec_id}/status",
        headers=auth_headers,
        json={"status": "planned"},
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "planned"

    # User transitions to "completed"
    patch_res2 = client.patch(
        f"/api/v1/analytics/recommendations/{rec_id}/status",
        headers=auth_headers,
        json={"status": "completed"},
    )
    assert patch_res2.status_code == 200
    assert patch_res2.json()["status"] == "completed"

    # Invalid status transition rejected
    invalid_patch = client.patch(
        f"/api/v1/analytics/recommendations/{rec_id}/status",
        headers=auth_headers,
        json={"status": "invalid_unknown_status"},
    )
    assert invalid_patch.status_code == 400

def test_user_reduction_targets(client, test_user, auth_headers):
    # Create target
    payload = {
        "target_name": "2026 Fleet Decarbonization",
        "target_type": "reduction_percentage",
        "target_value": 30.0,
        "baseline_annual_kg": 10000.0,
        "target_year": 2026,
    }
    create_res = client.post("/api/v1/analytics/targets", headers=auth_headers, json=payload)
    assert create_res.status_code == 201
    target_data = create_res.json()
    assert target_data["target_annual_kg"] == 7000.0  # 30% reduction from 10,000

    # List targets
    list_res = client.get("/api/v1/analytics/targets", headers=auth_headers)
    assert list_res.status_code == 200
    targets = list_res.json()
    assert len(targets) >= 1
    assert targets[0]["target_name"] == "2026 Fleet Decarbonization"

def test_corporate_facilities_and_scope_reporting(client, test_user, auth_headers):
    # Register facility
    fac_res = client.post(
        "/api/v1/analytics/corporate/facilities",
        headers=auth_headers,
        json={
            "organization_name": "Apex Green Logistics Corp",
            "facility_name": "Distribution Center West",
            "department": "Fleet Logistics",
            "country": "United States",
        },
    )
    assert fac_res.status_code == 201
    facility = fac_res.json()
    fac_id = facility["id"]

    # Log Scope 1 emission record
    s1_res = client.post(
        "/api/v1/analytics/corporate/records",
        headers=auth_headers,
        json={
            "facility_id": fac_id,
            "reporting_period": "2025-Q1",
            "scope": "Scope 1",
            "category": "Diesel Delivery Fleet Combustion",
            "emissions_kg": 12400.0,
            "activity_metric": 4650.0,
            "metric_unit": "liters",
            "emission_factor_source": "EPA 2024 GHG Hub (2.68 kg CO2/liter)",
        },
    )
    assert s1_res.status_code == 201
    assert s1_res.json()["scope"] == "Scope 1"

    # Log Scope 2 record
    s2_res = client.post(
        "/api/v1/analytics/corporate/records",
        headers=auth_headers,
        json={
            "facility_id": fac_id,
            "reporting_period": "2025-Q1",
            "scope": "Scope 2",
            "category": "Warehouse Refrigeration Grid Power",
            "emissions_kg": 8500.0,
            "activity_metric": 21000.0,
            "metric_unit": "kWh",
            "emission_factor_source": "eGRID 2024 CAMX",
        },
    )
    assert s2_res.status_code == 201

    # Query records by scope
    q_res = client.get(f"/api/v1/analytics/corporate/records?facility_id={fac_id}&scope=Scope%201", headers=auth_headers)
    assert q_res.status_code == 200
    records = q_res.json()
    assert len(records) == 1
    assert records[0]["category"] == "Diesel Delivery Fleet Combustion"
