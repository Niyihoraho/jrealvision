"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

type Step = "FORM" | "VERIFY" | "SUCCESS";

export default function SignUpPage() {
  const router = useRouter();
  const redirectParam = (router.query.redirect as string) || "";

  // Step state
  const [step, setStep] = useState<Step>("FORM");

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP Fields
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend Timer
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto focus first input on verify step
  useEffect(() => {
    if (step === "VERIFY") {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    }
  }, [step]);

  // Google Sign-In / Sign-Up
  const handleGoogleSignIn = () => {
    setError(null);
    signIn("google", {
      callbackUrl:
        redirectParam && redirectParam.startsWith("/")
          ? redirectParam
          : "/my-orders",
    });
  };

  // 1. Submit Form & Send Code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendNotice(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail || !password) {
      return setError("Please fill in all required fields.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return setError("Please enter a valid email address.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: phone.trim() || undefined,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send confirmation code.");
      }

      setStep("VERIFY");
      setResendCooldown(60);
      setDigits(["", "", "", "", "", ""]);
    } catch (err: any) {
      setError(err.message || "An error occurred while preparing your account.");
    } finally {
      setLoading(false);
    }
  };

  // Handle digit changes
  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const nextDigits = [...digits];
      nextDigits[index] = "";
      setDigits(nextDigits);
      return;
    }

    // If pasted multiple characters
    if (cleanVal.length > 1) {
      const chars = cleanVal.slice(0, 6).split("");
      const nextDigits = [...digits];
      chars.forEach((c, i) => {
        if (i < 6) nextDigits[i] = c;
      });
      setDigits(nextDigits);
      const nextIdx = Math.min(chars.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const nextDigits = [...digits];
    nextDigits[index] = cleanVal;
    setDigits(nextDigits);

    // Auto advance to next box
    if (index < 5 && cleanVal) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 2. Resend Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || resending) return;
    setError(null);
    setResendNotice(null);
    setResending(true);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend confirmation code.");
      }

      setResendNotice("A new 6-digit confirmation code has been dispatched to your email.");
      setResendCooldown(60);
    } catch (err: any) {
      setError(err.message || "Failed to resend confirmation code.");
    } finally {
      setResending(false);
    }
  };

  // 3. Verify Code & Complete Registration
  const handleVerifyCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setResendNotice(null);

    const fullCode = digits.join("");
    if (fullCode.length !== 6) {
      return setError("Please enter all 6 digits of the confirmation code.");
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: fullCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed.");
      }

      // Transition to Success Step
      setStep("SUCCESS");

      // Auto sign in via NextAuth credentials
      const cleanEmail = email.trim().toLowerCase();
      await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
      });

      const dest =
        redirectParam && redirectParam.startsWith("/")
          ? redirectParam
          : "/my-orders";

      // Brief delay so user experiences the delight of verified status
      setTimeout(() => {
        router.push(dest);
      }, 1600);
    } catch (err: any) {
      setError(err.message || "Invalid confirmation code. Please check and try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Customer Account | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Create your customer account with email confirmation to manage print projects, custom framing, and gallery artworks."
        />
      </Head>

      <Header />

      <main className="min-h-[85vh] bg-[#F8FAFC] flex items-center justify-center pt-28 pb-20 px-4">
        <div className="w-full max-w-[460px]">
          {/* Main Card */}
          <div className="bg-white border border-gray-200/90 rounded-2xl shadow-xs p-7 sm:p-9 transition-all">
            {/* Header Brand */}
            <div className="text-center mb-6">
              <div className="inline-flex w-12 h-12 rounded-xl overflow-hidden shadow-2xs mb-3 border border-gray-100">
                <Image
                  src="/logo.jpeg"
                  alt="JREAL"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>

              {step === "FORM" && (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Create Account
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Enter your details to receive your email confirmation code
                  </p>
                </>
              )}

              {step === "VERIFY" && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#128C38] text-xs font-semibold mb-2">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Security Verification</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Check Your Inbox
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    We sent a 6-digit confirmation code to{" "}
                    <span className="font-semibold text-gray-800">{email}</span>
                  </p>
                </>
              )}

              {step === "SUCCESS" && (
                <>
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-50 text-[#128C38] flex items-center justify-center border-2 border-emerald-200 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    Account Verified!
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Your account has been activated. Logging you in now...
                  </p>
                </>
              )}
            </div>

            {/* Error Message Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium leading-relaxed">
                {error}
              </div>
            )}

            {/* Resend Notice Banner */}
            {resendNotice && (
              <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                {resendNotice}
              </div>
            )}

            {/* STEP 1: Registration Form */}
            {step === "FORM" && (
              <>
                {/* Google Sign Up */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-2.5 px-4 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 mb-4"
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
                  <span>Sign up with Google</span>
                </button>

                {/* Divider */}
                <div className="relative mb-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2.5 text-gray-400 font-medium text-[11px] tracking-wider">
                      Or register with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Luc Habimana"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#128C38] focus:ring-1 focus:ring-[#128C38] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#128C38] focus:ring-1 focus:ring-[#128C38] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Phone Number{" "}
                    <span className="text-gray-400 font-normal">
                      (Optional for MoMo delivery)
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+250 788 000 000"
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#128C38] focus:ring-1 focus:ring-[#128C38] focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full px-3.5 pr-10 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#128C38] focus:ring-1 focus:ring-[#128C38] focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50/50 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#128C38] focus:ring-1 focus:ring-[#128C38] focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>
                    {loading ? "Sending Confirmation Code…" : "Send Confirmation Code"}
                  </span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}

            {/* STEP 2: 6-Digit Email Verification */}
            {step === "VERIFY" && (
              <div className="space-y-6">
                {/* Visual Email Indicator */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700 truncate">
                    <Mail className="w-4 h-4 text-[#128C38] shrink-0" />
                    <span className="truncate font-medium">{email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("FORM");
                      setError(null);
                    }}
                    className="text-[#128C38] hover:underline font-semibold text-xs shrink-0 ml-2"
                  >
                    Edit
                  </button>
                </div>

                {/* 6 Segmented Digit Inputs */}
                <div>
                  <label className="block text-center text-xs font-semibold text-gray-700 mb-3">
                    Enter the 6-digit confirmation code:
                  </label>
                  <div className="flex items-center justify-between gap-2 max-w-[340px] mx-auto">
                    {digits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        className="w-11 h-13 text-center text-xl font-bold font-mono bg-gray-50/70 border-2 border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-[#128C38] focus:bg-white focus:ring-2 focus:ring-[#128C38]/20 transition-all"
                      />
                    ))}
                  </div>
                </div>

                {/* Verify Button */}
                <button
                  type="button"
                  onClick={() => handleVerifyCode()}
                  disabled={loading || digits.join("").length !== 6}
                  className="w-full py-3 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {loading ? "Activating Account…" : "Verify & Activate Account"}
                  </span>
                </button>

                {/* Resend Section */}
                <div className="pt-2 text-center border-t border-gray-100 flex flex-col items-center gap-2">
                  <p className="text-xs text-gray-500">
                    Didn&apos;t receive the confirmation email?
                    <span className="block text-[11px] text-gray-400 mt-0.5">
                      (Please check your <strong>Spam</strong> or <strong>Promotions</strong> folder as well)
                    </span>
                  </p>
                  {resendCooldown > 0 ? (
                    <span className="text-xs font-medium text-gray-400">
                      Resend available in{" "}
                      <span className="font-bold text-gray-700">{resendCooldown}s</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resending}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#128C38] hover:text-[#0E6C2B] transition-colors"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`}
                      />
                      <span>{resending ? "Sending code…" : "Resend Confirmation Code"}</span>
                    </button>
                  )}
                </div>

                {/* Back to details */}
                <button
                  type="button"
                  onClick={() => {
                    setStep("FORM");
                    setError(null);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors pt-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Account Details</span>
                </button>
              </div>
            )}

            {/* STEP 3: Success Screen */}
            {step === "SUCCESS" && (
              <div className="py-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-50 border border-emerald-100">
                  <div className="w-4 h-4 rounded-full border-2 border-[#128C38] border-t-transparent animate-spin" />
                </div>
                <p className="text-xs text-gray-500">
                  Preparing your customer dashboard...
                </p>
              </div>
            )}

            {/* Switch to Sign In (Only visible in FORM step) */}
            {step === "FORM" && (
              <div className="mt-6 pt-5 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">
                  Already have an account?{" "}
                  <Link
                    href={`/login${redirectParam
                      ? `?redirect=${encodeURIComponent(redirectParam)}`
                      : ""
                      }`}
                    className="text-[#128C38] font-bold hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
