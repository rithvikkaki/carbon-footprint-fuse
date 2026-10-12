import pytest
from backend.app.models import User, CreditBatch
from backend.app.security import get_password_hash, create_access_token

def test_retirement_overspend_prevention(client, db_session):
    owner = User(
        id="usr_retire_owner_1",
        email="retire.owner@example.com",
        name="Retire Owner",
        hashed_password=get_password_hash("pass"),
        credit_balance=50.0,
    )
    batch = CreditBatch(
        id="batch-retire-overspend",
        batch_number="CCT-2024-OVER-01",
        creator_id=owner.id,
        owner_id=owner.id,
        project_name="Reforestation Overspend Test",
        project_type="Forestry",
        project_location="Brazil",
        methodology="VM0007",
        registry_name="Verra VCS",
        registry_id="VCS-OVER-01",
        vintage_year=2024,
        initial_quantity=50.0,
        available_quantity=50.0,
        verification_status="verified",
    )
    db_session.add_all([owner, batch])
    db_session.commit()

    token = create_access_token({"sub": owner.id, "email": owner.email})
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to retire 75 credits when only 50 are available
    res = client.post(
        f"/api/v1/provenance/batches/{batch.id}/retire",
        headers=headers,
        json={
            "amount": 75.0,
            "beneficiary": "Acme Overspend Corp",
            "retirement_reason": "Offsetting Scope 1",
        },
    )
    assert res.status_code == 400
    assert "Insufficient available credit quantity" in res.json()["detail"]

    # Now retire exactly 50 credits -> should succeed and set batch to retired
    res_ok = client.post(
        f"/api/v1/provenance/batches/{batch.id}/retire",
        headers=headers,
        json={
            "amount": 50.0,
            "beneficiary": "Acme Legitimate Corp",
            "retirement_reason": "Offsetting Scope 1 Legitimate",
        },
    )
    assert res_ok.status_code == 200
    cert = res_ok.json()
    assert cert["amount"] == 50.0
    assert cert["certificate_code"].startswith("RET-")

    db_session.refresh(batch)
    assert batch.available_quantity == 0.0
    assert batch.is_retired is True
    assert batch.verification_status == "retired"

    db_session.refresh(owner)
    assert owner.credit_balance == 0.0

    # Attempt to retire again from now-retired batch -> should fail
    res_again = client.post(
        f"/api/v1/provenance/batches/{batch.id}/retire",
        headers=headers,
        json={
            "amount": 5.0,
            "beneficiary": "Acme Fraud Corp",
            "retirement_reason": "Double retirement attempt",
        },
    )
    assert res_again.status_code == 400


def test_cannot_retire_unverified_draft_batch(client, db_session):
    owner = User(
        id="usr_draft_retire",
        email="draft.owner@example.com",
        name="Draft Owner",
        hashed_password=get_password_hash("pass"),
        credit_balance=100.0,
    )
    batch = CreditBatch(
        id="batch-draft-test-retire",
        batch_number="CCT-2024-DRAFT-01",
        creator_id=owner.id,
        owner_id=owner.id,
        project_name="Unverified Prototype Forest",
        project_type="Forestry",
        project_location="Peru",
        methodology="VM0007",
        registry_name="Verra VCS",
        registry_id="VCS-DRAFT-01",
        vintage_year=2024,
        initial_quantity=100.0,
        available_quantity=100.0,
        verification_status="draft",
    )
    db_session.add_all([owner, batch])
    db_session.commit()

    token = create_access_token({"sub": owner.id, "email": owner.email})
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post(
        f"/api/v1/provenance/batches/{batch.id}/retire",
        headers=headers,
        json={
            "amount": 10.0,
            "beneficiary": "Draft Beneficiary",
            "retirement_reason": "Premature retirement",
        },
    )
    assert res.status_code == 400
    assert "Only fully verified credits can be permanently retired" in res.json()["detail"]


def test_cannot_tamper_evidence_on_verified_batch(client, db_session):
    owner = User(
        id="usr_tamper_owner",
        email="tamper.owner@example.com",
        name="Tamper Owner",
        hashed_password=get_password_hash("pass"),
    )
    batch = CreditBatch(
        id="batch-tamper-lock",
        batch_number="CCT-2024-LOCK-01",
        creator_id=owner.id,
        owner_id=owner.id,
        project_name="Locked Evidence Project",
        project_type="Solar",
        project_location="Spain",
        methodology="ACM0002",
        registry_name="Gold Standard",
        vintage_year=2024,
        initial_quantity=100.0,
        available_quantity=100.0,
        verification_status="verified",
        evidence_hash="a" * 64,
        evidence_doc_name="Original_PDD.pdf",
    )
    db_session.add_all([owner, batch])
    db_session.commit()

    token = create_access_token({"sub": owner.id, "email": owner.email})
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to overwrite evidence on verified batch
    res = client.post(
        f"/api/v1/provenance/batches/{batch.id}/evidence",
        headers=headers,
        json={
            "evidence_doc_name": "Forged_PDD.pdf",
            "evidence_doc_url": "https://attacker.com/forged.pdf",
            "evidence_hash": "b" * 64,
        },
    )
    assert res.status_code == 400
    assert "Cannot alter evidence documents for a batch that is already 'verified'" in res.json()["detail"]
