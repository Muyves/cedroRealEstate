from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from pydantic import BaseModel
from app.database.connection import get_db
from app.models.listing import Listing
from app.models.user import User
from app.models.inquiry import Inquiry
from app.schemas.user import UserResponse, AdminUserCreate, AdminPasswordResetRequest
from app.schemas.listing import ListingResponse
from app.schemas.inquiry import InquiryResponse
from app.core.security import get_password_hash
from app.api.deps import require_role

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

class RoleChangeRequest(BaseModel):
    role: str

class StatusChangeRequest(BaseModel):
    is_active: bool

class ListingStatusChangeRequest(BaseModel):
    status: str  # 'available', 'pending', 'sold'

class InquiryStatusChangeRequest(BaseModel):
    status: str

# 1. Platform KPIs & Analytics
@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    total_listings = db.query(Listing).count()
    total_land = db.query(Listing).filter(Listing.category == "land").count()
    total_buildings = db.query(Listing).filter(Listing.category == "building").count()
    
    available_listings = db.query(Listing).filter(Listing.status == "available").count()
    pending_listings = db.query(Listing).filter(Listing.status == "pending").count()
    sold_listings = db.query(Listing).filter(Listing.status == "sold").count()
    featured_count = db.query(Listing).filter(Listing.is_featured == True).count()
    
    total_value = db.query(func.sum(Listing.price)).scalar() or 0.0
    total_land_acres = db.query(func.sum(Listing.size_value)).filter(
        Listing.category == "land",
        Listing.size_unit == "acres"
    ).scalar() or 0.0

    total_users = db.query(User).count()
    buyer_count = db.query(User).filter(User.role == "buyer").count()
    seller_count = db.query(User).filter(User.role == "seller").count()
    admin_count = db.query(User).filter(User.role == "admin").count()
    active_users = db.query(User).filter(User.is_active == True).count()
    suspended_users = total_users - active_users

    total_inquiries = db.query(Inquiry).count()

    return {
        "listings": {
            "total": total_listings,
            "land_count": total_land,
            "building_count": total_buildings,
            "available": available_listings,
            "pending": pending_listings,
            "sold": sold_listings,
            "featured": featured_count,
            "total_value": float(total_value),
            "total_land_acres": round(float(total_land_acres), 2)
        },
        "users": {
            "total": total_users,
            "buyers": buyer_count,
            "sellers": seller_count,
            "admins": admin_count,
            "active": active_users,
            "suspended": suspended_users
        },
        "inquiries": {
            "total": total_inquiries
        }
    }

# 2. User Management Duties
@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    return db.query(User).order_by(desc(User.created_at)).all()

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_by_admin(
    user_in: AdminUserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Admin duty: Register new staff, agents, or admin team members."""
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    new_user = User(
        email=user_in.email.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role.lower(),
        phone=user_in.phone,
        avatar_url=f"https://api.dicebear.com/7.x/initials/svg?seed={user_in.full_name}",
        is_active=user_in.is_active
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.patch("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    body: RoleChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    target_role = body.role.lower()
    if target_role not in ["buyer", "seller", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'buyer', 'seller', or 'admin'")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.role = target_role
    db.commit()
    db.refresh(user)
    return user

@router.patch("/users/{user_id}/status", response_model=UserResponse)
def toggle_user_status(
    user_id: int,
    body: StatusChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Admin duty: Suspend or activate user accounts for security."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Administrator cannot suspend their own active account.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = body.is_active
    db.commit()
    db.refresh(user)
    return user

@router.post("/users/{user_id}/reset-password")
def admin_reset_password(
    user_id: int,
    body: AdminPasswordResetRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Admin duty: Reset credentials for locked-out or compromised users."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    user.hashed_password = get_password_hash(body.new_password)
    db.commit()
    return {"status": "success", "message": f"Password reset successfully for {user.email}"}

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Admin duty: Permanently delete an account."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Administrator cannot delete their own account.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return None

# 3. Listing Moderation Duties
@router.patch("/listings/{listing_id}/feature", response_model=ListingResponse)
def toggle_listing_featured(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    
    listing.is_featured = not listing.is_featured
    db.commit()
    db.refresh(listing)
    return listing

@router.patch("/listings/{listing_id}/status", response_model=ListingResponse)
def admin_update_listing_status(
    listing_id: int,
    body: ListingStatusChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Admin duty: Directly moderate listing status."""
    stat = body.status.lower()
    if stat not in ["available", "pending", "sold"]:
        raise HTTPException(status_code=400, detail="Status must be 'available', 'pending', or 'sold'")

    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    listing.status = stat
    db.commit()
    db.refresh(listing)
    return listing

# 4. Central Inquiries Oversight Duty
@router.get("/inquiries", response_model=List[InquiryResponse])
def get_all_inquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Admin duty: Monitor all client leads and inquiries across the platform."""
    return db.query(Inquiry).order_by(desc(Inquiry.created_at)).all()

@router.patch("/inquiries/{inquiry_id}/status", response_model=InquiryResponse)
def update_inquiry_status(
    inquiry_id: int,
    body: InquiryStatusChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Admin duty: Update resolution status of client inquiry."""
    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    inquiry.status = body.status.lower()
    db.commit()
    db.refresh(inquiry)
    return inquiry
