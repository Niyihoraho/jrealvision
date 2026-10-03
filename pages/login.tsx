"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const redirectParam = (router.query.redirect as string) || "";
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to appropriate destination
  useEffect(() => {
    if (session?.user) {
      const role = session.user.role;
      if (redirectParam && redirectParam.startsWith("/")) {
        router.replace(redirectParam);
      } else if (role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else if (role === "ARTIST") {
        router.replace("/art-gallery/dashboard");
      } else {
        router.replace("/my-orders");
      }
    }
  }, [session, redirectParam, router]);

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return setError("Please enter your email address.");
    }
    if (!password) {
      return setError("Please enter your password.");
    }

    setLoading(true);

    try {
      // 1. NextAuth Credentials Sign In
      const result = await signIn("credentials", {
        email: cleanEmail,
        password,
        role: "CUSTOMER",
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Also call legacy login to set jreal_token cookie for non-NextAuth routes
      const legacyRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          role: "CUSTOMER",
        }),
      }).catch(() => null);

      let targetUrl = "/my-orders";
      if (legacyRes && legacyRes.ok) {
        const d = await legacyRes.json();
        if (d.redirectUrl) targetUrl = d.redirectUrl;
      }

      const dest =
        redirectParam && redirectParam.startsWith("/")
          ? redirectParam
          : targetUrl;

      router.push(dest);
    } catch (err: any) {
      setError(err.message === "Invalid password" ? "Incorrect password. Please try again." : err.message || "Failed to sign in.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError(null);
    signIn("google", {
      callbackUrl:
        redirectParam && redirectParam.startsWith("/")
          ? redirectParam
          : "/my-orders",
    });
  };

  return (
    <>
      <Head>
        <title>Customer Sign In | JREAL VISION DESIGN</title>
        <meta name="description" content="Sign in to your customer account to track orders and manage projects." />
      </Head>

      <Header />

      <main className="min-h-[85vh] bg-[#F8FAFC] flex items-center justify-center pt-28 pb-20 px-4">
        <div className="w-full max-w-[420px]">
          {/* Card */}
          <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs p-8 sm:p-9">
            {/* Header */}
            <div className="text-center mb-7">
              <div className="inline-flex w-12 h-12 rounded-xl overflow-hidden shadow-2xs mb-3.5 border border-gray-100">
                <Image
                  src="/logo.jpeg"
                  alt="JREAL"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Sign In</h1>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {error}
              </div>
            )}

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
