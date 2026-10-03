import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { companyInfo } from "@/lib/data";
import {
  Sparkles,
  Check,
  Star,
} from "lucide-react";
import {
  BrandBundleItem,
  ServiceCardItem,
  INITIAL_BRAND_BUNDLES,
  INITIAL_SERVICE_CARDS,
  getStoredBrandBundles,
  getStoredServiceCards,
} from "@/lib/servicesData";

export default function BrandingPage() {
  const [bundleList, setBundleList] = useState<BrandBundleItem[]>(INITIAL_BRAND_BUNDLES);
  const [stepList, setStepList] = useState<ServiceCardItem[]>(() =>
    INITIAL_SERVICE_CARDS.filter((c) => c.category === "branding")
  );

  useEffect(() => {
    setBundleList(getStoredBrandBundles());
    const cards = getStoredServiceCards().filter((c) => c.category === "branding");
    if (cards.length > 0) setStepList(cards);

    const onUpdate = () => {
      setBundleList(getStoredBrandBundles());
      const updated = getStoredServiceCards().filter((c) => c.category === "branding");
      if (updated.length > 0) setStepList(updated);
    };
    window.addEventListener("jreal_bundles_updated", onUpdate);
    window.addEventListener("jreal_services_updated", onUpdate);
    return () => {
      window.removeEventListener("jreal_bundles_updated", onUpdate);
      window.removeEventListener("jreal_services_updated", onUpdate);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Complete Brand Launch Systems | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="End-to-end brand identity packages connecting logo design, business cards, signage, uniforms, photography, video and marketing."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-20">
        {/* The 8-Step System */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#128C38] bg-emerald-50 px-2.5 py-1 rounded-full inline-block mb-2">
                Brand Launch Systems
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">The 8-Step Brand Launch Journey</h1>
              <p className="text-sm text-gray-500 mt-1">
                We connect design, print, media, and marketing into one cohesive brand system — delivering every piece under one roof.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="#packages"
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                View Brand Bundles
              </a>
              <Link
                href="/start-your-business"
                className="px-4 py-2 text-xs font-bold text-white bg-[#128C38] hover:bg-[#0E6C2B] rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                Start Business Flow
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stepList.map((step, idx) => (
              <div
                key={step.id || step.title}
                className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-[#128C38]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-slate-800">0{idx + 1}</span>
                    <span className="font-mono text-xs font-bold text-[#128C38] bg-emerald-50 px-2 py-0.5 rounded-md">
                      {step.badge || `STEP 0${idx + 1}`}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bundles Section */}
        <section id="packages" className="container mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
              All-Inclusive Brand Bundles
            </h2>
            <p className="text-sm text-gray-600">
              Save up to 30% compared to purchasing individual services separately.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {bundleList.map((bundle) => (
              <div
                key={bundle.id || bundle.name}
                className={`relative rounded-2xl p-8 transition-all duration-300 flex flex-col justify-between ${
                  bundle.popular
                    ? "bg-slate-900 text-white shadow-2xl border-2 border-[#128C38] scale-105"
                    : "bg-white text-gray-900 shadow-sm border border-slate-200"
                }`}
              >
                {bundle.popular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#128C38] text-white text-[11px] font-extrabold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                    Recommended
                  </span>
                )}

                <div>
                  <h3 className="text-2xl font-bold mb-2">{bundle.name}</h3>
                  <p className={`text-xs mb-6 ${bundle.popular ? "text-gray-400" : "text-gray-500"}`}>
                    {bundle.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-3xl font-extrabold">{bundle.price}</span>
                    <span className={`text-xs font-semibold ${bundle.popular ? "text-gray-400" : "text-gray-500"}`}>
                      RWF
                    </span>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#128C38]">
                      What&apos;s Included:
                    </div>
                    {bundle.includes.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs">
                        <Check className="w-4 h-4 text-[#128C38] flex-shrink-0 mt-0.5" />
                        <span className={bundle.popular ? "text-gray-300" : "text-gray-700"}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={`https://wa.me/${companyInfo.whatsapp.replace(/\+/g, "")}?text=Hello%20JREAL%20VISION,%20I%20am%20interested%20in%20the%20${encodeURIComponent(
                    bundle.name
                  )}%20(${bundle.price}%20RWF)`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all ${
                    bundle.popular
                      ? "bg-[#128C38] hover:bg-[#0B5424] text-white shadow-lg"
                      : "bg-gray-100 hover:bg-[#128C38] hover:text-white text-gray-900"
                  }`}
                >
                  Order {bundle.name}
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
