import os
from sqlalchemy import create_engine, inspect, text
from dotenv import load_dotenv

# Load config tu .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def check_database():
    print("--- [Kiem tra ket noi Database] ---")
    
    if not DATABASE_URL:
        print("Loi: Khong tim thay DATABASE_URL trong file .env")
        return

    try:
        # Them sslmode neu can thiet cho Render
        db_url = DATABASE_URL
        if "sslmode" not in db_url:
            separator = "&" if "?" in db_url else "?"
            db_url = f"{db_url}{separator}sslmode=require"
            
        # Fix cho SQLAlchemy (postgresql:// thay vi postgres:// neu co)
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)

        engine = create_engine(db_url)
        
        # Thu ket noi
        with engine.connect() as connection:
            print("OK: Ket noi thanh cong!")
            
            # Lay thong tin cac bang
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            print(f"Bang hien co: {', '.join(tables) if tables else 'Chua co bang nao'}")
            
            if not tables:
                print("Canh bao: Chua thay bang nao trong Database.")
                return

            # Dem du lieu
            print("\nThong ke ban ghi:")
            for table in tables:
                try:
                    result = connection.execute(text(f"SELECT COUNT(*) FROM \"{table}\""))
                    count = result.scalar()
                    print(f"  - [{table}]: {count} row(s)")
                except Exception as table_err:
                    print(f"  - [{table}]: Loi truy van ({str(table_err)})")
            
            # Xem toàn bộ dữ liệu ở tất cả các bảng
            print("\n" + "="*40)
            print("[TONG HOP TOAN BO DU LIEU]")
            print("="*40)
            
            for table in tables:
                print(f"\n[BANG: {table.upper()}]")
                print("-" * 30)
                try:
                    result = connection.execute(text(f"SELECT * FROM \"{table}\""))
                    rows = result.all()
                    if rows:
                        for row in rows:
                            # In các cột của bản ghi dưới dạng chuỗi
                            print(" | ".join([f"{key}: {val}" for key, val in row._mapping.items()]))
                    else:
                        print("  (Bảng đang trống)")
                except Exception as e:
                    print(f"  Lỗi lấy dữ liệu bảng {table}: {e}")
                    
            print("\n" + "="*40)

    except Exception as e:
        print(f"Loi: {str(e)}")

if __name__ == "__main__":
    check_database()
