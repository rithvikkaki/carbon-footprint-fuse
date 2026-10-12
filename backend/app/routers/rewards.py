import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models import User, Reward, RewardRedemption
from backend.app.schemas import RewardOut, RedemptionCreate, RedemptionOut
from backend.app.security import get_current_user

router = APIRouter(prefix="/rewards", tags=["Sustainability Rewards"])

@router.get("", response_model=List[RewardOut])
def list_rewards(db: Session = Depends(get_db)):
    return db.query(Reward).filter(Reward.is_active == True).all()

@router.post("/redeem", response_model=RedemptionOut, status_code=status.HTTP_201_CREATED)
def redeem_reward(
    payload: RedemptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        reward = db.query(Reward).filter(Reward.id == payload.reward_id).first()
        if not reward or not reward.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reward not found or inactive.")

        # Server authorization with row locking: verify and debit user credit balance atomically
        user = (
            db.query(User)
            .filter(User.id == current_user.id)
            .with_for_update()
            .first()
        )
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

        if user.credit_balance < reward.cost_cct:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient CCT balance to redeem this reward. Required: {reward.cost_cct} CCT, Available: {user.credit_balance} CCT.",
            )

        # Deduct credits from user
        user.credit_balance = round(user.credit_balance - reward.cost_cct, 2)

        # Generate unique voucher code
        unique_code = f"ECO-{uuid.uuid4().hex[:6].upper()}"

        redemption = RewardRedemption(
            user_id=user.id,
            reward_id=reward.id,
            title=reward.title,
            cost_cct=reward.cost_cct,
            voucher_code=unique_code,
        )
        db.add(redemption)
        db.commit()
        db.refresh(redemption)
        return redemption
    except HTTPException:
        raise
    except Exception:
        try:
            db.rollback()
        except Exception:
            pass
        raise

@router.get("/redemptions/me", response_model=List[RedemptionOut])
def get_user_redemptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(RewardRedemption)
        .filter(RewardRedemption.user_id == current_user.id)
        .order_by(RewardRedemption.created_at.desc())
        .all()
    )
