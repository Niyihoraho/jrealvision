import Head from "next/head";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Privacy Policy for JREAL VISION DESIGN e-commerce and media platform."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="bg-white rounded p-8 sm:p-12 border border-gray-100 shadow-sm space-y-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Privacy Policy
            </h1>
            <p className="text-xs text-gray-500">Last updated: September 2026</p>

            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                At <strong>JREAL VISION DESIGN</strong>, we respect your privacy and are committed to protecting the personal and proprietary information you share with us when browsing our platform, purchasing custom merchandise, or uploading artwork.
              </p>

              <h2 className="text-lg font-bold text-gray-900 pt-2">1. Information We Collect</h2>
              <p>
                When you place an order, request a quotation, or book a media session, we collect your name, phone number, email address, delivery address, and any artwork files or project briefs submitted.
              </p>

              <h2 className="text-lg font-bold text-gray-900 pt-2">2. How We Use Your Information</h2>
              <p>
                Your information is used strictly to process orders, manufacture your customized print materials, organize media production shoots, communicate delivery statuses, and provide customer support via phone or WhatsApp.
              </p>

              <h2 className="text-lg font-bold text-gray-900 pt-2">3. Intellectual Property of Uploaded Artwork</h2>
              <p>
                Any logos, designs, trademarks, or media files uploaded to JREAL VISION DESIGN remain your exclusive property. We do not resell or distribute your custom designs to third parties.
              </p>

              <h2 className="text-lg font-bold text-gray-900 pt-2">4. Payment Security</h2>
              <p>
                Mobile Money (MTN MoMo / Airtel Money) and bank transfers are processed through verified local payment channels. We do not store sensitive payment PINs or private bank credentials on our servers.
              </p>

              <h2 className="text-lg font-bold text-gray-900 pt-2">5. Contact Us</h2>
              <p>
                If you have questions regarding our privacy practices, contact us at <strong>info@jrealvision.rw</strong> or via our official WhatsApp line.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
