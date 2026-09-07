from pydantic import BaseModel
from typing import Optional
from .listing import ListingCardResponse

class WishlistToggleRequest(BaseModel):
    listing_id: int
    user_id: Optional[int] = None

class WishlistToggleResponse(BaseModel):
    listing_id: int
    is_wishlisted: bool
    message: str
