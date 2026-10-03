from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.database.connection import get_db
from app.models.inquiry import Inquiry
from app.models.listing import Listing
from app.models.user import User
from app.schemas.inquiry import InquiryCreate, InquiryResponse, InquiryStatusUpdate
from app.api.deps import get_current_user, require_role

router = APIRouter(prefix="/inquiries", tags=["Inquiries"])

@router.post("", response_model=InquiryResponse, status_code=status.HTTP_201_CREATED)
def create_inquiry(
    inquiry_in: InquiryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(Listing).filter(Listing.id == inquiry_in.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    new_inquiry = Inquiry(
        listing_id=listing.id,
        buyer_id=current_user.id,
        buyer_name=inquiry_in.buyer_name or current_user.full_name,
        buyer_email=inquiry_in.buyer_email or current_user.email,
        buyer_phone=inquiry_in.buyer_phone or current_user.phone,
        message=inquiry_in.message,
        offer_amount=inquiry_in.offer_amount,
        status="pending"
    )
    db.add(new_inquiry)
    db.commit()
    db.refresh(new_inquiry)
    return new_inquiry

@router.get("/received", response_model=List[InquiryResponse])
def get_received_inquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["seller", "admin"]))
):
    """Inquiries received for seller's listings (or all if admin)."""
    if current_user.role == "admin":
        inquiries = db.query(Inquiry).order_by(desc(Inquiry.created_at)).all()
    else:
        inquiries = (
            db.query(Inquiry)
            .join(Listing, Inquiry.listing_id == Listing.id)
            .filter(Listing.seller_id == current_user.id)
            .order_by(desc(Inquiry.created_at))
            .all()
        )
    return inquiries

@router.get("/sent", response_model=List[InquiryResponse])
def get_sent_inquiries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Inquiries sent by the authenticated buyer."""
    inquiries = (
        db.query(Inquiry)
        .filter(Inquiry.buyer_id == current_user.id)
        .order_by(desc(Inquiry.created_at))
        .all()
    )
    return inquiries

@router.patch("/{inquiry_id}/status", response_model=InquiryResponse)
def update_inquiry_status(
    inquiry_id: int,
    status_in: InquiryStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["seller", "admin"]))
):
    inquiry = db.query(Inquiry).filter(Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    listing = db.query(Listing).filter(Listing.id == inquiry.listing_id).first()
    if current_user.role != "admin" and listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this inquiry")

    inquiry.status = status_in.status.lower()
    db.commit()
    db.refresh(inquiry)
    return inquiry
