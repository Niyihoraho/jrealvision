"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  saveStoredArtistApplications,
  getStoredArtistApplications,
  type ArtistApplication,
} from "@/lib/artistApplications";

const ART_MEDIUM_OPTIONS = [
  "Acrylic on Canvas",
  "Oil on Canvas",
  "Imigongo Relief & Traditional Pigments",
  "Mixed Media on Textured Linen",
  "Banana Fiber & Eco-Textiles",
  "Wood Carving & Bas-Relief Sculpture",
  "Charcoal, Ink & Archival Paper",
  "Fine Art Photography & Printmaking",
  "Other Contemporary Discipline",
];

const RWANDA_CITY_OPTIONS = [
  "Kigali",
  "Musanze",
  "Huye",
  "Rubavu",
  "Gisenyi",
  "Rwamagana",
  "Other / International",
];

export default function JoinAsArtistPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "Kigali",
    medium: "Acrylic on Canvas",
    portfolioUrl: "",
    sampleArtworkUrl: "",
    bio: "",
    agreed: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<ArtistApplication | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validations
    if (!formData.name.trim()) {
      setErrorMessage("Please provide your full artist name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Please provide a contact phone or WhatsApp number.");
      return;
    }
    if (!formData.bio.trim()) {
      setErrorMessage("Please provide an artist statement or brief background.");
      return;
    }
    if (!formData.agreed) {
      setErrorMessage("Please confirm that submitted artworks are your original creations.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/artists/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          city: formData.city,
          medium: formData.medium,
          bio: formData.bio.trim(),
          portfolioUrl: formData.portfolioUrl.trim() || undefined,
          sampleArtworkUrl: formData.sampleArtworkUrl.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit application at this time.");
      }

      const newApp: ArtistApplication = data.application || {
        id: `app-${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        city: formData.city,
        medium: formData.medium,
        bio: formData.bio.trim(),
        portfolioUrl: formData.portfolioUrl.trim() || undefined,
        sampleArtworkUrl: formData.sampleArtworkUrl.trim() || undefined,
        status: "PENDING",
        appliedAt: new Date().toISOString(),
      };

      // Synchronize in local applications store
      const currentList = getStoredArtistApplications();
      const updated = [newApp, ...currentList.filter((a) => a.email.toLowerCase() !== newApp.email.toLowerCase())];
      saveStoredArtistApplications(updated);

      setSubmittedApp(newApp);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Apply for Artist Representation | JREAL Curated Fine Art</title>
        <meta
          name="description"
          content="Submit your artist portfolio for curatorial review and gallery representation on JREAL Curated Fine Art. Pure application with zero upfront fees."
        />
      </Head>

      <Header />

      <main className="min-h-screen bg-[#FAFAFA] text-slate-900 pt-28 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header Title Section */}
          <div className="border-b border-slate-200 pb-8 mb-8 text-center sm:text-left">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">
            </p>
            <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-slate-950">
              Artist Representation Application
            </h1>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-2xl">
              We represent professional Rwandan visual artists, sculptors, and heritage artisans.
              Submissions are evaluated on originality, technical execution, and artistic voice.
              Application is strictly free of charge; portal access is granted upon administrative review.
            </p>
          </div>

          {submittedApp ? (
            /* Solid Confirmation State */
            <div className="bg-white border border-slate-300 rounded-lg p-8 sm:p-10 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <div>
                  <h2 className="text-xl font-serif font-medium text-slate-900">
                    Application Under Curatorial Review
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Reference ID: <span className="font-mono font-semibold text-slate-800">{submittedApp.id}</span>
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded p-5 text-sm text-slate-700 space-y-2">
                <p className="font-medium text-slate-900">
                  Thank you, {submittedApp.name}.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your application has been received and entered into our curatorial queue. A confirmation email has been dispatched to{" "}
                  <strong className="text-slate-900 font-mono">{submittedApp.email}</strong>.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our platform curators and gallery owner have also been notified of your submission.
                </p>
              </div>

              <div className="border border-slate-200 rounded p-5 space-y-3 text-xs text-slate-600">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Submission Summary
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Medium</span>
                    <span className="font-medium text-slate-800">{submittedApp.medium}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Studio Location</span>
                    <span className="font-medium text-slate-800">{submittedApp.city}, Rwanda</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                    <span className="font-medium text-slate-800">{submittedApp.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Application Fee</span>
                    <span className="font-medium text-emerald-700">0 RWF (Free Application)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-5">
                <h3 className="font-semibold text-slate-900 uppercase text-[11px] tracking-wide">
                  Curatorial Protocol & Next Steps
                </h3>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
                  <li>
                    <strong>Evaluation:</strong> Our panel evaluates your submitted medium, portfolio, and artist statement within 24 to 48 hours.
                  </li>
                  <li>
                    <strong>No Fees:</strong> No payment is ever required for artist representation review.
                  </li>
                  <li>
                    <strong>Portal Activation:</strong> To maintain gallery authenticity, your Artist Studio Portal remains locked until official administrator approval.
                  </li>
                  <li>
                    <strong>Notification:</strong> Once approved, you will receive an invitation email containing immediate credentials to activate your Artist Portal.
                  </li>
                </ol>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href="/gallery"
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded text-center transition-colors"
                >
                  Browse Curated Fine Art Gallery
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmittedApp(null);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      city: "Kigali",
                      medium: "Acrylic on Canvas",
                      portfolioUrl: "",
                      sampleArtworkUrl: "",
                      bio: "",
                      agreed: false,
                    });
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded text-center transition-colors cursor-pointer"
                >
                  Submit Another Application
                </button>
              </div>
            </div>
          ) : (
            /* Solid Editorial Application Form */
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-slate-300 rounded-lg p-6 sm:p-10 shadow-xs space-y-8"
            >
              {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded">
                  {errorMessage}
                </div>
              )}

              {/* Section 1: Artist Credentials */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    1. Personal & Studio Credentials
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Full Legal / Artist Name <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Patrick Mugisha or Diane Uwase"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs sm:text-sm focus:border-slate-800 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Studio Location / City <span className="text-rose-600">*</span>
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs sm:text-sm focus:border-slate-800 focus:outline-none bg-white transition-colors"
                    >
                      {RWANDA_CITY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Email Address <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="artist@studio.rw"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs sm:text-sm focus:border-slate-800 focus:outline-none transition-colors"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Your application decision and portal invite will be sent here.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Phone / WhatsApp Number <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+250 788 000 000"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs sm:text-sm focus:border-slate-800 focus:outline-none transition-colors"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      For curatorial verification and collector courier coordination.
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: Artistic Discipline & Portfolio */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2">
                  <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    2. Artistic Practice & Portfolio
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Primary Medium / Discipline <span className="text-rose-600">*</span>
                  </label>
                  <select
                    name="medium"
                    value={formData.medium}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs sm:text-sm focus:border-slate-800 focus:outline-none bg-white transition-colors"
                  >
                    {ART_MEDIUM_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Online Portfolio / Instagram / Website
                    </label>
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleChange}
                      placeholder="https://instagram.com/your_handle"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs sm:text-sm focus:border-slate-800 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Sample Artwork Link / Drive URL
                    </label>
                    <input
                      type="url"
                      name="sampleArtworkUrl"
                      value={formData.sampleArtworkUrl}
                      onChange={handleChange}
                      placeholder="Link to photos of your original work"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs sm:text-sm focus:border-slate-800 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Artist Statement & Bio <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    name="bio"
                    required
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Briefly describe your artistic philosophy, creative background, materials, and themes explored in your collection..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded text-xs sm:text-sm focus:border-slate-800 focus:outline-none leading-relaxed transition-colors"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Our curators read this statement alongside your portfolio pieces.
                  </span>
                </div>
              </div>

              {/* Section 3: Curatorial Declaration & Terms */}
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 space-y-2">
                  <div className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider">
                    Application Terms
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed">
                    <li>
                      <strong>Zero application fees:</strong> Submissions are completely free. No payment details are requested.
                    </li>
                    <li>
                      <strong>Gated portal access:</strong> Artist portals are unlocked only after administrative review and approval.
                    </li>
                    <li>
                      <strong>Authenticity:</strong> All exhibited artworks must be original works authored by the applicant.
                    </li>
                  </ul>
                </div>

                <label className="flex items-start gap-3 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    name="agreed"
                    checked={formData.agreed}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I confirm that the works submitted are my original creations and agree to curatorial review by JREAL Curated Fine Art.
                  </span>
                </label>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-slate-400 order-2 sm:order-1 text-center sm:text-left">
                  Review decisions are dispatched within 24–48 hours via email.
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="order-1 sm:order-2 w-full sm:w-auto px-8 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold uppercase tracking-wider rounded transition-colors cursor-pointer"
                >
                  {loading ? "Submitting Application..." : "Submit Application for Review"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
