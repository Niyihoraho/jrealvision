import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import RoleGuard from "@/app/components/RoleGuard";
import ConfirmModal from "@/app/components/ConfirmModal";
import {
  initialArtworks,
  initialArtists,
  initialEscrowOrders,
  type Artwork,
  type Artist,
  type EscrowOrder,
} from "@/lib/galleryData";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  Clock,
  Truck,
  AlertTriangle,
  Lock,
  Layers,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Receipt,
  Phone,
  Send,
  SlidersHorizontal,
  Info,
} from "lucide-react";

export default function AdminGalleryPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "artists" | "escrow">("catalog");

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

  // Moderation state
  const [artworks, setArtworks] = useState<Artwork[]>(initialArtworks);
  const [artists, setArtists] = useState<Artist[]>(initialArtists);
  const [orders, setOrders] = useState<EscrowOrder[]>(initialEscrowOrders);

  // Selected for inspection modal
  const [inspectArtwork, setInspectArtwork] = useState<Artwork | null>(null);
  const [inspectArtist, setInspectArtist] = useState<Artist | null>(null);
  const [inspectOrder, setInspectOrder] = useState<EscrowOrder | null>(null);

  // Actions
  const handleApproveArtwork = (id: string) => {
    setArtworks((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Published" } : a))
    );
    setInspectArtwork(null);
  };

  const handleRejectArtwork = (id: string) => {
    setArtworks((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Draft" } : a))
    );
    setInspectArtwork(null);
  };

  const handleApproveArtist = (id: string) => {
    setArtists((prev) =>
      prev.map((ar) =>
        ar.id === id ? { ...ar, status: "Approved", payoutLocked: true } : ar
      )
    );
    setInspectArtist(null);
  };

  const handleAdvanceEscrow = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        if (o.status === "Payment Lock (Escrow)") {
          return { ...o, status: "Ready for Pickup" };
        }
        if (o.status === "Ready for Pickup") {
          return {
            ...o,
            status: "Shipped / In Transit",
            trackingNumber: "KGL-EXP-9921",
            courierName: "Kigali Express Couriers",
          };
        }
        if (o.status === "Shipped / In Transit") {
          return { ...o, status: "Delivery Confirmed" };
        }
        if (o.status === "Delivery Confirmed") {
          return { ...o, status: "Dispute Window (48h)", inspectionHoursLeft: 48 };
        }
        if (o.status === "Dispute Window (48h)") {
          return {
            ...o,
            status: "Settled & Disbursed",
            payoutStatus: "disbursed",
            payoutTransactionRef: `MOMO-AUTO-TRX-${Math.floor(100000 + Math.random() * 900000)}`,
          };
        }
        return o;
      })
    );
  };

  const pendingArtworks = artworks.filter((a) => a.status === "Pending Review");
  const pendingArtists = artists.filter((ar) => ar.status === "Pending");

  return (
    <RoleGuard allowedRoles={["ADMIN"]} portalName="Gallery Supervisory">
      <Head>
        <title>Admin Gallery Moderation & Escrow Monitor | JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Admin control center for artwork catalog moderation, artist onboarding verification, and end-to-end escrow monitoring."
        />
      </Head>
      <Header />

      <main className="min-h-screen bg-[#f8faf9] pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Admin Header */}
          <div className="bg-gradient-to-r from-gray-900 via-[#0c1811] to-black rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-gray-800 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                  Part 2: Admin Control & Step-by-Step Monitoring
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Gallery Supervisory & Escrow Center
                </h1>
                <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
                  Enforce Rwandan quality assurance, inspect artist documents, review incoming artwork listings, and track end-to-end customer escrow fulfillment.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/artist/dashboard"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white text-xs font-semibold border border-white/10 transition-colors"
                >
                  Artist Dashboard Portal →
                </Link>
                <Link
                  href="/gallery"
                  className="px-4 py-2.5 rounded-xl bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold shadow-md transition-all"
                >
                  View Public Gallery
                </Link>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
              <div className="text-left">
                <span className="text-xs text-gray-400 block font-medium">Pending Artwork Queue</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400">
                  {pendingArtworks.length} pieces
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs text-gray-400 block font-medium">Pending Artist Applications</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400">
                  {pendingArtists.length} applicants
                </span>
              </div>
              <div className="text-left">
                <span className="text-xs text-gray-400 block font-medium">Active Escrow Value</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-400">
                  {orders.reduce((sum, o) => sum + o.grossAmount, 0).toLocaleString()} RWF
                </span>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pt-6 mt-4 border-t border-white/10 scrollbar-none">
              <button
                onClick={() => setActiveTab("catalog")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "catalog"
                    ? "bg-[#128C38] text-white shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>Artwork Catalog Moderation</span>
                {pendingArtworks.length > 0 && (
                  <span className="bg-[#F59E0B] text-black text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {pendingArtworks.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("artists")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "artists"
                    ? "bg-[#128C38] text-white shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>Artist Onboarding Queue</span>
                {pendingArtists.length > 0 && (
                  <span className="bg-[#F59E0B] text-black text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                    {pendingArtists.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("escrow")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "escrow"
                    ? "bg-[#128C38] text-white shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>End-to-End Escrow Workflow Monitor</span>
              </button>
            </div>
          </div>

          {/* TAB 1: Artwork Catalog Moderation (/admin/catalog) */}
          {activeTab === "catalog" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Artwork Moderation Before Listing (/admin/catalog)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Admin verifies photo quality, pricing realism, and content guidelines before clicking <strong>Publish</strong>. This guarantees low-quality or fake listings never reach public gallery.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((art) => (
                  <div
                    key={art.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100">
                      <Image
                        src={art.images.front}
                        alt={art.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white ${
                            art.status === "Published"
                              ? "bg-emerald-600"
                              : art.status === "Pending Review"
                              ? "bg-amber-500 shadow-md animate-pulse"
                              : art.status === "Draft"
                              ? "bg-gray-600"
                              : "bg-red-600"
                          }`}
                        >
                          {art.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span className="font-semibold text-gray-800">{art.artistName}</span>
                          <span>📍 {art.artistCity}</span>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">
                          {art.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-3">
                          {art.medium} • {art.dimensions} • {art.framing}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="text-gray-500">Listed Price:</span>
                          <span className="font-bold text-gray-900">{art.price.toLocaleString()} RWF</span>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="pt-2 flex items-center gap-2">
                          <button
                            onClick={() => setInspectArtwork(art)}
                            className="flex-1 py-2 text-center rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200"
                          >
                            Inspect Piece
                          </button>

                          {art.status === "Pending Review" && (
                            <>
                              <button
                                onClick={() => handleApproveArtwork(art.id)}
                                className="flex-1 py-2 rounded-xl bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold flex items-center justify-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Publish</span>
                              </button>
                              <button
                                onClick={() => handleRejectArtwork(art.id)}
                                className="px-2.5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100"
                                title="Reject / Send feedback"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Artist Onboarding Verification (/admin/artists) */}
          {activeTab === "artists" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-2xs">
                <h3 className="text-base font-bold text-gray-900 mb-1">
                  Artist Onboarding Verification (/admin/artists)
                </h3>
                <p className="text-xs text-gray-500">
                  When an artist registers at <code>/join-as-artist</code>, their application enters here in <strong>Pending</strong> status. Admin inspects portfolio links, phone numbers, and identity documents before clicking Approve.
                </p>
              </div>

              <div className="space-y-4">
                {artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                        <Image
                          src={artist.avatar}
                          alt={artist.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-gray-900">{artist.name}</h4>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              artist.status === "Approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800 animate-pulse"
                            }`}
                          >
                            {artist.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          📍 {artist.city}, Rwanda • Payout: <strong className="font-mono text-gray-800">{artist.payoutNumber}</strong> ({artist.payoutMethod})
                        </p>
                        <p className="text-xs text-gray-600 italic line-clamp-1 mt-1 max-w-xl">
                          &ldquo;{artist.statement}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                      <button
                        onClick={() => setInspectArtist(artist)}
                        className="flex-1 md:flex-initial px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Inspect Docs
                      </button>

                      {artist.status === "Pending" ? (
                        <>
                          <button
                            onClick={() => handleApproveArtist(artist.id)}
                            className="flex-1 md:flex-initial px-5 py-2 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Artist</span>
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: "Reject Artist Application",
                                message: `Are you sure you want to reject the application for "${artist.name}"? A revision notice will be sent to the artist's email.`,
                                confirmLabel: "Send Rejection Notice",
                                variant: "warning",
                                onConfirm: () => {
                                  setArtists((prev) =>
                                    prev.map((a) => (a.id === artist.id ? { ...a, status: "Rejected" as any } : a))
                                  );
                                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                                },
                              });
                            }}
                            className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 cursor-pointer"
                            title="Reject application"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-emerald-700 font-bold px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Dashboard Active
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: End-to-End Escrow Workflow Monitor */}
          {activeTab === "escrow" && (
            <div className="space-y-6">
              {/* Visual Escrow Pipeline Header */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-2xs space-y-4">
                <h3 className="text-base font-bold text-gray-900">
                  Part 2, Item 3: End-to-End Delivery Monitoring (Escrow Workflow)
                </h3>
                <div className="p-4 rounded-xl bg-gray-900 text-emerald-400 font-mono text-xs overflow-x-auto">
                  [Customer Pays] ──► [Escrow Hold] ──► [Delivery Confirmed] ──► [Deduct Tax/Comm] ──► [Release to Artist]
                </div>
                <p className="text-xs text-gray-500">
                  Step 1 (Payment Lock) → Step 2 (Fulfillment Tracking) → Step 3 (Delivery Confirmation) → Step 4 (48h Dispute Window) → Step 5 (Net Settlement).
                </p>
              </div>

              {/* Orders in Escrow */}
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4"
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-[#128C38] bg-emerald-50 px-2 py-0.5 rounded">
                            {order.id}
                          </span>
                          <span className="text-xs text-gray-400">{order.orderDate}</span>
                          <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {order.status}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-gray-900 mt-1">
                          {order.artworkTitle}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Artist: <strong className="text-gray-800">{order.artistName}</strong> • Buyer: <strong className="text-gray-800">{order.buyerName}</strong> ({order.buyerCity})
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <span className="text-xs text-gray-400 block">Locked Escrow Funds</span>
                        <span className="text-xl font-black text-gray-900">
                          {order.grossAmount.toLocaleString()} RWF
                        </span>
                        <span className="text-xs text-gray-500 block">
                          Net to Artist (70%): <strong className="text-emerald-600">{order.artistNetPayout.toLocaleString()} RWF</strong>
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar of the 5 Steps */}
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          order.status !== "Payment Lock (Escrow)"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold"
                            : "bg-emerald-600 text-white font-bold"
                        }`}
                      >
                        1. Payment Lock
                      </div>
                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          order.status === "Ready for Pickup" || order.status === "Shipped / In Transit"
                            ? "bg-emerald-600 text-white font-bold"
                            : order.status === "Delivery Confirmed" ||
                              order.status === "Dispute Window (48h)" ||
                              order.status === "Settled & Disbursed"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        2. Fulfillment
                      </div>
                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          order.status === "Delivery Confirmed"
                            ? "bg-emerald-600 text-white font-bold"
                            : order.status === "Dispute Window (48h)" || order.status === "Settled & Disbursed"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        3. Confirmation
                      </div>
                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          order.status === "Dispute Window (48h)"
                            ? "bg-amber-500 text-white font-bold animate-pulse"
                            : order.status === "Settled & Disbursed"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        4. 48h Inspection
                      </div>
                      <div
                        className={`p-2.5 rounded-xl border text-center ${
                          order.status === "Settled & Disbursed"
                            ? "bg-emerald-600 text-white font-bold"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        5. Net MoMo Payout
                      </div>
                    </div>

                    {/* Escrow Advancement Control */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                      <div className="text-xs text-gray-500">
                        {order.payoutTransactionRef ? (
                          <span className="font-mono text-emerald-700 font-bold">
                            Disbursed: {order.payoutTransactionRef}
                          </span>
                        ) : (
                          <span>Funds securely held in platform corporate escrow account.</span>
                        )}
                      </div>

                      {order.status !== "Settled & Disbursed" && (
                        <button
                          onClick={() => handleAdvanceEscrow(order.id)}
                          className="px-5 py-2 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-transform active:scale-95"
                        >
                          <span>Advance Escrow Stage →</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Inspect Artwork Modal */}
      {inspectArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Artwork Moderation Inspection
              </h3>
              <button
                onClick={() => setInspectArtwork(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-[16/10] bg-gray-100 rounded-2xl overflow-hidden">
              <Image
                src={inspectArtwork.images.front}
                alt={inspectArtwork.title}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <h4 className="text-base font-bold text-gray-900">{inspectArtwork.title}</h4>
              <p className="text-xs text-gray-500">
                By {inspectArtwork.artistName} • {inspectArtwork.medium} • {inspectArtwork.dimensions}
              </p>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {inspectArtwork.description}
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => handleRejectArtwork(inspectArtwork.id)}
                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100"
              >
                Request Revisions
              </button>
              <button
                onClick={() => handleApproveArtwork(inspectArtwork.id)}
                className="px-6 py-2 bg-[#128C38] text-white text-xs font-bold rounded-xl shadow-md"
              >
                Approve & Publish to Gallery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Artist Modal */}
      {inspectArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Artist Verification Inspection
              </h3>
              <button
                onClick={() => setInspectArtist(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={inspectArtist.avatar}
                  alt={inspectArtist.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900">{inspectArtist.name}</h4>
                <p className="text-xs text-gray-500">📍 Studio in {inspectArtist.city}, Rwanda</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Mobile Money:</span>
                <span className="font-mono font-bold text-[#128C38]">{inspectArtist.payoutNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Account Name:</span>
                <span className="font-semibold text-gray-800">{inspectArtist.payoutAccountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">National ID Check:</span>
                <span className="text-emerald-700 font-bold">✓ Rwandan ID Verified</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 italic">
              &ldquo;{inspectArtist.statement}&rdquo;
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setInspectArtist(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600"
              >
                Close
              </button>
              {inspectArtist.status === "Pending" && (
                <button
                  onClick={() => handleApproveArtist(inspectArtist.id)}
                  className="px-6 py-2 bg-[#128C38] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Approve Artist Account
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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

      <Footer />
    </RoleGuard>
  );
}
