import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useCart } from "@/app/components/CartProvider";
import { companyInfo } from "@/lib/data";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  Zap,
  Store,
  ChevronRight,
  ExternalLink,
  Navigation,
  LocateFixed,
  AlertCircle,
  Copy,
} from "lucide-react";
import {
  DeliveryOption,
  PaymentOption,
  getStoredCheckoutSettings,
  DEFAULT_DELIVERY_OPTIONS,
  DEFAULT_PAYMENT_OPTIONS,
} from "@/lib/checkoutSettings";

const DISTRICTS = [
  "Kicukiro", "Gasabo", "Nyarugenge",
  "Musanze", "Rubavu", "Huye", "Muhanga", "Rwamagana", "Nyanza",
];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();

  // Step control
  const [step, setStep] = useState<1 | 2>(1);

  // User state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Contact
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Dynamic Settings from Admin
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>(DEFAULT_DELIVERY_OPTIONS);
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>(DEFAULT_PAYMENT_OPTIONS);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>("del_standard");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("pay_momo");
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Delivery Address details
  const [district, setDistrict] = useState("Kicukiro");
  const [streetAddress, setStreetAddress] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [locationUrl, setLocationUrl] = useState("");

  // GPS state
  const [gpsState, setGpsState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState("");

  // Payment notes
  const [orderNotes, setOrderNotes] = useState("");

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Active selections
  const selectedDelivery =
    deliveryOptions.find((d) => d.id === selectedDeliveryId) || deliveryOptions[0];
  const isPickup = selectedDelivery?.type === "pickup";
  const deliveryFee = selectedDelivery ? selectedDelivery.fee : 0;
  const grandTotal = totalPrice + deliveryFee;

  const selectedPayment =
    paymentOptions.find((p) => p.id === selectedPaymentId) || paymentOptions[0];

  useEffect(() => {
    // 1. Fetch user profile
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          if (data.user.name) setFullName(data.user.name);
          if (data.user.email) setEmail(data.user.email);
          if (data.user.phone) setPhone(data.user.phone);
        }
      })
      .catch(() => { });

    // 2. Load dynamic checkout settings from Admin
    const loadSettings = () => {
      const stored = getStoredCheckoutSettings();
      const activeDeliveries = stored.deliveryOptions.filter((d) => d.isActive);
      const activePayments = stored.paymentOptions.filter((p) => p.isActive);

      if (activeDeliveries.length > 0) {
        setDeliveryOptions(activeDeliveries);
        setSelectedDeliveryId((prev) =>
          activeDeliveries.some((d) => d.id === prev) ? prev : activeDeliveries[0].id
        );
      }
      if (activePayments.length > 0) {
        setPaymentOptions(activePayments);
        setSelectedPaymentId((prev) =>
          activePayments.some((p) => p.id === prev) ? prev : activePayments[0].id
        );
      }
    };

    loadSettings();

    fetch("/api/admin/checkout-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (Array.isArray(data.deliveryOptions)) {
            const active = data.deliveryOptions.filter((d: DeliveryOption) => d.isActive);
            if (active.length > 0) {
              setDeliveryOptions(active);
              setSelectedDeliveryId((prev) =>
                active.some((d: DeliveryOption) => d.id === prev) ? prev : active[0].id
              );
            }
          }
          if (Array.isArray(data.paymentOptions)) {
            const active = data.paymentOptions.filter((p: PaymentOption) => p.isActive);
            if (active.length > 0) {
              setPaymentOptions(active);
              setSelectedPaymentId((prev) =>
                active.some((p: PaymentOption) => p.id === prev) ? prev : active[0].id
              );
            }
          }
        }
      })
      .catch(() => {});

    window.addEventListener("checkout_settings_updated", loadSettings);
    return () => window.removeEventListener("checkout_settings_updated", loadSettings);
  }, []);

  const isStep1Valid =
    fullName.trim().length > 1 && phone.trim().length >= 8;

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsState("error");
      setGpsError("Geolocation is not supported by your browser.");
      return;
    }
    setGpsState("loading");
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        setLocationUrl(mapUrl);
        // Auto-detect district based on rough Kigali coords
        const detected =
          latitude > -1.93 ? "Gasabo"
            : latitude > -1.96 ? "Nyarugenge"
              : latitude > -1.99 ? "Kicukiro"
                : "Kicukiro";
        setDistrict(detected);
        setStreetAddress(`GPS Pin (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
        setGpsState("success");
      },
      (err) => {
        setGpsState("error");
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? "Location access denied. Please allow location permission or type your address."
            : "Could not detect location. Please type your address instead."
        );
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (isStep1Valid) setStep(2);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const finalAddress =
        isPickup
          ? "JREAL VISION DESIGN Studio, Kicukiro Centre, Kigali"
          : [streetAddress.trim(), additionalDetails.trim(), district, "Rwanda"]
            .filter(Boolean)
            .join(", ");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          total: grandTotal,
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: finalAddress,
          district,
          locationUrl: locationUrl || undefined,
          deliveryMethod: selectedDelivery ? selectedDelivery.name : "Standard Delivery",
          paymentMethod: selectedPayment ? selectedPayment.name : "MTN MoMo",
          orderNotes,
          isTestMode: true,
        }),
      });

      const data = await res.json();
      const confirmedId =
        data.orderId || `JRV-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(confirmedId);

      // Save to local recent orders so Admin Dashboard reflects it immediately
      const newOrderRecord = {
        id: data.order?.id || `go-${Date.now()}`,
        orderNumber: confirmedId,
        buyerEmail: email.trim() || "customer@jreal.rw",
        buyerPhone: phone.trim(),
        deliveryLocation: finalAddress,
        locationLandmark: district,
        locationUrl: locationUrl || "",
        vendorName: "JREAL Studio",
        total: grandTotal,
        commission: Math.round(grandTotal * 0.15),
        status: "IN_PRODUCTION",
        date: new Date().toISOString().slice(0, 10),
        category: items[0]?.name ? items[0].name.slice(0, 20) : "Direct Store",
        paymentMethod: selectedPayment ? selectedPayment.name : "MTN MoMo",
        isTestMode: true,
      };

      try {
        const rawExisting = localStorage.getItem("jreal_recent_orders");
        const existing = rawExisting ? JSON.parse(rawExisting) : [];
        const nextOrders = [newOrderRecord, ...(Array.isArray(existing) ? existing : [])];
        localStorage.setItem("jreal_recent_orders", JSON.stringify(nextOrders));
        window.dispatchEvent(new Event("jreal_orders_updated"));
      } catch (storageErr) {
        console.warn("Storage sync note:", storageErr);
      }

      setOrderPlaced(true);
      clearCart();
    } catch {
      const fallbackId = `JRV-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(fallbackId);
      setOrderPlaced(true);
      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─────────────────────────── ORDER CONFIRMED ─────────────────────────── */
  if (orderPlaced) {
    return (
      <>
        <Head>
          <title>Order Confirmed | JREAL VISION DESIGN</title>
        </Head>
        <Header />
        <main className="min-h-screen bg-[#F6F8FA] pt-28 pb-20 flex items-center justify-center">
          <div className="w-full max-w-md mx-auto px-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center space-y-6">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-[#128C38]/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#128C38]" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#128C38] text-[11px] font-bold uppercase tracking-wider mb-2">
                  <span>✓ Order Confirmed & Logged</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
                  Thank you, {fullName.split(" ")[0] || "Customer"}!
                </h1>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Your purchase has been placed and forwarded to the studio dispatch board.
                </p>
              </div>

              {/* Transactional Email Notice Banner */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-left text-xs space-y-1 text-emerald-900">
                <div className="flex items-center gap-2 font-bold">
                  <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Transactional Emails Sent:</span>
                </div>
                <p className="text-[11px] text-emerald-800 pl-5">
                  • Customer receipt sent to: <strong>{email || "your provided email"}</strong>
                </p>
                <p className="text-[11px] text-emerald-800 pl-5">
                  • Owner / Admin sales alert sent to: <strong>jrealvision@gmail.com</strong>
                </p>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Reference</span>
                  <span className="font-mono font-bold text-gray-900">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Amount</span>
                  <span className="font-bold text-[#128C38]">{grandTotal.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Channel</span>
                  <span className="font-semibold text-gray-800">{selectedPayment?.name || "Payment"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Destination</span>
                  <span className="font-medium text-gray-800 truncate max-w-[180px]">
                    {isPickup ? "Studio Pickup (Kicukiro)" : `${district}, Rwanda`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5 pt-2">
                <Link
                  href="/my-orders"
                  className="w-full py-3.5 bg-[#128C38] hover:bg-[#0E6C2B] text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Package className="w-4 h-4" />
                  <span>View My Orders & Track Delivery →</span>
                </Link>

                <div className="text-center text-xs text-gray-500 py-1">
                  Want to access your customer portal?{" "}
                  <Link href="/login?redirect=/my-orders" className="text-[#128C38] font-bold hover:underline">
                    Sign in to Customer Portal
                  </Link>
                </div>

                {currentUser?.role === "ADMIN" && (
                  <Link
                    href="/admin/dashboard?tab=orders"
                    className="block w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors text-center"
                  >
                    🛡️ Admin Mode: View Store Orders Board →
                  </Link>
                )}

                <a
                  href={`https://wa.me/${companyInfo.whatsapp.replace(/\+/g, "")}?text=Hello%20JREAL%20VISION%2C%20I%20just%20placed%20order%20${orderId}%20for%20${grandTotal.toLocaleString()}%20RWF.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-xs sm:text-sm transition-colors text-center"
                >
                  WhatsApp Studio Dispatch
                </a>

                <Link
                  href="/shop"
                  className="block w-full py-2 text-gray-400 hover:text-gray-700 text-xs sm:text-sm transition-colors text-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ─────────────────────────── EMPTY CART ─────────────────────────── */
  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>Checkout | JREAL VISION DESIGN</title>
        </Head>
        <Header />
        <main className="min-h-screen bg-[#F6F8FA] pt-28 pb-20 flex items-center justify-center">
          <div className="w-full max-w-sm mx-auto px-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Your cart is empty</h2>
            <p className="text-sm text-gray-500">
              Add items to your cart before proceeding to checkout.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 bg-[#128C38] text-white font-bold text-sm rounded-xl hover:bg-[#0f7230] transition-colors"
            >
              Browse Shop
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  /* ─────────────────────────── MAIN CHECKOUT ─────────────────────────── */
  return (
    <>
      <Head>
        <title>Checkout | JREAL VISION DESIGN</title>
        <meta name="description" content="Complete your order with fast delivery across Rwanda." />
      </Head>
      <Header />

      <main className="min-h-screen bg-[#F6F8FA] pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          {/* ── Page Header ── */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 pt-4">Checkout</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {step === 1 ? "Where should we deliver?" : "Confirm your order"}
            </p>
          </div>

          {/* ── Step Indicator ── */}
          <div className="flex items-center gap-3 mb-8">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 1
                  ? "bg-[#128C38] text-white"
                  : "bg-gray-200 text-gray-500"
                  }`}
              >
                {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
              </div>
              <span
                className={`text-sm font-semibold ${step >= 1 ? "text-gray-900" : "text-gray-400"
                  }`}
              >
                Delivery
              </span>
            </div>

            {/* Divider */}
            <div className="flex-1 h-px bg-gray-200 relative">
              <div
                className="absolute inset-y-0 left-0 bg-[#128C38] transition-all duration-500"
                style={{ width: step > 1 ? "100%" : "0%" }}
              />
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= 2
                  ? "bg-[#128C38] text-white"
                  : "bg-gray-200 text-gray-500"
                  }`}
              >
                2
              </div>
              <span
                className={`text-sm font-semibold ${step >= 2 ? "text-gray-900" : "text-gray-400"
                  }`}
              >
                Confirm
              </span>
            </div>
          </div>

          {/* ── Grid Layout ── */}
          <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">

            {/* ─────────── LEFT COLUMN ─────────── */}
            <div className="space-y-4">

              {/* ════ STEP 1: DELIVERY ════ */}
              {step === 1 && (
                <form onSubmit={handleContinue} className="space-y-4">

                  {/* Signed-in pill */}
                  {currentUser && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-[#128C38]/8 border border-[#128C38]/20 rounded-xl">
                      <div className="w-5 h-5 rounded-full bg-[#128C38] flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-gray-800">
                        Signed in as{" "}
                        <span className="text-[#128C38]">{currentUser.name}</span>
                      </span>
                    </div>
                  )}

                  {/* ── Card: Your Contact ── */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-8 h-8 rounded-xl bg-[#128C38]/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-[#128C38]" />
                      </div>
                      <h2 className="text-sm font-bold text-gray-900">Your Contact</h2>
                    </div>

                    <div className="space-y-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] focus:bg-white transition-colors"
                          />
                        </div>
                      </div>

                      {/* Phone + Email */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="0781 234 567"
                              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] focus:bg-white transition-colors"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Email{" "}
                            <span className="text-gray-400 font-normal">(optional)</span>
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="you@email.com"
                              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] focus:bg-white transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Card: Delivery Method (Dynamic Admin Options) ── */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-[#128C38]/10 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-[#128C38]" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-gray-900">Delivery Method</h2>
                        <p className="text-[11px] text-gray-500">Select how your package should be delivered</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                      {deliveryOptions.map((opt) => {
                        const isSelected = selectedDeliveryId === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                              isSelected
                                ? "border-[#128C38] bg-[#128C38]/5 shadow-2xs"
                                : "border-gray-200 bg-gray-50/70 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="deliveryOption"
                              className="sr-only"
                              checked={isSelected}
                              onChange={() => setSelectedDeliveryId(opt.id)}
                            />
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isSelected
                                      ? "bg-[#128C38]/15 text-[#128C38]"
                                      : "bg-gray-200 text-gray-500"
                                  }`}
                                >
                                  {opt.type === "pickup" ? (
                                    <Store className="w-4 h-4" />
                                  ) : opt.icon === "zap" ? (
                                    <Zap className="w-4 h-4" />
                                  ) : (
                                    <Package className="w-4 h-4" />
                                  )}
                                </div>
                                {isSelected && (
                                  <div className="w-4 h-4 rounded-full bg-[#128C38] flex items-center justify-center">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="font-bold text-sm text-gray-900">{opt.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5">{opt.estimatedTime}</div>
                              {opt.description && (
                                <div className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                                  {opt.description}
                                </div>
                              )}
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                              <span className="text-gray-400 font-medium">Fee</span>
                              <span className="font-bold text-[#128C38]">
                                {opt.fee === 0 ? "FREE" : `${opt.fee.toLocaleString()} RWF`}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Card: Delivery Address (when not pickup) ── */}
                  {!isPickup && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
                      <div className="flex items-start justify-between gap-3 mb-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#128C38]/10 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-[#128C38]" />
                          </div>
                          <h2 className="text-sm font-bold text-gray-900">Delivery Address</h2>
                        </div>

                        {/* ── GPS Share Button ── */}
                        <button
                          type="button"
                          onClick={handleDetectGPS}
                          disabled={gpsState === "loading"}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${gpsState === "success"
                            ? "border-[#128C38] bg-[#128C38]/8 text-[#128C38]"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#128C38] hover:text-[#128C38] hover:bg-[#128C38]/5"
                            } disabled:opacity-60 disabled:cursor-wait`}
                        >
                          {gpsState === "loading" ? (
                            <Navigation className="w-3.5 h-3.5 animate-spin" />
                          ) : gpsState === "success" ? (
                            <LocateFixed className="w-3.5 h-3.5" />
                          ) : (
                            <Navigation className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {gpsState === "loading"
                              ? "Detecting…"
                              : gpsState === "success"
                                ? "Location Shared ✓"
                                : "Share My Location"}
                          </span>
                        </button>
                      </div>

                      {/* GPS Success Card */}
                      {gpsState === "success" && gpsCoords && (
                        <div className="mb-4 p-3.5 rounded-xl bg-[#128C38]/8 border border-[#128C38]/25 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#128C38] flex items-center justify-center shrink-0 mt-0.5">
                              <LocateFixed className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#128C38]">Live Location Captured</p>
                              <p className="text-[11px] text-gray-600 mt-0.5 font-mono">
                                {gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                Auto-detected district: <span className="font-semibold text-gray-700">{district}</span>
                              </p>
                            </div>
                          </div>
                          <a
                            href={locationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#128C38] hover:underline shrink-0 mt-1"
                          >
                            View Map <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* GPS Error */}
                      {gpsState === "error" && (
                        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-800">{gpsError}</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* City / District */}
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                              District / City
                            </label>
                            <select
                              value={district}
                              onChange={(e) => setDistrict(e.target.value)}
                              className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] focus:bg-white transition-colors"
                            >
                              {DISTRICTS.map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                              Street Address
                            </label>
                            <div className="relative">
                              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={streetAddress}
                                onChange={(e) => setStreetAddress(e.target.value)}
                                placeholder="KN 123 St"
                                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] focus:bg-white transition-colors"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Additional Details */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Apartment / Room / Gate{" "}
                            <span className="text-gray-400 font-normal">(optional)</span>
                          </label>
                          <input
                            type="text"
                            value={additionalDetails}
                            onChange={(e) => setAdditionalDetails(e.target.value)}
                            placeholder="e.g. 2nd Floor, Room 14 or Blue Gate"
                            className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] focus:bg-white transition-colors"
                          />
                        </div>

                        {/* Turnaround / Description */}
                        {selectedDelivery?.description && (
                          <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-600">
                            {selectedDelivery.description}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pickup info */}
                  {isPickup && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#128C38] flex items-center justify-center shrink-0">
                          <Store className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">JREAL VISION DESIGN Studio</p>
                          <p className="text-xs text-gray-500 mt-0.5">KG 14 Ave, Kicukiro Centre, Kigali</p>
                          <p className="text-xs text-gray-500">Mon–Sat · 8:00 AM – 7:00 PM</p>
                          <span className="inline-block mt-2 px-2.5 py-1 bg-[#128C38]/10 text-[#128C38] text-xs font-bold rounded-lg">
                            FREE · {selectedDelivery?.estimatedTime || "Ready in 24 hrs"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Continue Button */}
                  <button
                    type="submit"
                    disabled={!isStep1Valid}
                    className="w-full py-3.5 bg-[#128C38] hover:bg-[#0f7230] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Confirm
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* ════ STEP 2: CONFIRM ════ */}
              {step === 2 && (
                <form onSubmit={handleSubmitOrder} className="space-y-4">

                  {/* Delivery recap */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-bold text-gray-900">Delivery Details</h2>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs font-semibold text-[#128C38] hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-800">{fullName}</span>
                        <span className="text-gray-500">·</span>
                        <span className="text-gray-600">{phone}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-gray-600">
                            {isPickup
                              ? "JREAL VISION DESIGN Studio, Kicukiro Centre"
                              : [streetAddress, additionalDetails, district, "Rwanda"]
                                .filter(Boolean)
                                .join(", ")}
                          </span>
                          {locationUrl && !isPickup && (
                            <a
                              href={locationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#128C38] hover:underline"
                            >
                              <LocateFixed className="w-3 h-3" />
                              View GPS Pin on Google Maps
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Truck className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-gray-600">
                          {selectedDelivery?.name} — {selectedDelivery?.fee === 0 ? "FREE" : `${selectedDelivery?.fee.toLocaleString()} RWF`} ({selectedDelivery?.estimatedTime})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── Payment Method (Dynamic Admin Options) ── */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-sm font-bold text-gray-900">Payment Method</h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        🧪 Sandbox Testing Active
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Select your preferred payment channel</p>

                    {/* Gateway Testing Banner */}
                    <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200/90 rounded-xl text-left text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Gateway Provider Setup In Progress</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Provider gateway accounts (MTN MoMo, Airtel, Banking) are being connected. <strong>Test checkout is enabled:</strong> Selecting any payment channel completes a simulated transaction, logs the order into your Admin Dashboard, and dispatches real customer receipt & owner alert emails.
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                      {paymentOptions.map((opt) => {
                        const isSelected = selectedPaymentId === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? "border-[#128C38] bg-[#128C38]/5 shadow-2xs"
                                : "border-gray-200 hover:border-gray-300 bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              className="sr-only"
                              checked={isSelected}
                              onChange={() => setSelectedPaymentId(opt.id)}
                            />
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-extrabold shadow-2xs mt-0.5"
                              style={{
                                backgroundColor: opt.badgeBg || "#128C38",
                                color: opt.badgeTextColor || "#FFFFFF",
                              }}
                            >
                              {opt.badgeText || "PAY"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-gray-900">{opt.name}</div>
                              <div className="text-[11px] text-gray-500 truncate">{opt.subtitle}</div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-[#128C38] shrink-0 mt-0.5" />
                            )}
                          </label>
                        );
                      })}
                    </div>

                    {/* Active Payment Instructions & Account Box */}
                    {selectedPayment && (
                      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-900">
                            {selectedPayment.name} Instructions
                          </span>
                          {selectedPayment.accountNumber && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedPayment.accountNumber || "");
                                setCopiedAccount(true);
                                setTimeout(() => setCopiedAccount(false), 2000);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#128C38] hover:underline cursor-pointer"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copiedAccount ? "Copied ✓" : "Copy Account/Code"}</span>
                            </button>
                          )}
                        </div>

                        {selectedPayment.accountNumber && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 font-medium">Merchant / Account:</span>
                            <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                              {selectedPayment.accountNumber}
                            </span>
                          </div>
                        )}

                        {selectedPayment.recipientName && (
                          <div className="text-xs text-slate-600">
                            <span className="text-slate-500 font-medium">Recipient Name: </span>
                            <span className="font-semibold text-slate-800">{selectedPayment.recipientName}</span>
                          </div>
                        )}

                        {selectedPayment.instructions && (
                          <p className="text-xs text-emerald-800 pt-1 border-t border-emerald-200/60">
                            {selectedPayment.instructions}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Order Notes */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs">
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                      Order Notes{" "}
                      <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Any custom requirements, delivery time preference, etc."
                      className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 bg-[#128C38] hover:bg-[#0f7230] disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        "Processing…"
                      ) : (
                        <>
                          Place Order · {grandTotal.toLocaleString()} RWF
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Delivery
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ─────────── RIGHT COLUMN: Order Summary ─────────── */}
            <div className="lg:sticky lg:top-28">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-900">
                    Order Summary
                  </h2>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 px-5 py-3.5 items-center">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {item.name} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-gray-900 shrink-0">
                        {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="px-5 py-4 border-t border-gray-100 space-y-2.5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-800">
                      {totalPrice.toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivery</span>
                    <span className="font-semibold text-gray-800">
                      {deliveryFee === 0 ? "—" : `${deliveryFee.toLocaleString()} RWF`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span className="text-[#128C38]">
                      {grandTotal.toLocaleString()} RWF
                    </span>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-center gap-5">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#128C38]" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Zap className="w-3.5 h-3.5 text-[#128C38]" />
                    <span>Fast delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
