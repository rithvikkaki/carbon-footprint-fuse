import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.models import CreditBatch
from backend.app.reconciliation import reconcile_batch_ledger

def main():
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@127.0.0.1:5432/ecofuse")
    engine = create_engine(db_url)
    Session = sessionmaker(bind=engine)
    db = Session()

    print(f"=== CONNECTED TO: {db_url} ===")
    batches = db.query(CreditBatch).all()
    print(f"Total Batches Found: {len(batches)}\n")

    for b in batches:
        rec = reconcile_batch_ledger(db, b.id)
        print(f"Batch: {rec['batch_id']} ({rec['batch_number']})")
        print(f"  Creator: {rec['creator_id']}")
        print(f"  Initial Issued Qty: {rec['initial_quantity']} tCO2e")
        print(f"  Circulating Holdings: {rec['total_circulating_holdings']} tCO2e")
        print(f"  Active Escrow: {rec['total_active_escrow']} tCO2e")
        print(f"  Retired Credits: {rec['total_retired']} tCO2e")
        print(f"  Total Accounted: {rec['total_accounted']} tCO2e")
        print(f"  Discrepancy: {rec['discrepancy']} tCO2e")
        print(f"  Is Balanced: {rec['is_balanced']}")
        print(f"  Holdings By User: {rec['holdings_by_user']}")
        print(f"  Active Escrow By User: {rec['active_escrow_by_user']}")
        print(f"  Retired By User: {rec['retired_by_user']}\n")

    db.close()

if __name__ == "__main__":
    main()
