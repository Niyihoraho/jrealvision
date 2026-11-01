import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { companyInfo } from "@/lib/data";
import {
  TrendingUp,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  getStoredServiceCards,
  INITIAL_SERVICE_CARDS,
  ServiceCardItem,
  getStoredMarketingPackages,
  INITIAL_MARKETING_PACKAGES,
  MarketingPackageItem,
} from "@/lib/servicesData";
import { resolveMediaUrl, FALLBACK_SERVICE_IMAGE } from "@/lib/mediaUtils";

export default function DigitalMarketingPage() {
  const [marketingCards, setMarketingCards] = useState<ServiceCardItem[]>(() =>
    INITIAL_SERVICE_CARDS.filter((c) => c.category === "marketing")
  );
  const [packageList, setPackageList] = useState<MarketingPackageItem[]>(
    INITIAL_MARKETING_PACKAGES
  );

  useEffect(() => {
    const loadData = () => {
      const allCards = getStoredServiceCards();
      setMarketingCards(allCards.filter((c) => c.category === "marketing"));
      setPackageList(getStoredMarketingPackages());
    };
    loadData();
    window.addEventListener("jreal_services_updated", loadData);
    window.addEventListener("jreal_marketing_pkgs_updated", loadData);
    return () => {
      window.removeEventListener("jreal_services_updated", loadData);
      window.removeEventListener("jreal_marketing_pkgs_updated", loadData);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Digital Marketing Solutions | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="We don't just design your products — we help you sell them. Monthly social media, TikTok ads, and growth retainers in Rwanda."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-20">
        {/* Pillars / Service Cards */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#128C38] bg-emerald-50 px-2.5 py-1 rounded-full inline-block mb-2">
                Digital Marketing & Ads
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Marketing & Growth Campaigns</h1>
              <p className="text-sm text-gray-500 mt-1">
                Amplify your presence across Instagram, TikTok, LinkedIn, and Facebook with targeted campaigns.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#packages"
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                View Packages
              </a>
              <Link
                href="/request-quote"
                className="px-4 py-2 text-xs font-bold text-white bg-[#128C38] hover:bg-[#0E6C2B] rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                Book Consultation
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketingCards.map((card) => (
              <div
                key={card.id || card.title}
                className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-[#128C38]/40 transition-all duration-300 flex flex-col overflow-hidden"
              >
                {/* Card Image */}
                <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-slate-100 flex items-center justify-center p-3">
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-20 scale-125 pointer-events-none"
                    style={{ backgroundImage: `url("${resolveMediaUrl(card.image, FALLBACK_SERVICE_IMAGE)}")` }}
                  />
                  <div className="relative w-full h-full z-10 flex items-center justify-center">
                    <Image
                      src={resolveMediaUrl(card.image, FALLBACK_SERVICE_IMAGE)}
                      alt={card.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-sm"
                    />
                  </div>
                  {card.badge && (
                    <span className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 shadow-xs uppercase tracking-wider border border-slate-200/60">
                      {card.badge}
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#128C38] transition-colors leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2 line-clamp-3">
                      {card.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {card.priceOrRate || "Targeted Growth"}
                    </span>
                    <Link
                      href="/request-quote"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#128C38] hover:text-white text-xs font-bold text-slate-800 transition-colors inline-flex items-center gap-1"
                    >
                      Inquire <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Packages */}
        <section id="packages" className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-wider text-[#128C38] bg-gray-50 px-3 py-1 rounded-full">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-3">
              Monthly Digital Marketing Plans
            </h2>
            <p className="text-sm text-gray-600">
              No hidden fees. Pick the tier that matches your business goals or request a customized proposal.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {packageList.map((pkg) => (
              <div
                key={pkg.id || pkg.name}
                className={`relative rounded p-8 transition-all duration-300 flex flex-col justify-between ${
                  pkg.popular
                    ? "bg-gray-900 text-white shadow-2xl border-2 border-[#128C38] scale-105"
                    : "bg-white text-gray-900 shadow-sm border border-gray-200"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#128C38] text-white text-[11px] font-extrabold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-extrabold">{pkg.price}</span>
                    <span className={`text-sm ${pkg.popular ? "text-gray-400" : "text-gray-500"}`}>
                      RWF {pkg.period}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm">
                        <Check className="w-4 h-4 text-[#128C38] flex-shrink-0 mt-0.5" />
                        <span className={pkg.popular ? "text-gray-300" : "text-gray-600"}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={`https://wa.me/${companyInfo.whatsapp.replace(/\+/g, "")}?text=Hello%20JREAL%20VISION,%20I%20am%20interested%20in%20the%20${encodeURIComponent(pkg.name)}%20Marketing%20Package%20(${pkg.price}%20RWF)`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all ${
                    pkg.popular
                      ? "bg-[#128C38] hover:bg-[#0B5424] text-white shadow-lg"
                      : "bg-gray-100 hover:bg-[#128C38] hover:text-white text-gray-900"
                  }`}
                >
                  Choose {pkg.name} Plan
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

