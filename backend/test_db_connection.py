import sys
import os

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from sqlalchemy import text
from app.db.session import engine
from app.core.config import settings

def test_connection():
    print(f"Connecting to: {settings.DATABASE_URL.split('@')[-1]}...") # Print only host for security
    try:
        # Try to connect and execute a simple query
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()
            print("Successfully connected to the database!")
            print(f"PostgreSQL version: {version[0]}")
            
            # Check if tables are created
            from app.models.base import Base
            print("\nEnsuring tables are created...")
            Base.metadata.create_all(bind=engine)
            print("Tables checked/created successfully.")
            
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        print("\nPossible issues:")
        print("1. Your IP may not be whitelisted on Render.")
        print("2. The database might be down or entering sleep mode.")
        print("3. Driver issue (ensure psycopg2-binary is installed).")

if __name__ == "__main__":
    test_connection()
