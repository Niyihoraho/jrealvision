"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative pt-[115px] sm:pt-[125px] pb-7 sm:pb-9 bg-[#0a0a0a] overflow-hidden"
      style={{
        backgroundImage: `url('/image/graphic design tool.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#128C38]/15 via-transparent to-[#F59E0B]/15 pointer-events-none" />

      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-48 h-48 bg-[#128C38]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-48 h-48 bg-[#F59E0B]/15 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="px-6 py-2.5 sm:px-7 sm:py-2.5 bg-[#128C38] hover:bg-[#0E6C2B] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 text-xs sm:text-sm flex items-center gap-1.5"
            >
              Shop Products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/request-quote"
              className="px-6 py-2.5 sm:px-7 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/25 hover:border-white/40 transition-all duration-200 text-xs sm:text-sm"
            >
              Get Services
            </Link>
          </div>

          {/* Trust Indicators in a slim row */}

        </div>
      </div>
    </section>
  );
}
