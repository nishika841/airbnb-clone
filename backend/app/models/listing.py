import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    property_type = Column(String(50), nullable=False)
    price_per_night = Column(Integer, nullable=False)
    cleaning_fee = Column(Integer, default=50)
    service_fee = Column(Integer, default=40)
    city = Column(String(100), nullable=False, index=True)
    country = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    max_guests = Column(Integer, nullable=False, default=2)
    bedrooms = Column(Integer, nullable=False, default=1)
    beds = Column(Integer, nullable=False, default=1)
    baths = Column(Float, nullable=False, default=1.0)
    amenities = Column(Text, default="[]")
    rating = Column(Float, default=4.95)
    reviews_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    host = relationship("User", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.display_order")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan", order_by="desc(Review.created_at)")
    wishlists = relationship("Wishlist", back_populates="listing", cascade="all, delete-orphan")

    def get_amenities_list(self):
        try:
            return json.loads(self.amenities)
        except Exception:
            return []

    def set_amenities_list(self, amenities_list):
        self.amenities = json.dumps(amenities_list)
