import Head from "next/head";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  HeartHandshake,
  FileCheck2,
  FileText,
  Users,
} from "lucide-react";

export default function NgoSolutionsPage() {
  return (
    <>
      <Head>
        <title>NGO & Development Foundation Solutions | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Annual report publication, public awareness campaign merchandise, and impact storytelling videos for NGOs in Rwanda."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white overflow-hidden mb-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 max-w-4xl text-center">

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
              Branding & Media Solutions for{" "}
              <span className="bg-gray-900 via-[#10B981] to-[#F59E0B] bg-clip-text text-transparent">
                NGOs & Foundations
              </span>
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto mb-8">
              We help local and international non-profits document impact, produce donor-ready annual reports, and manufacture high-visibility field campaign materials across Rwanda.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/request-quote"
                className="px-7 py-3.5 bg-[#128C38] hover:bg-[#0B5424] text-white rounded-xl font-bold text-sm shadow-lg transition-all hover:scale-105"
              >
                Submit RFQ / TOR / BOQ
              </Link>
              <Link
                href="/portfolio"
                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-sm transition-all"
              >
                View NGO Projects
              </Link>
            </div>
          </div>
        </section>

        {/* Core NGO Offerings */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded bg-gray-50 text-[#128C38] flex items-center justify-center mb-5">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Annual Reports & Training Manuals</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Graphic design, layout typesetting, translation formatting, and high-quality spiral or perfect-bound booklet printing.
              </p>
            </div>

            <div className="bg-white rounded p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded bg-gray-50 text-[#F59E0B] flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Community Awareness Campaigns</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                T-shirts, caps, tear-drop flags, road banners, and educational infographics designed for nationwide public health and youth programs.
              </p>
            </div>

            <div className="bg-white rounded p-8 border border-gray-100 shadow-sm">
              <div className="w-12 h-12 rounded bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Field Video & Impact Stories</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Professional videography and photojournalism teams travelling to beneficiary communities to document authentic stories for donors.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
