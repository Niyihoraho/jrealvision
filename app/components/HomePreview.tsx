"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { services, projects, companyInfo, stats, highlights } from "@/lib/data";
import ServiceCard from "./ServiceCard";
import ProjectCard from "./ProjectCard";
import { ArrowRight, Target, Users, Network, DollarSign, Briefcase, Award, Factory, Compass, Eye } from "lucide-react";

export default function HomePreview() {
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

    return () => observer.disconnect();
  }, []);

  // Show only first 3 services and 6 projects
  const previewServices = services.slice(0, 3);
  const previewProjects = projects.slice(0, 6);

  return (
    <>
      {/* About Preview */}
      <section
        ref={sectionRef}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
 

          {/* Stats Counter with Blueprint Backgrounds */}
          <div className="mb-16">
            {/* Section Header for Stats */}
            <div className="text-center mb-12">
              <h2
                className={`text-4xl sm:text-5xl font-extrabold text-foreground mb-4 transition-all duration-700 delay-300 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                Our{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-extrabold">
                  Achievements
                </span>
              </h2>
              <p
                className={`text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-700 delay-400 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                Numbers that reflect our commitment to excellence
              </p>
            </div>

            <div
              className={`grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8 transition-all duration-700 delay-500 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              {stats.map((stat, index) => {
                const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
                  Briefcase,
                  Award,
                  Users,
                  Factory,
                };
                const IconComponent = stat.icon ? iconMap[stat.icon] : null;
                
                // Assign different blueprint images to each stat
                const blueprintImages = [
                  "/blueprints/architectural-blueprints (1).jpg",
                  "/blueprints/architectural-blueprints (2).jpg",
                  "/blueprints/architectural-blueprints (3).jpg",
                  "/blueprints/architectural-blueprints (4).jpg",
                ];
                
                return (
                  <div
                    key={index}
                    className="group relative h-[280px] sm:h-[320px] overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    {/* Blueprint Background Image */}
                    <div className="absolute inset-0">
                      <Image
                        src={blueprintImages[index] || blueprintImages[0]}
                        alt={`Blueprint background for ${stat.label}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                      {/* Dark overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 group-hover:from-black/60 group-hover:via-black/50 group-hover:to-black/60 transition-all duration-300" />
                    </div>
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center z-10">
                      {IconComponent && (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-xl bg-[#128C38]/30 backdrop-blur-sm flex items-center justify-center border-2 border-[#F59E0B]/50 group-hover:bg-[#128C38]/50 group-hover:border-[#F59E0B] transition-all duration-300">
                          <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-[#F59E0B]" />
                        </div>
                      )}
                      <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                        {stat.value}
                        {stat.suffix}
                      </div>
                      <div className="text-sm sm:text-base lg:text-lg text-white/95 font-semibold">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Why Choose Us Preview */}
          <div className="text-center mb-12">
            <h3
              className={`text-4xl sm:text-5xl font-extrabold text-foreground mb-6 transition-all duration-700 delay-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Why Choose Us
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {highlights.map((highlight, index) => {
              const icons = [Target, Users, Network, DollarSign];
              const IconComponent = icons[index];
              
              return (
                <div
                  key={index}
                  className={`p-6 rounded-xl bg-white shadow-md hover:shadow-lg border border-gray-200 hover:border-[#128C38]/30 transition-all ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ transitionDelay: `${600 + index * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
                    <IconComponent className="w-5 h-5 text-[#128C38]" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-3">
                    {highlight.title}
                  </h4>
                  <p className="text-gray-600 text-base leading-relaxed font-medium">
                    {highlight.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              href="/about"
              className="inline-block px-10 py-5 bg-[#128C38] hover:bg-gradient-to-r hover:from-[#128C38] hover:to-[#F59E0B] text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-[#16A34A]/30"
            >
              Learn More About Us
              <ArrowRight className="w-5 h-5 inline-block ml-2" />
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}

