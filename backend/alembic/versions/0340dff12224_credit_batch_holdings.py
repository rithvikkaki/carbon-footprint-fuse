"""credit_batch_holdings

Revision ID: 0340dff12224
Revises: 0340dff12223
Create Date: 2026-10-11 22:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import Session
from datetime import datetime


# revision identifiers, used by Alembic.
revision: str = '0340dff12224'
down_revision: Union[str, Sequence[str], None] = '0340dff12223'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create table credit_batch_holdings
    op.create_table(
        'credit_batch_holdings',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('batch_id', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.String(length=50), nullable=False),
        sa.Column('quantity', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['batch_id'], ['credit_batches.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('batch_id', 'user_id', name='uq_batch_user_holding'),
        sa.CheckConstraint('quantity >= 0', name='chk_holding_quantity_nonnegative')
    )
    op.create_index(op.f('ix_credit_batch_holdings_batch_id'), 'credit_batch_holdings', ['batch_id'], unique=False)
    op.create_index(op.f('ix_credit_batch_holdings_user_id'), 'credit_batch_holdings', ['user_id'], unique=False)

    # 2. Comprehensive Ledger Reconciliation & Backfill
    bind = op.get_bind()
    session = Session(bind=bind)

    metadata = sa.MetaData()
    metadata.reflect(bind=bind, only=['credit_batches', 'market_listings', 'credit_transactions', 'credit_retirements', 'credit_batch_holdings'])

    batches_table = metadata.tables['credit_batches']
    listings_table = metadata.tables['market_listings']
    transactions_table = metadata.tables['credit_transactions']
    retirements_table = metadata.tables['credit_retirements']
    holdings_table = metadata.tables['credit_batch_holdings']

    all_batches = session.execute(sa.select(batches_table)).fetchall()

    for b in all_batches:
        batch_id = b.id
        creator_id = b.creator_id
        initial_qty = float(b.initial_quantity)

        # A. Find all listings for this batch
        batch_listings = session.execute(
            sa.select(listings_table).where(listings_table.c.batch_id == batch_id)
        ).fetchall()
        listing_map = {l.id: l for l in batch_listings}

        # B. Net transfers from confirmed transactions
        net_transfers = {}
        if batch_listings:
            listing_ids = [l.id for l in batch_listings]
            txs = session.execute(
                sa.select(transactions_table).where(
                    transactions_table.c.listing_id.in_(listing_ids),
                    transactions_table.c.status == 'Confirmed'
                )
            ).fetchall()
            for tx in txs:
                l = listing_map.get(tx.listing_id)
                seller_id = tx.seller_id or (l.seller_id if l else None)
                buyer_id = tx.buyer_id
                amt = float(tx.amount_cct)
                if seller_id:
                    net_transfers[seller_id] = round(net_transfers.get(seller_id, 0.0) - amt, 4)
                if buyer_id:
                    net_transfers[buyer_id] = round(net_transfers.get(buyer_id, 0.0) + amt, 4)

        # C. Active Escrow
        active_escrow = {}
        for l in batch_listings:
            if l.status == 'active':
                amt = float(l.amount)
                active_escrow[l.seller_id] = round(active_escrow.get(l.seller_id, 0.0) + amt, 4)

        # D. Retirements
        retirements = session.execute(
            sa.select(retirements_table).where(retirements_table.c.batch_id == batch_id)
        ).fetchall()
        retired_by_user = {}
        for r in retirements:
            amt = float(r.amount)
            retired_by_user[r.user_id] = round(retired_by_user.get(r.user_id, 0.0) + amt, 4)

        # E. Reconciled circulating holding per user
        all_users = set([creator_id]) | set(net_transfers.keys()) | set(active_escrow.keys()) | set(retired_by_user.keys())
        now = datetime.utcnow()

        for u_id in all_users:
            init_alloc = initial_qty if u_id == creator_id else 0.0
            transferred = net_transfers.get(u_id, 0.0)
            escrow = active_escrow.get(u_id, 0.0)
            retired = retired_by_user.get(u_id, 0.0)

            circulating = round(init_alloc + transferred - escrow - retired, 4)
            if circulating < 0.0:
                circulating = 0.0

            holding_id = f"hold_{batch_id[:8]}_{u_id[:8]}"
            session.execute(
                sa.insert(holdings_table).values(
                    id=holding_id,
                    batch_id=batch_id,
                    user_id=u_id,
                    quantity=circulating,
                    created_at=now,
                    updated_at=now
                )
            )

    session.commit()


def downgrade() -> None:
    op.drop_index(op.f('ix_credit_batch_holdings_user_id'), table_name='credit_batch_holdings')
    op.drop_index(op.f('ix_credit_batch_holdings_batch_id'), table_name='credit_batch_holdings')
    op.drop_table('credit_batch_holdings')
