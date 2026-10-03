"use client";

import { useEffect, useRef, useState } from "react";
import { testimonials } from "@/lib/data";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

export default function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const [current, setCurrent] = useState(0);
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

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () =>
    setCurrent(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );

  const testimonial = testimonials[current];

  return (
    <section ref={sectionRef} className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            What Our{" "}
            <span className="bg-gradient-to-r from-[#128C38] to-[#F59E0B] bg-clip-text text-transparent">
              Clients Say
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real feedback from businesses and individuals we&apos;ve worked with.
          </p>
        </div>

        {/* Testimonial Card */}
        <div
          className={`max-w-3xl mx-auto transition-all duration-700 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative bg-gray-50 rounded-2xl p-8 sm:p-10 border border-gray-100 shadow-sm">
            {/* Quote Icon */}
            <div className="absolute -top-5 left-8">
              <div className="w-10 h-10 rounded-full bg-[#128C38] flex items-center justify-center shadow-lg">
                <Quote className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-4 mt-2">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]"
                />
              ))}
            </div>

            {/* Content */}
            <p className="text-gray-700 text-lg leading-relaxed mb-6 font-medium italic">
              &ldquo;{testimonial.content}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-900 text-lg">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-500">
                  {testimonial.role}, {testimonial.company}
                </div>
                {testimonial.project && (
                  <div className="text-xs text-[#128C38] font-semibold mt-1">
                    Project: {testimonial.project}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-2">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:border-[#128C38] hover:text-[#128C38] transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:border-[#128C38] hover:text-[#128C38] transition-colors shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === current
                      ? "bg-[#128C38] w-6"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
