"use client";

import { useEffect, useRef, useState } from "react";
import { projects } from "@/lib/data";
import ProjectCard from "./ProjectCard";

export default function Projects() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [filter, setFilter] = useState("All");
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

  const categories = ["All", ...new Set(projects.map((p) => p.category))];
  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((p) => p.category === filter);

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
                Projects
              </span>
            </h1>
            <p
              className={`text-xl sm:text-2xl text-white/95 max-w-3xl mx-auto font-medium leading-relaxed transition-all duration-700 delay-100 ${
                isHeroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Showcasing innovation through engineering excellence
            </p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section
        id="projects"
        ref={sectionRef}
        className="py-24 sm:py-32 bg-gray-light"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2
              className={`text-4xl sm:text-5xl font-extrabold text-foreground mb-4 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Explore Our{" "}
              <span className="bg-gradient-to-r from-[#128C38] to-[#F59E0B] bg-clip-text text-transparent font-extrabold">
                Portfolio
              </span>
            </h2>
            <p
              className={`text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-700 delay-100 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Browse through our innovative projects across different industries
            </p>
          </div>

          {/* Filter Buttons */}
          <div
            className={`mb-16 transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                    filter === category
                      ? "bg-[#128C38] hover:bg-gradient-to-r hover:from-[#128C38] hover:to-[#F59E0B] text-white shadow-lg hover:shadow-xl scale-105"
                      : "bg-white text-gray-700 border-2 border-gray-200 hover:border-[#128C38] hover:text-[#128C38] hover:bg-emerald-50/50 shadow-md hover:shadow-lg"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-12">
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                isVisible={isVisible}
              />
            ))}
          </div>

          {/* Results Count & View More */}
          <div
            className={`text-center transition-all duration-700 delay-500 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {filteredProjects.length === 0 ? (
              <div className="py-12">
                <p className="text-gray-600 text-lg font-medium mb-6">
                  No projects found in this category.
                </p>
                <button
                  onClick={() => setFilter("All")}
                  className="px-8 py-4 bg-[#128C38] hover:bg-gradient-to-r hover:from-[#128C38] hover:to-[#F59E0B] text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  View All Projects
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-6 text-lg font-medium">
                  Showing {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                  {filter !== "All" && ` in ${filter}`}
                </p>
                {filteredProjects.length > 6 && (
                  <button className="px-8 py-4 bg-white text-[#128C38] border-2 border-[#128C38] rounded-full font-semibold hover:bg-gradient-to-r hover:from-[#128C38] hover:to-[#F59E0B] hover:text-white hover:border-transparent transition-all duration-300 hover:scale-105 shadow-md">
                    Load More Projects
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

