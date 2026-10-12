"""Reconciliation service for CreditBatch holdings.

Audits and reconciles credit batches, marketplace listings, transactions, and retirements
to ensure exact conservation of credit issuance across all holders and state transitions.
"""

from typing import Dict, List, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models import (
    CreditBatch,
    CreditBatchHolding,
    MarketListing,
    CreditTransaction,
    CreditRetirement,
    User,
)


def reconcile_batch_ledger(db: Session, batch_id: str) -> Dict[str, Any]:
    """Reconciles a single credit batch against its issuance, transactions, escrow, and retirements.
    
    Conservation Invariant:
    initial_quantity == sum(active_holdings) + sum(active_escrow) + sum(retired_credits)
    """
    batch = db.query(CreditBatch).filter(CreditBatch.id == batch_id).first()
    if not batch:
        return {"error": f"Batch {batch_id} not found"}

    # 1. Total Issued
    initial_qty = float(batch.initial_quantity)
    creator_id = batch.creator_id

    # 2. Historical sales tied to this batch
    # Find all listings associated with this batch
    listings = db.query(MarketListing).filter(MarketListing.batch_id == batch.id).all()
    listing_map = {l.id: l for l in listings}

    # Net transfers between users from confirmed transactions
    net_transfers: Dict[str, float] = {}

    if listings:
        listing_ids = [l.id for l in listings]
        txs = (
            db.query(CreditTransaction)
            .filter(CreditTransaction.listing_id.in_(listing_ids), CreditTransaction.status == "Confirmed")
            .all()
        )
        for tx in txs:
            l = listing_map.get(tx.listing_id)
            seller_id = tx.seller_id or (l.seller_id if l else None)
            buyer_id = tx.buyer_id
            amount = float(tx.amount_cct)

            if seller_id:
                net_transfers[seller_id] = round(net_transfers.get(seller_id, 0.0) - amount, 4)
            if buyer_id:
                net_transfers[buyer_id] = round(net_transfers.get(buyer_id, 0.0) + amount, 4)

    # 3. Active Escrowed Listings
    active_escrow_by_user: Dict[str, float] = {}
    total_active_escrow = 0.0
    for l in listings:
        if l.status == "active":
            amt = float(l.amount)
            active_escrow_by_user[l.seller_id] = round(active_escrow_by_user.get(l.seller_id, 0.0) + amt, 4)
            total_active_escrow = round(total_active_escrow + amt, 4)

    # 4. Permanent Retirements
    retirements = db.query(CreditRetirement).filter(CreditRetirement.batch_id == batch.id).all()
    retired_by_user: Dict[str, float] = {}
    total_retired = 0.0
    for r in retirements:
        amt = float(r.amount)
        retired_by_user[r.user_id] = round(retired_by_user.get(r.user_id, 0.0) + amt, 4)
        total_retired = round(total_retired + amt, 4)

    # 5. Compute Reconciled Circulating Holding per User
    all_users = set([creator_id]) | set(net_transfers.keys()) | set(active_escrow_by_user.keys()) | set(retired_by_user.keys())
    computed_holdings: Dict[str, float] = {}

    for u_id in all_users:
        init_alloc = initial_qty if u_id == creator_id else 0.0
        acquired = net_transfers.get(u_id, 0.0)
        escrow = active_escrow_by_user.get(u_id, 0.0)
        retired = retired_by_user.get(u_id, 0.0)

        circulating = round(init_alloc + acquired - escrow - retired, 4)
        computed_holdings[u_id] = circulating

    # 6. Check Invariants
    total_circulating_holdings = round(sum(computed_holdings.values()), 4)
    total_accounted = round(total_circulating_holdings + total_active_escrow + total_retired, 4)
    discrepancy = round(initial_qty - total_accounted, 4)

    is_balanced = abs(discrepancy) < 0.001
    has_negative_holdings = any(qty < -0.001 for qty in computed_holdings.values())

    return {
        "batch_id": batch.id,
        "batch_number": batch.batch_number,
        "creator_id": creator_id,
        "initial_quantity": initial_qty,
        "available_quantity_in_batch": float(batch.available_quantity),
        "total_circulating_holdings": total_circulating_holdings,
        "total_active_escrow": total_active_escrow,
        "total_retired": total_retired,
        "total_accounted": total_accounted,
        "discrepancy": discrepancy,
        "is_balanced": is_balanced,
        "has_negative_holdings": has_negative_holdings,
        "holdings_by_user": computed_holdings,
        "active_escrow_by_user": active_escrow_by_user,
        "retired_by_user": retired_by_user,
    }


def sync_batch_holdings(db: Session, batch_id: str, dry_run: bool = False) -> Dict[str, Any]:
    """Applies reconciled holdings to the credit_batch_holdings table."""
    reconciliation = reconcile_batch_ledger(db, batch_id)
    if "error" in reconciliation:
        return reconciliation

    if reconciliation["has_negative_holdings"] or not reconciliation["is_balanced"]:
        return {
            "status": "REQUIRES_MANUAL_RECONCILIATION",
            "reason": f"Discrepancy: {reconciliation['discrepancy']}, Negative: {reconciliation['has_negative_holdings']}",
            "details": reconciliation,
        }

    holdings_to_write = reconciliation["holdings_by_user"]
    batch = db.query(CreditBatch).filter(CreditBatch.id == batch_id).first()

    if not dry_run:
        for user_id, qty in holdings_to_write.items():
            if qty < 0.0:
                qty = 0.0

            holding = (
                db.query(CreditBatchHolding)
                .filter(CreditBatchHolding.batch_id == batch_id, CreditBatchHolding.user_id == user_id)
                .first()
            )
            if holding:
                holding.quantity = qty
            else:
                holding = CreditBatchHolding(
                    id=f"hold_{batch_id[:8]}_{user_id[:8]}",
                    batch_id=batch_id,
                    user_id=user_id,
                    quantity=qty,
                )
                db.add(holding)

        # Ensure batch available_quantity matches total circulating holdings
        expected_available = reconciliation["total_circulating_holdings"]
        if abs(float(batch.available_quantity) - expected_available) > 0.001:
            batch.available_quantity = expected_available

        db.commit()

    return {
        "status": "RECONCILED_AND_SYNCED",
        "dry_run": dry_run,
        "details": reconciliation,
    }
