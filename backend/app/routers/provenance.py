import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models import (
    User,
    CreditBatch,
    CreditBatchHolding,
    CreditVerificationLog,
    CreditRetirement,
)
from backend.app.schemas import (
    CreditBatchCreate,
    CreditBatchOut,
    CreditBatchHoldingOut,
    EvidenceAttach,
    BatchReview,
    CreditRetireRequest,
    CreditRetirementOut,
    CreditRetirementCertificateOut,
    CreditVerificationLogOut,
)
from backend.app.security import get_current_user

router = APIRouter(prefix="/provenance", tags=["Traceable Carbon Credit Provenance"])


def generate_batch_number(vintage: int, ptype: str) -> str:
    abbr = "".join([w[:2].upper() for w in ptype.split()[:2]]) or "GEN"
    rand_hex = uuid.uuid4().hex[:6].upper()
    return f"CCT-{vintage}-{abbr}-{rand_hex}"


def generate_certificate_code() -> str:
    return f"RET-{uuid.uuid4().hex[:8].upper()}-{datetime.utcnow().year}"


@router.get("/batches", response_model=List[CreditBatchOut])
def list_credit_batches(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    my_only: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_holdings = {
        h.batch_id: h.quantity
        for h in db.query(CreditBatchHolding).filter(CreditBatchHolding.user_id == current_user.id).all()
    }
    batch_ids_with_holdings = [bid for bid, qty in user_holdings.items() if qty > 0]

    query = db.query(CreditBatch)

    if my_only:
        query = query.filter(
            (CreditBatch.owner_id == current_user.id) |
            (CreditBatch.creator_id == current_user.id) |
            (CreditBatch.id.in_(batch_ids_with_holdings))
        )
    elif status_filter:
        query = query.filter(CreditBatch.verification_status == status_filter)
    else:
        # Default: show verified or public batches plus own batches and held batches
        query = query.filter(
            (CreditBatch.verification_status.in_(["verified", "retired"])) |
            (CreditBatch.owner_id == current_user.id) |
            (CreditBatch.id.in_(batch_ids_with_holdings))
        )

    batches = query.order_by(CreditBatch.created_at.desc()).all()
    results = []
    for b in batches:
        out = CreditBatchOut.model_validate(b)
        out.user_holding_quantity = user_holdings.get(b.id, 0.0)
        results.append(out)
    return results


@router.get("/batches/{batch_id}", response_model=CreditBatchOut)
def get_credit_batch_provenance(
    batch_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = db.query(CreditBatch).filter(CreditBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit batch not found.")
    
    holding = (
        db.query(CreditBatchHolding)
        .filter(CreditBatchHolding.batch_id == batch_id, CreditBatchHolding.user_id == current_user.id)
        .first()
    )
    out = CreditBatchOut.model_validate(batch)
    out.user_holding_quantity = holding.quantity if holding else 0.0
    return out


@router.get("/batches/{batch_id}/holdings", response_model=List[CreditBatchHoldingOut])
def get_batch_holdings(
    batch_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = db.query(CreditBatch).filter(CreditBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit batch not found.")
    
    return (
        db.query(CreditBatchHolding)
        .filter(CreditBatchHolding.batch_id == batch_id)
        .order_by(CreditBatchHolding.quantity.desc())
        .all()
    )


@router.post("/batches", response_model=CreditBatchOut, status_code=status.HTTP_201_CREATED)
def create_credit_batch(
    payload: CreditBatchCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch_number = generate_batch_number(payload.vintage_year, payload.project_type)

    batch = CreditBatch(
        batch_number=batch_number,
        owner_id=current_user.id,
        creator_id=current_user.id,
        project_name=payload.project_name,
        project_type=payload.project_type,
        project_location=payload.project_location,
        methodology=payload.methodology,
        registry_name=payload.registry_name,
        registry_id=payload.registry_id,
        vintage_year=payload.vintage_year,
        initial_quantity=payload.initial_quantity,
        available_quantity=payload.initial_quantity,
        unit=payload.unit,
        verification_org=payload.verification_org or "Internal Prototype Verifier",
        verification_status="draft",
        evidence_doc_name=payload.evidence_doc_name,
        evidence_doc_url=payload.evidence_doc_url,
        evidence_hash=payload.evidence_hash,
    )
    db.add(batch)
    db.flush()

    # Create initial normalized holding for the creator
    holding = CreditBatchHolding(
        batch_id=batch.id,
        user_id=current_user.id,
        quantity=payload.initial_quantity,
    )
    db.add(holding)

    # Log initial draft event
    log = CreditVerificationLog(
        batch_id=batch.id,
        actor_id=current_user.id,
        from_status="none",
        to_status="draft",
        notes="Batch registered in draft status by creator with initial holding created.",
    )
    db.add(log)
    db.commit()
    db.refresh(batch)

    out = CreditBatchOut.model_validate(batch)
    out.user_holding_quantity = payload.initial_quantity
    return out


@router.post("/batches/{batch_id}/evidence", response_model=CreditBatchOut)
def attach_evidence_document(
    batch_id: str,
    payload: EvidenceAttach,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = db.query(CreditBatch).filter(CreditBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit batch not found.")

    if batch.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only batch owner can attach evidence.")

    if batch.verification_status in ["verified", "retired"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot alter evidence documents for a batch that is already '{batch.verification_status}'. Evidence is locked.",
        )

    batch.evidence_doc_name = payload.evidence_doc_name
    batch.evidence_doc_url = payload.evidence_doc_url
    batch.evidence_hash = payload.evidence_hash

    log = CreditVerificationLog(
        batch_id=batch.id,
        actor_id=current_user.id,
        from_status=batch.verification_status,
        to_status=batch.verification_status,
        notes=f"Supporting evidence document updated: {payload.evidence_doc_name} (SHA-256: {payload.evidence_hash[:12]}...)",
    )
    db.add(log)
    db.commit()
    db.refresh(batch)
    return batch


@router.post("/batches/{batch_id}/submit", response_model=CreditBatchOut)
def submit_batch_for_verification(
    batch_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = db.query(CreditBatch).filter(CreditBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit batch not found.")

    if batch.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only batch owner can submit for review.")

    if batch.verification_status not in ["draft", "rejected"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit batch with current status '{batch.verification_status}'. Must be 'draft' or 'rejected'.",
        )

    prev_status = batch.verification_status
    batch.verification_status = "submitted"
    batch.rejection_reason = None

    log = CreditVerificationLog(
        batch_id=batch.id,
        actor_id=current_user.id,
        from_status=prev_status,
        to_status="submitted",
        notes="Submitted for third-party / prototype verification audit.",
    )
    db.add(log)
    db.commit()
    db.refresh(batch)
    return batch


@router.post("/batches/{batch_id}/review", response_model=CreditBatchOut)
def review_batch_verification(
    batch_id: str,
    payload: BatchReview,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # RBAC: Only admin or authorized reviewer role can approve/reject
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only accredited sustainability auditors or admins can review credit batches.",
        )

    batch = db.query(CreditBatch).filter(CreditBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit batch not found.")

    # Anti-conflict of interest check: Auditors cannot self-verify batches they created
    if batch.creator_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Conflict of interest: You cannot verify or approve credit batches that you submitted.",
        )

    if batch.verification_status not in ["submitted", "under_review"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot review batch with status '{batch.verification_status}'. Batch must be 'submitted' or 'under_review'.",
        )

    prev_status = batch.verification_status

    if payload.action == "verify":
        batch.verification_status = "verified"
        batch.reviewer_id = current_user.id
        batch.verified_at = datetime.utcnow()
        batch.rejection_reason = None
        notes = payload.notes or "Certified by accredited prototype sustainability reviewer."
    else:  # reject
        batch.verification_status = "rejected"
        batch.reviewer_id = current_user.id
        batch.rejection_reason = payload.rejection_reason or "Insufficient methodology verification evidence."
        notes = payload.notes or f"Verification rejected: {batch.rejection_reason}"

    log = CreditVerificationLog(
        batch_id=batch.id,
        actor_id=current_user.id,
        from_status=prev_status,
        to_status=batch.verification_status,
        notes=notes,
    )
    db.add(log)
    db.commit()
    db.refresh(batch)
    return batch


@router.post("/batches/{batch_id}/retire", response_model=CreditRetirementOut)
def retire_carbon_credits(
    batch_id: str,
    payload: CreditRetireRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # Atomic lock on credit batch
        batch = (
            db.query(CreditBatch)
            .filter(CreditBatch.id == batch_id)
            .with_for_update()
            .first()
        )
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Credit batch not found.")

        if batch.verification_status != "verified":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only fully verified credits can be permanently retired. Current status: '{batch.verification_status}'.",
            )

        if batch.available_quantity < payload.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient available credit quantity in batch pool. Available: {batch.available_quantity}, requested: {payload.amount}.",
            )

        # Authorize and lock user's specific batch holding
        user_holding = (
            db.query(CreditBatchHolding)
            .filter(CreditBatchHolding.batch_id == batch.id, CreditBatchHolding.user_id == current_user.id)
            .with_for_update()
            .first()
        )
        if not user_holding and batch.owner_id == current_user.id:
            user_holding = CreditBatchHolding(
                batch_id=batch.id,
                user_id=current_user.id,
                quantity=batch.available_quantity,
            )
            db.add(user_holding)
            db.flush()

        if not user_holding or user_holding.quantity < payload.amount:
            hold_qty = user_holding.quantity if user_holding else 0.0
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient batch holdings. You hold {hold_qty} tCO2e in batch {batch.batch_number}, tried to retire {payload.amount} tCO2e.",
            )

        # Lock and synchronize user credit balance
        user = (
            db.query(User)
            .filter(User.id == current_user.id)
            .with_for_update()
            .first()
        )
        if not user or user.credit_balance < payload.amount:
            bal = user.credit_balance if user else 0.0
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient overall credit balance. Current balance: {bal} CCT, requested: {payload.amount}.",
            )

        # Deduct from user holding, user balance, and batch pool
        user_holding.quantity = round(user_holding.quantity - payload.amount, 3)
        user.credit_balance = max(0.0, round(user.credit_balance - payload.amount, 2))
        batch.available_quantity = round(batch.available_quantity - payload.amount, 3)
        if batch.available_quantity <= 0.001:
            batch.available_quantity = 0.0
            batch.is_retired = True
            batch.verification_status = "retired"

        # Unique certificate generation with collision check
        cert_code = generate_certificate_code()
        while db.query(CreditRetirement).filter(CreditRetirement.certificate_code == cert_code).first():
            cert_code = generate_certificate_code()

        retirement = CreditRetirement(
            batch_id=batch.id,
            user_id=current_user.id,
            amount=payload.amount,
            beneficiary=payload.beneficiary,
            retirement_reason=payload.retirement_reason,
            certificate_code=cert_code,
        )
        db.add(retirement)

        log = CreditVerificationLog(
            batch_id=batch.id,
            actor_id=current_user.id,
            from_status="verified",
            to_status=batch.verification_status,
            notes=f"Permanently retired {payload.amount} tCO2e for beneficiary '{payload.beneficiary}'. Certificate: {cert_code}. Remaining user batch holding: {user_holding.quantity} tCO2e.",
        )
        db.add(log)
        db.commit()
        db.refresh(retirement)
        return retirement

    except Exception:
        db.rollback()
        raise


@router.get("/retirements", response_model=List[CreditRetirementOut])
def list_credit_retirements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(CreditRetirement)
        .order_by(CreditRetirement.created_at.desc())
        .all()
    )


@router.get("/retirements/certificate/{cert_code}", response_model=CreditRetirementCertificateOut)
def get_public_retirement_certificate(
    cert_code: str,
    db: Session = Depends(get_db),
):
    retirement = (
        db.query(CreditRetirement)
        .filter(CreditRetirement.certificate_code == cert_code)
        .first()
    )
    if not retirement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Retirement certificate not found.",
        )
    return retirement

