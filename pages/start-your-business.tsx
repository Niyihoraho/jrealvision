import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { companyInfo } from "@/lib/data";
import {
  Rocket,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Check,
  Send,
  ShoppingBag,
  Utensils,
  Briefcase,
  Sparkles,
  HandshakeIcon,
  Building2,
  Package,
  BadgePercent,
} from "lucide-react";

const industries = [
  { id: "retail", label: "Retail & E-commerce", Icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
  { id: "hospitality", label: "Restaurant / Cafe / Hotel", Icon: Utensils, color: "text-orange-600 bg-orange-50" },
  { id: "corporate", label: "Corporate Services / Tech", Icon: Briefcase, color: "text-indigo-600 bg-indigo-50" },
  { id: "fashion", label: "Fashion, Beauty & Salon", Icon: Sparkles, color: "text-pink-600 bg-pink-50" },
  { id: "ngo", label: "NGO / Community Project", Icon: HandshakeIcon, color: "text-[#128C38] bg-gray-50" },
  { id: "construction", label: "Real Estate & Construction", Icon: Building2, color: "text-amber-700 bg-gray-50" },
];

const checklistServices = [
  { id: "logo", name: "Logo & Brand Identity", price: 50000, desc: "Professional logo + brand guidelines" },
  { id: "cards", name: "Business Cards (200 pcs)", price: 30000, desc: "Premium double-sided cards" },
  { id: "shirts", name: "Branded Staff T-Shirts (10 pcs)", price: 80000, desc: "Full-color print on quality fabric" },
  { id: "signboard", name: "Physical Signage / Roll-up Banner", price: 45000, desc: "Durable indoor/outdoor signage" },
  { id: "photos", name: "Product / Team Photography Session", price: 60000, desc: "Professional studio or on-site shoot" },
  { id: "video", name: "30-Sec Brand Launch Video / Reel", price: 90000, desc: "Social media-ready video content" },
  { id: "social", name: "Social Media Setup & 1-Month Marketing", price: 150000, desc: "Complete social profiles + content" },
];

const stepLabels = ["Your Business", "Brand Assets", "Review & Launch"];

export default function StartYourBusinessPage() {
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState("retail");
  const [businessName, setBusinessName] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "logo",
    "cards",
    "shirts",
    "photos",
  ]);
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [completed, setCompleted] = useState(false);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const calculatedTotal = checklistServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((acc, curr) => acc + curr.price, 0);

  const hasBundleDiscount = selectedServices.length >= 3;
  const finalTotal = hasBundleDiscount
    ? Math.round(calculatedTotal * 0.85)
    : calculatedTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCompleted(true);
  };

  return (
    <>
      <Head>
        <title>Start Your Business Wizard | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Interactive launch wizard to assemble logo, print collateral, merchandise, photos, and marketing for your new company."
        />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        {/* Hero */}
        <section className="py-16 bg-gradient-to-r from-gray-950 via-gray-900 to-black text-white text-center mb-10">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">
              Start Your Business with{" "}
              <span className="bg-gray-900 via-[#10B981] to-[#F59E0B] bg-clip-text text-transparent">
                JREAL VISION
              </span>
            </h1>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              Build your complete brand starter pack in 3 quick steps. One contract, one unified team, maximum savings.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {completed ? (
            <div className="bg-white rounded p-8 sm:p-12 border border-gray-200 shadow-sm text-center space-y-6">
              <div className="w-16 h-16 rounded bg-gray-50 text-[#128C38] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Launch Plan Submitted!
              </h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                Congratulations, <strong className="text-gray-900">{contactName}</strong>! We have mapped out the launch package for <strong className="text-[#128C38]">{businessName || "your business"}</strong>.
              </p>
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-50 rounded-xl border border-emerald-100">
                <span className="text-sm font-medium text-gray-600">Estimated Investment:</span>
                <span className="text-lg font-extrabold text-[#128C38]">{finalTotal.toLocaleString()} RWF</span>
              </div>
              <p className="text-xs text-gray-500">
                Our creative director will contact you via WhatsApp at <strong>{phone}</strong> to schedule a kick-off strategy call.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`https://wa.me/${companyInfo.whatsapp.replace(/\+/g, "")}?text=Hello%20JREAL%20VISION,%20I%20just%20completed%20the%20Start%20Your%20Business%20wizard%20for%20${encodeURIComponent(
                    businessName || "my startup"
                  )}%20(Estimated:%20${finalTotal.toLocaleString()}%20RWF)`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-[#128C38] hover:bg-[#0B5424] text-white font-bold rounded-xl text-sm shadow-md transition-all"
                >
                  Confirm on WhatsApp
                </a>
                <Link
                  href="/"
                  className="px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-all"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded p-6 sm:p-10 border border-gray-200 shadow-sm">
              {/* Progress Stepper */}
              <div className="flex items-center mb-10">
                {stepLabels.map((label, i) => {
                  const s = i + 1;
                  const isActive = step === s;
                  const isDone = step > s;
                  return (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                            isActive
                              ? "bg-[#128C38] text-white shadow-md shadow-emerald-200"
                              : isDone
                              ? "bg-gray-100 text-[#128C38]"
                              : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isDone ? <Check className="w-5 h-5" /> : s}
                        </div>
                        <span
                          className={`text-[11px] font-semibold mt-2 hidden sm:block ${
                            isActive ? "text-gray-900" : isDone ? "text-[#128C38]" : "text-gray-400"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                      {s < 3 && (
                        <div className={`flex-1 h-[2px] mx-3 rounded-full ${
                          step > s ? "bg-[#128C38]" : "bg-gray-200"
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Step 1: Business Details */}
              {step === 1 && (
                <div className="space-y-7">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                      Tell Us About Your Business
                    </h2>
                    <p className="text-sm text-gray-500">
                      Select your industry and enter your business name to get started.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Select Industry
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {industries.map((ind) => {
                        const isActive = industry === ind.id;
                        return (
                          <button
                            key={ind.id}
                            type="button"
                            onClick={() => setIndustry(ind.id)}
                            className={`group p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                              isActive
                                ? "border-[#128C38] bg-gray-50 shadow-sm"
                                : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                              isActive ? "bg-gray-100 text-[#128C38]" : ind.color
                            }`}>
                              <ind.Icon className="w-5 h-5" />
                            </div>
                            <div className={`text-sm font-semibold leading-tight ${
                              isActive ? "text-[#128C38]" : "text-gray-800"
                            }`}>
                              {ind.label}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Business or Project Name
                      <span className="text-gray-400 font-normal ml-1">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Kigali Artisan Cafe"
                      className="w-full text-sm p-4 rounded-xl bg-gray-50 border border-[#128C38] text-black focus:outline-none focus:ring-2 focus:ring-emerald-50 transition-all"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-7 py-3.5 bg-[#128C38] hover:bg-[#0B5424] text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                      Choose Brand Assets <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Assets Checklist */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                      Choose What You Need
                    </h2>
                    <p className="text-sm text-gray-500">
                      Select the services your startup needs for a strong launch.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {checklistServices.map((service) => {
                      const isSelected = selectedServices.includes(service.id);
                      return (
                        <div
                          key={service.id}
                          onClick={() => toggleService(service.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all duration-200 ${
                            isSelected
                              ? "border-[#128C38] bg-gray-50"
                              : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                                isSelected
                                  ? "bg-[#128C38] border-[#128C38] text-white"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {service.name}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">{service.desc}</div>
                            </div>
                          </div>
                          <span className={`text-sm font-bold flex-shrink-0 ml-4 ${
                            isSelected ? "text-[#128C38]" : "text-gray-400"
                          }`}>
                            {service.price.toLocaleString()} <span className="text-[10px] font-medium">RWF</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Bar */}
                  <div className="p-5 rounded-xl bg-gray-900 text-white flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Package className="w-4 h-4 text-[#F59E0B]" />
                        <span className="text-sm font-semibold">Bundle Total</span>
                      </div>
                      {hasBundleDiscount && (
                        <div className="flex items-center gap-1.5">
                          <BadgePercent className="w-3.5 h-3.5 text-[#F59E0B]" />
                          <span className="text-[11px] text-[#F59E0B] font-semibold">
                            15% bundle discount applied
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {hasBundleDiscount && (
                        <span className="text-xs text-gray-400 line-through mr-2">
                          {calculatedTotal.toLocaleString()} RWF
                        </span>
                      )}
                      <span className="text-xl font-extrabold text-[#F59E0B]">
                        {finalTotal.toLocaleString()} <span className="text-sm">RWF</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-7 py-3.5 bg-[#128C38] hover:bg-[#0B5424] text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                      Review & Launch <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Contact & Submission */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                      Review & Launch
                    </h2>
                    <p className="text-sm text-gray-500">
                      Confirm your details below and we&apos;ll send your customized quote.
                    </p>
                  </div>

                  {/* Order Summary */}
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-bold text-gray-800">Your Launch Package</h3>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Industry</span>
                        <span className="font-semibold text-gray-900 capitalize">{industry.replace("-", " ")}</span>
                      </div>
                      {businessName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Business Name</span>
                          <span className="font-semibold text-gray-900">{businessName}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Selected Services</span>
                        <span className="font-semibold text-gray-900">{selectedServices.length} items</span>
                      </div>
                      <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-800">Estimated Total</span>
                        <div className="text-right">
                          {hasBundleDiscount && (
                            <span className="text-xs text-gray-400 line-through block">
                              {calculatedTotal.toLocaleString()} RWF
                            </span>
                          )}
                          <span className="text-lg font-extrabold text-[#128C38]">
                            {finalTotal.toLocaleString()} RWF
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Alice Mukamana"
                        className="w-full text-sm p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] focus:ring-2 focus:ring-emerald-50 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone / WhatsApp <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0788 123 456"
                        className="w-full text-sm p-4 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] focus:ring-2 focus:ring-emerald-50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm flex items-center gap-1.5 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      type="submit"
                      className="px-7 py-3.5 bg-[#128C38] hover:bg-[#0B5424] text-white font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                      <Send className="w-4 h-4" /> Submit Launch Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
