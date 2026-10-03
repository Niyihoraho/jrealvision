import Head from "next/head";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  Briefcase,
  FileSpreadsheet,
  Award,
  Users,
} from "lucide-react";

export default function BusinessSolutionsPage() {
  return (
    <>
      <Head>
        <title>Enterprise & Corporate B2B Solutions | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Corporate bulk printing, staff uniforms, branded merchandise, signage, and EBM tax compliant procurement in Rwanda."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white overflow-hidden mb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl text-center">

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
              Enterprise & Corporate{" "}
              <span className="bg-gray-900 via-[#10B981] to-[#F59E0B] bg-clip-text text-transparent">
                Branding Solutions
              </span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              We empower Rwandan businesses, banks, hotels, and retail chains with reliable bulk printing, corporate gifts, signage, and recurring marketing retainers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/request-quote"
                className="px-7 py-3.5 bg-[#128C38] hover:bg-[#0B5424] text-white rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-105"
              >
                Request Corporate Quotation
              </Link>
              <Link
                href="/packages"
                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-sm transition-all"
              >
                Explore Retainer Packages
              </Link>
            </div>
          </div>
        </section>

        {/* Value Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded bg-gray-50 text-[#128C38] flex items-center justify-center mb-5">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Formal Invoicing & Tax Compliance</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Registered Rwandan entity with EBM receipts, official vendor onboarding, and credit terms for qualified corporates.
              </p>
            </div>

            <div className="bg-white rounded p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded bg-gray-50 text-[#F59E0B] flex items-center justify-center mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Volume Tier Pricing</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Enjoy significant volume discounts on 1,000+ business cards, hundreds of branded staff polos, and annual event merchandise.
              </p>
            </div>

            <div className="bg-white rounded p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Dedicated Account Manager</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                A single point of contact overseeing your print proofs, rush deadlines, and recurring monthly creative requirements.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
