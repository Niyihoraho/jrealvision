"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { services } from "@/lib/data";
import ServiceCard from "./ServiceCard";

export default function Services() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsHeroVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      heroObserver.observe(heroRef.current);
    }

    return () => {
      observer.disconnect();
      heroObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* Hero Section with Blueprint */}
    <section
        ref={heroRef}
        className="relative py-32 min-h-[500px] flex items-center overflow-hidden"
        style={{
          backgroundImage: `url('/blueprints/architectural-blueprints.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        
        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 transition-all duration-700 ${
                isHeroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Our{" "}
              <span className="bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-white bg-clip-text text-transparent font-extrabold">
              Services
            </span>
            </h1>
          <p
              className={`text-xl sm:text-2xl text-white/95 max-w-3xl mx-auto font-medium leading-relaxed transition-all duration-700 delay-100 ${
                isHeroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Comprehensive solutions from concept to market-ready products
          </p>
        </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        ref={sectionRef}
        className="py-24 sm:py-32 bg-gray-light"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Services Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* CTA */}
        <div
            className={`text-center mt-16 transition-all duration-700 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-gray-700 mb-8 text-xl font-semibold">
            Ready to bring your innovation to life?
          </p>
            <Link
              href="/contact"
            className="inline-block px-10 py-5 bg-[#128C38] hover:bg-gradient-to-r hover:from-[#128C38] hover:to-[#F59E0B] text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-[#16A34A]/30"
          >
            Let's Discuss Your Project
            </Link>
        </div>
      </div>
    </section>
    </>
  );
}

