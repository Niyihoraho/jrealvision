import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import GalleryFilterSidebar from "@/app/components/GalleryFilterSidebar";
import { useCart } from "@/app/components/CartProvider";
import {
  initialArtworks,
  galleryMediums,
  galleryCities,
  type Artwork,
} from "@/lib/galleryData";
import { Search, SlidersHorizontal, X, ArrowUpDown, Eye, Heart, ShieldCheck } from "lucide-react";

export default function GalleryPage() {
  const { addItem } = useCart();
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);

  // Fetch live artworks from Supabase backed API
  useEffect(() => {
    fetch("/api/artworks")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.artworks && Array.isArray(data.artworks) && data.artworks.length > 0) {
          setArtworks(data.artworks);
        }
      })
      .catch((err) => console.warn("Failed to fetch gallery artworks:", err));
  }, []);

  // Maximum artwork price rounded up
  const maxArtworkPrice = useMemo(() => {
    const highest = Math.max(...artworks.map((a) => a.price), 500000);
    return Math.ceil(highest / 50000) * 50000;
  }, [artworks]);

  // Filter States
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(maxArtworkPrice);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyWithCertificate, setOnlyWithCertificate] = useState(false);
  const [onlyFramed, setOnlyFramed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "popular">("featured");

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewArtwork, setQuickViewArtwork] = useState<Artwork | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (art: Artwork, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (art.status === "Sold") return;

    addItem({
      id: art.id,
      name: `${art.title} (${art.medium})`,
      price: art.price,
      quantity: 1,
      image: art.images.front,
      options: `${art.dimensions} • ${art.framing} • Artist: ${art.artistName}`,
    });

    setAddedId(art.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  // Toggle medium selection
  const handleToggleMedium = (medium: string) => {
    setSelectedMediums((prev) =>
      prev.includes(medium) ? prev.filter((m) => m !== medium) : [...prev, medium]
    );
  };

  // Toggle city selection
  const handleToggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedMediums([]);
    setSelectedCities([]);
    setPriceRange(maxArtworkPrice);
    setOnlyAvailable(false);
    setOnlyWithCertificate(false);
    setOnlyFramed(false);
    setSearchQuery("");
  };

  // Counts for mediums & cities
  const mediumsWithCounts = useMemo(() => {
    return galleryMediums
      .filter((m) => m !== "All Mediums")
      .map((med) => ({
        name: med,
        count: artworks.filter(
          (a) => (a.status === "Published" || a.status === "Sold") && a.medium === med
        ).length,
      }));
  }, [artworks]);

  const citiesWithCounts = useMemo(() => {
    return galleryCities
      .filter((c) => c !== "All Cities")
      .map((city) => ({
        name: city,
        count: artworks.filter(
          (a) => (a.status === "Published" || a.status === "Sold") && a.artistCity === city
        ).length,
      }));
  }, [artworks]);

  // Status counts
  const availableCount = useMemo(
    () => artworks.filter((a) => a.status === "Published").length,
    [artworks]
  );
  const certificateCount = useMemo(
    () => artworks.filter((a) => a.certificateOfAuthenticity).length,
    [artworks]
  );
  const framedCount = useMemo(
    () => artworks.filter((a) => !a.framing.includes("Unframed")).length,
    [artworks]
  );

  const hasActiveFilters =
    selectedMediums.length > 0 ||
    selectedCities.length > 0 ||
    priceRange < maxArtworkPrice ||
    onlyAvailable ||
    onlyWithCertificate ||
    onlyFramed ||
    searchQuery.trim() !== "";

  const activeFilterCount =
    selectedMediums.length +
    selectedCities.length +
    (priceRange < maxArtworkPrice ? 1 : 0) +
    (onlyAvailable ? 1 : 0) +
    (onlyWithCertificate ? 1 : 0) +
    (onlyFramed ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  // Filtered Artworks
  const filteredArtworks = useMemo(() => {
    return artworks
      .filter((art) => {
        const isPublicStatus = art.status === "Published" || art.status === "Sold";
        if (!isPublicStatus) return false;

        const matchesMedium =
          selectedMediums.length === 0 || selectedMediums.includes(art.medium);

        const matchesCity =
          selectedCities.length === 0 || selectedCities.includes(art.artistCity);

        const matchesPrice = art.price <= priceRange;

        const matchesAvailable = !onlyAvailable || art.status === "Published";

        const matchesCertificate = !onlyWithCertificate || art.certificateOfAuthenticity;

        const matchesFramed = !onlyFramed || !art.framing.includes("Unframed");

        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          art.title.toLowerCase().includes(query) ||
          art.artistName.toLowerCase().includes(query) ||
          art.medium.toLowerCase().includes(query) ||
          art.description.toLowerCase().includes(query);

        return (
          matchesMedium &&
          matchesCity &&
          matchesPrice &&
          matchesAvailable &&
          matchesCertificate &&
          matchesFramed &&
          matchesSearch
        );
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "popular") return (b.likes || 0) - (a.likes || 0);
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [
    artworks,
    selectedMediums,
    selectedCities,
    priceRange,
    onlyAvailable,
    onlyWithCertificate,
    onlyFramed,
    searchQuery,
    sortBy,
  ]);

  return (
    <>
      <Head>
        <title>Rwandan Fine Art Gallery & Marketplace | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Discover and collect original contemporary African paintings, Imigongo fusion, sculptures, and fine art from verified Rwandan artists. Escrow protected."
        />
      </Head>
      <Header />

      <main className="min-h-screen bg-[#FBFBFA] pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Main 2-Column Responsive Layout */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Desktop Left Sidebar Filter Card */}
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-28 self-start">
              <GalleryFilterSidebar
                mediums={mediumsWithCounts}
                selectedMediums={selectedMediums}
                onToggleMedium={handleToggleMedium}
                cities={citiesWithCounts}
                selectedCities={selectedCities}
                onToggleCity={handleToggleCity}
                priceRange={priceRange}
                maxPrice={maxArtworkPrice}
                onChangePriceRange={setPriceRange}
                onlyAvailable={onlyAvailable}
                onToggleOnlyAvailable={() => setOnlyAvailable(!onlyAvailable)}
                availableCount={availableCount}
                onlyWithCertificate={onlyWithCertificate}
                onToggleOnlyWithCertificate={() => setOnlyWithCertificate(!onlyWithCertificate)}
                certificateCount={certificateCount}
                onlyFramed={onlyFramed}
                onToggleOnlyFramed={() => setOnlyFramed(!onlyFramed)}
                framedCount={framedCount}
                onClearAll={handleClearAll}
                hasActiveFilters={hasActiveFilters}
                totalFilteredCount={filteredArtworks.length}
              />
            </aside>

            {/* Mobile Filter Drawer */}
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex">
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                  onClick={() => setMobileFiltersOpen(false)}
                />
                <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-white shadow-2xl overflow-y-auto flex flex-col z-10 animate-in slide-in-from-right duration-200">
                  <GalleryFilterSidebar
                    mediums={mediumsWithCounts}
                    selectedMediums={selectedMediums}
                    onToggleMedium={handleToggleMedium}
                    cities={citiesWithCounts}
                    selectedCities={selectedCities}
                    onToggleCity={handleToggleCity}
                    priceRange={priceRange}
                    maxPrice={maxArtworkPrice}
                    onChangePriceRange={setPriceRange}
                    onlyAvailable={onlyAvailable}
                    onToggleOnlyAvailable={() => setOnlyAvailable(!onlyAvailable)}
                    availableCount={availableCount}
                    onlyWithCertificate={onlyWithCertificate}
                    onToggleOnlyWithCertificate={() => setOnlyWithCertificate(!onlyWithCertificate)}
                    certificateCount={certificateCount}
                    onlyFramed={onlyFramed}
                    onToggleOnlyFramed={() => setOnlyFramed(!onlyFramed)}
                    framedCount={framedCount}
                    onClearAll={handleClearAll}
                    hasActiveFilters={hasActiveFilters}
                    totalFilteredCount={filteredArtworks.length}
                    isMobileDrawer={true}
                    onCloseMobile={() => setMobileFiltersOpen(false)}
                  />
                </div>
              </div>
            )}

            {/* Right Column: Search + Sort + Active Filter Tags + Artwork Grid */}
            <section className="flex-1 min-w-0 w-full">
              {/* Top Controls Bar */}
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-3.5 sm:p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search title, artist, medium, style..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-9 py-2.5 text-sm bg-gray-50 border border-gray-200/90 rounded-xl focus:outline-none focus:border-[#128C38] focus:ring-1 focus:ring-[#128C38]/20 focus:bg-white transition-all placeholder:text-gray-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                        aria-label="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Mobile Filters Toggle & Sort Select */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => setMobileFiltersOpen(true)}
                      className="lg:hidden flex items-center gap-2 px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200/90 rounded-xl text-sm font-semibold text-gray-800 transition-colors"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-[#128C38]" />
                      <span>Filters</span>
                      {activeFilterCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#128C38] text-white text-[11px] font-bold flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>

                    <div className="relative flex items-center">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="text-sm bg-gray-50 border border-gray-200/90 rounded-xl pl-3.5 pr-8 py-2.5 text-gray-700 font-medium focus:outline-none focus:border-[#128C38] focus:ring-1 focus:ring-[#128C38]/20 cursor-pointer appearance-none"
                      >
                        <option value="featured">Featured Curations</option>
                        <option value="popular">Most Appreciated</option>
                        <option value="price-asc">Price: Low → High</option>
                        <option value="price-desc">Price: High → Low</option>
                      </select>
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Active Filter Chips Strip */}
                {hasActiveFilters && (
                  <div className="mt-3.5 pt-3.5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 font-medium">Active:</span>

                      {/* Selected Mediums */}
                      {selectedMediums.map((med) => (
                        <span
                          key={med}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#128C38]/10 text-[#128C38] border border-[#128C38]/20"
                        >
                          {med}
                          <button
                            onClick={() => handleToggleMedium(med)}
                            className="hover:opacity-75 cursor-pointer"
                            aria-label={`Remove ${med}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}

                      {/* Selected Cities */}
                      {selectedCities.map((city) => (
                        <span
                          key={city}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          {city}
                          <button
                            onClick={() => handleToggleCity(city)}
                            className="hover:opacity-75 cursor-pointer"
                            aria-label={`Remove ${city}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}

                      {/* Price Limit */}
                      {priceRange < maxArtworkPrice && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          ≤ {priceRange.toLocaleString()} RWF
                          <button
                            onClick={() => setPriceRange(maxArtworkPrice)}
                            className="hover:opacity-75 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}

                      {/* Search Query */}
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          "{searchQuery}"
                          <button
                            onClick={() => setSearchQuery("")}
                            className="hover:opacity-75 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}

                      {/* Available Only */}
                      {onlyAvailable && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          Available Only
                          <button
                            onClick={() => setOnlyAvailable(false)}
                            className="hover:opacity-75 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}

                      {/* Certificate */}
                      {onlyWithCertificate && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          COA Included
                          <button
                            onClick={() => setOnlyWithCertificate(false)}
                            className="hover:opacity-75 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}

                      {/* Framed Only */}
                      {onlyFramed && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          Framed Only
                          <button
                            onClick={() => setOnlyFramed(false)}
                            className="hover:opacity-75 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleClearAll}
                      className="text-xs font-semibold text-[#128C38] hover:text-[#0B5424] hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* Status Counter */}
              <div className="flex items-center justify-between mb-4 px-1">
                <p className="text-xs sm:text-sm text-gray-500 font-medium">
                  Showing <span className="font-bold text-gray-900">{filteredArtworks.length}</span> of{" "}
                  <span className="font-semibold text-gray-700">{artworks.length}</span> curated artworks
                </p>
              </div>

              {/* Artwork Catalog Grid */}
              {filteredArtworks.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">No artworks match your filters</h3>
                  <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">
                    Try adjusting your medium selections, price ceiling, or artist location.
                  </p>
                  <button
                    onClick={handleClearAll}
                    className="px-5 py-2.5 bg-[#128C38] text-white text-xs font-bold rounded-xl hover:bg-[#0B5424] transition-colors cursor-pointer shadow-sm"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                  {filteredArtworks.map((art) => {
                    const isSold = art.status === "Sold";
                    const isLiked = likedMap[art.id] || false;
                    const isAdded = addedId === art.id;

                    return (
                      <article
                        key={art.id}
                        className="group bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                      >
                        {/* Artwork Image Container */}
                        <div className="relative aspect-[4/3] bg-[#f5f5f3] overflow-hidden">
                          <Link href={`/gallery/${art.id}`} className="block w-full h-full relative">
                            <Image
                              src={art.images?.front || "/image/gallery/imigongo-fusion.jpg"}
                              alt={art.title}
                              fill
                              className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                                isSold ? "grayscale-[30%]" : ""
                              }`}
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </Link>

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            {isSold ? (
                              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-gray-950 text-white px-2.5 py-1 rounded-md shadow-xs">
                                Sold
                              </span>
                            ) : art.featured ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#128C38] text-white px-2.5 py-1 rounded-md shadow-xs">
                                Featured
                              </span>
                            ) : null}
                          </div>

                          {/* Floating Actions */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            {/* Quick View Button */}
                            <button
                              onClick={() => setQuickViewArtwork(art)}
                              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-gray-700 shadow-sm flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105"
                              title="Quick Preview"
                              aria-label="Quick Preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Like Button */}
                            <button
                              onClick={(e) => toggleLike(art.id, e)}
                              className={`w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center transition-all hover:scale-105 ${
                                isLiked ? "text-rose-500" : "text-gray-500 hover:text-rose-500"
                              }`}
                              aria-label="Favorite"
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500" : ""}`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span className="font-semibold text-gray-800">{art.artistName}</span>
                              <span>{art.artistCity}</span>
                            </div>

                            <Link href={`/gallery/${art.id}`}>
                              <h3 className="font-bold text-base text-gray-900 group-hover:text-[#128C38] transition-colors line-clamp-1 mb-1">
                                {art.title}
                              </h3>
                            </Link>

                            <p className="text-xs text-gray-500 line-clamp-1 mb-3">
                              {art.medium} • {art.dimensions}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-[11px] text-gray-400 font-medium">Price</p>
                              <span className="text-base font-extrabold text-gray-900">
                                {art.price.toLocaleString()}{" "}
                                <span className="text-xs font-semibold text-gray-500">RWF</span>
                              </span>
                            </div>

                            {isSold ? (
                              <span className="text-xs font-bold text-gray-400 px-3 py-1.5 rounded-lg bg-gray-100">
                                Sold Out
                              </span>
                            ) : (
                              <button
                                onClick={(e) => handleAddToCart(art, e)}
                                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                                  isAdded
                                    ? "bg-[#128C38] text-white"
                                    : "bg-gray-900 hover:bg-[#128C38] text-white hover:shadow-md"
                                }`}
                              >
                                {isAdded ? "Added ✓" : "Acquire"}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* How Escrow Works */}
          <section className="mt-24 bg-white rounded-2xl border border-gray-200/90 p-8 sm:p-12 shadow-xs">
            <div className="text-center mb-10">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-[#128C38] mb-2">
                Trust & Protection
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                How Our Escrow Protects Collectors & Artists
              </h2>
              <p className="text-sm text-gray-500 max-w-xl mx-auto">
                Every transaction on JREAL Fine Art is protected by automated escrow. Funds are never released to the artist until you verify condition and delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {[
                {
                  step: "01",
                  title: "Payment Lock",
                  desc: "Collector pays via MTN MoMo, Airtel or Card. Funds are locked in platform escrow.",
                },
                {
                  step: "02",
                  title: "Fulfillment",
                  desc: "Artist securely packages artwork and hands it to a verified courier partner.",
                },
                {
                  step: "03",
                  title: "Delivery",
                  desc: "Buyer receives artwork safely at doorstep or office with digital sign-off.",
                },
                {
                  step: "04",
                  title: "48h Inspection",
                  desc: "Buyer has 48 hours to confirm condition matches gallery certificate.",
                },
                {
                  step: "05",
                  title: "Instant Payout",
                  desc: "70% net sale is instantly disbursed directly to artist's mobile money wallet.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="bg-gray-50/70 border border-gray-200/70 rounded-xl p-5 text-center flex flex-col justify-between"
                >
                  <span className="text-2xl font-black text-[#128C38] block mb-2">{item.step}</span>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Artist CTA */}
          <section className="mt-16 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 rounded-2xl p-8 sm:p-12 text-white text-center shadow-xl border border-white/10">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#128C38] mb-2">
              For Rwandan Artists
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-tight">
              Showcase & Sell Your Art Globally
            </h3>
            <p className="text-gray-300 text-sm max-w-lg mx-auto mb-8 leading-relaxed">
              Connect your MTN MoMo or Airtel Money account, upload your portfolio, and reach collectors across Rwanda and worldwide. Retain 70% of every sale with guaranteed payout.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/join-as-artist"
                className="px-7 py-3.5 bg-[#128C38] hover:bg-[#0B5424] text-white font-bold rounded-xl text-sm transition-all hover:scale-105 shadow-md"
              >
                Apply as an Artist
              </Link>
              <Link
                href="/art-gallery/login"
                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium rounded-xl text-sm transition-colors"
              >
                Artist Portal
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Quick View Modal */}
      {quickViewArtwork && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setQuickViewArtwork(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/10] bg-[#f5f5f3] w-full overflow-hidden rounded-t-2xl">
              <Image
                src={quickViewArtwork.images?.front || "/image/gallery/imigongo-fusion.jpg"}
                alt={quickViewArtwork.title}
                fill
                className="object-contain"
              />
              <button
                onClick={() => setQuickViewArtwork(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-black transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    {quickViewArtwork.artistName} · {quickViewArtwork.artistCity}, Rwanda ·{" "}
                    {quickViewArtwork.year}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900">{quickViewArtwork.title}</h3>
                </div>
                <span className="text-xl font-black text-gray-900 whitespace-nowrap">
                  {quickViewArtwork.price.toLocaleString()} RWF
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-gray-100 text-xs">
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <span className="text-gray-400 block mb-0.5">Medium</span>
                  <span className="font-bold text-gray-800">{quickViewArtwork.medium}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <span className="text-gray-400 block mb-0.5">Dimensions</span>
                  <span className="font-bold text-gray-800">{quickViewArtwork.dimensions}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <span className="text-gray-400 block mb-0.5">Framing</span>
                  <span className="font-bold text-gray-800">{quickViewArtwork.framing}</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-lg">
                  <span className="text-gray-400 block mb-0.5">Certificate</span>
                  <span className="font-bold text-gray-800">COA Verified</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">
                {quickViewArtwork.description}
              </p>

              {quickViewArtwork.curatorNotes && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs text-emerald-900">
                  <span className="font-bold block mb-1">Curator Note</span>
                  {quickViewArtwork.curatorNotes}
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-2">
                <Link
                  href={`/gallery/${quickViewArtwork.id}`}
                  className="text-xs font-bold text-[#128C38] hover:underline"
                >
                  Full Artwork Details →
                </Link>

                <button
                  onClick={(e) => {
                    handleAddToCart(quickViewArtwork, e);
                    setQuickViewArtwork(null);
                  }}
                  disabled={quickViewArtwork.status === "Sold"}
                  className="px-6 py-2.5 bg-[#128C38] hover:bg-[#0B5424] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {quickViewArtwork.status === "Sold" ? "Sold" : "Acquire with Escrow"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
