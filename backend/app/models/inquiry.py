from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.connection import Base

class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyer_name = Column(String(100), nullable=True)
    buyer_email = Column(String(100), nullable=True)
    buyer_phone = Column(String(50), nullable=True)
    message = Column(Text, nullable=False)
    offer_amount = Column(Float, nullable=True)
    status = Column(String(50), default="pending")  # 'pending', 'accepted', 'rejected', 'countered'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    listing = relationship("Listing", back_populates="inquiries")
    buyer = relationship("User", back_populates="inquiries")
