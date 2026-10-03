"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoSlide {
  image: string;
  category: string;
  title: string;
  badge: string;
}

const photoSlides: PhotoSlide[] = [
  {
    image: "/image/photography/wedding.jpg",
    category: "Weddings & Ceremonies",
    title: "Timeless vows, Gusaba & celebration moments",
    badge: "Weddings & Birthdays",
  },
  {
    image: "/image/photography/conference.jpg",
    category: "Conferences & Summits",
    title: "Keynote speeches, executive delegates & symposiums",
    badge: "Conferences & Corporate",
  },
  {
    image: "/image/photography/tourism.jpg",
    category: "Travel & Tourism Moments",
    title: "Scenic rolling hills, Virunga volcanoes & adventures",
    badge: "Travel & Tourism",
  },
  {
    image: "/image/photography/brand.jpg",
    category: "Brand & Commercial Shoots",
    title: "Bespoke products, studio models & creative branding",
    badge: "Brand & Commercial",
  },
];



export default function PhotographyShowcase() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % photoSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + photoSlides.length) % photoSlides.length);
  }, []);

  // Automatic slide progression every 4 seconds, pauses on hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          {/* Left Image Division: Interactive Image Slider */}
          <div
            className={`relative transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
              }`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Main Slideshow Frame */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border border-gray-100 group">
              {photoSlides.map((slide, index) => {
                const isActive = index === currentSlide;
                return (
                  <div
                    key={slide.image}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? "opacity-100 z-10 scale-100" : "opacity-0 z-0 scale-105 pointer-events-none"
                      } transition-transform duration-1000`}
                  >
                    <Image
                      src={slide.image}
                      alt={slide.title}
                      fill
                      priority={index === 0}
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />

                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />


                    {/* Bottom Caption on the slide */}
                    <div className="absolute bottom-16 sm:bottom-18 left-4 right-4 sm:left-6 sm:right-6 z-20 text-white">
                      <p className="text-xs uppercase tracking-wider font-semibold text-[#F59E0B]">
                        {slide.category}
                      </p>
                      <h4 className="text-base sm:text-xl font-bold mt-0.5 leading-snug drop-shadow-md">
                        {slide.title}
                      </h4>
                    </div>
                  </div>
                );
              })}

              {/* Slider Navigation Arrows */}
              <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between items-center z-20 pointer-events-none">
                <button
                  onClick={prevSlide}
                  aria-label="Previous photo slide"
                  className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 backdrop-blur-md hover:bg-black/75 text-white border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Next photo slide"
                  className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/45 backdrop-blur-md hover:bg-black/75 text-white border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Slide Indicator Dots / Progress Bars */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15">
                {photoSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${index === currentSlide
                      ? "w-6 bg-[#128C38]"
                      : "w-2 bg-white/40 hover:bg-white/70"
                      }`}
                  />
                ))}
              </div>
            </div>


          </div>

          {/* Right Content Division: Enhanced Text */}
          <div
            className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
              }`}
          >
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-[#128C38] text-xs sm:text-sm font-semibold mb-4 border border-emerald-100/60 shadow-xs">
              <Camera className="w-4 h-4 text-[#128C38]" />
              Photography & Memories
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15] mb-4">
              Capture Life’s Moments & Brands{" "}
              <span className="bg-gradient-to-r from-[#128C38] via-[#10762F] to-[#F59E0B] bg-clip-text text-transparent">
                Beautifully
              </span>
            </h2>

            {/* Enhanced Description */}
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
              Photography is not only about business branding, it is about preserving life’s most cherished milestones.
              From romantic <strong>weddings and Gusaba</strong>, vibrant <strong>birthdays</strong>, and high-level <strong>corporate conferences</strong>,
              to breathtaking <strong>travel & tourism adventures</strong> across Rwanda’s green hills and volcanoes, and striking <strong>commercial brand visuals</strong>.
              Our skilled Rwandan photographers capture every memory with heart, clarity, and precision.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/photography"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#128C38] hover:bg-[#0E6C2B] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
              >
                Booking
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
