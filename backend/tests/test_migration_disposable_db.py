import os
import pytest
from sqlalchemy import create_engine, text
from alembic.config import Config
from alembic import command


DISPOSABLE_DB_URL = "postgresql://postgres:postgrespassword@127.0.0.1:5432/ecofuse_disposable_test"
SERVER_DB_URL = "postgresql://postgres:postgrespassword@127.0.0.1:5432/postgres"


def test_disposable_database_migration_reconciliation():
    """Tests migration 0340dff12224 on an isolated, disposable database containing

    full sales, partial sales, active escrows, cancelled listings, and retirements.
    Ensures complete credit conservation, historical ownership preservation, and zero data leakage.
    """
    server_engine = create_engine(SERVER_DB_URL, isolation_level="AUTOCOMMIT")

    # 1. Create fresh disposable database
    with server_engine.connect() as conn:
        conn.execute(text("DROP DATABASE IF EXISTS ecofuse_disposable_test;"))
        conn.execute(text("CREATE DATABASE ecofuse_disposable_test OWNER postgres;"))

    try:
        # 2. Upgrade to revision 0340dff12223 (prior to holdings table)
        alembic_cfg = Config("backend/alembic.ini")
        alembic_cfg.set_main_option("sqlalchemy.url", DISPOSABLE_DB_URL)
        os.environ["DATABASE_URL"] = DISPOSABLE_DB_URL

        command.upgrade(alembic_cfg, "0340dff12223")

        disposable_engine = create_engine(DISPOSABLE_DB_URL)

        # 3. Populate pre-migration historical records
        with disposable_engine.connect() as conn:
            # Users
            conn.execute(text("""
                INSERT INTO users (id, email, hashed_password, name, role, credit_balance) VALUES
                ('usr_alice', 'alice@test.org', 'hash', 'Alice Creator', 'user', 500.0),
                ('usr_bob', 'bob@test.org', 'hash', 'Bob Buyer 1', 'user', 500.0),
                ('usr_charlie', 'charlie@test.org', 'hash', 'Charlie Buyer 2', 'user', 500.0);
            """))

            # Batch 1: Full Sale (Alice creates 100, sells 100 to Bob)
            conn.execute(text("""
                INSERT INTO credit_batches (id, batch_number, owner_id, creator_id, project_name, project_type, project_location, methodology, registry_name, vintage_year, initial_quantity, available_quantity, verification_status)
                VALUES ('b_full_01', 'CCT-2024-FULL-01', 'usr_bob', 'usr_alice', 'Full Sale Project', 'Solar', 'Spain', 'ACM0002', 'Verra', 2024, 100.0, 0.0, 'verified');

                INSERT INTO market_listings (id, seller_id, seller_address, amount, price_per_credit, price_per_credit_eth, project, status, batch_id)
                VALUES ('l_full_01', 'usr_alice', '0xAlice', 100.0, 10.0, 0.003, 'Full Sale Project', 'sold', 'b_full_01');

                INSERT INTO credit_transactions (id, buyer_id, seller_id, listing_id, amount_cct, price_per_credit, price_eth, counterparty, tx_hash, status)
                VALUES ('tx_full_01', 'usr_bob', 'usr_alice', 'l_full_01', 100.0, 10.0, 0.3, 'Full Sale Project', '0xHash1', 'Confirmed');
            """))

            # Batch 2: Partial Sale & Resale (Alice creates 100, sells 40 to Bob; Bob resells 15 to Charlie)
            conn.execute(text("""
                INSERT INTO credit_batches (id, batch_number, owner_id, creator_id, project_name, project_type, project_location, methodology, registry_name, vintage_year, initial_quantity, available_quantity, verification_status)
                VALUES ('b_part_02', 'CCT-2024-PART-02', 'usr_alice', 'usr_alice', 'Partial Sale Project', 'Wind', 'Chile', 'ACM0002', 'Gold Standard', 2024, 100.0, 60.0, 'verified');

                INSERT INTO market_listings (id, seller_id, seller_address, amount, price_per_credit, price_per_credit_eth, project, status, batch_id)
                VALUES ('l_part_01', 'usr_alice', '0xAlice', 40.0, 15.0, 0.004, 'Partial Sale Project', 'sold', 'b_part_02'),
                       ('l_part_02', 'usr_bob', '0xBob', 15.0, 16.0, 0.005, 'Partial Sale Project', 'sold', 'b_part_02');

                INSERT INTO credit_transactions (id, buyer_id, seller_id, listing_id, amount_cct, price_per_credit, price_eth, counterparty, tx_hash, status)
                VALUES ('tx_part_01', 'usr_bob', 'usr_alice', 'l_part_01', 40.0, 15.0, 0.16, 'Partial Sale Project', '0xHash2', 'Confirmed'),
                       ('tx_part_02', 'usr_charlie', 'usr_bob', 'l_part_02', 15.0, 16.0, 0.075, 'Partial Sale Project', '0xHash3', 'Confirmed');
            """))

            # Batch 3: Active Escrow (Alice creates 200, lists 50 actively)
            conn.execute(text("""
                INSERT INTO credit_batches (id, batch_number, owner_id, creator_id, project_name, project_type, project_location, methodology, registry_name, vintage_year, initial_quantity, available_quantity, verification_status)
                VALUES ('b_escrow_03', 'CCT-2024-ESC-03', 'usr_alice', 'usr_alice', 'Escrow Project', 'Biomass', 'India', 'AMS-I.D', 'Verra', 2024, 200.0, 150.0, 'verified');

                INSERT INTO market_listings (id, seller_id, seller_address, amount, price_per_credit, price_per_credit_eth, project, status, batch_id)
                VALUES ('l_escrow_01', 'usr_alice', '0xAlice', 50.0, 12.0, 0.0035, 'Escrow Project', 'active', 'b_escrow_03');
            """))

            # Batch 4: Cancelled Listing (Alice creates 100, listed 30, cancelled -> 100 available)
            conn.execute(text("""
                INSERT INTO credit_batches (id, batch_number, owner_id, creator_id, project_name, project_type, project_location, methodology, registry_name, vintage_year, initial_quantity, available_quantity, verification_status)
                VALUES ('b_cancel_04', 'CCT-2024-CAN-04', 'usr_alice', 'usr_alice', 'Cancel Project', 'Forestry', 'Peru', 'VM0007', 'Verra', 2024, 100.0, 100.0, 'verified');

                INSERT INTO market_listings (id, seller_id, seller_address, amount, price_per_credit, price_per_credit_eth, project, status, batch_id)
                VALUES ('l_cancel_01', 'usr_alice', '0xAlice', 30.0, 14.0, 0.004, 'Cancel Project', 'cancelled', 'b_cancel_04');
            """))

            # Batch 5: Retired Credits (Alice creates 100, sells 40 to Bob; Bob retires 10, Alice retires 20)
            conn.execute(text("""
                INSERT INTO credit_batches (id, batch_number, owner_id, creator_id, project_name, project_type, project_location, methodology, registry_name, vintage_year, initial_quantity, available_quantity, verification_status)
                VALUES ('b_retire_05', 'CCT-2024-RET-05', 'usr_alice', 'usr_alice', 'Retire Project', 'Solar', 'Kenya', 'ACM0002', 'Gold Standard', 2024, 100.0, 70.0, 'verified');

                INSERT INTO market_listings (id, seller_id, seller_address, amount, price_per_credit, price_per_credit_eth, project, status, batch_id)
                VALUES ('l_retire_01', 'usr_alice', '0xAlice', 40.0, 18.0, 0.005, 'Retire Project', 'sold', 'b_retire_05');

                INSERT INTO credit_transactions (id, buyer_id, seller_id, listing_id, amount_cct, price_per_credit, price_eth, counterparty, tx_hash, status)
                VALUES ('tx_retire_01', 'usr_bob', 'usr_alice', 'l_retire_01', 40.0, 18.0, 0.2, 'Retire Project', '0xHash4', 'Confirmed');

                INSERT INTO credit_retirements (id, batch_id, user_id, amount, beneficiary, retirement_reason, certificate_code)
                VALUES ('ret_01', 'b_retire_05', 'usr_bob', 10.0, 'Acme Logistics', 'Fleet Neutral', 'RET-BOB-001'),
                       ('ret_02', 'b_retire_05', 'usr_alice', 20.0, 'Alice Corp', 'Scope 1 Offset', 'RET-ALICE-002');
            """))
            conn.commit()

        # 4. Execute the migration 0340dff12224
        command.upgrade(alembic_cfg, "0340dff12224")

        # 5. Query and Assert Reconciled Holdings
        with disposable_engine.connect() as conn:
            holdings = conn.execute(text("SELECT batch_id, user_id, quantity FROM credit_batch_holdings;")).fetchall()
            holdings_map = {(h[0], h[1]): float(h[2]) for h in holdings}

            # Batch 1 (Full Sale: Alice=0.0, Bob=100.0)
            assert holdings_map.get(("b_full_01", "usr_alice"), 0.0) == 0.0
            assert holdings_map.get(("b_full_01", "usr_bob"), 0.0) == 100.0

            # Batch 2 (Partial Sale & Resale: Alice=60.0, Bob=25.0, Charlie=15.0)
            assert holdings_map.get(("b_part_02", "usr_alice"), 0.0) == 60.0
            assert holdings_map.get(("b_part_02", "usr_bob"), 0.0) == 25.0
            assert holdings_map.get(("b_part_02", "usr_charlie"), 0.0) == 15.0

            # Batch 3 (Active Escrow: Alice=150.0 circulating, 50.0 escrowed in listing)
            assert holdings_map.get(("b_escrow_03", "usr_alice"), 0.0) == 150.0

            # Batch 4 (Cancelled Listing: Alice=100.0 circulating)
            assert holdings_map.get(("b_cancel_04", "usr_alice"), 0.0) == 100.0

            # Batch 5 (Retirements: Alice=40.0 circulating, Bob=30.0 circulating; 30.0 retired)
            assert holdings_map.get(("b_retire_05", "usr_alice"), 0.0) == 40.0
            assert holdings_map.get(("b_retire_05", "usr_bob"), 0.0) == 30.0

            # Total credit conservation validation across all batches
            # Batch 1: 0 + 100 = 100
            assert sum(h[2] for h in holdings if h[0] == "b_full_01") == 100.0
            # Batch 2: 60 + 25 + 15 = 100
            assert sum(h[2] for h in holdings if h[0] == "b_part_02") == 100.0
            # Batch 3: 150 + 50 escrow = 200
            assert sum(h[2] for h in holdings if h[0] == "b_escrow_03") + 50.0 == 200.0
            # Batch 4: 100 + 0 = 100
            assert sum(h[2] for h in holdings if h[0] == "b_cancel_04") == 100.0
            # Batch 5: 40 + 30 + 30 retired = 100
            assert sum(h[2] for h in holdings if h[0] == "b_retire_05") + 30.0 == 100.0

    finally:
        # 6. Cleanup: Dispose connection pools and drop disposable database safely
        if 'disposable_engine' in locals():
            disposable_engine.dispose()

        with server_engine.connect() as conn:
            conn.execute(text("""
                SELECT pg_terminate_backend(pid) 
                FROM pg_stat_activity 
                WHERE datname = 'ecofuse_disposable_test' AND pid <> pg_backend_pid();
            """))
            conn.execute(text("DROP DATABASE IF EXISTS ecofuse_disposable_test;"))
