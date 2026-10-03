"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  ShoppingCart,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  ShieldCheck,
  Palette,
  Package,
} from "lucide-react";
import { useCart } from "./CartProvider";

export default function Header() {
  const router = useRouter();
  const pathname = router?.pathname || "";
  const { totalItems, setIsCartOpen } = useCart();
  const { data: session } = useSession();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Search state
  const [searchCategory, setSearchCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [authUser, setAuthUser] = useState<any>(null);

  const currentUser = session?.user || authUser;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setAuthUser(data.user);
      })
      .catch(() => { });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setUserDropdownOpen(false);
    await fetch("/api/auth/me", { method: "POST" }).catch(() => { });
    await signOut({ callbackUrl: "/login" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (searchCategory && searchCategory !== "all") {
      params.set("category", searchCategory);
    }
    router.push(`/shop${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/gallery", label: "Art Gallery" },

    {
      href: "/services",
      label: "Services",
      dropdown: [
        { href: "/design", label: "Graphic Design" },
        { href: "/printing", label: "Printing" },
        { href: "/digital-marketing", label: "Digital Marketing" },
        { href: "/photography", label: "Photography" },
        { href: "/videography", label: "Videography" },
        { href: "/branding", label: "Branding" },
      ],
    },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-white transition-shadow duration-200 ${isScrolled ? "shadow-md border-b border-gray-200" : "border-b border-gray-200/80"
          }`}
      >
        {/* Top green accent strip */}
        <div className="h-[3px] bg-[#128C38] w-full" />

        {/* Row 1: Main Header (Logo, Search, Utilities) */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-6 py-2 sm:py-2.5">
            {/* Logo ONLY: No text words */}
            <Link
              href="/"
              className="flex items-center shrink-0 group"
              aria-label="Home"
            >
              <Image
                src="/project-overview/logo.jpeg"
                alt="Logo"
                width={55}
                height={42}
                className="h-9 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                priority
              />
            </Link>

            {/* Center: E-commerce Search Bar */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center flex-1 max-w-xl lg:max-w-2xl border border-gray-300 hover:border-gray-400 focus-within:border-[#128C38] focus-within:ring-2 focus-within:ring-[#128C38]/20 rounded-md overflow-hidden bg-white transition-all shadow-2xs"
            >
              {/* Category Dropdown */}
              <div className="relative bg-gray-50/90 hover:bg-gray-100 border-r border-gray-200 shrink-0 transition-colors">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="appearance-none bg-transparent pl-3 sm:pl-3.5 pr-7 sm:pr-8 py-2 text-xs sm:text-sm font-medium text-gray-700 cursor-pointer focus:outline-none"
                  aria-label="Select Category"
                >
                  <option value="all">All Categories</option>
                  <option value="apparel">Apparel & T-Shirts</option>
                  <option value="stationery">Stationery & Print</option>
                  <option value="signage">Banners & Signage</option>
                  <option value="drinkware">Mugs & Drinkware</option>
                  <option value="marketing">Marketing Kits</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Text Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for custom printing, products, branding..."
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />

              {/* Green Search Button */}
              <button
                type="submit"
                className="bg-[#128C38] hover:bg-[#0E6C2B] text-white px-4 sm:px-5 py-2 flex items-center justify-center transition-colors shrink-0"
                aria-label="Search"
              >
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </form>

            {/* Right Side: Account, Wishlist, Cart */}
            <div className="flex items-center gap-1 sm:gap-4 shrink-0">
              {/* User Account / Role Aware Dropdown */}
              {currentUser ? (
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-gray-100/80 transition-colors text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#128C38] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {currentUser.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="leading-tight hidden lg:block">
                      <span className="text-xs font-bold text-gray-900 block truncate max-w-[120px]">
                        {currentUser.name?.split(" ")[0]}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium block uppercase tracking-wider">
                        {currentUser.role || "Customer"}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden lg:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {currentUser.email}
                        </p>
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-[#128C38] border border-emerald-200/60">
                          {currentUser.role === "ADMIN" ? (
                            <>
                              <ShieldCheck className="w-3 h-3" />
                              <span>Administrator</span>
                            </>
                          ) : currentUser.role === "ARTIST" ? (
                            <>
                              <Palette className="w-3 h-3" />
                              <span>Studio Artist</span>
                            </>
                          ) : (
                            <>
                              <User className="w-3 h-3" />
                              <span>Customer</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="py-1">
                        {/* Admin Portal Link */}
                        {currentUser.role === "ADMIN" && (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#128C38] transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}

                        {/* Artist Portal Link */}
                        {(currentUser.role === "ARTIST" || currentUser.role === "ADMIN") && (
                          <Link
                            href="/art-gallery/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#128C38] transition-colors"
                          >
                            <Palette className="w-4 h-4 text-amber-600" />
                            <span>Artist Studio Portal</span>
                          </Link>
                        )}

                        <Link
                          href="/my-orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#128C38] transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-500" />
                          <span>My Orders & Projects</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-1.5">
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 hover:text-[#128C38] hover:bg-gray-100/60 rounded-xl transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span>Sign In</span>
                  </Link>

                  <Link
                    href="/signup"
                    className="px-3 py-1.5 text-xs font-bold bg-[#128C38] hover:bg-[#0E6C2B] text-white rounded-xl shadow-2xs transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}


              {/* My Cart Page Link */}
              <Link
                href="/cart"
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 text-gray-700 hover:text-[#128C38] hover:bg-gray-50 rounded-md transition-colors group cursor-pointer"
                aria-label="Shopping Cart"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-gray-800 group-hover:text-[#128C38] transition-colors" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#128C38] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scale-in">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-gray-800 hidden lg:inline group-hover:text-[#128C38] transition-colors">
                  My Cart
                </span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-[#128C38] hover:bg-gray-50 rounded-md transition-colors"
                aria-label="Toggle Navigation"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar (under logo on small screens) */}
          <div className="md:hidden pb-2.5">
            <form
              onSubmit={handleSearch}
              className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white shadow-2xs"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, printing, branding..."
                className="flex-1 px-3 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#128C38] text-white px-3.5 py-1.5 flex items-center justify-center"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Row 2: Sub-Navbar (Clean text links like Image 2) */}
        <div className="border-t border-gray-100 bg-white hidden lg:block">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-2">
              <nav className="flex items-center space-x-6 xl:space-x-8 text-xs sm:text-sm font-medium text-gray-700">
                {navLinks.map((link) => {
                  const isActive =
                    pathname === link.href ||
                    link.dropdown?.some((d) => pathname === d.href);

                  if (link.dropdown) {
                    return (
                      <div
                        key={link.label}
                        className="relative"
                        onMouseEnter={() => setOpenDropdown(link.label)}
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        <button
                          className={`flex items-center gap-1 hover:text-[#128C38] transition-colors ${isActive ? "text-[#128C38] font-bold" : "text-gray-700"
                            }`}
                        >
                          {link.label}
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${openDropdown === link.label ? "rotate-180" : ""
                              }`}
                          />
                        </button>
                        {openDropdown === link.label && (
                          <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-1.5 z-50 animate-fade-in">
                            {link.dropdown.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={`block px-4 py-2 text-xs sm:text-sm transition-colors ${pathname === item.href
                                  ? "text-[#128C38] bg-emerald-50 font-bold"
                                  : "text-gray-700 hover:text-[#128C38] hover:bg-gray-50"
                                  }`}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`hover:text-[#128C38] transition-colors whitespace-nowrap ${isActive ? "text-[#128C38] font-bold" : "text-gray-700"
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Right quote button */}

            </div>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 border-t border-gray-100 bg-white ${isMobileMenuOpen ? "max-h-[500px]" : "max-h-0"
            }`}
        >
          <div className="container mx-auto px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              if (link.dropdown) {
                return (
                  <div key={link.label}>
                    <button
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === link.label ? null : link.label
                        )
                      }
                      className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:text-[#128C38] font-medium"
                    >
                      {link.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${openDropdown === link.label ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                    {openDropdown === link.label && (
                      <div className="pl-4 space-y-1 bg-gray-50 rounded-lg py-1.5 mb-1">
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-3 py-1.5 text-xs text-gray-600 hover:text-[#128C38]"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-gray-700 hover:text-[#128C38] font-medium"
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              {currentUser ? (
                <>
                  <div className="px-3 py-1 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-900 block truncate">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate">
                        {currentUser.email}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-[#128C38] border border-emerald-200/60">
                      {currentUser.role || "Customer"}
                    </span>
                  </div>

                  {currentUser.role === "ADMIN" && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full py-2 px-3 bg-gray-900 text-white text-center text-xs font-bold rounded-xl"
                    >
                      Admin Dashboard →
                    </Link>
                  )}

                  {(currentUser.role === "ARTIST" || currentUser.role === "ADMIN") && (
                    <Link
                      href="/art-gallery/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full py-2 px-3 bg-amber-600 text-white text-center text-xs font-bold rounded-xl"
                    >
                      Artist Studio Dashboard →
                    </Link>
                  )}

                  <Link
                    href="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-2.5 px-3 bg-[#128C38]/10 text-[#128C38] text-center text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Shopping Cart ({totalItems})</span>
                  </Link>

                  <Link
                    href="/my-orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full py-2 border border-gray-300 text-gray-800 text-center text-xs font-bold rounded-xl"
                  >
                    My Orders & Projects
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    className="block w-full py-2 text-rose-600 text-center text-xs font-bold rounded-xl hover:bg-rose-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 border border-gray-300 text-gray-800 text-center text-xs font-bold rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2.5 bg-[#128C38] text-white text-center text-xs font-bold rounded-xl"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
