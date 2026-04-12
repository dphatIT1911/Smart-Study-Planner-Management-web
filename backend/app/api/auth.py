import secrets
from datetime import datetime, timedelta, timezone, date
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.schemas.auth import Token, ForgotPassword, ResetPassword
from app.services.email import email_service
from app.core.config import settings

router = APIRouter()

def update_user_streak(user: User, db: Session):
    """
    Helper logic to update streak on each interaction.
    TikTok Logic: +1 if consecutive days, reset if > 2 days gap.
    """
    now = datetime.now(timezone.utc)
    today = now.date()

    if user.last_activity_date:
        last_date = user.last_activity_date.date()
        delta = (today - last_date).days

        if delta == 1:
            # Consecutive day!
            user.streak_count += 1
            user.last_activity_date = now
            user.streak_lost_at = None # Clear loss marker
        elif delta >= 2:
            # Lost streak!
            if user.streak_count > 0:
                user.streak_lost_at = now
            user.streak_count = 0
            user.last_activity_date = now
        elif delta == 0:
            # Already checked in today
            pass
    else:
        # First activity ever
        user.streak_count = 1
        user.last_activity_date = now
    
    db.add(user)
    db.commit()

@router.post("/register", response_model=UserResponse)
def register(*, db: Session = Depends(get_db), user_in: UserCreate) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    if user_in.confirm_password and user_in.password != user_in.confirm_password:
         raise HTTPException(
            status_code=400,
            detail="Passwords do not match.",
        )

    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        name=user_in.name,
        timezone=user_in.timezone,
        streak_count=1,
        last_activity_date=datetime.now(timezone.utc)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Set computed fields
    user.streak_active = user.streak_count >= 2
    return user

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # Update streak on login
    update_user_streak(user, db)
    
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile", response_model=UserResponse)
def read_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Update streak when profile is fetched (daily check-in)
    update_user_streak(current_user, db)
    
    # streak_active is True if streak >= 2
    current_user.streak_active = current_user.streak_count >= 2
    return current_user

@router.post("/forgot-password")
async def forgot_password(
    email_in: ForgotPassword,
    db: Session = Depends(get_db)
) -> Any:
    user = db.query(User).filter(User.email == email_in.email).first()
    if not user:
        # To avoid email enumeration, we return success even if user not found
        return {"message": "If this email is registered, you will receive a reset link."}
    
    # Generate token
    token = secrets.token_urlsafe(32)
    user.reset_token = token
    user.reset_token_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    db.add(user)
    db.commit()
    
    # Send email directly (for debugging)
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    await email_service.send_password_reset_email(
        email_to=user.email,
        name=user.name,
        reset_link=reset_link
    )
    
    return {"message": "Password reset email sent."}

@router.post("/reset-password")
def reset_password(
    reset_in: ResetPassword,
    db: Session = Depends(get_db)
) -> Any:
    user = db.query(User).filter(
        User.reset_token == reset_in.token,
        User.reset_token_expires > datetime.now(timezone.utc)
    ).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")
    
    user.password_hash = get_password_hash(reset_in.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.add(user)
    db.commit()
    
    return {"message": "Password successfully reset."}

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)) -> Any:
    # Since JWT is stateless, the frontend is responsible for discarding the token
    return {"message": "Successfully logged out. Please remove token from local storage."}

@router.patch("/profile", response_model=UserResponse)
def update_user_profile(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update current user's profile (name, timezone, password).
    """
    if user_in.name is not None:
        current_user.name = user_in.name
    if user_in.timezone is not None:
        current_user.timezone = user_in.timezone
    if user_in.password is not None:
        current_user.password_hash = get_password_hash(user_in.password)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    current_user.streak_active = current_user.streak_count >= 2
    return current_user
