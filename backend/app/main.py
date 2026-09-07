from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .config import CORS_ORIGINS
from .models import User, Listing, ListingImage, Booking, Review, Wishlist
from .routers import listings, bookings, reviews, wishlists, host
from .schemas.user import UserResponse

# Create SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Airbnb Clone API",
    description="Backend API for Airbnb web application clone",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(reviews.router)
app.include_router(wishlists.router)
app.include_router(host.router)

@app.get("/")
def root():
    return {
        "name": "Airbnb Clone API",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/users", response_model=list[UserResponse])
def get_demo_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users
