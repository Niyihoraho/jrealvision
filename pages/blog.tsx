import Head from "next/head";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";

const articles = [
  {
    title: "5 Common Branding Mistakes Rwandan Startups Make (And How to Avoid Them)",
    category: "Branding",
    date: "September 2026",
    snippet:
      "Why starting with just a low-resolution WhatsApp logo hurts sales, and how a unified visual identity creates immediate customer trust.",
  },
  {
    title: "The Ultimate Guide to Commercial Printing in Kigali: Paper Types, Formats & Turnarounds",
    category: "Printing",
    date: "August 2026",
    snippet:
      "Demystifying GSM paper weights, matte vs glossy lamination, and how to choose the right banner vinyl for outdoor Rwanda weather.",
  },
  {
    title: "How Vertical Video Reels Are Dominating TikTok & Instagram in Rwanda",
    category: "Videography & Marketing",
    date: "August 2026",
    snippet:
      "Tips from our media team on scripting the first 3 seconds, choosing trending local music, and shooting high-converting product showcases.",
  },
];

export default function BlogPage() {
  return (
    <>
      <Head>
        <title>Blog & Creative Insights | JREAL VISION DESIGN | Kigali, Rwanda</title>
        <meta
          name="description"
          content="Read articles and insights on brand building, printing best practices, videography, and digital marketing in Rwanda."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <section className="py-20 bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white text-center mb-12">
          <div className="container mx-auto px-4 max-w-4xl">

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
              JREAL VISION{" "}
              <span className="bg-gray-900 via-[#10B981] to-[#F59E0B] bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Practical guides on design, print production, videography, and digital marketing strategies in Rwanda.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((art, i) => (
              <div
                key={i}
                className="bg-white rounded p-6 sm:p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-4">
                    <span className="font-bold text-[#128C38] bg-gray-50 px-2.5 py-1 rounded-full uppercase">
                      {art.category}
                    </span>
                    <span>{art.date}</span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 leading-snug hover:text-[#128C38] transition-colors cursor-pointer">
                    {art.title}
                  </h2>
                  <p className="text-xs text-gray-600 leading-relaxed mb-6">
                    {art.snippet}
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="text-xs font-bold text-[#128C38] hover:text-[#0B5424] inline-flex items-center gap-1.5 mt-auto"
                >
                  Consult Our Team <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
