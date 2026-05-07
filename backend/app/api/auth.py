"""
Auth Router — Email / Password JWT authentication.
Endpoints:
    POST /auth/register  – Create a new user account.
    POST /auth/login     – Authenticate and receive a JWT.
    GET  /auth/profile   – Get current user profile.
    PATCH /auth/profile  – Update current user profile.
    POST /auth/logout    – (Client-side) logout placeholder.
"""
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.services.auth_service import (
    authenticate_user,
    register_user,
    update_user_streak,
)

import logging

logger = logging.getLogger(__name__)
router = APIRouter()


# ------------------------------------------------------------------ #
#  Registration & Login                                               #
# ------------------------------------------------------------------ #

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)) -> Any:
    """
    Create a new user with email + password.
    Returns a JWT so the user is immediately logged in.
    """
    # Validate password confirmation
    if body.password != body.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu xác nhận không khớp.",
        )

    try:
        user = register_user(
            db, email=body.email, password=body.password, name=body.name
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )

    access_token = create_access_token(subject=user.email)
    return Token(access_token=access_token)


@router.post("/login", response_model=Token)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> Any:
    """
    Authenticate with email + password.
    Returns a JWT on success.
    """
    user = authenticate_user(db, email=body.email, password=body.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Update login streak
    update_user_streak(user, db)

    access_token = create_access_token(subject=user.email)
    return Token(access_token=access_token)


# ------------------------------------------------------------------ #
#  Profile                                                            #
# ------------------------------------------------------------------ #

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
    Update current user's profile (name, timezone).
    """
    if user_in.name is not None:
        current_user.name = user_in.name
    if user_in.timezone is not None:
        current_user.timezone = user_in.timezone
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    current_user.streak_active = current_user.streak_count >= 2
    return current_user


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)) -> Any:
    return {"message": "Successfully logged out. Please remove token from local storage."}
