from app.api.deps import get_db
from app.models.user import User
from app.models.subject import Subject
from app.models.task import Task
from app.models.study_session import StudySession
from app.core.security import verify_password

def check_user():
    db = next(get_db())
    email = 'test1@demo.com'
    password = '12345678'
    
    user = db.query(User).filter(User.email == email).first()
    
    print("\n" + "="*30)
    print(f"CHECKING ACCOUNT: {email}")
    print("="*30)
    
    if not user:
        print("RESULT: User NOT FOUND in database.")
        return

    is_correct = verify_password(password, user.password_hash)
    print(f"1. Password Correct: {is_correct}")
    
    subjects = db.query(Subject).filter(Subject.user_id == user.id).all()
    print(f"2. Subjects Count: {len(subjects)}")
    for s in subjects:
        print(f"   - {s.name} ({s.semester})")
        
    tasks = db.query(Task).filter(Task.user_id == user.id).all()
    print(f"3. Tasks Count: {len(tasks)}")
    
    sessions = db.query(StudySession).join(Task).filter(Task.user_id == user.id).all()
    print(f"4. Study Sessions Count: {len(sessions)}")
    print("="*30 + "\n")

if __name__ == "__main__":
    check_user()
