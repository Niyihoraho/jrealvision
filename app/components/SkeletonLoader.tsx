"use client";

import { useEffect, useState } from "react";

interface SkeletonLoaderProps {
  isVisible: boolean;
}

export default function SkeletonLoader({ isVisible }: SkeletonLoaderProps) {
  const [mounted, setMounted] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isVisible && mounted) {
      // Delay removal for smooth fade out
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(true);
    }
  }, [isVisible, mounted]);

  if (!shouldRender || !mounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#0D1612] overflow-hidden transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Hero Section Skeleton */}
      <div className="relative min-h-screen flex items-center bg-[#0D1612]">
        {/* Background shimmer effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 skeleton-dark opacity-30"></div>
          <div className="absolute inset-0 skeleton-shimmer-dark"></div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />

        {/* Content Skeleton */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Title Skeleton */}
            <div className="space-y-4">
              <div className="h-16 sm:h-20 lg:h-24 skeleton skeleton-shimmer mx-auto max-w-3xl rounded-lg"></div>
              <div className="h-16 sm:h-20 lg:h-24 skeleton skeleton-shimmer mx-auto max-w-2xl rounded-lg"></div>
            </div>

            {/* Description Skeleton */}
            <div className="space-y-3 pt-4">
              <div className="h-6 skeleton skeleton-shimmer mx-auto max-w-2xl rounded"></div>
              <div className="h-6 skeleton skeleton-shimmer mx-auto max-w-xl rounded"></div>
              <div className="h-6 skeleton skeleton-shimmer mx-auto max-w-lg rounded"></div>
            </div>
          </div>
        </div>

        {/* Floating shimmer particles - Ocean wave effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-32 skeleton-dark opacity-10"
              style={{
                top: `${30 + i * 25}%`,
                left: '0',
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${2.5 + i * 0.3}s`,
                transform: `translateX(${i % 2 === 0 ? '-100%' : '100%'})`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Additional sections skeleton (below fold) */}
      <div className="bg-gray-light py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Left side - Text skeleton */}
            <div className="space-y-4">
              <div className="h-10 skeleton skeleton-shimmer w-3/4 rounded-lg"></div>
              <div className="h-4 skeleton skeleton-shimmer w-full rounded"></div>
              <div className="h-4 skeleton skeleton-shimmer w-full rounded"></div>
              <div className="h-4 skeleton skeleton-shimmer w-5/6 rounded"></div>
            </div>

            {/* Right side - Image skeleton */}
            <div className="h-96 skeleton skeleton-shimmer rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-12 skeleton skeleton-shimmer w-64 mx-auto mb-12 rounded-lg"></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 skeleton skeleton-shimmer rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

