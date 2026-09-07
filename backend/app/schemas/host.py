from pydantic import BaseModel
from typing import List
from .listing import ListingCardResponse
from .booking import BookingResponse

class HostDashboardStats(BaseModel):
    total_listings: int
    total_bookings: int
    total_revenue: int
    average_rating: float

class HostDashboardResponse(BaseModel):
    stats: HostDashboardStats
    listings: List[ListingCardResponse]
    recent_bookings: List[BookingResponse]
