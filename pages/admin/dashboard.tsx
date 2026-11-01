import { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "@/app/components/Header";
import RoleGuard from "@/app/components/RoleGuard";
import ConfirmModal from "@/app/components/ConfirmModal";
import type { ArtworkListing, ProductListing } from "../vendor/dashboard";
import AdminCategoriesManagement from "@/app/components/admin/AdminCategoriesManagement";
import AdminCheckoutSettings from "@/app/components/admin/AdminCheckoutSettings";
import {
  ProductAttribute,
  createDefaultApparelAttributes,
  calculateAttributeStock,
} from "@/lib/productAttributes";
import {
  LayoutDashboard,
  Camera,
  Video,
  Printer,
  Users,
  Image as ImageIcon,
  ShoppingBag,
  Package,
  Truck,
  SlidersHorizontal,
  Palette,
  FileText,
  Store,
  CreditCard,
  UserCheck,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Briefcase,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  LogOut,
  Layers,
  Plus,
  Search,
  Check,
  Star,
  MapPin,
  TrendingUp,
  Trash2,
  Edit,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  Bell,
  BellOff,
  Upload,
  Loader2,
} from "lucide-react";
import {
  ServiceCardItem,
  BrandBundleItem,
  getStoredServiceCards,
  saveStoredServiceCards,
  INITIAL_SERVICE_CARDS,
  getStoredBrandBundles,
  saveStoredBrandBundles,
  INITIAL_BRAND_BUNDLES,
  AVAILABLE_SERVICE_IMAGES,
} from "@/lib/servicesData";
import {
  ArtistApplication,
  getStoredArtistApplications,
  updateArtistApplicationStatus,
} from "@/lib/artistApplications";
import {
  resolveMediaUrl,
  FALLBACK_SERVICE_IMAGE,
  FALLBACK_PRODUCT_IMAGE,
  FALLBACK_ARTWORK_IMAGE,
} from "@/lib/mediaUtils";


// ─── Types ─────────────────────────────────────────────────────────────────────

interface GlobalOrder {
  id: string;
  orderNumber: string;
  buyerEmail: string;
  buyerPhone?: string;
  deliveryLocation: string;
  locationLandmark?: string;
  locationUrl?: string;
  vendorName: string;
  total: number;
  commission: number;
  status: string;
  date: string;
  category: string;
  paymentMethod?: string;
  isTestMode?: boolean;
}

interface CMSSection {
  key: string;
  label: string;
  content: string;
  lastUpdated: string;
}

interface Subscription {
  id: string;
  vendorName: string;
  plan: string;
  amount: number;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED";
  renewalDate: string;
}

// ─── Presets for Admin Direct Catalog ──────────────────────────────────────────

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
  "Corporate Gifting & Packaging",
  "Custom Stickers & Decals",
];

const ARTWORK_IMAGE_PRESETS = [
  { label: "Imigongo Modern Fusion", url: resolveMediaUrl("/image/gallery/imigongo-fusion.jpg", FALLBACK_ARTWORK_IMAGE) },
  { label: "Thousand Hills Landscape", url: resolveMediaUrl("/image/gallery/thousand-hills.jpg", FALLBACK_ARTWORK_IMAGE) },
  { label: "Kigali Urban Rhythm", url: resolveMediaUrl("/image/gallery/kigali-rhythm.jpg", FALLBACK_ARTWORK_IMAGE) },
  { label: "Mountain Gorilla Study", url: resolveMediaUrl("/image/gallery/mountain-gorilla.jpg", FALLBACK_ARTWORK_IMAGE) },
  { label: "African Woman Portrait", url: resolveMediaUrl("/image/gallery/african-woman-portrait.jpg", FALLBACK_ARTWORK_IMAGE) },
];

const PRODUCT_IMAGE_PRESETS = [
  { label: "Apparel & Print", url: "/image/printing_products.jpg" },
  { label: "Graphic Design Kit", url: "/image/graphic design tool.jpg" },
  { label: "Digital Marketing Pack", url: "/image/digital_marketing.jpg" },
];

const INITIAL_ADMIN_PRODUCTS: ProductListing[] = [
  {
    id: "aprod-1",
    type: "PRODUCT",
    title: "Premium Heavyweight Cotton Corporate Polo",
    category: "T-Shirts & Apparel",
    price: 18000,
    stock: 240,
    options: "S, M, L, XL, XXL (Navy, Black, White)",
    customizable: true,
    image: "/image/printing_products.jpg",
    images: [
      "/image/printing_products.jpg",
      "/service/Product Photography.jpeg",
      "/service/Fashion & Lifestyle Lookbooks.jpeg",
    ],
    description: "Heavyweight 220 GSM pique cotton polo shirt with embroidered company crest and customized collar accents.",
    status: "Active",
    sales: 45,
    attributes: createDefaultApparelAttributes(),
  },
  {
    id: "aprod-2",
    type: "PRODUCT",
    title: "Corporate Stationery & 500 Business Cards Pack",
    category: "Business Cards & Stationery",
    price: 185000,
    stock: 999,
    options: "Soft-Touch Matte, Spot UV, Gold Foil",
    customizable: true,
    image: "/image/graphic design tool.jpg",
    images: [
      "/image/graphic design tool.jpg",
      "/service/Business Cards & Stationery.jpeg",
      "/service/Packaging & Product Labels.jpeg",
    ],
    description: "Complete corporate identity pack including letterheads, presentation folders, and premium cards on 400 GSM silk board.",
    status: "Active",
    sales: 12,
  },
  {
    id: "aprod-3",
    type: "PRODUCT",
    title: "Outdoor Heavy-Duty Roll-Up Pull Banner (85×200 cm)",
    category: "Banners & Signage",
    price: 65000,
    stock: 50,
    options: "Aluminum Base + Padded Carry Case",
    customizable: true,
    image: "/image/digital_marketing.jpg",
    images: [
      "/image/digital_marketing.jpg",
      "/service/Large Format & Outdoor Signage.jpeg",
      "/service/Flyers, Posters & Banners.jpeg",
    ],
    description: "High-resolution tear-resistant banner with anti-glare finish and sturdy aluminum mechanism.",
    status: "Active",
    sales: 8,
  },
  {
    id: "aprod-4",
    type: "PRODUCT",
    title: "Ceramic Coffee Mug with Full Sublimation Wrap",
    category: "Mugs & Drinkware",
    price: 6000,
    stock: 180,
    options: "11 oz Glossy White, Dishwasher Safe",
    customizable: true,
    image: "/image/printing_products.jpg",
    images: [
      "/image/printing_products.jpg",
      "/service/Product Photography.jpeg",
      "/service/Custom Packaging & Boxes.jpeg",
    ],
    description: "Microwave and dishwasher safe ceramic mugs with full color vibrant wrap printing for branded corporate gifting.",
    status: "Active",
    sales: 30,
  },
];

const INITIAL_ADMIN_ARTWORKS: ArtworkListing[] = [
  {
    id: "aart-1",
    type: "ARTWORK",
    title: "Imigongo Geometric Heritage & Modern Fusion",
    artistName: "JREAL Curated Studio",
    artistCity: "Kigali",
    medium: "Imigongo Relief & Pigments on Wood",
    dimensions: "100 × 80 cm",
    framing: "Framed (Solid Wood)",
    price: 320000,
    year: "2026",
    weight: "4.5 kg",
    certificateOfAuthenticity: true,
    image: resolveMediaUrl("/image/gallery/imigongo-fusion.jpg", FALLBACK_ARTWORK_IMAGE),
    description: "Contemporary interpretation of sacred Rwandan Imigongo spiral patterns fused with organic earthy pigments.",
    status: "Published",
    sales: 2,
  },
  {
    id: "aart-2",
    type: "ARTWORK",
    title: "Thousand Hills Morning Mist (Virunga Dawn)",
    artistName: "JREAL Fine Art Collection",
    artistCity: "Musanze",
    medium: "Oil on Linen",
    dimensions: "120 × 90 cm",
    framing: "Framed (Floating Frame)",
    price: 450000,
    year: "2025",
    weight: "5.2 kg",
    certificateOfAuthenticity: true,
    image: resolveMediaUrl("/image/gallery/thousand-hills.jpg", FALLBACK_ARTWORK_IMAGE),
    description: "Large scale impressionist landscape capturing dawn over the Virunga volcanic peaks.",
    status: "Published",
    sales: 1,
  },
  {
    id: "aart-3",
    type: "ARTWORK",
    title: "Kigali Midnight Jazz & Sisal Texture",
    artistName: "JREAL Curated Studio",
    artistCity: "Kigali",
    medium: "Mixed Media & Sisal on Linen",
    dimensions: "75 × 60 cm",
    framing: "Stretched Canvas",
    price: 240000,
    year: "2026",
    weight: "2.8 kg",
    certificateOfAuthenticity: true,
    image: resolveMediaUrl("/image/gallery/kigali-rhythm.jpg", FALLBACK_ARTWORK_IMAGE),
    description: "Vibrant urban nightlife study rendered with indigenous sisal fiber textures and acrylic pigments.",
    status: "Published",
    sales: 0,
  },
];

// ─── Service Bookings & Production Orders ─────────────────────────────────────

export interface ServiceBooking {
  id: string;
  bookingRef: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceCategory: "Photography" | "Videography" | "Print";
  shootType: string;
  eventDate: string;
  location: string;
  locationLandmark?: string;
  locationUrl?: string;
  price: number;
  depositStatus: "PAID" | "PENDING_DEPOSIT" | "FULLY_PAID";
  status: "PENDING" | "CONFIRMED" | "IN_PRODUCTION" | "COMPLETED" | "CANCELLED";
  assignedStaffId: string;
  assignedStaffName: string;
  notes?: string;
  deliverablesUrl?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: "Photography" | "Videography" | "Print" | "Creative Direction";
  phone: string;
  email: string;
  status: "Available" | "On Shoot" | "In Print Production" | "On Leave";
  activeBookings: number;
}

export interface AdminPortfolioItem {
  id: string;
  title: string;
  category: "Branding" | "Photography" | "Videography" | "Printing" | "Marketing";
  clientName: string;
  image: string;
  description: string;
  year: string;
  featured: boolean;
  status: "Published" | "Draft";
}

const PORTFOLIO_CATEGORY_OPTIONS: AdminPortfolioItem["category"][] = [
  "Branding",
  "Photography",
  "Videography",
  "Printing",
  "Marketing",
];

const PORTFOLIO_IMAGE_PRESETS = [
  { label: "Graphic Design & Branding", url: resolveMediaUrl("/image/graphic design tool.jpg", FALLBACK_SERVICE_IMAGE) },
  { label: "Photography & Studio Camera", url: resolveMediaUrl("/image/comera extensions.jpg", FALLBACK_SERVICE_IMAGE) },
  { label: "Videography & Film Production", url: resolveMediaUrl("/image/videodeck.jpg", FALLBACK_SERVICE_IMAGE) },
  { label: "Printing & Merch Products", url: resolveMediaUrl("/image/printing_products.jpg", FALLBACK_SERVICE_IMAGE) },
  { label: "Digital Marketing & Campaigns", url: resolveMediaUrl("/image/digital_marketing.jpg", FALLBACK_SERVICE_IMAGE) },
  { label: "Curated Art & Imigongo", url: resolveMediaUrl("/image/gallery/imigongo-fusion.jpg", FALLBACK_ARTWORK_IMAGE) },
];

const SERVICE_TYPE_PRESETS: Record<"Photography" | "Videography" | "Print", string[]> = {
  Photography: [
    "Corporate & Executive Portraits",
    "Product Photography (E-Commerce)",
    "Event & Conference Coverage",
    "Wedding & Gusaba Traditional Ceremony",
    "Food & Restaurant Menus",
    "Real Estate & Architecture",
    "Fashion & Lifestyle Lookbooks",
  ],
  Videography: [
    "Social Media Reels & TikToks",
    "Brand Commercials & Product Demos",
    "4K Drone & Aerial Cinematography",
    "Corporate & NGO Documentaries",
    "Event Aftermovies & Recaps",
    "Explainer & Motion Graphic Videos",
  ],
  Print: [
    "Large Format Outdoor Signage & Roll-Ups",
    "Commercial Digital Printing (Flyers/Cards)",
    "High-Volume Offset Printing (Brochures/Reports)",
    "Textile, Merch & Apparel (DTF/Embroidery)",
    "Custom Packaging & Boxes",
    "Vehicle Branding & Vinyl Decals",
  ],
};

const INITIAL_STAFF: StaffMember[] = [
  {
    id: "staff-1",
    name: "Eric Mugabo",
    role: "Lead Commercial & Portrait Photographer",
    department: "Photography",
    phone: "+250 788 123 789",
    email: "eric.m@jreal.rw",
    status: "Available",
    activeBookings: 2,
  },
  {
    id: "staff-2",
    name: "Aline Kaneza",
    role: "Cinematographer & Licensed Drone Pilot",
    department: "Videography",
    phone: "+250 782 456 901",
    email: "aline.k@jreal.rw",
    status: "On Shoot",
    activeBookings: 2,
  },
  {
    id: "staff-3",
    name: "Claude Nshimiyimana",
    role: "Senior Print & Large Format Press Master",
    department: "Print",
    phone: "+250 783 789 234",
    email: "claude.n@jreal.rw",
    status: "In Print Production",
    activeBookings: 1,
  },
  {
    id: "staff-4",
    name: "Diane Umutoni",
    role: "Senior Video Editor & Colorist",
    department: "Videography",
    phone: "+250 785 112 334",
    email: "diane.u@jreal.rw",
    status: "Available",
    activeBookings: 1,
  },
  {
    id: "staff-5",
    name: "Jean-Luc Habimana",
    role: "Brand Strategist & Art Director",
    department: "Creative Direction",
    phone: "+250 788 654 321",
    email: "jeanluc@jreal.rw",
    status: "Available",
    activeBookings: 1,
  },
];

const INITIAL_BOOKINGS: ServiceBooking[] = [
  {
    id: "bk-1",
    bookingRef: "PH-8092",
    clientName: "Amani Corporate Law Firm",
    clientPhone: "+250 788 443 210",
    clientEmail: "contact@amanilaw.rw",
    serviceCategory: "Photography",
    shootType: "Corporate & Executive Portraits",
    eventDate: "2026-10-06",
    location: "Kigali Heights, 6th Floor East Wing",
    locationLandmark: "Boardroom A & Executive Balcony",
    locationUrl: "https://maps.google.com/?q=-1.9536,30.0934",
    price: 180000,
    depositStatus: "PAID",
    status: "CONFIRMED",
    assignedStaffId: "staff-1",
    assignedStaffName: "Eric Mugabo (Lead Photographer)",
    notes: "12 executives. Studio lighting setup needed. White and architectural background.",
    deliverablesUrl: "https://drive.google.com/drive/folders/amani-law-portraits",
  },
  {
    id: "bk-2",
    bookingRef: "VD-4105",
    clientName: "Inziza Coffee Roasters",
    clientPhone: "+250 782 555 777",
    clientEmail: "marketing@inzizacoffee.rw",
    serviceCategory: "Videography",
    shootType: "Brand Commercials & Social Reels",
    eventDate: "2026-10-09",
    location: "Inziza Roastery, Gikondo Industrial Park",
    locationLandmark: "Behind Bralirwa Depot, Gate 4",
    locationUrl: "https://maps.google.com/?q=-1.9723,30.0811",
    price: 350000,
    depositStatus: "PAID",
    status: "IN_PRODUCTION",
    assignedStaffId: "staff-2",
    assignedStaffName: "Aline Kaneza (Cinematographer & Drone Pilot)",
    notes: "Cinematic 4K coffee brewing, farmer interviews, and 3 vertical Instagram reels.",
    deliverablesUrl: "https://wetransfer.com/downloads/inziza-draft-cut",
  },
  {
    id: "bk-3",
    bookingRef: "PR-9921",
    clientName: "Rwanda Youth Innovation Summit",
    clientPhone: "+250 783 111 888",
    clientEmail: "summit@youthinnovate.rw",
    serviceCategory: "Print",
    shootType: "Large Format Outdoor Signage & Roll-Ups",
    eventDate: "2026-10-12",
    location: "Kigali Convention Centre, Entrance Dome",
    locationLandmark: "VIP Registration Hall #2",
    locationUrl: "https://maps.google.com/?q=-1.9545,30.0939",
    price: 620000,
    depositStatus: "PAID",
    status: "IN_PRODUCTION",
    assignedStaffId: "staff-3",
    assignedStaffName: "Claude Nshimiyimana (Senior Print Master)",
    notes: "4 heavy-duty teardrop flags, 6 roll-up banners, and 500 conference badges with lanyards.",
    deliverablesUrl: "https://drive.google.com/drive/folders/youth-summit-print-proofs",
  },
  {
    id: "bk-4",
    bookingRef: "PH-7840",
    clientName: "Clarisse Uwitonze (Wedding & Gusaba)",
    clientPhone: "+250 789 900 123",
    clientEmail: "clarisse.u@gmail.com",
    serviceCategory: "Photography",
    shootType: "Wedding & Gusaba Traditional Ceremony",
    eventDate: "2026-10-18",
    location: "Intare Conference Arena Gardens, Rusororo",
    locationLandmark: "Main Garden Pavillion near Fountain",
    locationUrl: "https://maps.google.com/?q=-1.9610,30.1780",
    price: 480000,
    depositStatus: "PAID",
    status: "CONFIRMED",
    assignedStaffId: "staff-1",
    assignedStaffName: "Eric Mugabo (Lead Photographer)",
    notes: "Full traditional Gusaba attire photos, bride entrance, and family group portraits.",
    deliverablesUrl: "",
  },
  {
    id: "bk-5",
    bookingRef: "VD-3390",
    clientName: "EcoHills Safari Lodge",
    clientPhone: "+250 788 333 444",
    clientEmail: "bookings@ecohills.rw",
    serviceCategory: "Videography",
    shootType: "4K Drone & Aerial Cinematography",
    eventDate: "2026-10-24",
    location: "EcoHills Resort, Lake Muhazi, Rwamagana",
    locationLandmark: "Lakeside Jetty & Villa Area",
    locationUrl: "https://maps.google.com/?q=-1.8752,30.3421",
    price: 550000,
    depositStatus: "PENDING_DEPOSIT",
    status: "PENDING",
    assignedStaffId: "staff-2",
    assignedStaffName: "Aline Kaneza (Cinematographer & Drone Pilot)",
    notes: "Sunrise drone shots over Lake Muhazi, luxury tent walk-through, dining experience reel.",
    deliverablesUrl: "",
  },
];

const INITIAL_PORTFOLIO: AdminPortfolioItem[] = [
  {
    id: "port-1",
    title: "Kigali Bistro Brand Identity",
    category: "Branding",
    clientName: "Patrick Mugisha (Kigali Bistro)",
    image: resolveMediaUrl("/image/graphic design tool.jpg", FALLBACK_SERVICE_IMAGE),
    description: "Complete corporate identity, menu design, employee uniforms, and storefront signage.",
    year: "2026",
    featured: true,
    status: "Published",
  },
  {
    id: "port-2",
    title: "Bank Leadership Corporate Portraits",
    category: "Photography",
    clientName: "Bank of Kigali",
    image: resolveMediaUrl("/image/comera extensions.jpg", FALLBACK_SERVICE_IMAGE),
    description: "Studio executive headshots and annual report visual collection for board members and directors.",
    year: "2025",
    featured: true,
    status: "Published",
  },
  {
    id: "port-3",
    title: "Visit Rwanda Tourism Commercial",
    category: "Videography",
    clientName: "Rwanda Tourism Board",
    image: resolveMediaUrl("/image/videodeck.jpg", FALLBACK_SERVICE_IMAGE),
    description: "Cinematic 4K aerial documentary showcasing national parks, gorilla trekking, and cultural monuments.",
    year: "2026",
    featured: true,
    status: "Published",
  },
  {
    id: "port-4",
    title: "Youth Connekt Africa Outdoor Signage",
    category: "Printing",
    clientName: "Youth Connekt Africa",
    image: resolveMediaUrl("/image/printing_products.jpg", FALLBACK_SERVICE_IMAGE),
    description: "Large scale PVC banners, stage backdrops, 1200+ badges, and stadium perimeter graphics.",
    year: "2025",
    featured: false,
    status: "Published",
  },
  {
    id: "port-5",
    title: "TechHub Kigali Digital Growth Campaign",
    category: "Marketing",
    clientName: "TechHub Kigali",
    image: resolveMediaUrl("/image/digital_marketing.jpg", FALLBACK_SERVICE_IMAGE),
    description: "End-to-end 3-month digital campaign driving 350+ startup registrations with high-converting social ads.",
    year: "2026",
    featured: false,
    status: "Published",
  },
  {
    id: "port-6",
    title: "Artisanal Rwandan Coffee Packaging",
    category: "Branding",
    clientName: "Rwanda Bean Collective",
    image: resolveMediaUrl("/image/graphic design tool.jpg", FALLBACK_SERVICE_IMAGE),
    description: "Eco-friendly kraft paper pouches with foil-stamped Imigongo embossed patterns for European export.",
    year: "2026",
    featured: true,
    status: "Draft",
  },
];

const TAB_META: Record<
  string,
  { title: string; subtitle: string; category: string }
