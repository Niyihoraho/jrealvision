"use client";

import Link from "next/link";
import Image from "next/image";
import { companyInfo } from "@/lib/data";
import { MapPin, Mail, Phone, ArrowRight } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const shopLinks = [
    { href: "/shop", label: "All Products" },
    { href: "/shop?cat=t-shirts", label: "T-Shirts" },
    { href: "/shop?cat=business-cards", label: "Business Cards" },
    { href: "/shop?cat=banners", label: "Banners" },
    { href: "/shop?cat=mugs", label: "Mugs" },
  ];

  const serviceLinks = [
    { href: "/design", label: "Graphic Design" },
    { href: "/printing", label: "Printing" },
    { href: "/digital-marketing", label: "Digital Marketing" },
    { href: "/photography", label: "Photography" },
    { href: "/videography", label: "Videography" },
    { href: "/branding", label: "Branding" },
  ];

  const companyLinks = [
    { href: "/about", label: "About Us" },
    { href: "/gallery", label: "Art Gallery" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/packages", label: "Packages" },
    { href: "/contact", label: "Contact" },
    { href: "/art-gallery/login", label: "Art Gallery Dashboard" },
    { href: "/admin/login", label: "Admin Portal" },
    { href: "/request-quote", label: "Request a Quote" },
  ];

  return (
    <footer className="bg-[#0a0a0a] text-white">
      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-[#128C38] to-[#0B5424]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Ready to Start Your Project?
              </h3>
              <p className="text-white/80">
                Let&apos;s create something amazing together.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/request-quote"
                className="px-8 py-3 bg-[#F59E0B] hover:bg-[#FBBF24] text-black font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Request a Quote
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full border border-white/30 transition-all hover:scale-105"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2.5 mb-5">
              <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/logo.jpeg"
                  alt="JREAL VISION DESIGN"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-bold text-lg leading-tight">
                  <span className="text-[#16A34A]">JREAL</span>{" "}
                  <span className="text-[#F59E0B]">VISION</span>
                </div>
                <div className="text-xs text-white/50 font-medium">
                  Shop • Customize • Print • Deliver
                </div>
              </div>
            </Link>
            <p className="text-white/60 mb-5 max-w-sm leading-relaxed">
              {companyInfo.description}
            </p>
            <div className="space-y-2.5 text-sm">
              <p className="flex items-center gap-2.5 text-white/60">
                <MapPin className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                {companyInfo.location}
              </p>
              <a
                href={`mailto:${companyInfo.email}`}
                className="flex items-center gap-2.5 text-white/60 hover:text-[#16A34A] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#16A34A] flex-shrink-0" />
                {companyInfo.email}
              </a>
              <a
                href={`tel:${companyInfo.phone}`}
                className="flex items-center gap-2.5 text-white/60 hover:text-[#F59E0B] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                {companyInfo.phone}
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-bold text-base mb-5 text-[#F59E0B]">Shop</h3>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-[#16A34A] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-base mb-5 text-[#F59E0B]">
              Services
            </h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-[#16A34A] transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-base mb-5 text-[#F59E0B]">
              Company
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-[#16A34A] transition-colors text-sm flex items-center gap-1"
                  >
                    {link.label}
                    {link.label === "Request a Quote" && (
                      <ArrowRight className="w-3 h-3" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social */}
            <h3 className="font-bold text-base mb-4 mt-6 text-[#F59E0B]">
              Follow Us
            </h3>
            <div className="flex gap-2.5">
              {Object.entries(companyInfo.socialMedia).map(
                ([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#128C38] flex items-center justify-center transition-all hover:scale-110 border border-white/10 hover:border-[#F59E0B]/50"
                    aria-label={platform}
                  >
                    <span className="text-xs font-bold uppercase text-white">
                      {platform.slice(0, 2)}
                    </span>
                  </a>
                )
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm text-center sm:text-left">
              © {currentYear} JREAL VISION DESIGN. All rights reserved.
            </p>
            <p className="text-white/40 text-sm text-center sm:text-right">
              Built with 💚 in Rwanda
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
