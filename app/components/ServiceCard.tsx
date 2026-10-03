"use client";

import Image from "next/image";
import { Service } from "@/lib/data";
import { FlaskConical, Cog, Wrench, Factory, Globe, Lightbulb } from "lucide-react";

interface ServiceCardProps {
  service: Service;
  index: number;
  isVisible: boolean;
}

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  "research-development": FlaskConical,
  "product-design": Cog,
  "prototyping": Wrench,
  "design-for-manufacturing": Factory,
  "global-manufacturing": Globe,
  "innovation-consulting": Lightbulb,
};

// Blueprint images for each service
const blueprintImages = [
  "/blueprints/architectural-blueprints (1).jpg",
  "/blueprints/architectural-blueprints (2).jpg",
  "/blueprints/architectural-blueprints (3).jpg",
  "/blueprints/architectural-blueprints (4).jpg",
  "/blueprints/architectural-blueprints (5).jpg",
  "/blueprints/33918.jpg",
];

export default function ServiceCard({ service, index, isVisible }: ServiceCardProps) {
  const IconComponent = iconMap[service.id] || Cog;
  const blueprintImage = blueprintImages[index] || blueprintImages[0];
  
  return (
    <div
      className={`group relative overflow-hidden rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Blueprint Background Image */}
      <div className="absolute inset-0">
        <Image
          src={blueprintImage}
          alt={`Blueprint for ${service.title}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85 group-hover:from-black/70 group-hover:via-black/60 group-hover:to-black/75 transition-all duration-300" />
      </div>

      {/* Content */}
      <div className="relative p-8 min-h-[400px] flex flex-col z-10">
        {/* Icon Badge */}
        <div className="w-16 h-16 rounded-xl bg-[#128C38]/30 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:bg-[#128C38]/50 group-hover:scale-110 transition-all duration-300 border-2 border-[#F59E0B]/50 group-hover:border-[#F59E0B]">
          <IconComponent className="w-8 h-8 text-[#F59E0B]" />
      </div>

      {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#F59E0B] transition-colors">
        {service.title}
      </h3>

      {/* Description */}
        <p className="text-white/90 mb-6 leading-relaxed text-base font-medium flex-grow">
        {service.description}
      </p>

      {/* Benefits */}
        <ul className="space-y-3">
        {service.benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start text-sm text-white/95">
            <svg
                className="w-5 h-5 text-[#F59E0B] mr-3 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
              />
            </svg>
              <span className="font-medium">{benefit}</span>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}

