from fastapi.testclient import TestClient
from app.main import app
from datetime import date, timedelta

client = TestClient(app)

# 1. Health check
res = client.get("/api/health")
assert res.status_code == 200, f"Health check failed: {res.text}"
print("? Health check passed")

# 2. Get listings
res = client.get("/api/listings")
assert res.status_code == 200
data = res.json()
assert data["total"] == 16, f"Expected 16 listings, got {data['total']}"
print(f"? Get listings passed: {data['total']} listings found")

# 3. Category filter
res = client.get("/api/listings?category=Cabins")
assert res.status_code == 200
cabins = res.json()["listings"]
assert len(cabins) >= 2
for c in cabins:
    assert "cabins" in c["category"].lower()
print(f"? Category filter passed: {len(cabins)} cabins found")

# 4. Search filter
res = client.get("/api/listings?search=Italy")
assert res.status_code == 200
italy_listings = res.json()["listings"]
assert len(italy_listings) >= 2
print(f"? Search filter passed: {len(italy_listings)} listings in Italy")

# 5. Detail view
target_listing = next(l for l in data["listings"] if l["city"] == "Lake Como")
target_id = target_listing["id"]
res = client.get(f"/api/listings/{target_id}")
assert res.status_code == 200
detail = res.json()
assert len(detail["images"]) >= 5
assert len(detail["amenities"]) > 0
assert detail["host"] is not None
print(f"? Listing detail passed: '{detail['title']}'")

# 6. Booked dates check
res = client.get(f"/api/bookings/listing/{target_id}/booked-dates")
assert res.status_code == 200
booked_ranges = res.json()
assert len(booked_ranges) >= 1
print(f"? Booked dates passed: {len(booked_ranges)} booked ranges for listing {target_id}")

# 7. Date overlap booking rejection
conflict_start = booked_ranges[0]["start_date"]
conflict_end = booked_ranges[0]["end_date"]
res = client.post("/api/bookings", json={
    "listing_id": target_id,
    "user_id": 1,
    "start_date": conflict_start,
    "end_date": conflict_end,
    "guests_count": 2
})
assert res.status_code == 400, f"Expected 400 for conflict, got {res.status_code}: {res.text}"
print("? Overlap booking conflict rejection passed")

# 8. Successful booking
res = client.post("/api/bookings", json={
    "listing_id": target_id,
    "user_id": 1,
    "start_date": str(date.today() + timedelta(days=90)),
    "end_date": str(date.today() + timedelta(days=95)),
    "guests_count": 2
})
assert res.status_code == 200, f"Booking failed: {res.text}"
booking_id = res.json()["id"]
print(f"? New booking created successfully (ID: {booking_id})")

# 9. Cancel booking
res = client.delete(f"/api/bookings/{booking_id}")
assert res.status_code == 200
print("? Booking cancellation passed")

# 10. Wishlist toggle
res = client.post("/api/wishlists/toggle", json={"listing_id": target_id, "user_id": 1})
assert res.status_code == 200
state1 = res.json()["is_wishlisted"]
res = client.post("/api/wishlists/toggle", json={"listing_id": target_id, "user_id": 1})
state2 = res.json()["is_wishlisted"]
assert state1 != state2
print(f"? Wishlist toggle passed ({state1} -> {state2})")

# 11. Host dashboard
res = client.get("/api/host/dashboard?host_id=2")
assert res.status_code == 200
dash = res.json()
assert "stats" in dash
print(f"? Host dashboard passed: {dash['stats']['total_listings']} listings for host")

print("\n========================================")
print("ALL 11 BACKEND API TESTS PASSED PERFECTLY!")
print("========================================")
