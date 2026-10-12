from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models import User, Activity
from backend.app.schemas import AuditRequest, AuditResponse, ActivityCreate, ActivityOut
from backend.app.security import get_current_user
from backend.app.calculation import calculate_footprint

router = APIRouter(prefix="/calculator", tags=["Carbon Calculator & Activities"])

@router.post("/calculate", response_model=AuditResponse)
def execute_carbon_audit(
    payload: AuditRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = calculate_footprint(payload.country_code, payload.inputs)
    potential_credits = results["potential_credits"]

    # Record benchmark activity as estimated — NOT automatically verified or minted
    activity = Activity(
        user_id=current_user.id,
        title=f"Carbon Footprint Audit ({payload.country_code.upper()} - {payload.sector_id.title()})",
        category=payload.sector_id.title(),
        reduction_kg=results["potential_reduction_tons"] * 1000.0,
        credits_earned=potential_credits,
        status="estimated",  # Clearly marked as calculation estimate, not minted credits
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)

    return {
        "total_annual_kg": results["total_annual_kg"],
        "total_metric_tons": results["total_metric_tons"],
        "national_avg_tons": results["national_avg_tons"],
        "global_avg_tons": results["global_avg_tons"],
        "potential_reduction_tons": results["potential_reduction_tons"],
        "potential_credits": potential_credits,
        "rating": results["rating"],
        "awarded_credits": 0.0,  # 0.0 tradeable credits minted until accredited verification
        "activity_id": activity.id,
    }

@router.get("/activities", response_model=List[ActivityOut])
def get_user_activities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id)
        .order_by(Activity.created_at.desc())
        .all()
    )

@router.post("/activities", response_model=ActivityOut, status_code=status.HTTP_201_CREATED)
def log_manual_activity(
    activity_in: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if activity_in.reduction_kg <= 0 or activity_in.credits_earned <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Emissions reduction and credits earned must be positive values.",
        )

    # Self-reported activity: logged as pending verification, NOT instantly credited
    act = Activity(
        user_id=current_user.id,
        title=activity_in.title,
        category=activity_in.category,
        reduction_kg=activity_in.reduction_kg,
        credits_earned=activity_in.credits_earned,
        status="pending_verification",
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return act

@router.post("/activities/{activity_id}/verify", response_model=ActivityOut)
def verify_activity_and_mint_credits(
    activity_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Only administrative accounts or authorized auditors can verify activities
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only accredited sustainability auditors or admins can certify emissions reductions.",
        )

    # Concurrently lock activity row to prevent race conditions & duplicate verification
    activity = (
        db.query(Activity)
        .filter(Activity.id == activity_id)
        .with_for_update()
        .first()
    )
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found.")

    # Integrity rule: Auditors cannot self-certify their own claims
    if activity.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflict of interest: Sustainability auditors cannot self-certify their own emissions reduction activities.",
        )

    if activity.credits_earned <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot certify an activity with zero or negative credits earned.",
        )

    # Atomic Compare-And-Swap: transition from non-verified to 'verified' atomically
    updated_rows = (
        db.query(Activity)
        .filter(Activity.id == activity_id, Activity.status != "verified")
        .update({"status": "verified"}, synchronize_session=False)
    )
    if updated_rows == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Activity is already verified and credits have already been issued.",
        )

    # Concurrently lock target user row for atomic credit minting
    target_user = (
        db.query(User)
        .filter(User.id == activity.user_id)
        .with_for_update()
        .first()
    )
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user account not found.")

    target_user.credit_balance = round(target_user.credit_balance + activity.credits_earned, 2)

    db.commit()
    db.refresh(activity)
    return activity
