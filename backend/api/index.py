import os
import sys
import shutil

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

tmp_db = "/tmp/airbnb.db"
src_db = os.path.join(backend_dir, "airbnb.db")

if not os.path.exists(tmp_db) and os.path.exists(src_db):
    try:
        shutil.copyfile(src_db, tmp_db)
    except Exception as e:
        print(f"Warning: could not copy SQLite DB to /tmp: {e}")

if os.path.exists(tmp_db):
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_db}"
elif os.path.exists(src_db):
    os.environ["DATABASE_URL"] = f"sqlite:///{src_db}"

from app.main import app
