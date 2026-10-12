import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models import User, MarketListing, CreditTransaction, CreditBatch, CreditBatchHolding, CreditVerificationLog
from backend.app.schemas import ListingCreate, ListingOut, CreditTransactionOut
from backend.app.security import get_current_user
from backend.app.rate_limit import rate_limit
from backend.app.config import settings

router = APIRouter(prefix="/marketplace", tags=["Carbon Credits Marketplace"])

@router.get("/listings", response_model=List[ListingOut])
def get_active_listings(db: Session = Depends(get_db)):
    return (
        db.query(MarketListing)
        .filter(MarketListing.status == "active")
        .order_by(MarketListing.created_at.desc())
        .all()
    )

@router.post(
    "/listings",
    response_model=ListingOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limit(max_requests=settings.RATE_LIMIT_MARKETPLACE, window_seconds=60, scope="marketplace"))],
)
def create_market_listing(
    listing_in: ListingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if listing_in.amount <= 0 or listing_in.price_per_credit <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount and price per credit must be greater than zero.",
        )

    # Server-side balance verification with row locking: never trust client claims!
    user = (
        db.query(User)
        .filter(User.id == current_user.id)
        .with_for_update()
        .first()
    )
    if not user or user.credit_balance < listing_in.amount:
        balance_val = user.credit_balance if user else 0.0
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient CCT balance to list. You have {balance_val} CCT, tried to list {listing_in.amount} CCT.",
        )

    # Escrow: deduct credits from seller balance so they cannot be double-spent
    user.credit_balance = round(user.credit_balance - listing_in.amount, 2)

    # If linked to a credit batch, verify provenance & eligibility
    batch = None
    if listing_in.batch_id:
        batch = (
            db.query(CreditBatch)
            .filter(CreditBatch.id == listing_in.batch_id)
            .with_for_update()
            .first()
        )
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referenced credit batch not found.")

        if batch.verification_status != "verified" or batch.is_retired:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only fully verified, active credit batches can be listed. Current status: '{batch.verification_status}', retired: {batch.is_retired}.",
            )

        # Authorize against seller's specific batch holding
        seller_holding = (
            db.query(CreditBatchHolding)
            .filter(CreditBatchHolding.batch_id == batch.id, CreditBatchHolding.user_id == current_user.id)
            .with_for_update()
            .first()
        )
        if not seller_holding and batch.owner_id == current_user.id:
            seller_holding = CreditBatchHolding(
                batch_id=batch.id,
                user_id=current_user.id,
                quantity=batch.available_quantity,
            )
            db.add(seller_holding)
            db.flush()

        if not seller_holding or seller_holding.quantity < listing_in.amount:
            hold_qty = seller_holding.quantity if seller_holding else 0.0
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient holdings in batch {batch.batch_number}. You hold {hold_qty} tCO2e, requested to list {listing_in.amount} tCO2e.",
            )

        # Deduct quantity from seller's batch holding and batch available pool (escrowed for market listing)
        seller_holding.quantity = round(seller_holding.quantity - listing_in.amount, 3)
        batch.available_quantity = round(batch.available_quantity - listing_in.amount, 3)

    # Calculated ETH price benchmark (approx 1 ETH = $3200)
    eth_price = round(listing_in.price_per_credit / 3200.0, 5)

    listing = MarketListing(
        seller_id=user.id,
        seller_address=user.wallet_address or f"0x{user.id[:8]}",
        amount=listing_in.amount,
        price_per_credit=listing_in.price_per_credit,
        price_per_credit_eth=eth_price,
        project=listing_in.project,
        country=listing_in.country,
        status="active",
        batch_id=listing_in.batch_id,
    )
    try:
        db.add(listing)
        if batch:
            log = CreditVerificationLog(
                batch_id=batch.id,
                actor_id=user.id,
                from_status="verified",
                to_status="verified",
                notes=f"Escrowed {listing_in.amount} credits for marketplace listing {listing.id}.",
            )
            db.add(log)
        db.commit()
        db.refresh(listing)
        return listing
    except Exception:
        db.rollback()
        raise

