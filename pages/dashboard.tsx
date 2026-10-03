import { useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

export default function DashboardRouterPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Instant routing from cached storage
    try {
      const storedRole =
        localStorage.getItem("jreal_auth_role") ||
        sessionStorage.getItem("jreal_auth_role");
      if (storedRole === "ADMIN") {
        router.replace("/admin/dashboard");
        return;
      } else if (storedRole === "ARTIST") {
        router.replace("/artist/dashboard");
        return;
      } else if (storedRole === "VENDOR") {
        router.replace("/vendor/dashboard");
        return;
      }
    } catch {}

    // 2. Fetch fresh role if not yet cached
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          const role = data.user.role;
          try {
            if (role) localStorage.setItem("jreal_auth_role", role);
          } catch {}

          if (role === "ADMIN") {
            router.replace("/admin/dashboard");
          } else if (role === "ARTIST") {
            router.replace("/artist/dashboard");
          } else if (role === "VENDOR") {
            router.replace("/vendor/dashboard");
          } else {
            router.replace("/my-orders");
          }
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  return (
    <>
      <Head>
        <title>Loading Portal... | JREAL VISION</title>
      </Head>
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    </>
  );
}
