"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ConfirmModal from "@/app/components/ConfirmModal";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { companyInfo } from "@/lib/data";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type SellerMode = "ARTIST" | "MERCHANT";

export interface ArtworkListing {
  id: string;
  type: "ARTWORK";
  title: string;
  artistName: string;
  artistCity: string;
  medium: string;
  dimensions: string;
  framing: "Framed (Solid Wood)" | "Framed (Floating Frame)" | "Stretched Canvas" | "Unframed" | "Gallery Wrapped";
  price: number;
  year: string;
  weight: string;
  certificateOfAuthenticity: boolean;
  image: string;
  description: string;
  status: "Published" | "Pending Review" | "Draft" | "Sold";
  sales: number;
}

export interface ProductListing {
  id: string;
  type: "PRODUCT";
  title: string;
  category: string;
  price: number;
  stock: number;
  options: string;
  attributes?: import("@/lib/productAttributes").ProductAttribute[];
  customizable: boolean;
  image: string;
  images?: string[];
  description: string;
  status: "Active" | "Draft" | "Out of Stock";
  sales: number;
}

export interface SellerOrder {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  buyerCity: string;
  deliveryAddress: string;
  locationLandmark?: string;
  locationUrl?: string;
  itemTitle: string;
  itemType: "ARTWORK" | "PRODUCT";
  total: number;
  commission: number; // 15% platform commission
  netPayout: number;
  status: "NEW" | "IN_PRODUCTION" | "QUALITY_CONTROL" | "DISPATCHED" | "COMPLETED";
  date: string;
}

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  limit: string;
  current: boolean;
}

// ─── Presets for Quick Selection ───────────────────────────────────────────────

const ARTWORK_IMAGE_PRESETS = [
  { label: "Imigongo Modern Fusion", url: "/image/gallery/imigongo-fusion.jpg" },
  { label: "Thousand Hills Landscape", url: "/image/gallery/thousand-hills.jpg" },
  { label: "Kigali Urban Rhythm", url: "/image/gallery/kigali-rhythm.jpg" },
  { label: "Mountain Gorilla Study", url: "/image/gallery/mountain-gorilla.jpg" },
  { label: "African Woman Portrait", url: "/image/gallery/african-woman-portrait.jpg" },
];

const PRODUCT_IMAGE_PRESETS = [
  { label: "Apparel & Print", url: "/image/printing_products.jpg" },
  { label: "Graphic Design Kit", url: "/image/graphic design tool.jpg" },
  { label: "Digital Marketing Pack", url: "/image/digital_marketing.jpg" },
];

const ART_MEDIUM_OPTIONS = [
  "Acrylic on Canvas",
  "Oil on Linen",
  "Imigongo Relief & Pigments",
  "Banana Fiber & Sisal Tapestry",
  "Wood Carving & Charcoal",
  "Mixed Media on Textured Canvas",
  "Watercolor & Ink on Paper",
];

const ART_FRAMING_OPTIONS: ArtworkListing["framing"][] = [
  "Framed (Solid Wood)",
  "Framed (Floating Frame)",
  "Stretched Canvas",
  "Gallery Wrapped",
  "Unframed",
];

const PRODUCT_CATEGORY_OPTIONS = [
  "T-Shirts & Apparel",
  "Business Cards & Stationery",
  "Banners & Signage",
  "Mugs & Drinkware",
  "Branded Notebooks",
  "Promotional Products",
  "Marketing Kits",
];

const ORDER_STATUS_LABEL: Record<string, string> = {
  NEW: "New Order",
  IN_PRODUCTION: "In Production",
  QUALITY_CONTROL: "QC Review",
  DISPATCHED: "Dispatched",
  COMPLETED: "Completed",
};

const TIERS: SubscriptionTier[] = [
  { id: "t1", name: "Starter", price: 0, limit: "Up to 3 listings", current: false },
  { id: "t2", name: "Creator", price: 15000, limit: "Up to 15 listings + analytics", current: true },
  { id: "t3", name: "Pro Seller", price: 40000, limit: "Unlimited + priority placement", current: false },
];

// ─── Initial Sample Data ───────────────────────────────────────────────────────

const INITIAL_ARTWORKS: ArtworkListing[] = [
  {
    id: "art-1",
    type: "ARTWORK",
    title: "Imigongo Modern Rhythm",
    artistName: "Jean Luc Habimana",
    artistCity: "Kigali",
    medium: "Imigongo Relief & Acrylic",
    dimensions: "100 × 80 cm",
    framing: "Framed (Solid Wood)",
    price: 320000,
    year: "2026",
    weight: "4.2 kg",
    certificateOfAuthenticity: true,
    image: "/image/gallery/imigongo-fusion.jpg",
    description: "Contemporary fusion of traditional Rwandan geometry with modern acrylic color blocking and natural cow dung ash textures.",
    status: "Published",
    sales: 3,
  },
  {
    id: "art-2",
    type: "ARTWORK",
    title: "Hills of a Thousand Whispers",
    artistName: "Jean Luc Habimana",
    artistCity: "Musanze",
    medium: "Oil on Linen",
    dimensions: "120 × 90 cm",
    framing: "Framed (Floating Frame)",
    price: 480000,
    year: "2026",
    weight: "5.0 kg",
    certificateOfAuthenticity: true,
    image: "/image/gallery/thousand-hills.jpg",
    description: "Atmospheric mist over the volcanic terraces of northern Rwanda rendered in rich, luminous glazes.",
    status: "Published",
    sales: 1,
  },
  {
    id: "art-3",
    type: "ARTWORK",
    title: "Kigali Midnight Jazz",
    artistName: "Jean Luc Habimana",
    artistCity: "Kigali",
    medium: "Mixed Media & Sisal on Linen",
    dimensions: "75 × 60 cm",
    framing: "Stretched Canvas",
    price: 240000,
    year: "2025",
    weight: "2.8 kg",
    certificateOfAuthenticity: true,
    image: "/image/gallery/kigali-rhythm.jpg",
    description: "Vibrant urban nightlife study rendered with indigenous sisal fiber textures and acrylic pigments.",
    status: "Draft",
    sales: 0,
  },
];

