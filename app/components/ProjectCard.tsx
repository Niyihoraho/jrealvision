"use client";

import Image from "next/image";
import Link from "next/link";
import { Project } from "@/lib/data";
import { ArrowRight } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  index: number;
  isVisible: boolean;
}

export default function ProjectCard({ project, index, isVisible }: ProjectCardProps) {
  return (
    <div
      className={`group bg-white rounded-2xl border border-gray-200 hover:border-primary/30 overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ 
        transitionDelay: `${index * 100}ms`,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 20px 50px -12px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(18, 140, 56, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      }}
    >
      {/* Project Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <Image
          src={project.images[0]}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 bg-gradient-to-r from-[#128C38] to-[#0B5424] text-white text-[10px] font-bold rounded-md shadow-md uppercase tracking-wide border border-[#F59E0B]/30">
            {project.category}
          </span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card Content */}
      <div className="p-5 bg-white">
        {/* Title */}
        <h3 className="text-lg font-bold text-[#0D1612] mb-2.5 group-hover:text-[#128C38] transition-colors leading-tight">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4 font-normal line-clamp-3">
          {project.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#128C38]"></span>
            <span>{project.category}</span>
          </div>
          
          <Link
            href={`/projects/${project.id}`}
            className="flex items-center gap-1.5 text-[#128C38] hover:text-[#0B5424] font-semibold text-xs hover:gap-2 transition-all group/btn"
          >
            <span>View Project</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

