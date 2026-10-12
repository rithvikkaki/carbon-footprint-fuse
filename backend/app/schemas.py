from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Auth & User ---
class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    organization: Optional[str] = "Independent Sustainability Advocate"
    country: Optional[str] = "United States"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    organization: Optional[str] = None
    country: Optional[str] = None
    wallet_address: Optional[str] = None

class UserOut(BaseModel):
    id: str
    email: str
    name: str
    organization: Optional[str]
    country: Optional[str]
    wallet_address: Optional[str]
    role: str
    credit_balance: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- Calculator & Activities ---
class AuditRequest(BaseModel):
    country_code: str = "US"
    sector_id: str = "transportation"
    sub_sector_id: str = "electric_rickshaw"
    inputs: dict[str, float]

class AuditResponse(BaseModel):
    total_annual_kg: float
    total_metric_tons: float
    national_avg_tons: float
    global_avg_tons: float
    potential_reduction_tons: float
    potential_credits: float
    rating: str
    awarded_credits: float
    activity_id: str

class ActivityCreate(BaseModel):
    title: str
    category: str
    reduction_kg: float
    credits_earned: float

class ActivityOut(BaseModel):
    id: str
    user_id: str
    title: str
    category: str
    reduction_kg: float
    credits_earned: float
    status: str
    date: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Carbon Intelligence Dashboard Schemas ---
class TargetCreate(BaseModel):
    target_name: str = Field(..., min_length=2, max_length=150)
    target_type: str = "reduction_percentage"  # 'reduction_percentage', 'absolute_kg', 'net_zero'
    target_value: float = Field(..., gt=0)
    baseline_annual_kg: float = Field(..., gt=0)
    target_year: int = Field(default=2026, ge=2024, le=2050)

class TargetOut(BaseModel):
    id: str
    user_id: str
    target_name: str
    target_type: str
    target_value: float
    baseline_annual_kg: float
    target_annual_kg: float
    target_year: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RecommendationStatusUpdate(BaseModel):
    status: str  # 'suggested', 'planned', 'completed', 'dismissed'

class RecommendationOut(BaseModel):
    id: str
    user_id: str
    category: str
    title: str
    description: str
    estimated_annual_saving_kg: float
    difficulty: str
    assumptions: str
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class FacilityCreate(BaseModel):
    organization_name: str = Field(..., min_length=2, max_length=150)
    facility_name: str = Field(..., min_length=2, max_length=150)
    department: str = "Operations"
    country: str = "United States"

class FacilityOut(BaseModel):
    id: str
    user_id: str
    organization_name: str
    facility_name: str
    department: str
    country: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CorporateRecordCreate(BaseModel):
    facility_id: str
    reporting_period: str = Field(..., min_length=3)  # e.g., '2025-Q1', '2025-Annual'
    scope: str = Field(..., pattern="^Scope [123]$")  # 'Scope 1', 'Scope 2', 'Scope 3'
    category: str
    emissions_kg: float = Field(..., ge=0)
    activity_metric: float = Field(..., ge=0)
    metric_unit: str
    emission_factor_source: str = "EPA 2024 GHG Hub / IEA"

class CorporateRecordOut(BaseModel):
    id: str
    facility_id: str
    user_id: str
    reporting_period: str
    scope: str
    category: str
    emissions_kg: float
    activity_metric: float
    metric_unit: str
    emission_factor_source: str
    audit_status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BenchmarkOut(BaseModel):
    name: str
    region: str
    year: int
    scope: str
    source: str
    annual_kg: float
    annual_tons: float
    is_corporate: bool
    notes: str

class EmissionsAnalyticsOverview(BaseModel):
    period: str
    total_emissions_kg: float
    total_emissions_tons: float
    previous_period_emissions_kg: float
    percentage_change: float
    is_increase: bool
    explanation: str
    category_breakdown: Dict[str, float]
    top_contributors: List[Dict[str, Any]]
    monthly_trend: List[Dict[str, Any]]
    active_target: Optional[TargetOut] = None
    target_progress_percentage: Optional[float] = None

# --- Traceable Carbon Credits & Provenance ---
class EvidenceAttach(BaseModel):
    evidence_doc_name: str = Field(..., min_length=3, max_length=255)
    evidence_doc_url: str = Field(..., min_length=8, max_length=500)
    evidence_hash: str = Field(..., pattern=r"^[a-fA-F0-9]{64}$", description="Standard SHA-256 hexadecimal checksum")

class BatchReview(BaseModel):
    action: str = Field(..., pattern="^(verify|reject)$")
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None

class CreditRetireRequest(BaseModel):
    amount: float = Field(..., gt=0)
    beneficiary: str = Field(..., min_length=2, max_length=255)
    retirement_reason: str = Field(..., min_length=3, max_length=255)

