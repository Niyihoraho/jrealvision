"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import { Palette, ArrowLeft, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { updateArtistApplicationStatus } from "@/lib/artistApplications";

export default function ArtGalleryLoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Sync email from query if arriving from account activation
  useEffect(() => {
    if (router.query.email && typeof router.query.email === "string") {
      setEmail(router.query.email.trim());
    }
    if (router.query.registered === "true") {
      setRegisteredSuccess(true);
    }
  }, [router.query]);

  // If already logged in as artist or admin, redirect to artist dashboard
  useEffect(() => {
    if (session?.user?.role === "ARTIST" || session?.user?.role === "ADMIN") {
      router.replace("/art-gallery/dashboard");
      return;
    }

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.role === "ARTIST" || data?.user?.role === "ADMIN") {
          router.replace("/art-gallery/dashboard");
        }
      })
      .catch(() => {});
  }, [session, router]);

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError("Please enter your studio artist email address.");

    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. NextAuth Credentials Sign In
      const nextResult = await signIn("credentials", {
        email: cleanEmail,
        password: password || undefined,
        role: "ARTIST",
        redirect: false,
      });

      if (nextResult?.error) {
        throw new Error(nextResult.error);
      }

      // 2. Legacy API call for cookie sync
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password: password || undefined,
          role: "ARTIST",
        }),
      }).catch(() => null);

      // 3. Cache role and user in storage for instant zero-lag navigation
      try {
        const artistUser = { email: cleanEmail, role: "ARTIST" };
        localStorage.setItem("jreal_auth_role", "ARTIST");
        localStorage.setItem("jreal_auth_user", JSON.stringify(artistUser));
        sessionStorage.setItem("jreal_auth_user", JSON.stringify(artistUser));
        updateArtistApplicationStatus(cleanEmail, "APPROVED");
      } catch {}

      router.push("/art-gallery/dashboard");
    } catch (err: any) {
      setError(err.message === "Invalid password" ? "Incorrect password. Please verify your studio credentials." : err.message || "Failed to sign in.");
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Art Gallery Portal | JREAL VISION DESIGN</title>
        <meta name="description" content="Sign in to your Art Gallery and artist collection portal." />
      </Head>

      <Header />

      <main className="min-h-[82vh] bg-[#F8FAFC] flex items-center justify-center pt-28 pb-20 px-4">
        <div className="w-full max-w-[420px]">
          {/* Back link */}
          <div className="mb-4">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Art Gallery</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs p-8 sm:p-9">
            {/* Header */}
            <div className="text-center mb-7">
              <div className="inline-flex w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 items-center justify-center mb-3.5 shadow-2xs">
                <Palette className="w-6 h-6 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Artist Studio Portal</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Manage your gallery collection, escrow payouts, and COA
              </p>
            </div>

            {/* Registration Success Banner */}
            {registeredSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Artist Credentials Activated!</strong>
                  <span>Your representation account is confirmed. Enter your password to access your Studio Portal.</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            {/* Email / Password Form */}
            <form onSubmit={onEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Studio Artist Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="artist@jreal.rw"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#128C38] focus:ring-1 focus:ring-[#128C38] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 pr-10 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#128C38] focus:ring-1 focus:ring-[#128C38] focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? "Signing in…" : "Enter Studio Dashboard"}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-500 space-y-2">
              <div>
                Approved representation?{" "}
                <Link href="/artist/setup-account" className="text-[#128C38] font-bold hover:underline">
                  Activate Account & Set Password
                </Link>
              </div>
              <div>
                Want to showcase your artwork?{" "}
                <Link href="/join-as-artist" className="text-gray-600 font-semibold hover:underline">
                  Apply as an Artist
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
