import os
import sqlite3

base_dir = os.path.dirname(os.path.abspath(__file__))
paths = [
    os.path.join(base_dir, "..", "cedro_real_estate.db"),
    os.path.join(base_dir, "cedro_real_estate.db")
]

for p in paths:
    p = os.path.abspath(p)
    if os.path.exists(p):
        conn = sqlite3.connect(p)
        c = conn.cursor()
        c.execute("PRAGMA table_info(users)")
        user_cols = [r[1] for r in c.fetchall()]
        if "is_active" not in user_cols:
            print(f"Adding is_active to {p}")
            c.execute("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1")
            conn.commit()

        c.execute("PRAGMA table_info(listings)")
        listing_cols = [r[1] for r in c.fetchall()]
        if "documents" not in listing_cols:
            print(f"Adding documents to {p}")
            c.execute("ALTER TABLE listings ADD COLUMN documents JSON DEFAULT '[]'")
            conn.commit()

        conn.close()
        print(f"Schema migrated for {p}")

print("Migration completed.")
