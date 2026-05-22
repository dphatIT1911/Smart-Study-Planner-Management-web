# Smart Study Planner Management Web

A web-based study planner system that helps students manage subjects, schedules, tasks, and track study progress.

## 🚀 Hướng dẫn chạy Web (Local Development)

Dự án này bao gồm 2 phần: **Backend** (FastAPI) và **Frontend** (React + Vite). Bạn cần khởi động cả hai để trang web hoạt động đầy đủ.

*(💡 **Mẹo:** Nếu bạn dùng Windows, bạn có thể click đúp vào file `start_project.bat` ở thư mục gốc để hệ thống tự động khởi chạy cả Frontend và Backend cùng lúc một cách nhanh chóng).*

Nếu muốn chạy thủ công, hãy thực hiện theo các bước sau:

### 1. Chạy Backend (FastAPI)
Mở một terminal mới, sau đó:
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Khởi tạo môi trường ảo (nếu chưa tạo):
   ```bash
   py -3.12 -m venv .venv
   ```
3. Kích hoạt môi trường ảo:
   - **Windows (PowerShell)**: `.venv\Scripts\Activate.ps1`
   - **Windows (CMD)**: `.venv\Scripts\activate.bat`
   - **MacOS / Linux**: `source .venv/bin/activate`
4. Cài đặt các thư viện cần thiết:
   ```bash
   pip install -r requirements.txt
   ```
5. Khởi động server (mặc định chạy ở `http://127.0.0.1:8000`):
   ```bash
   uvicorn app.main:app --reload
   ```

### 2. Chạy Frontend (React + Vite)
Mở thêm một terminal **thứ hai**, sau đó:
1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói phụ thuộc (Node Modules - chỉ cần chạy lần đầu):
   ```bash
   npm install
   ```
3. Khởi động giao diện web:
   ```bash
   npm run dev
   ```
4. Truy cập trang web qua đường dẫn hiển thị trên terminal (thường là `http://localhost:5173`).

---

## 🧪 Hướng dẫn chạy Unit Test (Backend)

Hệ thống được thiết kế sẵn một bộ Test Suite toàn diện (bao gồm các Test Case trong Proposal từ TC-01 đến TC-05) với độ phủ cao. Cơ sở dữ liệu test được tự động cách ly qua SQLite in-memory.

Để chạy Test, đảm bảo terminal của bạn đang ở thư mục `backend/` và đã **kích hoạt môi trường ảo** `.venv`.

**1. Chạy toàn bộ các Module Test**
```bash
pytest tests/
```

**2. Chạy Test với log hiển thị chi tiết (Verbose)**
Sử dụng cờ `-v` để in ra danh sách và trạng thái (PASSED/FAILED) của từng test case cụ thể.
```bash
pytest tests/ -v
```

**3. Chạy riêng một nhóm Test cụ thể**
Ví dụ, bạn chỉ muốn chạy các test case liên quan đến Xác thực (TC-01) hoặc Test Task (TC-02, TC-03, TC-05):
```bash
pytest tests/api/test_tc_auth.py -v
pytest tests/api/test_tc_task.py -v
```
