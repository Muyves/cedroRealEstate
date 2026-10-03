from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "buyer"  # 'buyer', 'seller', 'admin'
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class AdminUserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "buyer"
    phone: Optional[str] = None
    is_active: bool = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

class AdminPasswordResetRequest(BaseModel):
    new_password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
