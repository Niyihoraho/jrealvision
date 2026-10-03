"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import { ShieldCheck, ArrowLeft, Eye, EyeOff, ArrowRight } from "lucide-react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in as admin, redirect to admin dashboard
  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      router.replace("/admin/dashboard");
      return;
    }

    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.role === "ADMIN") {
          router.replace("/admin/dashboard");
        }
      })
      .catch(() => {});
  }, [session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError("Please enter your administrator email address.");

    setLoading(true);
    setError(null);

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. NextAuth sign in
      const nextResult = await signIn("credentials", {
        email: cleanEmail,
        password: password || undefined,
        role: "ADMIN",
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
          role: "ADMIN",
        }),
      }).catch(() => null);

      // 3. Cache role and user in storage for instant zero-lag navigation
      try {
        const adminUser = { email: cleanEmail, role: "ADMIN" };
        localStorage.setItem("jreal_auth_role", "ADMIN");
        localStorage.setItem("jreal_auth_user", JSON.stringify(adminUser));
        sessionStorage.setItem("jreal_auth_user", JSON.stringify(adminUser));
      } catch {}

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message === "Invalid password" ? "Incorrect password. Please verify your administrator credentials." : err.message || "Invalid administrator credentials.");
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Portal | JREAL VISION DESIGN</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <Header />

      <main className="min-h-[82vh] bg-[#F8FAFC] flex items-center justify-center pt-28 pb-20 px-4">
        <div className="w-full max-w-[400px]">
          {/* Back link */}
          <div className="mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex w-11 h-11 rounded-xl bg-gray-900 text-white items-center justify-center mb-3 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
              <p className="text-xs text-gray-500 mt-1">
                Authorized platform management
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@jreal.rw"
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
                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? "Authenticating…" : "Access Dashboard"}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
