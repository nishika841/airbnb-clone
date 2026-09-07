"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Star,
  Share2,
  Heart,
  ShieldCheck,
  Award,
  Sparkles,
  MapPin,
  Key,
  Laptop,
  ChevronLeft,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { fetchListing, fetchBookedDates, fetchReviews } from "@/lib/api";
import { ListingDetail, BookedDateRange, ReviewsSummary as ReviewsSummaryType } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import PhotoGallery from "@/components/listings/PhotoGallery";
import ReservationWidget from "@/components/listings/ReservationWidget";
import AmenitiesList from "@/components/listings/AmenitiesList";
import ReviewsSummary from "@/components/reviews/ReviewsSummary";
import ReviewCard from "@/components/reviews/ReviewCard";
import AddReviewModal from "@/components/reviews/AddReviewModal";
import MessageHostModal from "@/components/host/MessageHostModal";
import MapView from "@/components/map/MapView";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ListingDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const listingId = Number(resolvedParams.id);
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [bookedDates, setBookedDates] = useState<BookedDateRange[]>([]);
  const [reviewsSummary, setReviewsSummary] = useState<ReviewsSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddReviewOpen, setIsAddReviewOpen] = useState(false);
  const [isMessageHostOpen, setIsMessageHostOpen] = useState(false);

  const loadData = async () => {
    try {
      const [listingData, datesData, reviewsData] = await Promise.all([
        fetchListing(listingId, user.id),
        fetchBookedDates(listingId),
        fetchReviews(listingId),
      ]);
      setListing(listingData);
      setBookedDates(datesData);
      setReviewsSummary(reviewsData);
    } catch {
      toast.error("Failed to load property details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listingId) {
      loadData();
    }
  }, [listingId, user.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6 animate-pulse">
        <div className="h-8 w-2/3 bg-gray-200 rounded-lg" />
        <div className="h-4 w-1/3 bg-gray-200 rounded-lg" />
        <div className="h-[440px] w-full bg-gray-200 rounded-3xl" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Listing not found</h2>
        <p className="mt-2 text-sm text-gray-500">The property you are looking for does not exist or has been removed.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-800"
        >
          Return to Explore
        </Link>
      </div>
    );
  }

  const favorited = isWishlisted(listing.id);

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard! 📋");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black mb-4 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Explore
        </Link>

        {/* Title & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              {listing.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-gray-800">
              <span className="flex items-center gap-1 text-gray-900">
                <Star className="h-4 w-4 fill-black text-black" />
                <span>{listing.rating.toFixed(2)}</span>
              </span>
              <span className="text-gray-400">·</span>
              <span className="underline cursor-pointer">{listing.reviews_count} reviews</span>
              {listing.host?.is_superhost && (
                <>
                  <span className="text-gray-400">·</span>
                  <span className="flex items-center gap-1 text-gray-700">
                    <Award className="h-4 w-4 text-[#FF385C]" /> Superhost
                  </span>
                </>
              )}
              <span className="text-gray-400">·</span>
              <span className="text-gray-600 underline">{listing.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold text-gray-800 shrink-0">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button
              onClick={() => toggle(listing.id)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 transition cursor-pointer"
            >
              <Heart
                className={`w-4 h-4 ${
                  favorited ? "fill-[#FF385C] text-[#FF385C]" : "text-gray-800"
                }`}
              />
              {favorited ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* 5-Photo Mosaic Gallery */}
        <PhotoGallery images={listing.images} title={listing.title} />

        {/* 2-Column Details & Sticky Booking Widget */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-8 divide-y divide-gray-200">
            {/* Host overview with Identity Verified badge & Contact Host button */}
            <div className="flex items-start justify-between pb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {listing.property_type} hosted by {listing.host?.name || "Elena"}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Identity verified
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="text-gray-500 font-normal">
                    {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.baths} baths
                  </span>
                </div>

                {/* Contact Host Button (Messaging placeholder) */}
                <button
                  onClick={() => setIsMessageHostOpen(true)}
                  className="mt-3.5 inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-800 hover:border-black hover:bg-gray-50 transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#FF385C]" />
                  Contact Host
                  <span className="text-[10px] bg-pink-50 text-[#FF385C] px-1.5 py-0.2 rounded-md ml-1">
                    Direct Message
                  </span>
                </button>
              </div>

              <img
                src={listing.host?.avatar_url || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"}
                alt={listing.host?.name || "Host"}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
              />
            </div>

            {/* Standout highlights */}
            <div className="pt-6 space-y-5">
              <div className="flex items-start gap-4">
                <Laptop className="h-6 w-6 text-gray-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Dedicated workspace</h4>
                  <p className="text-xs text-gray-500">A high-speed wifi workspace suitable for remote work.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Key className="h-6 w-6 text-gray-800 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Self check-in</h4>
                  <p className="text-xs text-gray-500">Easily check yourself in with the smart lock or lockbox.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-[#FF385C] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">AirCover Protection</h4>
                  <p className="text-xs text-gray-500">Every booking includes free protection from Host cancellations.</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">About this space</h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">What this place offers</h3>
              <AmenitiesList amenities={listing.amenities} />
            </div>

            {/* Availability Notice */}
            <div className="pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Availability</h3>
              <p className="text-xs text-gray-500">
                Booked dates are blocked automatically in real time. Use the reservation calendar to select your stay.
              </p>
              {bookedDates.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-600">
                  <span className="font-semibold text-gray-800">Currently reserved periods:</span>
                  {bookedDates.map((b, i) => (
                    <span key={i} className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md border border-red-100">
                      {b.start_date} → {b.end_date}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Sticky Reservation Widget) */}
          <div className="lg:col-span-5">
            <ReservationWidget
              listing={listing}
              bookedDates={bookedDates}
              onBookingSuccess={loadData}
            />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-gray-200 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black text-gray-900">Guest reviews</h3>
            <button
              onClick={() => setIsAddReviewOpen(true)}
              className="rounded-xl border border-black px-4 py-2 text-xs font-bold text-black hover:bg-black hover:text-white transition cursor-pointer"
            >
              Write a Review
            </button>
          </div>

          {reviewsSummary && (
            <>
              <ReviewsSummary summary={reviewsSummary} />
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {reviewsSummary.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Location / Map Section */}
        <div className="mt-16 border-t border-gray-200 pt-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black text-gray-900">Where you&apos;ll be</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-semibold">
              Interactive Leaflet Map
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-[#FF385C]" /> {listing.location}
          </p>
          <MapView
            listings={[
              {
                id: listing.id,
                title: listing.title,
                category: listing.category,
                property_type: listing.property_type,
                price_per_night: listing.price_per_night,
                city: listing.city,
                country: listing.country,
                location: listing.location,
                latitude: listing.latitude,
                longitude: listing.longitude,
                max_guests: listing.max_guests,
                rating: listing.rating,
                reviews_count: listing.reviews_count,
                cover_image: listing.images[0]?.url || "",
                images: listing.images.map((i) => i.url),
              },
            ]}
            height="400px"
            singleListing={true}
          />
        </div>
      </div>

      {/* Leave a review modal */}
      <AddReviewModal
        isOpen={isAddReviewOpen}
        onClose={() => setIsAddReviewOpen(false)}
        listingId={listing.id}
        onReviewAdded={loadData}
      />

      {/* Message host modal */}
      <MessageHostModal
        isOpen={isMessageHostOpen}
        onClose={() => setIsMessageHostOpen(false)}
        host={listing.host}
        listingTitle={listing.title}
      />
    </div>
  );
}