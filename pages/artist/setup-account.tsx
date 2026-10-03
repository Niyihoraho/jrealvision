// pages/artist/setup-account.tsx
// Artist Representation — Account Activation & Portal Onboarding
// Flow:
// 1. Enter & validate strong password (with live meter & security checklist)
// 2. Enter 6-digit confirmation code (OTP) sent to artist email
// 3. Receive confirmed credentials and enter the Artist Studio Portal

"use client";

import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  Palette,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Check,
} from "lucide-react";
import { updateArtistApplicationStatus } from "@/lib/artistApplications";

export default function ArtistSetupAccountPage() {
  const router = useRouter();

  // Wizard Steps: 1 = Password Setup, 2 = Confirmation Code OTP, 3 = Portal Activated
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 6-digit OTP code state (array of 6 strings)
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Pre-fill query parameters on load
  useEffect(() => {
    if (router.isReady) {
      if (typeof router.query.email === "string" && router.query.email) {
        setEmail(router.query.email.trim());
      }
      if (typeof router.query.token === "string" && router.query.token) {
        setToken(router.query.token.trim());
      }
      if (typeof router.query.name === "string" && router.query.name) {
        setName(router.query.name.trim());
      }
    }
  }, [router.isReady, router.query]);

  // Step 3 auto-redirect to art gallery login
  const [autoRedirectSec, setAutoRedirectSec] = useState(4);

  useEffect(() => {
    if (step !== 3) return;
    const interval = setInterval(() => {
      setAutoRedirectSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push(`/art-gallery/login?registered=true&email=${encodeURIComponent(email)}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, email, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Real-time Strong Password Criteria Checklist
  const rules = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password),
    matches: password.length > 0 && password === confirmPassword,
  };

  const satisfiedCount = [
    rules.minLength,
    rules.hasUpper,
    rules.hasLower,
    rules.hasNumber,
    rules.hasSpecial,
  ].filter(Boolean).length;

  // Strength score: 0 to 4
  const strengthScore = satisfiedCount <= 1 ? 1 : satisfiedCount <= 3 ? 2 : satisfiedCount === 4 ? 3 : 4;
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong & Secure"];
  const strengthColors = ["", "bg-rose-500", "bg-amber-500", "bg-teal-500", "bg-emerald-600"];
  const strengthTextColors = ["", "text-rose-600", "text-amber-600", "text-teal-600", "text-emerald-700"];

  const isPasswordReady =
    rules.minLength &&
    rules.hasUpper &&
    rules.hasLower &&
    rules.hasNumber &&
    rules.hasSpecial &&
    rules.matches;

  // Handle Step 1: Submit Strong Password -> Send Confirmation Code
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid artist email address.");
      return;
    }
    if (!isPasswordReady) {
      setError("Please ensure your password satisfies all security requirements.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const res = await fetch("/api/artists/setup-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-code",
          email: email.trim().toLowerCase(),
          password,
          token,
          name: name || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to send confirmation code.");
      }

      setStep(2);
      setResendCooldown(60);
      setSuccessNotice(`A 6-digit confirmation code was sent to ${email}. Check your inbox!`);
      // Focus first OTP input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setError(err.message || "Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit changes
  const handleDigitChange = (index: number, val: string) => {
    // If pasted whole string
    if (val.length > 1) {
      const clean = val.replace(/\D/g, "").slice(0, 6);
      if (clean.length > 0) {
        const nextDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = clean[i] || "";
        }
        setOtpDigits(nextDigits);
        const nextFocus = Math.min(clean.length, 5);
        otpInputRefs.current[nextFocus]?.focus();
      }
      return;
    }

    const nextDigits = [...otpDigits];
    nextDigits[index] = val.slice(-1);
    setOtpDigits(nextDigits);

    // Auto advance to next input
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Resend code action
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/artists/setup-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-code",
          email: email.trim().toLowerCase(),
          password,
          token,
          name: name || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to resend code");
      }
      setResendCooldown(60);
      setSuccessNotice("A fresh confirmation code has been emailed to you.");
    } catch (err: any) {
      setError(err.message || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: Verify OTP Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpDigits.join("");
    if (fullCode.length !== 6) {
      setError("Please enter all 6 digits of your confirmation code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/artists/setup-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-code",
          email: email.trim().toLowerCase(),
          code: fullCode,
          token,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid confirmation code.");
      }

      // Sync local artist applications status and role so client guards let the user in
      try {
        updateArtistApplicationStatus(email, "APPROVED");
        const artistUser = data.user || { email: email.trim().toLowerCase(), role: "ARTIST" };
        localStorage.setItem("jreal_auth_role", "ARTIST");
        localStorage.setItem("jreal_auth_user", JSON.stringify(artistUser));
        sessionStorage.setItem("jreal_auth_user", JSON.stringify(artistUser));
      } catch {}

      setStep(3);
    } catch (err: any) {
      setError(err.message || "Confirmation failed. Please double check the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Activate Artist Portal | JREAL Curated Fine Art</title>
        <meta
          name="description"
          content="Activate your approved artist representation credentials and enter your fine art studio portal."
        />
      </Head>

      <Header />

      <main className="min-h-screen bg-[#F8FAFC] pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          {/* Top navigation back link */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Fine Art Gallery</span>
            </Link>

            <Link
              href="/art-gallery/login"
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Already activated? Sign in
            </Link>
          </div>

          {/* Stepper Header */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs mb-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 flex items-center justify-center shadow-2xs">
                  <Palette className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
                    Curatorial Representation
                  </span>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                    Activate Your Artist Portal
                  </h1>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Step {step} of 3
              </span>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-3 gap-2">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  step >= 1 ? "bg-emerald-600" : "bg-slate-200"
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all ${
                  step >= 2 ? "bg-emerald-600" : "bg-slate-200"
                }`}
              />
              <div
                className={`h-1.5 rounded-full transition-all ${
                  step >= 3 ? "bg-emerald-600" : "bg-slate-200"
                }`}
              />
            </div>
          </div>

          {/* Error & Success Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-start gap-2.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* ── STEP 1: STRONG PASSWORD CREATION ── */}
          {step === 1 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-9 shadow-xs space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Step 1: Set Your Studio Password
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Create a strong, encrypted password to secure your artwork listings and escrow payouts.
                </p>
              </div>

              <form onSubmit={handleSubmitPassword} className="space-y-5">
                {/* Email address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Studio Artist Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="artist@jreal.rw"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all font-medium"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    This must match the email on your approved artist representation application.
                  </p>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Create Strong Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter Bar */}
                  {password.length > 0 && (
                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Password Strength:</span>
                        <span className={`font-bold ${strengthTextColors[strengthScore]}`}>
                          {strengthLabels[strengthScore]}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                        <div
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            strengthScore >= 1 ? strengthColors[strengthScore] : "bg-transparent"
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            strengthScore >= 2 ? strengthColors[strengthScore] : "bg-transparent"
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            strengthScore >= 3 ? strengthColors[strengthScore] : "bg-transparent"
                          }`}
                        />
                        <div
                          className={`h-full flex-1 rounded-full transition-all duration-300 ${
                            strengthScore >= 4 ? strengthColors[strengthScore] : "bg-transparent"
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50/50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 focus:bg-white transition-all"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Live Requirements Checklist */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 text-xs space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Security Requirements Checklist
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          rules.minLength ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {rules.minLength ? "✓" : "•"}
                      </span>
                      <span className={rules.minLength ? "text-slate-900 font-medium" : ""}>
                        At least 8 characters
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          rules.hasUpper ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {rules.hasUpper ? "✓" : "•"}
                      </span>
                      <span className={rules.hasUpper ? "text-slate-900 font-medium" : ""}>
                        Uppercase letter (A-Z)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          rules.hasLower ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {rules.hasLower ? "✓" : "•"}
                      </span>
                      <span className={rules.hasLower ? "text-slate-900 font-medium" : ""}>
                        Lowercase letter (a-z)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          rules.hasNumber ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {rules.hasNumber ? "✓" : "•"}
                      </span>
                      <span className={rules.hasNumber ? "text-slate-900 font-medium" : ""}>
                        Numeric digit (0-9)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:col-span-2">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          rules.hasSpecial ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"
                        }`}
                      >
                        {rules.hasSpecial ? "✓" : "•"}
                      </span>
                      <span className={rules.hasSpecial ? "text-slate-900 font-medium" : ""}>
                        Special symbol (!@#$%^&* etc.)
                      </span>
                    </div>

                    {confirmPassword.length > 0 && (
                      <div className="flex items-center gap-2 sm:col-span-2 pt-1 border-t border-slate-200/60">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            rules.matches ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
                          }`}
                        >
                          {rules.matches ? "✓" : "✕"}
                        </span>
                        <span className={rules.matches ? "text-emerald-700 font-semibold" : "text-rose-600 font-medium"}>
                          {rules.matches ? "Passwords match" : "Passwords do not match yet"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !isPasswordReady}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Validating & Sending Code…</span>
                    </>
                  ) : (
                    <>
                      <span>Continue & Send Confirmation Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 2: 6-DIGIT CONFIRMATION CODE (OTP) ── */}
          {step === 2 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-9 shadow-xs space-y-6">
              <div className="text-center max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                  <Mail className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Enter Confirmation Code</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  We sent a 6-digit confirmation code to{" "}
                  <strong className="text-slate-900 font-mono">{email}</strong>.
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                {/* 6 Digit Input Cells */}
                <div className="flex justify-center items-center gap-2 sm:gap-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-slate-900"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 px-2">
                  <span>Code expires in 15 minutes</span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                    className="font-semibold text-emerald-700 hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                  >
                    {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend code"}
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading || otpDigits.join("").length !== 6}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Code…</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Code & Activate Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
                  >
                    ← Change Password or Email
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── STEP 3: CREDENTIALS CONFIRMED & PORTAL ACCESS READY ── */}
          {step === 3 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-9 shadow-xs space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 border-2 border-emerald-300">
                  <Check className="w-7 h-7 text-emerald-700" strokeWidth={3} />
                </div>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-full uppercase tracking-wider mb-2 border border-emerald-200">
                  ✓ Official Representation Active
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Artist Studio Portal Activated!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
                  Your credentials have been securely provisioned. You now have full access to manage your fine art catalog and sales escrow.
                </p>
              </div>

              {/* Confirmed Credentials Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Artist Studio Account</span>
                  <span className="font-mono font-bold text-slate-900">{email}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Portal Security</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Strong Encrypted Password Confirmed
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <span className="text-slate-500">Access Privilege</span>
                  <span className="font-semibold text-slate-900">
                    JREAL Represented Fine Art Artist
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Capabilities Unlocked</span>
                  <span className="font-medium text-slate-700 text-right">
                    COA Generator • Escrow Payouts • Kigali Courier Dispatch
                  </span>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <Link
                  href={`/art-gallery/login?registered=true&email=${encodeURIComponent(email)}`}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Sign In to Artist Studio Portal ({autoRedirectSec}s)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/art-gallery/dashboard"
                  className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-medium text-center block transition-colors"
                >
                  Or enter Studio Portal directly →
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
