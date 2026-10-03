import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { portfolioItems } from "@/lib/data";
import { Sparkles, ArrowRight } from "lucide-react";

const categories = ["All", "Branding", "Photography", "Videography", "Printing", "Marketing"];

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems =
    activeCategory === "All"
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory);

  return (
    <>
      <Head>
        <title>Portfolio & Past Work | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Explore our portfolio of branding, printing, photography, and video production delivered for businesses across Rwanda."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <section className="relative py-20 bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white overflow-hidden mb-12 text-center">
          <div className="container mx-auto px-4 max-w-4xl">

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5">
              Our Creative{" "}
              <span className="bg-gray-900 via-[#10B981] to-[#F59E0B] bg-clip-text text-transparent">
                Portfolio
              </span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Explore real projects delivered for businesses, restaurants, hotels, NGOs, and startups across Rwanda.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeCategory === cat
                  ? "bg-[#128C38] text-white shadow-md scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#128C38] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  <Link
                    href="/request-quote"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#128C38] hover:text-[#0B5424] mt-auto"
                  >
                    Request Similar Project <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
