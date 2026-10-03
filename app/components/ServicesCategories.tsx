"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface ServiceCategory {
  id: string;
  category: string;
  title: string;
  image: string;
  description: string;
}

const categories: ServiceCategory[] = [
  {
    id: "product-design",
    category: "Product Design & Engineering",
    title: "3D CAD Design & Engineering Solutions",
    image: "/blueprints/architectural-blueprints (4).jpg",
    description: "Expert CAD design and engineering services using industry-standard tools like SolidWorks for precision and manufacturability.",
  },
  {
    id: "prototyping",
    category: "Prototyping & Fabrication",
    title: "Rapid Prototyping & Functional Testing",
    image: "/blueprints/architectural-blueprintsss (1).jpg.png",
    description: "From digital models to physical prototypes, we bring your designs to life for testing and validation.",
  },
  {
    id: "manufacturing",
    category: "Manufacturing Support",
    title: "Global Manufacturing & Production Coordination",
    image: "/blueprints/architectural-blueprintsssss (1).jpg",
    description: "Connect with reliable manufacturing partners globally, with specialized Rwanda-China collaboration support.",
  },
  {
    id: "innovation",
    category: "Innovation Consulting",
    title: "End-to-End Product Development Services",
    image: "/image/Customized mobile classroom bus-inside bus.jpg",
    description: "Strategic guidance for entrepreneurs and startups to navigate the product development journey from idea to market.",
  },
];

export default function ServicesCategories() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 bg-gray-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2
            className={`text-3xl sm:text-4xl font-extrabold text-foreground mb-3 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            What We{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-extrabold">
              Do
            </span>
          </h2>
          <p
            className={`text-base sm:text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Comprehensive solutions from concept to market-ready products
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`bg-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-primary/20 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${200 + index * 100}ms`,
              }}
            >
              {/* Image Container */}
              <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                {/* Category Label */}
                <div className="mb-2">
                  <span className="text-xs font-semibold text-[#128C38] uppercase tracking-wider">
                    {category.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-[#128C38] transition-colors leading-tight">
                  {category.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>

                {/* Button */}
                <Link
                  href="/projects"
                  className="inline-block w-full text-center px-4 py-2.5 bg-[#128C38] hover:bg-gradient-to-r hover:from-[#128C38] hover:to-[#F59E0B] text-white font-semibold transition-all duration-300 text-sm shadow-md hover:shadow-lg rounded-lg hover:scale-[1.02]"
                >
                  Check the Projects
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

