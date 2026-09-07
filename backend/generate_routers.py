import os

files = {}

files["app/routers/__init__.py"] = ""

files["app/routers/listings.py"] = """
import json
from datetime import date
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc

from ..database import get_db
from ..models.listing import Listing
from ..models.listing_image import ListingImage
from ..models.booking import Booking
from ..models.user import User
from ..models.wishlist import Wishlist
from ..schemas.listing import (
    ListingCardResponse,
    ListingDetailResponse,
    ListingsListResponse,
    ListingCreate,
    ListingUpdate,
    ListingImageSchema
)
from ..schemas.user import UserResponse

router = APIRouter(prefix="/api/listings", tags=["listings"])

def format_listing_card(listing: Listing, user_id: Optional[int] = None, db: Optional[Session] = None) -> ListingCardResponse:
    images = [img.url for img in sorted(listing.images, key=lambda x: x.display_order)]
    cover = images[0] if images else "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    
    is_wishlisted = False
    if user_id and db:
        is_wishlisted = db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.listing_id == listing.id
        ).first() is not None

    return ListingCardResponse(
        id=listing.id,
        title=listing.title,
        category=listing.category,
        property_type=listing.property_type,
        price_per_night=listing.price_per_night,
        city=listing.city,
        country=listing.country,
        location=listing.location,
        latitude=listing.latitude,
        longitude=listing.longitude,
        max_guests=listing.max_guests,
        rating=listing.rating,
        reviews_count=listing.reviews_count,
        cover_image=cover,
        images=images,
        is_wishlisted=is_wishlisted
    )

@router.get("", response_model=ListingsListResponse)
def get_listings(
    category: Optional[str] = None,
    search: Optional[str] = None,
    city: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    guests: Optional[int] = None,
    property_type: Optional[str] = None,
    amenities: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    user_id: Optional[int] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(16, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Listing)

    if category and category.lower() != "all":
        query = query.filter(Listing.category.ilike(f"%{category}%"))

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Listing.title.ilike(search_pattern),
                Listing.city.ilike(search_pattern),
                Listing.country.ilike(search_pattern),
                Listing.location.ilike(search_pattern),
                Listing.description.ilike(search_pattern)
            )
        )

    if city:
        query = query.filter(Listing.city.ilike(f"%{city}%"))

    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)

    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)

    if guests is not None:
        query = query.filter(Listing.max_guests >= guests)

    if property_type and property_type.lower() != "any":
        query = query.filter(Listing.property_type.ilike(f"%{property_type}%"))

    # Date range availability filter: exclude listings with overlapping confirmed bookings
    if start_date and end_date:
        if end_date > start_date:
            overlapping_subquery = db.query(Booking.listing_id).filter(
                Booking.status == "confirmed",
                Booking.start_date < end_date,
                Booking.end_date > start_date
            ).subquery()
            query = query.filter(~Listing.id.in_(overlapping_subquery))

    listings = query.order_by(desc(Listing.created_at)).all()

    # Filter amenities in Python if provided
    if amenities:
        req_amenities = [a.strip().lower() for a in amenities.split(",") if a.strip()]
        filtered = []
        for l in listings:
            l_amenities = [a.lower() for a in l.get_amenities_list()]
            if all(req in l_amenities for req in req_amenities):
                filtered.append(l)
        listings = filtered

    total = len(listings)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_listings = listings[start_idx:end_idx]

    cards = [format_listing_card(l, user_id=user_id, db=db) for l in paginated_listings]
    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return ListingsListResponse(
        listings=cards,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/{id}", response_model=ListingDetailResponse)
def get_listing(id: int, user_id: Optional[int] = None, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    is_wishlisted = False
    if user_id:
        is_wishlisted = db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.listing_id == listing.id
        ).first() is not None

    images_schema = [
        ListingImageSchema(
            id=img.id,
            url=img.url,
            is_cover=img.is_cover,
            display_order=img.display_order
        ) for img in sorted(listing.images, key=lambda x: x.display_order)
    ]

    host_data = None
    if listing.host:
        host_data = UserResponse(
            id=listing.host.id,
            name=listing.host.name,
            email=listing.host.email,
            avatar_url=listing.host.avatar_url,
            is_host=listing.host.is_host,
            is_superhost=listing.host.is_superhost,
            joined_date=listing.host.joined_date,
            created_at=listing.host.created_at
        )

    return ListingDetailResponse(
        id=listing.id,
        host_id=listing.host_id,
        title=listing.title,
        description=listing.description,
        category=listing.category,
        property_type=listing.property_type,
        price_per_night=listing.price_per_night,
        cleaning_fee=listing.cleaning_fee,
        service_fee=listing.service_fee,
        city=listing.city,
        country=listing.country,
        location=listing.location,
        latitude=listing.latitude,
        longitude=listing.longitude,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        baths=listing.baths,
        amenities=listing.get_amenities_list(),
        rating=listing.rating,
        reviews_count=listing.reviews_count,
        created_at=listing.created_at,
        images=images_schema,
        host=host_data,
        is_wishlisted=is_wishlisted
    )

@router.post("", response_model=ListingDetailResponse)
def create_listing(data: ListingCreate, db: Session = Depends(get_db)):
    host_id = data.host_id
    if not host_id:
        host = db.query(User).filter(User.is_host == True).first()
        if not host:
            host = User(name="Elena Rostova", email="host@example.com", is_host=True, is_superhost=True)
            db.add(host)
            db.commit()
            db.refresh(host)
        host_id = host.id

    listing = Listing(
        host_id=host_id,
        title=data.title,
        description=data.description,
        category=data.category,
        property_type=data.property_type,
        price_per_night=data.price_per_night,
        cleaning_fee=data.cleaning_fee,
        service_fee=data.service_fee,
        city=data.city,
        country=data.country,
        location=data.location,
        latitude=data.latitude,
        longitude=data.longitude,
        max_guests=data.max_guests,
        bedrooms=data.bedrooms,
        beds=data.beds,
        baths=data.baths,
        rating=5.0,
        reviews_count=0
    )
    listing.set_amenities_list(data.amenities)
    db.add(listing)
    db.commit()
    db.refresh(listing)

    # Add images
    images_to_add = data.images if data.images else [
        "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
    ]
    for idx, url in enumerate(images_to_add):
        img = ListingImage(
            listing_id=listing.id,
            url=url,
            is_cover=(idx == 0),
            display_order=idx
        )
        db.add(img)
    db.commit()
    db.refresh(listing)

    return get_listing(listing.id, db=db)

@router.put("/{id}", response_model=ListingDetailResponse)
def update_listing(id: int, data: ListingUpdate, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    update_dict = data.dict(exclude_unset=True)
    if "amenities" in update_dict and update_dict["amenities"] is not None:
        listing.set_amenities_list(update_dict.pop("amenities"))

    if "images" in update_dict and update_dict["images"] is not None:
        new_imgs = update_dict.pop("images")
        db.query(ListingImage).filter(ListingImage.listing_id == listing.id).delete()
        for idx, url in enumerate(new_imgs):
            db.add(ListingImage(listing_id=listing.id, url=url, is_cover=(idx == 0), display_order=idx))

    for key, value in update_dict.items():
        if hasattr(listing, key) and value is not None:
            setattr(listing, key, value)

    db.commit()
    db.refresh(listing)
    return get_listing(listing.id, db=db)

@router.delete("/{id}")
def delete_listing(id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted successfully", "id": id}
"""

