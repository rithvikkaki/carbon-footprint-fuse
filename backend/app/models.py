import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_id(prefix: str = "id") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("usr"))
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(150), nullable=False)
    organization = Column(String(150), default="Independent Sustainability Advocate")
    country = Column(String(100), default="United States")
    wallet_address = Column(String(100), nullable=True)
    role = Column(String(50), default="user")  # 'user', 'admin'
    credit_balance = Column(Float, default=420.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    activities = relationship("Activity", back_populates="user", cascade="all, delete-orphan")
    listings = relationship("MarketListing", back_populates="seller", cascade="all, delete-orphan")
    credit_transactions = relationship("CreditTransaction", back_populates="buyer", cascade="all, delete-orphan")
    product_orders = relationship("ProductOrder", back_populates="user", cascade="all, delete-orphan")
    reward_redemptions = relationship("RewardRedemption", back_populates="user", cascade="all, delete-orphan")
    collaboration_proposals = relationship("CollaborationProposal", back_populates="user", cascade="all, delete-orphan")
    targets = relationship("UserReductionTarget", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("ReductionRecommendation", back_populates="user", cascade="all, delete-orphan")
    facilities = relationship("CorporateFacility", back_populates="user", cascade="all, delete-orphan")
    owned_batches = relationship("CreditBatch", foreign_keys="CreditBatch.owner_id", back_populates="owner")
    created_batches = relationship("CreditBatch", foreign_keys="CreditBatch.creator_id", back_populates="creator")
    batch_holdings = relationship("CreditBatchHolding", back_populates="user", cascade="all, delete-orphan")
    retirements = relationship("CreditRetirement", back_populates="user", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("act"))
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    reduction_kg = Column(Float, nullable=False)
    credits_earned = Column(Float, nullable=False)
    status = Column(String(50), default="verified")
    date = Column(String(50), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="activities")


class MarketListing(Base):
    __tablename__ = "market_listings"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("list"))
    seller_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    seller_address = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    price_per_credit = Column(Float, nullable=False)  # in USD
    price_per_credit_eth = Column(Float, nullable=False)  # in ETH
    project = Column(String(255), nullable=False)
    country = Column(String(100), default="Global")
    status = Column(String(50), default="active")  # 'active', 'sold', 'cancelled'
    batch_id = Column(String(50), ForeignKey("credit_batches.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    seller = relationship("User", back_populates="listings")
    batch = relationship("CreditBatch", back_populates="listings")


class CreditTransaction(Base):
    __tablename__ = "credit_transactions"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("tx"))
    buyer_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    seller_id = Column(String(50), nullable=True)
    listing_id = Column(String(50), nullable=True)
    amount_cct = Column(Float, nullable=False)
    price_per_credit = Column(Float, nullable=False)
    price_eth = Column(Float, nullable=False)
    counterparty = Column(String(255), nullable=False)
    tx_hash = Column(String(100), nullable=False)
    status = Column(String(50), default="Confirmed")
    date = Column(String(50), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    created_at = Column(DateTime, default=datetime.utcnow)

    buyer = relationship("User", back_populates="credit_transactions")


class SustainableProduct(Base):
    __tablename__ = "sustainable_products"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)  # 'Watches', 'Lifestyle', etc.
    price_usd = Column(Float, nullable=False)
    price_eth = Column(Float, nullable=False)
    price_cct = Column(Float, nullable=False)
    seller = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    sustainability_claims = Column(Text, nullable=False)  # JSON-encoded array
    materials = Column(String(255), nullable=False)
    stock = Column(Integer, default=10, nullable=False)
    rating = Column(Float, default=4.8)
    image_url = Column(String(500), nullable=False)
    certifications = Column(Text, nullable=False)  # JSON-encoded array
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("ProductOrder", back_populates="product")


class ProductOrder(Base):
    __tablename__ = "product_orders"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("ord"))
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(String(50), ForeignKey("sustainable_products.id"), nullable=False)
    product_name = Column(String(255), nullable=False)
    buyer_name = Column(String(150), nullable=False)
    price_paid = Column(String(100), nullable=False)
    payment_method = Column(String(50), nullable=False)  # 'ETH', 'USD', 'CCT'
    shipping_address = Column(Text, nullable=False)
    status = Column(String(50), default="Confirmed")
    date = Column(String(50), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="product_orders")
    product = relationship("SustainableProduct", back_populates="orders")


class Reward(Base):
    __tablename__ = "rewards"

    id = Column(String(50), primary_key=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    cost_cct = Column(Float, nullable=False)
    provider = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)

    redemptions = relationship("RewardRedemption", back_populates="reward")


class RewardRedemption(Base):
    __tablename__ = "reward_redemptions"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("red"))
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    reward_id = Column(String(50), ForeignKey("rewards.id"), nullable=False)
    title = Column(String(255), nullable=False)
    cost_cct = Column(Float, nullable=False)
    voucher_code = Column(String(50), unique=True, index=True, nullable=False)
    date = Column(String(50), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reward_redemptions")
    reward = relationship("Reward", back_populates="redemptions")


class CompanyPartner(Base):
    __tablename__ = "company_partners"

    id = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    industry = Column(String(100), nullable=False)
    tier = Column(String(100), nullable=False)  # 'Direct Corporate Partner', 'Tier 1 Supplier', 'Tier 2 Supplier'
    location = Column(String(150), nullable=False)
    emissions_reduced = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    website = Column(String(255), nullable=False)
    connected = Column(Boolean, default=False)

    proposals = relationship("CollaborationProposal", back_populates="partner")


class CollaborationProposal(Base):
    __tablename__ = "collaboration_proposals"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("prop"))
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    partner_id = Column(String(50), ForeignKey("company_partners.id"), nullable=False)
    partner_name = Column(String(255), nullable=False)
    scope = Column(String(150), nullable=False)
    proposed_by = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="Under Review")  # 'Under Review', 'Connected'
    date = Column(String(50), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="collaboration_proposals")
    partner = relationship("CompanyPartner", back_populates="proposals")


