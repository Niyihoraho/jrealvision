"use client";

import { useEffect, useRef, useState } from "react";
import { companyInfo } from "@/lib/data";
import { MapPin, Mail, Phone } from "lucide-react";

export default function Contact() {
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
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative py-24 sm:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center overflow-hidden"
      >
        {/* Decorative background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#128C38]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#F59E0B]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6 transition-all duration-700 ${isHeroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
              Get In{" "}
              <span className="bg-gradient-to-r from-[#128C38] via-[#10B981] to-[#F59E0B] bg-clip-text text-transparent font-extrabold">
                Touch
              </span>
            </h1>
            <p
              className={`text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed transition-all duration-700 delay-100 ${isHeroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
              Ready to elevate your brand with top-tier design, printing, media, and marketing? Let&apos;s talk.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        ref={sectionRef}
        className="py-20 bg-gray-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Contact Information */}
            <div
              className={`space-y-8 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
            >
              <div className="text-center mb-12">
                <p className="text-gray-600 mb-8 text-lg font-medium">
                  We&apos;re here to help bring your brand vision to reality. Reach out to us through any of the following channels:
                </p>
              </div>

              {/* Contact Details */}
              <div className="grid md:grid-cols-3 gap-8">
                {/* Location */}
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 hover:border-[#128C38]/30 transition-all">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-[#128C38]/20">
                    <MapPin className="w-8 h-8 text-[#128C38]" />
                  </div>
                  <h4 className="font-bold text-foreground mb-3 text-xl">Location</h4>
                  <p className="text-gray-700 font-medium">{companyInfo.location}</p>
                </div>

                {/* Email */}
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 hover:border-[#128C38]/30 transition-all">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-[#128C38]/20">
                    <Mail className="w-8 h-8 text-[#128C38]" />
                  </div>
                  <h4 className="font-bold text-foreground mb-3 text-xl">Email</h4>
                  <a
                    href={`mailto:${companyInfo.email}`}
                    className="text-[#128C38] hover:text-[#0B5424] hover:underline font-semibold"
                  >
                    {companyInfo.email}
                  </a>
                </div>

                {/* Phone */}
                <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 hover:border-[#128C38]/30 transition-all">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-[#128C38]/20">
                    <Phone className="w-8 h-8 text-[#128C38]" />
                  </div>
                  <h4 className="font-bold text-foreground mb-3 text-xl">Phone</h4>
                  <a
                    href={`tel:${companyInfo.phone}`}
                    className="text-[#128C38] hover:text-[#0B5424] hover:underline font-semibold"
                  >
                    {companyInfo.phone}
                  </a>
                </div>
              </div>

              {/* Google Map */}
              <div className="w-full h-[400px] sm:h-[500px] rounded-xl overflow-hidden shadow-lg border-4 border-white transition-transform hover:scale-[1.01] duration-300">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3987.5330452660073!2d30.058154074967046!3d-1.9393269980430823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMcKwNTYnMjEuNiJTIDMwwrAwMyczOC42IkU!5e0!3m2!1sen!2srw!4v1768837232392!5m2!1sen!2srw"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                ></iframe>
              </div>

              {/* Social Media */}
              <div className="text-center mt-12">
                <h4 className="font-bold text-foreground mb-6 text-xl">Follow Us</h4>
                <div className="flex justify-center space-x-4">
                  {Object.entries(companyInfo.socialMedia).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      className="w-12 h-12 rounded-full bg-emerald-50 hover:bg-[#128C38] text-[#128C38] hover:text-white flex items-center justify-center transition-all hover:scale-110 border border-[#128C38]/20"
                      aria-label={platform}
                    >
                      <span className="text-sm font-bold uppercase">
                        {platform.slice(0, 2)}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

