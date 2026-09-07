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
