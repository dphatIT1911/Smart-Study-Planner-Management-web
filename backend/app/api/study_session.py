from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.study_session import StudySessionCreate, StudySessionResponse
from app.services.study_session import study_session as session_service
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[StudySessionResponse])
def get_study_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Retrieve study sessions for the current user.
    """
    return session_service.get_multi_by_owner(db=db, user_id=current_user.id, skip=skip, limit=limit)

@router.post("/", response_model=StudySessionResponse)
def create_study_session(
    *,
    db: Session = Depends(get_db),
    session_in: StudySessionCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    """
    Log a completed study session and accumulate task study minutes.
    """
    if session_in.duration_minutes > 240:
        raise HTTPException(
            status_code=400,
            detail="A single study session cannot exceed 240 minutes. Please break it down."
        )

    session = session_service.create_session(db=db, obj_in=session_in, user_id=current_user.id)
    if not session:
        raise HTTPException(
            status_code=404, 
            detail="Task not found or access denied."
        )

    return session
