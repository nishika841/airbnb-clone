from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from .listing import ListingCardResponse

class BookingCreate(BaseModel):
    listing_id: int
    user_id: Optional[int] = None
    start_date: date
    end_date: date
    guests_count: int = 1

class BookedDateRange(BaseModel):
    start_date: date
    end_date: date

class BookingResponse(BaseModel):
    id: int
    listing_id: int
    user_id: int
    start_date: date
    end_date: date
    guests_count: int
    nightly_price: int
    total_price: int
    status: str
    created_at: datetime
    listing: Optional[ListingCardResponse] = None

    class Config:
        from_attributes = True
