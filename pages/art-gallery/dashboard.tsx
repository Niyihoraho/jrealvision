"use client";

import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import RoleGuard from "@/app/components/RoleGuard";
import ConfirmModal from "@/app/components/ConfirmModal";
import {
  initialArtworks,
  initialArtists,
  initialEscrowOrders,
  type Artwork,
  type EscrowOrder,
} from "@/lib/galleryData";
import {
  isArtistApprovedByEmail,
  getArtistApplicationByEmail,
} from "@/lib/artistApplications";
import {
  Palette,
  ShieldCheck,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  TrendingUp,
  CreditCard,
  MapPin,
  Eye,
  LogOut,
  X,
  Share2,
  Copy,
  DollarSign,
  AlertCircle,
  Sparkles,
} from "lucide-react";

// Presets for quick artwork upload
const ARTWORK_IMAGE_PRESETS = [
  { label: "Imigongo Modern Fusion", url: "/image/gallery/imigongo-fusion.jpg" },
  { label: "Thousand Hills Landscape", url: "/image/gallery/thousand-hills.jpg" },
  { label: "Kigali Urban Rhythm", url: "/image/gallery/kigali-rhythm.jpg" },
  { label: "Mountain Gorilla Study", url: "/image/gallery/mountain-gorilla.jpg" },
  { label: "African Woman Portrait", url: "/image/gallery/african-woman-portrait.jpg" },
];

const ART_MEDIUM_OPTIONS = [
  "Oil on Canvas",
  "Acrylic on Canvas",
  "Imigongo Modern Fusion",
  "Mixed Media on Textured Linen",
  "Banana Fiber & Wood Relief",
  "Charcoal & Ink on Archival Paper",
  "Traditional Pigment on Wood",
];

const ART_FRAMING_OPTIONS: Artwork["framing"][] = [
  "Framed (Solid Wood)",
  "Framed (Floating Frame)",
  "Stretched Canvas",
  "Gallery Wrapped",
  "Unframed",
];

const ART_CITY_OPTIONS = ["Kigali", "Musanze", "Huye", "Rubavu", "Gisenyi"];

