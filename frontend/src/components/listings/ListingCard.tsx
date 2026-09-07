"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { ListingCard as ListingCardType } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";

interface ListingCardProps {
  listing: ListingCardType;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { isWishlisted, toggle } = useWishlist();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = listing.images && listing.images.length > 0 ? listing.images : [listing.cover_image];
  const favorited = isWishlisted(listing.id);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(listing.id);
  };

  return (
    <div
      className="group flex flex-col cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/rooms/${listing.id}`} className="block">
        {/* Photo Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 shadow-xs">
          <img
            src={images[photoIndex] || listing.cover_image}
            alt={listing.title}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />

          {/* Heart Button */}
          <button
            type="button"
            onClick={handleHeartClick}
            className="absolute right-3 top-3 z-10 rounded-full p-1.5 transition hover:scale-115 active:scale-95"
            aria-label="Save to wishlist"
          >
            <Heart
              className={`h-6 w-6 stroke-[2] transition-colors ${
                favorited
                  ? "fill-[#FF385C] text-[#FF385C]"
                  : "fill-black/30 stroke-white text-white hover:fill-black/50"
              }`}
            />
          </button>

          {/* Prev/Next arrows on hover */}
          {images.length > 1 && isHovered && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white hover:scale-105 transition text-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md hover:bg-white hover:scale-105 transition text-gray-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          {/* Photo Dots indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {images.slice(0, 5).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === photoIndex ? "w-2 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Listing Info */}
        <div className="mt-3 flex items-start justify-between text-sm">
          <div className="font-bold text-gray-900 truncate pr-2">
            {listing.city}, {listing.country}
          </div>
          <div className="flex items-center gap-1 font-semibold text-gray-900 shrink-0">
            <Star className="h-3.5 w-3.5 fill-black text-black" />
            <span>{listing.rating.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 truncate mt-0.5">{listing.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{listing.property_type}</p>

        <div className="mt-1.5 flex items-baseline gap-1 text-sm">
          <span className="font-extrabold text-gray-900">
            {formatPrice(listing.price_per_night)}
          </span>
          <span className="text-xs text-gray-600 font-normal">night</span>
        </div>
      </Link>
    </div>
  );
}
