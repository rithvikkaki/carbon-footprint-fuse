import pytest
from backend.app.models import User, CreditBatch, CreditRetirement
from backend.app.security import get_password_hash, create_access_token

def test_credit_batch_creation_and_evidence_attachment(client, auth_headers):
    # Create draft batch
    create_res = client.post(
        "/api/v1/provenance/batches",
        headers=auth_headers,
        json={
            "project_name": "Mangrove Restoration Delta",
            "project_type": "Blue Carbon",
            "project_location": "Kalimantan, Indonesia",
            "methodology": "VM0033",
            "registry_name": "Verra VCS",
            "registry_id": "VCS-BLUE-882",
            "vintage_year": 2024,
            "initial_quantity": 500.0,
            "unit": "tCO2e",
            "verification_org": "TUV SUD",
        },
    )
    assert create_res.status_code == 201
    batch_data = create_res.json()
    assert batch_data["verification_status"] == "draft"
    batch_id = batch_data["id"]

    # Attach evidence document
    evidence_res = client.post(
        f"/api/v1/provenance/batches/{batch_id}/evidence",
        headers=auth_headers,
        json={
            "evidence_doc_name": "Project_Design_Document_v1.pdf",
            "evidence_doc_url": "https://storage.ecofuse.internal/evidence/pdd-882.pdf",
            "evidence_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        },
    )
    assert evidence_res.status_code == 200
    updated_batch = evidence_res.json()
    assert updated_batch["evidence_doc_name"] == "Project_Design_Document_v1.pdf"
    assert updated_batch["evidence_hash"].startswith("e3b0c44")

    # Submit batch for verification
    submit_res = client.post(
        f"/api/v1/provenance/batches/{batch_id}/submit",
        headers=auth_headers,
    )
    assert submit_res.status_code == 200
    assert submit_res.json()["verification_status"] == "submitted"


def test_conflict_of_interest_blocks_creator_verification(client, db_session):
    # Create user who is also given admin role
    admin_creator = User(
        id="usr_admin_creator",
        email="auditor_creator@example.com",
        name="Auditor Who Created Batch",
        hashed_password=get_password_hash("pass"),
        role="admin",
    )
    db_session.add(admin_creator)
    db_session.commit()

    admin_token = create_access_token(data={"sub": admin_creator.id, "email": admin_creator.email, "role": "admin"})
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Admin creates a batch
    create_res = client.post(
        "/api/v1/provenance/batches",
        headers=headers,
        json={
            "project_name": "Self Audited Forest",
            "project_type": "Forestry",
            "project_location": "Nairobi, Kenya",
            "methodology": "VM0007",
            "registry_name": "Verra VCS",
            "registry_id": "VCS-SELF-01",
            "vintage_year": 2024,
            "initial_quantity": 200.0,
            "unit": "tCO2e",
        },
    )
    assert create_res.status_code == 201
    batch_id = create_res.json()["id"]

    client.post(f"/api/v1/provenance/batches/{batch_id}/submit", headers=headers)

    # Attempt to self-verify
    review_res = client.post(
        f"/api/v1/provenance/batches/{batch_id}/review",
        headers=headers,
        json={
            "action": "verify",
            "notes": "I approve my own credits",
        },
    )
    # Must fail with 403 Forbidden to prevent conflict of interest
    assert review_res.status_code == 403
    assert "Conflict of interest" in review_res.json()["detail"]


def test_independent_admin_verification_lifecycle(client, auth_headers, db_session):
    # User creates and submits batch
    batch_res = client.post(
        "/api/v1/provenance/batches",
        headers=auth_headers,
        json={
            "project_name": "Wind Energy Farm Phase 2",
            "project_type": "Renewable Energy",
            "project_location": "Gujarat, India",
            "methodology": "ACM0002",
            "registry_name": "Gold Standard",
            "registry_id": "GS-WIND-999",
            "vintage_year": 2023,
            "initial_quantity": 1000.0,
            "unit": "tCO2e",
        },
    )
    assert batch_res.status_code == 201
    batch_id = batch_res.json()["id"]
    client.post(f"/api/v1/provenance/batches/{batch_id}/submit", headers=auth_headers)

    # Create independent auditor / admin
    independent_auditor = User(
        id="usr_independent_auditor",
        email="independent_auditor@standards.org",
        name="Independent Auditor",
        hashed_password=get_password_hash("pass"),
        role="admin",
    )
    db_session.add(independent_auditor)
    db_session.commit()

    auditor_token = create_access_token(data={"sub": independent_auditor.id, "email": independent_auditor.email, "role": "admin"})
    auditor_headers = {"Authorization": f"Bearer {auditor_token}"}

    # Independent auditor verifies the batch
    verify_res = client.post(
        f"/api/v1/provenance/batches/{batch_id}/review",
        headers=auditor_headers,
        json={
            "action": "verify",
            "notes": "Audit PASSED: On-site meter logs and grid factors verified.",
        },
    )
    assert verify_res.status_code == 200
    verified_data = verify_res.json()
    assert verified_data["verification_status"] == "verified"
    assert verified_data["reviewer_id"] == "usr_independent_auditor"


def test_marketplace_listing_with_traceable_batch(client, auth_headers, db_session, test_user):
    # Create verified batch belonging to test_user
    batch = CreditBatch(
        id="batch-trade-test-01",
        batch_number="CCT-2024-PEAT-001",
        creator_id=test_user.id,
        owner_id=test_user.id,
        project_name="Verified Peatland Protection",
        project_type="Peatland",
        project_location="Kalimantan, Indonesia",
        methodology="VM0004",
        registry_name="Verra VCS",
        registry_id="VCS-PEAT-01",
        vintage_year=2024,
        initial_quantity=100.0,
        available_quantity=100.0,
        verification_status="verified",
        verification_org="DNV GL",
    )
    db_session.add(batch)
    db_session.commit()

    # List credits referencing the batch
    list_res = client.post(
        "/api/v1/marketplace/listings",
        headers=auth_headers,
        json={
            "amount": 25.0,
            "price_per_credit": 18.0,
            "project": "Verified Peatland Protection",
            "country": "Indonesia",
            "batch_id": "batch-trade-test-01",
        },
    )
    assert list_res.status_code == 201
    listing = list_res.json()
    assert listing["batch_id"] == "batch-trade-test-01"

    # Batch available credits should be decremented from 100 to 75
    db_session.refresh(batch)
    assert batch.available_quantity == 75.0

    # Cancel listing and verify restoration
    listing_id = listing["id"]
    cancel_res = client.post(f"/api/v1/marketplace/listings/{listing_id}/cancel", headers=auth_headers)
    assert cancel_res.status_code == 200
    db_session.refresh(batch)
    assert batch.available_quantity == 100.0


def test_credit_retirement_and_public_certificate(client, auth_headers, db_session, test_user):
    # Ensure test_user has 100 credits and a verified batch
    batch = CreditBatch(
        id="batch-retire-test-01",
        batch_number="CCT-2023-SOLAR-001",
        creator_id=test_user.id,
        owner_id=test_user.id,
        project_name="Solar Clean Energy Initiative",
        project_type="Solar",
        project_location="Rajasthan, India",
        methodology="AMS-I.D",
        registry_name="Gold Standard",
        registry_id="GS-SOLAR-01",
        vintage_year=2023,
        initial_quantity=100.0,
        available_quantity=100.0,
        verification_status="verified",
    )
    db_session.add(batch)
    db_session.commit()

    # Retire 20 credits
    retire_res = client.post(
        f"/api/v1/provenance/batches/{batch.id}/retire",
        headers=auth_headers,
        json={
            "amount": 20.0,
            "beneficiary": "Acme Clean Tech Corp",
            "retirement_reason": "Scope 2 electricity emissions offset Q3 2024",
        },
    )
    assert retire_res.status_code == 200
    cert = retire_res.json()
    assert cert["amount"] == 20.0
    assert cert["beneficiary"] == "Acme Clean Tech Corp"
    assert cert["certificate_code"].startswith("RET-")

    # Verify batch stats updated
    db_session.refresh(batch)
    assert batch.available_quantity == 80.0

    # Verify retirements listing endpoint
    retires_list = client.get("/api/v1/provenance/retirements", headers=auth_headers).json()
    assert any(r["certificate_code"] == cert["certificate_code"] for r in retires_list)