const INITIAL_PRODUCTS: ProductListing[] = [
  {
    id: "prod-1",
    type: "PRODUCT",
    title: "Premium Heavyweight Cotton Corporate Polo",
    category: "T-Shirts & Apparel",
    price: 18000,
    stock: 240,
    options: "S, M, L, XL, XXL (Navy, Black, White)",
    customizable: true,
    image: "/image/printing_products.jpg",
    description: "Heavyweight 220 GSM pique cotton polo shirt with embroidered company crest and customized collar accents.",
    status: "Active",
    sales: 45,
  },
  {
    id: "prod-2",
    type: "PRODUCT",
    title: "Corporate Stationery & 500 Business Cards Pack",
    category: "Business Cards & Stationery",
    price: 185000,
    stock: 999,
    options: "Soft-Touch Matte, Spot UV, Gold Foil",
    customizable: true,
    image: "/image/graphic design tool.jpg",
    description: "Complete corporate identity pack including letterheads, presentation folders, and premium cards on 400 GSM silk board.",
    status: "Active",
    sales: 12,
  },
  {
    id: "prod-3",
    type: "PRODUCT",
    title: "Outdoor Heavy-Duty Roll-Up Pull Banner (85×200 cm)",
    category: "Banners & Signage",
    price: 65000,
    stock: 50,
    options: "Aluminum Base + Padded Carry Case",
    customizable: true,
    image: "/image/digital_marketing.jpg",
    description: "High-resolution tear-resistant banner with anti-glare finish and sturdy aluminum mechanism.",
    status: "Active",
    sales: 8,
  },
  {
    id: "prod-4",
    type: "PRODUCT",
    title: "Ceramic Coffee Mug with Full Sublimation Wrap",
    category: "Mugs & Drinkware",
    price: 6000,
    stock: 180,
    options: "11 oz Glossy White, Dishwasher Safe",
    customizable: true,
    image: "/image/printing_products.jpg",
    description: "Microwave and dishwasher safe ceramic mugs with full color vibrant wrap printing for branded corporate gifting.",
    status: "Active",
    sales: 30,
  },
];

