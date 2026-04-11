#!/bin/sh

# Thoat ngay neu co loi
set -e

# Chạy migrations (sử dụng 'heads' để tránh lỗi nếu có nhiều nhánh migration)
alembic upgrade heads

echo "--- Starting Uvicorn Server ---"
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
