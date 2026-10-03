import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import ShopFilterSidebar from "@/app/components/ShopFilterSidebar";
import { products, productCategories } from "@/lib/data";
import { Search, SlidersHorizontal, X, ArrowUpDown, Sparkles } from "lucide-react";

export default function ShopPage() {
  const router = useRouter();

  const [catalogProducts, setCatalogProducts] = useState<any[]>(products);

  // Sync products from Supabase via backend endpoint
  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          const mapped = data.products.map((p: any) => ({
            id: p.id,
            name: p.name || p.title,
            category: p.category,
            price: Number(p.price) || 0,
            image: Array.isArray(p.images) && p.images[0] ? p.images[0] : (p.image || "/image/printing_products.jpg"),
            description: p.description || "",
            featured: Boolean(p.featured),
            rating: p.rating || 4.9,
            reviewsCount: p.reviewsCount || 18,
            customizable: true,
            tags: [p.category],
          }));
          setCatalogProducts(mapped);
        }
      })
      .catch((err) => console.warn("Products sync warning:", err));
  }, []);

  // Find max catalog price dynamically
  const maxCatalogPrice = useMemo(() => {
    const highest = Math.max(...catalogProducts.map((p) => p.price), 50000);
    return Math.ceil(highest / 5000) * 5000;
  }, [catalogProducts]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [priceRange, setPriceRange] = useState<number>(maxCatalogPrice);
  const [onlyCustomizable, setOnlyCustomizable] = useState(false);
  const [onlyBudget, setOnlyBudget] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync query params from URL
  useEffect(() => {
    if (router.isReady) {
      if (typeof router.query.search === "string" && router.query.search) {
        setSearchQuery(router.query.search);
      }
      if (typeof router.query.category === "string" && router.query.category && router.query.category !== "all") {
        setSelectedCategories([router.query.category]);
      }
    }
  }, [router.isReady, router.query]);

  // Synchronize categories with Admin Portal
  const [categoriesList, setCategoriesList] = useState<any[]>(productCategories);

  useEffect(() => {
    const syncCategories = () => {
      try {
        const saved = localStorage.getItem("jreal_admin_categories");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategoriesList(parsed);
            return;
          }
        }
      } catch (e) {}
      setCategoriesList(productCategories);
    };

    syncCategories();
    window.addEventListener("jreal_categories_updated", syncCategories);
    window.addEventListener("storage", syncCategories);

    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories)) {
          setCategoriesList(data.categories);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener("jreal_categories_updated", syncCategories);
      window.removeEventListener("storage", syncCategories);
    };
  }, []);

  // Compute live counts for each category
  const categoriesWithCounts = useMemo(() => {
    return categoriesList.map((cat) => ({
      id: cat.id,
      name: cat.name,
      count: catalogProducts.filter((p) => p.category === cat.id).length,
    }));
  }, [categoriesList, catalogProducts]);

  // Compute counts for features
  const customizableCount = useMemo(
    () => catalogProducts.filter((p) => p.customizable).length,
    [catalogProducts]
  );
  const budgetCount = useMemo(
    () => catalogProducts.filter((p) => p.price <= 15000).length,
    [catalogProducts]
  );

  // Toggle category
  const handleToggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  // Clear all filters
  const handleClearAll = () => {
    setSelectedCategories([]);
    setSearchQuery("");
    setPriceRange(maxCatalogPrice);
    setOnlyCustomizable(false);
    setOnlyBudget(false);
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    searchQuery.trim() !== "" ||
    priceRange < maxCatalogPrice ||
    onlyCustomizable ||
    onlyBudget;

  const activeFilterCount =
    selectedCategories.length +
    (searchQuery.trim() ? 1 : 0) +
    (priceRange < maxCatalogPrice ? 1 : 0) +
    (onlyCustomizable ? 1 : 0) +
    (onlyBudget ? 1 : 0);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return catalogProducts
      .filter((product) => {
        const matchesCategory =
          selectedCategories.length === 0 || selectedCategories.includes(product.category);

        const matchesPrice = product.price <= priceRange;

        const matchesCustomizable = !onlyCustomizable || product.customizable;

        const matchesBudget = !onlyBudget || product.price <= 15000;

        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query);

        return matchesCategory && matchesPrice && matchesCustomizable && matchesBudget && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [catalogProducts, selectedCategories, priceRange, onlyCustomizable, onlyBudget, searchQuery, sortBy]);

  return (
    <>
      <Head>
        <title>Shop Custom Products & Merch | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Order custom printed T-shirts, business cards, banners, mugs, stickers, and branded promotional products online in Rwanda."
        />
      </Head>
      <Header />

      <main className="min-h-screen bg-[#FBFBFA] pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Main 2-Column Responsive Layout */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Desktop Left Sidebar Filter Card */}
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-28 self-start">
              <ShopFilterSidebar
                categories={categoriesWithCounts}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
                priceRange={priceRange}
                maxPrice={maxCatalogPrice}
                onChangePriceRange={setPriceRange}
                onlyCustomizable={onlyCustomizable}
                onToggleCustomizable={() => setOnlyCustomizable(!onlyCustomizable)}
                onlyBudget={onlyBudget}
                onToggleBudget={() => setOnlyBudget(!onlyBudget)}
                onClearAll={handleClearAll}
                hasActiveFilters={hasActiveFilters}
                customizableCount={customizableCount}
                budgetCount={budgetCount}
                totalFilteredCount={filteredProducts.length}
              />
            </aside>

            {/* Mobile Filter Drawer */}
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex">
                {/* Backdrop */}
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                  onClick={() => setMobileFiltersOpen(false)}
                />

                {/* Drawer Container */}
                <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-white shadow-2xl overflow-y-auto flex flex-col z-10 animate-in slide-in-from-right duration-200">
                  <ShopFilterSidebar
                    categories={categoriesWithCounts}
                    selectedCategories={selectedCategories}
                    onToggleCategory={handleToggleCategory}
                    priceRange={priceRange}
                    maxPrice={maxCatalogPrice}
                    onChangePriceRange={setPriceRange}
                    onlyCustomizable={onlyCustomizable}
                    onToggleCustomizable={() => setOnlyCustomizable(!onlyCustomizable)}
                    onlyBudget={onlyBudget}
                    onToggleBudget={() => setOnlyBudget(!onlyBudget)}
                    onClearAll={handleClearAll}
                    hasActiveFilters={hasActiveFilters}
                    customizableCount={customizableCount}
                    budgetCount={budgetCount}
                    totalFilteredCount={filteredProducts.length}
                    isMobileDrawer={true}
                    onCloseMobile={() => setMobileFiltersOpen(false)}
                  />
                </div>
              </div>
            )}

            {/* Right Column: Search Bar + Sort + Active Filter Tags + Product Grid */}
            <section className="flex-1 min-w-0 w-full">
              {/* Top Controls Bar */}
              <div className="bg-white rounded-2xl border border-gray-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] p-3.5 sm:p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search merchandise, apparel, print..."
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

                  {/* Mobile Filter Toggle & Sort Select */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    {/* Mobile Filters Button */}
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

                    {/* Sort Select */}
                    <div className="relative flex items-center">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="text-sm bg-gray-50 border border-gray-200/90 rounded-xl pl-3.5 pr-8 py-2.5 text-gray-700 font-medium focus:outline-none focus:border-[#128C38] focus:ring-1 focus:ring-[#128C38]/20 cursor-pointer appearance-none"
                      >
                        <option value="featured">Featured</option>
                        <option value="price-asc">Price: Low → High</option>
                        <option value="price-desc">Price: High → Low</option>
                        <option value="name">Name: A to Z</option>
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

                      {/* Selected Category Chips */}
                      {selectedCategories.map((catId) => {
                        const name =
                          productCategories.find((c) => c.id === catId)?.name || catId;
                        return (
                          <span
                            key={catId}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#128C38]/10 text-[#128C38] border border-[#128C38]/20"
                          >
                            {name}
                            <button
                              onClick={() => handleToggleCategory(catId)}
                              className="hover:opacity-75 cursor-pointer"
                              aria-label={`Remove ${name} filter`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}

                      {/* Price Chip */}
                      {priceRange < maxCatalogPrice && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          ≤ {priceRange.toLocaleString()} RWF
                          <button
                            onClick={() => setPriceRange(maxCatalogPrice)}
                            className="hover:opacity-75 cursor-pointer"
                            aria-label="Remove price filter"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}

                      {/* Search Chip */}
                      {searchQuery && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          "{searchQuery}"
                          <button
                            onClick={() => setSearchQuery("")}
                            className="hover:opacity-75 cursor-pointer"
                            aria-label="Remove search query"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}

                      {/* Customizable Chip */}
                      {onlyCustomizable && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Customizable
                          <button
                            onClick={() => setOnlyCustomizable(false)}
                            className="hover:opacity-75 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}

                      {/* Budget Chip */}
                      {onlyBudget && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Budget (&lt; 15,000 RWF)
                          <button
                            onClick={() => setOnlyBudget(false)}
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
                  Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> of{" "}
                  <span className="font-semibold text-gray-700">{products.length}</span> products
                </p>
              </div>

              {/* Products Catalog Grid */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">No products match your filters</h3>
                  <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">
                    Try adjusting your category selection, price range, or search terms to find what you're looking for.
                  </p>
                  <button
                    onClick={handleClearAll}
                    className="px-5 py-2.5 bg-[#128C38] text-white text-xs font-bold rounded-xl hover:bg-[#0B5424] transition-colors cursor-pointer shadow-sm"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Bottom Banner */}
          <div className="mt-16">
            <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 rounded-2xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
              <div className="max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#128C38]/20 border border-[#128C38]/40 text-[#128C38] text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Wholesale & Commercial Orders
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">
                  Ordering in Bulk or Need Custom Artwork?
                </h3>
                <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                  We provide corporate volume discounts for companies, NGOs, events, and schools. Get an official quotation tailored to your exact quantities and branding specifications.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <Link
                  href="/request-quote"
                  className="px-6 py-3.5 bg-[#128C38] hover:bg-[#0B5424] text-white rounded-xl font-bold text-sm text-center shadow-lg transition-all hover:scale-105"
                >
                  Request Custom Quote
                </Link>
                <Link
                  href="/business-solutions"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-sm text-center transition-all"
                >
                  Business Solutions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
