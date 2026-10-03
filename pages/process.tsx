import Head from "next/head";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Sparkles, ArrowRight, Lightbulb, Compass, Printer, Rocket } from "lucide-react";

const stages = [
  {
    num: "01",
    title: "Discovery & Creative Brief",
    icon: Lightbulb,
    description:
      "We understand your brand goals, target customers in Rwanda, quantity requirements, and specific design aesthetics.",
  },
  {
    num: "02",
    title: "Design & Mockup Proofs",
    icon: Compass,
    description:
      "Our designers craft tailored concepts and digital 3D mockups. You review and suggest revisions until it's 100% perfect.",
  },
  {
    num: "03",
    title: "Precision Production & Media",
    icon: Printer,
    description:
      "We press high-resolution prints, embroider apparel, conduct photo/video sessions, and ensure quality control.",
  },
  {
    num: "04",
    title: "Delivery & Marketing Rollout",
    icon: Rocket,
    description:
      "Fast delivery to your office or doorstep in Kigali. We supply web-ready files and initiate ad campaigns to drive sales.",
  },
];

export default function ProcessPage() {
  return (
    <>
      <Head>
        <title>Our Process | JREAL VISION DESIGN | Kigali, Rwanda</title>
        <meta
          name="description"
          content="How we work: from creative brief and design concepts to industrial printing and marketing rollout."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <section className="py-20 bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white text-center mb-12">
          <div className="container mx-auto px-4 max-w-4xl">

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-5">
              Our 4-Stage Creative Process
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              A transparent, battle-tested system turning ideas into tangible products and impactful brand campaigns.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid sm:grid-cols-2 gap-8 mb-16">
            {stages.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.num}
                  className="bg-white rounded p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded bg-gray-50 text-[#128C38] flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#128C38] bg-gray-50 px-2.5 py-1 rounded-md">
                        PHASE {stage.num}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{stage.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              href="/request-quote"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#128C38] hover:bg-[#0B5424] text-white font-bold rounded-xl text-sm shadow-lg hover:scale-105 transition-all"
            >
              Start Your Project With Us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
