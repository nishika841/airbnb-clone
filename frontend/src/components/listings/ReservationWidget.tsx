"use client";

import React, { useState } from "react";
import { Star, ChevronDown, AlertCircle } from "lucide-react";
import { ListingDetail, BookedDateRange } from "@/types";
import { formatPrice, calculateNights } from "@/lib/utils";
import CheckoutModal from "@/components/booking/CheckoutModal";

interface ReservationWidgetProps {
  listing: ListingDetail;
  bookedDates: BookedDateRange[];
  onBookingSuccess?: () => void;
}

export default function ReservationWidget({
  listing,
  bookedDates,
  onBookingSuccess,
}: ReservationWidgetProps) {
  // Default dates: tomorrow to +3 days
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStart = tomorrow.toISOString().split("T")[0];

  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 4);
  const defaultEnd = threeDaysLater.toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [guestsCount, setGuestsCount] = useState(1);
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const nights = calculateNights(startDate, endDate);
  const accommodationTotal = nights * listing.price_per_night;
  const grandTotal = accommodationTotal + listing.cleaning_fee + listing.service_fee;

  // Check if dates conflict with any booked date range
  const isConflict = bookedDates.some((b) => {
    return startDate < b.end_date && endDate > b.start_date;
  });

  const isInvalidRange = !startDate || !endDate || startDate >= endDate;

  return (
    <>
      <div className="sticky top-28 rounded-3xl border border-gray-200 bg-white p-6 shadow-xl space-y-5">
        {/* Top Price & Rating */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-black text-gray-900">
              {formatPrice(listing.price_per_night)}
            </span>
            <span className="text-sm font-normal text-gray-500 ml-1">night</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
            <Star className="h-3.5 w-3.5 fill-black text-black" />
            <span>{listing.rating.toFixed(2)}</span>
            <span className="text-gray-400 font-normal">·</span>
            <span className="text-gray-500 font-normal underline">
              {listing.reviews_count} reviews
            </span>
          </div>
        </div>

        {/* Date & Guest Input Box */}
        <div className="rounded-2xl border border-gray-300 divide-y divide-gray-200 overflow-hidden">
          {/* Check-in / Check-out */}
          <div className="grid grid-cols-2 divide-x divide-gray-200">
            <div className="p-2.5 hover:bg-gray-50 transition">
              <label className="block text-[10px] font-extrabold uppercase text-gray-800 tracking-wider">
                CHECK-IN
              </label>
              <input
                type="date"
                value={startDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs font-semibold outline-hidden bg-transparent text-gray-900 mt-0.5 cursor-pointer"
              />
            </div>
            <div className="p-2.5 hover:bg-gray-50 transition">
              <label className="block text-[10px] font-extrabold uppercase text-gray-800 tracking-wider">
                CHECKOUT
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs font-semibold outline-hidden bg-transparent text-gray-900 mt-0.5 cursor-pointer"
              />
            </div>
          </div>

          {/* Guests dropdown trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
              className="flex w-full items-center justify-between p-3 text-left hover:bg-gray-50 transition cursor-pointer"
            >
              <div>
                <span className="block text-[10px] font-extrabold uppercase text-gray-800 tracking-wider">
                  GUESTS
                </span>
                <span className="text-xs font-semibold text-gray-900">
                  {guestsCount} guest{guestsCount > 1 ? "s" : ""}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {/* Dropdown popup */}
            {isGuestDropdownOpen && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900">Guests</p>
                    <p className="text-[11px] text-gray-500">Max {listing.max_guests} guests</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={guestsCount <= 1}
                      onClick={() => setGuestsCount((prev) => Math.max(1, prev - 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:opacity-30 hover:border-black transition"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{guestsCount}</span>
                    <button
                      type="button"
                      disabled={guestsCount >= listing.max_guests}
                      onClick={() => setGuestsCount((prev) => Math.min(listing.max_guests, prev + 1))}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:opacity-30 hover:border-black transition"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="border-t mt-3 pt-2 text-right">
                  <button
                    type="button"
                    onClick={() => setIsGuestDropdownOpen(false)}
                    className="text-xs font-bold text-black underline"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conflict Alert Notice */}
        {isConflict && (
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 border border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              These dates overlap with an existing reservation on this property. Please select different dates.
            </span>
          </div>
        )}

        {/* Reserve Button */}
        <button
          type="button"
          disabled={isConflict || isInvalidRange || nights <= 0}
          onClick={() => setIsCheckoutOpen(true)}
          className="w-full rounded-2xl bg-gradient-to-r from-[#FF385C] via-[#E00B41] to-[#D70466] py-3.5 text-center text-sm font-bold text-white shadow-md hover:brightness-105 transition disabled:opacity-40 cursor-pointer"
        >
          {isConflict
            ? "Dates unavailable"
            : isInvalidRange
            ? "Select valid dates"
            : "Reserve"}
        </button>

        <p className="text-center text-xs text-gray-500">You won&apos;t be charged yet</p>

        {/* Price Breakdown */}
        {nights > 0 && !isInvalidRange && (
          <div className="space-y-3 pt-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span className="underline">
                {formatPrice(listing.price_per_night)} × {nights} nights
              </span>
              <span>{formatPrice(accommodationTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">Cleaning fee</span>
              <span>{formatPrice(listing.cleaning_fee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="underline">Airbnb service fee</span>
              <span>{formatPrice(listing.service_fee)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-black text-gray-900 text-base">
              <span>Total before taxes</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        listing={listing}
        startDate={startDate}
        endDate={endDate}
        guestsCount={guestsCount}
        onSuccess={onBookingSuccess}
      />
    </>
  );
}
