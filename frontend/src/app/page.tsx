"use client";

import React, { useState, useEffect, useCallback } from "react";
import CategoriesBar from "@/components/layout/CategoriesBar";
import ListingGrid from "@/components/listings/ListingGrid";
import MapView from "@/components/map/MapView";
import { fetchListings } from "@/lib/api";
import { ListingCard, SearchFilterState } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import { Map, List, ChevronLeft, ChevronRight, X, Search, RotateCcw } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { filters, updateFilter, clearFilters, openSearchModal } = useSearch();

  const [listings, setListings] = useState<ListingCard[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const loadListings = useCallback(
    async (currentFilters: SearchFilterState, pageNum = 1) => {
      setLoading(true);
      try {
        const res = await fetchListings(currentFilters, user.id, pageNum, limit);
        setListings(res.listings);
        setTotalListings(res.total);
        setTotalPages(res.total_pages);
      } catch {
        setListings([]);
        setTotalListings(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [user.id]
  );

  // Fetch whenever filters or page changes
  useEffect(() => {
    loadListings(filters, page);
  }, [filters, page, loadListings]);

  // Reset to page 1 whenever search criteria change
  const handleCategorySelect = (category: string) => {
    setPage(1);
    updateFilter({ category: category === "All" ? undefined : category });
  };

  const handleApplyFilters = (newFilters: Partial<SearchFilterState>) => {
    setPage(1);
    updateFilter(newFilters);
  };

  const handleRemoveFilter = (key: keyof SearchFilterState) => {
    setPage(1);
    if (key === "start_date") {
      updateFilter({ start_date: undefined, end_date: undefined });
    } else {
      updateFilter({ [key]: undefined });
    }
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    filters.city ||
    filters.guests ||
    filters.start_date ||
    filters.min_price ||
    filters.max_price ||
    filters.property_type ||
    (filters.amenities && filters.amenities.length > 0)
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Categories Bar */}
      <CategoriesBar
        activeCategory={filters.category || "All"}
        onSelectCategory={handleCategorySelect}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="pt-4 pb-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 mr-1">Active filters:</span>

            {filters.search && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                Destination: &ldquo;{filters.search}&rdquo;
                <button
                  onClick={() => handleRemoveFilter("search")}
                  className="hover:text-red-500 cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {filters.guests && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                Guests: {filters.guests}+
                <button
                  onClick={() => handleRemoveFilter("guests")}
                  className="hover:text-red-500 cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {filters.start_date && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                Dates: {filters.start_date} {filters.end_date ? `→ ${filters.end_date}` : ""}
                <button
                  onClick={() => handleRemoveFilter("start_date")}
                  className="hover:text-red-500 cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {(filters.min_price || filters.max_price) && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                Price: ${filters.min_price || 0} - ${filters.max_price || "Any"}
                <button
                  onClick={() => {
                    handleRemoveFilter("min_price");
                    handleRemoveFilter("max_price");
                  }}
                  className="hover:text-red-500 cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {filters.property_type && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                Type: {filters.property_type}
                <button
                  onClick={() => handleRemoveFilter("property_type")}
                  className="hover:text-red-500 cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            <button
              onClick={() => {
                setPage(1);
                clearFilters();
              }}
              className="text-xs font-bold text-[#FF385C] hover:underline flex items-center gap-1 ml-2 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset all
            </button>
          </div>
        )}

        {/* Results summary bar */}
        <div className="pt-4 pb-2 flex items-center justify-between text-xs text-gray-500 font-semibold border-b border-gray-100">
          <span>
            {totalListings} {totalListings === 1 ? "stay" : "stays"} available{" "}
            {filters.category && filters.category !== "All"
              ? `in ${filters.category}`
              : "worldwide"}
            {filters.guests ? ` · fitting ${filters.guests}+ guests` : ""}
          </span>
          {totalPages > 1 && (
            <span>
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {/* Listings or Map View */}
        {showMap ? (
          <div className="py-6">
            <MapView listings={listings} height="75vh" zoom={3} />
          </div>
        ) : listings.length === 0 && !loading ? (
          /* Empty Search Results State */
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-[#FF385C] flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No stays found</h3>
            <p className="text-sm text-gray-500 mb-6">
              We couldn&apos;t find any properties matching your current search criteria. Try changing your destination, reducing the guest count, or clearing filters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => openSearchModal("where")}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-black text-white text-xs font-bold hover:bg-gray-800 transition cursor-pointer"
              >
                Change search
              </button>
              <button
                onClick={() => {
                  setPage(1);
                  clearFilters();
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-300 text-gray-800 text-xs font-bold hover:border-black transition cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <ListingGrid
              listings={listings}
              loading={loading}
              onReset={() => {
                setPage(1);
                clearFilters();
              }}
            />

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-gray-200 pt-8">
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:border-black disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer ${
                          page === p
                            ? "bg-black text-white"
                            : "border border-gray-200 text-gray-700 hover:border-black"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:border-black disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating View Toggle Button (Map / List) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-xs font-bold text-white shadow-xl hover:scale-105 hover:bg-black transition cursor-pointer"
        >
          {showMap ? (
            <>
              <List className="h-4 w-4" />
              <span>Show list</span>
            </>
          ) : (
            <>
              <Map className="h-4 w-4" />
              <span>Show map</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}