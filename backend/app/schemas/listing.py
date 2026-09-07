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