@router.post(
    "/listings/{listing_id}/buy",
    response_model=CreditTransactionOut,
    dependencies=[Depends(rate_limit(max_requests=settings.RATE_LIMIT_MARKETPLACE, window_seconds=60, scope="marketplace"))],
)
def buy_credits_from_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Atomic transaction with row locking to prevent duplicate purchases / race conditions
        listing = (
            db.query(MarketListing)
            .filter(MarketListing.id == listing_id)
            .with_for_update()
            .first()
        )

        if not listing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Market listing not found.",
            )

        if listing.seller_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot purchase your own listing.",
            )

        # Atomic Compare-And-Swap state transition: guarantees single-winner concurrency across ALL SQL engines
        updated_rows = (
            db.query(MarketListing)
            .filter(MarketListing.id == listing_id, MarketListing.status == "active")
            .update({"status": "sold"}, synchronize_session=False)
        )
        if updated_rows == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This listing is no longer active or has already been purchased.",
            )

        # Lock buyer row for balance update
        buyer = (
            db.query(User)
            .filter(User.id == current_user.id)
            .with_for_update()
            .first()
        )
        if not buyer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Buyer account not found.")

        # Credit the buyer with the purchased volume
        buyer.credit_balance = round(buyer.credit_balance + listing.amount, 2)

        # Handle linked credit batch provenance & audit trail
        if listing.batch_id:
            batch = (
                db.query(CreditBatch)
                .filter(CreditBatch.id == listing.batch_id)
                .with_for_update()
                .first()
            )
            if batch:
                # Find or create buyer's specific batch holding
                buyer_holding = (
                    db.query(CreditBatchHolding)
                    .filter(CreditBatchHolding.batch_id == batch.id, CreditBatchHolding.user_id == buyer.id)
                    .with_for_update()
                    .first()
                )
                if not buyer_holding:
                    buyer_holding = CreditBatchHolding(
                        batch_id=batch.id,
                        user_id=buyer.id,
                        quantity=round(listing.amount, 3),
                    )
                    db.add(buyer_holding)
                else:
                    buyer_holding.quantity = round(buyer_holding.quantity + listing.amount, 3)

                transfer_note = (
                    f"Purchased {listing.amount} credits from batch {batch.batch_number} (seller: {listing.seller_id}). "
                    f"Transferred to buyer {buyer.email} (buyer holding: {buyer_holding.quantity} tCO2e)."
                )

                vlog = CreditVerificationLog(
                    batch_id=batch.id,
                    actor_id=buyer.id,
                    from_status=batch.verification_status,
                    to_status=batch.verification_status,
                    notes=transfer_note,
                )
                db.add(vlog)

        # Transparent transaction record (labeled clearly as prototype sandbox settlement)
        sandbox_tx_id = f"SANDBOX_TX_{uuid.uuid4().hex[:16]}"
        total_eth = round(listing.amount * listing.price_per_credit_eth, 4)

        tx = CreditTransaction(
            buyer_id=buyer.id,
            seller_id=listing.seller_id,
            listing_id=listing.id,
            amount_cct=listing.amount,
            price_per_credit=listing.price_per_credit,
            price_eth=total_eth,
            counterparty=listing.project,
            tx_hash=sandbox_tx_id,
            status="Confirmed",
            created_at=datetime.utcnow(),
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)
        return tx
    except HTTPException:
        raise
    except Exception:
        try:
            db.rollback()
        except Exception:
            pass
        raise

@router.post("/listings/{listing_id}/cancel", response_model=ListingOut)
def cancel_market_listing(
    listing_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        listing = (
            db.query(MarketListing)
            .filter(MarketListing.id == listing_id)
            .with_for_update()
            .first()
        )
        if not listing:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Market listing not found.")

        if listing.seller_id != current_user.id and current_user.role != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the seller or an administrator can cancel this listing.",
            )

        # Atomic Compare-And-Swap to prevent concurrent double-cancellation
        updated_rows = (
            db.query(MarketListing)
            .filter(MarketListing.id == listing_id, MarketListing.status == "active")
            .update({"status": "cancelled"}, synchronize_session=False)
        )
        if updated_rows == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot cancel listing with status '{listing.status}'.",
            )

        # Return escrowed credits to seller balance
        seller = (
            db.query(User)
            .filter(User.id == listing.seller_id)
            .with_for_update()
            .first()
        )
        if seller:
            seller.credit_balance = round(seller.credit_balance + listing.amount, 2)

        # If linked to a credit batch, refund seller's holding
        if listing.batch_id:
            batch = (
                db.query(CreditBatch)
                .filter(CreditBatch.id == listing.batch_id)
                .with_for_update()
                .first()
            )
            if batch:
                batch.available_quantity = round(batch.available_quantity + listing.amount, 3)
                seller_holding = (
                    db.query(CreditBatchHolding)
                    .filter(CreditBatchHolding.batch_id == batch.id, CreditBatchHolding.user_id == listing.seller_id)
                    .with_for_update()
                    .first()
                )
                if not seller_holding:
                    seller_holding = CreditBatchHolding(
                        batch_id=batch.id,
                        user_id=listing.seller_id,
                        quantity=round(listing.amount, 3),
                    )
                    db.add(seller_holding)
                else:
                    seller_holding.quantity = round(seller_holding.quantity + listing.amount, 3)

                if batch.is_retired and batch.available_quantity > 0:
                    batch.is_retired = False
                    batch.verification_status = "verified"

                vlog = CreditVerificationLog(
                    batch_id=batch.id,
                    actor_id=current_user.id,
                    from_status="verified",
                    to_status="verified",
                    notes=f"Escrow refunded for cancelled listing {listing.id}. {listing.amount} credits restored to seller {listing.seller_id} holding (new holding: {seller_holding.quantity} tCO2e).",
                )
                db.add(vlog)

        listing.status = "cancelled"
        db.commit()
        db.refresh(listing)
        return listing
    except HTTPException:
        raise
    except Exception:
        try:
            db.rollback()
        except Exception:
            pass
        raise

@router.get("/transactions", response_model=List[CreditTransactionOut])
def get_user_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(CreditTransaction)
        .filter(CreditTransaction.buyer_id == current_user.id)
        .order_by(CreditTransaction.created_at.desc())
        .all()
    )
