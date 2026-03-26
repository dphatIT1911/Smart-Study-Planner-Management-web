from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Depending on your driver, you might need pooling options.
# Using standard synchronous SQLAlchemy setup as requested.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True, # Verify connections before using them
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency to yield database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
