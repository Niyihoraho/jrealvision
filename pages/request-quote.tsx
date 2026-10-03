import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { companyInfo } from "@/lib/data";
import {
  FileSpreadsheet,
  CheckCircle2,
  Upload,
  Send,
} from "lucide-react";

const serviceOptions = [
  "Graphic Design & Logo",
  "Bulk Printing & Stationery",
  "T-Shirts & Promotional Merch",
  "Signage & Office Branding",
  "Photography Session",
  "Commercial Videography & Reels",
  "Monthly Digital Marketing Retainer",
  "NGO Field Materials / Reports",
];

export default function RequestQuotePage() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [projectScope, setProjectScope] = useState("");
  const [urgency, setUrgency] = useState("Standard (1-2 weeks)");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleService = (srv: string) => {
    setSelectedServices((prev) =>
      prev.includes(srv) ? prev.filter((s) => s !== srv) : [...prev, srv]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedServices,
          companyName,
          fullName,
          phone,
          email,
          projectScope,
          urgency,
        }),
      });
    } catch (err) {
      console.error("Failed to submit quote:", err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <>
      <Head>
        <title>Request a Custom Quotation | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Request a quotation for custom print runs, corporate branding, photography, video production, or marketing retainers."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <section className="py-16 bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white text-center mb-10">
          <div className="container mx-auto px-4 max-w-3xl">

            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">
              Request a Custom Quotation
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              Tell us what your organization or project needs. We provide itemized, competitive pricing with official tax compliance.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {submitted ? (
            <div className="bg-white rounded p-8 sm:p-12 border border-gray-100 shadow-xl text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 text-[#128C38] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Quotation Request Received!
              </h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Thank you, <strong className="text-gray-900">{fullName}</strong>! Our sales team is preparing an official quote for{" "}
                <strong className="text-[#128C38]">{companyName || "your project"}</strong>. We will send the PDF breakdown to{" "}
                <strong>{email || phone}</strong> shortly.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/${companyInfo.whatsapp.replace(/\+/g, "")}?text=Hello%20JREAL%20VISION,%20I%20just%20submitted%20a%20Quote%20Request%20for%20${encodeURIComponent(
                    companyName || fullName
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-[#128C38] hover:bg-[#0B5424] text-white font-bold rounded-xl text-sm shadow-md"
                >
                  Expedite on WhatsApp
                </a>
                <Link
                  href="/dashboard"
                  className="px-6 py-3.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-sm shadow-md"
                >
                  Track in Client Dashboard →
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded p-6 sm:p-10 border border-gray-100 shadow-xl space-y-6"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                  1. Which Services Do You Require? (Select all that apply) *
                </label>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {serviceOptions.map((opt) => {
                    const isSelected = selectedServices.includes(opt);
                    return (
                      <div
                        key={opt}
                        onClick={() => toggleService(opt)}
                        className={`p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "border-[#128C38] bg-gray-50 text-[#128C38] ring-1 ring-[#128C38]"
                            : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#128C38]" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                  2. Organization & Contact Info *
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jean Paul"
                      className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Bank of Kigali / TechHub Ltd"
                      className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Phone / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0788 123 456"
                      className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="procurement@company.rw"
                      className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                    />
                  </div>
                </div>
              </div>

              {/* Project Scope & Requirements */}
              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                  3. Quantities, Specifications & Timeline
                </label>
                <div className="mb-4">
                  <textarea
                    rows={4}
                    required
                    value={projectScope}
                    onChange={(e) => setProjectScope(e.target.value)}
                    placeholder="Provide details such as quantity (e.g. 500 T-shirts, 1,000 booklets), preferred paper weight, video duration, or special finishing..."
                    className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Target Timeline *</label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full text-sm p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                    >
                      <option value="Urgent (1-3 days)">Urgent Priority (1-3 days)</option>
                      <option value="Standard (1-2 weeks)">Standard (1-2 weeks)</option>
                      <option value="Flexible (Within 1 month)">Flexible (Within 1 month)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Attach Tender/RFQ/Artwork (Optional)
                    </label>
                    <label className="cursor-pointer border border-dashed border-gray-300 rounded-xl p-2.5 flex items-center justify-between text-xs text-gray-500 bg-gray-50 hover:bg-gray-100">
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.zip"
                      />
                      <span className="truncate">{fileName || "Click to upload file"}</span>
                      <Upload className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#128C38] hover:bg-[#0B5424] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all text-sm flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Submitting Quotation Request…" : "Submit Quotation Request"}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
