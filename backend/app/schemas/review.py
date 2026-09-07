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
