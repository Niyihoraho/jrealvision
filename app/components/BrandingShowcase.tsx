"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Star, ArrowRight, ArrowDown } from "lucide-react";

const brandingSteps = [
  { label: "Logo", icon: "🎨" },
  { label: "Business Cards", icon: "💳" },
  { label: "Signboard", icon: "🏷️" },
  { label: "T-Shirts", icon: "👕" },
  { label: "Social Media", icon: "📱" },
  { label: "Photography", icon: "📷" },
  { label: "Video", icon: "🎬" },
  { label: "Marketing", icon: "📈" },
];

export default function BrandingShowcase() {
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
    <section ref={sectionRef} className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-[#128C38] text-sm font-semibold mb-4">
            <Star className="w-4 h-4" />
            Complete Branding
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Start Your Business With{" "}
            <span className="bg-gradient-to-r from-[#128C38] to-[#F59E0B] bg-clip-text text-transparent">
              JREAL VISION
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From idea to brand to customers. Get a complete business launch package
            rather than ordering individual services.
          </p>
        </div>

        {/* Branding Flow */}
        <div
          className={`max-w-4xl mx-auto mb-14 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {brandingSteps.map((step, index) => (
              <div key={step.label} className="relative">
                <div className="flex flex-col items-center p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#128C38]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                  <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                    {step.icon}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 text-center">
                    {step.label}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Step {index + 1}
                  </span>
                </div>
                {/* Arrow between cards (hidden on last item of each row) */}
                {index < brandingSteps.length - 1 && (index + 1) % 4 !== 0 && (
                  <div className="hidden sm:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ArrowRight className="w-4 h-4 text-[#128C38]/40" />
                  </div>
                )}
                {/* Down arrow for mobile between rows */}
                {index < brandingSteps.length - 1 && (index + 1) % 2 === 0 && (index + 1) % 4 !== 0 && (
                  <div className="sm:hidden absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
                    <ArrowDown className="w-4 h-4 text-[#128C38]/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Card */}
        <div
          className={`max-w-3xl mx-auto bg-gradient-to-r from-[#128C38] to-[#0B5424] rounded-2xl p-8 sm:p-10 text-center shadow-xl transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Ready to Launch Your Business?
          </h3>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Get everything you need in one complete package. From logo design to digital marketing — we handle it all.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/start-your-business"
              className="px-8 py-3.5 bg-[#F59E0B] hover:bg-[#FBBF24] text-black font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-base"
            >
              Start Your Business
            </Link>
            <Link
              href="/packages"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/30 transition-all duration-300 hover:scale-105"
            >
              View Packages
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
