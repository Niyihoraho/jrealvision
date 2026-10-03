import Head from "next/head";
import Link from "next/link";
import Header from "@/app/components/Header";
import ServicesShowcase from "@/app/components/ServicesShowcase";
import Footer from "@/app/components/Footer";
import {
  Palette,
  Printer,
  TrendingUp,
  Camera,
  Video,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Award,
} from "lucide-react";

const coreServices = [
  {
    title: "Graphic Design",
    description: "Distinctive logos, comprehensive brand identity guidelines, marketing collateral, packaging, and digital assets.",
    href: "/design",
    icon: Palette,
    accent: "text-emerald-600 bg-emerald-50",
    badge: "Branding & Visuals",
  },
  {
    title: "Commercial & Digital Printing",
    description: "Ultra-sharp business cards, banners, promotional brochures, packaging boxes, and custom branded apparel.",
    href: "/printing",
    icon: Printer,
    accent: "text-blue-600 bg-blue-50",
    badge: "Precision Production",
  },
  {
    title: "Digital Marketing & Ads",
    description: "Targeted social media management, TikTok & Meta ad campaigns, viral reels, and data-driven growth retainers.",
    href: "/digital-marketing",
    icon: TrendingUp,
    accent: "text-purple-600 bg-purple-50",
    badge: "Audience Growth",
  },
  {
    title: "Commercial Photography",
    description: "Magazine-quality studio product shoots, executive corporate headshots, culinary sessions, and event coverage.",
    href: "/photography",
    icon: Camera,
    accent: "text-amber-600 bg-amber-50",
    badge: "High-Resolution Studio",
  },
  {
    title: "Cinematic Videography",
    description: "4K commercial brand films, social media reels, aerial drone footage, and documentary production.",
    href: "/videography",
    icon: Video,
    accent: "text-rose-600 bg-rose-50",
    badge: "4K Motion & Reels",
  },
  {
    title: "Complete Brand Launch",
    description: "Turnkey branding suites integrating identity design, print stationery, apparel, media, and digital campaigns.",
    href: "/branding",
    icon: Sparkles,
    accent: "text-teal-600 bg-teal-50",
    badge: "Turnkey Packages",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Head>
        <title>Our Services | JREAL VISION DESIGN | Kigali, Rwanda</title>
        <meta
          name="description"
          content="Explore our complete suite of creative services: Graphic Design, Printing, Digital Marketing, Commercial Photography, Cinematic Videography, and Brand Packages."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-28 sm:pt-32 pb-20">
        <ServicesShowcase />

        {/* Core Services Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#128C38] bg-emerald-50 px-2.5 py-1 rounded-full inline-block mb-2">
                Capabilities
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Explore All Creative Services
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/shop"
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Browse Shop
              </Link>
              <Link
                href="/request-quote"
                className="px-4 py-2 text-xs font-bold text-white bg-[#128C38] hover:bg-[#0E6C2B] rounded-lg transition-colors"
              >
                Request Quote
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreServices.map((service) => {
              const Icon = service.icon;
              return (
                <Link
                  key={service.title}
                  href={service.href}
                  className="group bg-white rounded-xl p-6 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-[#128C38]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${service.accent}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {service.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#128C38] transition-colors mb-2">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#128C38]">
                    <span>View Service Details</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Value Badges */}
          <div className="mt-14 grid sm:grid-cols-3 gap-6 border-t border-slate-200/80 pt-10">
            <div className="flex items-center gap-3.5 bg-white p-4 rounded-xl border border-slate-200/70 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Verified Kigali Production</h4>
                <p className="text-[11px] text-slate-500">In-house studio & modern machinery</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 bg-white p-4 rounded-xl border border-slate-200/70 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">On-Time Project Delivery</h4>
                <p className="text-[11px] text-slate-500">Clear timelines & responsive updates</p>
              </div>
            </div>
            <div className="flex items-center gap-3.5 bg-white p-4 rounded-xl border border-slate-200/70 shadow-xs">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Premium Standards</h4>
                <p className="text-[11px] text-slate-500">Serving Rwandan brands & international clients</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
