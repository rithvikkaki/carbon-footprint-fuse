import psycopg2
import os

db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgrespassword@127.0.0.1:5432/ecofuse")
conn = psycopg2.connect(db_url)
cur = conn.cursor()
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;")
tables = [t[0] for t in cur.fetchall()]
print(f"Total tables: {len(tables)}")
for t in tables:
    cur.execute(f'SELECT count(*) FROM "{t}";')
    cnt = cur.fetchone()[0]
    print(f"  {t}: {cnt} rows")
conn.close()
