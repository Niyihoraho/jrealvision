import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  Printer,
  Sparkles,
  Layers,
  ShieldCheck,
  Truck,
  ArrowRight,
} from "lucide-react";
import {
  getStoredServiceCards,
  INITIAL_SERVICE_CARDS,
  ServiceCardItem,
} from "@/lib/servicesData";
import { resolveMediaUrl, FALLBACK_SERVICE_IMAGE } from "@/lib/mediaUtils";

export default function PrintingPage() {
  const [capabilitiesList, setCapabilitiesList] = useState<ServiceCardItem[]>(() =>
    INITIAL_SERVICE_CARDS.filter((c) => c.category === "printing")
  );

  useEffect(() => {
    const loadCards = () => {
      const all = getStoredServiceCards();
      setCapabilitiesList(all.filter((c) => c.category === "printing"));
    };
    loadCards();
    window.addEventListener("jreal_services_updated", loadCards);
    return () => window.removeEventListener("jreal_services_updated", loadCards);
  }, []);

  return (
    <>
      <Head>
        <title>Commercial & Digital Printing | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Commercial digital, offset, large format banners, apparel screen printing and packaging in Rwanda."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-20">
        {/* Capabilities */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#128C38] bg-emerald-50 px-2.5 py-1 rounded-full inline-block mb-2">
                Printing & Production
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Our Printing Capabilities</h1>
              <p className="text-sm text-gray-500 mt-1">
                State-of-the-art machinery delivering ultra-sharp prints for every application.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/shop"
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                Browse Print Shop
              </Link>
              <Link
                href="/request-quote"
                className="px-4 py-2 text-xs font-bold text-white bg-[#128C38] hover:bg-[#0E6C2B] rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                Request Print Quote
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilitiesList.map((cap) => (
              <div
                key={cap.id || cap.title}
                className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-[#128C38]/40 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Card Image */}
                <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-slate-100 flex items-center justify-center p-3">
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-20 scale-125 pointer-events-none"
                    style={{ backgroundImage: `url("${resolveMediaUrl(cap.image, FALLBACK_SERVICE_IMAGE)}")` }}
                  />
                  <div className="relative w-full h-full z-10 flex items-center justify-center">
                    <Image
                      src={resolveMediaUrl(cap.image, FALLBACK_SERVICE_IMAGE)}
                      alt={cap.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-sm"
                    />
                  </div>
                  {cap.badge && (
                    <span className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 shadow-xs uppercase tracking-wider border border-slate-200/60">
                      {cap.badge}
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#128C38] transition-colors leading-snug">
                      {cap.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2 line-clamp-3">
                      {cap.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">In-house Printing</span>
                    <Link
                      href="/shop"
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#128C38] hover:text-white text-xs font-bold text-slate-800 transition-colors inline-flex items-center gap-1"
                    >
                      Order Products <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Large Format Callout */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-gray-900 to-black rounded p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-gray-800">
            <div className="max-w-xl">
              <span className="text-[#F59E0B] text-xs font-bold uppercase tracking-wider block mb-2">
                Large Volume & Official Tenders
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                Need Printing for Conferences, NGOs, or Elections?
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                We handle big government and NGO orders with official invoices, tax compliance, and guaranteed delivery deadlines.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link
                href="/request-quote"
                className="px-6 py-3.5 bg-[#128C38] hover:bg-[#0B5424] text-white rounded-xl font-bold text-sm text-center shadow-lg transition-all"
              >
                Request Quotation
              </Link>
              <Link
                href="/ngo-solutions"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-sm text-center transition-all"
              >
                NGO Solutions
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
