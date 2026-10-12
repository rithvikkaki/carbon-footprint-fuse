from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models import (
    User,
    UserReductionTarget,
    ReductionRecommendation,
    CorporateFacility,
    CorporateEmissionRecord,
)
from backend.app.schemas import (
    EmissionsAnalyticsOverview,
    BenchmarkOut,
    RecommendationOut,
    RecommendationStatusUpdate,
    TargetCreate,
    TargetOut,
    FacilityCreate,
    FacilityOut,
    CorporateRecordCreate,
    CorporateRecordOut,
)
from backend.app.security import get_current_user
from backend.app.analytics import (
    calculate_user_emissions_overview,
    ensure_user_recommendations,
    BENCHMARKS_CATALOG,
)

router = APIRouter(prefix="/analytics", tags=["Carbon Intelligence Analytics"])


@router.get("/overview", response_model=EmissionsAnalyticsOverview)
def get_emissions_overview(
    period_days: int = Query(default=90, ge=7, le=1825),
    category: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    overview = calculate_user_emissions_overview(
        db=db,
        user_id=current_user.id,
        period_days=period_days,
        category_filter=category,
    )
    return overview


@router.get("/benchmarks", response_model=List[BenchmarkOut])
def list_reference_benchmarks():
    return BENCHMARKS_CATALOG


@router.get("/recommendations", response_model=List[RecommendationOut])
def get_user_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return ensure_user_recommendations(db, current_user.id)


@router.patch("/recommendations/{rec_id}/status", response_model=RecommendationOut)
def update_recommendation_status(
    rec_id: str,
    payload: RecommendationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rec = (
        db.query(ReductionRecommendation)
        .filter(ReductionRecommendation.id == rec_id, ReductionRecommendation.user_id == current_user.id)
        .first()
    )
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found.")

    valid_statuses = {"suggested", "planned", "completed", "dismissed"}
    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{payload.status}'. Must be one of: {', '.join(valid_statuses)}",
        )

    rec.status = payload.status
    db.commit()
    db.refresh(rec)
    return rec


@router.get("/targets", response_model=List[TargetOut])
def get_user_targets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(UserReductionTarget)
        .filter(UserReductionTarget.user_id == current_user.id)
        .order_by(UserReductionTarget.created_at.desc())
        .all()
    )


@router.post("/targets", response_model=TargetOut, status_code=status.HTTP_201_CREATED)
def create_reduction_target(
    payload: TargetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.target_type == "reduction_percentage":
        target_annual_kg = max(0.0, payload.baseline_annual_kg * (1.0 - (payload.target_value / 100.0)))
    elif payload.target_type == "net_zero":
        target_annual_kg = 0.0
    else:  # absolute_kg
        target_annual_kg = max(0.0, payload.baseline_annual_kg - payload.target_value)

    target = UserReductionTarget(
        user_id=current_user.id,
        target_name=payload.target_name,
        target_type=payload.target_type,
        target_value=payload.target_value,
        baseline_annual_kg=payload.baseline_annual_kg,
        target_annual_kg=round(target_annual_kg, 2),
        target_year=payload.target_year,
        status="active",
    )
    db.add(target)
    db.commit()
    db.refresh(target)
    return target


# --- Corporate Intelligence Reporting ---
@router.get("/corporate/facilities", response_model=List[FacilityOut])
def list_corporate_facilities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(CorporateFacility)
        .filter(CorporateFacility.user_id == current_user.id)
        .order_by(CorporateFacility.created_at.desc())
        .all()
    )


@router.post("/corporate/facilities", response_model=FacilityOut, status_code=status.HTTP_201_CREATED)
def create_corporate_facility(
    payload: FacilityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    facility = CorporateFacility(
        user_id=current_user.id,
        organization_name=payload.organization_name,
        facility_name=payload.facility_name,
        department=payload.department,
        country=payload.country,
    )
    db.add(facility)
    db.commit()
    db.refresh(facility)
    return facility


@router.get("/corporate/records", response_model=List[CorporateRecordOut])
def list_corporate_emission_records(
    facility_id: Optional[str] = Query(default=None),
    scope: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(CorporateEmissionRecord).filter(CorporateEmissionRecord.user_id == current_user.id)
    if facility_id:
        query = query.filter(CorporateEmissionRecord.facility_id == facility_id)
    if scope:
        query = query.filter(CorporateEmissionRecord.scope == scope)

    return query.order_by(CorporateEmissionRecord.created_at.desc()).all()


@router.post("/corporate/records", response_model=CorporateRecordOut, status_code=status.HTTP_201_CREATED)
def log_corporate_emission_record(
    payload: CorporateRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    facility = (
        db.query(CorporateFacility)
        .filter(CorporateFacility.id == payload.facility_id, CorporateFacility.user_id == current_user.id)
        .first()
    )
    if not facility:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Corporate facility not found.")

    rec = CorporateEmissionRecord(
        facility_id=payload.facility_id,
        user_id=current_user.id,
        reporting_period=payload.reporting_period,
        scope=payload.scope,
        category=payload.category,
        emissions_kg=payload.emissions_kg,
        activity_metric=payload.activity_metric,
        metric_unit=payload.metric_unit,
        emission_factor_source=payload.emission_factor_source,
        audit_status="internal_review",
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec
