import Head from "next/head";
import Header from "@/app/components/Header";
import Hero from "@/app/components/Hero";
import CustomerPathSelector from "@/app/components/CustomerPathSelector";
import ProductGrid from "@/app/components/ProductGrid";
import GalleryShowcase from "@/app/components/GalleryShowcase";
import ServicesShowcase from "@/app/components/ServicesShowcase";
import MarketingPackages from "@/app/components/MarketingPackages";
import PhotographyShowcase from "@/app/components/PhotographyShowcase";
import VideographyShowcase from "@/app/components/VideographyShowcase";
import PortfolioPreview from "@/app/components/PortfolioPreview";
import Testimonials from "@/app/components/Testimonials";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>JREAL VISION DESIGN | Shop • Customize • Print • Deliver | Kigali, Rwanda</title>
        <meta
          name="description"
          content="Rwanda's premier creative platform for custom printing, graphic design, photography, videography, original fine art gallery, and digital marketing."
        />
      </Head>
      <Header />
      <main className="overflow-hidden">
        <Hero />
        <ServicesShowcase />
        <ProductGrid />
        <CustomerPathSelector />
        <GalleryShowcase />
        <PhotographyShowcase />
        <VideographyShowcase />
        <PortfolioPreview />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