export default function ArtGalleryDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored =
          sessionStorage.getItem("jreal_auth_user") ||
          localStorage.getItem("jreal_auth_user");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"collection" | "escrow" | "payouts" | "profile">("collection");

  // Artworks state (loaded from Supabase /api/artworks)
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);
  const [artSearch, setArtSearch] = useState("");
  const [artMediumFilter, setArtMediumFilter] = useState("All");
  const [artStatusFilter, setArtStatusFilter] = useState("All");

  // Escrow orders state
  const [orders, setOrders] = useState<EscrowOrder[]>(initialEscrowOrders);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Modal State for Add / Edit Artwork
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // In-app Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [form, setForm] = useState<{
    title: string;
    artistName: string;
    artistCity: string;
    medium: string;
    dimensions: string;
    framing: Artwork["framing"];
    price: number;
    year: string;
    weight: string;
    certificateOfAuthenticity: boolean;
    image: string;
    description: string;
    status: "Published" | "Draft" | "Sold";
  }>({
    title: "",
    artistName: "Jean Luc Habimana",
    artistCity: "Kigali",
    medium: "Acrylic on Canvas",
    dimensions: "100 × 80 cm",
    framing: "Framed (Solid Wood)",
    price: 320000,
    year: "2026",
    weight: "4.0 kg",
    certificateOfAuthenticity: true,
    image: "/image/gallery/imigongo-fusion.jpg",
    description: "",
    status: "Published",
  });

  // Payout info
  const [payoutMethod, setPayoutMethod] = useState<"MTN MoMo" | "Airtel Money" | "Bank Account">("MTN MoMo");
  const [payoutNumber, setPayoutNumber] = useState("+250 788 123 456");
  const [payoutName, setPayoutName] = useState("JEAN LUC HABIMANA");
  const [payoutSaved, setPayoutSaved] = useState(false);

  // Authenticate & Load dynamic data from Supabase
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (d?.user) {
          setUser(d.user);
          if (d.user.name) {
            setForm((prev) => ({ ...prev, artistName: d.user.name }));
            setPayoutName(d.user.name.toUpperCase());
          }
        }
      })
      .catch(() => {
        setUser({
          id: "artist-demo",
          name: "Jean Luc Habimana",
          email: "artist.demo@jreal.rw",
          role: "ARTIST",
        });
      })
      .finally(() => setLoading(false));

    // Load artworks from Supabase API
    fetch("/api/artworks")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.artworks && Array.isArray(data.artworks) && data.artworks.length > 0) {
          setArtworks(data.artworks);
        }
      })
      .catch((err) => console.warn("Failed to load gallery artworks:", err));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/me", { method: "POST" }).catch(() => {});
    router.push("/art-gallery/login");
  };

  // ─── CRUD Actions: Add / Edit / Delete ────────────────────────────────────────

  const openAddModal = () => {
    setEditingId(null);
    setModalError(null);
    setForm({
      title: "",
      artistName: user?.name || "Jean Luc Habimana",
      artistCity: "Kigali",
      medium: "Acrylic on Canvas",
      dimensions: "100 × 80 cm",
      framing: "Framed (Solid Wood)",
      price: 300000,
      year: "2026",
      weight: "3.8 kg",
      certificateOfAuthenticity: true,
      image: "/image/gallery/imigongo-fusion.jpg",
      description: "",
      status: "Published",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Artwork) => {
    setEditingId(item.id);
    setModalError(null);
    setForm({
      title: item.title,
      artistName: item.artistName,
      artistCity: item.artistCity,
      medium: item.medium,
      dimensions: item.dimensions,
      framing: item.framing,
      price: item.price,
      year: item.year,
      weight: item.weight || "3.8 kg",
      certificateOfAuthenticity: item.certificateOfAuthenticity,
      image: item.images.front,
      description: item.description,
      status: item.status === "Pending Review" ? "Published" : item.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.price) {
      setModalError("Please provide artwork title and price.");
      return;
    }

    const priceNum = Number(form.price);

    if (editingId) {
      setArtworks((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? {
                ...a,
                title: form.title,
                artistName: form.artistName,
                artistCity: form.artistCity,
                medium: form.medium,
                dimensions: form.dimensions,
                framing: form.framing,
                price: priceNum,
                year: form.year,
                weight: form.weight,
                certificateOfAuthenticity: form.certificateOfAuthenticity,
                images: { front: form.image, detail: form.image, inRoom: form.image },
                description: form.description,
                status: form.status,
              }
            : a
        )
      );

      // Persist update in Supabase
      fetch("/api/artworks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title: form.title,
          artistName: form.artistName,
          artistCity: form.artistCity,
          medium: form.medium,
          dimensions: form.dimensions,
          framing: form.framing,
          price: priceNum,
          year: form.year,
          weight: form.weight,
          certificateOfAuthenticity: form.certificateOfAuthenticity,
          image: form.image,
          description: form.description,
          status: form.status,
        }),
      }).catch((err) => console.warn("Update artwork DB warning:", err));
    } else {
      const tempId = `art-${Date.now()}`;
      const newArt: Artwork = {
        id: tempId,
        title: form.title,
        artistId: "artist-jreal",
        artistName: form.artistName,
        artistCity: form.artistCity,
        artistAvatar: "/image/photography/wedding.jpg",
        artistBio: "Contemporary artist represented on JREAL Fine Art Marketplace.",
        artistPhone: "+250 788 123 456",
        artistVerified: true,
        description: form.description,
        medium: form.medium,
        dimensions: form.dimensions,
        framing: form.framing,
        price: priceNum,
        images: { front: form.image, detail: form.image, inRoom: form.image },
        status: form.status,
        year: form.year,
        certificateOfAuthenticity: form.certificateOfAuthenticity,
        featured: false,
        views: 1,
        likes: 0,
        weight: form.weight,
        curatorNotes: "Verified original artwork backed by platform escrow.",
      };

      setArtworks((prev) => [newArt, ...prev]);

      // Persist creation in Supabase
      fetch("/api/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          artistName: form.artistName,
          artistCity: form.artistCity,
          medium: form.medium,
          dimensions: form.dimensions,
          framing: form.framing,
          price: priceNum,
          year: form.year,
          weight: form.weight,
          certificateOfAuthenticity: form.certificateOfAuthenticity,
          image: form.image,
          description: form.description,
          status: form.status,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.artwork) {
            setArtworks((prev) =>
              prev.map((a) => (a.id === tempId ? { ...a, id: data.artwork.id } : a))
            );
          }
        })
        .catch((err) => console.warn("Create artwork DB warning:", err));
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleDeleteArtwork = (id: string, title?: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Artwork from Gallery",
      message: `Are you sure you want to permanently delete "${title || "this artwork"}"? This will remove it from both your studio portfolio and the public gallery marketplace.`,
      confirmLabel: "Delete Artwork",
      variant: "danger",
      onConfirm: () => {
        setArtworks((prev) => prev.filter((a) => a.id !== id));
        fetch(`/api/artworks?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch((err) =>
          console.warn("Delete artwork DB warning:", err)
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleToggleStatus = (id: string) => {
    const item = artworks.find((a) => a.id === id);
    const newStatus = item?.status === "Published" ? "Draft" : "Published";
    setArtworks((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    fetch("/api/artworks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    }).catch((err) => console.warn("Toggle status error:", err));
  };

  // ─── Escrow & Orders Actions ────────────────────────────────────────────────

  const advanceEscrowStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        if (o.status === "Payment Lock (Escrow)") return { ...o, status: "Ready for Pickup" };
        if (o.status === "Ready for Pickup")
          return {
            ...o,
            status: "Shipped / In Transit",
            courierName: "Kigali Express Couriers",
            trackingNumber: "KGL-EXP-8891",
          };
        if (o.status === "Shipped / In Transit") return { ...o, status: "Delivery Confirmed" };
        if (o.status === "Delivery Confirmed") return { ...o, status: "Dispute Window (48h)", inspectionHoursLeft: 48 };
        if (o.status === "Dispute Window (48h)") return { ...o, status: "Settled & Disbursed", payoutStatus: "disbursed" };
        return o;
      })
    );
  };

  const copyOrderLocation = (o: EscrowOrder) => {
    const text = `${o.buyerName} (${o.buyerPhone})\nAddress: ${o.buyerAddress}, ${o.buyerCity}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedOrderId(o.id);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  const shareOrderWhatsApp = (o: EscrowOrder) => {
    const msg = `*JREAL FINE ART DISPATCH — Order #${o.id}*\nArtwork: ${o.artworkTitle}\nBuyer: ${o.buyerName} (${o.buyerPhone})\nDelivery: ${o.buyerAddress}, ${o.buyerCity}\nStatus: ${o.status}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  // ─── Financial Calculations ─────────────────────────────────────────────────

  const totalGrossSales = orders.reduce((sum, o) => sum + o.grossAmount, 0);
  const totalNetEarnings = orders.reduce((sum, o) => sum + o.artistNetPayout, 0);
  const pendingEscrow = orders
    .filter((o) => o.status !== "Settled & Disbursed")
    .reduce((sum, o) => sum + o.artistNetPayout, 0);

  // Live calculation for modal price breakdown
  const formGross = Number(form.price) || 0;
  const formCommission = Math.round(formGross * 0.15);
  const formTax = Math.round(formGross * 0.15);
  const formNet = formGross - (formCommission + formTax);

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-mono uppercase tracking-widest text-gray-500">
        Loading gallery portal…
      </div>
    );
  }

  const isApproved =
    user?.role === "ARTIST" ||
    user?.role === "ADMIN" ||
    isArtistApprovedByEmail(user?.email) ||
    (typeof window !== "undefined" && localStorage.getItem("jreal_auth_role") === "ARTIST");
  const userApplication = getArtistApplicationByEmail(user?.email);

  return (
    <RoleGuard allowedRoles={["ARTIST", "ADMIN"]} loginRedirect="/art-gallery/login" portalName="Studio Portal">
      {!isApproved ? (
        <>
          <Head>
            <title>Application Under Curatorial Review | JREAL Curated Fine Art</title>
          </Head>
          <Header />
          <main className="min-h-screen bg-[#FAFAFA] pt-32 pb-24 text-slate-900">
            <div className="max-w-2xl mx-auto px-4 sm:px-6">
              <div className="bg-white border border-slate-300 rounded-lg p-8 sm:p-10 shadow-xs space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <div>
                    <h1 className="text-xl font-serif font-medium text-slate-900">
                      Application Under Curatorial Review
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Artist Studio Portal Locked Pending Administrative Approval
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded p-5 text-sm text-slate-700 space-y-2">
                  <p className="font-semibold text-slate-900">
                    Welcome, {user?.name || "Artist"}.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Your artist representation submission is currently awaiting evaluation by the JREAL curatorial board.
                    To ensure the integrity of our fine art collection, uploading artworks and accessing payout tools requires administrator approval.
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Applicant Account: <strong className="text-slate-900 font-mono">{user?.email}</strong>
                  </p>
                </div>

                {userApplication && (
                  <div className="border border-slate-200 rounded p-4 text-xs text-slate-600 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Submitted Application Details
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Medium</span>
                        <span className="font-medium text-slate-800">{userApplication.medium}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Studio Location</span>
                        <span className="font-medium text-slate-800">{userApplication.city}, Rwanda</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-100 pt-5 space-y-2 text-xs text-slate-600">
                  <h3 className="font-semibold text-slate-900 uppercase text-[11px] tracking-wide">
                    What happens next?
                  </h3>
                  <p className="leading-relaxed">
                    Our administrators review submitted portfolios in our dashboard. Once approved, you will receive an approval email notification, and this portal will unlock immediately.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-3">
                  <Link
                    href="/gallery"
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded text-center transition-colors"
                  >
                    Explore Public Fine Art Gallery
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded text-center transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </>
      ) : (
        <>
          <Head>
            <title>Art Gallery Studio Portal | JREAL VISION DESIGN</title>
            <meta name="description" content="Manage curated Rwandan fine art, original paintings, and collector escrow orders." />
          </Head>

          <Header />

          <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* ── Top Header Banner ── */}
              <div className="bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 mb-7 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="p-1 rounded bg-amber-50 text-amber-700 border border-amber-200/60 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Curated Gallery Studio</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#128C38]" />
                    <span>Verified Rwandan Artist</span>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                  {user?.name || "Jean Luc Habimana Studio"}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
                  Original Rwandan paintings, Imigongo heritage geometry, and escrow-protected collector acquisitions.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  href="/gallery"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
                >
                  <span>View Public Gallery</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                </Link>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Original Art</span>
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="p-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex gap-2 mt-6 pt-5 border-t border-gray-100 overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: "collection", label: `Art Collection (${artworks.length})`, icon: Palette },
                { key: "escrow", label: `Escrow Orders (${orders.length})`, icon: ShieldCheck },
                { key: "payouts", label: "Mobile Money Payouts", icon: CreditCard },
                { key: "profile", label: "Studio & COA Seal", icon: Sparkles },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key as any)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap inline-flex items-center gap-2 cursor-pointer ${
                    tab === key
                      ? "bg-[#128C38] text-white shadow-xs"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── 4 Executive Metric Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
              <span className="text-xs font-medium text-gray-500 block mb-1">Total Curations</span>
              <span className="text-2xl font-bold text-gray-900 block">{artworks.length} pieces</span>
            </div>
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
              <span className="text-xs font-medium text-gray-500 block mb-1">Published in Gallery</span>
              <span className="text-2xl font-bold text-[#128C38] block">
                {artworks.filter((a) => a.status === "Published").length} active
              </span>
            </div>
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
              <span className="text-xs font-medium text-gray-500 block mb-1">Gross Art Sales</span>
              <span className="text-2xl font-bold text-gray-900 block tabular-nums">
                {totalGrossSales.toLocaleString()} <span className="text-xs font-semibold text-gray-500">RWF</span>
              </span>
            </div>
            <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
              <span className="text-xs font-medium text-gray-500 block mb-1">Net Artist Payouts (70%)</span>
              <span className="text-2xl font-bold text-blue-600 block tabular-nums">
                {totalNetEarnings.toLocaleString()} <span className="text-xs font-semibold text-gray-500">RWF</span>
              </span>
            </div>
          </div>

          {/* ═════════════════════════════════════════════════════════════════════
              TAB 1: ART COLLECTION (CATALOG)
             ═════════════════════════════════════════════════════════════════════ */}
          {tab === "collection" && (
            <div className="space-y-6">
              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 border border-gray-200/90 rounded-2xl shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by title, medium, dimensions…"
                    value={artSearch}
                    onChange={(e) => setArtSearch(e.target.value)}
                    className="w-full border border-gray-200 text-xs pl-9 pr-3 py-2 rounded-xl bg-gray-50/60 text-gray-900 focus:outline-none focus:border-[#128C38] focus:bg-white transition-all"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {["All", "Published", "Draft", "Sold"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setArtStatusFilter(status)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                        artStatusFilter === status
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Artworks Table */}
              <div className="border border-gray-200/90 rounded-2xl bg-white overflow-hidden shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[850px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                      <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-gray-500 text-[11px]">
                        Original Artwork
                      </th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-gray-500 text-[11px]">
                        Medium & Dimensions
                      </th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-gray-500 text-[11px]">
                        Framing
                      </th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-gray-500 text-[11px] text-right">
                        Price (Gross)
                      </th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-gray-500 text-[11px] text-right">
                        Net Payout (70%)
                      </th>
                      <th className="px-4 py-3.5 font-bold uppercase tracking-wider text-gray-500 text-[11px]">
                        Status
                      </th>
                      <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-gray-500 text-[11px] text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {artworks
                      .filter((a) => {
                        const matchStatus = artStatusFilter === "All" || a.status === artStatusFilter;
                        const q = artSearch.toLowerCase().trim();
                        const matchSearch =
                          !q ||
                          a.title.toLowerCase().includes(q) ||
                          a.medium.toLowerCase().includes(q) ||
                          a.artistCity.toLowerCase().includes(q);
                        return matchStatus && matchSearch;
                      })
                      .map((art) => {
                        const net = Math.round(art.price * 0.7);
                        return (
                          <tr key={art.id} className="hover:bg-gray-50/70 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3.5">
                                <img
                                  src={art.images.front}
                                  alt={art.title}
                                  className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0 bg-gray-100 shadow-2xs"
                                />
                                <div>
                                  <Link
                                    href={`/gallery/${art.id}`}
                                    target="_blank"
                                    className="font-bold text-gray-900 text-sm hover:text-[#128C38] transition-colors block"
                                  >
                                    {art.title}
                                  </Link>
                                  <span className="text-[11px] text-gray-500 block">
                                    {art.artistName} • {art.artistCity} ({art.year})
                                  </span>
                                  {art.certificateOfAuthenticity && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded mt-0.5 border border-amber-200/60">
                                      ★ COA Certified
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-gray-700">
                              <span className="font-semibold block text-gray-900">{art.medium}</span>
                              <span className="text-gray-400 text-[11px]">{art.dimensions}</span>
                            </td>
                            <td className="px-4 py-4 text-gray-600 font-medium">
                              {art.framing}
                            </td>
                            <td className="px-4 py-4 text-right font-bold text-gray-900 tabular-nums">
                              {art.price.toLocaleString()} RWF
                            </td>
                            <td className="px-4 py-4 text-right font-bold text-blue-600 tabular-nums">
                              {net.toLocaleString()} RWF
                            </td>
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(art.id)}
                                className={`px-2.5 py-1 text-xs font-bold rounded-full border transition-colors cursor-pointer ${
                                  art.status === "Published"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : art.status === "Sold"
                                    ? "bg-gray-900 text-white border-gray-900"
                                    : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                                }`}
                              >
                                {art.status}
                              </button>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/gallery/${art.id}`}
                                  target="_blank"
                                  className="p-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-lg text-xs transition-colors"
                                  title="View on Gallery"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => openEditModal(art)}
                                  className="px-2.5 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteArtwork(art.id, art.title)}
                                  className="p-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                                  title="Delete Artwork"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              TAB 2: ESCROW ORDERS & DISPATCH
             ═════════════════════════════════════════════════════════════════════ */}
          {tab === "escrow" && (
            <div className="space-y-6">
              <div className="border border-gray-200/90 rounded-2xl bg-white overflow-hidden shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/80">
                      {["Order", "Artwork", "Collector (Buyer)", "Delivery Address", "Gross Price", "Net Payout (70%)", "Escrow Status", "Action"].map((h) => (
                        <th key={h} className="px-5 py-3.5 font-bold uppercase tracking-wider text-gray-500 text-[11px]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-gray-700 align-top">
                          #{o.id}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span className="font-bold text-gray-900 block text-sm">{o.artworkTitle}</span>
                          <span className="text-[11px] text-gray-400 block">{o.orderDate}</span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span className="font-semibold text-gray-900 block">{o.buyerName}</span>
                          <span className="text-gray-400 text-[11px] font-mono">{o.buyerPhone}</span>
                        </td>
                        <td className="px-5 py-4 align-top max-w-xs">
                          <p className="font-medium text-gray-800">{o.buyerAddress}, {o.buyerCity}</p>
                          <div className="flex items-center gap-1.5 pt-1.5">
                            <button
                              type="button"
                              onClick={() => copyOrderLocation(o)}
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-colors ${
                                copiedOrderId === o.id
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                  : "bg-white border-gray-200 hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              {copiedOrderId === o.id ? "Copied ✓" : "Copy"}
                            </button>
                            <button
                              type="button"
                              onClick={() => shareOrderWhatsApp(o)}
                              className="px-2 py-0.5 text-[11px] font-semibold rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
                            >
                              WhatsApp
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-bold text-gray-900 tabular-nums align-top">
                          {o.grossAmount.toLocaleString()} RWF
                        </td>
                        <td className="px-5 py-4 font-bold text-blue-600 tabular-nums align-top">
                          {o.artistNetPayout.toLocaleString()} RWF
                        </td>
                        <td className="px-5 py-4 align-top">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                              o.status === "Settled & Disbursed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : o.status === "Payment Lock (Escrow)"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top text-right">
                          <button
                            type="button"
                            onClick={() => advanceEscrowStatus(o.id)}
                            className="px-3 py-1.5 bg-gray-900 hover:bg-[#128C38] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                          >
                            Advance Status →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              TAB 3: MOBILE MONEY PAYOUTS
             ═════════════════════════════════════════════════════════════════════ */}
          {tab === "payouts" && (
            <div className="grid md:grid-cols-12 gap-7">
              {/* Payout Settings Card */}
              <div className="md:col-span-6 bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Mobile Money Payout Account</h3>
                <p className="text-xs text-gray-500 mb-6">
                  Disbursements are released automatically after the 48-hour buyer inspection window clears.
                </p>

                {payoutSaved && (
                  <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Payout settings successfully updated!</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Payout Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["MTN MoMo", "Airtel Money", "Bank Account"] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPayoutMethod(m)}
                          className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                            payoutMethod === m
                              ? "bg-amber-50 text-amber-900 border-amber-400 font-extrabold"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone / Account Number</label>
                    <input
                      type="text"
                      value={payoutNumber}
                      onChange={(e) => setPayoutNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-mono border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:border-[#128C38] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Registered Account Name</label>
                    <input
                      type="text"
                      value={payoutName}
                      onChange={(e) => setPayoutName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs uppercase font-mono border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:border-[#128C38] focus:bg-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPayoutSaved(true);
                      setTimeout(() => setPayoutSaved(false), 3000);
                    }}
                    className="w-full py-2.5 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Save Payout Details
                  </button>
                </div>
              </div>

              {/* Escrow Formula Explanation */}
              <div className="md:col-span-6 bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Escrow Payout Formula</h3>
                  <p className="text-xs text-gray-500 mb-5">
                    Transparent statutory formula applied to all original art sales:
                  </p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                      <span className="font-semibold text-gray-700">Gross Artwork Sale Price (P)</span>
                      <span className="font-bold text-gray-900">100%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                      <span className="font-semibold text-gray-700">Platform Commission (Marketing & Escrow)</span>
                      <span className="font-bold text-rose-600">- 15%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                      <span className="font-semibold text-gray-700">Rwanda Withholding Tax (RRA Statutory)</span>
                      <span className="font-bold text-rose-600">- 15%</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                      <span>Artist Net Disbursement (Direct to MoMo)</span>
                      <span className="text-sm font-extrabold text-[#128C38]">70% Net</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-400">
                  Funds held in secure escrow. Payout initiated immediately after buyer 48-hour delivery sign-off.
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════════════════
              TAB 4: STUDIO PROFILE & DIGITAL COA SEAL
             ═════════════════════════════════════════════════════════════════════ */}
          {tab === "profile" && (
            <div className="grid md:grid-cols-12 gap-7">
              {/* Studio Info Form */}
              <div className="md:col-span-7 bg-white border border-gray-200/90 rounded-2xl p-6 sm:p-7 shadow-xs">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Artist Studio Representation</h3>
                <p className="text-xs text-gray-500 mb-6">
                  Information displayed on your public gallery artist profile and artwork authenticity certificates.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Artist Full Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name || "Jean Luc Habimana"}
                      className="w-full px-3.5 py-2.5 text-xs font-medium border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:border-[#128C38] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Studio City</label>
                    <select
                      defaultValue="Kigali"
                      className="w-full px-3.5 py-2.5 text-xs font-medium border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:border-[#128C38] focus:bg-white cursor-pointer"
                    >
                      {ART_CITY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}, Rwanda</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Curatorial Statement</label>
                    <textarea
                      rows={4}
                      defaultValue="Contemporary Rwandan visual artist exploring indigenous geometric Imigongo heritage, rich mineral relief, and modern urban rhythm. Exhibited at Kigali Arts Festival."
                      className="w-full px-3.5 py-2.5 text-xs font-medium border border-gray-200 rounded-xl bg-gray-50/50 focus:outline-none focus:border-[#128C38] focus:bg-white leading-relaxed"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Digital Certificate of Authenticity (COA)</span>
                      <span className="text-[11px] text-amber-700">Automatically generated with cryptographic seal for every piece.</span>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-amber-500 text-white font-bold text-[10px] uppercase">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Certificate of Authenticity Preview Card */}
              <div className="md:col-span-5 bg-[#FCFBF8] border-2 border-amber-300/80 rounded-2xl p-6 sm:p-7 shadow-xs text-center flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 border border-amber-300">
                    <Sparkles className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 block mb-1">
                    JREAL FINE ART PLATFORM
                  </span>
                  <h4 className="text-base font-serif font-bold text-gray-900 mb-2">
                    Certificate of Authenticity
                  </h4>
                  <p className="text-xs text-gray-600 italic max-w-xs mx-auto leading-relaxed mb-5">
                    "This certifies that all cataloged artworks from this studio are original, unique creations verified under Rwandan intellectual property protection."
                  </p>

                  <div className="p-3 rounded-xl bg-white border border-amber-200 text-left text-[11px] space-y-1.5 font-mono text-gray-700">
                    <p><span className="text-gray-400">Artist:</span> {user?.name || "Jean Luc Habimana"}</p>
                    <p><span className="text-gray-400">Origin:</span> Kigali, Rwanda</p>
                    <p><span className="text-gray-400">Escrow:</span> Protected via MoMo Payout</p>
                    <p><span className="text-gray-400">Seal:</span> JR-COA-VERIFIED-2026</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-amber-200/60 text-[10px] text-gray-400">
                  Embedded in each collector invoice and physical parcel delivery.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ═════════════════════════════════════════════════════════════════════
          UPLOAD / EDIT ARTWORK MODAL
         ═════════════════════════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-2xl w-full p-6 sm:p-7 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#128C38]" />
                <h3 className="text-lg font-bold text-gray-900">
                  {editingId ? "Edit Original Artwork" : "Upload Original Artwork"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveArtwork} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Artwork Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. The Thousand Hills at Dawn"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#128C38]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Artist Name</label>
                  <input
                    type="text"
                    value={form.artistName}
                    onChange={(e) => setForm({ ...form, artistName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#128C38]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <select
                    value={form.artistCity}
                    onChange={(e) => setForm({ ...form, artistCity: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#128C38] cursor-pointer"
                  >
                    {ART_CITY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Medium</label>
                  <select
                    value={form.medium}
                    onChange={(e) => setForm({ ...form, medium: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#128C38] cursor-pointer"
                  >
                    {ART_MEDIUM_OPTIONS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Framing</label>
                  <select
                    value={form.framing}
                    onChange={(e) => setForm({ ...form, framing: e.target.value as any })}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#128C38] cursor-pointer"
                  >
                    {ART_FRAMING_OPTIONS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Dimensions</label>
                  <input
                    type="text"
                    placeholder="120 × 90 cm"
                    value={form.dimensions}
                    onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#128C38]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#128C38]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Weight</label>
                  <input
                    type="text"
                    placeholder="4.0 kg"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#128C38]"
                  />
                </div>
              </div>

              {/* Image Preset Selector & URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Artwork Photo</label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {ARTWORK_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setForm({ ...form, image: preset.url })}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        form.image === preset.url ? "border-[#128C38] scale-105" : "border-gray-200 opacity-70"
                      }`}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or paste custom image URL /path"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full px-3.5 py-1.5 text-xs font-mono border border-gray-200 rounded-xl focus:outline-none focus:border-[#128C38]"
                />
              </div>

              {/* Price & Real-Time Escrow Net Preview */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Listing Price (RWF) *</label>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={5000}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-xs font-bold font-mono border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-[#128C38]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-[11px]">
                  <div>
                    <span className="text-gray-400 block">Gross Price:</span>
                    <span className="font-bold text-gray-800">{formGross.toLocaleString()} RWF</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Comm + Tax (30%):</span>
                    <span className="font-bold text-rose-600">- {(formCommission + formTax).toLocaleString()} RWF</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Your Net Payout (70%):</span>
                    <span className="font-bold text-[#128C38] text-xs">{formNet.toLocaleString()} RWF</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description / Story</label>
                <textarea
                  rows={3}
                  placeholder="Inspiration, organic pigments, traditional motifs..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#128C38]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.certificateOfAuthenticity}
                    onChange={(e) => setForm({ ...form, certificateOfAuthenticity: e.target.checked })}
                    className="w-4 h-4 text-[#128C38] rounded focus:ring-[#128C38]"
                  />
                  <span>Include Certificate of Authenticity (COA)</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-700">Status:</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 bg-white"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  {editingId ? "Save Changes" : "Publish to Gallery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />

      {/* In-app Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        cancelLabel={confirmModal.cancelLabel}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
        </>
      )}
    </RoleGuard>
  );
}
