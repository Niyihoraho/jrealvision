import Head from "next/head";
import Header from "@/app/components/Header";
import About from "@/app/components/About";
import Footer from "@/app/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Us | JREAL VISION DESIGN | Kigali, Rwanda</title>
        <meta
          name="description"
          content="Learn about JREAL VISION DESIGN — Rwanda's creative powerhouse combining graphic design, high-quality printing, photography, videography, and digital marketing under one roof."
        />
      </Head>
      <Header />
      <main className="pt-20">
        <About />
      </main>
      <Footer />
    </>
  );
}
