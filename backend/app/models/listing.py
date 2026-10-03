from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.connection import Base

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)  # 'land' or 'building'
    property_type = Column(String(100), nullable=False, default="general")
    
    # Location fields
    location = Column(String(255), nullable=False, index=True)  # Full readable location string e.g. "Austin, TX"
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True, index=True)
    state = Column(String(100), nullable=True, index=True)
    zip_code = Column(String(20), nullable=True)
    
    # Size and measurements
    size_value = Column(Float, nullable=False)  # e.g., 2.5 or 3200
    size_unit = Column(String(20), nullable=False, default="acres")  # 'acres', 'sqft', 'hectares'
    
    # Financials and status
    price = Column(Float, nullable=False, index=True)
    status = Column(String(50), nullable=False, default="available", index=True)  # 'available', 'pending', 'sold'
    
    # Details for buildings / land
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Float, nullable=True)
    features = Column(JSON, default=list)  # List of strings e.g. ["Waterfront", "Electricity", "Zoned Commercial"]
    
    # Media URLs
    media_urls = Column(JSON, default=list)  # List of image/video URLs
    documents = Column(JSON, default=list)  # List of legal documents, title deeds, blueprints, surveys
    
    # Meta
    is_featured = Column(Boolean, default=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    seller = relationship("User", back_populates="listings")
    inquiries = relationship("Inquiry", back_populates="listing", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="listing", cascade="all, delete-orphan")
