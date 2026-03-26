from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy declarative models.
    Can be extended with shared columns (e.g., id, created_at, updated_at).
    """
    pass
