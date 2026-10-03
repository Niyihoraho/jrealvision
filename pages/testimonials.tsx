import Head from "next/head";
import Header from "@/app/components/Header";
import Testimonials from "@/app/components/Testimonials";
import Footer from "@/app/components/Footer";

export default function TestimonialsPage() {
  return (
    <>
      <Head>
        <title>Client Testimonials | JREAL VISION DESIGN | Kigali, Rwanda</title>
        <meta
          name="description"
          content="Read what Rwandan businesses and individuals say about our printing, branding, photography, and marketing services."
        />
      </Head>
      <Header />
      <main className="pt-20 min-h-screen bg-gray-50">
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
