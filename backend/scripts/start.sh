#!/bin/sh

# Thoat ngay neu co loi
set -e

echo "--- Executing Database Migrations ---"
alembic upgrade head

echo "--- Starting Gunicorn Server ---"
exec gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:${PORT:-8000}
