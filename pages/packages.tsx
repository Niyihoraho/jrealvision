import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { marketingPackages, companyInfo } from "@/lib/data";
import { Check } from "lucide-react";

export default function PackagesPage() {
  const [tab, setTab] = useState<"branding" | "marketing">("branding");

  const brandingBundles = [
    {
      name: "Startup Starter",
      price: "250,000",
      description: "Essential brand assets for solo founders and micro-businesses opening shop.",
      highlighted: false,
      features: [
        "Custom Logo (3 initial concepts + revisions)",
        "Brand Color Palette & Font Pairing Guide",
        "100 Premium Business Cards",
        "Social Media Profile Assets (Avatar + Banners)",
        "Digital Letterhead & Invoice Template",
      ],
    },
    {
      name: "Business Growth Bundle",
      price: "650,000",
      description: "Complete identity with physical merch and professional photo session.",
      highlighted: true,
      features: [
        "Full Brand Style Guide Book",
        "200 Premium Business Cards",
        "10 Branded Staff T-Shirts / Polos",
        "1 Roll-up Banner Stand (85x200cm)",
        "Professional Product Photography (15 photos)",
        "Social Media Launch Kit (9 post templates)",
        "2 Teardrop Promo Flags (Optional add-on)",
      ],
    },
    {
      name: "Enterprise 360° Suite",
      price: "1,500,000",
      description: "Turnkey brand transformation: Identity, media production, printing, and digital marketing.",
      highlighted: false,
      features: [
        "Complete Corporate Visual Identity",
        "Full Physical Signage & Office Branding",
        "50 Branded Apparel Items (Polos/Caps/Mugs)",
        "Studio & On-Location Photography (40 photos)",
        "1-Minute Cinematic Brand Video + 3 Social Reels",
        "1 Month Dedicated Digital Marketing Campaign",
        "Official Corporate Profile Brochure (Print & PDF)",
      ],
    },
  ];

  return (
    <>
      <Head>
        <title>Packages & Value Bundles | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Explore transparent flat-rate branding packages and monthly marketing tiers in Kigali, Rwanda."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <section className="py-16 bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white text-center mb-12">
          <div className="container mx-auto px-4 max-w-3xl">

            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              Value Packages & Bundles
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Transparent, flat-rate pricing designed for startups, growing companies, and organizations in Rwanda.
            </p>

            {/* Toggle */}
            <div className="inline-flex p-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 mt-8">
              <button
                onClick={() => setTab("branding")}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === "branding"
                    ? "bg-[#128C38] text-white shadow-md"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Branding Packages
              </button>
              <button
                onClick={() => setTab("marketing")}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  tab === "marketing"
                    ? "bg-[#128C38] text-white shadow-md"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                Digital Marketing Plans
              </button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {tab === "branding" ? (
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {brandingBundles.map((b) => (
                <div
                  key={b.name}
                  className={`relative rounded p-8 transition-all flex flex-col justify-between ${
                    b.highlighted
                      ? "bg-gray-900 text-white shadow-2xl border-2 border-[#128C38] scale-105"
                      : "bg-white text-gray-900 shadow-sm border border-gray-200"
                  }`}
                >
                  {b.highlighted && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#128C38] text-white text-[11px] font-extrabold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                      Best Value
                    </span>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{b.name}</h3>
                    <p className={`text-xs mb-6 ${b.highlighted ? "text-gray-400" : "text-gray-500"}`}>
                      {b.description}
                    </p>
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-3xl font-extrabold">{b.price}</span>
                      <span className={`text-xs font-semibold ${b.highlighted ? "text-gray-400" : "text-gray-500"}`}>
                        RWF
                      </span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {b.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs">
                          <Check className="w-4 h-4 text-[#128C38] flex-shrink-0 mt-0.5" />
                          <span className={b.highlighted ? "text-gray-300" : "text-gray-700"}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={`https://wa.me/${companyInfo.whatsapp.replace(/\+/g, "")}?text=Hello%20JREAL%20VISION,%20I%20want%20to%20order%20the%20${encodeURIComponent(
                      b.name
                    )}%20(${b.price}%20RWF)`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all ${
                      b.highlighted
                        ? "bg-[#128C38] hover:bg-[#0B5424] text-white shadow-lg"
                        : "bg-gray-100 hover:bg-[#128C38] hover:text-white text-gray-900"
                    }`}
                  >
                    Select Bundle
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {marketingPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative rounded p-8 transition-all flex flex-col justify-between ${
                    pkg.highlighted
                      ? "bg-gray-900 text-white shadow-2xl border-2 border-[#128C38] scale-105"
                      : "bg-white text-gray-900 shadow-sm border border-gray-200"
                  }`}
                >
                  {pkg.highlighted && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#128C38] text-white text-[11px] font-extrabold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                      Popular Plan
                    </span>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-extrabold">{pkg.price}</span>
                      <span className={`text-xs ${pkg.highlighted ? "text-gray-400" : "text-gray-500"}`}>
                        RWF {pkg.period}
                      </span>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs">
                          <Check className="w-4 h-4 text-[#128C38] flex-shrink-0 mt-0.5" />
                          <span className={pkg.highlighted ? "text-gray-300" : "text-gray-600"}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={`https://wa.me/${companyInfo.whatsapp.replace(/\+/g, "")}?text=Hello%20JREAL%20VISION,%20I%20am%20interested%20in%20the%20${pkg.name}%20Marketing%20Package%20(${pkg.price}%20RWF)`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3.5 rounded-xl font-bold text-sm text-center transition-all ${
                      pkg.highlighted
                        ? "bg-[#128C38] hover:bg-[#0B5424] text-white shadow-lg"
                        : "bg-gray-100 hover:bg-[#128C38] hover:text-white text-gray-900"
                    }`}
                  >
                    Select Plan
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
