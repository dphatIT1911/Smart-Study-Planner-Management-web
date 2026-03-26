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

# Khai báo port FastAPI chạy
EXPOSE 8000

# Lệnh khởi chạy server FastAPI bằng uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
