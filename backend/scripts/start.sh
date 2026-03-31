#!/bin/sh

# Thoat ngay neu co loi
set -e

echo "--- Starting Uvicorn Server ---"
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
