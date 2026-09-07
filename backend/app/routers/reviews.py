from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models.review import Review
from ..models.listing import Listing
from ..models.user import User
from ..schemas.review import ReviewCreate, ReviewResponse, ReviewsSummaryResponse
from ..schemas.user import UserResponse

router = APIRouter(prefix="/api/reviews", tags=["reviews"])

@router.get("/listing/{listing_id}", response_model=ReviewsSummaryResponse)
def get_listing_reviews(listing_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(
        Review.listing_id == listing_id
    ).order_by(desc(Review.created_at)).all()

    total = len(reviews)
    if total == 0:
        return ReviewsSummaryResponse(
            average_rating=5.0,
            total_reviews=0,
            cleanliness_avg=5.0,
            accuracy_avg=5.0,
            communication_avg=5.0,
            location_avg=5.0,
            value_avg=5.0,
            reviews=[]
        )

    avg_clean = sum(r.cleanliness for r in reviews) / total
    avg_acc = sum(r.accuracy for r in reviews) / total
    avg_comm = sum(r.communication for r in reviews) / total
    avg_loc = sum(r.location_rating for r in reviews) / total
    avg_val = sum(r.value_rating for r in reviews) / total
    avg_overall = sum(r.rating for r in reviews) / total

    items = []
    for r in reviews:
        user_data = None
        if r.user:
            user_data = UserResponse(
                id=r.user.id,
                name=r.user.name,
                email=r.user.email,
                avatar_url=r.user.avatar_url,
                is_host=r.user.is_host,
                is_superhost=r.user.is_superhost,
                joined_date=r.user.joined_date,
                created_at=r.user.created_at
            )
        items.append(ReviewResponse(
            id=r.id,
            listing_id=r.listing_id,
            user_id=r.user_id,
            rating=r.rating,
            cleanliness=r.cleanliness,
            accuracy=r.accuracy,
            communication=r.communication,
            location_rating=r.location_rating,
            value_rating=r.value_rating,
            comment=r.comment,
            created_at=r.created_at,
            user=user_data
        ))

    return ReviewsSummaryResponse(
        average_rating=round(avg_overall, 2),
        total_reviews=total,
        cleanliness_avg=round(avg_clean, 1),
        accuracy_avg=round(avg_acc, 1),
        communication_avg=round(avg_comm, 1),
        location_avg=round(avg_loc, 1),
        value_avg=round(avg_val, 1),
        reviews=items
    )

@router.post("/listing/{listing_id}", response_model=ReviewResponse)
def add_review(listing_id: int, data: ReviewCreate, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    user_id = data.user_id
    if not user_id:
        guest = db.query(User).filter(User.email == "guest@example.com").first()
        user_id = guest.id if guest else 1

    review = Review(
        listing_id=listing_id,
        user_id=user_id,
        rating=data.rating,
        cleanliness=data.cleanliness,
        accuracy=data.accuracy,
        communication=data.communication,
        location_rating=data.location_rating,
        value_rating=data.value_rating,
        comment=data.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate listing rating
    all_reviews = db.query(Review).filter(Review.listing_id == listing_id).all()
    listing.reviews_count = len(all_reviews)
    listing.rating = round(sum(r.rating for r in all_reviews) / len(all_reviews), 2)
    db.commit()

    user_data = None
    if review.user:
        user_data = UserResponse(
            id=review.user.id,
            name=review.user.name,
            email=review.user.email,
            avatar_url=review.user.avatar_url,
            is_host=review.user.is_host,
            is_superhost=review.user.is_superhost,
            joined_date=review.user.joined_date,
            created_at=review.user.created_at
        )

    return ReviewResponse(
        id=review.id,
        listing_id=review.listing_id,
        user_id=review.user_id,
        rating=review.rating,
        cleanliness=review.cleanliness,
        accuracy=review.accuracy,
        communication=review.communication,
        location_rating=review.location_rating,
        value_rating=review.value_rating,
        comment=review.comment,
        created_at=review.created_at,
        user=user_data
    )
