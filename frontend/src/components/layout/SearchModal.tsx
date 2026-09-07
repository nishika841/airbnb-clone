"use client";

import React, { useState } from "react";
import { Search, X, Minus, Plus, Calendar, MapPin, Users } from "lucide-react";
import { SearchFilterState } from "@/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: Partial<SearchFilterState>) => void;
  initialFilters?: SearchFilterState;
}

export default function SearchModal({
  isOpen,
  onClose,
  onSearch,
  initialFilters = {},
}: SearchModalProps) {
  const [destination, setDestination] = useState(initialFilters.search || "");
  const [startDate, setStartDate] = useState(initialFilters.start_date || "");
  const [endDate, setEndDate] = useState(initialFilters.end_date || "");
  const [adults, setAdults] = useState(initialFilters.guests || 1);
  const [children, setChildren] = useState(0);

  if (!isOpen) return null;

  const totalGuests = adults + children;

  const handleApply = () => {
    onSearch({
      search: destination.trim() || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      guests: totalGuests > 1 ? totalGuests : undefined,
    });
    onClose();
  };

  const handleClear = () => {
    setDestination("");
    setStartDate("");
    setEndDate("");
    setAdults(1);
    setChildren(0);
    onSearch({
      search: undefined,
      start_date: undefined,
      end_date: undefined,
      guests: undefined,
    });
    onClose();
  };

  const popularDestinations = [
    { name: "Italy", label: "Lake Como & Amalfi Coast" },
    { name: "Switzerland", label: "Alps & Zermatt" },
    { name: "Greece", label: "Santorini & Oia" },
    { name: "Bali", label: "Ubud & Tropical Villas" },
    { name: "California", label: "Big Sur & Joshua Tree" },
    { name: "France", label: "Paris & Provence" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-20 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold text-gray-900">Find your next stay</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Where */}
          <div className="rounded-2xl border p-4 hover:border-gray-900 focus-within:border-gray-900 transition bg-white shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
              <MapPin className="w-3.5 h-3.5 text-[#FF385C]" />
              Where
            </div>
            <input
              type="text"
              placeholder="Search destinations"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="mt-2 w-full text-sm font-semibold outline-hidden placeholder:text-gray-400 text-gray-900"
            />
          </div>

          {/* Dates */}
          <div className="rounded-2xl border p-4 hover:border-gray-900 focus-within:border-gray-900 transition bg-white shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
              <Calendar className="w-3.5 h-3.5 text-[#FF385C]" />
              Dates
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-gray-500 text-[10px]">CHECK-IN</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs font-semibold outline-hidden text-gray-900"
                />
              </div>
              <div>
                <label className="text-gray-500 text-[10px]">CHECK-OUT</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs font-semibold outline-hidden text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Guests */}
          <div className="rounded-2xl border p-4 hover:border-gray-900 focus-within:border-gray-900 transition bg-white shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
              <Users className="w-3.5 h-3.5 text-[#FF385C]" />
              Who
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900">{totalGuests} guest{totalGuests > 1 ? "s" : ""}</div>
                <div className="text-xs text-gray-500">Adults & children</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={adults <= 1}
                  onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                  className="rounded-full border border-gray-300 p-1 text-gray-600 disabled:opacity-30 hover:border-gray-900 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold w-4 text-center">{adults}</span>
                <button
                  type="button"
                  disabled={adults >= 16}
                  onClick={() => setAdults((prev) => prev + 1)}
                  className="rounded-full border border-gray-300 p-1 text-gray-600 hover:border-gray-900 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Destination Suggestions */}
        <div className="mt-6">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Popular Destinations</div>
          <div className="flex flex-wrap gap-2">
            {popularDestinations.map((dest) => (
              <button
                key={dest.name}
                onClick={() => setDestination(dest.name)}
                className={`text-xs px-3.5 py-2 rounded-full border transition cursor-pointer ${
                  destination.toLowerCase() === dest.name.toLowerCase()
                    ? "bg-black text-white border-black"
                    : "bg-gray-50 text-gray-800 border-gray-200 hover:border-gray-400"
                }`}
              >
                <span className="font-semibold">{dest.name}</span>
                <span className="text-gray-400 ml-1.5 text-[11px]">· {dest.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="mt-8 flex items-center justify-between border-t pt-4">
          <button
            onClick={handleClear}
            className="text-sm font-semibold underline text-gray-600 hover:text-gray-900"
          >
            Clear all
          </button>
          <button
            onClick={handleApply}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF385C] to-[#E00B41] px-6 py-3 text-sm font-semibold text-white shadow-md hover:brightness-105 transition"
          >
            <Search className="w-4 h-4 stroke-[3]" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
