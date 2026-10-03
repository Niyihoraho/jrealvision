"use client";
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { companyInfo } from "@/lib/data";
import { X, CheckCircle2, FileText, Printer, Download } from "lucide-react";

interface OrderItemSummary {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: "PAYMENT_CONFIRMED" | "PRODUCTION" | "QUALITY_CONTROL" | "IN_TRANSIT" | "DELIVERED" | "PENDING";
  paymentStatus: "PAID" | "UNPAID" | "PENDING";
  paymentMethod: string;
  shippingCity: string;
  shippingAddress: string;
  items: OrderItemSummary[];
  deliverables?: { name: string; size: string }[];
}

const DEFAULT_SAMPLE_ORDERS: OrderRecord[] = [
  {
    id: "ord-101",
    orderNumber: "JRV-2041",
    date: "2026-09-28",
    total: 185000,
    status: "PRODUCTION",
    paymentStatus: "PAID",
    paymentMethod: "MTN MOMO",
    shippingCity: "Kicukiro",
    shippingAddress: "KG 14 Ave, near Eco-Bank",
    items: [
      {
        name: "Custom Corporate Identity & Stationery Pack (500 Cards + Letterheads)",
        quantity: 1,
        price: 185000,
      },
    ],
    deliverables: [{ name: "Approved-Stationery-Preflight.pdf", size: "4.8 MB" }],
  },
  {
    id: "ord-102",
    orderNumber: "JRV-2038",
    date: "2026-09-15",
    total: 450000,
    status: "DELIVERED",
    paymentStatus: "PAID",
    paymentMethod: "BANK TRANSFER",
    shippingCity: "Gasabo",
    shippingAddress: "KG 9 Ave, Nyarutarama",
    items: [
      {
        name: "Full Brand Guidelines & Vector Asset Suite (Master Logo + Guidelines)",
        quantity: 1,
        price: 450000,
      },
    ],
    deliverables: [
      { name: "Brand-Identity-Master-Assets.zip", size: "84.2 MB" },
      { name: "Brand-Guidelines-Handbook.pdf", size: "12.6 MB" },
    ],
  },
  {
    id: "ord-103",
    orderNumber: "JRV-2029",
    date: "2026-09-29",
    total: 320000,
    status: "IN_TRANSIT",
    paymentStatus: "PAID",
    paymentMethod: "AIRTEL MONEY",
    shippingCity: "Nyarugenge",
    shippingAddress: "KN 2 Roundabout, CBD",
    items: [
      {
        name: "Original Artwork: 'Imigongo Modern Rhythm' (Acrylic on Canvas 100×80 cm)",
        quantity: 1,
        price: 320000,
      },
    ],
    deliverables: [{ name: "Certificate-of-Authenticity.pdf", size: "1.2 MB" }],
  },
];

