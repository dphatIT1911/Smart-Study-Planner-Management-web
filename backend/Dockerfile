# Sử dụng Python image bản rút gọn cho nhẹ
FROM python:3.11-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Đặt các biến môi trường để tối ưu Python trong Docker
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Cài đặt các thư viện (chỉ copy requirements trước để tận dụng Docker cache layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn vào thư mục làm việc /app
COPY . .

# Đảm bảo scripts/start.sh có thể thực thi được
RUN chmod +x scripts/start.sh

# Khai báo port FastAPI chạy (Render/Railway sẽ tự động bind)
EXPOSE 8000

# Chạy app thông qua start.sh
CMD ["./scripts/start.sh"]
