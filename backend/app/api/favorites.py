from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.database.connection import get_db
from app.models.favorite import Favorite
from app.models.listing import Listing
from app.models.user import User
from app.schemas.listing import ListingResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.get("", response_model=List[ListingResponse])
def get_my_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    favs = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id)
        .order_by(desc(Favorite.created_at))
        .all()
    )
    results = []
    for f in favs:
        if f.listing:
            resp = ListingResponse.model_validate(f.listing)
            resp.is_favorited = True
            results.append(resp)
    return results

@router.post("/{listing_id}", status_code=status.HTTP_201_CREATED)
def toggle_favorite(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.listing_id == listing_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"favorited": False, "message": "Removed from favorites"}
    else:
        new_fav = Favorite(user_id=current_user.id, listing_id=listing_id)
        db.add(new_fav)
        db.commit()
        return {"favorited": True, "message": "Added to favorites"}

@router.delete("/{listing_id}", status_code=status.HTTP_200_OK)
def remove_favorite(
    listing_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.listing_id == listing_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
    return {"favorited": False, "message": "Removed from favorites"}