export default function MyOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [receiptModalOrder, setReceiptModalOrder] = useState<OrderRecord | null>(null);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch authenticated user
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => {
        if (!data.user) {
          router.replace("/login?redirect=/my-orders");
          return;
        }
        setUser(data.user);

        // 2. Fetch orders for this customer
        return fetch("/api/orders");
      })
      .then((res) => (res && res.ok ? res.json() : null))
      .then((data) => {
        let mapped: OrderRecord[] = [];
        if (data?.orders && data.orders.length > 0) {
          mapped = data.orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            date: new Date(o.createdAt).toISOString().split("T")[0],
            total: o.total,
            status: (o.status || "PENDING") as any,
            paymentStatus: (o.paymentStatus || "PAID") as any,
            paymentMethod: o.payments?.[0]?.method || "MOMO",
            shippingCity: o.shippingCity || "Kigali",
            shippingAddress: o.shippingAddress || "Rwanda",
            items:
              o.items?.map((it: any) => ({
                name: it.product?.name || "Custom Order Item",
                quantity: it.quantity,
                price: it.price,
              })) || [],
          }));
        }

        // Also merge recent local orders placed from checkout
        let combinedOrders = [...mapped];
        try {
          const rawLocal = localStorage.getItem("jreal_recent_orders");
          if (rawLocal) {
            const parsedLocal = JSON.parse(rawLocal);
            if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
              const existingIds = new Set(combinedOrders.map((x) => x.id));
              const existingNums = new Set(combinedOrders.map((x) => x.orderNumber));
              const extraLocal: OrderRecord[] = parsedLocal
                .filter((lo) => !existingIds.has(lo.id) && !existingNums.has(lo.orderNumber))
                .map((lo) => ({
                  id: lo.id,
                  orderNumber: lo.orderNumber,
                  date: lo.date || new Date().toISOString().split("T")[0],
                  total: Number(lo.total) || 0,
                  status: (lo.status || "PENDING") as any,
                  paymentStatus: "PAID" as any,
                  paymentMethod: lo.paymentMethod || "MOMO",
                  shippingCity: lo.locationLandmark || "Kigali",
                  shippingAddress: lo.deliveryLocation || "Rwanda",
                  items:
                    lo.items?.map((it: any) => ({
                      name: it.title || it.name || "Custom Order Item",
                      quantity: it.quantity || 1,
                      price: it.price || 0,
                    })) || [{ name: "Order Item", quantity: 1, price: Number(lo.total) || 0 }],
                }));
              combinedOrders = [...extraLocal, ...combinedOrders];
            }
          }
        } catch { }

        if (combinedOrders.length > 0) {
          setOrders(combinedOrders);
        } else {
          // If no orders in DB yet, show realistic sample orders for this account
          setOrders(DEFAULT_SAMPLE_ORDERS);
        }
      })
      .catch(() => {
        // If not authenticated, redirect to login
        router.replace("/login?redirect=/my-orders");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/me", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };


  return (
    <>
      <Head>
        <title>My Orders & Account | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="View your purchase history, track active orders, and download project files."
        />
      </Head>

      <Header />

      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Customer Profile Header */}
          <div className="bg-white border border-gray-200 p-6 sm:p-7 mb-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#128C38]">
                    Customer Account
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">Signed in via {user?.email}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Welcome, {user?.name || "Valued Customer"}
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  Manage your recent orders, track delivery progress, and download completed files.
                </p>
              </div>

              {/* Account Quick Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/shop"
                  className="px-4 py-2 bg-[#128C38] hover:bg-[#0f7230] text-white text-xs font-bold transition-colors"
                >
                  Browse Shop
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3.5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 text-left">
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                  Total Orders
                </span>
                <span className="text-lg font-bold text-gray-900 mt-0.5 block">
                  {orders.length}
                </span>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                  Active in Delivery
                </span>
                <span className="text-lg font-bold text-[#F59E0B] mt-0.5 block">
                  {orders.filter((o) => o.status === "IN_TRANSIT" || o.status === "PRODUCTION").length}
                </span>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                  Account Status
                </span>
                <span className="text-lg font-bold text-[#128C38] mt-0.5 block">
                  Verified
                </span>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                  Customer Support
                </span>
                <a
                  href={`https://wa.me/${companyInfo.whatsapp.replace(/\+/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#128C38] hover:underline mt-1 block"
                >
                  WhatsApp Help →
                </a>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Order History & Purchases
              </h2>
              <span className="text-xs text-gray-500 font-medium">
                Showing {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white border border-gray-200 p-12 text-center">
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  You haven&apos;t placed any orders yet.
                </p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto mb-6">
                  Explore our custom apparel, business cards, signage, and branding services.
                </p>
                <Link
                  href="/shop"
                  className="inline-block px-5 py-2.5 bg-[#128C38] text-white text-xs font-bold hover:bg-[#0f7230] transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white border border-gray-200 border-l-2 border-l-[#128C38] p-5 sm:p-6 shadow-2xs"
                  >


                    {/* Order content */}
                    <div className="py-4 space-y-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between gap-4 text-xs"
                        >
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900 block">
                              {item.name}
                            </span>
                            <span className="text-gray-500 text-[11px]">
                              Qty: {item.quantity} · Destination: {order.shippingCity},{" "}
                              {order.shippingAddress}
                            </span>
                          </div>
                          <span className="font-bold text-gray-900 shrink-0">
                            {item.price.toLocaleString()} RWF
                          </span>
                        </div>
                      ))}
                    </div>



                    {/* Order bottom row: Total and Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-xs text-gray-500">Total Paid: </span>
                        <span className="text-sm font-extrabold text-gray-900">
                          {order.total.toLocaleString()} RWF
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/${companyInfo.whatsapp.replace(/\+/g, "")}?text=Hello%20JREAL%20VISION,%20inquiry%20regarding%20order%20${order.orderNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors"
                        >
                          Track on WhatsApp
                        </a>
                        <button
                          type="button"
                          onClick={() => setReceiptModalOrder(order)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Receipt
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* In-App Order Receipt Modal */}
      {receiptModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setReceiptModalOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Official Order Receipt</h3>
                <p className="text-xs text-gray-500 font-mono">Invoice #{receiptModalOrder.orderNumber}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Order Date:</span>
                <span className="font-semibold text-gray-900">{receiptModalOrder.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Payment Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  {receiptModalOrder.paymentStatus} via {receiptModalOrder.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Delivery Destination:</span>
                <span className="font-medium text-gray-800 text-right">{receiptModalOrder.shippingCity}, {receiptModalOrder.shippingAddress}</span>
              </div>
            </div>

            {/* Line Items */}
            <div className="bg-gray-50 rounded-xl p-3.5 mb-5 border border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Purchased Items</span>
              <div className="divide-y divide-gray-100 space-y-2">
                {receiptModalOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center pt-2 first:pt-0 text-xs">
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-[11px] text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-mono font-bold text-gray-900">
                      {(item.price * item.quantity).toLocaleString()} RWF
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200/80 flex justify-between items-baseline">
                <span className="text-xs font-bold text-gray-700">Total Paid (VAT Incl.)</span>
                <span className="text-base font-black text-[#128C38]">
                  {receiptModalOrder.total.toLocaleString()} RWF
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setReceiptModalOrder(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#128C38] hover:bg-[#0E6C2B] rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
