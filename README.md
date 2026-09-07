# Airbnb Web Application Clone (Fullstack SDE Assignment)

A production-grade, highly faithful web clone of [Airbnb](https://www.airbnb.com) replicating Airbnb's iconic design, user experience, and core browse, search, booking, and host workflows.

Built with **Next.js 16 (TypeScript)** on the frontend, **Python 3.13 (FastAPI)** on the backend, and **SQLite (SQLAlchemy)** for persistence.

---

## Key Features Implemented

### 1. Home & Search (`/`)
- **Iconic Airbnb Navigation**: Coral brand identity (`#FF385C`), floating pill search bar (*Where | Any week | Add guests*), language/currency indicators, and user profile menu.
- **Category Carousel**: Horizontal scrolling bar with authentic icons for *Cabins, Beachfront, Mansions, Amazing pools, Treehouses, Lakefront, Countryside, Skiing, Islands, Iconic cities*.
- **Expandable Search & Filters Modal**:
  - Destination search (city, country, title, description).
  - Date-range check-in and checkout picker.
  - Interactive guest counters (adults and children).
  - Price range min/max filter inputs.
  - Property type filter (*Entire villa, Entire cabin, Entire home, Entire penthouse*).
  - Standout amenities checkboxes (*Wifi, Pool, Kitchen, Hot tub, Waterfront, AC, etc.*).
- **Listing Cards**:
  - Multi-photo carousel with previous/next navigation arrows and indicator dots.
  - Animated heart wishlist toggle with instant backend synchronization.
  - Star ratings badge, property type, location, and bold nightly rate.
- **View Toggle (Grid vs. Map)**:
  - Floating pill button allowing users to switch between the responsive listings grid and an **interactive Leaflet map with custom Airbnb price pins**.

### 2. Listing Detail Experience (`/rooms/[id]`)
- **Signature 5-Photo Mosaic**: 1 prominent hero image + 4-photo grid with hover animations, plus a **Show all photos lightbox gallery**.
- **Host & Property Summary**: Host avatar, Superhost status badge, guest/bedroom/bed/bath capacity.
- **Highlights**: Dedicated workspace, smart self check-in, AirCover guest protection.
- **Amenities Showcase**: Categorized icons for all available property amenities.
- **Real-Time Interactive Calendar**: Live check-in/check-out date selection with automatic date-overlap detection and disabled booked intervals.
- **Sticky Reservation Widget**:
  - Live price calculation: `(nights x rate) + cleaning fee + service fee = total before taxes`.
  - Instant conflict prevention (alerts user if selected dates overlap with existing reservations).
  - Reserve button launching the **Checkout Modal**.
- **Guest Reviews**: Overall rating score, 5-aspect rating breakdown progress bars (*Cleanliness, Accuracy, Communication, Location, Value*), individual reviewer cards, and a **Write a Review** modal.
- **Interactive Location Map**: Pinpoints the property geographical coordinates on OpenStreetMap.

### 3. End-to-End Booking Flow
- Guest selects valid check-in and checkout dates and guest count.
- Validation prevents booking past dates, invalid ranges (checkout <= check-in), or overlapping already confirmed stays.
- **Checkout Modal**:
  - Review trip details, dates, and full price breakdown.
  - Mock payment selector (*Credit/Debit card, PayPal, Apple Pay / Google Pay*).
  - Free cancellation notice and terms agreement.
- Confirmed bookings immediately block those dates in the SQLite database and on the listing calendar.
- Automatic redirect to **My Trips (`/trips`)**.

### 4. Trips Management (`/trips`)
- View all active, upcoming, and past reservations.
- Details include stay thumbnail, dates, guest count, and total paid.
- **Cancel Reservation** button with safety confirmation modal.
- **Leave Review** shortcut for booked properties.

### 5. Host Experience (Full CRUD) (`/host/*`)
- **Host / Guest Profile Switcher**: Toggle instantly in the navigation dropdown between demo Guest (*Alex Rivera*) and demo Superhost (*Elena Rostova*).
- **Host Dashboard (`/host/dashboard`)**:
  - Key performance metrics: *Total Listings, Total Bookings, Total Revenue ($), Average Rating (*)*.
  - Management table for owned properties with direct links to view, edit, or delete.
  - Real-time table of incoming guest reservations with dates and payout totals.
- **Create Listing (`/host/create`)**: Comprehensive property builder with photo URL previews, amenities checkboxes, pricing inputs, capacity settings, and location coordinates.
- **Edit Listing (`/host/edit/[id]`)**: Full editing capability for existing properties.
- **Delete Listing**: Secure cascade removal of listings and associated records.

### 6. Wishlists / Favorites (`/wishlists`)
- Save favorite stays from any card or detail page with one click.
- Dedicated Wishlists page presenting all saved stays in a responsive grid.

---

## System Architecture

```
airbnb-clone/
├── backend/
│   ├── app/
│   │   ├── config.py              # Configuration & CORS settings
│   │   ├── database.py            # SQLite engine & SessionLocal
│   │   ├── main.py                # FastAPI app entrypoint & middleware
│   │   ├── models/                # SQLAlchemy ORM models (User, Listing, Image, Booking, Review, Wishlist)
│   │   ├── schemas/               # Pydantic validation schemas
│   │   ├── routers/               # Modular REST endpoints (listings, bookings, reviews, wishlists, host)
│   │   └── seed_data.py           # Database seeder with 16 luxury properties
│   ├── requirements.txt
│   └── test_backend.py            # Automated API test suite
│
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js 16 App Router pages
│   │   ├── components/            # Airbnb UI components & Leaflet Map
│   │   ├── context/               # AuthContext & WishlistContext
│   │   ├── lib/                   # API client & formatting utilities
│   │   └── types/                 # TypeScript interfaces
│   ├── package.json
│   └── next.config.ts
└── README.md
```

---

## Quick Setup & Installation

### Prerequisites
- Node.js v18+ (tested on v24)
- Python 3.10+ (tested on v3.13)

### 1. Backend Setup (FastAPI + SQLite)
```bash
cd backend
python -m venv .venv
# Activate virtual environment
.\\.venv\\Scripts\\activate  # Windows
# source .venv/bin/activate  # macOS / Linux

pip install -r requirements.txt
pip install email-validator httpx

# Run tests
python test_backend.py

# Start backend server
python run.py
```
API will be live at: `http://127.0.0.1:8000`  
Swagger API Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup (Next.js 16 + Tailwind CSS)
```bash
cd frontend
npm install
npm run build
npm run start -- -p 3000
# Or for live development:
# npm run dev
```
Frontend will be live at: `http://localhost:3000`

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/listings` | Search & filter listings |
| GET | `/api/listings/{id}` | Full listing details |
| POST | `/api/listings` | Create listing (Host mode) |
| PUT | `/api/listings/{id}` | Update listing |
| DELETE | `/api/listings/{id}` | Delete listing |
| GET | `/api/bookings/listing/{id}/booked-dates` | Get booked date intervals |
| POST | `/api/bookings` | Create reservation with overlap validation |
| GET | `/api/bookings/my` | Retrieve user bookings |
| DELETE | `/api/bookings/{id}` | Cancel reservation |
| GET | `/api/reviews/listing/{id}` | Retrieve reviews & breakdown |
| POST | `/api/reviews/listing/{id}` | Submit guest review |
| GET | `/api/wishlists` | User wishlists |
| POST | `/api/wishlists/toggle` | Toggle favorite |
| GET | `/api/host/dashboard` | Host metrics & owned stays |
| GET | `/api/users` | List demo user profiles |

---

## Demo Profiles

Use the user menu dropdown in the top right to switch between:
1. **Alex Rivera (Guest)**: Has existing booked trips to Lake Como and Santorini, and saved wishlists.
2. **Elena Rostova (Superhost)**: Host of multiple luxury stays, with full access to Host Dashboard, listings CRUD, and incoming bookings.