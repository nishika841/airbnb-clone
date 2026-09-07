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
