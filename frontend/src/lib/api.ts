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

import { FALLBACK_LISTINGS } from "@/data/fallbackData";

export async function fetchListings(
  filters: SearchFilterState = {},
  userId?: number,
  page = 1,
  limit = 20
): Promise<{ listings: ListingCard[]; total: number; page: number; total_pages: number }> {
  try {
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE}/listings?${query.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return await handleResponse(res);
  } catch (err) {
    console.warn("Backend slow or unreachable, serving instant fallback stays:", err);
    let filtered = [...FALLBACK_LISTINGS];
    if (filters.category && filters.category !== "All") {
      filtered = filtered.filter((l) => l.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((l) => l.title.toLowerCase().includes(s) || l.city.toLowerCase().includes(s) || l.location.toLowerCase().includes(s));
    }
    if (filters.city) {
      filtered = filtered.filter((l) => l.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    if (filters.min_price) {
      filtered = filtered.filter((l) => l.price_per_night >= filters.min_price!);
    }
    if (filters.max_price) {
      filtered = filtered.filter((l) => l.price_per_night <= filters.max_price!);
    }
    if (filters.guests) {
      filtered = filtered.filter((l) => l.max_guests >= filters.guests!);
    }
    const total = filtered.length;
    const startIdx = (page - 1) * limit;
    const paginated = filtered.slice(startIdx, startIdx + limit);
    return {
      listings: paginated,
      total,
      page,
      total_pages: Math.ceil(total / limit) || 1,
    };
  }
}

export async function fetchListing(id: number, userId?: number): Promise<ListingDetail> {
  try {
    const query = userId ? `?user_id=${userId}` : "";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE}/listings/${id}${query}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return await handleResponse(res);
  } catch (err) {
    console.warn(`Backend slow or unreachable for listing ${id}, serving fallback detail:`, err);
    const item = FALLBACK_LISTINGS.find((l) => l.id === Number(id)) || FALLBACK_LISTINGS[0];
    const listingImages = (item.images || []).map((url, idx) => ({
      id: idx + 1,
      url,
      is_cover: idx === 0,
      display_order: idx,
    }));
    return {
      id: item.id,
      host_id: 2,
      title: item.title,
      description: "Experience the ultimate comfort and design in this premier destination. Features breathtaking views, dedicated amenities, high-speed fiber internet, and attentive Superhost service.",
      category: item.category,
      property_type: item.property_type,
      price_per_night: item.price_per_night,
      cleaning_fee: 120,
      service_fee: 65,
      city: item.city,
      country: item.country,
      location: item.location,
      latitude: item.latitude,
      longitude: item.longitude,
      max_guests: item.max_guests,
      bedrooms: 3,
      beds: 4,
      baths: 2.5,
      amenities: ["Wifi", "Pool", "Kitchen", "Air conditioning", "Dedicated workspace", "Free parking", "EV charger"],
      rating: item.rating,
      reviews_count: item.reviews_count,
      created_at: new Date().toISOString(),
      images: listingImages,
      host: {
        id: 2,
        name: "Elena Rostova",
        email: "elena@example.com",
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        is_host: true,
        is_superhost: true,
        joined_date: "Joined March 2018",
      },
      is_wishlisted: item.is_wishlisted || false,
    };
  }
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
