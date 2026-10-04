"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { services } from "@/lib/data";
import {
  Palette,
  Printer,
  TrendingUp,
  Camera,
  Video,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Brush,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingBag,
  Brush,
  Palette,
  Printer,
  TrendingUp,
  Camera,
  Video,
  Star: Sparkles,
};

const serviceSubtitles: Record<string, string> = {
  shopping: "Apparel, Custom Merch & Gifts",
  gallery: "Original Rwandan Fine Art & Imigongo",
  "graphic-design": "Logos, Brand Identity & Visuals",
  printing: "Banners, Cards, Flyers & Mugs",
  "digital-marketing": "Social Media, Ads & Campaigns",
  photography: "Studio, Products & Event Shoots",
  videography: "Cinematic 4K, Commercials & Reels",
  // branding: "Complete Corporate & NGO Packages",
};

export default function ServicesShowcase() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const checkScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = useCallback((direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = 340;
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

  // Auto-slide every 3 seconds, pause on hover, loop back when reaching end
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      if (!sliderRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      if (scrollLeft >= scrollWidth - clientWidth - 10) {
        // At the end, scroll back to start
        sliderRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scroll("right");
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, scroll]);

  return (
    <section className="py-10 sm:py-14 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Centered Header */}
        <div className="text-center mb-7 sm:mb-9">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Our Services
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Complete creative and digital capabilities, all under one roof.
          </p>
          {/* Slider Arrow Controls */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous services"
              className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 shadow-xs flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Next services"
              className="w-10 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed text-gray-700 shadow-xs flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sliding Services Track */}
        <div
          ref={sliderRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="flex gap-4 sm:gap-6 overflow-x-auto scroll-smooth pb-4 pt-1 snap-x snap-mandatory focus:outline-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {services.map((service) => {
            const Icon = iconMap[service.icon] || Palette;
            const subtitle =
              serviceSubtitles[service.id] ||
              service.features.slice(0, 3).join(", ");

            return (
              <Link
                key={service.id}
                href={service.ctaLink}
                className="group relative h-52 sm:h-56 rounded-2xl sm:rounded-3xl overflow-hidden p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 flex-shrink-0 w-[275px] sm:w-[320px] lg:w-[350px] snap-start"
              >
                {/* Background Image */}
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(max-width: 640px) 275px, (max-width: 1024px) 320px, 350px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/65 group-hover:from-black/80 group-hover:via-black/50 transition-colors" />

                {/* Top: Title, Subtitle, and Frosted Icon Badge */}
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="pr-2">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-200 mt-1 font-normal line-clamp-1">
                      {subtitle}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Bottom: Action CTA Link */}
                <div className="relative z-10 flex items-center gap-2 text-xs sm:text-sm font-semibold text-white group-hover:text-[#F59E0B] transition-colors">
                  <span>{service.cta}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
