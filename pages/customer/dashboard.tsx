"use client";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function CustomerDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/my-orders");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center font-mono text-xs uppercase tracking-widest text-gray-500">
      Loading your orders…
    </div>
  );
}
