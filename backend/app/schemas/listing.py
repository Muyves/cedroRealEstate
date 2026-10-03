from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from app.schemas.user import UserResponse

class ListingBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str
    category: str = Field(..., description="'land' or 'building'")
    property_type: str = "general"  # residential_land, agricultural, single_family, commercial, etc.
    location: str = Field(..., min_length=2, max_length=255)
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    size_value: float = Field(..., gt=0)
    size_unit: str = "acres"  # 'acres', 'sqft', 'hectares'
    price: float = Field(..., gt=0)
    status: str = "available"  # 'available', 'pending', 'sold'
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    features: List[str] = []
    media_urls: List[str] = []
    documents: List[Any] = []  # List of { name, url, size, type, doc_category }
    is_featured: bool = False

class ListingCreate(ListingBase):
    pass

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    property_type: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    size_value: Optional[float] = None
    size_unit: Optional[str] = None
    price: Optional[float] = None
    status: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    features: Optional[List[str]] = None
    media_urls: Optional[List[str]] = None
    documents: Optional[List[Any]] = None
    is_featured: Optional[bool] = None

class ListingStatusUpdate(BaseModel):
    status: str  # 'available', 'pending', 'sold'

class ListingResponse(ListingBase):
    id: int
    seller_id: int
    created_at: datetime
    updated_at: datetime
    seller: Optional[UserResponse] = None
    is_favorited: Optional[bool] = False

    class Config:
        from_attributes = True

class ListingFilterParams(BaseModel):
    category: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    location: Optional[str] = None
    status: Optional[str] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "newest"  # 'newest', 'price_asc', 'price_desc', 'size_asc', 'size_desc'