const INITIAL_ORDERS: SellerOrder[] = [
  {
    id: "so-1",
    orderNumber: "JRV-2041",
    buyerName: "Eric Mugabo",
    buyerPhone: "+250 788 123 456",
    buyerCity: "Kicukiro, Kigali",
    deliveryAddress: "KG 14 Ave, near Eco-Bank, House #12",
    locationLandmark: "Opposite Eco-Bank Kicukiro, Black gate",
    locationUrl: "https://maps.google.com/?q=-1.9705,30.1044",
    itemTitle: "Corporate Stationery & 500 Business Cards Pack",
    itemType: "PRODUCT",
    total: 185000,
    commission: 27750,
    netPayout: 157250,
    status: "IN_PRODUCTION",
    date: "2026-09-28",
  },
  {
    id: "so-2",
    orderNumber: "JRV-2033",
    buyerName: "Amina Hirwa",
    buyerPhone: "+250 782 987 654",
    buyerCity: "Gasabo, Kigali",
    deliveryAddress: "KG 9 Ave, Nyarutarama, Villa #4",
    locationLandmark: "Near MTN Centre, 2nd turn right",
    locationUrl: "https://maps.google.com/?q=-1.9365,30.1030",
    itemTitle: "Imigongo Modern Rhythm",
    itemType: "ARTWORK",
    total: 320000,
    commission: 48000,
    netPayout: 224000, // 70% net payout under escrow formula
    status: "DISPATCHED",
    date: "2026-09-22",
  },
  {
    id: "so-3",
    orderNumber: "JRV-2018",
    buyerName: "Jean-Paul Rukundo",
    buyerPhone: "+250 783 555 111",
    buyerCity: "Nyarugenge, Kigali",
    deliveryAddress: "KN 2 Roundabout, Grand Pension Plaza Fl 4",
    locationLandmark: "Commercial Bank reception desk",
    locationUrl: "https://maps.google.com/?q=-1.9441,30.0619",
    itemTitle: "Hills of a Thousand Whispers",
    itemType: "ARTWORK",
    total: 480000,
    commission: 72000,
    netPayout: 336000,
    status: "COMPLETED",
    date: "2026-09-10",
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────

interface VendorDashboardProps {
  initialMode?: SellerMode;
}

export default function VendorDashboardPage({ initialMode }: VendorDashboardProps) {
  const router = useRouter();

  // Mode detection: If opened via /artist/dashboard, default to ARTIST mode
  const isArtistRoute = router.pathname.includes("/artist");
  const [sellerMode, setSellerMode] = useState<SellerMode>(
    initialMode || (isArtistRoute ? "ARTIST" : "MERCHANT")
  );

  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<"overview" | "products" | "orders" | "payouts" | "settings">("products");
  const [loading, setLoading] = useState(true);

  // Listings state
  const [artworks, setArtworks] = useState<ArtworkListing[]>(INITIAL_ARTWORKS);
  const [products, setProducts] = useState<ProductListing[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<SellerOrder[]>(INITIAL_ORDERS);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const [modalError, setModalError] = useState<string | null>(null);
  const [settingsNotice, setSettingsNotice] = useState<string | null>(null);
  const [payoutNotice, setPayoutNotice] = useState<string | null>(null);
  const [subscriptionNotice, setSubscriptionNotice] = useState<string | null>(null);

  // Form states for Artist Artwork
  const [artForm, setArtForm] = useState<Omit<ArtworkListing, "id" | "sales" | "type">>({
    title: "",
    artistName: "Jean Luc Habimana",
    artistCity: "Kigali",
    medium: "Acrylic on Canvas",
    dimensions: "100 × 80 cm",
    framing: "Framed (Solid Wood)",
    price: 250000,
    year: "2026",
    weight: "3.5 kg",
    certificateOfAuthenticity: true,
    image: "/image/gallery/imigongo-fusion.jpg",
    description: "",
    status: "Published",
  });

  // Form states for Merchant Product
  const [prodForm, setProdForm] = useState<Omit<ProductListing, "id" | "sales" | "type">>({
    title: "",
    category: "T-Shirts & Apparel",
    price: 15000,
    stock: 100,
    options: "S, M, L, XL",
    customizable: true,
    image: "/image/printing_products.jpg",
    description: "",
    status: "Active",
  });

  // Load user
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (d?.user) {
          setUser(d.user);
          if (!initialMode) {
            if (d.user.role === "ARTIST" || d.user.email?.includes("artist")) {
              setSellerMode("ARTIST");
            } else if (d.user.role === "VENDOR" || d.user.email?.includes("merchant") || d.user.email?.includes("seller")) {
              setSellerMode("MERCHANT");
            }
          }
        }
      })
      .catch(() => {
        setUser({
          id: "demo-seller",
          name: isArtistRoute || initialMode === "ARTIST" ? "Jean Luc Habimana" : "Urukundo Store",
          email: isArtistRoute || initialMode === "ARTIST" ? "artist.demo@jreal.rw" : "merchant.demo@jreal.rw",
          role: isArtistRoute || initialMode === "ARTIST" ? "ARTIST" : "VENDOR",
        });
      })
      .finally(() => setLoading(false));
  }, [initialMode]);

  const logout = async () => {
    await fetch("/api/auth/me", { method: "POST" }).catch(() => {});
    router.push("/login");
  };

  // ─── CRUD Actions: Add / Edit / Delete ────────────────────────────────────────

  const openAddModal = () => {
    setEditingId(null);
    if (sellerMode === "ARTIST") {
      setArtForm({
        title: "",
        artistName: user?.name || "Jean Luc Habimana",
        artistCity: "Kigali",
        medium: "Acrylic on Canvas",
        dimensions: "100 × 80 cm",
        framing: "Framed (Solid Wood)",
        price: 300000,
        year: "2026",
        weight: "4.0 kg",
        certificateOfAuthenticity: true,
        image: "/image/gallery/imigongo-fusion.jpg",
        description: "",
        status: "Published",
      });
    } else {
      setProdForm({
        title: "",
        category: "T-Shirts & Apparel",
        price: 15000,
        stock: 100,
        options: "S, M, L, XL",
        customizable: true,
        image: "/image/printing_products.jpg",
        description: "",
        status: "Active",
      });
    }
    setIsModalOpen(true);
  };

  const openEditModal = (item: ArtworkListing | ProductListing) => {
    setEditingId(item.id);
    setModalError(null);
    if (item.type === "ARTWORK") {
      setSellerMode("ARTIST");
      setArtForm({
        title: item.title,
        artistName: item.artistName,
        artistCity: item.artistCity,
        medium: item.medium,
        dimensions: item.dimensions,
        framing: item.framing,
        price: item.price,
        year: item.year,
        weight: item.weight,
        certificateOfAuthenticity: item.certificateOfAuthenticity,
        image: item.image,
        description: item.description,
        status: item.status,
      });
    } else {
      setSellerMode("MERCHANT");
      setProdForm({
        title: item.title,
        category: item.category,
        price: item.price,
        stock: item.stock,
        options: item.options,
        customizable: item.customizable,
        image: item.image,
        description: item.description,
        status: item.status,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveListing = (e: React.FormEvent) => {
    e.preventDefault();

    if (sellerMode === "ARTIST") {
      if (!artForm.title.trim() || !artForm.price) {
        setModalError("Please enter a title and price for your artwork.");
        return;
      }
      if (editingId) {
        setArtworks((prev) =>
          prev.map((a) => (a.id === editingId ? { ...a, ...artForm, price: Number(artForm.price) } : a))
        );
      } else {
        const newArt: ArtworkListing = {
          id: `art-${Date.now()}`,
          type: "ARTWORK",
          ...artForm,
          price: Number(artForm.price),
          sales: 0,
        };
        setArtworks((prev) => [newArt, ...prev]);
      }
    } else {
      if (!prodForm.title.trim() || !prodForm.price) {
        setModalError("Please enter a product title and price.");
        return;
      }
      if (editingId) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? { ...p, ...prodForm, price: Number(prodForm.price) } : p))
        );
      } else {
        const newProd: ProductListing = {
          id: `prod-${Date.now()}`,
          type: "PRODUCT",
          ...prodForm,
          price: Number(prodForm.price),
          sales: 0,
        };
        setProducts((prev) => [newProd, ...prev]);
      }
    }

    setIsModalOpen(false);
    setEditingId(null);
    setModalError(null);
  };

  const handleDeleteListing = (id: string, type: "ARTWORK" | "PRODUCT") => {
    const itemTitle =
      type === "ARTWORK"
        ? artworks.find((a) => a.id === id)?.title || "artwork"
        : products.find((p) => p.id === id)?.title || "product";

    setConfirmModal({
      isOpen: true,
      title: `Delete ${type === "ARTWORK" ? "Artwork" : "Product"}`,
      message: `Are you sure you want to remove "${itemTitle}" from your store? This action cannot be undone.`,
      confirmLabel: "Delete Listing",
      variant: "danger",
      onConfirm: () => {
        if (type === "ARTWORK") {
          setArtworks((prev) => prev.filter((a) => a.id !== id));
        } else {
          setProducts((prev) => prev.filter((p) => p.id !== id));
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleToggleStatus = (id: string, type: "ARTWORK" | "PRODUCT") => {
    if (type === "ARTWORK") {
      setArtworks((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: a.status === "Published" ? "Draft" : "Published" }
            : a
        )
      );
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: p.status === "Active" ? "Draft" : "Active" }
            : p
        )
      );
    }
  };

  const updateOrderStatus = (id: string, next: SellerOrder["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
  };

  const copyOrderLocation = (order: SellerOrder) => {
    const text = `${order.buyerName} (${order.buyerPhone})\nAddress: ${order.deliveryAddress}, ${order.buyerCity}${
      order.locationLandmark ? `\nLandmark: ${order.locationLandmark}` : ""
    }${order.locationUrl ? `\nMap Link: ${order.locationUrl}` : ""}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  const shareOrderLocation = async (order: SellerOrder) => {
    const shareText = `Delivery for ${order.buyerName} (${order.buyerPhone}): ${order.deliveryAddress}, ${order.buyerCity}.${
      order.locationLandmark ? ` Landmark: ${order.locationLandmark}.` : ""
    }`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Delivery #${order.orderNumber} - ${order.buyerName}`,
          text: shareText,
          url: order.locationUrl || undefined,
        });
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }

    // Direct WhatsApp share fallback for drivers/dispatchers
    const fullMsg = `*JREAL DELIVERY — Order #${order.orderNumber}*\nBuyer: ${order.buyerName} (${order.buyerPhone})\nAddress: ${order.deliveryAddress}, ${order.buyerCity}\n${
      order.locationLandmark ? `Landmark: ${order.locationLandmark}\n` : ""
    }${order.locationUrl ? `Google Maps: ${order.locationUrl}` : ""}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMsg)}`, "_blank", "noopener,noreferrer");
  };

  // ─── Financial Calculations ─────────────────────────────────────────────────

  const totalSalesRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((s, o) => s + o.total, 0);

  const totalNetEarnings = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((s, o) => s + o.netPayout, 0);

  const pendingFulfillmentOrders = orders.filter(
    (o) => o.status === "NEW" || o.status === "IN_PRODUCTION" || o.status === "QUALITY_CONTROL"
  ).length;

  const TABS = [
    { key: "products", label: sellerMode === "ARTIST" ? "Artworks & Gallery" : "Products & Catalog" },
    { key: "orders", label: `Orders (${orders.length})` },
    { key: "overview", label: "Overview" },
    { key: "payouts", label: "Payouts & Plan" },
    { key: "settings", label: "Store Settings" },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-xs font-mono uppercase tracking-widest text-gray-500">
        Loading seller portal…
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          {sellerMode === "ARTIST" ? "Artist Studio Portal" : "Merchant Store Portal"} — JREAL VISION
        </title>
      </Head>

      <Header />

      <main className="min-h-screen bg-[#F8FAFC] pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Top Bar with Seller Persona Switcher ── */}
          <div className="bg-white border border-gray-200 p-6 mb-8 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#128C38]">
                    {sellerMode === "ARTIST" ? "Verified Artist Studio" : "Verified Merchant Store"}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-500">{user?.email || "merchant@jreal.rw"}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {user?.name || (sellerMode === "ARTIST" ? "Jean Luc Habimana" : "Urukundo Store")}
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  {sellerMode === "ARTIST"
                    ? "Manage your original fine art, Imigongo heritage pieces, and gallery escrow orders."
                    : "Manage your custom apparel, business cards, merchandise, and commercial product orders."}
                </p>
              </div>

              {/* Storefront & Sign Out Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={sellerMode === "ARTIST" ? "/gallery" : "/shop"}
                  target="_blank"
                  className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded transition-colors"
                >
                  View Storefront ↗
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-gray-500 hover:text-gray-800 text-xs transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>

          {/* ── Tabs Navigation ── */}
          <div className="border-b border-gray-200 mb-8 bg-white px-4 border border-gray-200 shadow-2xs">
            <nav className="flex gap-2 -mb-px overflow-x-auto">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
                    tab === key
                      ? "border-[#128C38] text-[#128C38]"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* ── TAB 1: PRODUCTS / ARTWORKS (Full CRUD) ── */}
          {tab === "products" && (
            <div className="space-y-6">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {sellerMode === "ARTIST" ? "Art Gallery Inventory" : "Commercial Product Listings"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {sellerMode === "ARTIST"
                      ? "Add, update, or remove artworks formatted to the exact JREAL Art Gallery card design."
                      : "Add, update, or remove commercial items formatted to the exact JREAL Shop product card design."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openAddModal}
                  className="px-4 py-2 bg-[#128C38] hover:bg-[#0f7230] text-white text-xs font-bold transition-colors rounded shadow-2xs flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>+</span>
                  <span>{sellerMode === "ARTIST" ? "Add New Artwork" : "Add New Product"}</span>
                </button>
              </div>

              {/* Mode-Specific Listings Table */}
              <div className="border border-gray-200 border-l-2 border-l-[#128C38] bg-white overflow-x-auto shadow-2xs">
                {sellerMode === "ARTIST" ? (
                  /* ── ARTIST TABLE (Matches Art Gallery Card Fields) ── */
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-600">Artwork</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-600 hidden md:table-cell">Medium & Size</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-600 hidden lg:table-cell">Framing</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-600 text-right">Price</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-600">Status</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {artworks.map((art) => (
                        <tr key={art.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-9 rounded overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                <Image src={art.image} alt={art.title} fill className="object-cover" />
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 block leading-tight">{art.title}</span>
                                <span className="text-[11px] text-gray-500">
                                  {art.year} · {art.certificateOfAuthenticity ? "Certificate Included" : "No Cert"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">
                            <span className="font-medium block text-gray-800">{art.medium}</span>
                            <span className="text-[11px] text-gray-400">{art.dimensions}</span>
                          </td>
                          <td className="px-5 py-3.5 text-gray-600 hidden lg:table-cell">
                            <span className="inline-block bg-gray-100 px-2 py-0.5 text-[11px] rounded text-gray-700">
                              {art.framing}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-gray-900 tabular-nums">
                            {art.price.toLocaleString()} RWF
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold border ${
                                art.status === "Published"
                                  ? "bg-[#128C38]/10 text-[#128C38] border-[#128C38]/20"
                                  : art.status === "Pending Review"
                                  ? "bg-[#F59E0B]/10 text-[#B45309] border-[#F59E0B]/20"
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  art.status === "Published"
                                    ? "bg-[#128C38]"
                                    : art.status === "Pending Review"
                                    ? "bg-[#F59E0B]"
                                    : "bg-gray-400"
                                }`}
                              />
                              {art.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(art)}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded text-[11px] transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(art.id, "ARTWORK")}
                                className="text-gray-500 hover:text-gray-900 text-[11px] underline"
                              >
                                {art.status === "Published" ? "Unpublish" : "Publish"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteListing(art.id, "ARTWORK")}
                                className="text-red-500 hover:text-red-700 text-[11px] font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  /* ── MERCHANT TABLE (Matches Shop Product Card Fields) ── */
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-600">Product</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-600 hidden md:table-cell">Category</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-600 hidden sm:table-cell">Stock</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-600 text-right">Price</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-600">Status</th>
                        <th className="px-5 py-3 font-bold uppercase tracking-wider text-gray-600 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative w-12 h-9 rounded overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                <Image src={prod.image} alt={prod.title} fill className="object-cover" />
                              </div>
                              <div>
                                <span className="font-bold text-gray-900 block leading-tight">{prod.title}</span>
                                <span className="text-[11px] text-gray-500">
                                  {prod.options} {prod.customizable && "· Customizable"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">
                            <span className="font-medium text-gray-800">{prod.category}</span>
                          </td>
                          <td className="px-5 py-3.5 hidden sm:table-cell text-gray-700">
                            <span className="font-mono font-semibold">{prod.stock}</span> units
                          </td>
                          <td className="px-5 py-3.5 text-right font-bold text-gray-900 tabular-nums">
                            {prod.price.toLocaleString()} RWF
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold border ${
                                prod.status === "Active"
                                  ? "bg-[#128C38]/10 text-[#128C38] border-[#128C38]/20"
                                  : "bg-gray-100 text-gray-600 border-gray-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  prod.status === "Active" ? "bg-[#128C38]" : "bg-gray-400"
                                }`}
                              />
                              {prod.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(prod)}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded text-[11px] transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(prod.id, "PRODUCT")}
                                className="text-gray-500 hover:text-gray-900 text-[11px] underline"
                              >
                                {prod.status === "Active" ? "Draft" : "Activate"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteListing(prod.id, "PRODUCT")}
                                className="text-red-500 hover:text-red-700 text-[11px] font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 2: ORDERS MANAGEMENT ── */}
          {tab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Fulfilment & Customer Orders</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Advance production stages, view net seller earnings, and contact buyers directly on WhatsApp.
                  </p>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {orders.length} orders total · {pendingFulfillmentOrders} active in pipeline
                </span>
              </div>

              <div className="border border-gray-200 border-l-2 border-l-[#128C38] bg-white overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-gray-600">Order Ref</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-gray-600">Customer</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-gray-600">Delivery Location (Shared by Customer)</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-gray-600 hidden lg:table-cell">Item</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-gray-600 text-right">Gross Total</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-gray-600 text-right">Net Payout</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-gray-600">Fulfilment Stage</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-gray-600 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3.5 align-top">
                          <span className="font-mono font-bold text-gray-900 block">#{o.orderNumber}</span>
                          <span className="text-[11px] text-gray-400">{o.date}</span>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <span className="font-semibold text-gray-900 block">{o.buyerName}</span>
                          <span className="text-[11px] text-gray-500 font-mono">{o.buyerPhone}</span>
                        </td>
                        <td className="px-4 py-3.5 align-top max-w-xs">
                          <div className="space-y-1">
                            <p className="font-medium text-gray-900 leading-snug">
                              {o.deliveryAddress}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {o.buyerCity}
                            </p>
                            {o.locationLandmark && (
                              <p className="text-[10px] text-gray-600 bg-gray-100/70 px-2 py-0.5 rounded border border-gray-200 inline-block">
                                Landmark: {o.locationLandmark}
                              </p>
                            )}
                            <div className="flex items-center gap-1.5 pt-1">
                              <button
                                type="button"
                                onClick={() => copyOrderLocation(o)}
                                className={`px-2 py-0.5 text-[11px] font-bold rounded border transition-colors ${
                                  copiedOrderId === o.id
                                    ? "bg-emerald-50 border-[#128C38] text-[#128C38]"
                                    : "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                                }`}
                                title="Copy full delivery address, landmark and map link"
                              >
                                {copiedOrderId === o.id ? "Copied ✓" : "Copy"}
                              </button>
                              <button
                                type="button"
                                onClick={() => shareOrderLocation(o)}
                                className="px-2 py-0.5 text-[11px] font-bold rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
                                title="Share delivery location with dispatch courier or driver"
                              >
                                Share
                              </button>
                              {o.locationUrl && (
                                <a
                                  href={o.locationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-0.5 text-[11px] font-semibold text-gray-500 hover:text-gray-900 hover:underline"
                                  title="View on Google Maps"
                                >
                                  Map ↗
                                </a>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-gray-700 hidden lg:table-cell max-w-xs align-top">
                          <span className="font-medium text-gray-900 block truncate">{o.itemTitle}</span>
                          <span className="inline-block px-1.5 py-0.2 text-[10px] bg-gray-100 text-gray-600 rounded">
                            {o.itemType === "ARTWORK" ? "Art Escrow" : "Commercial Product"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-gray-700 tabular-nums align-top">
                          {o.total.toLocaleString()} RWF
                        </td>
                        <td className="px-4 py-3.5 text-right font-bold text-[#128C38] tabular-nums align-top">
                          {o.netPayout.toLocaleString()} RWF
                          <span className="block text-[10px] text-gray-400 font-normal">
                            -{(o.commission).toLocaleString()} fee
                          </span>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value as SellerOrder["status"])}
                            className="text-xs border border-gray-300 bg-white px-2 py-1.5 text-gray-800 rounded focus:outline-none focus:border-[#128C38]"
                          >
                            <option value="NEW">New Order</option>
                            <option value="IN_PRODUCTION">In Production</option>
                            <option value="QUALITY_CONTROL">QC Review</option>
                            <option value="DISPATCHED">Dispatched</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </td>
                        <td className="px-4 py-3.5 text-right align-top">
                          <a
                            href={`https://wa.me/${o.buyerPhone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(
                              o.buyerName
                            )},%20regarding%20your%20JREAL%20order%20${o.orderNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#128C38] font-bold rounded text-[11px] transition-colors whitespace-nowrap"
                          >
                            WhatsApp Buyer
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB 3: OVERVIEW ── */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 p-5 rounded shadow-2xs">
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Total Gross Sales
                  </span>
                  <span className="text-xl font-bold text-gray-900 block">
                    {totalSalesRevenue.toLocaleString()} RWF
                  </span>
                  <span className="text-[11px] text-gray-500 mt-1 block">Completed orders</span>
                </div>
                <div className="bg-white border border-gray-200 p-5 rounded shadow-2xs">
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Net Payout Balance
                  </span>
                  <span className="text-xl font-bold text-[#128C38] block">
                    {totalNetEarnings.toLocaleString()} RWF
                  </span>
                  <span className="text-[11px] text-gray-500 mt-1 block">Available for withdrawal</span>
                </div>
                <div className="bg-white border border-gray-200 p-5 rounded shadow-2xs">
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Active Listings
                  </span>
                  <span className="text-xl font-bold text-gray-900 block">
                    {sellerMode === "ARTIST" ? artworks.length : products.length}
                  </span>
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    {sellerMode === "ARTIST" ? "Art gallery works" : "Shop catalog items"}
                  </span>
                </div>
                <div className="bg-white border border-gray-200 p-5 rounded shadow-2xs">
                  <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                    Pending Orders
                  </span>
                  <span className="text-xl font-bold text-[#F59E0B] block">
                    {pendingFulfillmentOrders}
                  </span>
                  <span className="text-[11px] text-gray-500 mt-1 block">Awaiting delivery</span>
                </div>
              </div>

              {/* Quick Action Banner */}
              <div className="bg-white border border-gray-200 border-l-4 border-l-[#128C38] p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Ready to publish another {sellerMode === "ARTIST" ? "piece of art" : "product"}?
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {sellerMode === "ARTIST"
                      ? "Include dimensions, framing, and certificate details to match the curated Art Gallery."
                      : "Include inventory stock, sizes, and customization options to match the B2C shop."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="px-4 py-2 bg-[#128C38] hover:bg-[#0f7230] text-white text-xs font-bold transition-colors rounded shadow-2xs shrink-0"
                >
                  {sellerMode === "ARTIST" ? "+ Add Artwork" : "+ Add Product"}
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 4: PAYOUTS & PLAN ── */}
          {tab === "payouts" && (
            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-base font-bold text-gray-900">Payouts & Subscription Plans</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage MTN MoMo / Airtel Money / Bank disbursements and active tier limits.
                </p>
              </div>

              {/* Plans */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Current Listing Tier
                </p>
                {subscriptionNotice && (
                  <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{subscriptionNotice}</span>
                    </div>
                    <button type="button" onClick={() => setSubscriptionNotice(null)} className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer">✕</button>
                  </div>
                )}
                <div className="border border-gray-200 divide-y divide-gray-200 bg-white shadow-2xs">
                  {TIERS.map((t) => (
                    <div
                      key={t.id}
                      className={`px-5 py-4 flex flex-wrap items-center justify-between gap-4 ${
                        t.current ? "bg-emerald-50/20" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {t.current && (
                          <span className="text-[10px] uppercase tracking-widest font-bold text-[#128C38] border border-[#128C38] px-2 py-0.5 rounded">
                            Active Plan
                          </span>
                        )}
                        <div>
                          <p className="text-sm font-bold text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-500">{t.limit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <span className="text-sm font-bold text-gray-900 tabular-nums">
                          {t.price === 0 ? "Free" : `${t.price.toLocaleString()} RWF / month`}
                        </span>
                        {!t.current && (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: `Upgrade to ${t.name} Plan`,
                                message: `Would you like to switch to the ${t.name} plan tier (${t.price === 0 ? "Free" : `${t.price.toLocaleString()} RWF / month`}) with ${t.limit}?`,
                                confirmLabel: "Confirm Upgrade",
                                variant: "info",
                                onConfirm: () => {
                                  setSubscriptionNotice(`Your account has been switched to the ${t.name} plan tier.`);
                                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                                },
                              });
                            }}
                            className="text-xs font-bold text-gray-900 border border-gray-900 px-3 py-1.5 hover:bg-gray-900 hover:text-white transition-colors rounded cursor-pointer"
                          >
                            Upgrade
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial summary */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Disbursement Balance
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-gray-200 p-5 rounded shadow-2xs">
                    <span className="text-xs text-gray-400 block mb-1">Total Earned (Gross)</span>
                    <span className="text-lg font-bold text-gray-900">
                      {totalSalesRevenue.toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="bg-white border border-gray-200 p-5 rounded shadow-2xs">
                    <span className="text-xs text-gray-400 block mb-1">Platform Commission (15%)</span>
                    <span className="text-lg font-bold text-gray-600">
                      {(Math.round(totalSalesRevenue * 0.15)).toLocaleString()} RWF
                    </span>
                  </div>
                  <div className="bg-white border border-gray-200 p-5 rounded shadow-2xs">
                    <span className="text-xs text-gray-400 block mb-1">Available for Immediate Payout</span>
                    <span className="text-lg font-bold text-[#128C38]">
                      {totalNetEarnings.toLocaleString()} RWF
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  {payoutNotice && (
                    <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{payoutNotice}</span>
                      </div>
                      <button type="button" onClick={() => setPayoutNotice(null)} className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer">✕</button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: "Request MoMo Disbursement",
                        message: `Initiate a transfer of ${totalNetEarnings.toLocaleString()} RWF to your registered MTN Mobile Money wallet (+250 788 123 456)?`,
                        confirmLabel: "Submit Transfer Request",
                        variant: "info",
                        onConfirm: () => {
                          setPayoutNotice("Payout request submitted! Funds will reflect in your MoMo wallet within 24 hours.");
                          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                        },
                      });
                    }}
                    className="px-5 py-2.5 bg-[#128C38] hover:bg-[#0f7230] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
                  >
                    Request MoMo Payout Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 5: SETTINGS ── */}
          {tab === "settings" && (
            <div className="space-y-6 max-w-xl">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-base font-bold text-gray-900">Seller Studio & Profile Settings</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update public gallery details, payout phone, and storefront credentials.
                </p>
              </div>

              <div className="bg-white border border-gray-200 p-6 space-y-4 rounded shadow-2xs">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Studio / Business Name
                  </label>
                  <input
                    defaultValue={user?.name || "Jean Luc Habimana Fine Art Studio"}
                    className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Contact Email Address
                  </label>
                  <input
                    defaultValue={user?.email || "artist.demo@jreal.rw"}
                    className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    MTN Mobile Money Payout Phone Number
                  </label>
                  <input
                    defaultValue="+250 788 123 456"
                    className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Location City (Rwanda)
                  </label>
                  <input
                    defaultValue="Kigali, Rwanda"
                    className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                  />
                </div>

                {settingsNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{settingsNotice}</span>
                    </div>
                    <button type="button" onClick={() => setSettingsNotice(null)} className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 cursor-pointer">✕</button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setSettingsNotice("Store settings and payout profile updated successfully!")}
                  className="px-5 py-2.5 bg-[#128C38] hover:bg-[#0f7230] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
                >
                  Save Store Profile
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── CREATE / EDIT MODAL WITH LIVE CARD PREVIEW ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded shadow-xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#128C38]">
                  {editingId ? "Update Listing" : "New Listing Creation"}
                </span>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingId
                    ? sellerMode === "ARTIST"
                      ? "Edit Artwork Details"
                      : "Edit Commercial Product"
                    : sellerMode === "ARTIST"
                    ? "Add New Fine Art Piece"
                    : "Add New Commercial Product"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-gray-900 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Split Layout: Form on Left (7 cols), Live Card Preview on Right (5 cols) */}
            <form onSubmit={handleSaveListing} className="p-6 grid lg:grid-cols-12 gap-8 items-start">
              {modalError && (
                <div className="lg:col-span-12 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalError(null)}
                    className="text-rose-600 hover:text-rose-900 font-bold ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {/* ── Left Form Fields ── */}
              <div className="lg:col-span-7 space-y-4">
                {sellerMode === "ARTIST" ? (
                  /* ── ARTIST FIELDS ── */
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Artwork Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={artForm.title}
                        onChange={(e) => setArtForm({ ...artForm, title: e.target.value })}
                        placeholder="e.g. Imigongo Modern Rhythm"
                        className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Medium *
                        </label>
                        <select
                          value={artForm.medium}
                          onChange={(e) => setArtForm({ ...artForm, medium: e.target.value })}
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        >
                          {ART_MEDIUM_OPTIONS.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Dimensions *
                        </label>
                        <input
                          type="text"
                          required
                          value={artForm.dimensions}
                          onChange={(e) => setArtForm({ ...artForm, dimensions: e.target.value })}
                          placeholder="e.g. 100 × 80 cm"
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Framing Specification *
                        </label>
                        <select
                          value={artForm.framing}
                          onChange={(e) => setArtForm({ ...artForm, framing: e.target.value as any })}
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        >
                          {ART_FRAMING_OPTIONS.map((f) => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Price (RWF) *
                        </label>
                        <input
                          type="number"
                          required
                          value={artForm.price}
                          onChange={(e) => setArtForm({ ...artForm, price: Number(e.target.value) })}
                          placeholder="e.g. 320000"
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Year Created
                        </label>
                        <input
                          type="text"
                          value={artForm.year}
                          onChange={(e) => setArtForm({ ...artForm, year: e.target.value })}
                          placeholder="2026"
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Est. Weight
                        </label>
                        <input
                          type="text"
                          value={artForm.weight}
                          onChange={(e) => setArtForm({ ...artForm, weight: e.target.value })}
                          placeholder="3.5 kg"
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          value={artForm.status}
                          onChange={(e) => setArtForm({ ...artForm, status: e.target.value as any })}
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        >
                          <option value="Published">Published</option>
                          <option value="Pending Review">Pending Review</option>
                          <option value="Draft">Draft</option>
                          <option value="Sold">Sold</option>
                        </select>
                      </div>
                    </div>

                    {/* Quick Artwork Image Presets */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Artwork Image URL
                      </label>
                      <input
                        type="text"
                        value={artForm.image}
                        onChange={(e) => setArtForm({ ...artForm, image: e.target.value })}
                        placeholder="/image/gallery/imigongo-fusion.jpg"
                        className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] mb-1.5"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-gray-400 font-semibold self-center mr-1">Presets:</span>
                        {ARTWORK_IMAGE_PRESETS.map((p) => (
                          <button
                            key={p.url}
                            type="button"
                            onClick={() => setArtForm({ ...artForm, image: p.url })}
                            className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                              artForm.image === p.url
                                ? "bg-[#128C38] text-white border-[#128C38]"
                                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Certificate of Authenticity Toggle */}
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">
                          Certificate of Authenticity
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Includes signed artist seal & escrow guarantee.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={artForm.certificateOfAuthenticity}
                        onChange={(e) => setArtForm({ ...artForm, certificateOfAuthenticity: e.target.checked })}
                        className="w-4 h-4 accent-[#128C38]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Artwork Narrative & Description
                      </label>
                      <textarea
                        rows={3}
                        value={artForm.description}
                        onChange={(e) => setArtForm({ ...artForm, description: e.target.value })}
                        placeholder="Inspiration, symbolism, technique, and historical context of the piece..."
                        className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                      />
                    </div>
                  </>
                ) : (
                  /* ── MERCHANT FIELDS ── */
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={prodForm.title}
                        onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })}
                        placeholder="e.g. Basic Black Cotton T-Shirt"
                        className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          value={prodForm.category}
                          onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        >
                          {PRODUCT_CATEGORY_OPTIONS.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Price per Piece (RWF) *
                        </label>
                        <input
                          type="number"
                          required
                          value={prodForm.price}
                          onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                          placeholder="8000"
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Stock Quantity in Units *
                        </label>
                        <input
                          type="number"
                          required
                          value={prodForm.stock}
                          onChange={(e) => setProdForm({ ...prodForm, stock: Number(e.target.value) })}
                          placeholder="250"
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Available Sizes / Options
                        </label>
                        <input
                          type="text"
                          value={prodForm.options}
                          onChange={(e) => setProdForm({ ...prodForm, options: e.target.value })}
                          placeholder="S, M, L, XL or Matte, Glossy"
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        />
                      </div>
                    </div>

                    {/* Quick Product Image Presets */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Product Photo URL
                      </label>
                      <input
                        type="text"
                        value={prodForm.image}
                        onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                        placeholder="/image/printing_products.jpg"
                        className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] mb-1.5"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-gray-400 font-semibold self-center mr-1">Presets:</span>
                        {PRODUCT_IMAGE_PRESETS.map((p) => (
                          <button
                            key={p.url}
                            type="button"
                            onClick={() => setProdForm({ ...prodForm, image: p.url })}
                            className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                              prodForm.image === p.url
                                ? "bg-[#128C38] text-white border-[#128C38]"
                                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Customizable Toggle */}
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">
                          Client Customization Available
                        </span>
                        <span className="text-[11px] text-gray-500">
                          Customers can upload custom artwork, logo, or design files during checkout.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={prodForm.customizable}
                        onChange={(e) => setProdForm({ ...prodForm, customizable: e.target.checked })}
                        className="w-4 h-4 accent-[#128C38]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Product Specifications & Description
                      </label>
                      <textarea
                        rows={3}
                        value={prodForm.description}
                        onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                        placeholder="Material composition, GSM weight, print method, turnaround time..."
                        className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                      />
                    </div>
                  </>
                )}

                <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-bold rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#128C38] hover:bg-[#0f7230] text-white text-xs font-bold rounded transition-colors shadow-2xs"
                  >
                    {editingId ? "Update Listing" : "Publish to Marketplace"}
                  </button>
                </div>
              </div>

              {/* ── Right Column: LIVE CARD PREVIEW (Exact match to site cards) ── */}
              <div className="lg:col-span-5 sticky top-20 bg-gray-50 p-4 rounded border border-gray-200">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    Live Marketplace Card Preview
                  </span>
                  <span className="text-[10px] bg-[#128C38] text-white px-2 py-0.5 rounded font-bold">
                    {sellerMode === "ARTIST" ? "Art Gallery Card" : "Shop Product Card"}
                  </span>
                </div>

                {sellerMode === "ARTIST" ? (
                  /* ── EXACT ART GALLERY CARD PREVIEW (Matches GalleryShowcase.tsx) ── */
                  <article className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col justify-between shadow-sm">
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      <Image
                        src={artForm.image || "/image/gallery/imigongo-fusion.jpg"}
                        alt={artForm.title || "Artwork Preview"}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] font-semibold tracking-wide uppercase bg-[#0d0d0d] text-white px-2 py-0.5 rounded-xs">
                          {artForm.medium || "Acrylic on Canvas"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col justify-between flex-grow">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                          <span className="font-semibold text-gray-900">{artForm.artistName || "Artist"}</span>
                          <span className="text-gray-500">{artForm.artistCity || "Kigali"}, Rwanda</span>
                        </div>

                        <h4 className="text-sm font-bold text-gray-900 leading-snug mb-1">
                          {artForm.title || "Untitled Artwork"}
                        </h4>

                        <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed mb-3">
                          {artForm.description || "Original artwork created in Rwanda under certificate escrow."}
                        </p>

                        <div className="text-[11px] text-gray-500 space-y-1 pt-2 border-t border-gray-100">
                          <div>
                            <span className="text-gray-400">Dimensions:</span>{" "}
                            <span className="font-medium text-gray-700">{artForm.dimensions || "100 × 80 cm"}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Framing:</span>{" "}
                            <span className="font-medium text-gray-700">{artForm.framing}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase font-medium">Price</span>
                          <span className="text-base font-extrabold text-gray-900">
                            {Number(artForm.price || 0).toLocaleString()}{" "}
                            <span className="text-xs font-semibold text-gray-500">RWF</span>
                          </span>
                        </div>
                        <span className="px-3 py-1.5 border border-gray-300 text-gray-900 rounded text-xs font-bold">
                          View Piece
                        </span>
                      </div>
                    </div>
                  </article>
                ) : (
                  /* ── EXACT SHOP PRODUCT CARD PREVIEW (Matches ProductCard.tsx) ── */
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                      <Image
                        src={prodForm.image || "/image/printing_products.jpg"}
                        alt={prodForm.title || "Product Preview"}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="p-3.5 flex flex-col flex-grow justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#128C38] mb-1 uppercase tracking-wider">
                          <span>•</span>
                          <span>{prodForm.category}</span>
                        </div>

                        <p className="text-xs font-bold text-gray-900 leading-snug line-clamp-1 mb-2">
                          {prodForm.title || "Product Title"}
                        </p>

                        <div className="flex items-baseline gap-1.5 mb-2">
                          <span className="text-base font-bold text-gray-900">
                            {Number(prodForm.price || 0).toLocaleString()} RWF
                          </span>
                          <span className="text-[10px] text-gray-400">/ piece</span>
                        </div>

                        {prodForm.customizable && (
                          <span className="inline-block text-[10px] bg-emerald-50 text-[#128C38] font-bold px-2 py-0.5 rounded mb-2">
                            ✓ Customizable with Client Logo
                          </span>
                        )}
                      </div>

                      <div className="w-full text-center text-xs font-bold py-2 bg-[#128C38] text-white rounded">
                        Add to Cart
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-gray-400 text-center mt-3">
                  This card preview dynamically reflects every edit in real-time.
                </p>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal */}
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
    </>
  );
}
