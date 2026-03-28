# -Smart-Study-Planner-Management-web
A web-based study planner system that helps students manage subjects, schedules, tasks, and track study progress.

### 1. Khởi tạo & Kích hoạt Môi trường ảo
**Bước 1:** Khởi tạo môi trường ảo `.venv`
```bash
python -m venv .venv
```
**Bước 2:** Kích hoạt môi trường vừa tạo
- Cách kích hoạt trên **Windows (PowerShell)**:
  ```powershell
  .venv\Scripts\Activate.ps1
  ```
- Cách kích hoạt trên **Windows (Command Prompt / cmd)**:
  ```cmd
  .venv\Scripts\activate.bat
  ```
**Bước 3:** Cài đặt toàn bộ thư viện cần thiết chính xác theo version
```bash
pip install -r requirements.txt
```
---

### 2. Chạy Server Backend 

Trong lúc môi trường `.venv` vẫn đang được kích hoạt, bạn có thể khởi động Uvicorn server để chạy chế độ hot-reload cho FastAPI backend.

```bash
uvicorn app.main:app --reload
```
---

### 3. Hướng dẫn chạy Unit Test

Hệ thống đã được thiết kế sẵn các lớp Test case an toàn (về CRUD Subject, Task và Utility function) để mô phỏng tự động hóa. Đảm bảo bạn đang mở terminal ở thư mục `backend/` và đã kích hoạt môi trường ảo `(.venv)`:

Chạy toàn bộ các Module Test bên trong hệ thống dự án:
```bash
pytest
```

Nâng cao hơn: Nếu bạn muốn Test chạy hiện log chi tiết từng file với độ chi tiết rành rọt nhất, bạn có thể truyền flag `-v` (verbose).
```bash
pytest -v
```

Để kiểm tra chính xác 1 file duy nhất (Ví dụ Test Task API):
```bash
pytest tests/api/test_task.py -v
```
