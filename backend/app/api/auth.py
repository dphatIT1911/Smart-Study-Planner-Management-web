from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password, create_access_token
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import Token

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(*, db: Session = Depends(get_db), user_in: UserCreate) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        name=user_in.name,
        timezone=user_in.timezone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile", response_model=UserResponse)
def read_user_profile(
    current_user: User = Depends(get_current_user),
) -> Any:
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)) -> Any:
    # Since JWT is stateless, the frontend is responsible for discarding the token
    return {"message": "Successfully logged out. Please remove token from local storage."}
