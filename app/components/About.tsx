"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { stats, highlights, companyInfo } from "@/lib/data";
import {
  Palette,
  Printer,
  TrendingUp,
  Camera,
  Video,
  Star,
  Sparkles,
  Users,
  Briefcase,
  ShoppingBag,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function About() {
  const [isVisible, setIsVisible] = useState(true);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [counters, setCounters] = useState(stats.map(() => 0));
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHeroVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (heroRef.current) heroObserver.observe(heroRef.current);

    const contentObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          animateCounters();
          hasAnimated.current = true;
        }
      },
      { threshold: 0.1 }
    );
    if (contentRef.current) contentObserver.observe(contentRef.current);

    return () => {
      heroObserver.disconnect();
      contentObserver.disconnect();
    };
  }, []);

  const animateCounters = () => {
    stats.forEach((stat, index) => {
      const target = parseInt(stat.value);
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setCounters((prev) => {
          const newCounters = [...prev];
          newCounters[index] = Math.floor(current);
          return newCounters;
        });
      }, duration / steps);
    });
  };

  const statIcons = [Users, Briefcase, ShoppingBag, Award];

  return (
    <>
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative py-28 bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white overflow-hidden"
      >
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#128C38]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#F59E0B]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            About{" "}
            <span className="bg-gradient-to-r from-[#128C38] via-[#10B981] to-[#F59E0B] bg-clip-text text-transparent">
              JREAL VISION DESIGN
            </span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
            {companyInfo.description} Empowering Rwanda&apos;s entrepreneurs, organizations, and institutions through end-to-end creative solutions.
          </p>
        </div>
      </section>

      {/* Story & Philosophy */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs uppercase font-bold tracking-wider text-[#128C38] bg-emerald-50 px-3 py-1 rounded-full">
                Who We Are
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                Rwanda&apos;s Leading One-Stop Creative Platform
              </h2>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Founded in Kigali, <strong>JREAL VISION DESIGN</strong> was built to solve a major problem faced by Rwandan businesses: having to contract different freelancers for design, separate printers for collateral, different photographers for product shoots, and yet another team for marketing.
              </p>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                We brought all five pillars under one roof. When you work with JREAL VISION, your visual identity flows seamlessly from your digital logo into physical banners, employee uniforms, stunning photo galleries, viral video reels, and high-ROI digital ad campaigns.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Our Mission</h4>
                  <p className="text-xs text-gray-500">{companyInfo.mission}</p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                  <h4 className="font-bold text-gray-900 text-sm mb-1">Our Vision</h4>
                  <p className="text-xs text-gray-500">{companyInfo.vision}</p>
                </div>
              </div>
            </div>

            {/* Visual Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-md">
                <Image
                  src="/image/graphic design tool.jpg"
                  alt="Graphic design tools"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-md translate-y-6">
                <Image
                  src="/image/comera extensions.jpg"
                  alt="Camera equipment"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Counter Stats */}
      <section ref={contentRef} className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComp = statIcons[index] || Star;
              return (
                <div key={stat.label} className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#F59E0B] flex items-center justify-center mx-auto mb-4">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <div className="text-3xl sm:text-5xl font-extrabold text-white mb-2">
                    {counters[index]}
                    {stat.suffix}
                  </div>
                  <div className="text-xs uppercase font-bold tracking-wider text-gray-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold tracking-wider text-[#128C38] bg-emerald-50 px-3 py-1 rounded-full">
              Why JREAL VISION
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-3">
              Why Rwanda Chooses Us
            </h2>
            <p className="text-sm text-gray-600">
              Built around speed, quality, and unified branding convenience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#128C38] flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-gray-900 mb-2">{h.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
