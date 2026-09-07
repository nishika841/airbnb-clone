"use client";

import React, { useState, useEffect, useCallback } from "react";
import CategoriesBar from "@/components/layout/CategoriesBar";
import ListingGrid from "@/components/listings/ListingGrid";
import MapView from "@/components/map/MapView";
import { fetchListings } from "@/lib/api";
import { ListingCard, SearchFilterState } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Map, List } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [filters, setFilters] = useState<SearchFilterState>({});
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadListings = useCallback(async (currentFilters: SearchFilterState, category: string, pageNum = 1) => {
    setLoading(true);
    try {
      const mergedFilters = {
        ...currentFilters,
        category: category !== "All" ? category : undefined,
      };
      const res = await fetchListings(mergedFilters, user.id, pageNum, 20);
      setListings(res.listings);
      setTotalPages(res.total_pages);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

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
    <div className="min-h-screen bg-white pb-16">
      {/* Categories Bar */}
      <CategoriesBar
        activeCategory={activeCategory}
        onSelectCategory={handleCategorySelect}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showMap ? (
          <div className="py-6">
            <MapView listings={listings} height="75vh" zoom={3} />
          </div>
        ) : (
          <ListingGrid
            listings={listings}
            loading={loading}
            onReset={handleResetFilters}
          />
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
