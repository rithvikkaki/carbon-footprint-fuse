import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.models import CreditBatch, CreditBatchHolding
from backend.app.reconciliation import sync_batch_holdings

def main():
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@127.0.0.1:5432/ecofuse")
    engine = create_engine(db_url)
    Session = sessionmaker(bind=engine)
    db = Session()

    print(f"=== RECONCILING AND SYNCING HOLDINGS ON: {db_url} ===")
    batches = db.query(CreditBatch).all()
    print(f"Found {len(batches)} batches.\n")

    for b in batches:
        result = sync_batch_holdings(db, b.id, dry_run=False)
        print(f"Batch {b.id} ({b.batch_number}): Status = {result['status']}")
        details = result.get('details', {})
        print(f"  Initial Issued: {details.get('initial_quantity')} tCO2e")
        print(f"  Holdings: {details.get('holdings_by_user')}")
        print(f"  Active Escrow: {details.get('active_escrow_by_user')}")
        print(f"  Retired: {details.get('retired_by_user')}")
        print(f"  Discrepancy: {details.get('discrepancy')} (Balanced: {details.get('is_balanced')})\n")

    holdings = db.query(CreditBatchHolding).all()
    print(f"Total rows in credit_batch_holdings after reconciliation sync: {len(holdings)}")
    for h in holdings:
        print(f"  Holding {h.id}: Batch={h.batch_id}, User={h.user_id}, Qty={h.quantity} tCO2e")

    db.close()

if __name__ == "__main__":
    main()
