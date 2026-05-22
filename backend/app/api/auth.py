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
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash, decode_access_token
from datetime import timedelta
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserUpdate, UserResponse
from app.schemas.auth import LoginRequest, RegisterRequest, Token, ForgotPasswordRequest, ResetPasswordRequest
from app.services.auth_service import (
    authenticate_user,
    register_user,
    update_user_streak,
)

from app.services.email import send_password_reset_email

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
#  Password Reset                                                     #
# ------------------------------------------------------------------ #

@router.post("/forgot-password")
def forgot_password(
    body: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
) -> Any:
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        # Avoid giving away if the user exists or not for security reasons
        return {"message": "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi thư khôi phục mật khẩu."}
    
    # Generate a short-lived token (15 mins)
    expires_delta = timedelta(minutes=15)
    reset_token = create_access_token(subject=user.email, expires_delta=expires_delta)
    
    # Add email task to background
    background_tasks.add_task(send_password_reset_email, user.email, reset_token)
    
    return {"message": "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi thư khôi phục mật khẩu."}


@router.post("/reset-password")
def reset_password(
    body: ResetPasswordRequest,
    db: Session = Depends(get_db)
) -> Any:
    # Decode token
    payload = decode_access_token(body.token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token không hợp lệ hoặc đã hết hạn."
        )
        
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tài khoản không tồn tại."
        )
        
    # Hash new password
    user.password_hash = get_password_hash(body.new_password)
    db.add(user)
    db.commit()
    
    return {"message": "Mật khẩu đã được đặt lại thành công."}

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
