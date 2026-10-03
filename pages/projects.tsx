import Head from "next/head";
import Header from "@/app/components/Header";
import PortfolioPreview from "@/app/components/PortfolioPreview";
import Footer from "@/app/components/Footer";

export default function ProjectsPage() {
  return (
    <>
      <Head>
        <title>Projects & Portfolio | JREAL VISION DESIGN | Kigali, Rwanda</title>
        <meta
          name="description"
          content="Browse completed client projects across branding, photography, videography, and printing in Rwanda."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <section className="py-16 bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white text-center mb-8">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
              Client{" "}
              <span className="bg-gray-900 via-[#10B981] to-[#F59E0B] bg-clip-text text-transparent">
                Projects
              </span>
            </h1>
            <p className="text-gray-300 text-sm leading-relaxed">
              Explore real results delivered for Rwandan businesses, startups, and organizations.
            </p>
          </div>
        </section>

        <PortfolioPreview />
      </main>
      <Footer />
    </>
  );
}
