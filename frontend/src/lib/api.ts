import {
  ListingCard,
  ListingDetail,
  ListingCreateInput,
  Booking,
  BookedDateRange,
  ReviewsSummary,
  Review,
  HostDashboardData,
  SearchFilterState,
  User,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://backend-nishika841s-projects.vercel.app/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = "An error occurred";
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = res.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export async function fetchListings(
  filters: SearchFilterState = {},
  userId?: number,
  page = 1,
  limit = 20
): Promise<{ listings: ListingCard[]; total: number; page: number; total_pages: number }> {
  const query = new URLSearchParams();

  if (filters.category && filters.category !== "All") query.append("category", filters.category);
  if (filters.search) query.append("search", filters.search);
  if (filters.city) query.append("city", filters.city);
  if (filters.min_price) query.append("min_price", filters.min_price.toString());
  if (filters.max_price) query.append("max_price", filters.max_price.toString());
  if (filters.guests) query.append("guests", filters.guests.toString());
  if (filters.property_type && filters.property_type !== "Any") query.append("property_type", filters.property_type);
  if (filters.amenities && filters.amenities.length > 0) query.append("amenities", filters.amenities.join(","));
  if (filters.start_date) query.append("start_date", filters.start_date);
  if (filters.end_date) query.append("end_date", filters.end_date);
  if (userId) query.append("user_id", userId.toString());

  query.append("page", page.toString());
  query.append("limit", limit.toString());

  const res = await fetch(`${API_BASE}/listings?${query.toString()}`, { cache: "no-store" });
  return handleResponse(res);
}

export async function fetchListing(id: number, userId?: number): Promise<ListingDetail> {
  const query = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API_BASE}/listings/${id}${query}`, { cache: "no-store" });
  return handleResponse(res);
}

export async function createListing(data: ListingCreateInput): Promise<ListingDetail> {
  const res = await fetch(`${API_BASE}/listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateListing(id: number, data: Partial<ListingCreateInput>): Promise<ListingDetail> {
  const res = await fetch(`${API_BASE}/listings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteListing(id: number): Promise<{ message: string; id: number }> {
  const res = await fetch(`${API_BASE}/listings/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

export async function fetchBookedDates(listingId: number): Promise<BookedDateRange[]> {
  const res = await fetch(`${API_BASE}/bookings/listing/${listingId}/booked-dates`, { cache: "no-store" });
  return handleResponse(res);
}

export async function createBooking(data: {
  listing_id: number;
  user_id?: number;
  start_date: string;
  end_date: string;
  guests_count: number;
}): Promise<Booking> {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function fetchMyTrips(userId?: number): Promise<Booking[]> {
  const query = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API_BASE}/bookings/my${query}`, { cache: "no-store" });
  return handleResponse(res);
}

export async function cancelBooking(id: number): Promise<{ message: string; id: number }> {
  const res = await fetch(`${API_BASE}/bookings/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

export async function fetchReviews(listingId: number): Promise<ReviewsSummary> {
  const res = await fetch(`${API_BASE}/reviews/listing/${listingId}`, { cache: "no-store" });
  return handleResponse(res);
}

export async function addReview(
  listingId: number,
  data: {
    user_id?: number;
    rating: number;
    cleanliness: number;
    accuracy: number;
    communication: number;
    location_rating: number;
    value_rating: number;
    comment: string;
  }
): Promise<Review> {
  const res = await fetch(`${API_BASE}/reviews/listing/${listingId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function fetchWishlists(userId?: number): Promise<ListingCard[]> {
  const query = userId ? `?user_id=${userId}` : "";
  const res = await fetch(`${API_BASE}/wishlists${query}`, { cache: "no-store" });
  return handleResponse(res);
}

export async function toggleWishlist(
  listingId: number,
  userId?: number
): Promise<{ listing_id: number; is_wishlisted: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/wishlists/toggle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listing_id: listingId, user_id: userId }),
  });
  return handleResponse(res);
}

export async function fetchHostDashboard(hostId?: number): Promise<HostDashboardData> {
  const query = hostId ? `?host_id=${hostId}` : "";
  const res = await fetch(`${API_BASE}/host/dashboard${query}`, { cache: "no-store" });
  return handleResponse(res);
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`, { cache: "no-store" });
  return handleResponse(res);
}
