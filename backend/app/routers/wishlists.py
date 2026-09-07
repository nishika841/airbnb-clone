from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.wishlist import Wishlist
from ..models.listing import Listing
from ..models.user import User
from ..schemas.listing import ListingCardResponse
from ..schemas.wishlist import WishlistToggleRequest, WishlistToggleResponse
from .listings import format_listing_card

router = APIRouter(prefix="/api/wishlists", tags=["wishlists"])

@router.get("", response_model=List[ListingCardResponse])
def get_wishlists(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    if not user_id:
        guest = db.query(User).filter(User.email == "guest@example.com").first()
        user_id = guest.id if guest else 1

    entries = db.query(Wishlist).filter(Wishlist.user_id == user_id).all()
    result = []
    for w in entries:
        if w.listing:
            card = format_listing_card(w.listing, user_id=user_id, db=db)
            card.is_wishlisted = True
            result.append(card)
    return result

@router.post("/toggle", response_model=WishlistToggleResponse)
def toggle_wishlist(data: WishlistToggleRequest, db: Session = Depends(get_db)):
    user_id = data.user_id
    if not user_id:
        guest = db.query(User).filter(User.email == "guest@example.com").first()
        user_id = guest.id if guest else 1

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == user_id,
        Wishlist.listing_id == data.listing_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return WishlistToggleResponse(
            listing_id=data.listing_id,
            is_wishlisted=False,
            message="Removed from Wishlist"
        )
    else:
        new_item = Wishlist(user_id=user_id, listing_id=data.listing_id)
        db.add(new_item)
        db.commit()
        return WishlistToggleResponse(
            listing_id=data.listing_id,
            is_wishlisted=True,
            message="Added to Wishlist"
        )
