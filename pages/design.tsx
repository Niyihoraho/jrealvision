import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { companyInfo } from "@/lib/data";
import {
  Palette,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Send,
} from "lucide-react";
import {
  ServiceCardItem,
  INITIAL_SERVICE_CARDS,
  getStoredServiceCards,
} from "@/lib/servicesData";

export default function DesignPage() {
  const [servicesList, setServicesList] = useState<ServiceCardItem[]>(() =>
    INITIAL_SERVICE_CARDS.filter((c) => c.category === "design")
  );

  useEffect(() => {
    const cards = getStoredServiceCards().filter((c) => c.category === "design");
    if (cards.length > 0) setServicesList(cards);

    const onUpdate = () => {
      const updated = getStoredServiceCards().filter((c) => c.category === "design");
      if (updated.length > 0) setServicesList(updated);
    };
    window.addEventListener("jreal_services_updated", onUpdate);
    return () => window.removeEventListener("jreal_services_updated", onUpdate);
  }, []);

  const [selectedService, setSelectedService] = useState("Logo & Brand Identity");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deadline, setDeadline] = useState("3-5 days");
  const [brief, setBrief] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSelectService = (title: string) => {
    setSelectedService(title);
    const formElement = document.getElementById("order-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const activeServiceItem = servicesList.find((s) => s.title === selectedService) || servicesList[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Head>
        <title>Graphic Design Services | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Professional graphic design services in Kigali: logos, brand identities, packaging, flyers, social media, and menus."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-20">
        {/* Services Grid */}
        <div id="specialties-grid" className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16 scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#128C38] bg-emerald-50 px-2.5 py-1 rounded-full inline-block mb-2">
                Graphic Design
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Our Design Specialties</h1>
              <p className="text-sm text-gray-500 mt-1">
                Select any card below to connect it directly to your order specifications.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/portfolio"
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                View Portfolio
              </Link>
              <a
                href="#order-form"
                className="px-4 py-2 text-xs font-bold text-white bg-[#128C38] hover:bg-[#0E6C2B] rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                Order Project
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesList.map((service) => {
              const isSelected = selectedService === service.title;

              return (
                <div
                  key={service.id || service.title}
                  onClick={() => handleSelectService(service.title)}
                  className={`group relative bg-white rounded-2xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${
                    isSelected
                      ? "border-2 border-[#128C38] ring-4 ring-[#128C38]/15 shadow-xl scale-[1.01]"
                      : "border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-[#128C38]/40"
                  }`}
                >
                  {/* Selected Indicator Badge */}
                  {isSelected && (
                    <span className="absolute top-3 left-3 z-30 bg-[#128C38] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selected Service</span>
                    </span>
                  )}

                  {/* Card Image */}
                  <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-slate-100 flex items-center justify-center p-3">
                    <div
                      className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-20 scale-125 pointer-events-none"
                      style={{ backgroundImage: `url("${service.image || '/service/Minimal Brand Identity Design With Maximum Impact.jpeg'}")` }}
                    />
                    <div className="relative w-full h-full z-10 flex items-center justify-center">
                      <Image
                        src={service.image || "/service/Minimal Brand Identity Design With Maximum Impact.jpeg"}
                        alt={service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-sm"
                      />
                    </div>
                    {service.popular && !isSelected && (
                      <span className="absolute top-3 right-3 z-20 bg-[#128C38] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                        Most Requested
                      </span>
                    )}
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={`text-lg font-bold transition-colors leading-snug ${isSelected ? "text-[#128C38]" : "text-slate-900 group-hover:text-[#128C38]"}`}>
                          {service.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mt-2 line-clamp-3">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Starting from</span>
                        <span className="text-base font-extrabold text-[#128C38]">{service.priceOrRate || (service as any).startingPrice}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectService(service.title);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? "bg-[#128C38] text-white shadow-sm ring-2 ring-[#128C38]/20"
                            : "bg-slate-100 hover:bg-[#128C38] hover:text-white text-slate-800"
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </>
                        ) : (
                          <>
                            <span>Select & Order</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Order Form */}
        <section id="order-form" className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl scroll-mt-28">
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-xl">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#128C38] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Design Request Received!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Thank you, <strong className="text-gray-900">{clientName}</strong>! Our design team has received your brief for <strong>{selectedService}</strong> and will contact you via phone/WhatsApp at <strong>{phone}</strong> within 2 hours.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center max-w-xl mx-auto mb-6">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#128C38] bg-emerald-50 px-3 py-1 rounded-full">
                    Fast Track Request
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 mb-2">
                    Order Your Design
                  </h2>
                  <p className="text-xs text-gray-500">
                    Fill out the quick form below. Our designers will review your specs and send a draft concept.
                  </p>
                </div>

                {/* ── Smart Connected Service Banner ── */}
                {activeServiceItem && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-emerald-200/80 overflow-hidden shrink-0 shadow-2xs p-1">
                        <Image
                          src={activeServiceItem.image || "/service/Minimal Brand Identity Design With Maximum Impact.jpeg"}
                          alt={activeServiceItem.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#128C38]" /> Connected from Card
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 mt-1">
                          {activeServiceItem.title}
                        </h4>
                        <span className="text-xs font-semibold text-[#128C38]">
                          Starting from {activeServiceItem.priceOrRate || (activeServiceItem as any).startingPrice || "Custom Quote"}
                        </span>
                      </div>
                    </div>

                    <a
                      href="#specialties-grid"
                      className="text-xs font-semibold text-[#128C38] hover:text-[#0E6C2B] underline underline-offset-2 shrink-0 self-start sm:self-center"
                    >
                      Change Specialty Card ↑
                    </a>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Choose Service *
                    </label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full text-sm p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] font-semibold text-slate-900"
                    >
                      {servicesList.map((s) => (
                        <option key={s.id || s.title} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Target Turnaround / Deadline *
                    </label>
                    <select
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full text-sm p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                    >
                      <option value="24-48 hours (Rush)">24 - 48 Hours (Rush Priority)</option>
                      <option value="3-5 days">3 - 5 Business Days (Standard)</option>
                      <option value="1-2 weeks">1 - 2 Weeks (Complex Brand Suite)</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Your Name / Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Kigali Bistro / Alice"
                      className="w-full text-sm p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0788 000 000"
                      className="w-full text-sm p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contact@example.com"
                      className="w-full text-sm p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Project Brief & Requirements *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="Describe your design vision, preferred colors, text to include, slogan, target audience..."
                    className="w-full text-sm p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#128C38] hover:bg-[#0B5424] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  Submit Design Order
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
