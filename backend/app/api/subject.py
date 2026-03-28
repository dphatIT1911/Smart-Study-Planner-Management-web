from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse
from app.services.subject import subject_service

router = APIRouter()

@router.get("/", response_model=List[SubjectResponse])
def read_subjects(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve subjects list.
    """
    subjects = subject_service.get_multi_by_owner(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return subjects

@router.post("/", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(
    *,
    db: Session = Depends(get_db),
    subject_in: SubjectCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new subject.
    """
    if subject_in.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not authorized to create a subject for another user"
        )
        
    subject = subject_service.create_with_owner(db=db, obj_in=subject_in, user_id=current_user.id)
    return subject

@router.get("/{id}", response_model=SubjectResponse)
def read_subject(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get subject by ID.
    """
    subject = subject_service.get(db=db, id=id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    if subject.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return subject

@router.patch("/{id}", response_model=SubjectResponse)
def update_subject(
    *,
    db: Session = Depends(get_db),
    id: int,
    subject_in: SubjectUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a subject details in part.
    """
    subject = subject_service.get(db=db, id=id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    if subject.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
        
    subject = subject_service.update(db=db, db_obj=subject, obj_in=subject_in)
    return subject

@router.delete("/{id}", response_model=SubjectResponse)
def delete_subject(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a subject. This will cascade and delete associated Tasks due to SQLAlchemy relationships.
    """
    subject = subject_service.get(db=db, id=id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    if subject.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
        
    subject = subject_service.remove(db=db, id=id)
    return subject