class CreditRetirementOut(BaseModel):
    id: str
    batch_id: str
    user_id: str
    amount: float
    beneficiary: str
    retirement_reason: str
    certificate_code: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CreditVerificationLogOut(BaseModel):
    id: str
    batch_id: str
    actor_id: str
    from_status: str
    to_status: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CreditBatchCreate(BaseModel):
    project_name: str = Field(..., min_length=3, max_length=255)
    project_type: str = Field(..., min_length=2, max_length=100)
    project_location: str = Field(..., min_length=2, max_length=150)
    methodology: str = Field(..., min_length=2, max_length=150)
    registry_name: str = Field(..., min_length=2, max_length=150)
    registry_id: Optional[str] = None
    vintage_year: int = Field(..., ge=2015, le=2030)
    initial_quantity: float = Field(..., gt=0)
    unit: str = "tCO2e"
    verification_org: Optional[str] = "EcoFuse Prototype Verifier"
    evidence_doc_name: Optional[str] = None
    evidence_doc_url: Optional[str] = None
    evidence_hash: Optional[str] = Field(None, pattern=r"^[a-fA-F0-9]{64}$")

class CreditBatchOut(BaseModel):
    id: str
    batch_number: str
    owner_id: str
    creator_id: str
    project_name: str
    project_type: str
    project_location: str
    methodology: str
    registry_name: str
    registry_id: Optional[str] = None
    vintage_year: int
    initial_quantity: float
    available_quantity: float
    unit: str
    verification_org: Optional[str] = None
    verification_status: str
    rejection_reason: Optional[str] = None
    reviewer_id: Optional[str] = None
    verified_at: Optional[datetime] = None
    evidence_doc_name: Optional[str] = None
    evidence_doc_url: Optional[str] = None
    evidence_hash: Optional[str] = None
    is_retired: bool
    created_at: datetime
    verification_logs: Optional[List[CreditVerificationLogOut]] = []
    user_holding_quantity: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class CreditBatchHoldingOut(BaseModel):
    id: str
    batch_id: str
    user_id: str
    quantity: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CreditRetirementCertificateOut(BaseModel):
    id: str
    certificate_code: str
    amount: float
    beneficiary: str
    retirement_reason: str
    created_at: datetime
    batch: Optional[CreditBatchOut] = None
    verification_authority: str = "Internal Platform Ledger"
    is_external_registry_surrender: bool = False
    registry_disclaimer: str = (
        "This certificate confirms retirement recorded within the internal EcoFuse platform ledger. "
        "It does not represent an unbundled surrender on external statutory registries "
        "(such as Verra Registry, Gold Standard, or CDM) unless explicitly synchronized through certified registry APIs."
    )

    model_config = ConfigDict(from_attributes=True)

# --- Marketplace & Credits ---
class ListingCreate(BaseModel):
    amount: float = Field(..., gt=0)
    price_per_credit: float = Field(..., gt=0)
    project: str = Field(..., min_length=3)
    country: str = "Global"
    batch_id: Optional[str] = None

class ListingOut(BaseModel):
    id: str
    seller_id: str
    seller_address: str
    amount: float
    price_per_credit: float
    price_per_credit_eth: float
    project: str
    country: str
    status: str
    batch_id: Optional[str] = None
    batch: Optional[CreditBatchOut] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CreditTransactionOut(BaseModel):
    id: str
    buyer_id: str
    seller_id: Optional[str]
    listing_id: Optional[str]
    amount_cct: float
    price_per_credit: float
    price_eth: float
    counterparty: str
    tx_hash: str
    status: str
    date: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Products ---
class ProductOrderCreate(BaseModel):
    product_id: str
    payment_method: str = Field(..., pattern="^(ETH|USD|CCT)$")
    shipping_address: str = Field(..., min_length=5)

class ProductOut(BaseModel):
    id: str
    name: str
    category: str
    price_usd: float
    price_eth: float
    price_cct: float
    seller: str
    description: str
    sustainability_claims: List[str]
    materials: str
    stock: int
    rating: float
    image_url: str
    certifications: List[str]

    model_config = ConfigDict(from_attributes=True)

class ProductOrderOut(BaseModel):
    id: str
    user_id: str
    product_id: str
    product_name: str
    buyer_name: str
    price_paid: str
    payment_method: str
    shipping_address: str
    status: str
    date: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Rewards ---
class RewardOut(BaseModel):
    id: str
    title: str
    category: str
    cost_cct: float
    provider: str
    description: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class RedemptionCreate(BaseModel):
    reward_id: str

class RedemptionOut(BaseModel):
    id: str
    user_id: str
    reward_id: str
    title: str
    cost_cct: float
    voucher_code: str
    date: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Collaborations ---
class PartnerOut(BaseModel):
    id: str
    name: str
    industry: str
    tier: str
    location: str
    emissions_reduced: str
    description: str
    website: str
    connected: bool

    model_config = ConfigDict(from_attributes=True)

class ProposalCreate(BaseModel):
    partner_id: str
    scope: str = Field(..., min_length=3)
    message: str = Field(..., min_length=5)

class ProposalOut(BaseModel):
    id: str
    user_id: str
    partner_id: str
    partner_name: str
    scope: str
    proposed_by: str
    message: str
    status: str
    date: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
