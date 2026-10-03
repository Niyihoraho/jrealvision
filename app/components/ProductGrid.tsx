"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { productCategories, products } from "@/lib/data";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Layers } from "lucide-react";

const categoryMeta: Record<string, { desc: string; startingPrice: string }> = {
  "t-shirts": {
    desc: "Custom printed cotton tees, polos, jerseys & hoodies",
    startingPrice: "8,000 RWF",
  },
  "business-cards": {
    desc: "Standard & luxury double-sided cards with special finish",
    startingPrice: "25,000 RWF",
  },
  banners: {
    desc: "Heavy-duty outdoor & event vinyl print banners",
    startingPrice: "15,000 RWF",
  },
  mugs: {
    desc: "Ceramic & magic color-changing heat-sensitive mugs",
    startingPrice: "5,000 RWF",
  },
  stickers: {
    desc: "Custom-cut waterproof decals & branded sheet labels",
    startingPrice: "3,000 RWF",
  },
  posters: {
    desc: "High-resolution glossy & matte wall poster prints",
    startingPrice: "5,000 RWF",
  },
  flyers: {
    desc: "Full-color double-sided marketing flyers & pamphlets",
    startingPrice: "20,000 RWF",
  },
  "rollup-banners": {
    desc: "Retractable pull-up stands for conferences & expos",
    startingPrice: "45,000 RWF",
  },
  invitations: {
    desc: "Luxury textured cards for weddings, galas & launches",
    startingPrice: "10,000 RWF",
  },
  notebooks: {
    desc: "Executive embossed leatherette & hardcover notebooks",
    startingPrice: "12,000 RWF",
  },
  frames: {
    desc: "Solid wood & floating frames for certificates & art",
    startingPrice: "18,000 RWF",
  },
  promotional: {
    desc: "Corporate gifts, lanyards, caps, pens & branded merch",
    startingPrice: "4,000 RWF",
  },
};

export default function ProductGrid() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Dynamic Categories synced with Admin Portal
  const [displayedCategories, setDisplayedCategories] = useState<any[]>(() => {
    return productCategories;
  });

  useEffect(() => {
    const syncCategories = () => {
      try {
        const saved = localStorage.getItem("jreal_admin_categories");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setDisplayedCategories(parsed.filter((c: any) => c.showOnHomeSlider !== false));
            return;
          }
        }
      } catch (e) { }
      setDisplayedCategories(productCategories);
    };

    syncCategories();
    window.addEventListener("jreal_categories_updated", syncCategories);
    window.addEventListener("storage", syncCategories);

    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories)) {
          setDisplayedCategories(data.categories.filter((c: any) => c.showOnHomeSlider !== false));
        }
      })
      .catch(() => { });

    return () => {
      window.removeEventListener("jreal_categories_updated", syncCategories);
      window.removeEventListener("storage", syncCategories);
    };
  }, []);

  const checkScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = useCallback((direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 320;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    checkScroll();
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        slider.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, []);

  // Gentle auto-slide, pauses when user hovers over the slider
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (!sliderRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      if (scrollLeft >= scrollWidth - clientWidth - 10) {
        sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroll("right");
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isPaused, scroll]);

  return (
    <section id="shop" className="py-12 sm:py-16 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>

            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Shop our products
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mt-1 max-w-xl">
              Browse our curated merchandise categories click any category to explore products your needs.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${canScrollLeft
                ? "border-gray-200 hover:border-gray-400 bg-white text-gray-800 hover:scale-105 shadow-xs"
                : "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                }`}
              aria-label="Previous categories"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${canScrollRight
                ? "border-gray-200 hover:border-gray-400 bg-white text-gray-800 hover:scale-105 shadow-xs"
                : "border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50"
                }`}
              aria-label="Next categories"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Single-Slide Showcase */}
        <div
          ref={sliderRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {displayedCategories.map((cat) => {
            const meta = categoryMeta[cat.id] || {
              desc: cat.description || "High quality custom branding & merchandise",
              startingPrice: cat.startingPrice || "From 5,000 RWF",
            };

            const directCount = products.filter((p) => p.category === cat.id).length;
            const displayCount = directCount > 0 ? directCount : cat.productCount;
            const desc = cat.description || meta.desc;
            const startingPrice = cat.startingPrice || meta.startingPrice;

            // Featured items selected in admin portal
            const featuredItems = (cat.featuredProductIds || [])
              .map((id: string) => products.find((p) => p.id === id))
              .filter(Boolean);

            return (
              <div
                key={cat.id}
                className="group w-[280px] sm:w-[310px] shrink-0 bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Category Image */}
                <Link
                  href={`/shop?category=${cat.id}`}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 block"
                >
                  <Image
                    src={cat.image || "/image/shopping_merch.jpg"}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="320px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Top Badge: Item Count & Featured Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-white/95 text-gray-900 backdrop-blur-xs px-2.5 py-1 rounded-md shadow-xs">
                      <Layers className="w-3 h-3 text-[#128C38]" />
                      {displayCount} Products
                    </span>
                    {featuredItems.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#128C38] text-white px-2 py-1 rounded-md shadow-xs">

                        Featured
                      </span>
                    )}
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-semibold text-white bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-md">
                      {startingPrice.startsWith("From") ? startingPrice : `From ${startingPrice}`}
                    </span>
                  </div>
                </Link>

                {/* Card Content & Shop Button */}
                <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <Link href={`/shop?category=${cat.id}`}>
                      <h3 className="font-bold text-base text-gray-900 group-hover:text-[#128C38] transition-colors leading-snug mb-1.5 line-clamp-1">
                        {cat.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-3">
                      {desc}
                    </p>

                    {/* Curated showcase products badge / chips if configured */}

                  </div>

                  {/* Replaced Add to Cart button with direct Shop button */}
                  <div className="pt-2">
                    <Link
                      href={`/shop?category=${cat.id}`}
                      className="w-full py-2.5 px-4 bg-[#128C38] hover:bg-[#0B5424] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs hover:shadow-md group/btn"
                    >
                      <span>Shop {cat.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Products Catalog CTA */}
        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-7 py-3 bg-gray-900 hover:bg-[#128C38] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Explore Complete Merch Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
