import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  Video,
  ArrowRight,
  Send,
  CheckCircle2,
} from "lucide-react";
import {
  ServiceCardItem,
  INITIAL_SERVICE_CARDS,
  getStoredServiceCards,
} from "@/lib/servicesData";
import { resolveMediaUrl, FALLBACK_SERVICE_IMAGE } from "@/lib/mediaUtils";

export default function VideographyPage() {
  const [videoList, setVideoList] = useState<ServiceCardItem[]>(() =>
    INITIAL_SERVICE_CARDS.filter((c) => c.category === "videography")
  );

  useEffect(() => {
    const cards = getStoredServiceCards().filter((c) => c.category === "videography");
    if (cards.length > 0) setVideoList(cards);

    const onUpdate = () => {
      const updated = getStoredServiceCards().filter((c) => c.category === "videography");
      if (updated.length > 0) setVideoList(updated);
    };
    window.addEventListener("jreal_services_updated", onUpdate);
    return () => window.removeEventListener("jreal_services_updated", onUpdate);
  }, []);
  const [videoType, setVideoType] = useState("Social Media Reels & TikToks");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("Standard (150k - 350k RWF)");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSelectVideo = (title: string) => {
    setVideoType(title);
    const formElement = document.getElementById("book-video");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const activeVideoItem = videoList.find((v) => v.title === videoType) || videoList[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceCategory: "Videography",
          shootType: videoType,
          location: "Kigali Production Team",
          clientName,
          phone,
          notes: `Budget: ${budget}. Scope: ${description}`,
        }),
      });
    } catch (err) {
      console.error("Videography booking error:", err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <>
      <Head>
        <title>Commercial Videography & Reels | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="High-impact commercial video production, social media reels, 4K drone cinematography, and documentaries in Rwanda."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-20">
        {/* Video Formats Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#128C38] bg-emerald-50 px-2.5 py-1 rounded-full inline-block mb-2">
                Cinematic Videography & Reels
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Video Production Specialties</h1>
              <p className="text-sm text-gray-500 mt-1">
                End-to-end production: Concept scriptwriting, filming, drone piloting, sound design, and color grading.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/portfolio"
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                View Reel Portfolio
              </Link>
              <a
                href="#book-video"
                className="px-4 py-2 text-xs font-bold text-white bg-[#128C38] hover:bg-[#0E6C2B] rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                Book Video
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoList.map((type) => {
              const isSelected = videoType === type.title;

              return (
                <div
                  key={type.id || type.title}
                  onClick={() => handleSelectVideo(type.title)}
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
                      <span>Selected Format</span>
                    </span>
                  )}

                  {/* Card Image */}
                  <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-slate-100 flex items-center justify-center p-3">
                    <div
                      className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-20 scale-125 pointer-events-none"
                      style={{ backgroundImage: `url("${resolveMediaUrl(type.image, FALLBACK_SERVICE_IMAGE)}")` }}
                    />
                    <div className="relative w-full h-full z-10 flex items-center justify-center">
                      <Image
                        src={resolveMediaUrl(type.image, FALLBACK_SERVICE_IMAGE)}
                        alt={type.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-sm"
                      />
                    </div>
                    <span className="absolute top-3 right-3 z-20 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs border border-white/20">
                      {type.badge}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className={`text-lg font-bold transition-colors leading-snug ${isSelected ? "text-[#128C38]" : "text-slate-900 group-hover:text-[#128C38]"}`}>
                        {type.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-2 line-clamp-3">
                        {type.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">4K UHD Production</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectVideo(type.title);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
                            <span>Book Format</span>
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

        {/* Booking Form */}
        <section id="book-video" className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl scroll-mt-28">
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-xl">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#128C38] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Videography Inquiry Sent!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Thank you, <strong className="text-gray-900">{clientName}</strong>! Our video producer will contact you at <strong>{phone}</strong> to discuss scripting, shooting dates, and technical details.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center max-w-xl mx-auto mb-6">
                  <span className="text-xs uppercase font-bold tracking-wider text-[#128C38] bg-emerald-50 px-3 py-1 rounded-full">
                    Production Request
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 mb-2">
                    Book Videography Services
                  </h2>
                  <p className="text-xs text-gray-500">
                    Tell us what you want to film and our team will prepare equipment, shooting schedules, and costs.
                  </p>
                </div>

                {/* ── Smart Connected Service Banner ── */}
                {activeVideoItem && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border border-emerald-200/80 overflow-hidden shrink-0 shadow-2xs p-1">
                        <Image
                          src={resolveMediaUrl(activeVideoItem.image, FALLBACK_SERVICE_IMAGE)}
                          alt={activeVideoItem.title}
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
                          {activeVideoItem.title}
                        </h4>
                        <span className="text-xs font-semibold text-[#128C38]">
                          {activeVideoItem.badge} • 4K UHD Production
                        </span>
                      </div>
                    </div>

                    <a
                      href="#videography-grid"
                      className="text-xs font-semibold text-[#128C38] hover:text-[#0E6C2B] underline underline-offset-2 shrink-0 self-start sm:self-center"
                    >
                      Change Format Card ↑
                    </a>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Video Format *
                    </label>
                    <select
                      value={videoType}
                      onChange={(e) => setVideoType(e.target.value)}
                      className="w-full text-sm p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] font-semibold text-slate-900"
                    >
                      {videoList.map((v) => (
                        <option key={v.id || v.title} value={v.title}>
                          {v.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Estimated Budget Range
                    </label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full text-sm p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                    >
                      <option value="Starter (80k - 150k RWF)">Starter (80k - 150k RWF)</option>
                      <option value="Standard (150k - 350k RWF)">Standard (150k - 350k RWF)</option>
                      <option value="Premium (350k - 800k RWF)">Premium (350k - 800k RWF)</option>
                      <option value="Enterprise / Documentary (1M+ RWF)">Enterprise / Documentary (1M+ RWF)</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
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
                      Phone Number *
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
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Project Concept & Objectives
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us about the video concept, length, desired music style, location, timeline..."
                    className="w-full text-sm p-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#128C38] hover:bg-[#0B5424] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  Submit Video Production Request
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
