from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models import User, CompanyPartner, CollaborationProposal
from backend.app.schemas import PartnerOut, ProposalCreate, ProposalOut
from backend.app.security import get_current_user

router = APIRouter(prefix="/collaborations", tags=["Corporate Collaborations & Supply Chain"])

@router.get("/partners", response_model=List[PartnerOut])
def get_company_partners(db: Session = Depends(get_db)):
    return db.query(CompanyPartner).all()

@router.post("/partners/{partner_id}/toggle", response_model=PartnerOut)
def toggle_partner_connection(
    partner_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    partner = db.query(CompanyPartner).filter(CompanyPartner.id == partner_id).first()
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company partner not found.")

    partner.connected = not partner.connected
    db.commit()
    db.refresh(partner)
    return partner

@router.post("/proposals", response_model=ProposalOut, status_code=status.HTTP_201_CREATED)
def submit_collaboration_proposal(
    payload: ProposalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    partner = db.query(CompanyPartner).filter(CompanyPartner.id == payload.partner_id).first()
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company partner not found.")

    proposal = CollaborationProposal(
        user_id=current_user.id,
        partner_id=partner.id,
        partner_name=partner.name,
        scope=payload.scope,
        proposed_by=current_user.wallet_address or current_user.name,
        message=payload.message,
        status="Under Review",
    )
    db.add(proposal)
    db.commit()
    db.refresh(proposal)
    return proposal

@router.get("/proposals/me", response_model=List[ProposalOut])
def get_user_proposals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(CollaborationProposal)
        .filter(CollaborationProposal.user_id == current_user.id)
        .order_by(CollaborationProposal.created_at.desc())
        .all()
    )
