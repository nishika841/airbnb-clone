"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Globe,
  Menu,
  User as UserIcon,
  Heart,
  Luggage,
  Home,
  PlusCircle,
  Sparkles,
  Check,
  MessageSquare,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import SearchModal from "./SearchModal";
import IdentityVerificationModal from "@/components/auth/IdentityVerificationModal";
import { SearchFilterState } from "@/types";

interface NavbarProps {
  onSearch?: (filters: Partial<SearchFilterState>) => void;
  currentFilters?: SearchFilterState;
}

export default function Navbar({ onSearch, currentFilters }: NavbarProps) {
  const router = useRouter();
  const { user, isHost, switchUser, toggleHostMode } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check saved theme
    const savedTheme = localStorage.getItem("airbnb_theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("airbnb_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("airbnb_theme", "light");
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchTrigger = (filters: Partial<SearchFilterState>) => {
    if (onSearch) {
      onSearch(filters);
    } else {
      const q = new URLSearchParams();
      if (filters.search) q.append("search", filters.search);
      if (filters.start_date) q.append("start_date", filters.start_date);
      if (filters.end_date) q.append("end_date", filters.end_date);
      if (filters.guests) q.append("guests", filters.guests.toString());
      router.push(`/?${q.toString()}`);
    }
  };

  const getSearchPillText = () => {
    const where = currentFilters?.search || currentFilters?.city || "Anywhere";
    const when = currentFilters?.start_date ? "Dates set" : "Any week";
    const who = currentFilters?.guests ? `${currentFilters.guests} guests` : "Add guests";
    return { where, when, who };
  };

  const pillText = getSearchPillText();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md transition-all">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <svg
                viewBox="0 0 32 32"
                aria-hidden="true"
                role="presentation"
                focusable="false"
                className="h-8 w-8 fill-[#FF385C] transition-transform group-hover:scale-105"
              >
                <path d="M16 1c2.008 0 3.463.963 4.751 3.269l.533 1.025c1.954 3.83 6.114 12.54 7.1 14.836l.145.353c.667 1.591.91 2.479.96 3.397.086 1.587-.456 3.195-1.503 4.464-1.258 1.524-3.09 2.417-5.068 2.454-2.148.04-4.148-.962-5.419-2.731l-.499-.718-.499.718c-1.271 1.769-3.271 2.771-5.419 2.731-1.978-.037-3.81-.93-5.068-2.454-1.047-1.269-1.589-2.877-1.503-4.464.05-.918.293-1.806.96-3.397l.145-.353c.986-2.296 5.146-11.006 7.1-14.836l.533-1.025C12.537 1.963 13.992 1 16 1zm0 2c-1.241 0-2.28.625-3.391 2.617l-.547 1.053C10.15 10.428 6.046 19.034 5.093 21.258l-.133.326c-.536 1.278-.731 1.98-.769 2.693-.059 1.096.31 2.203 1.033 3.079.88 1.066 2.158 1.688 3.535 1.714 1.65.03 3.23-.748 4.22-2.091l1.02-1.428 1.02 1.428c.99 1.343 2.57 2.121 4.22 2.091 1.377-.026 2.655-.648 3.535-1.714.723-.876 1.092-1.983 1.033-3.079-.038-.713-.233-1.415-.769-2.693l-.133-.326c-.953-2.224-5.057-10.83-6.969-14.588l-.547-1.053C18.28 3.625 17.241 3 16 3zm0 13c2.209 0 4 1.791 4 4 0 1.258-.581 2.38-1.493 3.111l-.229.171-.278.18c-1.205.748-2.795.748-4 0l-.278-.18-.229-.171C12.581 22.38 12 21.258 12 20c0-2.209 1.791-4 4-4zm0 2c-1.105 0-2 .895-2 2 0 .524.202 1.002.535 1.363l.135.132.17.135c.697.492 1.623.492 2.32 0l.17-.135.135-.132C17.798 21.002 18 20.524 18 20c0-1.105-.895-2-2-2z" />
              </svg>
              <span className="text-xl font-black tracking-tight text-[#FF385C] hidden sm:inline-block">
                airbnb
              </span>
            </Link>

            {/* Iconic Search Pill */}
            <div
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center rounded-full border border-gray-300 py-2 pl-6 pr-2 shadow-xs hover:shadow-md transition cursor-pointer text-sm font-semibold divide-x divide-gray-200"
            >
              <span className="pr-4 text-gray-900 truncate max-w-[120px] sm:max-w-none">
                {pillText.where}
              </span>
              <span className="px-4 text-gray-900 hidden md:inline-block">
                {pillText.when}
              </span>
              <div className="flex items-center gap-3 pl-4">
                <span className="text-gray-500 font-normal hidden lg:inline-block">
                  {pillText.who}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF385C] text-white">
                  <Search className="h-4 w-4 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Right Nav / Profile Menu */}
            <div className="flex items-center gap-2 relative" ref={menuRef}>
              <button
                onClick={toggleHostMode}
                className="hidden md:flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition cursor-pointer"
              >
                {isHost ? (
                  <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" /> Host Mode
                  </span>
                ) : (
                  "Airbnb your home"
                )}
              </button>

              <Link
                href="/messages"
                className="hidden sm:flex rounded-full p-2.5 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                title="Messages (Placeholder)"
              >
                <MessageSquare className="h-4 w-4" />
              </Link>

              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className="rounded-full p-2.5 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-gray-700" />
                )}
              </button>

              {/* Profile Pill */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 rounded-full border border-gray-300 py-1.5 px-3 hover:shadow-md transition cursor-pointer bg-white"
              >
                <Menu className="h-4 w-4 text-gray-600" />
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-gray-200"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-500 text-white">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-14 w-64 rounded-2xl border border-gray-200 bg-white py-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Current Active User Info */}
                  <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500">Active Profile ({isHost ? "Host" : "Guest"})</p>
                    <p className="text-sm font-bold text-gray-900 flex items-center justify-between">
                      {user.name}
                      {user.is_superhost && (
                        <span className="text-[10px] bg-red-100 text-[#FF385C] font-semibold px-1.5 py-0.5 rounded-full">
                          Superhost
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  {/* Switch Role Quick Toggle */}
                  <div className="px-3 py-2 border-b border-gray-100">
                    <button
                      onClick={() => {
                        toggleHostMode();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left text-xs font-semibold px-2 py-1.5 rounded-lg bg-pink-50 text-[#FF385C] hover:bg-pink-100 transition flex items-center justify-between cursor-pointer"
                    >
                      <span>Switch to {isHost ? "Guest Mode (Alex)" : "Host Mode (Elena)"}</span>
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Links */}
                  <div className="py-1">
                    <Link
                      href="/messages"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <MessageSquare className="w-4 h-4 text-gray-500" />
                      Messages
                      <span className="ml-auto text-[10px] bg-pink-100 text-[#FF385C] font-bold px-1.5 py-0.2 rounded-full">
                        Demo
                      </span>
                    </Link>
                    <Link
                      href="/trips"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Luggage className="w-4 h-4 text-gray-500" />
                      My Trips
                    </Link>
                    <Link
                      href="/wishlists"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Heart className="w-4 h-4 text-gray-500" />
                      Wishlists
                    </Link>
                    <button
                      onClick={() => {
                        setIsIdentityModalOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Identity Verification
                      <span className="ml-auto text-[10px] text-emerald-600 font-bold">Verified ✓</span>
                    </button>
                    <button
                      onClick={toggleDarkMode}
                      className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                    >
                      {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-gray-500" />}
                      <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 py-1">
                    <div className="px-4 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      Hosting
                    </div>
                    <Link
                      href="/host/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Home className="w-4 h-4 text-gray-500" />
                      Host Dashboard
                    </Link>
                    <Link
                      href="/host/create"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <PlusCircle className="w-4 h-4 text-gray-500" />
                      Create a Listing
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearchTrigger}
        initialFilters={currentFilters}
      />

      {/* Identity Verification Modal */}
      <IdentityVerificationModal
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
      />
    </>
  );
}