class UserReductionTarget(Base):
    __tablename__ = "user_reduction_targets"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("tgt"))
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    target_name = Column(String(150), nullable=False)
    target_type = Column(String(50), default="reduction_percentage")  # 'reduction_percentage', 'absolute_kg', 'net_zero'
    target_value = Column(Float, nullable=False)
    baseline_annual_kg = Column(Float, nullable=False)
    target_annual_kg = Column(Float, nullable=False)
    target_year = Column(Integer, default=2026)
    status = Column(String(50), default="active")  # 'active', 'achieved', 'abandoned'
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="targets")


class ReductionRecommendation(Base):
    __tablename__ = "reduction_recommendations"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("rec"))
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    estimated_annual_saving_kg = Column(Float, nullable=False)
    difficulty = Column(String(50), default="moderate")  # 'easy', 'moderate', 'challenging'
    assumptions = Column(Text, nullable=False)
    status = Column(String(50), default="suggested")  # 'suggested', 'planned', 'completed', 'dismissed'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")


class CorporateFacility(Base):
    __tablename__ = "corporate_facilities"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("fac"))
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    organization_name = Column(String(150), nullable=False)
    facility_name = Column(String(150), nullable=False)
    department = Column(String(100), default="Operations")
    country = Column(String(100), default="United States")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="facilities")
    records = relationship("CorporateEmissionRecord", back_populates="facility", cascade="all, delete-orphan")


class CorporateEmissionRecord(Base):
    __tablename__ = "corporate_emission_records"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("corprec"))
    facility_id = Column(String(50), ForeignKey("corporate_facilities.id"), nullable=False, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    reporting_period = Column(String(50), nullable=False)  # '2025-Q1', '2025-Annual'
    scope = Column(String(50), nullable=False)  # 'Scope 1', 'Scope 2', 'Scope 3'
    category = Column(String(100), nullable=False)
    emissions_kg = Column(Float, nullable=False)
    activity_metric = Column(Float, nullable=False)
    metric_unit = Column(String(50), nullable=False)
    emission_factor_source = Column(String(150), default="EPA 2024 GHG Hub / IEA")
    audit_status = Column(String(50), default="internal_review")  # 'self_reported', 'internal_review', 'verified'
    created_at = Column(DateTime, default=datetime.utcnow)

    facility = relationship("CorporateFacility", back_populates="records")


class CreditBatch(Base):
    __tablename__ = "credit_batches"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("batch"))
    batch_number = Column(String(100), unique=True, index=True, nullable=False)
    owner_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    creator_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    project_name = Column(String(255), nullable=False)
    project_type = Column(String(100), nullable=False)
    project_location = Column(String(150), nullable=False)
    methodology = Column(String(150), nullable=False)
    registry_name = Column(String(150), nullable=False)
    registry_id = Column(String(100), nullable=True)
    vintage_year = Column(Integer, nullable=False)
    initial_quantity = Column(Float, nullable=False)
    available_quantity = Column(Float, nullable=False)
    unit = Column(String(50), default="tCO2e")
    verification_org = Column(String(150), nullable=True)
    verification_status = Column(String(50), default="draft")  # 'draft', 'submitted', 'under_review', 'verified', 'rejected', 'retired'
    rejection_reason = Column(Text, nullable=True)
    reviewer_id = Column(String(50), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    evidence_doc_name = Column(String(255), nullable=True)
    evidence_doc_url = Column(String(500), nullable=True)
    evidence_hash = Column(String(100), nullable=True)
    is_retired = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", foreign_keys=[owner_id], back_populates="owned_batches")
    creator = relationship("User", foreign_keys=[creator_id], back_populates="created_batches")
    verification_logs = relationship("CreditVerificationLog", back_populates="batch", cascade="all, delete-orphan")
    retirements = relationship("CreditRetirement", back_populates="batch", cascade="all, delete-orphan")
    listings = relationship("MarketListing", back_populates="batch")
    holdings = relationship("CreditBatchHolding", back_populates="batch", cascade="all, delete-orphan")


class CreditBatchHolding(Base):
    __tablename__ = "credit_batch_holdings"
    __table_args__ = (
        UniqueConstraint("batch_id", "user_id", name="uq_batch_user_holding"),
        CheckConstraint("quantity >= 0", name="chk_holding_quantity_nonnegative"),
    )

    id = Column(String(50), primary_key=True, default=lambda: generate_id("hold"))
    batch_id = Column(String(50), ForeignKey("credit_batches.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    batch = relationship("CreditBatch", back_populates="holdings")
    user = relationship("User", back_populates="batch_holdings")


class CreditVerificationLog(Base):
    __tablename__ = "credit_verification_logs"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("vlog"))
    batch_id = Column(String(50), ForeignKey("credit_batches.id"), nullable=False, index=True)
    actor_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    from_status = Column(String(50), nullable=False)
    to_status = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    batch = relationship("CreditBatch", back_populates="verification_logs")
    actor = relationship("User")


class CreditRetirement(Base):
    __tablename__ = "credit_retirements"

    id = Column(String(50), primary_key=True, default=lambda: generate_id("ret"))
    batch_id = Column(String(50), ForeignKey("credit_batches.id"), nullable=False, index=True)
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    beneficiary = Column(String(255), nullable=False)
    retirement_reason = Column(String(255), nullable=False)
    certificate_code = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    batch = relationship("CreditBatch", back_populates="retirements")
    user = relationship("User", back_populates="retirements")