files["app/routers/bookings.py"] = """
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models.booking import Booking
from ..models.listing import Listing
from ..models.user import User
from ..schemas.booking import BookingCreate, BookingResponse, BookedDateRange
from .listings import format_listing_card

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

@router.post("", response_model=BookingResponse)
def create_booking(data: BookingCreate, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if data.start_date >= data.end_date:
        raise HTTPException(status_code=400, detail="Checkout date must be after check-in date.")

    if data.guests_count > listing.max_guests:
        raise HTTPException(status_code=400, detail=f"Maximum allowed guests for this property is {listing.max_guests}.")

    # Check for date overlapping with existing confirmed bookings
    # Overlap formula: existing_start < new_end and existing_end > new_start
    conflict = db.query(Booking).filter(
        Booking.listing_id == data.listing_id,
        Booking.status == "confirmed",
        Booking.start_date < data.end_date,
        Booking.end_date > data.start_date
    ).first()

    if conflict:
        raise HTTPException(
            status_code=400,
            detail=f"Selected dates ({data.start_date} to {data.end_date}) are already booked. Please choose different dates."
        )

    # Get or create demo guest
    user_id = data.user_id
    if not user_id:
        guest = db.query(User).filter(User.email == "guest@example.com").first()
        if not guest:
            guest = User(name="Alex Rivera", email="guest@example.com", avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80")
            db.add(guest)
            db.commit()
            db.refresh(guest)
        user_id = guest.id

    nights = (data.end_date - data.start_date).days
    nightly_price = listing.price_per_night
    total_price = (nights * nightly_price) + listing.cleaning_fee + listing.service_fee

    booking = Booking(
        listing_id=listing.id,
        user_id=user_id,
        start_date=data.start_date,
        end_date=data.end_date,
        guests_count=data.guests_count,
        nightly_price=nightly_price,
        total_price=total_price,
        status="confirmed"
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    card = format_listing_card(listing, user_id=user_id, db=db)
    return BookingResponse(
        id=booking.id,
        listing_id=booking.listing_id,
        user_id=booking.user_id,
        start_date=booking.start_date,
        end_date=booking.end_date,
        guests_count=booking.guests_count,
        nightly_price=booking.nightly_price,
        total_price=booking.total_price,
        status=booking.status,
        created_at=booking.created_at,
        listing=card
    )

@router.get("/my", response_model=List[BookingResponse])
def get_my_trips(user_id: Optional[int] = None, db: Session = Depends(get_db)):
    if not user_id:
        guest = db.query(User).filter(User.email == "guest@example.com").first()
        user_id = guest.id if guest else 1

    bookings = db.query(Booking).filter(
        Booking.user_id == user_id
    ).order_by(desc(Booking.created_at)).all()

    result = []
    for b in bookings:
        card = format_listing_card(b.listing, user_id=user_id, db=db) if b.listing else None
        result.append(BookingResponse(
            id=b.id,
            listing_id=b.listing_id,
            user_id=b.user_id,
            start_date=b.start_date,
            end_date=b.end_date,
            guests_count=b.guests_count,
            nightly_price=b.nightly_price,
            total_price=b.total_price,
            status=b.status,
            created_at=b.created_at,
            listing=card
        ))
    return result

@router.get("/listing/{listing_id}/booked-dates", response_model=List[BookedDateRange])
def get_booked_dates(listing_id: int, db: Session = Depends(get_db)):
    bookings = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == "confirmed"
    ).all()
    return [BookedDateRange(start_date=b.start_date, end_date=b.end_date) for b in bookings]

@router.delete("/{id}")
def cancel_booking(id: int, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.id == id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = "cancelled"
    db.commit()
    return {"message": "Booking cancelled successfully", "id": id}
"""

