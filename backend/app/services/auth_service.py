"""
Authentication Service Layer
Handles registration and login business logic, keeping the router thin.
"""
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.user import User


def authenticate_user(
    db: Session, *, email: str, password: str
) -> Optional[User]:
    """
    Verify credentials and return the User if valid, else None.
    Email comparison is case-insensitive.
    """
    user = db.query(User).filter(
        func.lower(User.email) == email.lower()
    ).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def register_user(
    db: Session, *, email: str, password: str, name: str
) -> User:
    """
    Create a new user after checking for duplicate email.
    Raises ValueError if email already exists.
    """
    existing = db.query(User).filter(
        func.lower(User.email) == email.lower()
    ).first()
    if existing:
        raise ValueError("Email đã được sử dụng. Vui lòng dùng email khác.")

    user = User(
        email=email.lower(),
        password_hash=get_password_hash(password),
        name=name,
        streak_count=1,
        last_activity_date=datetime.now(timezone.utc),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user_streak(user: User, db: Session) -> None:
    """
    Update the daily login streak for a user.
    Called on each login / profile fetch.
    """
    now = datetime.now(timezone.utc)
    today = now.date()

    if user.last_activity_date:
        last_date = user.last_activity_date.date()
        delta = (today - last_date).days

        if delta == 1:
            user.streak_count += 1
            user.last_activity_date = now
            user.streak_lost_at = None
        elif delta >= 2:
            if user.streak_count > 0:
                user.streak_lost_at = now
            user.streak_count = 0
            user.last_activity_date = now
        # delta == 0 → same day, no change
    else:
        user.streak_count = 1
        user.last_activity_date = now

    db.add(user)
    db.commit()
