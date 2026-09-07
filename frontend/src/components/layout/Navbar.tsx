"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  User as UserIcon,
  Heart,
  Luggage,
  Home,
  PlusCircle,
  MessageSquare,
  ShieldCheck,
  Sun,
  Moon,
  ArrowRightLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSearch } from "@/context/SearchContext";
import SearchModal from "./SearchModal";
import IdentityVerificationModal from "@/components/auth/IdentityVerificationModal";

export default function Navbar() {
  const { user, isHost, switchUser, toggleHostMode } = useAuth();
  const { filters, openSearchModal } = useSearch();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const getPillLabels = () => {
    const where = filters.search || filters.city || "Anywhere";
    let when = "Any week";
    if (filters.start_date) {
      const s = filters.start_date.split("-").slice(1).join("/");
      const e = filters.end_date ? filters.end_date.split("-").slice(1).join("/") : "";
      when = e ? `${s} - ${e}` : s;
    }
    const who = filters.guests ? `${filters.guests} guest${filters.guests > 1 ? "s" : ""}` : "Add guests";
    const hasActiveFilters = Boolean(filters.search || filters.city || filters.start_date || filters.guests);

    return { where, when, who, hasActiveFilters };
  };

  const pill = getPillLabels();

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
              className="flex items-center rounded-full border border-gray-300 py-1.5 pl-5 pr-2 shadow-xs hover:shadow-md transition cursor-pointer text-sm font-semibold divide-x divide-gray-200 bg-white"
            >
              {/* Where Button */}
              <button
                type="button"
                onClick={() => openSearchModal("where")}
                className="pr-4 text-left truncate max-w-[130px] sm:max-w-none text-gray-900 hover:text-black transition cursor-pointer"
              >
                {pill.where}
              </button>

              {/* When Button */}
              <button
                type="button"
                onClick={() => openSearchModal("dates")}
                className="px-4 text-left text-gray-900 hidden md:inline-block hover:text-black transition cursor-pointer"
              >
                {pill.when}
              </button>

              {/* Who / Guests Button */}
              <div
                onClick={() => openSearchModal("who")}
                className="flex items-center gap-3 pl-4 cursor-pointer"
              >
                <span className={`text-sm hidden lg:inline-block ${filters.guests ? "text-gray-900 font-bold" : "text-gray-500 font-normal"}`}>
                  {pill.who}
                </span>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#FF385C] text-white hover:brightness-105 transition">
                  <Search className="h-4 w-4 stroke-[2.5]" />
                  {pill.hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-black rounded-full ring-2 ring-white" />
                  )}
                </div>
              </div>
            </div>

            {/* Right Nav Controls */}
            <div className="flex items-center gap-2 relative" ref={menuRef}>
              {/* Airbnb your home / Switch to traveling Button */}
              <button
                onClick={toggleHostMode}
                className="hidden md:flex items-center rounded-full px-4 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 transition cursor-pointer"
              >
                {isHost ? "Switch to traveling" : "Airbnb your home"}
              </button>

              {/* Messages Link */}
              <Link
                href="/messages"
                className="hidden sm:flex rounded-full p-2.5 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                title="Messages"
              >
                <MessageSquare className="h-4 w-4" />
              </Link>

              {/* Dark Mode Quick Toggle */}
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

              {/* Authentic Airbnb User Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-3 rounded-full border border-gray-300 py-1.5 px-3 hover:shadow-md transition cursor-pointer bg-white"
                aria-expanded={isMenuOpen}
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

              {/* Authentic Airbnb Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-14 w-60 rounded-2xl border border-gray-200 bg-white py-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-gray-100">
                  {/* Mode-Specific Sections */}
                  {isHost ? (
                    /* HOST MODE MENU */
                    <>
                      <div className="px-4 py-2.5 bg-gray-50/70">
                        <p className="text-xs text-gray-500 font-medium">Hosting as</p>
                        <p className="text-sm font-bold text-gray-900 truncate flex items-center gap-1.5 mt-0.5">
                          {user.name}
                          <span className="text-[10px] bg-red-100 text-[#FF385C] font-bold px-1.5 py-0.2 rounded-full">
                            Superhost
                          </span>
                        </p>
                      </div>

                      <div className="py-1">
                        <Link
                          href="/host/dashboard"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
                        >
                          <Home className="w-4 h-4 text-gray-500" />
                          Host dashboard
                        </Link>
                        <Link
                          href="/host/create"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
                        >
                          <PlusCircle className="w-4 h-4 text-gray-500" />
                          Create a new listing
                        </Link>
                        <Link
                          href="/messages"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
                        >
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                          Messages
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            toggleHostMode();
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#FF385C] hover:bg-pink-50/50 transition cursor-pointer"
                        >
                          <ArrowRightLeft className="w-4 h-4 text-[#FF385C]" />
                          Switch to traveling
                        </button>
                      </div>
                    </>
                  ) : (
                    /* GUEST MODE MENU */
                    <>
                      <div className="py-1">
                        <Link
                          href="/trips"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition"
                        >
                          <Luggage className="w-4 h-4 text-gray-600" />
                          Trips
                        </Link>
                        <Link
                          href="/wishlists"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
                        >
                          <Heart className="w-4 h-4 text-gray-600" />
                          Wishlists
                        </Link>
                        <Link
                          href="/messages"
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
                        >
                          <MessageSquare className="w-4 h-4 text-gray-600" />
                          Messages
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            toggleHostMode();
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition cursor-pointer"
                        >
                          <Home className="w-4 h-4 text-gray-600" />
                          Airbnb your home
                        </button>
                        <button
                          onClick={() => {
                            setIsIdentityModalOpen(true);
                            setIsMenuOpen(false);
                          }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          Identity verification
                        </button>
                      </div>
                    </>
                  )}

                  {/* Shared Settings & Preferences */}
                  <div className="py-1">
                    <button
                      onClick={toggleDarkMode}
                      className="w-full text-left flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        {isDarkMode ? (
                          <Sun className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Moon className="w-4 h-4 text-gray-600" />
                        )}
                        <span>{isDarkMode ? "Light theme" : "Dark theme"}</span>
                      </div>
                    </button>

                    <div className="px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
                      <span className="truncate">{user.email}</span>
                      <button
                        onClick={() => {
                          toggleHostMode();
                          setIsMenuOpen(false);
                        }}
                        className="text-[#FF385C] font-semibold hover:underline cursor-pointer ml-2 shrink-0"
                      >
                        Switch user
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Search Modal */}
      <SearchModal />

      {/* Identity Verification Modal */}
      <IdentityVerificationModal
        isOpen={isIdentityModalOpen}
        onClose={() => setIsIdentityModalOpen(false)}
      />
    </>
  );
}