> = {
  overview: {
    title: "Dashboard Overview",
    subtitle: "High-level platform metrics, service operations, and recent orders.",
    category: "Operations",
  },
  categories: {
    title: "Categories & Homepage Slider",
    subtitle: "Curate product categories and featured cards on the homepage carousel.",
    category: "Store & Merch",
  },
  bookings: {
    title: "Service Bookings",
    subtitle: "Client bookings, crew dispatch, and production deliverables.",
    category: "Services & Studio",
  },
  staff: {
    title: "Staff & Crew",
    subtitle: "Creative specialists, field operators, and equipment availability.",
    category: "Services & Studio",
  },
  portfolio: {
    title: "Portfolio Showcases",
    subtitle: "Showcase client projects across branding, photo, video, and print.",
    category: "Services & Studio",
  },
  orders: {
    title: "Store Orders",
    subtitle: "All orders across direct store and platform merchants.",
    category: "Store & Merch",
  },
  products: {
    title: "Store Products",
    subtitle: "Commercial inventory, merchandise, and customized products.",
    category: "Store & Merch",
  },
  gallery: {
    title: "Curated Art Gallery",
    subtitle: "Original curated artworks, medium specifications, and certificates.",
    category: "Art Gallery",
  },
  artist_applications: {
    title: "Artist Representation Applications",
    subtitle: "Curatorial review queue, artist verification, and studio portal access approvals.",
    category: "Art Gallery",
  },
  cms: {
    title: "Content Management",
    subtitle: "Public website copy for homepage hero, about, and services.",
    category: "Platform",
  },
  sellers: {
    title: "Sellers & Vendors",
    subtitle: "Verified merchant accounts, listings, and platform status.",
    category: "Platform",
  },
  subscriptions: {
    title: "Subscriptions",
    subtitle: "Active and pending vendor recurring billing plans.",
    category: "Platform",
  },
  services_cards: {
    title: "Service Pages & Cards",
    subtitle: "Manage, edit, add, and delete service cards across Graphic Design, Photography, Videography, Printing, and Digital Marketing.",
    category: "Services & Studio",
  },
  branding_bundles: {
    title: "Brand Bundles & Identity Packages",
    subtitle: "Configure pricing, checklist features, and descriptions for all-inclusive brand bundles (Startup Starter, Business Growth, Enterprise 360°).",
    category: "Services & Studio",
  },
  users: {
    title: "User Accounts",
    subtitle: "Platform accounts across customers, sellers, and administrators.",
    category: "Platform",
  },
  checkout_settings: {
    title: "Checkout Delivery & Payment Methods",
    subtitle: "Manage, configure, and customize delivery options, shipping fees, and payment channels for checkout.",
    category: "Platform",
  },
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<
    | "overview"
    | "categories"
    | "bookings"
    | "staff"
    | "portfolio"
    | "orders"
    | "products"
    | "gallery"
    | "artist_applications"
    | "cms"
    | "sellers"
    | "subscriptions"
    | "users"
    | "services_cards"
    | "branding_bundles"
    | "checkout_settings"
  >("overview");
  const [loading, setLoading] = useState(false);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [sectionContent, setSectionContent] = useState("");
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // In-app Confirmation Modal State (replaces all browser confirms)
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

  // Modal Error States (replaces all browser alerts with clean inline alerts)
  const [listingModalError, setListingModalError] = useState<string | null>(null);
  const [bookingModalError, setBookingModalError] = useState<string | null>(null);
  const [staffModalError, setStaffModalError] = useState<string | null>(null);
  const [portfolioModalError, setPortfolioModalError] = useState<string | null>(null);
  const [cardModalError, setCardModalError] = useState<string | null>(null);
  const [bundleModalError, setBundleModalError] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [assetUploadFeedback, setAssetUploadFeedback] = useState<string | null>(null);

  // ─── Left Sidebar Navigation State ──────────────────────────────────────────
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [openNavGroups, setOpenNavGroups] = useState<Record<string, boolean>>({
    services: true,
    store: true,
    gallery: true,
    platform: false,
  });

  const toggleNavGroup = (groupId: string) => {
    setOpenNavGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleSelectNav = (
    targetTab: typeof tab,
    options?: {
      bookingCat?: string;
      productCat?: string;
      artworkMedium?: string;
      serviceCardCat?: string;
    }
  ) => {
    setTab(targetTab);
    if (options?.bookingCat !== undefined) setBookingCategoryFilter(options.bookingCat);
    if (options?.productCat !== undefined) setProductCatFilter(options.productCat);
    if (options?.artworkMedium !== undefined) setArtworkMediumFilter(options.artworkMedium);
    if (options?.serviceCardCat !== undefined) setServiceCardCatFilter(options.serviceCardCat);
    setIsMobileSidebarOpen(false);
  };

  // Direct JREAL Catalog: Commercial Products & Curated Fine Art
  const [products, setProducts] = useState<ProductListing[]>(INITIAL_ADMIN_PRODUCTS);
  const [artworks, setArtworks] = useState<ArtworkListing[]>(INITIAL_ADMIN_ARTWORKS);
  const [productSearch, setProductSearch] = useState("");
  const [productCatFilter, setProductCatFilter] = useState("All");
  const [artworkSearch, setArtworkSearch] = useState("");
  const [artworkMediumFilter, setArtworkMediumFilter] = useState("All");

  // ─── Service Bookings (Photography, Videography, Print Orders) ───
  const [bookings, setBookings] = useState<ServiceBooking[]>(INITIAL_BOOKINGS);
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState("All");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("All");
  const [bookingStaffFilter, setBookingStaffFilter] = useState("All");
  const [copiedBookingId, setCopiedBookingId] = useState<string | null>(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState<Omit<ServiceBooking, "id">>({
    bookingRef: "",
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    serviceCategory: "Photography",
    shootType: "Corporate & Executive Portraits",
    eventDate: new Date().toISOString().slice(0, 10),
    location: "",
    locationLandmark: "",
    locationUrl: "",
    price: 180000,
    depositStatus: "PAID",
    status: "CONFIRMED",
    assignedStaffId: "staff-1",
    assignedStaffName: "Eric Mugabo (Lead Photographer)",
    notes: "",
    deliverablesUrl: "",
  });

  // ─── Creative Crew & Staff Management ───
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [staffSearch, setStaffSearch] = useState("");
  const [staffDeptFilter, setStaffDeptFilter] = useState("All");
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState<Omit<StaffMember, "id" | "activeBookings">>({
    name: "",
    role: "",
    department: "Photography",
    phone: "",
    email: "",
    status: "Available",
  });

  // ─── Portfolio Showcase Management (CRUD) ───
  const [portfolioItemsList, setPortfolioItemsList] = useState<AdminPortfolioItem[]>(INITIAL_PORTFOLIO);
  const [portfolioSearch, setPortfolioSearch] = useState("");
  const [portfolioCatFilter, setPortfolioCatFilter] = useState("All");
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [portfolioForm, setPortfolioForm] = useState<Omit<AdminPortfolioItem, "id">>({
    title: "",
    category: "Branding",
    clientName: "",
    image: "/image/graphic design tool.jpg",
    description: "",
    year: "2026",
    featured: false,
    status: "Published",
  });

  // ─── Service Cards Management (CRUD across Graphic Design, Photography, Videography, Printing, Marketing, Branding) ───
  const [serviceCardsList, setServiceCardsList] = useState<ServiceCardItem[]>(INITIAL_SERVICE_CARDS);
  const [serviceCardCatFilter, setServiceCardCatFilter] = useState<string>("all");
  const [serviceCardSearch, setServiceCardSearch] = useState("");
  const [isServiceCardModalOpen, setIsServiceCardModalOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState<Omit<ServiceCardItem, "id">>({
    category: "design",
    title: "",
    description: "",
    priceOrRate: "",
    badge: "",
    image: AVAILABLE_SERVICE_IMAGES[0]?.path || FALLBACK_SERVICE_IMAGE,
    popular: false,
  });
  const [isUploadingCardImage, setIsUploadingCardImage] = useState(false);
  const [isUploadingArtImage, setIsUploadingArtImage] = useState(false);
  const [isUploadingPortfolioImage, setIsUploadingPortfolioImage] = useState(false);

  // ─── Brand Bundles Management (CRUD: Startup Starter, Business Growth, Enterprise 360) ───
  const [brandBundlesList, setBrandBundlesList] = useState<BrandBundleItem[]>(INITIAL_BRAND_BUNDLES);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [bundleForm, setBundleForm] = useState<Omit<BrandBundleItem, "id">>({
    name: "",
    price: "",
    popular: false,
    description: "",
    includes: [],
  });
  const [newFeatureText, setNewFeatureText] = useState("");

  // Modal State for Add / Edit with Live Card Preview
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"PRODUCT" | "ARTWORK">("PRODUCT");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [prodForm, setProdForm] = useState<Omit<ProductListing, "id" | "sales" | "type">>({
    title: "",
    category: "T-Shirts & Apparel",
    price: 18000,
    stock: 100,
    options: "S, M, L, XL",
    customizable: true,
    image: "/image/printing_products.jpg",
    images: ["/image/printing_products.jpg", "/service/Product Photography.jpeg"],
    description: "",
    status: "Active",
    attributes: createDefaultApparelAttributes(),
  });

  const [artForm, setArtForm] = useState<Omit<ArtworkListing, "id" | "sales" | "type">>({
    title: "",
    artistName: "JREAL Curated Studio",
    artistCity: "Kigali",
    medium: "Imigongo Relief & Pigments",
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

  // ─── Live Order Biping & Alert Notification State ─────────────────────────────
  const [newOrderAlertCount, setNewOrderAlertCount] = useState<number>(0);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  // Play subtle 2-tone chime ("biping") using native Web Audio API
  const playOrderBeep = (force?: boolean) => {
    if (isSoundMuted && !force) return;
    try {
      if (typeof window === "undefined") return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Tone 1: 587.33 Hz (D5) - gentle bell attack
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.08, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.25);

      // Tone 2: 880 Hz (A5) - clear chime resonance
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0.09, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.45);
    } catch {}
  };

  const toggleSound = () => {
    setIsSoundMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("jreal_admin_sound_muted", String(next));
      } catch {}
      if (!next) {
        // Play sample confirmation chime upon enabling
        playOrderBeep(true);
      }
      return next;
    });
  };

  // Load sound preference on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jreal_admin_sound_muted");
      if (saved === "true") setIsSoundMuted(true);
    } catch {}
  }, []);

  // Automatically reset live new order alert count when admin views orders tab
  useEffect(() => {
    if (tab === "orders") {
      setNewOrderAlertCount(0);
    }
  }, [tab]);

  const [orders, setOrders] = useState<GlobalOrder[]>([
    {
      id: "go-1",
      orderNumber: "JV-2041",
      buyerEmail: "eric.mugabo@company.rw",
      buyerPhone: "+250 788 123 456",
      deliveryLocation: "KG 14 Ave, near Eco-Bank, Kicukiro",
      locationLandmark: "Opposite Eco-Bank, Black Gate #12",
      locationUrl: "https://maps.google.com/?q=-1.9705,30.1044",
      vendorName: "Urukundo Studio",
      total: 185000,
      commission: 27750,
      status: "IN_PRODUCTION",
      date: "2026-09-28",
      category: "Branding",
    },
    {
      id: "go-2",
      orderNumber: "JV-2038",
      buyerEmail: "amina.hirwa@mail.rw",
      buyerPhone: "+250 782 987 654",
      deliveryLocation: "KG 9 Ave, Nyarutarama, Gasabo",
      locationLandmark: "Near MTN Centre, 2nd turn right",
      locationUrl: "https://maps.google.com/?q=-1.9365,30.1030",
      vendorName: "Kigali Print House",
      total: 450000,
      commission: 67500,
      status: "DELIVERED",
      date: "2026-09-22",
      category: "Branding",
    },
    {
      id: "go-3",
      orderNumber: "JV-2029",
      buyerEmail: "jp.rukundo@corp.rw",
      buyerPhone: "+250 783 555 111",
      deliveryLocation: "KN 2 Roundabout, Grand Pension Plaza Fl 4",
      locationLandmark: "Commercial Bank reception desk",
      locationUrl: "https://maps.google.com/?q=-1.9441,30.0619",
      vendorName: "JREAL VISION (Direct)",
      total: 320000,
      commission: 48000,
      status: "IN_TRANSIT",
      date: "2026-09-20",
      category: "Fine Art",
    },
    {
      id: "go-4",
      orderNumber: "JV-2015",
      buyerEmail: "claire.uwase@studio.rw",
      buyerPhone: "+250 785 222 333",
      deliveryLocation: "KK 15 Rd, Niboye, Kicukiro",
      locationLandmark: "Green apartment complex, door B2",
      locationUrl: "https://maps.google.com/?q=-1.9821,30.1012",
      vendorName: "Lens & Light Photography",
      total: 80000,
      commission: 12000,
      status: "COMPLETED",
      date: "2026-09-10",
      category: "Photography",
    },
  ]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === "PENDING" || o.status === "IN_PRODUCTION").length;
  }, [orders]);

  const copyOrderLocation = (o: GlobalOrder) => {
    const text = `${o.buyerEmail} (${o.buyerPhone || "N/A"})\nLocation: ${o.deliveryLocation}${
      o.locationLandmark ? `\nLandmark: ${o.locationLandmark}` : ""
    }${o.locationUrl ? `\nMap Link: ${o.locationUrl}` : ""}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedOrderId(o.id);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  const shareOrderLocation = async (o: GlobalOrder) => {
    const shareText = `Delivery for ${o.buyerEmail} (${o.buyerPhone || "N/A"}): ${o.deliveryLocation}.${
      o.locationLandmark ? ` Landmark: ${o.locationLandmark}.` : ""
    }`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Delivery #${o.orderNumber}`,
          text: shareText,
          url: o.locationUrl || undefined,
        });
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }
    const fullMsg = `*JREAL ADMIN DELIVERY DISPATCH — Order #${o.orderNumber}*\nBuyer: ${o.buyerEmail} (${
      o.buyerPhone || "N/A"
    })\nAddress: ${o.deliveryLocation}\n${o.locationLandmark ? `Landmark: ${o.locationLandmark}\n` : ""}${
      o.locationUrl ? `Google Maps: ${o.locationUrl}` : ""
    }`;
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMsg)}`, "_blank", "noopener,noreferrer");
  };

  const [cmsSections, setCmsSections] = useState<CMSSection[]>([
    {
      key: "hero",
      label: "Homepage — Hero headline",
      content: "Premium creative services and design, built in Kigali.",
      lastUpdated: "2026-09-30",
    },
    {
      key: "about",
      label: "About page — Mission statement",
      content: "JREAL VISION DESIGN is a Rwandan creative studio and marketplace delivering end-to-end brand identity, art, and print solutions.",
      lastUpdated: "2026-09-18",
    },
    {
      key: "services",
      label: "Services page — Intro copy",
      content: "From bespoke branding and fine art procurement to commercial print and photography, we deliver creative work that means something.",
      lastUpdated: "2026-09-25",
    },
    {
      key: "hotdeals",
      label: "Hot deals — Banner message",
      content: "End of quarter offers on branding packages. Up to 20% off selected corporate identity suites until 15 October.",
      lastUpdated: "2026-09-29",
    },
    {
      key: "portfolio",
      label: "Portfolio — Featured caption",
      content: "A selection of identity, art direction, and print work delivered for clients across East Africa and the diaspora.",
      lastUpdated: "2026-09-12",
    },
  ]);

  const [sellers, setSellers] = useState([
    { id: "s-1", name: "Urukundo Studio", email: "merchant.demo@jreal.rw", plan: "Creator", products: 4, sales: 3, status: "ACTIVE" },
    { id: "s-2", name: "Kigali Print House", email: "print@kph.rw", plan: "Pro Seller", products: 12, sales: 28, status: "ACTIVE" },
    { id: "s-3", name: "Lens & Light Photography", email: "lens@light.rw", plan: "Starter", products: 2, sales: 7, status: "ACTIVE" },
    { id: "s-4", name: "Ink & Motion Design", email: "iam.design@rw.rw", plan: "Creator", products: 6, sales: 0, status: "SUSPENDED" },
  ]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    { id: "sub-1", vendorName: "Urukundo Studio", plan: "Creator", amount: 15000, status: "ACTIVE", renewalDate: "2026-10-28" },
    { id: "sub-2", vendorName: "Kigali Print House", plan: "Pro Seller", amount: 40000, status: "ACTIVE", renewalDate: "2026-10-15" },
    { id: "sub-3", vendorName: "Lens & Light Photography", plan: "Starter", amount: 0, status: "ACTIVE", renewalDate: "—" },
    { id: "sub-4", vendorName: "Ink & Motion Design", plan: "Creator", amount: 15000, status: "PAST_DUE", renewalDate: "2026-09-10" },
  ]);

  const [usersList, setUsersList] = useState<any[]>([
    { id: "u-1", name: "Eric Mugabo", email: "eric.mugabo@company.rw", role: "Customer", joined: "2026-03-14" },
    { id: "u-2", name: "Urukundo Studio", email: "merchant.demo@jreal.rw", role: "Seller", joined: "2026-04-02" },
    { id: "u-3", name: "Amina Hirwa", email: "amina.hirwa@mail.rw", role: "Customer", joined: "2026-05-20" },
    { id: "u-4", name: "Kigali Print House", email: "print@kph.rw", role: "Seller", joined: "2026-02-10" },
    { id: "u-5", name: "Platform Owner", email: "owner.director@jreal.rw", role: "Admin", joined: "2025-11-01" },
  ]);

  // ── Artist Applications & Representation Review State ──
  const [artistApps, setArtistApps] = useState<ArtistApplication[]>([]);
  const [artistAppFilter, setArtistAppFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "DECLINED">("ALL");
  const [artistAppSearch, setArtistAppSearch] = useState("");
  const [selectedAppModal, setSelectedAppModal] = useState<ArtistApplication | null>(null);
  const [approvingAppId, setApprovingAppId] = useState<string | null>(null);
  const [approvalBannerMsg, setApprovalBannerMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setUser(d.user || null))
      .catch(() =>
        setUser({ id: "demo-a", name: "Platform Owner", email: "owner.director@jreal.rw", role: "ADMIN" })
      )
      .finally(() => setLoading(false));

    // ── Fetch products from Supabase DB ──
    fetch("/api/products?all=true&nocache=true")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          const mappedProducts: ProductListing[] = data.products.map((p: any) => ({
            id: p.id,
            type: "PRODUCT",
            title: p.name || p.title,
            category: p.category || "Store",
            price: Number(p.price) || 0,
            stock: p.stock ?? 100,
            options: "Standard",
            customizable: true,
            image: Array.isArray(p.images) && p.images[0] ? p.images[0] : (p.image || "/image/printing_products.jpg"),
            description: p.description || "",
            status: p.active !== false ? "Active" : "Draft",
            sales: 0,
            attributes: p.attributes || [],
          }));
          setProducts(mappedProducts);
        }
      })
      .catch((err) => console.warn("[products load warning]:", err));

    // ── Fetch all orders from Supabase DB ──
    fetch("/api/orders?all=true")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.orders && Array.isArray(data.orders) && data.orders.length > 0) {
          const mappedOrders: GlobalOrder[] = data.orders.map((o: any) => ({
            id: o.id,
            orderNumber: o.orderNumber || o.id.slice(-6).toUpperCase(),
            buyerEmail: o.customer?.email || o.buyerEmail || "customer@jreal.rw",
            buyerPhone: o.customer?.phone || o.buyerPhone || "",
            deliveryLocation: o.shippingAddress || o.deliveryLocation || "Kigali",
            locationLandmark: o.shippingCity || o.locationLandmark || "",
            locationUrl: o.locationUrl || o.notes?.match(/https:\/\/[^\s\]]+/)?.[0] || "",
            vendorName: o.vendorName || "JREAL Studio",
            total: Number(o.total) || 0,
            commission: Math.round((Number(o.total) || 0) * 0.15),
            status: o.status || "PENDING",
            date: o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            category: o.category || o.items?.[0]?.product?.category || "Direct Store",
            paymentMethod: o.paymentMethod || o.payments?.[0]?.method || "MTN MoMo",
            isTestMode: Boolean(o.isTestMode || o.notes?.includes("TEST") || o.paymentMethod?.toLowerCase().includes("test")),
          }));

          // Merge with local recent orders from test simulation
          try {
            const rawLocal = localStorage.getItem("jreal_recent_orders");
            if (rawLocal) {
              const parsedLocal: GlobalOrder[] = JSON.parse(rawLocal);
              const existingIds = new Set(mappedOrders.map((x) => x.id));
              const existingNums = new Set(mappedOrders.map((x) => x.orderNumber));
              const extraLocal = parsedLocal.filter((x) => !existingIds.has(x.id) && !existingNums.has(x.orderNumber));
              setOrders([...extraLocal, ...mappedOrders]);
              return;
            }
          } catch {}

          setOrders(mappedOrders);
        }
      })
      .catch((err) => console.warn("[orders load warning]:", err));

    // ── Fetch all bookings from Supabase DB ──
    fetch("/api/bookings?all=true")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.bookings && Array.isArray(data.bookings) && data.bookings.length > 0) {
          const mappedBookings: ServiceBooking[] = data.bookings.map((b: any) => {
            const rawCat = (b.service?.category || "").toLowerCase();
            const catName: "Photography" | "Videography" | "Print" =
              rawCat.includes("video") ? "Videography" : rawCat.includes("print") ? "Print" : "Photography";
            return {
              id: b.id,
              bookingRef: `BK-${b.id.slice(-4).toUpperCase()}`,
              clientName: b.customer?.name || "Client",
              clientPhone: b.customer?.phone || "+250 ",
              clientEmail: b.customer?.email || "",
              serviceCategory: catName,
              shootType: b.service?.name || "Creative Shoot",
              eventDate: b.date ? new Date(b.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
              location: b.location || "Kigali",
              locationLandmark: "",
              locationUrl: "",
              price: b.service?.basePrice || 180000,
              depositStatus: "PAID",
              status: (b.status === "REQUESTED" ? "PENDING" : b.status) as any,
              assignedStaffId: "staff-1",
              assignedStaffName: "Eric Mugabo (Lead Photographer)",
              notes: b.notes || "",
              deliverablesUrl: "",
            };
          });
          setBookings(mappedBookings);
        }
      })
      .catch((err) => console.warn("[bookings load warning]:", err));

    // ── Fetch user accounts from Supabase DB ──
    fetch("/api/admin/users?key=admin-nexus")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.users && Array.isArray(data.users) && data.users.length > 0) {
          const mappedUsers = data.users.map((u: any) => ({
            id: u.id,
            name: u.name || "User",
            email: u.email,
            phone: u.phone,
            role: u.role ? (u.role.charAt(0).toUpperCase() + u.role.slice(1).toLowerCase()) : "Customer",
            joined: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : "2026",
          }));
          setUsersList(mappedUsers);
        }
      })
      .catch((err) => console.warn("[users load warning]:", err));

    // ── Fetch curated artworks from Supabase DB or local storage fallback ──
    fetch("/api/artworks")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.artworks && Array.isArray(data.artworks) && data.artworks.length > 0) {
          const mappedArt: ArtworkListing[] = data.artworks.map((a: any) => ({
            id: a.id,
            type: "ARTWORK",
            title: a.title,
            artistName: a.artistName || "JREAL Curated Studio",
            artistCity: a.artistCity || "Kigali",
            medium: a.medium || "Acrylic on Canvas",
            dimensions: a.dimensions || "100 x 80 cm",
            framing: a.framing || "Framed (Solid Wood)",
            price: Number(a.price) || 0,
            year: a.year || "2026",
            weight: a.weight || "3.5 kg",
            certificateOfAuthenticity: a.certificateOfAuthenticity !== false,
            image: resolveMediaUrl(a.images?.front || a.image, FALLBACK_ARTWORK_IMAGE),
            description: a.description || "",
            status: a.status || "Published",
            sales: 0,
          }));
          setArtworks(mappedArt);
        } else {
          try {
            const rawArt = localStorage.getItem("jreal_admin_artworks_v1");
            if (rawArt) {
              const parsed = JSON.parse(rawArt);
              if (Array.isArray(parsed) && parsed.length > 0) setArtworks(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {
        try {
          const rawArt = localStorage.getItem("jreal_admin_artworks_v1");
          if (rawArt) {
            const parsed = JSON.parse(rawArt);
            if (Array.isArray(parsed) && parsed.length > 0) setArtworks(parsed);
          }
        } catch {}
      });

    // ── Load persisted bookings, staff members & portfolio showcases ──
    try {
      const rawBk = localStorage.getItem("jreal_service_bookings");
      if (rawBk) {
        const parsed = JSON.parse(rawBk);
        if (Array.isArray(parsed) && parsed.length > 0) setBookings(parsed);
      }
    } catch {}

    try {
      const rawStaff = localStorage.getItem("jreal_staff_members");
      if (rawStaff) {
        const parsed = JSON.parse(rawStaff);
        if (Array.isArray(parsed) && parsed.length > 0) setStaffList(parsed);
      }
    } catch {}

    try {
      const rawPort = localStorage.getItem("jreal_portfolio_items");
      if (rawPort) {
        const parsed = JSON.parse(rawPort);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const migrated = parsed.map((p: any) => ({
            ...p,
            image: resolveMediaUrl(p.image, PORTFOLIO_IMAGE_PRESETS[0]?.url || FALLBACK_SERVICE_IMAGE),
          }));
          setPortfolioItemsList(migrated);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    const syncServicesData = () => {
      setServiceCardsList(getStoredServiceCards());
      setBrandBundlesList(getStoredBrandBundles());
    };
    const syncArtistApps = () => {
      setArtistApps(getStoredArtistApplications());
    };
    const syncOrders = (shouldChime = false) => {
      try {
        const rawLocal = localStorage.getItem("jreal_recent_orders");
        if (rawLocal) {
          const parsedLocal: GlobalOrder[] = JSON.parse(rawLocal);
          if (Array.isArray(parsedLocal) && parsedLocal.length > 0) {
            setOrders((prev) => {
              const existingIds = new Set(prev.map((o) => o.id));
              const existingNums = new Set(prev.map((o) => o.orderNumber));
              const newOrders = parsedLocal.filter(
                (po) => !existingIds.has(po.id) && !existingNums.has(po.orderNumber)
              );
              if (newOrders.length > 0) {
                if (shouldChime) {
                  setNewOrderAlertCount((c) => c + newOrders.length);
                  playOrderBeep();
                }
                return [...newOrders, ...prev];
              }
              return prev;
            });
          }
        }
      } catch (err) {}
    };

    syncServicesData();
    syncArtistApps();
    syncOrders(false);

    const onOrdersUpdated = () => syncOrders(true);

    window.addEventListener("jreal_services_updated", syncServicesData);
    window.addEventListener("jreal_bundles_updated", syncServicesData);
    window.addEventListener("jreal_artist_applications_updated", syncArtistApps);
    window.addEventListener("jreal_orders_updated", onOrdersUpdated);

    // Background polling every 12 seconds to detect newly placed orders in DB or test cache
    const pollInterval = setInterval(() => {
      syncOrders(true);

      fetch("/api/orders?all=true")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.orders && Array.isArray(data.orders) && data.orders.length > 0) {
            setOrders((prev) => {
              const existingIds = new Set(prev.map((o) => o.id));
              const existingNums = new Set(prev.map((o) => o.orderNumber));
              const incomingNew: GlobalOrder[] = [];
              for (const o of data.orders) {
                const num = o.orderNumber || o.id.slice(-6).toUpperCase();
                if (!existingIds.has(o.id) && !existingNums.has(num)) {
                  incomingNew.push({
                    id: o.id,
                    orderNumber: num,
                    buyerEmail: o.customer?.email || o.buyerEmail || "customer@jreal.rw",
                    buyerPhone: o.customer?.phone || o.buyerPhone || "",
                    deliveryLocation: o.shippingAddress || o.deliveryLocation || "Kigali",
                    locationLandmark: o.shippingCity || o.locationLandmark || "",
                    locationUrl: o.locationUrl || o.notes?.match(/https:\/\/[^\s\]]+/)?.[0] || "",
                    vendorName: o.vendorName || "JREAL Studio",
                    total: Number(o.total) || 0,
                    commission: Math.round((Number(o.total) || 0) * 0.15),
                    status: o.status || "PENDING",
                    date: o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
                    category: o.category || o.items?.[0]?.product?.category || "Direct Store",
                    paymentMethod: o.paymentMethod || o.payments?.[0]?.method || "MTN MoMo",
                    isTestMode: Boolean(o.isTestMode || o.notes?.includes("TEST") || o.paymentMethod?.toLowerCase().includes("test")),
                  });
                }
              }

              if (incomingNew.length > 0) {
                setNewOrderAlertCount((c) => c + incomingNew.length);
                playOrderBeep();
                return [...incomingNew, ...prev];
              }
              return prev;
            });
          }
        })
        .catch(() => {});
    }, 12000);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("jreal_services_updated", syncServicesData);
      window.removeEventListener("jreal_bundles_updated", syncServicesData);
      window.removeEventListener("jreal_artist_applications_updated", syncArtistApps);
      window.removeEventListener("jreal_orders_updated", onOrdersUpdated);
    };
  }, []);

  const handleApproveArtist = async (app: ArtistApplication) => {
    setApprovingAppId(app.id);
    setApprovalBannerMsg(null);
    try {
      const res = await fetch("/api/artists/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: app.id,
          email: app.email,
          name: app.name,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to approve artist application");
      }

      updateArtistApplicationStatus(app.id, "APPROVED", user?.name || "Platform Owner");
      setArtistApps((prev) =>
        prev.map((a) =>
          a.id === app.id
            ? {
                ...a,
                status: "APPROVED",
                reviewedAt: new Date().toISOString(),
                reviewedBy: user?.name || "Platform Owner",
              }
            : a
        )
      );

      setApprovalBannerMsg(
        `Artist "${app.name}" approved! Official welcome notification & portal credentials email sent to ${app.email}.`
      );
      setTimeout(() => setApprovalBannerMsg(null), 8000);
    } catch (err: any) {
      alert(err.message || "Failed to approve artist.");
    } finally {
      setApprovingAppId(null);
    }
  };

  const handleDeclineArtist = (app: ArtistApplication) => {
    setConfirmModal({
      isOpen: true,
      title: "Decline Artist Application",
      message: `Are you sure you want to decline the representation application from "${app.name}" (${app.medium})?`,
      confirmLabel: "Decline Application",
      variant: "warning",
      onConfirm: () => {
        updateArtistApplicationStatus(app.id, "DECLINED", user?.name || "Platform Owner");
        setArtistApps((prev) =>
          prev.map((a) =>
            a.id === app.id
              ? {
                  ...a,
                  status: "DECLINED",
                  reviewedAt: new Date().toISOString(),
                  reviewedBy: user?.name || "Platform Owner",
                }
              : a
          )
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const logout = async () => {
    await fetch("/api/auth/me", { method: "POST" }).catch(() => {});
    router.push("/login");
  };

  const saveCmsSection = (key: string) => {
    setCmsSections((s) =>
      s.map((x) =>
        x.key === key
          ? { ...x, content: sectionContent, lastUpdated: new Date().toISOString().slice(0, 10) }
          : x
      )
    );
    setEditSection(null);
  };

  const toggleSeller = (id: string) =>
    setSellers((s) =>
      s.map((x) =>
        x.id === id ? { ...x, status: x.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } : x
      )
    );

  // ─── CRUD Handlers: Direct Products & Artworks ──────────────────────────────

  const openAddProduct = () => {
    router.push("/admin/products/new");
  };

  const openAddArtwork = () => {
    setEditingId(null);
    setListingModalError(null);
    setModalType("ARTWORK");
    setArtForm({
      title: "",
      artistName: "JREAL Curated Studio",
      artistCity: "Kigali",
      medium: "Imigongo Relief & Pigments",
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
    setIsModalOpen(true);
  };

  const openEditProduct = (item: ProductListing) => {
    router.push(`/admin/products/edit?id=${item.id}`);
  };

  const openEditArtwork = (item: ArtworkListing) => {
    setEditingId(item.id);
    setListingModalError(null);
    setModalType("ARTWORK");
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
    setIsModalOpen(true);
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalType === "PRODUCT") {
      if (!prodForm.title.trim() || !prodForm.price) {
        setListingModalError("Please enter a product title and price.");
        return;
      }
      const coverImg = prodForm.image || prodForm.images?.[0] || "/image/printing_products.jpg";
      const allImgs = prodForm.images && prodForm.images.length > 0 ? prodForm.images : [coverImg];

      if (editingId) {
        setProducts((prev) => {
          const updated = prev.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  ...prodForm,
                  image: coverImg,
                  images: allImgs,
                  price: Number(prodForm.price),
                  attributes: prodForm.attributes,
                }
              : p
          );
          try {
            localStorage.setItem("jreal_admin_products_v1", JSON.stringify(updated));
            window.dispatchEvent(new Event("jreal_products_updated"));
          } catch (e) {}
          return updated;
        });
        fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingId,
            name: prodForm.title,
            category: prodForm.category,
            price: Number(prodForm.price),
            stock: Number(prodForm.stock),
            description: prodForm.description,
            image: coverImg,
            images: allImgs,
            active: prodForm.status === "Active",
            attributes: prodForm.attributes,
          }),
        }).catch((err) => console.warn("Failed to update product in DB:", err));
      } else {
        const tempId = `aprod-${Date.now()}`;
        const newP: ProductListing = {
          id: tempId,
          type: "PRODUCT",
          ...prodForm,
          image: coverImg,
          images: allImgs,
          price: Number(prodForm.price),
          sales: 0,
          attributes: prodForm.attributes,
        };
        setProducts((prev) => {
          const updated = [newP, ...prev];
          try {
            localStorage.setItem("jreal_admin_products_v1", JSON.stringify(updated));
            window.dispatchEvent(new Event("jreal_products_updated"));
          } catch (e) {}
          return updated;
        });

        fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: prodForm.title,
            category: prodForm.category,
            price: Number(prodForm.price),
            stock: Number(prodForm.stock),
            description: prodForm.description,
            image: coverImg,
            images: allImgs,
            active: prodForm.status === "Active",
            attributes: prodForm.attributes,
          }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.product) {
              setProducts((prev) => {
                const updated = prev.map((p) =>
                  p.id === tempId
                    ? {
                        ...p,
                        id: data.product.id,
                        title: data.product.name,
                        image: coverImg,
                        images: allImgs,
                        attributes: prodForm.attributes,
                      }
                    : p
                );
                try {
                  localStorage.setItem("jreal_admin_products_v1", JSON.stringify(updated));
                } catch (e) {}
                return updated;
              });
            }
          })
          .catch((err) => console.warn("Failed to persist new product:", err));
      }
    } else {
      if (!artForm.title.trim() || !artForm.price) {
        setListingModalError("Please enter artwork title and price.");
        return;
      }
      const resolvedArtImage = resolveMediaUrl(artForm.image, FALLBACK_ARTWORK_IMAGE);
      const artPayload = {
        ...artForm,
        image: resolvedArtImage,
        price: Number(artForm.price),
      };

      if (editingId) {
        setArtworks((prev) => {
          const updated = prev.map((a) =>
            a.id === editingId ? { ...a, ...artPayload } : a
          );
          try {
            localStorage.setItem("jreal_admin_artworks_v1", JSON.stringify(updated));
          } catch {}
          return updated;
        });
        fetch("/api/artworks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...artPayload }),
        }).catch((err) => console.warn("Failed to update artwork in DB:", err));
      } else {
        const tempId = `aart-${Date.now()}`;
        const newA: ArtworkListing = {
          id: tempId,
          type: "ARTWORK",
          ...artPayload,
          sales: 0,
        };
        setArtworks((prev) => {
          const updated = [newA, ...prev];
          try {
            localStorage.setItem("jreal_admin_artworks_v1", JSON.stringify(updated));
          } catch {}
          return updated;
        });

        fetch("/api/artworks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newA),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.artwork) {
              setArtworks((prev) => {
                const updated = prev.map((a) =>
                  a.id === tempId ? { ...a, id: data.artwork.id } : a
                );
                try {
                  localStorage.setItem("jreal_admin_artworks_v1", JSON.stringify(updated));
                } catch {}
                return updated;
              });
            }
          })
          .catch((err) => console.warn("Failed to create artwork in DB:", err));
      }
    }
    setIsModalOpen(false);
    setEditingId(null);
    setListingModalError(null);
  };

  const handleDeleteListing = (id: string, type: "PRODUCT" | "ARTWORK") => {
    const itemTitle =
      type === "PRODUCT"
        ? products.find((p) => p.id === id)?.title || "product"
        : artworks.find((a) => a.id === id)?.title || "artwork";

    setConfirmModal({
      isOpen: true,
      title: `Delete ${type === "PRODUCT" ? "Product" : "Artwork"}`,
      message: `Are you sure you want to remove "${itemTitle}" from the catalog? This action cannot be undone.`,
      confirmLabel: "Delete Item",
      variant: "danger",
      onConfirm: () => {
        if (type === "PRODUCT") {
          setProducts((prev) => {
            const updated = prev.filter((p) => p.id !== id);
            try {
              localStorage.setItem("jreal_admin_products_v1", JSON.stringify(updated));
            } catch {}
            return updated;
          });
          fetch(`/api/products?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch((err) =>
            console.warn("Delete product error:", err)
          );
        } else {
          setArtworks((prev) => {
            const updated = prev.filter((a) => a.id !== id);
            try {
              localStorage.setItem("jreal_admin_artworks_v1", JSON.stringify(updated));
            } catch {}
            return updated;
          });
          fetch(`/api/artworks?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch((err) =>
            console.warn("Delete artwork error:", err)
          );
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleToggleListingStatus = (id: string, type: "PRODUCT" | "ARTWORK") => {
    if (type === "PRODUCT") {
      const current = products.find((p) => p.id === id);
      const newStatus: "Active" | "Draft" = current?.status === "Active" ? "Draft" : "Active";
      setProducts((prev) => {
        const updated = prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p));
        try {
          localStorage.setItem("jreal_admin_products_v1", JSON.stringify(updated));
        } catch {}
        return updated;
      });
      fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: newStatus === "Active" }),
      }).catch((err) => console.warn("Toggle product status error:", err));
    } else {
      const current = artworks.find((a) => a.id === id);
      const newStatus: "Draft" | "Published" = current?.status === "Published" ? "Draft" : "Published";
      setArtworks((prev) => {
        const updated = prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a));
        try {
          localStorage.setItem("jreal_admin_artworks_v1", JSON.stringify(updated));
        } catch {}
        return updated;
      });
      fetch("/api/artworks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      }).catch((err) => console.warn("Toggle artwork status error:", err));
    }
  };

  // ─── Service Bookings Handlers ──────────────────────────────────────────────

  const copyBookingLocation = (b: ServiceBooking) => {
    const text = `${b.clientName} (${b.clientPhone})\nService: ${b.serviceCategory} — ${b.shootType}\nDate: ${b.eventDate}\nLocation: ${b.location}${
      b.locationLandmark ? `\nLandmark: ${b.locationLandmark}` : ""
    }${b.locationUrl ? `\nMap: ${b.locationUrl}` : ""}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedBookingId(b.id);
    setTimeout(() => setCopiedBookingId(null), 2500);
  };

  const shareBookingLocation = async (b: ServiceBooking) => {
    const shareText = `Shoot/Service Order #${b.bookingRef} for ${b.clientName}: ${b.shootType} on ${b.eventDate} at ${b.location}.${
      b.locationLandmark ? ` Landmark: ${b.locationLandmark}.` : ""
    }`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Booking #${b.bookingRef} — ${b.shootType}`,
          text: shareText,
          url: b.locationUrl || undefined,
        });
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }
    const fullMsg = `*JREAL CREW DISPATCH — Booking #${b.bookingRef}*\nClient: ${b.clientName} (${b.clientPhone})\nDate: ${b.eventDate}\nService: ${b.serviceCategory} - ${b.shootType}\nLocation: ${b.location}\n${b.locationLandmark ? `Landmark: ${b.locationLandmark}\n` : ""}${b.locationUrl ? `Google Maps: ${b.locationUrl}` : ""}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(fullMsg)}`, "_blank", "noopener,noreferrer");
  };

  const openWhatsAppBooking = (b: ServiceBooking) => {
    const cleanPhone = b.clientPhone.replace(/[^0-9]/g, "");
    const msg = `Hello ${b.clientName}! This is JREAL VISION DESIGN admin regarding your *${b.serviceCategory}* booking (#${b.bookingRef}) for *${b.shootType}* on *${b.eventDate}*.\nAssigned Lead: ${b.assignedStaffName}\nLocation: ${b.location}\nStatus: ${b.status.replace("_", " ")}${b.deliverablesUrl ? `\nDeliverables folder: ${b.deliverablesUrl}` : ""}\n\nPlease let us know if you need any adjustments.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
  };

  const openAddBooking = () => {
    setEditingBookingId(null);
    setBookingModalError(null);
    const randomRef = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    setBookingForm({
      bookingRef: randomRef,
      clientName: "",
      clientPhone: "+250 ",
      clientEmail: "",
      serviceCategory: "Photography",
      shootType: "Corporate & Executive Portraits",
      eventDate: new Date().toISOString().slice(0, 10),
      location: "",
      locationLandmark: "",
      locationUrl: "",
      price: 180000,
      depositStatus: "PAID",
      status: "CONFIRMED",
      assignedStaffId: staffList[0]?.id || "staff-1",
      assignedStaffName: staffList[0]?.name || "Eric Mugabo",
      notes: "",
      deliverablesUrl: "",
    });
    setIsBookingModalOpen(true);
  };

  const openEditBooking = (b: ServiceBooking) => {
    setEditingBookingId(b.id);
    setBookingModalError(null);
    setBookingForm({
      bookingRef: b.bookingRef,
      clientName: b.clientName,
      clientPhone: b.clientPhone,
      clientEmail: b.clientEmail,
      serviceCategory: b.serviceCategory,
      shootType: b.shootType,
      eventDate: b.eventDate,
      location: b.location,
      locationLandmark: b.locationLandmark || "",
      locationUrl: b.locationUrl || "",
      price: b.price,
      depositStatus: b.depositStatus,
      status: b.status,
      assignedStaffId: b.assignedStaffId,
      assignedStaffName: b.assignedStaffName,
      notes: b.notes || "",
      deliverablesUrl: b.deliverablesUrl || "",
    });
    setIsBookingModalOpen(true);
  };

  const handleSaveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.clientName.trim() || !bookingForm.shootType.trim() || !bookingForm.location.trim()) {
      setBookingModalError("Please fill in the client name, service shoot type, and location.");
      return;
    }

    const assignedStaff = staffList.find((s) => s.id === bookingForm.assignedStaffId);
    const assignedStaffName = assignedStaff ? assignedStaff.name : bookingForm.assignedStaffName;

    if (editingBookingId) {
      setBookings((prev) => {
        const updated = prev.map((b) =>
          b.id === editingBookingId
            ? {
                ...b,
                ...bookingForm,
                assignedStaffName,
                price: Number(bookingForm.price),
              }
            : b
        );
        try {
          localStorage.setItem("jreal_service_bookings", JSON.stringify(updated));
        } catch {}
        return updated;
      });
      fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingBookingId,
          status: bookingForm.status,
          location: bookingForm.location,
          notes: bookingForm.notes,
        }),
      }).catch((err) => console.warn("Update booking error:", err));
    } else {
      const tempId = `bk-${Date.now()}`;
      const newB: ServiceBooking = {
        id: tempId,
        ...bookingForm,
        assignedStaffName,
        price: Number(bookingForm.price),
      };
      setBookings((prev) => {
        const updated = [newB, ...prev];
        try {
          localStorage.setItem("jreal_service_bookings", JSON.stringify(updated));
        } catch {}
        return updated;
      });

      fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: bookingForm.clientName,
          phone: bookingForm.clientPhone,
          email: bookingForm.clientEmail,
          shootType: bookingForm.shootType,
          serviceCategory: bookingForm.serviceCategory,
          date: bookingForm.eventDate,
          location: bookingForm.location,
          notes: bookingForm.notes,
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.booking) {
            setBookings((prev) => {
              const updated = prev.map((b) => (b.id === tempId ? { ...b, id: data.booking.id } : b));
              try {
                localStorage.setItem("jreal_service_bookings", JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        })
        .catch((err) => console.warn("Create booking error:", err));
    }
    setIsBookingModalOpen(false);
    setEditingBookingId(null);
    setBookingModalError(null);
  };

  const handleDeleteBooking = (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Remove Service Booking",
      message: `Are you sure you want to remove booking "${booking?.bookingRef || id}" for ${booking?.clientName || "this client"}?`,
      confirmLabel: "Remove Booking",
      variant: "danger",
      onConfirm: () => {
        setBookings((prev) => {
          const updated = prev.filter((b) => b.id !== id);
          try {
            localStorage.setItem("jreal_service_bookings", JSON.stringify(updated));
          } catch {}
          return updated;
        });
        fetch(`/api/bookings?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch((err) =>
          console.warn("Delete booking error:", err)
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleUpdateBookingStatus = (id: string, status: ServiceBooking["status"]) => {
    setBookings((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, status } : b));
      try {
        localStorage.setItem("jreal_service_bookings", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch((err) => console.warn("Update booking status error:", err));
  };

  // ─── Orders Handlers ────────────────────────────────────────────────────────
  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, status } : o));
      try {
        localStorage.setItem("jreal_recent_orders", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId, status }),
    }).catch((err) => console.warn("Update order status error:", err));
  };

  const handleDeleteOrder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    setConfirmModal({
      isOpen: true,
      title: "Delete Order Record",
      message: `Are you sure you want to delete order "${order?.orderNumber || orderId}"? This record will be permanently removed.`,
      confirmLabel: "Delete Order",
      variant: "danger",
      onConfirm: () => {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, { method: "DELETE" }).catch((err) =>
          console.warn("Delete order error:", err)
        );
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // ─── Users Role Handler ─────────────────────────────────────────────────────
  const handleUpdateUserRole = (userId: string, newRole: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId || u.email === userId ? { ...u, role: newRole } : u))
    );
    fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, role: newRole.toUpperCase() }),
    }).catch((err) => console.warn("Update user role error:", err));
  };

  const handleQuickAssignStaff = (bookingId: string, staffId: string) => {
    const staff = staffList.find((s) => s.id === staffId);
    if (!staff) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, assignedStaffId: staff.id, assignedStaffName: staff.name }
          : b
      )
    );

  };

  // ─── Staff & Crew Management Handlers ───────────────────────────────────────

  const openAddStaff = () => {
    setEditingStaffId(null);
    setStaffModalError(null);
    setStaffForm({
      name: "",
      role: "",
      department: "Photography",
      phone: "+250 ",
      email: "",
      status: "Available",
    });
    setIsStaffModalOpen(true);
  };

  const openEditStaff = (s: StaffMember) => {
    setEditingStaffId(s.id);
    setStaffModalError(null);
    setStaffForm({
      name: s.name,
      role: s.role,
      department: s.department,
      phone: s.phone,
      email: s.email,
      status: s.status,
    });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name.trim() || !staffForm.role.trim()) {
      setStaffModalError("Please provide staff name and role.");
      return;
    }
    setStaffList((prev) => {
      let updated: StaffMember[];
      if (editingStaffId) {
        updated = prev.map((s) => (s.id === editingStaffId ? { ...s, ...staffForm } : s));
      } else {
        const newStaff: StaffMember = {
          id: `staff-${Date.now()}`,
          ...staffForm,
          activeBookings: 0,
        };
        updated = [...prev, newStaff];
      }
      try {
        localStorage.setItem("jreal_staff_members", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setIsStaffModalOpen(false);
    setEditingStaffId(null);
    setStaffModalError(null);
  };

  const handleDeleteStaff = (id: string) => {
    const member = staffList.find((s) => s.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Remove Staff Member",
      message: `Are you sure you want to remove ${member?.name || "this staff member"} from team records?`,
      confirmLabel: "Remove Staff",
      variant: "danger",
      onConfirm: () => {
        setStaffList((prev) => {
          const updated = prev.filter((s) => s.id !== id);
          try {
            localStorage.setItem("jreal_staff_members", JSON.stringify(updated));
          } catch {}
          return updated;
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleToggleStaffStatus = (id: string) => {
    setStaffList((prev) => {
      const updated = prev.map((s) => {
        if (s.id !== id) return s;
        const nextStatus: StaffMember["status"] =
          s.status === "Available"
            ? "On Shoot"
            : s.status === "On Shoot"
            ? "In Print Production"
            : s.status === "In Print Production"
            ? "On Leave"
            : "Available";
        return { ...s, status: nextStatus };
      });
      try {
        localStorage.setItem("jreal_staff_members", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // ─── Portfolio CRUD Handlers ────────────────────────────────────────────────

  const openAddPortfolioItem = () => {
    setEditingPortfolioId(null);
    setPortfolioModalError(null);
    setPortfolioForm({
      title: "",
      category: "Branding",
      clientName: "",
      image: PORTFOLIO_IMAGE_PRESETS[0]?.url || FALLBACK_SERVICE_IMAGE,
      description: "",
      year: new Date().getFullYear().toString(),
      featured: false,
      status: "Published",
    });
    setIsPortfolioModalOpen(true);
  };

  const openEditPortfolioItem = (p: AdminPortfolioItem) => {
    setEditingPortfolioId(p.id);
    setPortfolioModalError(null);
    setPortfolioForm({
      title: p.title,
      category: p.category,
      clientName: p.clientName,
      image: resolveMediaUrl(p.image, PORTFOLIO_IMAGE_PRESETS[0]?.url || FALLBACK_SERVICE_IMAGE),
      description: p.description,
      year: p.year,
      featured: p.featured,
      status: p.status,
    });
    setIsPortfolioModalOpen(true);
  };

  const handleSavePortfolioItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioForm.title.trim() || !portfolioForm.clientName.trim()) {
      setPortfolioModalError("Please provide project title and client name.");
      return;
    }
    const resolvedPortImage = resolveMediaUrl(portfolioForm.image, PORTFOLIO_IMAGE_PRESETS[0]?.url || FALLBACK_SERVICE_IMAGE);
    const finalPort = {
      ...portfolioForm,
      image: resolvedPortImage,
    };
    setPortfolioItemsList((prev) => {
      let updated: AdminPortfolioItem[];
      if (editingPortfolioId) {
        updated = prev.map((p) => (p.id === editingPortfolioId ? { ...p, ...finalPort } : p));
      } else {
        const newPort: AdminPortfolioItem = {
          id: `port-${Date.now()}`,
          ...finalPort,
        };
        updated = [newPort, ...prev];
      }
      try {
        localStorage.setItem("jreal_portfolio_items", JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setIsPortfolioModalOpen(false);
    setEditingPortfolioId(null);
    setPortfolioModalError(null);
  };

  const handleDeletePortfolioItem = (id: string) => {
    const item = portfolioItemsList.find((p) => p.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Delete Portfolio Showcase Project",
      message: `Are you sure you want to delete "${item?.title || "this project"}" from the portfolio showcase?`,
      confirmLabel: "Delete Project",
      variant: "danger",
      onConfirm: () => {
        setPortfolioItemsList((prev) => {
          const updated = prev.filter((p) => p.id !== id);
          try {
            localStorage.setItem("jreal_portfolio_items", JSON.stringify(updated));
          } catch {}
          return updated;
        });
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleTogglePortfolioStatus = (id: string) => {
    setPortfolioItemsList((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== id) return p;
        const nextStatus: "Draft" | "Published" = p.status === "Published" ? "Draft" : "Published";
        return { ...p, status: nextStatus };
      });
      try {
        localStorage.setItem("jreal_portfolio_items", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleTogglePortfolioFeatured = (id: string) => {
    setPortfolioItemsList((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p));
      try {
        localStorage.setItem("jreal_portfolio_items", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // ─── Service Cards CRUD Handlers ───
  const handleUploadCardImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCardImage(true);
    setCardModalError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          // Instant visual preview before server response
          setCardForm((prev) => ({ ...prev, image: base64 }));
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: base64,
              filename: file.name,
              folder: "jreal/services",
            }),
          });
          const data = await res.json();
          if (data.url) {
            setCardForm((prev) => ({ ...prev, image: data.url }));
          } else {
            throw new Error(data.error || "Upload failed");
          }
        } catch (err: any) {
          setCardModalError(err.message || "Failed to upload image to server.");
        } finally {
          setIsUploadingCardImage(false);
          e.target.value = "";
        }
      };
      reader.onerror = () => {
        setCardModalError("Failed to read image file from disk.");
        setIsUploadingCardImage(false);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Card image upload failed:", err);
      setCardModalError("Failed to process image file.");
      setIsUploadingCardImage(false);
      e.target.value = "";
    }
  };

  const handleUploadArtImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingArtImage(true);
    setListingModalError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          // Instant visual preview
          setArtForm((prev) => ({ ...prev, image: base64 }));
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: base64,
              filename: file.name,
              folder: "jreal/gallery",
            }),
          });
          const data = await res.json();
          if (data.url) {
            setArtForm((prev) => ({ ...prev, image: data.url }));
          } else {
            throw new Error(data.error || "Upload failed");
          }
        } catch (err: any) {
          setListingModalError(err.message || "Failed to upload artwork photo.");
        } finally {
          setIsUploadingArtImage(false);
          e.target.value = "";
        }
      };
      reader.onerror = () => {
        setListingModalError("Failed to read artwork image file.");
        setIsUploadingArtImage(false);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Art image upload failed:", err);
      setListingModalError("Failed to process image file.");
      setIsUploadingArtImage(false);
      e.target.value = "";
    }
  };

  const handleUploadPortfolioImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPortfolioImage(true);
    setPortfolioModalError(null);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          // Instant visual preview
          setPortfolioForm((prev) => ({ ...prev, image: base64 }));
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: base64,
              filename: file.name,
              folder: "jreal/portfolio",
            }),
          });
          const data = await res.json();
          if (data.url) {
            setPortfolioForm((prev) => ({ ...prev, image: data.url }));
          } else {
            throw new Error(data.error || "Upload failed");
          }
        } catch (err: any) {
          setPortfolioModalError(err.message || "Failed to upload portfolio showcase image.");
        } finally {
          setIsUploadingPortfolioImage(false);
          e.target.value = "";
        }
      };
      reader.onerror = () => {
        setPortfolioModalError("Failed to read image file.");
        setIsUploadingPortfolioImage(false);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Portfolio image upload failed:", err);
      setPortfolioModalError("Failed to process image file.");
      setIsUploadingPortfolioImage(false);
      e.target.value = "";
    }
  };

  const openAddServiceCard = (defaultCat?: ServiceCardItem["category"]) => {
    setEditingCardId(null);
    setCardModalError(null);
    const cat =
      defaultCat ||
      (serviceCardCatFilter !== "all"
        ? (serviceCardCatFilter as ServiceCardItem["category"])
        : "design");
    setCardForm({
      category: cat,
      title: "",
      description: "",
      priceOrRate: "",
      badge: "",
      image: AVAILABLE_SERVICE_IMAGES[0]?.path || FALLBACK_SERVICE_IMAGE,
      popular: false,
    });
    setIsServiceCardModalOpen(true);
  };

  const openEditServiceCard = (card: ServiceCardItem) => {
    setEditingCardId(card.id);
    setCardModalError(null);
    const resolvedImg = resolveMediaUrl(card.image, AVAILABLE_SERVICE_IMAGES[0]?.path || FALLBACK_SERVICE_IMAGE);
    setCardForm({
      category: card.category,
      title: card.title,
      description: card.description,
      priceOrRate: card.priceOrRate || "",
      badge: card.badge || "",
      image: resolvedImg,
      popular: !!card.popular,
    });
    setIsServiceCardModalOpen(true);
  };

  const handleSaveServiceCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardForm.title.trim()) {
      setCardModalError("Please provide a card title.");
      return;
    }
    const resolvedImage = resolveMediaUrl(cardForm.image, AVAILABLE_SERVICE_IMAGES[0]?.path || FALLBACK_SERVICE_IMAGE);
    const cardData = {
      ...cardForm,
      image: resolvedImage,
    };
    let updated: ServiceCardItem[];
    if (editingCardId) {
      updated = serviceCardsList.map((c) =>
        c.id === editingCardId ? { ...c, ...cardData } : c
      );
    } else {
      const newCard: ServiceCardItem = {
        id: `card-${Date.now()}`,
        ...cardData,
      };
      updated = [newCard, ...serviceCardsList];
    }
    setServiceCardsList(updated);
    saveStoredServiceCards(updated);
    setIsServiceCardModalOpen(false);
    setEditingCardId(null);
    setCardModalError(null);
  };

  const handleDeleteServiceCard = (id: string) => {
    const card = serviceCardsList.find((c) => c.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Delete Service Card",
      message: `Are you sure you want to delete "${card?.title || "this service card"}"? It will be removed from the public website.`,
      confirmLabel: "Delete Card",
      variant: "danger",
      onConfirm: () => {
        const updated = serviceCardsList.filter((c) => c.id !== id);
        setServiceCardsList(updated);
        saveStoredServiceCards(updated);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // ─── Brand Bundles CRUD Handlers (Screenshot 3) ───
  const openAddBrandBundle = () => {
    setEditingBundleId(null);
    setBundleModalError(null);
    setBundleForm({
      name: "",
      price: "",
      popular: false,
      description: "",
      includes: [
        "Custom Logo (3 initial concepts + revisions)",
        "Brand Color Palette & Font Pairing Guide",
        "100 Premium Business Cards",
      ],
    });
    setNewFeatureText("");
    setIsBundleModalOpen(true);
  };

  const openEditBrandBundle = (bundle: BrandBundleItem) => {
    setEditingBundleId(bundle.id);
    setBundleModalError(null);
    setBundleForm({
      name: bundle.name,
      price: bundle.price,
      popular: bundle.popular,
      description: bundle.description,
      includes: [...bundle.includes],
    });
    setNewFeatureText("");
    setIsBundleModalOpen(true);
  };

  const handleSaveBrandBundle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bundleForm.name.trim() || !bundleForm.price.trim()) {
      setBundleModalError("Please provide bundle name and price.");
      return;
    }
    const cleanedFeatures = bundleForm.includes
      .map((f) => f.trim())
      .filter(Boolean);
    const finalBundleData = {
      ...bundleForm,
      includes:
        cleanedFeatures.length > 0
          ? cleanedFeatures
          : ["Full brand consultation & deliverables"],
    };

    let updated: BrandBundleItem[];
    if (editingBundleId) {
      updated = brandBundlesList.map((b) =>
        b.id === editingBundleId ? { ...b, ...finalBundleData } : b
      );
    } else {
      const newBundle: BrandBundleItem = {
        id: `bundle-${Date.now()}`,
        ...finalBundleData,
      };
      updated = [...brandBundlesList, newBundle];
    }
    setBrandBundlesList(updated);
    saveStoredBrandBundles(updated);
    setIsBundleModalOpen(false);
    setEditingBundleId(null);
    setBundleModalError(null);
  };

  const handleDeleteBrandBundle = (id: string) => {
    const bundle = brandBundlesList.find((b) => b.id === id);
    setConfirmModal({
      isOpen: true,
      title: "Delete Brand Bundle",
      message: `Are you sure you want to delete "${bundle?.name || "this brand bundle"}"? It will be removed from the branding packages page.`,
      confirmLabel: "Delete Bundle",
      variant: "danger",
      onConfirm: () => {
        const updated = brandBundlesList.filter((b) => b.id !== id);
        setBrandBundlesList(updated);
        saveStoredBrandBundles(updated);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleAddFeatureToBundle = () => {
    if (!newFeatureText.trim()) return;
    setBundleForm((prev) => ({
      ...prev,
      includes: [...prev.includes, newFeatureText.trim()],
    }));
    setNewFeatureText("");
  };

  const handleRemoveFeatureFromBundle = (index: number) => {
    setBundleForm((prev) => ({
      ...prev,
      includes: prev.includes.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateFeatureText = (index: number, val: string) => {
    setBundleForm((prev) => {
      const copy = [...prev.includes];
      copy[index] = val;
      return { ...prev, includes: copy };
    });
  };


  const totalRevenue = orders.reduce((s, o) => s + o.commission, 0);
  const totalGMV = orders.reduce((s, o) => s + o.total, 0);

  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "categories", label: "Categories & Home Slider" },
    { key: "bookings", label: "Service Bookings" },
    { key: "staff", label: "Staff & Crew" },
    { key: "portfolio", label: "Portfolio (Showcase)" },
    { key: "orders", label: "Store Orders" },
    { key: "products", label: "Store Products" },
    { key: "gallery", label: "Art Gallery" },
    { key: "cms", label: "Content (CMS)" },
    { key: "sellers", label: "Sellers" },
    { key: "subscriptions", label: "Subscriptions" },
    { key: "services_cards", label: "Service Cards" },
    { key: "branding_bundles", label: "Brand Bundles" },
    { key: "users", label: "Users" },
    { key: "checkout_settings", label: "Delivery & Payments" },
  ] as const;

  return (
    <RoleGuard allowedRoles={["ADMIN"]} portalName="Admin Nexus">
      <Head>
        <title>Platform Owner — JREAL VISION DESIGN</title>
      </Head>

      <Header />

      <main className="min-h-screen bg-[#F8FAFC] pt-24 sm:pt-28">
        {/* ── Mobile Sidebar Header (Below Navbar) ── */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-24 z-30 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#128C38]/10 text-[#128C38]">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-bold text-gray-900 block leading-tight">Admin Nexus Navigation</span>
              <span className="text-[10px] text-gray-500 capitalize">{tab} view</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>{isMobileSidebarOpen ? "Close Menu" : "Admin Menu"}</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-7rem)]">
          {/* ── Left Sidebar (Starts right under navbar) ── */}
          <aside
            className={`w-full lg:w-72 bg-white border-r border-slate-200 shrink-0 lg:sticky lg:top-28 lg:h-[calc(100vh-7rem)] lg:overflow-y-auto z-20 transition-all [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full ${
              isMobileSidebarOpen ? "block border-b border-slate-200" : "hidden lg:block"
            }`}
          >
            <div className="p-4 sm:p-5 flex flex-col min-h-full justify-between gap-6">
              <div className="space-y-6">
                {/* ── Admin Profile Badge ── */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      PO
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 block leading-tight truncate">
                        Platform Owner
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono truncate max-w-[135px] block">
                        {user?.email || "owner@jreal.rw"}
                      </span>
                    </div>
                  </div>
                  <span className="flex h-2 w-2 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>

                {/* ── Sidebar Navigation Menu ── */}
                <nav className="space-y-1">
                  {/* Item: Dashboard Overview */}
                  <button
                    type="button"
                    onClick={() => handleSelectNav("overview")}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                      tab === "overview"
                        ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20 shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className={`w-4 h-4 ${tab === "overview" ? "text-emerald-700" : "text-slate-400"}`} />
                      <span>Dashboard Overview</span>
                    </div>
                  </button>

                  {/* ── Category Group 1: Services & Studio ── */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleNavGroup("services")}
                      className="w-full px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between hover:text-slate-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span>Services & Studio</span>
                      </div>
                      {openNavGroups.services ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {openNavGroups.services && (
                      <div className="space-y-0.5 mt-1 pl-2.5 ml-2 border-l border-slate-200">
                        {/* All Bookings */}
                        <button
                          type="button"
                          onClick={() => handleSelectNav("bookings", { bookingCat: "All" })}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "bookings" && bookingCategoryFilter === "All"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                            <span>All Bookings</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                            tab === "bookings" && bookingCategoryFilter === "All"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {bookings.length}
                          </span>
                        </button>

                        {/* Graphic Design */}
                        <button
                          type="button"
                          onClick={() => handleSelectNav("services_cards", { serviceCardCat: "design" })}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "services_cards" && serviceCardCatFilter === "design"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Palette className="w-3.5 h-3.5 text-rose-500" />
                            <span>Graphic Design</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-700 font-semibold">
                            {serviceCardsList.filter((c) => c.category === "design").length}
                          </span>
                        </button>

                        {/* Branding & Bundles */}
                        <button
                          type="button"
                          onClick={() => handleSelectNav("branding_bundles")}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "branding_bundles"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Branding & Bundles</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                            {brandBundlesList.length}
                          </span>
                        </button>

                        {/* Digital Marketing */}
                        <button
                          type="button"
                          onClick={() => handleSelectNav("services_cards", { serviceCardCat: "marketing" })}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "services_cards" && serviceCardCatFilter === "marketing"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                            <span>Digital Marketing</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 font-semibold">
                            {serviceCardsList.filter((c) => c.category === "marketing").length}
                          </span>
                        </button>

                        {/* Photography */}
                        <button
                          type="button"
                          onClick={() => handleSelectNav("services_cards", { serviceCardCat: "photography" })}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "services_cards" && serviceCardCatFilter === "photography"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Camera className="w-3.5 h-3.5 text-blue-500" />
                            <span>Photography</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 font-semibold">
                            {serviceCardsList.filter((c) => c.category === "photography").length}
                          </span>
                        </button>

                        {/* Videography */}
                        <button
                          type="button"
                          onClick={() => handleSelectNav("services_cards", { serviceCardCat: "videography" })}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "services_cards" && serviceCardCatFilter === "videography"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Video className="w-3.5 h-3.5 text-purple-500" />
                            <span>Videography</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 font-semibold">
                            {serviceCardsList.filter((c) => c.category === "videography").length}
                          </span>
                        </button>

                        {/* Print Production */}
                        <button
                          type="button"
                          onClick={() => handleSelectNav("services_cards", { serviceCardCat: "printing" })}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "services_cards" && serviceCardCatFilter === "printing"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Printer className="w-3.5 h-3.5 text-amber-600" />
                            <span>Print Production</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 font-semibold">
                            {serviceCardsList.filter((c) => c.category === "printing").length}
                          </span>
                        </button>

                        {/* Staff & Crew */}
                        <button
                          type="button"
                          onClick={() => handleSelectNav("staff")}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "staff"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Staff & Crew</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                            {staffList.length}
                          </span>
                        </button>

                        {/* Portfolio Showcases */}
                        <button
                          type="button"
                          onClick={() => handleSelectNav("portfolio")}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "portfolio"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Portfolio Showcases</span>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                            tab === "portfolio"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}>
                            {portfolioItemsList.length}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── Category Group 2: Store & Merch ── */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleNavGroup("store")}
                      className="w-full px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between hover:text-slate-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                        <span>Store & Merch</span>
                      </div>
                      {openNavGroups.store ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {openNavGroups.store && (
                      <div className="space-y-0.5 mt-1 pl-2.5 ml-2 border-l border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleSelectNav("orders")}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "orders"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="relative flex items-center">
                              <Package className="w-3.5 h-3.5 text-amber-500" />
                              {newOrderAlertCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                              )}
                            </span>
                            <span>Store Orders</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {newOrderAlertCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                                +{newOrderAlertCount}
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                                {orders.length}
                              </span>
                            )}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectNav("products", { productCat: "All" })}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "products"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Store Products</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                            {products.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectNav("categories")}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "categories"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
                            <span>Categories & Slider</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── Category Group 3: Fine Art Gallery ── */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleNavGroup("gallery")}
                      className="w-full px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between hover:text-slate-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5 text-slate-400" />
                        <span>Art Gallery</span>
                      </div>
                      {openNavGroups.gallery ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {openNavGroups.gallery && (
                      <div className="space-y-0.5 mt-1 pl-2.5 ml-2 border-l border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleSelectNav("gallery", { artworkMedium: "All" })}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "gallery" && artworkMediumFilter === "All"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                            <span>All Curated Artworks</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                            {artworks.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSelectNav("gallery", { artworkMedium: "Acrylic on Canvas" })
                          }
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "gallery" && artworkMediumFilter.includes("Canvas")
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Palette className="w-3.5 h-3.5 text-amber-600" />
                            <span>Canvas & Paintings</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleSelectNav("gallery", {
                              artworkMedium: "Imigongo Relief & Pigments",
                            })
                          }
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "gallery" && artworkMediumFilter.includes("Imigongo")
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-rose-600" />
                            <span>Imigongo Relief</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectNav("artist_applications")}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "artist_applications"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Artist Applications</span>
                          </div>
                          {artistApps.filter((a) => a.status === "PENDING").length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
                              {artistApps.filter((a) => a.status === "PENDING").length}
                            </span>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── Category Group 4: Platform & System ── */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => toggleNavGroup("platform")}
                      className="w-full px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between hover:text-slate-700 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Platform & System</span>
                      </div>
                      {openNavGroups.platform ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {openNavGroups.platform && (
                      <div className="space-y-0.5 mt-1 pl-2.5 ml-2 border-l border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleSelectNav("cms")}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "cms"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>Content (CMS)</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                            {cmsSections.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectNav("sellers")}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "sellers"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Store className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Sellers & Vendors</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                            {sellers.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectNav("subscriptions")}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "subscriptions"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                            <span>Subscriptions</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                            {subscriptions.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectNav("users")}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "users"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                            <span>User Accounts</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                            {usersList.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectNav("checkout_settings")}
                          className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                            tab === "checkout_settings"
                              ? "bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-500/20"
                              : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Delivery & Payments</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                            Settings
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </nav>
              </div>

              {/* ── Bottom Sidebar Utilities ── */}
              <div className="pt-4 border-t border-slate-100 space-y-1.5">
                <Link
                  href="/"
                  target="_blank"
                  className="w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Public Site</span>
                  </div>
                  <span className="text-[10px] text-slate-400">↗</span>
                </Link>

                <button
                  type="button"
                  onClick={logout}
                  className="w-full px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* ── Main Content Area ── */}
          <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
            {/* ── Unified Page Header ── */}
            <div className="border-b border-slate-200 pb-5 mb-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                  <span>Admin</span>
                  <span>/</span>
                  <span className="text-emerald-700 font-semibold">{TAB_META[tab]?.category || "Portal"}</span>
                  <span>/</span>
                  <span className="text-slate-800 font-semibold">{TAB_META[tab]?.title || tab}</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    {TAB_META[tab]?.title || tab}
                  </h1>
                  {newOrderAlertCount > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTab("orders");
                        setNewOrderAlertCount(0);
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs group"
                      title="New order arrived - click to view"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>{newOrderAlertCount} New Order{newOrderAlertCount > 1 ? "s" : ""}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : pendingOrdersCount > 0 && tab !== "orders" ? (
                    <button
                      type="button"
                      onClick={() => setTab("orders")}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                      title="Orders awaiting fulfillment"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{pendingOrdersCount} pending</span>
                    </button>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {TAB_META[tab]?.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {/* Minimalist Live Biping Chime Toggle */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-2xs ${
                    isSoundMuted
                      ? "border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                  title={
                    isSoundMuted
                      ? "Order chime is muted. Click to turn on."
                      : "Live order chime is active. Click to mute or test sound."
                  }
                >
                  {isSoundMuted ? (
                    <BellOff className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                      <Bell className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </span>
                  )}
                  <span className="hidden sm:inline">
                    {isSoundMuted ? "Sound Off" : "Alerts On"}
                  </span>
                </button>
                {tab === "portfolio" && (
                  <>
                    <Link
                      href="/portfolio"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                    >
                      <span>View Live Portfolio</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                    <button
                      type="button"
                      onClick={openAddPortfolioItem}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Showcase Project</span>
                    </button>
                  </>
                )}

                {tab === "services_cards" && (
                  <>
                    <Link
                      href={
                        serviceCardCatFilter === "design"
                          ? "/design"
                          : serviceCardCatFilter === "photography"
                          ? "/photography"
                          : serviceCardCatFilter === "videography"
                          ? "/videography"
                          : serviceCardCatFilter === "printing"
                          ? "/printing"
                          : serviceCardCatFilter === "marketing"
                          ? "/digital-marketing"
                          : serviceCardCatFilter === "branding"
                          ? "/branding"
                          : "/services"
                      }
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                    >
                      <span>View Live Page</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => openAddServiceCard()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Service Card</span>
                    </button>
                  </>
                )}

                {tab === "branding_bundles" && (
                  <>
                    <Link
                      href="/branding"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                    >
                      <span>View Live /branding</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                    <button
                      type="button"
                      onClick={openAddBrandBundle}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Brand Bundle</span>
                    </button>
                  </>
                )}

                {tab === "bookings" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setTab("staff")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>Staff Directory ({staffList.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={openAddBooking}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Service Booking</span>
                    </button>
                  </>
                )}

                {tab === "staff" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setTab("bookings")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>View Bookings</span>
                    </button>
                    <button
                      type="button"
                      onClick={openAddStaff}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Staff Member</span>
                    </button>
                  </>
                )}

                {tab === "products" && (
                  <>
                    <Link
                      href="/shop"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                    >
                      <span>View Shop</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                    <Link
                      href="/admin/products/new"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload Product</span>
                    </Link>
                  </>
                )}

                {tab === "gallery" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setTab("artist_applications")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Artist Applications ({artistApps.filter((a) => a.status === "PENDING").length} pending)</span>
                    </button>
                    <Link
                      href="/art-gallery"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                    >
                      <span>View Gallery</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                    <button
                      type="button"
                      onClick={openAddArtwork}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Upload Fine Art</span>
                    </button>
                  </>
                )}

                {tab === "artist_applications" && (
                  <>
                    <button
                      type="button"
                      onClick={() => setTab("gallery")}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <span>← Curated Art Collection</span>
                    </button>
                    <Link
                      href="/join-as-artist"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      <span>View Application Form</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                  </>
                )}

                {tab === "overview" && (
                  <>
                    <Link
                      href="/"
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
                    >
                      <span>Visit Store</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setTab("bookings"); openAddBooking(); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Booking</span>
                    </button>
                  </>
                )}
              </div>
            </div>

          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div>
              {/* 8 Refined Executive Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
                {[
                  { label: "Total GMV", value: `${totalGMV.toLocaleString()} RWF`, icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Platform Commissions", value: `${totalRevenue.toLocaleString()} RWF`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Pipeline Value", value: `${bookings.reduce((sum, b) => sum + b.price, 0).toLocaleString()} RWF`, icon: Briefcase, color: "text-indigo-600", bg: "bg-indigo-50" },
                  { label: "Creative Crew", value: `${staffList.length} members`, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
                  { label: "Service Bookings", value: `${bookings.length} active`, icon: Camera, color: "text-sky-600", bg: "bg-sky-50" },
                  { label: "Portfolio Showcases", value: `${portfolioItemsList.length} projects`, icon: ImageIcon, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Direct Products", value: `${products.length} items`, icon: ShoppingBag, color: "text-emerald-600", bg: "bg-emerald-50" },
                  { label: "Curated Artworks", value: `${artworks.length} pieces`, icon: Palette, color: "text-rose-600", bg: "bg-rose-50" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-medium text-slate-500">{label}</span>
                      <div className={`w-7 h-7 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</div>
                  </div>
                ))}
              </div>

              {/* 2 Quick Operations Hub Cards */}
              <div className="grid md:grid-cols-2 gap-4 mb-7">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Services & Studio</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Creative Production & Field Crew</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {bookings.length} active service orders · {staffList.length} staff members · {portfolioItemsList.length} showcases
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setTab("bookings"); openAddBooking(); }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      + New Booking
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("staff")}
                      className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Manage Crew →
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("portfolio")}
                      className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Showcases →
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Catalog & Merch</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Commercial Store & Fine Art</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {products.length} direct products in catalog · {artworks.length} curated fine artworks
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setTab("products"); openAddProduct(); }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      + Upload Product
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTab("gallery"); openAddArtwork(); }}
                      className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      + Upload Fine Art
                    </button>
                    <button
                      type="button"
                      onClick={() => setTab("categories")}
                      className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Slider Settings →
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent orders preview */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs mb-7">
                <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Recent Platform Orders</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Latest transactions across sellers and direct store</p>
                  </div>
                  <button
                    onClick={() => setTab("orders")}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    View All Orders →
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {orders.slice(0, 4).map((o) => (
                    <div key={o.id} className="flex flex-wrap items-center justify-between gap-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          #{o.orderNumber}
                        </span>
                        <div>
                          <span className="text-xs font-medium text-slate-800 block">{o.buyerEmail}</span>
                          <span className="text-[11px] text-slate-400">via {o.vendorName} · {o.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                          o.status === "DELIVERED" || o.status === "COMPLETED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : o.status === "IN_PRODUCTION"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {o.status.replace("_", " ")}
                        </span>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 block tabular-nums">{o.total.toLocaleString()} RWF</span>
                          <span className="text-[11px] text-slate-400">+{o.commission.toLocaleString()} comm.</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick CMS links */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Website Content Quick Edit</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Update public website headlines and promotional banners</p>
                  </div>
                  <button
                    onClick={() => setTab("cms")}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Open CMS Editor →
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {cmsSections.slice(0, 3).map((s) => (
                    <div key={s.key} className="flex items-center justify-between py-3 gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">{s.label}</p>
                        <p className="text-xs text-slate-500 truncate max-w-lg mt-0.5">{s.content}</p>
                      </div>
                      <button
                        onClick={() => { setTab("cms"); setEditSection(s.key); setSectionContent(s.content); }}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md transition-colors shrink-0"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CATEGORIES & HOMEPAGE SLIDER MANAGEMENT ── */}
          {tab === "categories" && <AdminCategoriesManagement />}

          {/* ── SERVICE BOOKINGS (PHOTOGRAPHY, VIDEOGRAPHY, PRINT) ── */}
          {tab === "bookings" && (
            <div>
              {/* 4 KPI Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="text-xs font-medium text-slate-500">Total Bookings</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{bookings.length}</div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="text-xs font-medium text-slate-500">In Production</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1 tabular-nums">
                    {bookings.filter((b) => b.status === "IN_PRODUCTION").length}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="text-xs font-medium text-slate-500">Confirmed Upcoming</div>
                  <div className="text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
                    {bookings.filter((b) => b.status === "CONFIRMED").length}
                  </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <div className="text-xs font-medium text-slate-500">Pipeline Booking Value</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                    {bookings.reduce((sum, b) => sum + b.price, 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">RWF</span>
                  </div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-medium mr-1">Service:</span>
                  {(["All", "Photography", "Videography", "Print"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setBookingCategoryFilter(cat)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                        bookingCategoryFilter === cat
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    aria-label="Filter by Booking Status"
                    className="border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="All">All Statuses</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="IN_PRODUCTION">IN PRODUCTION</option>
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  <select
                    value={bookingStaffFilter}
                    onChange={(e) => setBookingStaffFilter(e.target.value)}
                    aria-label="Filter by Assigned Staff"
                    className="border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="All">All Staff Crew</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.department})
                      </option>
                    ))}
                  </select>

                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search bookings, clients..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="border border-slate-200 text-xs pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Service Bookings Table */}
              <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-xs overflow-x-auto">
                <table className="w-full text-sm min-w-[1050px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                      <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Ref & Date
                      </th>
                      <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Client & Contact
                      </th>
                      <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Service & Shoot Type
                      </th>
                      <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Location & Logistics
                      </th>
                      <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Assigned Crew Member
                      </th>
                      <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Quote & Deposit
                      </th>
                      <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Workflow Status
                      </th>
                      <th className="px-4 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings
                      .filter((b) => {
                        const matchesCat = bookingCategoryFilter === "All" || b.serviceCategory === bookingCategoryFilter;
                        const matchesStatus = bookingStatusFilter === "All" || b.status === bookingStatusFilter;
                        const matchesStaff = bookingStaffFilter === "All" || b.assignedStaffId === bookingStaffFilter;
                        const q = bookingSearch.toLowerCase();
                        const matchesSearch =
                          !q ||
                          b.bookingRef.toLowerCase().includes(q) ||
                          b.clientName.toLowerCase().includes(q) ||
                          b.clientPhone.toLowerCase().includes(q) ||
                          b.shootType.toLowerCase().includes(q) ||
                          b.location.toLowerCase().includes(q) ||
                          b.assignedStaffName.toLowerCase().includes(q);
                        return matchesCat && matchesStatus && matchesStaff && matchesSearch;
                      })
                      .map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Ref & Date */}
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-xs font-bold text-slate-900 block">
                              #{b.bookingRef}
                            </span>
                            <span className="text-[11px] text-slate-400 mt-0.5 block">{b.eventDate}</span>
                            <span
                              className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1 border ${
                                b.serviceCategory === "Photography"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : b.serviceCategory === "Videography"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              {b.serviceCategory}
                            </span>
                          </td>

                          {/* Client & Contact */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-900 text-xs">{b.clientName}</div>
                            <div className="text-xs text-slate-500 font-mono mt-0.5">{b.clientPhone}</div>
                            {b.clientEmail && (
                              <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{b.clientEmail}</div>
                            )}
                            <button
                              type="button"
                              onClick={() => openWhatsAppBooking(b)}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 mt-1 transition-colors cursor-pointer"
                            >
                              <span>WhatsApp Chat ↗</span>
                            </button>
                          </td>

                          {/* Service & Shoot Type */}
                          <td className="px-4 py-3.5 max-w-[200px]">
                            <div className="font-medium text-slate-900 text-xs leading-snug">{b.shootType}</div>
                            {b.notes && (
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 italic">"{b.notes}"</p>
                            )}
                            {b.deliverablesUrl && (
                              <a
                                href={b.deliverablesUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 hover:text-blue-800 mt-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                              >
                                Assets Folder ↗
                              </a>
                            )}
                          </td>

                          {/* Location & Logistics */}
                          <td className="px-4 py-3.5 max-w-[230px]">
                            <div className="text-xs text-slate-800 font-medium leading-tight">{b.location}</div>
                            {b.locationLandmark && (
                              <div className="text-[11px] text-slate-400 mt-0.5">Near: {b.locationLandmark}</div>
                            )}
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {b.locationUrl && (
                                <a
                                  href={b.locationUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-800"
                                >
                                  Map pin ↗
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => copyBookingLocation(b)}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all cursor-pointer ${
                                  copiedBookingId === b.id
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                                }`}
                              >
                                {copiedBookingId === b.id ? "✓ Copied" : "Copy Location"}
                              </button>
                              <button
                                type="button"
                                onClick={() => shareBookingLocation(b)}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                              >
                                Share
                              </button>
                            </div>
                          </td>

                          {/* Assigned Staff */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 border border-slate-200">
                                {b.assignedStaffName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </span>
                              <span className="text-xs font-semibold text-slate-800">{b.assignedStaffName}</span>
                            </div>
                            <select
                              value={b.assignedStaffId}
                              onChange={(e) => handleQuickAssignStaff(b.id, e.target.value)}
                              aria-label="Reassign Staff Member"
                              className="text-[10px] border border-slate-200 rounded px-1.5 py-0.5 bg-slate-50 text-slate-600 focus:outline-none"
                            >
                              {staffList.map((s) => (
                                <option key={s.id} value={s.id}>
                                  Reassign: {s.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Quote & Deposit */}
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900 tabular-nums text-xs">
                              {b.price.toLocaleString()} RWF
                            </div>
                            <span
                              className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 border ${
                                b.depositStatus === "PAID" || b.depositStatus === "FULLY_PAID"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {b.depositStatus === "PAID"
                                ? "Deposit Paid"
                                : b.depositStatus === "FULLY_PAID"
                                ? "Fully Paid"
                                : "Deposit Pending"}
                            </span>
                          </td>

                          {/* Workflow Status */}
                          <td className="px-4 py-3.5">
                            <select
                              value={b.status}
                              onChange={(e) =>
                                handleUpdateBookingStatus(b.id, e.target.value as ServiceBooking["status"])
                              }
                              aria-label="Update Workflow Status"
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border focus:outline-none ${
                                b.status === "CONFIRMED"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : b.status === "IN_PRODUCTION"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : b.status === "PENDING"
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : b.status === "COMPLETED"
                                  ? "bg-slate-100 text-slate-700 border-slate-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              <option value="CONFIRMED">CONFIRMED</option>
                              <option value="IN_PRODUCTION">IN PRODUCTION</option>
                              <option value="PENDING">PENDING</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditBooking(b)}
                                className="text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBooking(b.id)}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-800 border border-rose-100 px-2.5 py-1 rounded-md bg-white hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── STAFF & CREW MANAGEMENT ── */}
          {tab === "staff" && (
            <div className="space-y-6">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Total Crew</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{staffList.length}</div>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Available Now</div>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">
                    {staffList.filter((s) => s.status === "Available").length}
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">On Shoot / Field</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {staffList.filter((s) => s.status === "On Shoot").length}
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">In Print Production</div>
                  <div className="text-2xl font-bold text-amber-600 mt-1">
                    {staffList.filter((s) => s.status === "In Print Production").length}
                  </div>
                </div>
              </div>

              {/* Department Filters & Search */}
              <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-medium mr-1">Department:</span>
                  {(["All", "Photography", "Videography", "Print", "Creative Direction"] as const).map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => setStaffDeptFilter(dept)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        staffDeptFilter === dept
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search crew by name, role, phone..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    className="w-full border border-slate-200 text-xs pl-9 pr-3 py-2 rounded-lg bg-slate-50/50 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600/20 transition-all"
                  />
                </div>
              </div>

              {/* Staff Table */}
              <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs overflow-x-auto">
                <table className="w-full text-sm min-w-[850px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                      <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Crew Member
                      </th>
                      <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Department & Role
                      </th>
                      <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Phone & WhatsApp
                      </th>
                      <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        Status
                      </th>
                      <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold text-center">
                        Active Jobs
                      </th>
                      <th className="px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffList
                      .filter((s) => {
                        const matchesDept = staffDeptFilter === "All" || s.department === staffDeptFilter;
                        const q = staffSearch.toLowerCase();
                        const matchesQ =
                          !q ||
                          s.name.toLowerCase().includes(q) ||
                          s.role.toLowerCase().includes(q) ||
                          s.phone.toLowerCase().includes(q) ||
                          s.email.toLowerCase().includes(q);
                        return matchesDept && matchesQ;
                      })
                      .map((s) => {
                        const activeCount = bookings.filter(
                          (b) => b.assignedStaffId === s.id && (b.status === "CONFIRMED" || b.status === "IN_PRODUCTION")
                        ).length;

                        return (
                          <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Crew Member */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-100/70 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200/60 shrink-0">
                                  {s.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900">{s.name}</div>
                                  <div className="text-xs text-slate-500">{s.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Department & Role */}
                            <td className="px-5 py-3.5">
                              <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 mb-1">
                                {s.department}
                              </span>
                              <div className="text-xs text-slate-700 font-medium">{s.role}</div>
                            </td>

                            {/* Contact */}
                            <td className="px-5 py-3.5">
                              <div className="text-xs font-mono text-slate-900">{s.phone}</div>
                              <a
                                href={`https://wa.me/${s.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline mt-0.5"
                              >
                                Message WhatsApp ↗
                              </a>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-3.5">
                              <button
                                type="button"
                                onClick={() => handleToggleStaffStatus(s.id)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                                  s.status === "Available"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                    : s.status === "On Shoot"
                                    ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                    : s.status === "In Print Production"
                                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                                }`}
                              >
                                ● {s.status}
                              </button>
                            </td>

                            {/* Active Jobs */}
                            <td className="px-5 py-3.5 text-center">
                              <span className="inline-block font-medium text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                                {activeCount} {activeCount === 1 ? "job" : "jobs"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => openEditStaff(s)}
                                  className="text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStaff(s.id)}
                                  className="text-xs font-medium text-rose-600 hover:text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 transition-colors shadow-2xs"
                                >
                                  Delete
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

          {/* ── PORTFOLIO SHOWCASE MANAGEMENT (CRUD) ── */}
          {tab === "portfolio" && (
            <div className="space-y-6">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Total Showcases</div>
                  <div className="text-2xl font-bold text-slate-900 mt-1">{portfolioItemsList.length}</div>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Featured on Home</div>
                  <div className="text-2xl font-bold text-emerald-600 mt-1">
                    {portfolioItemsList.filter((p) => p.featured).length}
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Published Live</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {portfolioItemsList.filter((p) => p.status === "Published").length}
                  </div>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Drafts / In Review</div>
                  <div className="text-2xl font-bold text-amber-600 mt-1">
                    {portfolioItemsList.filter((p) => p.status === "Draft").length}
                  </div>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-medium mr-1">Category:</span>
                  {(["All", "Branding", "Photography", "Videography", "Printing", "Marketing"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPortfolioCatFilter(cat)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        portfolioCatFilter === cat
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search showcase title, client..."
                    value={portfolioSearch}
                    onChange={(e) => setPortfolioSearch(e.target.value)}
                    className="w-full border border-slate-200 text-xs pl-9 pr-3 py-2 rounded-lg bg-slate-50/50 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600/20 transition-all"
                  />
                </div>
              </div>

              {/* Portfolio Grid Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {portfolioItemsList
                  .filter((p) => {
                    const matchesCat = portfolioCatFilter === "All" || p.category === portfolioCatFilter;
                    const q = portfolioSearch.toLowerCase();
                    const matchesQ =
                      !q ||
                      p.title.toLowerCase().includes(q) ||
                      p.clientName.toLowerCase().includes(q) ||
                      p.description.toLowerCase().includes(q) ||
                      p.category.toLowerCase().includes(q);
                    return matchesCat && matchesQ;
                  })
                  .map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                    >
                      {/* Image Thumbnail with Overlay badges */}
                      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                        <img
                          src={resolveMediaUrl(p.image, PORTFOLIO_IMAGE_PRESETS[0]?.url || FALLBACK_SERVICE_IMAGE)}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              PORTFOLIO_IMAGE_PRESETS[0]?.url || FALLBACK_SERVICE_IMAGE;
                          }}
                        />
                        <div className="absolute top-2.5 left-2.5 bg-slate-950/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {p.category}
                        </div>
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          {p.featured && (
                            <span className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs">
                              ★ Featured
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs ${
                              p.status === "Published" ? "bg-emerald-600 text-white" : "bg-slate-600 text-white"
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 bg-slate-950/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs font-mono">
                          {p.year}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="text-[11px] font-semibold text-emerald-700 tracking-wide uppercase">{p.clientName}</div>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug line-clamp-1">
                            {p.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                            {p.description}
                          </p>
                        </div>

                        {/* Controls Toolbar */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTogglePortfolioFeatured(p.id)}
                              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                                p.featured
                                  ? "bg-amber-50 text-amber-800 border-amber-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {p.featured ? "★ Featured" : "☆ Feature"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTogglePortfolioStatus(p.id)}
                              className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                                p.status === "Published"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {p.status === "Published" ? "Published" : "Draft"}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditPortfolioItem(p)}
                              className="text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePortfolioItem(p.id)}
                              className="text-xs font-medium text-rose-600 hover:text-rose-700 border border-rose-200 px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 transition-colors shadow-2xs"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ── ALL ORDERS ── */}
          {tab === "orders" && (
            <div className="space-y-6">
              <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs overflow-x-auto">
                <table className="w-full text-sm min-w-[880px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                      {["Order", "Buyer", "Delivery Location (Shared by Customer)", "Seller", "Category", "Total", "Commission", "Status", "Date", "Actions"].map((h) => (
                        <th key={h} className="px-4 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 align-top">
                          <div className="font-mono text-xs font-bold text-slate-900">#{o.orderNumber}</div>
                          {o.isTestMode && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                🧪 Sandbox Test
                              </span>
                            </div>
                          )}
                          {o.paymentMethod && (
                            <div className="mt-1 text-[11px] text-slate-500 font-medium">
                              💳 {o.paymentMethod}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-[130px] align-top">
                          <span className="block truncate font-medium text-slate-900">{o.buyerEmail}</span>
                          {o.buyerPhone && <span className="block text-[11px] text-slate-400 font-mono">{o.buyerPhone}</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-700 max-w-xs align-top">
                          <p className="font-medium text-slate-900 leading-snug">{o.deliveryLocation}</p>
                          {o.locationLandmark && (
                            <p className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 inline-block mt-0.5">
                              Landmark: {o.locationLandmark}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 pt-1.5">
                            <button
                              type="button"
                              onClick={() => copyOrderLocation(o)}
                              className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-colors ${
                                copiedOrderId === o.id
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs"
                              }`}
                              title="Copy delivery location text"
                            >
                              {copiedOrderId === o.id ? "Copied ✓" : "Copy"}
                            </button>
                            <button
                              type="button"
                              onClick={() => shareOrderLocation(o)}
                              className="px-2 py-0.5 text-[11px] font-semibold rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                              title="Share with dispatch driver via WhatsApp"
                            >
                              Share
                            </button>
                            {o.locationUrl && (
                              <a
                                href={o.locationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                                title="Open in Google Maps"
                              >
                                Map ↗
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 max-w-[120px] truncate align-top">{o.vendorName}</td>
                        <td className="px-4 py-3 text-slate-500 align-top">{o.category}</td>
                        <td className="px-4 py-3 tabular-nums font-semibold text-slate-900 align-top">{o.total.toLocaleString()} RWF</td>
                        <td className="px-4 py-3 tabular-nums text-slate-600 align-top">{o.commission.toLocaleString()}</td>
                        <td className="px-4 py-3 text-xs align-top">
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 focus:outline-none cursor-pointer"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="PRODUCTION">Production</option>
                            <option value="DELIVERY">Delivery</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 align-top">{o.date}</td>
                        <td className="px-4 py-3 text-xs text-right align-top">
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(o.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50/80">
                      <td colSpan={5} className="px-4 py-3 text-xs font-semibold text-slate-700">Totals</td>
                      <td className="px-4 py-3 tabular-nums font-bold text-slate-900">{totalGMV.toLocaleString()} RWF</td>
                      <td className="px-4 py-3 tabular-nums font-bold text-slate-900">{totalRevenue.toLocaleString()} RWF</td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: STORE PRODUCTS (Direct Commercial Catalog) ── */}
          {tab === "products" && (
            <div className="space-y-6">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Total Listings</span>
                  <span className="text-2xl font-bold text-slate-900 block">{products.length}</span>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Active in Store</span>
                  <span className="text-2xl font-bold text-emerald-600 block">
                    {products.filter((p) => p.status === "Active").length}
                  </span>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Customizable</span>
                  <span className="text-2xl font-bold text-blue-600 block">
                    {products.filter((p) => p.customizable).length}
                  </span>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Direct Sales</span>
                  <span className="text-2xl font-bold text-slate-900 block">
                    {products.reduce((acc, p) => acc + (p.sales || 0), 0)}
                  </span>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 border border-slate-200/80 rounded-xl shadow-xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search products by title, category…"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full border border-slate-200 text-xs pl-9 pr-3 py-2 rounded-lg bg-slate-50/50 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600/20 transition-all"
                  />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {["All", "T-Shirts & Apparel", "Business Cards & Stationery", "Banners & Signage", "Mugs & Drinkware"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setProductCatFilter(cat)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                        productCatFilter === cat
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <Link
                  href="/admin/products/new"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Product</span>
                </Link>
              </div>

              {/* Products Table */}
              <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[750px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px]">Product</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px]">Category</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px] text-right">Price</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px] text-right">Stock</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px]">Status</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products
                      .filter((p) => {
                        const matchCat = productCatFilter === "All" || p.category === productCatFilter;
                        const matchSearch =
                          !productSearch.trim() ||
                          p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(productSearch.toLowerCase());
                        return matchCat && matchSearch;
                      })
                      .map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={resolveMediaUrl(p.image, FALLBACK_PRODUCT_IMAGE)}
                                alt={p.title}
                                className="w-12 h-12 object-cover border border-slate-200 rounded-lg shrink-0 bg-slate-100"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                                }}
                              />
                              <div>
                                <span className="font-semibold text-slate-900 block">{p.title}</span>
                                {p.attributes && p.attributes.length > 0 ? (
                                  <div className="flex flex-wrap items-center gap-1 mt-1">
                                    {p.attributes.map((a) => (
                                      <span
                                        key={a.id}
                                        className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
                                      >
                                        <strong className="text-slate-800">{a.name}:</strong>{" "}
                                        {a.values.map((v) => v.name).join(", ")}
                                      </span>
                                    ))}
                                    {p.customizable && (
                                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                                        Customizable
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-500 font-normal block mt-0.5">
                                    {p.options || "Standard"} {p.customizable && "• Customizable"}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 font-medium">
                            {p.category}
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold text-slate-900 tabular-nums">
                            {p.price.toLocaleString()} RWF
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              In Stock
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() => handleToggleListingStatus(p.id, "PRODUCT")}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
                                p.status === "Active"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              {p.status}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/admin/products/edit?id=${p.id}`}
                                className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-xs transition-colors shadow-2xs"
                              >
                                Edit
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteListing(p.id, "PRODUCT")}
                                className="px-2.5 py-1 border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: ART GALLERY (Direct Curated Fine Art) ── */}
          {tab === "gallery" && (
            <div className="space-y-6">
              {/* 4 Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Total Artworks</span>
                  <span className="text-2xl font-bold text-slate-900 block">{artworks.length}</span>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Published Live</span>
                  <span className="text-2xl font-bold text-emerald-600 block">
                    {artworks.filter((a) => a.status === "Published").length}
                  </span>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <span className="text-xs font-medium text-slate-500 block mb-1">With Certificate</span>
                  <span className="text-2xl font-bold text-amber-600 block">
                    {artworks.filter((a) => a.certificateOfAuthenticity).length}
                  </span>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Collection Value</span>
                  <span className="text-2xl font-bold text-slate-900 block">
                    {artworks.reduce((acc, a) => acc + a.price, 0).toLocaleString()} RWF
                  </span>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 border border-slate-200/80 rounded-xl shadow-xs">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search artworks by title, medium, artist…"
                    value={artworkSearch}
                    onChange={(e) => setArtworkSearch(e.target.value)}
                    className="w-full border border-slate-200 text-xs pl-9 pr-3 py-2 rounded-lg bg-slate-50/50 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600/20 transition-all"
                  />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {["All", "Acrylic on Canvas", "Oil on Linen", "Imigongo Relief & Pigments", "Mixed Media & Sisal on Linen"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setArtworkMediumFilter(m)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                        artworkMediumFilter === m
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {m === "All" ? "All Mediums" : m.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Artworks Table */}
              <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[780px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px]">Artwork</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px]">Medium & Dimensions</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px]">Framing & Cert</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px] text-right">Price</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px]">Status</th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {artworks
                      .filter((a) => {
                        const matchMedium = artworkMediumFilter === "All" || a.medium.includes(artworkMediumFilter);
                        const matchSearch =
                          !artworkSearch.trim() ||
                          a.title.toLowerCase().includes(artworkSearch.toLowerCase()) ||
                          a.medium.toLowerCase().includes(artworkSearch.toLowerCase()) ||
                          a.artistName.toLowerCase().includes(artworkSearch.toLowerCase());
                        return matchMedium && matchSearch;
                      })
                      .map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={resolveMediaUrl(a.image, FALLBACK_ARTWORK_IMAGE)}
                                alt={a.title}
                                className="w-12 h-14 object-cover border border-slate-200 rounded-lg shrink-0 bg-slate-100 shadow-2xs"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = FALLBACK_ARTWORK_IMAGE;
                                }}
                              />
                              <div>
                                <span className="font-semibold text-slate-900 block">{a.title}</span>
                                <span className="text-[11px] text-slate-500 font-normal">
                                  {a.artistName} · {a.artistCity} ({a.year})
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            <span className="font-medium text-slate-800 block">{a.medium}</span>
                            <span className="text-[11px] text-slate-500">{a.dimensions}</span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600">
                            <span className="block text-slate-800 font-medium">{a.framing}</span>
                            {a.certificateOfAuthenticity && (
                              <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-semibold rounded-md mt-1">
                                Certificate Included
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right font-semibold text-slate-900 tabular-nums">
                            {a.price.toLocaleString()} RWF
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() => handleToggleListingStatus(a.id, "ARTWORK")}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
                                a.status === "Published"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              {a.status}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditArtwork(a)}
                                className="px-2.5 py-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-xs transition-colors shadow-2xs"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteListing(a.id, "ARTWORK")}
                                className="px-2.5 py-1 border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium rounded-lg text-xs transition-colors shadow-2xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── TAB: ARTIST APPLICATIONS & CURATORIAL APPROVALS ── */}
          {tab === "artist_applications" && (
            <div className="space-y-6">
              {/* Approval Success Notification Banner */}
              {approvalBannerMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between text-xs font-semibold shadow-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{approvalBannerMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setApprovalBannerMsg(null)}
                    className="text-emerald-700 hover:text-emerald-950 font-bold ml-3 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Total Submissions</span>
                  <span className="text-2xl font-bold text-slate-900 block">{artistApps.length}</span>
                  <span className="text-[11px] text-slate-400 mt-1 block">Rwandan visual artists & sculptors</span>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Awaiting Curatorial Review</span>
                  <span className="text-2xl font-bold text-amber-600 block">
                    {artistApps.filter((a) => a.status === "PENDING").length}
                  </span>
                  <span className="text-[11px] text-amber-700/80 mt-1 block">Portal locked until admin approval</span>
                </div>
                <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Approved & Portal Active</span>
                  <span className="text-2xl font-bold text-emerald-600 block">
                    {artistApps.filter((a) => a.status === "APPROVED").length}
                  </span>
                  <span className="text-[11px] text-emerald-700/80 mt-1 block">Official credentials dispatched via email</span>
                </div>
              </div>

              {/* Search & Status Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 border border-slate-200/80 rounded-xl shadow-xs">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search applicants by name, email, city, medium…"
                    value={artistAppSearch}
                    onChange={(e) => setArtistAppSearch(e.target.value)}
                    className="w-full border border-slate-200 text-xs pl-9 pr-3 py-2 rounded-lg bg-slate-50/50 text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600/20 transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(["ALL", "PENDING", "APPROVED", "DECLINED"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setArtistAppFilter(st)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                        artistAppFilter === st
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st === "ALL"
                        ? `All (${artistApps.length})`
                        : st === "PENDING"
                        ? `Pending (${artistApps.filter((a) => a.status === "PENDING").length})`
                        : st === "APPROVED"
                        ? `Approved (${artistApps.filter((a) => a.status === "APPROVED").length})`
                        : `Declined (${artistApps.filter((a) => a.status === "DECLINED").length})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Artist Applications Table */}
              <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[850px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px]">
                        Artist & Studio City
                      </th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px]">
                        Discipline / Medium
                      </th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px]">
                        Contact Information
                      </th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px]">
                        Portfolio & Work
                      </th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px]">
                        Curatorial Status
                      </th>
                      <th className="px-4 py-3 font-semibold uppercase tracking-wider text-slate-500 text-[11px] text-right">
                        Administrative Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {artistApps
                      .filter((a) => {
                        if (artistAppFilter !== "ALL" && a.status !== artistAppFilter) return false;
                        if (!artistAppSearch.trim()) return true;
                        const q = artistAppSearch.toLowerCase();
                        return (
                          a.name.toLowerCase().includes(q) ||
                          a.email.toLowerCase().includes(q) ||
                          a.city.toLowerCase().includes(q) ||
                          a.medium.toLowerCase().includes(q)
                        );
                      })
                      .map((a) => (
                        <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-900">{a.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {a.city}, Rwanda • Ref: <span className="font-mono">{a.id}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Applied: {new Date(a.appliedAt).toLocaleDateString()}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-medium text-slate-800 block">{a.medium}</span>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 max-w-xs">
                              {a.bio}
                            </p>
                          </td>

                          <td className="px-4 py-3.5">
                            <a
                              href={`mailto:${a.email}`}
                              className="text-slate-900 hover:text-emerald-700 font-mono text-[11px] block underline"
                            >
                              {a.email}
                            </a>
                            <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">
                              {a.phone}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="space-y-1">
                              {a.portfolioUrl ? (
                                <a
                                  href={a.portfolioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-medium"
                                >
                                  <span>Portfolio Link</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-[11px] text-slate-400">No link provided</span>
                              )}
                              {a.sampleArtworkUrl && (
                                <a
                                  href={a.sampleArtworkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-[10px] text-slate-500 hover:text-slate-800 underline truncate max-w-[120px]"
                                >
                                  View Sample Work
                                </a>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            {a.status === "PENDING" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span>Pending Review</span>
                              </span>
                            )}
                            {a.status === "APPROVED" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Portal Active</span>
                              </span>
                            )}
                            {a.status === "DECLINED" && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                <span>Declined</span>
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedAppModal(a)}
                                className="px-2.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg shadow-2xs transition-colors cursor-pointer"
                              >
                                View Details
                              </button>

                              {a.status === "PENDING" && (
                                <>
                                  <button
                                    type="button"
                                    disabled={approvingAppId === a.id}
                                    onClick={() => handleApproveArtist(a)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                                  >
                                    {approvingAppId === a.id ? (
                                      <span>Approving…</span>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Approve</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeclineArtist(a)}
                                    className="px-2 py-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                                    title="Decline"
                                  >
                                    ✕
                                  </button>
                                </>
                              )}

                              {a.status === "APPROVED" && (
                                <button
                                  type="button"
                                  disabled={approvingAppId === a.id}
                                  onClick={() => handleApproveArtist(a)}
                                  className="px-2.5 py-1.5 border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                  title="Resend official portal access email"
                                >
                                  {approvingAppId === a.id ? "Sending…" : "Resend Invite"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                    {artistApps.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                          No artist applications found in this filter view.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Modal: View Artist Application Full Details ── */}
          {selectedAppModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-7 shadow-2xl my-8 max-h-[90vh] overflow-y-auto space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                        Artist Representation Application
                      </span>
                      {selectedAppModal.status === "PENDING" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Pending Review
                        </span>
                      )}
                      {selectedAppModal.status === "APPROVED" && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Approved
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-serif font-medium text-slate-900 mt-1">
                      {selectedAppModal.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAppModal(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Studio City</span>
                    <span className="font-semibold text-slate-800">{selectedAppModal.city}, Rwanda</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Primary Medium</span>
                    <span className="font-semibold text-slate-800">{selectedAppModal.medium}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email</span>
                    <a href={`mailto:${selectedAppModal.email}`} className="font-mono text-emerald-700 underline">
                      {selectedAppModal.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone / WhatsApp</span>
                    <span className="font-mono text-slate-800">{selectedAppModal.phone}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Artist Statement & Bio
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 p-3.5 rounded-xl whitespace-pre-line">
                    {selectedAppModal.bio}
                  </p>
                </div>

                {selectedAppModal.portfolioUrl && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Portfolio / Web Showcase
                    </h4>
                    <a
                      href={selectedAppModal.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-mono inline-flex items-center gap-1.5 underline"
                    >
                      <span>{selectedAppModal.portfolioUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {selectedAppModal.sampleArtworkUrl && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Sample Artwork Link
                    </h4>
                    <a
                      href={selectedAppModal.sampleArtworkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-600 hover:text-slate-900 font-mono inline-flex items-center gap-1.5 underline"
                    >
                      <span>{selectedAppModal.sampleArtworkUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedAppModal(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Close
                  </button>

                  {selectedAppModal.status === "PENDING" && (
                    <button
                      type="button"
                      disabled={approvingAppId === selectedAppModal.id}
                      onClick={async () => {
                        await handleApproveArtist(selectedAppModal);
                        setSelectedAppModal(null);
                      }}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{approvingAppId === selectedAppModal.id ? "Approving…" : "Approve Artist & Unlock Portal"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── CMS ── */}
          {tab === "cms" && (
            <div className="space-y-6">
              <div className="space-y-4">
                {cmsSections.map((s) => (
                  <div key={s.key} className="border border-slate-200/80 bg-white rounded-xl shadow-xs overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/80">
                      <div>
                        <span className="text-sm font-semibold text-slate-900">{s.label}</span>
                        <span className="ml-3 text-xs text-slate-400">Updated {s.lastUpdated}</span>
                      </div>
                      {editSection !== s.key && (
                        <button
                          onClick={() => { setEditSection(s.key); setSectionContent(s.content); }}
                          className="text-xs font-medium text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 bg-white shadow-2xs transition-colors"
                        >
                          Edit Content
                        </button>
                      )}
                    </div>
                    <div className="p-5">
                      {editSection === s.key ? (
                        <div>
                          <textarea
                            value={sectionContent}
                            onChange={(e) => setSectionContent(e.target.value)}
                            rows={4}
                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50/50 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600/20 resize-none transition-all"
                          />
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => saveCmsSection(s.key)}
                              className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 shadow-2xs transition-colors"
                            >
                              Save Changes
                            </button>
                            <button
                              onClick={() => setEditSection(null)}
                              className="px-4 py-2 border border-slate-200 text-xs text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-700 leading-relaxed">{s.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload section */}
              <div className="border border-slate-200/80 bg-white rounded-xl shadow-xs overflow-hidden">
                <div className="border-b border-slate-100 px-5 py-3.5 bg-slate-50/80">
                  <span className="text-sm font-semibold text-slate-900">Media & Asset Repository</span>
                </div>
                <div className="p-6 text-center">
                  <p className="text-xs text-slate-500 mb-3">Upload banners, showcase imagery, and brand assets for site integration.</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf"
                    className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:border file:border-slate-200 file:rounded-lg file:bg-slate-50 file:text-xs file:font-semibold file:text-slate-700 file:cursor-pointer hover:file:bg-slate-100"
                    onChange={() => setAssetUploadFeedback("Asset uploaded and processed successfully.")}
                  />
                  {assetUploadFeedback && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{assetUploadFeedback}</span>
                      <button type="button" onClick={() => setAssetUploadFeedback(null)} className="ml-1 text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── SELLERS ── */}
          {tab === "sellers" && (
            <div className="space-y-6">
              <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                      {["Seller", "Email", "Plan", "Products", "Sales", "Status", ""].map((h) => (
                        <th key={h} className="px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {sellers.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{s.name}</td>
                        <td className="px-5 py-3.5 text-slate-500">{s.email}</td>
                        <td className="px-5 py-3.5 text-slate-700 font-medium">{s.plan}</td>
                        <td className="px-5 py-3.5 tabular-nums text-slate-700">{s.products}</td>
                        <td className="px-5 py-3.5 tabular-nums text-slate-700">{s.sales}</td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              s.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : "bg-rose-50 text-rose-700 border border-rose-200/60"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => toggleSeller(s.id)}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                          >
                            {s.status === "ACTIVE" ? "Suspend" : "Reinstate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SUBSCRIPTIONS ── */}
          {tab === "subscriptions" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Active subscriptions", value: subscriptions.filter((s) => s.status === "ACTIVE").length },
                  { label: "Past due", value: subscriptions.filter((s) => s.status === "PAST_DUE").length },
                  { label: "Monthly recurring", value: `${subscriptions.filter(s => s.status === "ACTIVE").reduce((s, x) => s + x.amount, 0).toLocaleString()} RWF` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-xs">
                    <span className="text-xs font-medium text-slate-500 block mb-1">{label}</span>
                    <span className="text-2xl font-bold text-slate-900 block tabular-nums">{value}</span>
                  </div>
                ))}
              </div>

              <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                      {["Seller", "Plan", "Amount (RWF/mo)", "Status", "Renewal"].map((h) => (
                        <th key={h} className="px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {subscriptions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{s.vendorName}</td>
                        <td className="px-5 py-3.5 text-slate-700 font-medium">{s.plan}</td>
                        <td className="px-5 py-3.5 tabular-nums font-semibold text-slate-900">
                          {s.amount === 0 ? "Free" : `${s.amount.toLocaleString()} RWF`}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              s.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                : s.status === "PAST_DUE"
                                ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {s.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">{s.renewalDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <div className="space-y-6">
              <div className="border border-slate-200/80 rounded-xl bg-white overflow-hidden shadow-xs overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-left">
                      {["User", "Email", "Role", "Joined", ""].map((h) => (
                        <th key={h} className="px-5 py-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {usersList.map((u) => (
                      <tr key={u.email} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-900">{u.name}</td>
                        <td className="px-5 py-3.5 text-slate-500">{u.email}</td>
                        <td className="px-5 py-3.5 font-medium">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.id || u.email, e.target.value)}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border cursor-pointer focus:outline-none transition-colors ${
                              u.role === "Admin"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                                : u.role === "Seller"
                                ? "bg-blue-50 text-blue-700 border-blue-200/80"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            <option value="Customer">Customer</option>
                            <option value="Seller">Seller</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500">{u.joined}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => setViewingUser(u)}
                            className="text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                          >
                            View Account →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SERVICES CARDS MANAGEMENT ── */}
          {tab === "services_cards" && (
            <div className="space-y-6">
              {/* Category Filter Pills & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: "all", label: "All Cards", count: serviceCardsList.length },
                    { id: "design", label: "Graphic Design", count: serviceCardsList.filter((c) => c.category === "design").length },
                    { id: "photography", label: "Photography", count: serviceCardsList.filter((c) => c.category === "photography").length },
                    { id: "videography", label: "Videography", count: serviceCardsList.filter((c) => c.category === "videography").length },
                    { id: "printing", label: "Print Production", count: serviceCardsList.filter((c) => c.category === "printing").length },
                    { id: "marketing", label: "Digital Marketing", count: serviceCardsList.filter((c) => c.category === "marketing").length },
                    { id: "branding", label: "Branding Steps", count: serviceCardsList.filter((c) => c.category === "branding").length },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setServiceCardCatFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        serviceCardCatFilter === filter.id
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span
                        className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                          serviceCardCatFilter === filter.id
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {filter.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search & Add Button */}
                <div className="flex items-center gap-2.5">
                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={serviceCardSearch}
                      onChange={(e) => setServiceCardSearch(e.target.value)}
                      placeholder="Search cards..."
                      className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#128C38]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => openAddServiceCard()}
                    className="px-3.5 py-1.5 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Card</span>
                  </button>
                </div>
              </div>

              {/* Service Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceCardsList
                  .filter((card) => {
                    const matchCategory =
                      serviceCardCatFilter === "all" || card.category === serviceCardCatFilter;
                    const matchSearch =
                      !serviceCardSearch.trim() ||
                      card.title.toLowerCase().includes(serviceCardSearch.toLowerCase()) ||
                      card.description.toLowerCase().includes(serviceCardSearch.toLowerCase()) ||
                      (card.badge && card.badge.toLowerCase().includes(serviceCardSearch.toLowerCase()));
                    return matchCategory && matchSearch;
                  })
                  .map((card) => (
                    <div
                      key={card.id}
                      className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-[#128C38]/40 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                      <div>
                        {/* Card Image Header */}
                        <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-slate-100 flex items-center justify-center p-3">
                          <div
                            className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-20 scale-125 pointer-events-none"
                            style={{ backgroundImage: `url("${resolveMediaUrl(card.image, FALLBACK_SERVICE_IMAGE)}")` }}
                          />
                          <div className="relative w-full h-full z-10 flex items-center justify-center">
                            <img
                              src={resolveMediaUrl(card.image, FALLBACK_SERVICE_IMAGE)}
                              alt={card.title}
                              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-sm"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = FALLBACK_SERVICE_IMAGE;
                              }}
                            />
                          </div>
                          {card.badge && (
                            <span className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 shadow-xs uppercase tracking-wider border border-slate-200/60">
                              {card.badge}
                            </span>
                          )}
                          <span className="absolute top-3 right-3 z-20 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                            {card.category}
                          </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-5">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#128C38] transition-colors leading-snug">
                            {card.title}
                          </h3>
                          <p className="text-xs text-slate-600 leading-relaxed mt-2 line-clamp-3">
                            {card.description}
                          </p>
                          {card.priceOrRate && (
                            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[11px] text-slate-400 font-medium">Session / Rate:</span>
                              <span className="text-xs font-bold text-[#128C38]">{card.priceOrRate}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditServiceCard(card)}
                            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Edit className="w-3 h-3 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteServiceCard(card.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
                            title="Delete Card"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <Link
                          href={
                            card.category === "design"
                              ? "/design"
                              : card.category === "photography"
                              ? "/photography"
                              : card.category === "videography"
                              ? "/videography"
                              : card.category === "printing"
                              ? "/printing"
                              : card.category === "marketing"
                              ? "/digital-marketing"
                              : "/branding"
                          }
                          target="_blank"
                          className="text-[11px] font-semibold text-slate-500 hover:text-[#128C38] flex items-center gap-1"
                        >
                          <span>Live View</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ── BRANDING & BUNDLES MANAGEMENT ── */}
          {tab === "branding_bundles" && (
            <div className="space-y-8">
              {/* Header Box */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#128C38] bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
                      Branding Packages & Bundles
                    </span>
                    <span className="text-xs text-slate-400">· Live on /branding</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    All-Inclusive Brand Bundles Management
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Configure package titles, pricing, descriptions, and feature checklists. Any edits reflect immediately on the live branding page.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <Link
                    href="/branding"
                    target="_blank"
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>View /branding</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <button
                    type="button"
                    onClick={openAddBrandBundle}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#128C38] hover:bg-[#0E6C2B] rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Brand Bundle</span>
                  </button>
                </div>
              </div>

              {/* 3 Bundles Grid (Screenshot 3 Matching Layout) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {brandBundlesList.map((bundle) => (
                  <div
                    key={bundle.id}
                    className={`relative rounded-3xl p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between ${
                      bundle.popular
                        ? "bg-slate-900 text-white shadow-2xl border-2 border-[#128C38] md:-translate-y-2"
                        : "bg-white text-slate-900 shadow-sm border border-slate-200/80"
                    }`}
                  >
                    {bundle.popular && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#128C38] text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                        RECOMMENDED
                      </span>
                    )}

                    <div>
                      {/* Bundle Name & Description */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                          {bundle.name}
                        </h3>
                      </div>
                      <p
                        className={`text-xs mt-2 leading-relaxed min-h-[36px] ${
                          bundle.popular ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {bundle.description}
                      </p>

                      {/* Price Display */}
                      <div className="flex items-baseline gap-1.5 my-6">
                        <span className="text-3xl sm:text-4xl font-black tracking-tight">
                          {bundle.price}
                        </span>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            bundle.popular ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          RWF
                        </span>
                      </div>

                      {/* Inclusions Header */}
                      <div className="pt-4 border-t border-slate-100/20 mb-4">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#128C38] block">
                          WHAT'S INCLUDED:
                        </span>
                      </div>

                      {/* Features Checklist */}
                      <ul className="space-y-3 mb-8">
                        {bundle.includes.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs">
                            <Check className="w-4 h-4 text-[#128C38] shrink-0 mt-0.5" />
                            <span
                              className={`leading-snug ${
                                bundle.popular ? "text-slate-200" : "text-slate-700"
                              }`}
                            >
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="pt-4 border-t border-slate-100/10 space-y-2">
                      <button
                        type="button"
                        onClick={() => openEditBrandBundle(bundle)}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          bundle.popular
                            ? "bg-[#128C38] hover:bg-[#0E6C2B] text-white shadow-md"
                            : "bg-slate-900 hover:bg-slate-800 text-white"
                        }`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit Bundle & Features</span>
                      </button>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = brandBundlesList.map((b) =>
                              b.id === bundle.id ? { ...b, popular: !b.popular } : b
                            );
                            setBrandBundlesList(updated);
                            saveStoredBrandBundles(updated);
                          }}
                          className={`text-[11px] font-semibold transition-colors cursor-pointer ${
                            bundle.popular
                              ? "text-emerald-400 hover:text-emerald-300"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {bundle.popular ? "★ Recommended" : "☆ Set Recommended"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteBrandBundle(bundle.id)}
                          className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete Bundle</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sub-Section: Branding Journey Roadmap (8 Step Cards) */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Branding Journey (8-Step Roadmap Cards)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Step cards displayed on `/branding` illustrating the full brand creation process.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAddServiceCard("branding")}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Roadmap Step</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {serviceCardsList
                    .filter((c) => c.category === "branding")
                    .map((step) => (
                      <div
                        key={step.id}
                        className="p-4 rounded-xl border border-slate-200 hover:border-[#128C38]/40 transition-all flex flex-col justify-between bg-slate-50/50"
                      >
                        <div>
                          <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-200 mb-3">
                            <img
                              src={resolveMediaUrl(step.image, FALLBACK_SERVICE_IMAGE)}
                              alt={step.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = FALLBACK_SERVICE_IMAGE;
                              }}
                            />
                            <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-extrabold uppercase px-2 py-0.5 rounded">
                              {step.badge || "STEP"}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{step.title}</h4>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                        <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => openEditServiceCard(step)}
                            className="text-xs font-bold text-[#128C38] hover:text-[#0E6C2B] flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit Step</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteServiceCard(step.id)}
                            className="text-xs text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

      {/* ── CREATE / EDIT ARTWORK MODAL ── */}
      {isModalOpen && modalType === "ARTWORK" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/80 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                  {editingId ? "Update Artwork" : "Curated Fine Art Piece"}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingId ? "Edit Curated Fine Art" : "Upload Curated Fine Art Piece"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Split Layout: Form on Left (7 cols), Live Card Preview on Right (5 cols) */}
            <form onSubmit={handleSaveListing} className="p-6 grid lg:grid-cols-12 gap-8 items-start">
              {listingModalError && (
                <div className="lg:col-span-12 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{listingModalError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setListingModalError(null)}
                    className="text-rose-600 hover:text-rose-900 font-bold ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {/* ── Left Form Fields ── */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Artwork Title *
                  </label>
                      <input
                        type="text"
                        required
                        value={artForm.title}
                        onChange={(e) => setArtForm({ ...artForm, title: e.target.value })}
                        placeholder="e.g. Imigongo Modern Fusion"
                        className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Artist / Studio Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={artForm.artistName}
                          onChange={(e) => setArtForm({ ...artForm, artistName: e.target.value })}
                          placeholder="JREAL Curated Studio"
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          City (Rwanda) *
                        </label>
                        <input
                          type="text"
                          required
                          value={artForm.artistCity}
                          onChange={(e) => setArtForm({ ...artForm, artistCity: e.target.value })}
                          placeholder="Kigali"
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        />
                      </div>
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
                          Price in RWF *
                        </label>
                        <input
                          type="number"
                          required
                          value={artForm.price}
                          onChange={(e) => setArtForm({ ...artForm, price: Number(e.target.value) })}
                          placeholder="320000"
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Creation Year
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
                          Weight (kg)
                        </label>
                        <input
                          type="text"
                          value={artForm.weight}
                          onChange={(e) => setArtForm({ ...artForm, weight: e.target.value })}
                          placeholder="4.0 kg"
                          className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        />
                      </div>
                    </div>

                    {/* Quick Image Presets & Upload */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700">
                          Artwork Image *
                        </label>
                        {isUploadingArtImage && (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Uploading to Cloudinary...
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                        <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold cursor-pointer transition-colors shrink-0">
                          <Upload className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Upload Artwork Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadArtImage}
                            disabled={isUploadingArtImage}
                            className="hidden"
                          />
                        </label>
                        <input
                          type="text"
                          value={artForm.image}
                          onChange={(e) => setArtForm({ ...artForm, image: e.target.value })}
                          placeholder="Or paste Cloudinary / custom image URL"
                          className="w-full text-xs p-2 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-gray-400 font-semibold self-center mr-1">Presets:</span>
                        {ARTWORK_IMAGE_PRESETS.map((p) => (
                          <button
                            key={p.url}
                            type="button"
                            onClick={() => setArtForm({ ...artForm, image: p.url })}
                            className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                              resolveMediaUrl(artForm.image) === p.url
                                ? "bg-[#128C38] text-white border-[#128C38]"
                                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                            }`}
                          >
                            {p.label.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Certificate & Status */}
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded bg-gray-50">
                      <div>
                        <span className="text-xs font-bold text-gray-900 block">Certificate of Authenticity</span>
                        <span className="text-[10px] text-gray-500">Includes embossed certificate signed by curator</span>
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
                        Curator Statement & Description
                      </label>
                      <textarea
                        rows={3}
                        value={artForm.description}
                        onChange={(e) => setArtForm({ ...artForm, description: e.target.value })}
                        placeholder="Inspiration, symbolism, technique, and provenance of the piece..."
                        className="w-full text-xs p-2.5 rounded bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38]"
                      />
                    </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#128C38] hover:bg-[#0f7230] text-white text-xs font-bold rounded shadow-2xs transition-colors"
                  >
                    {editingId ? "Save Listing Updates" : "Publish to Catalog"}
                  </button>
                </div>
              </div>

              {/* ── Right Column: Live Card Preview ── */}
              <div className="lg:col-span-5 bg-gray-50 border border-gray-200 p-5 rounded space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Live Catalog Card Preview
                  </span>
                  <span className="text-[10px] font-mono text-[#128C38] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Exact Buyer View
                  </span>
                </div>

                  {/* ── Art Gallery Card Preview ── */}
                  <div className="bg-white border border-gray-200 shadow-sm rounded overflow-hidden">
                    <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                      <img
                        src={resolveMediaUrl(artForm.image, FALLBACK_ARTWORK_IMAGE)}
                        alt={artForm.title || "Artwork Preview"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_ARTWORK_IMAGE;
                        }}
                      />
                      <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-2xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                        {artForm.dimensions || "100 × 80 cm"}
                      </div>
                      {artForm.certificateOfAuthenticity && (
                        <div className="absolute bottom-2.5 left-2.5 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                          Certificate Included
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-1.5">
                      <div className="text-[11px] text-gray-500 font-medium">
                        {artForm.artistName || "JREAL Curated Studio"} · {artForm.artistCity || "Kigali"} ({artForm.year || "2026"})
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1">
                        {artForm.title || "Untitled Artwork"}
                      </h4>
                      <p className="text-[11px] text-gray-600 line-clamp-1">
                        {artForm.medium || "Mixed Media"} • {artForm.framing || "Framed"}
                      </p>
                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-gray-900">
                          {Number(artForm.price || 0).toLocaleString()} RWF
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#128C38] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Escrow Protected
                        </span>
                      </div>
                    </div>
                  </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ── SERVICE BOOKING MODAL (PHOTOGRAPHY, VIDEOGRAPHY, PRINT) ── */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/80 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                  {editingBookingId ? "Update Booking" : "New Service Booking"}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingBookingId ? `Edit Booking #${bookingForm.bookingRef}` : "Schedule Shoot / Print Order"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="p-6 space-y-5">
              {bookingModalError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingModalError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingModalError(null)}
                    className="text-rose-600 hover:text-rose-900 font-bold ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
              {/* Category & Shoot Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  Service Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Photography", "Videography", "Print"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        const defaultType = SERVICE_TYPE_PRESETS[cat][0];
                        setBookingForm((prev) => ({
                          ...prev,
                          serviceCategory: cat,
                          shootType: defaultType,
                        }));
                      }}
                      className={`py-2 text-xs font-bold rounded border transition-colors ${
                        bookingForm.serviceCategory === cat
                          ? "bg-[#128C38] text-white border-[#128C38]"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shoot Type with Preset Badges */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Shoot / Production Job Type *
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SERVICE_TYPE_PRESETS[bookingForm.serviceCategory].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBookingForm((prev) => ({ ...prev, shootType: type }))}
                      className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                        bookingForm.shootType === type
                          ? "bg-emerald-50 text-[#128C38] border-emerald-300 font-bold"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={bookingForm.shootType}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, shootType: e.target.value }))}
                  placeholder="Or enter custom shoot / job description..."
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                  required
                />
              </div>

              {/* Client Info (3 columns) */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Client / Org Name *</label>
                  <input
                    type="text"
                    value={bookingForm.clientName}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, clientName: e.target.value }))}
                    placeholder="e.g. Bank of Kigali / Patrick M."
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    value={bookingForm.clientPhone}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, clientPhone: e.target.value }))}
                    placeholder="+250 788 000 000"
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Client Email</label>
                  <input
                    type="email"
                    value={bookingForm.clientEmail}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, clientEmail: e.target.value }))}
                    placeholder="client@company.rw"
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                  />
                </div>
              </div>

              {/* Date & Location */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Event / Shoot Date *</label>
                  <input
                    type="date"
                    value={bookingForm.eventDate}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Shoot Venue / Print Delivery Address *</label>
                  <input
                    type="text"
                    value={bookingForm.location}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Kigali Convention Centre / Intare Arena / KG 15 Ave"
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                    required
                  />
                </div>
              </div>

              {/* Location Landmark & Google Maps Link */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Venue Landmark / Hall / Room</label>
                  <input
                    type="text"
                    value={bookingForm.locationLandmark}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, locationLandmark: e.target.value }))}
                    placeholder="e.g. Ballroom Gate 2, 4th Floor Balcony"
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Google Maps Pin Link</label>
                  <input
                    type="url"
                    value={bookingForm.locationUrl}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, locationUrl: e.target.value }))}
                    placeholder="https://maps.google.com/?q=-1.9536,30.0934"
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                  />
                </div>
              </div>

              {/* Quote Price, Deposit, and Assigned Staff Member */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quote Price (RWF) *</label>
                  <input
                    type="number"
                    value={bookingForm.price}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                    min={0}
                    step={1000}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Deposit Status</label>
                  <select
                    value={bookingForm.depositStatus}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        depositStatus: e.target.value as ServiceBooking["depositStatus"],
                      }))
                    }
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                  >
                    <option value="PAID">Deposit Paid (Down payment received)</option>
                    <option value="FULLY_PAID">Fully Paid 100%</option>
                    <option value="PENDING_DEPOSIT">Pending Deposit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Staff Lead *</label>
                  <select
                    value={bookingForm.assignedStaffId}
                    onChange={(e) => {
                      const staff = staffList.find((s) => s.id === e.target.value);
                      setBookingForm((prev) => ({
                        ...prev,
                        assignedStaffId: e.target.value,
                        assignedStaffName: staff ? staff.name : prev.assignedStaffName,
                      }));
                    }}
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                  >
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.role} ({s.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status & Deliverables Link */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Workflow Status</label>
                  <select
                    value={bookingForm.status}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        status: e.target.value as ServiceBooking["status"],
                      }))
                    }
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                  >
                    <option value="CONFIRMED">CONFIRMED (Ready to execute)</option>
                    <option value="IN_PRODUCTION">IN PRODUCTION (Shooting / Editing / Press)</option>
                    <option value="PENDING">PENDING (Awaiting client info or deposit)</option>
                    <option value="COMPLETED">COMPLETED (Delivered to client)</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Deliverables Link (Google Drive / WeTransfer)</label>
                  <input
                    type="url"
                    value={bookingForm.deliverablesUrl}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, deliverablesUrl: e.target.value }))}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                  />
                </div>
              </div>

              {/* Notes / Brief */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Creative Brief & Shoot Instructions
                </label>
                <textarea
                  rows={2}
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Special gear requirements, drone flight permits, shot list, client specifics..."
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#128C38] hover:bg-[#0f7230] text-white text-xs font-bold rounded shadow-2xs"
                >
                  {editingBookingId ? "Update Booking" : "Create Booking"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── STAFF CREW MEMBER MODAL ── */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/80 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                  {editingStaffId ? "Update Staff Profile" : "New Team Member"}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingStaffId ? `Edit ${staffForm.name}` : "Add Creative Crew Member"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="p-6 space-y-4">
              {staffModalError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{staffModalError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStaffModalError(null)}
                    className="text-rose-600 hover:text-rose-900 font-bold ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Eric Mugabo"
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department *</label>
                  <select
                    value={staffForm.department}
                    onChange={(e) =>
                      setStaffForm((prev) => ({
                        ...prev,
                        department: e.target.value as StaffMember["department"],
                      }))
                    }
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                  >
                    <option value="Photography">Photography</option>
                    <option value="Videography">Videography</option>
                    <option value="Print">Print</option>
                    <option value="Creative Direction">Creative Direction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Role / Job Title *</label>
                  <input
                    type="text"
                    value={staffForm.role}
                    onChange={(e) => setStaffForm((prev) => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g. Lead Photographer"
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+250 788 123 456"
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="staff@jreal.rw"
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Initial Status</label>
                <select
                  value={staffForm.status}
                  onChange={(e) =>
                    setStaffForm((prev) => ({
                      ...prev,
                      status: e.target.value as StaffMember["status"],
                    }))
                  }
                  className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                >
                  <option value="Available">Available (Ready for assignment)</option>
                  <option value="On Shoot">On Shoot (In the field)</option>
                  <option value="In Print Production">In Print Production (Press work)</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsStaffModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#128C38] hover:bg-[#0f7230] text-white text-xs font-bold rounded shadow-2xs"
                >
                  {editingStaffId ? "Update Staff" : "Add Staff Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PORTFOLIO SHOWCASE CRUD MODAL WITH LIVE CARD PREVIEW ── */}
      {isPortfolioModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/80 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                  {editingPortfolioId ? "Update Showcase" : "New Showcase Project"}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingPortfolioId ? "Edit Showcase Item" : "Publish Portfolio Showcase"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPortfolioModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePortfolioItem} className="p-6 grid lg:grid-cols-12 gap-8 items-start">
              {portfolioModalError && (
                <div className="lg:col-span-12 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{portfolioModalError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPortfolioModalError(null)}
                    className="text-rose-600 hover:text-rose-900 font-bold ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Project Title *</label>
                  <input
                    type="text"
                    value={portfolioForm.title}
                    onChange={(e) => setPortfolioForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Kigali Bistro Brand Identity"
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
                    <select
                      value={portfolioForm.category}
                      onChange={(e) =>
                        setPortfolioForm((prev) => ({
                          ...prev,
                          category: e.target.value as AdminPortfolioItem["category"],
                        }))
                      }
                      className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                    >
                      {PORTFOLIO_CATEGORY_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Client / Brand *</label>
                    <input
                      type="text"
                      value={portfolioForm.clientName}
                      onChange={(e) => setPortfolioForm((prev) => ({ ...prev, clientName: e.target.value }))}
                      placeholder="e.g. Bank of Kigali / Patrick M."
                      className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Completion Year</label>
                    <input
                      type="text"
                      value={portfolioForm.year}
                      onChange={(e) => setPortfolioForm((prev) => ({ ...prev, year: e.target.value }))}
                      placeholder="2026"
                      className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Publication Status</label>
                    <select
                      value={portfolioForm.status}
                      onChange={(e) =>
                        setPortfolioForm((prev) => ({
                          ...prev,
                          status: e.target.value as AdminPortfolioItem["status"],
                        }))
                      }
                      className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                    >
                      <option value="Published">Published (Live in Gallery)</option>
                      <option value="Draft">Draft (Internal Only)</option>
                    </select>
                  </div>
                </div>

                {/* Preset Image Selector & Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      Project Showcase Image *
                    </label>
                    {isUploadingPortfolioImage && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading to Cloudinary...
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {PORTFOLIO_IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setPortfolioForm((prev) => ({ ...prev, image: preset.url }))}
                        className={`text-[10px] p-2 rounded border text-left flex flex-col gap-1 transition-colors ${
                          resolveMediaUrl(portfolioForm.image) === preset.url
                            ? "border-[#128C38] bg-emerald-50 text-[#128C38] font-bold"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="truncate">{preset.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold cursor-pointer transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Upload Project Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadPortfolioImage}
                        disabled={isUploadingPortfolioImage}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={portfolioForm.image}
                      onChange={(e) => setPortfolioForm((prev) => ({ ...prev, image: e.target.value }))}
                      placeholder="Or enter Cloudinary / custom image URL"
                      className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Showcase Description *</label>
                  <textarea
                    rows={3}
                    value={portfolioForm.description}
                    onChange={(e) => setPortfolioForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Briefly describe the brief, challenge, delivered outputs and client feedback..."
                    className="w-full text-xs border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 focus:outline-hidden focus:border-[#128C38]"
                    required
                  />
                </div>

                {/* Featured checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="portfolioFeatured"
                    checked={portfolioForm.featured}
                    onChange={(e) => setPortfolioForm((prev) => ({ ...prev, featured: e.target.checked }))}
                    className="rounded text-[#128C38] focus:ring-[#128C38] h-4 w-4"
                  />
                  <label htmlFor="portfolioFeatured" className="text-xs text-gray-700 font-medium cursor-pointer">
                    Feature on Homepage Showcase (Highlighted carousel/marquee)
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPortfolioModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#128C38] hover:bg-[#0f7230] text-white text-xs font-bold rounded shadow-2xs"
                  >
                    {editingPortfolioId ? "Update Project" : "Publish Showcase"}
                  </button>
                </div>
              </div>

              {/* Right Column: Live Card Preview */}
              <div className="lg:col-span-5 bg-gray-50 border border-gray-200 p-5 rounded space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Live Showcase Card Preview
                  </span>
                  <span className="text-[10px] font-mono text-[#128C38] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Public /portfolio View
                  </span>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm rounded overflow-hidden">
                  <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                    <img
                      src={resolveMediaUrl(portfolioForm.image, PORTFOLIO_IMAGE_PRESETS[0]?.url || FALLBACK_SERVICE_IMAGE)}
                      alt={portfolioForm.title || "Project Preview"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          PORTFOLIO_IMAGE_PRESETS[0]?.url || FALLBACK_SERVICE_IMAGE;
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-2xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {portfolioForm.category || "Branding"}
                    </div>
                    {portfolioForm.featured && (
                      <div className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                        ★ Featured
                      </div>
                    )}
                    <div className="absolute bottom-2.5 left-2.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-2xs font-mono">
                      {portfolioForm.year || "2026"}
                    </div>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <div className="text-[11px] text-gray-500 font-medium">
                      {portfolioForm.clientName || "Client Name"}
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1">
                      {portfolioForm.title || "Showcase Project Title"}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {portfolioForm.description || "Project summary description will display here."}
                    </p>
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">Status:</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          portfolioForm.status === "Published"
                            ? "bg-emerald-50 text-[#128C38] border border-emerald-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {portfolioForm.status}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SERVICE CARD (ADD / EDIT) MODAL WITH LIVE PREVIEW ── */}
      {isServiceCardModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/80 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#128C38]">
                  {editingCardId ? "Edit Service Offering" : "New Service Offering"}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingCardId ? "Update Service Card" : "Add Service Card to Public Page"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsServiceCardModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveServiceCard} className="p-6 grid lg:grid-cols-12 gap-8 items-start">
              {cardModalError && (
                <div className="lg:col-span-12 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{cardModalError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCardModalError(null)}
                    className="text-rose-600 hover:text-rose-900 font-bold ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
              {/* Form on Left (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Page / Category *</label>
                    <select
                      value={cardForm.category}
                      onChange={(e) =>
                        setCardForm((prev) => ({
                          ...prev,
                          category: e.target.value as ServiceCardItem["category"],
                        }))
                      }
                      className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:border-[#128C38]"
                    >
                      <option value="design">Graphic Design (/design)</option>
                      <option value="photography">Photography (/photography)</option>
                      <option value="videography">Videography (/videography)</option>
                      <option value="printing">Print Production (/printing)</option>
                      <option value="marketing">Digital Marketing (/digital-marketing)</option>
                      <option value="branding">Branding Roadmap Step (/branding)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text (Optional)</label>
                    <input
                      type="text"
                      value={cardForm.badge || ""}
                      onChange={(e) => setCardForm((prev) => ({ ...prev, badge: e.target.value }))}
                      placeholder="e.g. STUDIO & LOCATION, 24H"
                      className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:border-[#128C38]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Card Title *</label>
                  <input
                    type="text"
                    value={cardForm.title}
                    onChange={(e) => setCardForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Product Photography"
                    className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:border-[#128C38]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price or Session Rate</label>
                  <input
                    type="text"
                    value={cardForm.priceOrRate || ""}
                    onChange={(e) => setCardForm((prev) => ({ ...prev, priceOrRate: e.target.value }))}
                    placeholder="e.g. From 50,000 RWF or 25,000 RWF"
                    className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:border-[#128C38]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Service Image *</label>
                    {isUploadingCardImage && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading to Cloudinary...
                      </span>
                    )}
                  </div>

                  {/* Preset Dropdown */}
                  <select
                    value={resolveMediaUrl(cardForm.image, "")}
                    onChange={(e) => {
                      if (e.target.value) {
                        setCardForm((prev) => ({ ...prev, image: e.target.value }));
                      }
                    }}
                    className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:border-[#128C38] mb-2"
                  >
                    <option value="">-- Select from Preset Images --</option>
                    {AVAILABLE_SERVICE_IMAGES.map((img) => (
                      <option key={img.path} value={img.path}>
                        {img.label}
                      </option>
                    ))}
                  </select>

                  {/* Upload button & direct URL input row */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600/30 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold cursor-pointer transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Upload from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadCardImage}
                        disabled={isUploadingCardImage}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      value={cardForm.image || ""}
                      onChange={(e) => setCardForm((prev) => ({ ...prev, image: e.target.value }))}
                      placeholder="Or paste Cloudinary / custom image URL"
                      className="w-full text-xs border border-slate-300 rounded px-3 py-1.5 bg-white text-slate-900 font-mono text-[11px] focus:outline-hidden focus:border-[#128C38]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Description *</label>
                  <textarea
                    rows={3}
                    value={cardForm.description}
                    onChange={(e) => setCardForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what is provided in this service offering..."
                    className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:border-[#128C38]"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsServiceCardModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                  >
                    {editingCardId ? "Save Changes" : "Create Service Card"}
                  </button>
                </div>
              </div>

              {/* Live Preview on Right (5 cols - matching Screenshot 2) */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Live Public Card Preview
                  </span>
                  <span className="text-[10px] font-mono text-[#128C38] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase font-bold">
                    /{cardForm.category}
                  </span>
                </div>

                {/* Card Container mimicking Screenshot 2 */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="relative w-full h-44 overflow-hidden bg-slate-100">
                    <img
                      src={resolveMediaUrl(cardForm.image, AVAILABLE_SERVICE_IMAGES[0]?.path || FALLBACK_SERVICE_IMAGE)}
                      alt={cardForm.title || "Preview"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          AVAILABLE_SERVICE_IMAGES[0]?.path || FALLBACK_SERVICE_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    {cardForm.badge && (
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-800 shadow-xs uppercase tracking-wider">
                        {cardForm.badge}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-[#128C38] leading-snug">
                      {cardForm.title || "Service Title"}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2 line-clamp-3">
                      {cardForm.description || "Crisp, studio-lit images on pure white backgrounds and lifestyle staging for e-commerce, catalogs, and social media."}
                    </p>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Session rate</span>
                        <span className="text-xs font-extrabold text-[#128C38]">
                          {cardForm.priceOrRate || "From 50,000 RWF"}
                        </span>
                      </div>
                      <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-900 text-xs font-bold inline-flex items-center">
                        Book Shoot
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── BRAND BUNDLE (ADD / EDIT) MODAL WITH LIVE PREVIEW (Screenshot 3) ── */}
      {isBundleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/80 w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#128C38]">
                  {editingBundleId ? "Edit All-Inclusive Bundle" : "New All-Inclusive Bundle"}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingBundleId ? `Edit ${bundleForm.name}` : "Create Brand Bundle (Live on /branding)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBundleModalOpen(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 text-sm font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBrandBundle} className="p-6 grid lg:grid-cols-12 gap-8 items-start">
              {bundleModalError && (
                <div className="lg:col-span-12 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bundleModalError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBundleModalError(null)}
                    className="text-rose-600 hover:text-rose-900 font-bold ml-2 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}
              {/* Form on Left (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bundle Name *</label>
                    <input
                      type="text"
                      value={bundleForm.name}
                      onChange={(e) => setBundleForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Business Growth Bundle"
                      className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:border-[#128C38]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Price in RWF *</label>
                    <input
                      type="text"
                      value={bundleForm.price}
                      onChange={(e) => setBundleForm((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="e.g. 650,000"
                      className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:border-[#128C38]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Detail / Subtitle Description *
                  </label>
                  <textarea
                    rows={2}
                    value={bundleForm.description}
                    onChange={(e) => setBundleForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g. Complete identity with physical merch and professional photo session."
                    className="w-full text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:border-[#128C38]"
                    required
                  />
                </div>

                {/* Recommended Toggle Checkbox */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <label htmlFor="bundlePopularToggle" className="text-xs font-bold text-slate-900 block cursor-pointer">
                      Mark as RECOMMENDED (Featured Dark Card)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Displays green RECOMMENDED badge and dark sleek styling matching Screenshot 3.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    id="bundlePopularToggle"
                    checked={bundleForm.popular}
                    onChange={(e) => setBundleForm((prev) => ({ ...prev, popular: e.target.checked }))}
                    className="h-4 w-4 rounded text-[#128C38] focus:ring-[#128C38] cursor-pointer"
                  />
                </div>

                {/* Features & Deliverables Checklist Editor */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-900">
                        WHAT'S INCLUDED / DELIVERABLES CHECKLIST
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Features with green checkmarks displayed under this bundle.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#128C38] bg-emerald-50 px-2 py-0.5 rounded">
                      {bundleForm.includes.length} items
                    </span>
                  </div>

                  {/* Existing Feature Items */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {bundleForm.includes.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#128C38] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleUpdateFeatureText(idx, e.target.value)}
                          className="flex-1 text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900 focus:outline-hidden focus:border-[#128C38]"
                          placeholder="Feature item description..."
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFeatureFromBundle(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Delete feature item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Feature Row */}
                  <div className="flex items-center gap-2 pt-3 mt-2 border-t border-slate-200">
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddFeatureToBundle();
                        }
                      }}
                      placeholder="Type deliverable (e.g. 10 Branded Staff T-Shirts)..."
                      className="flex-1 text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-900 focus:outline-hidden focus:border-[#128C38]"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeatureToBundle}
                      className="px-3.5 py-2 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Feature</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsBundleModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#128C38] hover:bg-[#0E6C2B] text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer"
                  >
                    {editingBundleId ? "Save Changes" : "Create Brand Bundle"}
                  </button>
                </div>
              </div>

              {/* Live Preview on Right (5 cols - matching Screenshot 3) */}
              <div className="lg:col-span-5 bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Live /branding Bundle Preview
                  </span>
                  <span className="text-[10px] font-mono text-[#128C38] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase font-bold">
                    Screenshot 3 Match
                  </span>
                </div>

                {/* Bundle Card Preview */}
                <div
                  className={`relative rounded-3xl p-6 transition-all duration-300 ${
                    bundleForm.popular
                      ? "bg-slate-900 text-white shadow-xl border-2 border-[#128C38]"
                      : "bg-white text-slate-900 shadow-sm border border-slate-200"
                  }`}
                >
                  {bundleForm.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#128C38] text-white text-[10px] font-extrabold uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
                      RECOMMENDED
                    </span>
                  )}

                  <h3 className="text-xl font-black tracking-tight leading-tight">
                    {bundleForm.name || "Bundle Name"}
                  </h3>
                  <p
                    className={`text-xs mt-2 leading-relaxed ${
                      bundleForm.popular ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {bundleForm.description || "Essential brand assets for solo founders and micro-businesses opening shop."}
                  </p>

                  <div className="flex items-baseline gap-1.5 my-5">
                    <span className="text-3xl font-black tracking-tight">
                      {bundleForm.price || "250,000"}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase ${
                        bundleForm.popular ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      RWF
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100/20 mb-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#128C38] block">
                      WHAT'S INCLUDED:
                    </span>
                  </div>

                  <ul className="space-y-2.5">
                    {bundleForm.includes.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-[#128C38] shrink-0 mt-0.5" />
                        <span
                          className={`leading-snug ${
                            bundleForm.popular ? "text-slate-200" : "text-slate-700"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* ── Checkout Delivery & Payment Settings Tab ── */}
            {tab === "checkout_settings" && <AdminCheckoutSettings />}

          </div>
        </div>
      </main>

      {/* Sleek Minimal Admin Footer */}
      <footer className="border-t border-slate-200 bg-white py-3.5 px-6 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span className="font-semibold text-slate-700">JREAL Platform Admin Nexus</span>
          <span>•</span>
          <span>v2.4 Production Portal</span>
        </div>
        <div className="text-slate-500 text-[11px]">
          <span>Operational Systems Online • Kigali, Rwanda</span>
        </div>
      </footer>

      {/* User Details In-App Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setViewingUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-base flex items-center justify-center border border-emerald-200 shrink-0">
                {(viewingUser.name || "U").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate">{viewingUser.name}</h3>
                <p className="text-xs text-slate-500 truncate">{viewingUser.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs border-y border-slate-100 py-4 mb-5">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">User Identifier:</span>
                <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">{viewingUser.id}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">Platform Role:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                  {viewingUser.role}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">Account Created:</span>
                <span className="font-medium text-slate-700">{viewingUser.joined || "Active"}</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">Account Status:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Verified Active
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global In-App Confirmation Modal */}
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
    </RoleGuard>
  );
}