files["app/routers/reviews.py"] = """
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
"""

files["app/routers/wishlists.py"] = """
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
"""

files["app/routers/host.py"] = """
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc

from ..database import get_db
from ..models.listing import Listing
from ..models.booking import Booking
from ..models.user import User
from ..schemas.host import HostDashboardResponse, HostDashboardStats
from ..schemas.booking import BookingResponse
from .listings import format_listing_card

router = APIRouter(prefix="/api/host", tags=["host"])

@router.get("/dashboard", response_model=HostDashboardResponse)
def get_host_dashboard(host_id: Optional[int] = None, db: Session = Depends(get_db)):
    if not host_id:
        host = db.query(User).filter(User.is_host == True).first()
        host_id = host.id if host else 2

    listings = db.query(Listing).filter(Listing.host_id == host_id).order_by(desc(Listing.created_at)).all()
    listing_ids = [l.id for l in listings]

    bookings = db.query(Booking).filter(
        Booking.listing_id.in_(listing_ids)
    ).order_by(desc(Booking.created_at)).all() if listing_ids else []

    total_revenue = sum(b.total_price for b in bookings if b.status == "confirmed")
    avg_rating = round(sum(l.rating for l in listings) / len(listings), 2) if listings else 5.0

    stats = HostDashboardStats(
        total_listings=len(listings),
        total_bookings=len(bookings),
        total_revenue=total_revenue,
        average_rating=avg_rating
    )

    formatted_listings = [format_listing_card(l, user_id=host_id, db=db) for l in listings]
    
    formatted_bookings = []
    for b in bookings[:20]:
        card = format_listing_card(b.listing, user_id=host_id, db=db) if b.listing else None
        formatted_bookings.append(BookingResponse(
            id=b.id,
            listing_id=b.listing_id,
            user_id=b.user_id,
            start_date=b.start_date,
            end_date=b.end_date,
            guests_count=b.guests_count,
            nightly_price=b.nightly_price,
            total_price=b.total_price,
            status=b.status,
            created_at=b.created_at,
            listing=card
        ))

    return HostDashboardResponse(
        stats=stats,
        listings=formatted_listings,
        recent_bookings=formatted_bookings
    )
"""

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Wrote {path}")
