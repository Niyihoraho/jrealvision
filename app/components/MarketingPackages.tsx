"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { marketingPackages } from "@/lib/data";
import { Check, TrendingUp, Sparkles } from "lucide-react";

export default function MarketingPackages() {
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
    <section ref={sectionRef} className="py-20 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#128C38]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-[#F59E0B] text-sm font-semibold mb-6">
            <TrendingUp className="w-4 h-4" />
            Digital Marketing
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
            We Don&apos;t Just Design —{" "}
            <span className="bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] bg-clip-text text-transparent">
              We Help You Sell
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Choose a marketing package that fits your budget and goals. Let us grow your brand online.
          </p>
        </div>

        {/* Packages */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {marketingPackages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`relative p-7 rounded-2xl transition-all duration-500 ${
                pkg.highlighted
                  ? "bg-gradient-to-b from-[#128C38] to-[#0B5424] border-2 border-[#F59E0B]/50 shadow-2xl shadow-[#128C38]/20 scale-105"
                  : "bg-white/5 border border-white/10 hover:border-white/20"
              } ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${300 + index * 150}ms` }}
            >
              {/* Popular Badge */}
              {pkg.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#F59E0B] text-black text-xs font-bold rounded-full shadow-lg">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </span>
                </div>
              )}

              <h3
                className={`text-xl font-bold mb-2 ${
                  pkg.highlighted ? "text-white" : "text-white/90"
                }`}
              >
                {pkg.name}
              </h3>
              <div className="mb-6">
                <span
                  className={`text-4xl font-extrabold ${
                    pkg.highlighted ? "text-[#F59E0B]" : "text-white"
                  }`}
                >
                  {pkg.price}
                </span>
                <span className="text-white/50 text-sm ml-1">
                  RWF{pkg.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        pkg.highlighted ? "text-[#F59E0B]" : "text-[#128C38]"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        pkg.highlighted ? "text-white/90" : "text-white/70"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/digital-marketing"
                className={`block w-full py-3 rounded-xl font-bold text-center transition-all duration-300 ${
                  pkg.highlighted
                    ? "bg-[#F59E0B] hover:bg-[#FBBF24] text-black shadow-lg hover:shadow-xl"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>

        {/* Custom Quote */}
        <div
          className={`text-center mt-10 transition-all duration-700 delay-700 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-white/50 text-sm">
            Need a custom package?{" "}
            <Link
              href="/request-quote"
              className="text-[#F59E0B] hover:text-[#FBBF24] font-semibold underline underline-offset-4"
            >
              Request a Custom Quote
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
