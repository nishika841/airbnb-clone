import os

files = {}

files["app/schemas/__init__.py"] = ""

files["app/schemas/user.py"] = """
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    avatar_url: Optional[str] = None
    is_host: bool = False
    is_superhost: bool = False
    joined_date: Optional[str] = "Joined recently"

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
"""

files["app/schemas/listing.py"] = """
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from .user import UserResponse

class ListingImageSchema(BaseModel):
    id: Optional[int] = None
    url: str
    is_cover: bool = False
    display_order: int = 0

    class Config:
        from_attributes = True

class ListingBase(BaseModel):
    title: str
    description: str
    category: str
    property_type: str
    price_per_night: int
    cleaning_fee: int = 50
    service_fee: int = 40
    city: str
    country: str
    location: str
    latitude: float
    longitude: float
    max_guests: int = 2
    bedrooms: int = 1
    beds: int = 1
    baths: float = 1.0
    amenities: List[str] = []

class ListingCreate(ListingBase):
    images: List[str] = []  # List of image URLs
    host_id: Optional[int] = None

class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    property_type: Optional[str] = None
    price_per_night: Optional[int] = None
    cleaning_fee: Optional[int] = None
    service_fee: Optional[int] = None
    city: Optional[str] = None
    country: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    baths: Optional[float] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None

class ListingCardResponse(BaseModel):
    id: int
    title: str
    category: str
    property_type: str
    price_per_night: int
    city: str
    country: str
    location: str
    latitude: float
    longitude: float
    max_guests: int
    rating: float
    reviews_count: int
    cover_image: Optional[str] = None
    images: List[str] = []
    is_wishlisted: bool = False

    class Config:
        from_attributes = True

class ListingDetailResponse(BaseModel):
    id: int
    host_id: int
    title: str
    description: str
    category: str
    property_type: str
    price_per_night: int
    cleaning_fee: int
    service_fee: int
    city: str
    country: str
    location: str
    latitude: float
    longitude: float
    max_guests: int
    bedrooms: int
    beds: int
    baths: float
    amenities: List[str]
    rating: float
    reviews_count: int
    created_at: datetime
    images: List[ListingImageSchema]
    host: Optional[UserResponse] = None
    is_wishlisted: bool = False

    class Config:
        from_attributes = True

class ListingsListResponse(BaseModel):
    listings: List[ListingCardResponse]
    total: int
    page: int
    limit: int
    total_pages: int
"""

files["app/schemas/booking.py"] = """
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
"""

files["app/schemas/review.py"] = """
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from .user import UserResponse

class ReviewCreate(BaseModel):
    user_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5)
    cleanliness: int = Field(5, ge=1, le=5)
    accuracy: int = Field(5, ge=1, le=5)
    communication: int = Field(5, ge=1, le=5)
    location_rating: int = Field(5, ge=1, le=5)
    value_rating: int = Field(5, ge=1, le=5)
    comment: str

class ReviewResponse(BaseModel):
    id: int
    listing_id: int
    user_id: int
    rating: int
    cleanliness: int
    accuracy: int
    communication: int
    location_rating: int
    value_rating: int
    comment: str
    created_at: datetime
    user: Optional[UserResponse] = None

    class Config:
        from_attributes = True

class ReviewsSummaryResponse(BaseModel):
    average_rating: float
    total_reviews: int
    cleanliness_avg: float
    accuracy_avg: float
    communication_avg: float
    location_avg: float
    value_avg: float
    reviews: list[ReviewResponse]
"""

files["app/schemas/wishlist.py"] = """
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
"""

files["app/schemas/host.py"] = """
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
"""

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Wrote {path}")
