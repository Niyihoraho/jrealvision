"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LogIn, Package } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  loginRedirect?: string;
  portalName?: string;
}

// Module-level persistent cache across client navigation
let cachedMemoryUser: any = null;
let lastVerifiedTimestamp = 0;

export default function RoleGuard({
  children,
  allowedRoles,
  loginRedirect,
  portalName = "Portal",
}: RoleGuardProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Retrieve immediately from memory, sessionStorage or localStorage
  const [dbUser, setDbUser] = useState<any>(() => {
    if (cachedMemoryUser) return cachedMemoryUser;
    if (typeof window !== "undefined") {
      try {
        const stored =
          sessionStorage.getItem("jreal_auth_user") ||
          localStorage.getItem("jreal_auth_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          cachedMemoryUser = parsed;
          return parsed;
        }
      } catch {}
    }
    return null;
  });

  // Local storage stored role
  const [storedRole, setStoredRole] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("jreal_auth_role") ||
        sessionStorage.getItem("jreal_auth_role") ||
        null
      );
    }
    return null;
  });

  const currentUser = session?.user || dbUser || cachedMemoryUser;
  const currentRole =
    (currentUser?.role as string) ||
    storedRole ||
    (typeof window !== "undefined" ? localStorage.getItem("jreal_auth_role") : null);

  const isAuthenticated = Boolean(
    currentUser ||
    storedRole ||
    (typeof window !== "undefined" && localStorage.getItem("jreal_auth_role"))
  );

  // Immediate access check
  const hasAccess = Boolean(currentRole && allowedRoles.includes(currentRole));

  // Sync memory & storage whenever session updates
  useEffect(() => {
    if (session?.user) {
      cachedMemoryUser = session.user;
      lastVerifiedTimestamp = Date.now();
      const role = (session.user as any).role;
      if (role) {
        setStoredRole(role);
        try {
          localStorage.setItem("jreal_auth_role", role);
          sessionStorage.setItem("jreal_auth_role", role);
        } catch {}
      }
      try {
        const json = JSON.stringify(session.user);
        sessionStorage.setItem("jreal_auth_user", json);
        localStorage.setItem("jreal_auth_user", json);
      } catch {}
    }
  }, [session]);

  // If already confirmed to have access, skip redundant network checks
  useEffect(() => {
    if (hasAccess && Date.now() - lastVerifiedTimestamp < 600000) {
      return;
    }

    let isMounted = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.user) {
          setDbUser(data.user);
          cachedMemoryUser = data.user;
          lastVerifiedTimestamp = Date.now();
          if (data.user.role) {
            setStoredRole(data.user.role);
            try {
              localStorage.setItem("jreal_auth_role", data.user.role);
              sessionStorage.setItem("jreal_auth_role", data.user.role);
            } catch {}
          }
          try {
            sessionStorage.setItem("jreal_auth_user", JSON.stringify(data.user));
            localStorage.setItem("jreal_auth_user", JSON.stringify(data.user));
          } catch {}
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [hasAccess]);

  const defaultLoginUrl = allowedRoles.includes("ADMIN")
    ? `/admin/login?redirect=${encodeURIComponent(router.asPath)}`
    : allowedRoles.includes("ARTIST")
    ? `/art-gallery/login?redirect=${encodeURIComponent(router.asPath)}`
    : `/login?redirect=${encodeURIComponent(router.asPath)}`;

  const loginTarget = loginRedirect || defaultLoginUrl;

  // Route protection redirect: ONLY redirect if NextAuth has finished loading AND user is genuinely unauthenticated
  useEffect(() => {
    // If NextAuth is still loading, wait
    if (status === "loading") return;

    // If completely unauthenticated
    if (status === "unauthenticated" && !hasAccess && !storedRole) {
      router.replace(loginTarget);
      return;
    }

    // If signed in as customer trying to access admin
    if (isAuthenticated && !hasAccess && currentRole === "CUSTOMER" && allowedRoles.includes("ADMIN")) {
      router.replace("/my-orders");
    }
  }, [status, hasAccess, storedRole, isAuthenticated, currentRole, allowedRoles, loginTarget, router]);

  // Unauthorized screen (if signed in as wrong role, e.g. customer on admin page)
  if (status !== "loading" && isAuthenticated && !hasAccess && currentRole === "CUSTOMER") {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xs p-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-4">
            <Package className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-2">
            Customer Portal
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6">
            You are currently signed in as{" "}
            <span className="font-semibold text-gray-800">{currentUser?.email || "Customer"}</span>. Looking for your store orders, project deliverables, and delivery tracking?
          </p>

          <div className="flex flex-col gap-2.5">
            <Link
              href="/my-orders"
              className="w-full py-3 px-4 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-2 shadow-xs"
            >
              <Package className="w-4 h-4" />
              <span>Go to Customer Portal & Orders →</span>
            </Link>

            <Link
              href={loginTarget}
              className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Staff Account</span>
            </Link>

            <Link
              href="/"
              className="w-full py-2 text-gray-400 hover:text-gray-700 text-xs font-medium transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render content immediately with zero lag! No full-screen blocking spinners!
  return <>{children}</>;
}
