from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskStatus, TaskCalendarResponse
from app.services.task import task_service

router = APIRouter()

@router.get("/", response_model=List[TaskResponse])
def read_tasks(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[TaskStatus] = None,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve tasks.
    """
    tasks = task_service.get_multi_by_owner(
        db=db, user_id=current_user.id, skip=skip, limit=limit, status=status
    )
    # The response_model TaskResponse expects 'is_overdue'.
    for task in tasks:
        task.is_overdue = task_service.is_overdue(task)
    return tasks

@router.get("/calendar", response_model=List[TaskCalendarResponse])
def get_calendar(
    start_date: datetime = Query(...),
    end_date: datetime = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get tasks for calendar view.
    """
    # Use user's saved timezone or default to UTC
    user_tz = current_user.timezone or "UTC"
    
    tasks = task_service.get_tasks_for_calendar(
        db=db, 
        user_id=current_user.id, 
        start_date=start_date, 
        end_date=end_date,
        user_timezone=user_tz
    )
    
    responses = []
    for task in tasks:
        responses.append(
            TaskCalendarResponse(
                id=task.id,
                title=task.title,
                due_date=task.due_date,
                status=task.status,
                priority=task.priority,
                subject_name=task.subject.name if task.subject else None,
                subject_color=task.subject.color if task.subject else None,
                is_overdue=task_service.is_overdue(task)
            )
        )
    return responses

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    *,
    db: Session = Depends(get_db),
    task_in: TaskCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new task.
    """
    # Force the user_id from the login token
    if task_in.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to create a task for another user")
        
    task = task_service.create_with_owner(db=db, obj_in=task_in, user_id=current_user.id)
    task.is_overdue = task_service.is_overdue(task)
    return task

@router.get("/{id}", response_model=TaskResponse)
def read_task(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get task by ID.
    """
    task = task_service.get(db=db, id=id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    task.is_overdue = task_service.is_overdue(task)
    return task

@router.patch("/{id}", response_model=TaskResponse)
def update_task(
    *,
    db: Session = Depends(get_db),
    id: int,
    task_in: TaskUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a task.
    """
    task = task_service.get(db=db, id=id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    task = task_service.update(db=db, db_obj=task, obj_in=task_in)
    task.is_overdue = task_service.is_overdue(task)
    return task

@router.delete("/{id}", response_model=TaskResponse)
def delete_task(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a task.
    """
    task = task_service.get(db=db, id=id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    task = task_service.remove(db=db, id=id)
    task.is_overdue = task_service.is_overdue(task)
    return task
