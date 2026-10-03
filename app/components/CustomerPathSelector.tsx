"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Briefcase, Building2, ArrowRight } from "lucide-react";

export default function CustomerPathSelector() {
  const paths = [
    {
      title: "Personal",
      subtitle: "Custom Apparel, Mugs & Prints",
      cta: "Shop Products",
      href: "/shop",
      icon: ShoppingBag,
      image: "/image/printing_products.jpg",
    },
    {
      title: "Business",
      subtitle: "Brand Identity, Printing & Marketing",
      cta: "Grow Your Business",
      href: "/business-solutions",
      icon: Briefcase,
      image: "/image/digital_marketing.jpg",
    },
    {
      title: "NGO / Organization",
      subtitle: "Annual Reports & Campaigns",
      cta: "Explore Solutions",
      href: "/ngo-solutions",
      icon: Building2,
      image: "/image/graphic design tool.jpg",
    },
  ];

  return (
    <section className="py-10 sm:py-14 bg-gray-50/70">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Clean, modest header without gradient */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            What Do You Need?
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1.5">
            Choose the path tailored to your project
          </p>
        </div>

        {/* Cards styled like the reference image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <Link
                key={path.title}
                href={path.href}
                className="group relative h-52 sm:h-56 rounded-2xl sm:rounded-3xl overflow-hidden p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300"
              >
                {/* Background Image */}
                <Image
                  src={path.image}
                  alt={path.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/65 group-hover:from-black/80 group-hover:via-black/50 transition-colors" />

                {/* Top: Title, Subtitle, and Frosted Icon Badge */}
                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                      {path.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-200 mt-1 font-normal">
                      {path.subtitle}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Bottom: Action CTA Link */}
                <div className="relative z-10 flex items-center gap-2 text-xs sm:text-sm font-semibold text-white group-hover:text-[#F59E0B] transition-colors">
                  <span>{path.cta}</span>
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
