#!/bin/sh

# Thoát ngay lập tức nếu có lệnh nào bị lỗi
set -e

echo "--- 🛠️  Đang thực thi Database Migrations ---"
# Chạy migrations để cập nhật cấu trúc database mới nhất
alembic upgrade head

echo "--- 🚀 Khởi chạy server FastAPI bằng Gunicorn ---"
# Chạy app bằng gunicorn với uvicorn worker
# -w 4: Số lượng worker processes (có thể điều chỉnh tùy chip CPU của server)
# -k uvicorn.workers.UvicornWorker: Loại worker tương thích FastAPI
# --bind 0.0.0.0:$PORT: Liên kết với port mà Render/Railway cung cấp
exec gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:${PORT:-8000}
