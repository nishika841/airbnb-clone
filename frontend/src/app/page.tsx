"use client";

import React, { useState, useEffect, useCallback } from "react";
import CategoriesBar from "@/components/layout/CategoriesBar";
import ListingGrid from "@/components/listings/ListingGrid";
import MapView from "@/components/map/MapView";
import { fetchListings } from "@/lib/api";
import { ListingCard, SearchFilterState } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Map, List, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [filters, setFilters] = useState<SearchFilterState>({});
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 8;

  const loadListings = useCallback(
    async (currentFilters: SearchFilterState, category: string, pageNum = 1) => {
      setLoading(true);
      try {
        const mergedFilters = {
          ...currentFilters,
          category: category !== "All" ? category : undefined,
        };
        const res = await fetchListings(mergedFilters, user.id, pageNum, limit);
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

  useEffect(() => {
    loadListings(filters, activeCategory, page);
  }, [filters, activeCategory, page, loadListings]);

  const handleCategorySelect = (cat: string) => {
    setActiveCategory(cat);
    setPage(1);
  };

  const handleApplyFilters = (newFilters: Partial<SearchFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleResetFilters = () => {
    setActiveCategory("All");
    setFilters({});
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Categories Bar */}
      <CategoriesBar
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Results summary bar */}
        <div className="pt-6 pb-2 flex items-center justify-between text-xs text-gray-500 font-semibold border-b border-gray-100">
          <span>
            {totalListings} {totalListings === 1 ? "stay" : "stays"} available{" "}
            {activeCategory !== "All" ? `in ${activeCategory}` : "worldwide"}
          </span>
          {totalPages > 1 && (
            <span>
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {showMap ? (
          <div className="py-6">
            <MapView listings={listings} height="75vh" zoom={3} />
          </div>
        ) : (
          <>
            <ListingGrid
              listings={listings}
              loading={loading}
              onReset={handleResetFilters}
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
              <span>Show list</span>
              <List className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Show map</span>
              <Map className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}