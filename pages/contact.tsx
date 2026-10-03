import Head from "next/head";
import Header from "@/app/components/Header";
import Contact from "@/app/components/Contact";
import Footer from "@/app/components/Footer";

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Contact Us | JREAL VISION DESIGN | Kigali, Rwanda</title>
        <meta
          name="description"
          content="Get in touch with JREAL VISION DESIGN in Kigali, Rwanda. Call, WhatsApp, or email our team for all your design, printing, branding, and digital marketing needs."
        />
      </Head>
      <Header />
      <main className="pt-20">
        <Contact />
      </main>
      <Footer />
    </>
  );
}
