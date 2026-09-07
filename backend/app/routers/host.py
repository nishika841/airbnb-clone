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
