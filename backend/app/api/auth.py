from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, PasswordChangeRequest
from app.core.security import verify_password, get_password_hash, create_access_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user with email already exists
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    # Limit role selection upon public registration to buyer or seller (admin cannot be registered publicly)
    role = user_in.role.lower()
    if role not in ["buyer", "seller"]:
        role = "buyer"

    new_user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=role,
        phone=user_in.phone,
        avatar_url=user_in.avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={user_in.full_name}",
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": str(new_user.id), "role": new_user.role, "email": new_user.email})
    return {"access_token": token, "token_type": "bearer", "user": new_user}

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    email_clean = credentials.email.strip()
    user = db.query(User).filter(User.email.ilike(email_clean)).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check active status for user security
    if hasattr(user, "is_active") and user.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been suspended by the platform administrator for security reasons."
        )

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
def change_password(
    data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password does not match.")
    
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters long.")

    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return {"status": "success", "message": "Password changed successfully."}

@router.post("/demo/{role}", response_model=Token)
def demo_login(role: str, db: Session = Depends(get_db)):
    role = role.lower()
    if role not in ["buyer", "seller", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role for demo login")
    
    target_email = "Cedro@gmail.com" if role == "admin" else f"{role}@cedro.com"
    user = db.query(User).filter(User.email.ilike(target_email)).first()
    if not user:
        # Fallback to any user with this role
        user = db.query(User).filter(User.role == role).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"Demo user for role '{role}' not found. Please seed database.")

    if hasattr(user, "is_active") and user.is_active is False:
        raise HTTPException(status_code=403, detail="This account has been suspended.")

    token = create_access_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return {"access_token": token, "token_type": "bearer", "user": user}
