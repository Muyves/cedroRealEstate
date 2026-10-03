from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse
from app.schemas.listing import ListingResponse

class InquiryCreate(BaseModel):
    listing_id: int
    message: str
    offer_amount: Optional[float] = None
    buyer_name: Optional[str] = None
    buyer_email: Optional[EmailStr] = None
    buyer_phone: Optional[str] = None

class InquiryStatusUpdate(BaseModel):
    status: str  # 'pending', 'accepted', 'rejected', 'countered'

class InquiryResponse(BaseModel):
    id: int
    listing_id: int
    buyer_id: int
    buyer_name: Optional[str] = None
    buyer_email: Optional[str] = None
    buyer_phone: Optional[str] = None
    message: str
    offer_amount: Optional[float] = None
    status: str
    created_at: datetime
    listing: Optional[ListingResponse] = None
    buyer: Optional[UserResponse] = None

    class Config:
        from_attributes = True
