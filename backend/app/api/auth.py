from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests

from app.core.security import create_access_token, get_password_hash
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse
from app.schemas.auth import Token, GoogleToken
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

def update_user_streak(user: User, db: Session):
    """
    Helper logic to update streak on each interaction.
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
    else:
        user.streak_count = 1
        user.last_activity_date = now
    
    db.add(user)
    db.commit()

@router.post("/google", response_model=Token)
def google_auth(token_data: GoogleToken, db: Session = Depends(get_db)) -> Any:
    """
    Authenticate with Google ID Token.
    If user doesn't exist, register them automatically.
    """
    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            token_data.credential, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        name = idinfo.get("name")
        
        if not email:
            raise HTTPException(status_code=400, detail="Google token does not contain email")

        # Find or create user
        user = db.query(User).filter(User.email == email).first()
        if not user:
            # Create a new user with a dummy password
            user = User(
                email=email,
                name=name or "Google User",
                password_hash=get_password_hash("GOOGLE_AUTH_USER"),
                streak_count=1,
                last_activity_date=datetime.now(timezone.utc)
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            # Update streak for existing user
            update_user_streak(user, db)

        # Generate our own JWT
        access_token = create_access_token(subject=user.email)
        return {"access_token": access_token, "token_type": "bearer"}

    except ValueError as e:
        logger.error(f"Google auth error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Google token")

@router.get("/profile", response_model=UserResponse)
def read_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    update_user_streak(current_user, db)
    current_user.streak_active = current_user.streak_count >= 2
    return current_user

@router.patch("/profile", response_model=UserResponse)
def update_user_profile(
    *,
    db: Session = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update current user's profile (name, timezone). Password change is removed.
    """
    if user_in.name is not None:
        current_user.name = user_in.name
    if user_in.timezone is not None:
        current_user.timezone = user_in.timezone
    # We no longer allow password changes via profile since it's Google Auth
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    current_user.streak_active = current_user.streak_count >= 2
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)) -> Any:
    return {"message": "Successfully logged out. Please remove token from local storage."}
