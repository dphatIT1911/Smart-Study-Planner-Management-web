import sqlalchemy as sa
import sys
import os

# Thêm thư mục hiện tại vào path để import được app
sys.path.append(os.getcwd())

from app.core.config import settings

def fix_alembic_version():
    try:
        engine = sa.create_engine(settings.DATABASE_URL)
        with engine.begin() as conn:
            # Kiểm tra xem bảng alembic_version có tồn tại không
            inspector = sa.inspect(engine)
            tables = inspector.get_table_names()
            
            if 'alembic_version' in tables:
                print("--- [FIX] Xóa version cũ không hợp lệ trong database ---")
                conn.execute(sa.text("DELETE FROM alembic_version"))
                print("--- [FIX] Đã dọn dẹp bảng alembic_version ---")
            else:
                print("--- [FIX] Không tìm thấy bảng alembic_version, bỏ qua ---")
    except Exception as e:
        print(f"--- [FIX] Lỗi khi dọn dẹp database: {str(e)} ---")

if __name__ == "__main__":
    fix_alembic_version()
