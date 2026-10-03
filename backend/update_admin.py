import sys
import os
import sqlite3

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.security import get_password_hash, verify_password

new_email = "Cedro@gmail.com"
new_pass = "Cedro@200"
hashed = get_password_hash(new_pass)

db_paths = [
    os.path.join(backend_dir, "..", "cedro_real_estate.db"),
    os.path.join(backend_dir, "cedro_real_estate.db")
]

for p in db_paths:
    p = os.path.abspath(p)
    if os.path.exists(p):
        conn = sqlite3.connect(p)
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET email = ?, hashed_password = ? WHERE role = 'admin'", (new_email, hashed))
        conn.commit()
        
        cursor.execute("SELECT id, email, role, hashed_password FROM users WHERE role = 'admin'")
        verified = cursor.fetchall()
        for v in verified:
            match = verify_password(new_pass, v[3])
            print(f"File {p} - Verified admin: {v[1]} (id={v[0]}) => Match: {match}")
            assert match, "Verification failed!"
        conn.close()

print("Admin credentials update complete!")
