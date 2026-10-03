from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional, List
from app.database.connection import get_db
from app.models.listing import Listing
from app.models.user import User
from app.models.favorite import Favorite
from app.schemas.listing import ListingCreate, ListingUpdate, ListingResponse, ListingStatusUpdate
from app.api.deps import get_current_user, get_optional_current_user, require_role

router = APIRouter(prefix="/listings", tags=["Listings"])

@router.get("", response_model=List[ListingResponse])
def get_listings(
    category: Optional[str] = Query(None, description="'land' or 'building'"),
    min_price: Optional[float] = Query(None, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, description="Maximum price filter"),
    location: Optional[str] = Query(None, description="Filter by location/city/state"),
    status: Optional[str] = Query(None, description="'available', 'pending', 'sold'"),
    property_type: Optional[str] = Query(None, description="Specific property sub-type"),
    search: Optional[str] = Query(None, description="Keyword search across title, description, and location"),
    featured_only: Optional[bool] = Query(False, description="Filter for featured listings"),
    sort_by: Optional[str] = Query("newest", description="'newest', 'price_asc', 'price_desc', 'size_asc', 'size_desc'"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    query = db.query(Listing)

    # Filter by category ('land' or 'building')
    if category and category.lower() != "all":
        query = query.filter(Listing.category == category.lower())

    # Filter by price range
    if min_price is not None:
        query = query.filter(Listing.price >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price <= max_price)

    # Filter by location (case-insensitive substring match)
    if location and location.strip():
        loc_term = f"%{location.strip()}%"
        query = query.filter(
            or_(
                Listing.location.ilike(loc_term),
                Listing.city.ilike(loc_term),
                Listing.state.ilike(loc_term),
                Listing.address.ilike(loc_term)
            )
        )

    # Filter by status
    if status and status.lower() != "all":
        query = query.filter(Listing.status == status.lower())

    # Filter by property type
    if property_type and property_type.lower() != "all":
        query = query.filter(Listing.property_type == property_type.lower())

    # Featured filter
    if featured_only:
        query = query.filter(Listing.is_featured == True)

    # General search keyword
    if search and search.strip():
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Listing.title.ilike(search_term),
                Listing.description.ilike(search_term),
                Listing.location.ilike(search_term)
            )
        )

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(asc(Listing.price))
    elif sort_by == "price_desc":
        query = query.order_by(desc(Listing.price))
    elif sort_by == "size_asc":
        query = query.order_by(asc(Listing.size_value))
    elif sort_by == "size_desc":
        query = query.order_by(desc(Listing.size_value))
    else:  # newest
        query = query.order_by(desc(Listing.created_at))

    listings = query.all()

    # Determine favorites if user is authenticated
    favorited_ids = set()
    if current_user:
        user_favorites = db.query(Favorite.listing_id).filter(Favorite.user_id == current_user.id).all()
        favorited_ids = {f[0] for f in user_favorites}

    results = []
    for item in listings:
        resp = ListingResponse.model_validate(item)
        resp.is_favorited = item.id in favorited_ids
        results.append(resp)

    return results

@router.get("/seller/my-listings", response_model=List[ListingResponse])
def get_my_listings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["seller", "admin"]))
):
    """Return all listings created by the authenticated seller (or all if admin)."""
    query = db.query(Listing)
    if current_user.role != "admin":
        query = query.filter(Listing.seller_id == current_user.id)
    listings = query.order_by(desc(Listing.created_at)).all()
    return listings

@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    resp = ListingResponse.model_validate(listing)
    if current_user:
        is_fav = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.listing_id == listing.id).first()
        resp.is_favorited = is_fav is not None
    else:
        resp.is_favorited = False
    return resp

@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    listing_in: ListingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["seller", "admin"]))
):
    # Normalize category
    category = listing_in.category.lower()
    if category not in ["land", "building"]:
        raise HTTPException(status_code=400, detail="Category must be 'land' or 'building'")

    status_val = listing_in.status.lower() if listing_in.status else "available"
    if status_val not in ["available", "pending", "sold"]:
        status_val = "available"

    # Auto parse city/state if location provided and city/state not provided
    city = listing_in.city
    state = listing_in.state
    if (not city or not state) and "," in listing_in.location:
        parts = [p.strip() for p in listing_in.location.split(",")]
        if not city and len(parts) >= 1:
            city = parts[0]
        if not state and len(parts) >= 2:
            state = parts[1]

    new_listing = Listing(
        title=listing_in.title,
        description=listing_in.description,
        category=category,
        property_type=listing_in.property_type,
        location=listing_in.location,
        address=listing_in.address,
        city=city,
        state=state,
        zip_code=listing_in.zip_code,
        size_value=listing_in.size_value,
        size_unit=listing_in.size_unit,
        price=listing_in.price,
        status=status_val,
        bedrooms=listing_in.bedrooms,
        bathrooms=listing_in.bathrooms,
        features=listing_in.features or [],
        media_urls=listing_in.media_urls or [],
        documents=listing_in.documents or [],
        is_featured=listing_in.is_featured,
        seller_id=current_user.id
    )
    db.add(new_listing)
    db.commit()
    db.refresh(new_listing)
    return new_listing

@router.put("/{listing_id}", response_model=ListingResponse)
def update_listing(
    listing_id: int,
    listing_in: ListingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["seller", "admin"]))
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Only listing owner or admin can update
    if current_user.role != "admin" and listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this listing")

    update_data = listing_in.model_dump(exclude_unset=True)
    if "category" in update_data and update_data["category"]:
        cat = update_data["category"].lower()
        if cat not in ["land", "building"]:
            raise HTTPException(status_code=400, detail="Category must be 'land' or 'building'")
        update_data["category"] = cat

    if "status" in update_data and update_data["status"]:
        stat = update_data["status"].lower()
        if stat not in ["available", "pending", "sold"]:
            raise HTTPException(status_code=400, detail="Status must be 'available', 'pending', or 'sold'")
        update_data["status"] = stat

    for field, value in update_data.items():
        setattr(listing, field, value)

    db.commit()
    db.refresh(listing)
    return listing

@router.patch("/{listing_id}/status", response_model=ListingResponse)
def update_listing_status(
    listing_id: int,
    status_in: ListingStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["seller", "admin"]))
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if current_user.role != "admin" and listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update status of this listing")

    target_status = status_in.status.lower()
    if target_status not in ["available", "pending", "sold"]:
        raise HTTPException(status_code=400, detail="Status must be 'available', 'pending', or 'sold'")

    listing.status = target_status
    db.commit()
    db.refresh(listing)
    return listing

@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["seller", "admin"]))
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if current_user.role != "admin" and listing.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this listing")

    db.delete(listing)
    db.commit()
    return None
