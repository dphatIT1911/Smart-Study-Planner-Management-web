#!/bin/sh

# Thoat ngay neu co loi
set -e

# Chạy script sửa lỗi DB (nếu có version không hợp lệ)
python scripts/fix_db.py

# Chạy migrations (sử dụng 'heads' để tránh lỗi nếu có nhiều nhánh migration)
alembic stamp 455668f2ba1b
alembic upgrade head

echo "--- Starting Uvicorn Server ---"
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
