"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Video, Play, ArrowRight } from "lucide-react";

const videoServices = [
  "Product Videos",
  "Promotional Videos",
  "Social Media Reels",
  "TikTok Videos",
  "Corporate Videos",
  "Event Videos",
  "Commercial Ads",
  "Video Editing",
];

export default function VideographyShowcase() {
  const [isVisible, setIsVisible] = useState(false);
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

  return (
    <section ref={sectionRef} className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content Side */}
          <div
            className={`order-2 lg:order-1 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
              }`}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-[#F59E0B] text-sm font-semibold mb-4">
              <Video className="w-4 h-4" />
              Videography
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Video Content That{" "}
              <span className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] bg-clip-text text-transparent">
                Drives Results
              </span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              From promotional videos to social media reels. We create engaging video content
              that captures attention and converts viewers into customers.
            </p>

            {/* Services Grid */}
            <div className="grid grid-cols-2 gap-2 mb-8">
              {videoServices.map((service) => (
                <div
                  key={service}
                  className="flex items-center gap-2 text-sm text-gray-700 font-medium"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  {service}
                </div>
              ))}
            </div>

            <Link
              href="/videography"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-[#128C38] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Booking
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Image Side */}
          <div
            className={`order-1 lg:order-2 relative transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
              }`}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="/image/videodeck.jpg"
                alt="Professional Videography by JREAL VISION"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 hover:scale-110 transition-transform cursor-pointer group">
                  <Play className="w-8 h-8 text-white ml-1 group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-4 -left-4 sm:bottom-6 sm:left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">
                    Reels & Videos
                  </div>
                  <div className="text-xs text-gray-500">
                    4K quality production
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
