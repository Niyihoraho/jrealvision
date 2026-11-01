// JREAL VISION DESIGN — Services & Bundles Unified Data Store
// Provides persistent client-side data management for Admin Dashboard CRUD
// and public service pages (Design, Branding, Photography, Videography, Printing, Digital Marketing)

import { resolveMediaUrl, FALLBACK_SERVICE_IMAGE } from "./mediaUtils";

export interface ServiceCardItem {
  id: string;
  category: "design" | "branding" | "marketing" | "photography" | "videography" | "printing";
  title: string;
  description: string;
  priceOrRate?: string;
  badge?: string;
  image?: string;
  popular?: boolean;
}

export interface BrandBundleItem {
  id: string;
  name: string;
  price: string;
  popular: boolean;
  description: string;
  includes: string[];
}

export interface MarketingPackageItem {
  id: string;
  name: string;
  price: string;
  period: string;
  popular: boolean;
  features: string[];
}

export const AVAILABLE_SERVICE_IMAGES = [
  { label: "Minimal Brand Identity Design", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043461/jreal/services/Minimal_Brand_Identity_Design_With_Maxim_1791043462393.jpg" },
  { label: "Business Cards & Stationery", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043444/jreal/services/Business_Cards___Stationery_1791043444960.jpg" },
  { label: "Flyers, Posters & Banners", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043455/jreal/services/Flyers__Posters___Banners_1791043456376.jpg" },
  { label: "Social Media Graphics & Reels Cover", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043466/jreal/services/Social_Media_Graphics___Reels_Cover_1791043467620.jpg" },
  { label: "Packaging & Product Labels", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043462/jreal/services/Packaging___Product_Labels_1791043463901.jpg" },
  { label: "Brochures, Menus & Reports", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043442/jreal/services/Brochures__Menus___Reports_1791043443571.jpg" },
  { label: "Product Photography", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043464/jreal/services/Product_Photography_1791043465274.jpg" },
  { label: "Corporate & Executive Portraits", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043445/jreal/services/Corporate___Executive_Portraits_1791043446237.jpg" },
  { label: "Event & Conference Coverage", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043450/jreal/services/Event___Conference_Coverage_1791043450556.jpg" },
  { label: "Food & Restaurant Menus", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043457/jreal/services/Food___Restaurant_Menus_1791043457870.jpg" },
  { label: "Real Estate & Architecture", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043465/jreal/services/Real_Estate___Architecture_1791043466422.jpg" },
  { label: "Fashion & Lifestyle Lookbooks", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043454/jreal/services/Fashion___Lifestyle_Lookbooks_1791043455165.jpg" },
  { label: "Social Media Reels & TikToks", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043467/jreal/services/Social_Media_Reels___TikToks_1791043468926.jpg" },
  { label: "Brand Commercials & Product Demos", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043441/jreal/services/Brand_Commercials___Product_Demos_1791043442188.jpg" },
  { label: "Corporate & NGO Documentaries", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043447/jreal/services/Corporate___NGO_Documentaries_1791043448199.jpg" },
  { label: "4K Drone & Aerial Cinematography", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043439/jreal/services/4K_Drone___Aerial_Cinematography_1791043439401.jpg" },
  { label: "Explainer & Motion Graphic Videos", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043452/jreal/services/Explainer___Motion_Graphic_Videos_1791043454008.jpg" },
  { label: "Large Format & Outdoor Signage", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043460/jreal/services/Large_Format___Outdoor_Signage_1791043461259.jpg" },
  { label: "Custom Packaging & Boxes", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043448/jreal/services/Custom_Packaging___Boxes_1791043449375.jpg" },
  { label: "Textile & Shopping Merch", path: "https://res.cloudinary.com/qfhbfsci/image/upload/v1791043479/jreal/products/shopping_merch_1791043480384.jpg" },
];

const RAW_INITIAL_SERVICE_CARDS: ServiceCardItem[] = [
  // ── Graphic Design ──
  {
    id: "des-1",
    category: "design",
    title: "Logo & Brand Identity",
    description: "Distinctive, memorable logos with full brand style guides, color palettes, and typography.",
    priceOrRate: "50,000 RWF",
    popular: true,
    image: "/service/Minimal Brand Identity Design With Maximum Impact.jpeg",
  },
  {
    id: "des-2",
    category: "design",
    title: "Business Cards & Stationery",
    description: "Premium business cards, letterheads, envelopes, and company presentation folders.",
    priceOrRate: "25,000 RWF",
    popular: false,
    image: "/service/Business Cards & Stationery.jpeg",
  },
  {
    id: "des-3",
    category: "design",
    title: "Flyers, Posters & Banners",
    description: "High-impact event promotional graphics, roll-up banners, and promotional posters.",
    priceOrRate: "20,000 RWF",
    popular: false,
    image: "/service/Flyers, Posters & Banners.jpeg",
  },
  {
    id: "des-4",
    category: "design",
    title: "Social Media Graphics & Reels Cover",
    description: "Monthly packs of engaging Instagram, LinkedIn, and Facebook banners and templates.",
    priceOrRate: "40,000 RWF",
    popular: true,
    image: "/service/Social Media Graphics & Reels Cover.jpeg",
  },
  {
    id: "des-5",
    category: "design",
    title: "Packaging & Product Labels",
    description: "Food, beverage, cosmetics, and retail product boxes, bottles, pouches, and stickers.",
    priceOrRate: "60,000 RWF",
    popular: false,
    image: "/service/Packaging & Product Labels.jpeg",
  },
  {
    id: "des-6",
    category: "design",
    title: "Brochures, Menus & Reports",
    description: "Multi-page corporate profiles, restaurant menus, annual reports, and NGO catalogs.",
    priceOrRate: "75,000 RWF",
    popular: false,
    image: "/service/Brochures, Menus & Reports.jpeg",
  },

  // ── Photography ──
  {
    id: "photo-1",
    category: "photography",
    title: "Product Photography",
    description: "Crisp, studio-lit images on pure white backgrounds and lifestyle staging for e-commerce, catalogs, and social media.",
    priceOrRate: "From 50,000 RWF",
    badge: "Studio & Location",
    image: "/service/Product Photography.jpeg",
  },
  {
    id: "photo-2",
    category: "photography",
    title: "Corporate & Executive Portraits",
    description: "Professional headshots for executive profiles, company websites, LinkedIn, and annual reports.",
    priceOrRate: "From 40,000 RWF",
    badge: "Studio & Location",
    image: "/service/Corporate & Executive Portraits.jpg",
  },
  {
    id: "photo-3",
    category: "photography",
    title: "Event & Conference Coverage",
    description: "Full-day or multi-day photojournalistic coverage for summits, NGO launches, weddings, and corporate gatherings.",
    priceOrRate: "From 120,000 RWF",
    badge: "Full Event Team",
    image: "/service/Event & Conference Coverage.jpg",
  },
  {
    id: "photo-4",
    category: "photography",
    title: "Food & Restaurant Menus",
    description: "Mouthwatering food styling and lighting designed to make menus and delivery apps convert customers.",
    priceOrRate: "From 60,000 RWF",
    badge: "Studio & Location",
    image: "/service/Food & Restaurant Menus.jpg",
  },
  {
    id: "photo-5",
    category: "photography",
    title: "Real Estate & Architecture",
    description: "Wide-angle, high-dynamic-range photos of hotels, Airbnbs, commercial offices, and construction projects.",
    priceOrRate: "From 80,000 RWF",
    badge: "Location Shoot",
    image: "/service/Real Estate & Architecture.jpeg",
  },
  {
    id: "photo-6",
    category: "photography",
    title: "Fashion & Lifestyle Lookbooks",
    description: "Creative on-location model shoots for clothing brands, accessories, and promotional lookbooks.",
    priceOrRate: "From 90,000 RWF",
    badge: "Creative Editorial",
    image: "/service/Fashion & Lifestyle Lookbooks.jpeg",
  },

  // ── Videography ──
  {
    id: "vid-1",
    category: "videography",
    title: "Social Media Reels & TikToks",
    description: "Punchy, vertical 9:16 videos with energetic edits, trending audio hooks, and captions designed for organic engagement.",
    badge: "Viral Growth",
    image: "/service/Social Media Reels & TikToks.jpeg",
  },
  {
    id: "vid-2",
    category: "videography",
    title: "Brand Commercials & Product Demos",
    description: "Cinematic, high-definition videos showcasing product features, user benefits, and clear calls to action.",
    badge: "High Conversion",
    image: "/service/Brand Commercials & Product Demos.jpeg",
  },
  {
    id: "vid-3",
    category: "videography",
    title: "Corporate & NGO Documentaries",
    description: "In-depth impact storytelling, stakeholder interviews, case studies, and annual overview films.",
    badge: "Documentary Quality",
    image: "/service/Corporate & NGO Documentaries.jpeg",
  },
  {
    id: "vid-4",
    category: "videography",
    title: "Event Aftermovies & Recaps",
    description: "Dynamic highlight reels capturing the energy, speakers, and crowd moments at summits, concerts, and festivals.",
    badge: "Full Event Coverage",
    image: "/service/Event & Conference Coverage.jpg",
  },
  {
    id: "vid-5",
    category: "videography",
    title: "4K Drone & Aerial Cinematography",
    description: "Licensed drone footage providing sweeping perspectives of facilities, real estate, landscapes, and outdoor setups.",
    badge: "4K Aerial",
    image: "/service/4K Drone & Aerial Cinematography.jpeg",
  },
  {
    id: "vid-6",
    category: "videography",
    title: "Explainer & Motion Graphic Videos",
    description: "Animated 2D/3D explainer videos simplifying complex apps, services, and software platforms.",
    badge: "Animated",
    image: "/service/Explainer & Motion Graphic Videos.jpeg",
  },

  // ── Printing ──
  {
    id: "prt-1",
    category: "printing",
    title: "Commercial Digital Printing",
    description: "Ideal for short to medium runs. Perfect for fast-turnaround flyers, business cards, menus, certificates, and postcards.",
    badge: "Fast 24h Turnaround",
    image: "/service/Flyers, Posters & Banners.jpeg",
  },
  {
    id: "prt-2",
    category: "printing",
    title: "High-Volume Offset Printing",
    description: "Cost-efficient mass production for thousands of catalogs, annual reports, corporate stationery, and brochures.",
    badge: "Lowest Cost Per Unit",
    image: "/service/Brochures, Menus & Reports.jpeg",
  },
  {
    id: "prt-3",
    category: "printing",
    title: "Large Format & Outdoor Signage",
    description: "Weather-resistant PVC banners, roll-up stands, billboards, teardrop banners, and adhesive vinyl window graphics.",
    badge: "Weatherproof & UV Safe",
    image: "/service/Large Format & Outdoor Signage.jpeg",
  },
  {
    id: "prt-4",
    category: "printing",
    title: "Textile, Merch & Apparel",
    description: "Screen printing, direct-to-film (DTF), and embroidery for corporate polo shirts, hoodies, tote bags, and caps.",
    badge: "High Durability",
    image: "/image/shopping_merch.jpg",
  },
  {
    id: "prt-5",
    category: "printing",
    title: "Custom Packaging & Boxes",
    description: "Corrugated boxes, branded retail shopping bags, food boxes, and product blister cards.",
    badge: "Custom Die-Cut",
    image: "/service/Custom Packaging & Boxes.jpeg",
  },
  {
    id: "prt-6",
    category: "printing",
    title: "Specialty Finishes & Die-Cutting",
    description: "Matte/Gloss lamination, Spot UV, Gold/Silver hot stamping, embossing, and rounded corner cuts.",
    badge: "Luxury Touch",
    image: "/service/Packaging & Product Labels.jpeg",
  },

  // ── Digital Marketing ──
  {
    id: "mkt-1",
    category: "marketing",
    title: "Social Media Management",
    description: "Consistent weekly posts, stories, engaging captions, and community replies that build a loyal fanbase.",
    badge: "Organic Growth",
    image: "/service/Social Media Graphics & Reels Cover.jpeg",
  },
  {
    id: "mkt-2",
    category: "marketing",
    title: "Paid Ad Campaigns",
    description: "Hyper-targeted Meta & TikTok Ads targeting customers in Kigali and across Rwanda to generate measurable leads.",
    badge: "Paid Acquisition",
    image: "/service/Minimal Brand Identity Design With Maximum Impact.jpeg",
  },
  {
    id: "mkt-3",
    category: "marketing",
    title: "Content & Reels Production",
    description: "Short viral video scripts, product reels, and modern photography shot directly by our creative media team.",
    badge: "Creative Production",
    image: "/service/Social Media Reels & TikToks.jpeg",
  },
  {
    id: "mkt-4",
    category: "marketing",
    title: "Growth Strategy & Analytics",
    description: "Conversion funnel optimization, competitor audits, and monthly executive reporting on ROI.",
    badge: "Strategy & ROI",
    image: "/service/Brochures, Menus & Reports.jpeg",
  },

  // ── Branding (8-step journey cards) ──
  {
    id: "brd-1",
    category: "branding",
    title: "Logo & Visual Identity",
    description: "Primary logo, sub-marks, official typography rules, color palettes, and brand usage guidelines.",
    badge: "STEP 01",
    image: "/service/Minimal Brand Identity Design With Maximum Impact.jpeg",
  },
  {
    id: "brd-2",
    category: "branding",
    title: "Business Cards & Stationery",
    description: "Premium matte-laminated business cards, official company letterhead, envelopes, and receipts.",
    badge: "STEP 02",
    image: "/service/Business Cards & Stationery.jpeg",
  },
  {
    id: "brd-3",
    category: "branding",
    title: "Corporate Apparel & Uniforms",
    description: "Embroidered polo shirts, screen-printed T-shirts, staff aprons, caps, and branded lanyards.",
    badge: "STEP 03",
    image: "/image/shopping_merch.jpg",
  },
  {
    id: "brd-4",
    category: "branding",
    title: "Signage & Roll-up Banners",
    description: "Eye-catching entrance 3D signage, roll-up stands for conferences, outdoor teardrop flags, and decals.",
    badge: "STEP 04",
    image: "/service/Large Format & Outdoor Signage.jpeg",
  },
  {
    id: "brd-5",
    category: "branding",
    title: "Product Packaging & Bags",
    description: "Custom printed kraft shopping bags, takeaway boxes, product pouches, and holographic stickers.",
    badge: "STEP 05",
    image: "/service/Custom Packaging & Boxes.jpeg",
  },
  {
    id: "brd-6",
    category: "branding",
    title: "Commercial Photography Shoot",
    description: "High-end product catalog shots, executive headshots, and studio workspace documentation.",
    badge: "STEP 06",
    image: "/service/Product Photography.jpeg",
  },
  {
    id: "brd-7",
    category: "branding",
    title: "Cinematic Brand Video & Reel",
    description: "1-minute official brand story video and high-converting vertical reels for Instagram & TikTok.",
    badge: "STEP 07",
    image: "/service/Brand Commercials & Product Demos.jpeg",
  },
  {
    id: "brd-8",
    category: "branding",
    title: "Marketing Campaign Launch",
    description: "Targeted digital marketing campaigns and promotional flyers to announce your brand across Rwanda.",
    badge: "STEP 08",
    image: "/service/Social Media Graphics & Reels Cover.jpeg",
  },
];

export const INITIAL_SERVICE_CARDS: ServiceCardItem[] = RAW_INITIAL_SERVICE_CARDS.map((card) => ({
  ...card,
  image: resolveMediaUrl(card.image, AVAILABLE_SERVICE_IMAGES[0]?.path || FALLBACK_SERVICE_IMAGE),
}));

export const INITIAL_BRAND_BUNDLES: BrandBundleItem[] = [
  {
    id: "bundle-1",
    name: "Startup Starter",
    price: "250,000",
    popular: false,
    description: "Essential brand assets for solo founders and micro-businesses opening shop.",
    includes: [
      "Custom Logo (3 initial concepts + revisions)",
      "Brand Color Palette & Font Pairing Guide",
      "100 Premium Business Cards",
      "Social Media Profile Assets (Avatar + Banners)",
      "Digital Letterhead & Invoice Template",
    ],
  },
  {
    id: "bundle-2",
    name: "Business Growth Bundle",
    price: "650,000",
    popular: true,
    description: "Complete identity with physical merch and professional photo session.",
    includes: [
      "Full Brand Style Guide Book",
      "200 Premium Business Cards",
      "10 Branded Staff T-Shirts / Polos",
      "1 Roll-up Banner Stand (85x200cm)",
      "Professional Product Photography (15 photos)",
      "Social Media Launch Kit (9 post templates)",
      "2 Teardrop Promo Flags (Optional add-on)",
    ],
  },
  {
    id: "bundle-3",
    name: "Enterprise 360° Suite",
    price: "1,500,000",
    popular: false,
    description: "Turnkey brand transformation: Identity, media production, printing, and digital marketing.",
    includes: [
      "Complete Corporate Visual Identity",
      "Full Physical Signage & Office Branding",
      "50 Branded Apparel Items (Polos/Caps/Mugs)",
      "Studio & On-Location Photography (40 photos)",
      "1-Minute Cinematic Brand Video + 3 Social Reels",
      "1 Month Dedicated Digital Marketing Campaign",
      "Official Corporate Profile Brochure (Print & PDF)",
    ],
  },
];

export const INITIAL_MARKETING_PACKAGES: MarketingPackageItem[] = [
  {
    id: "mkt-pkg-1",
    name: "Starter Social",
    price: "150,000",
    period: "per month",
    popular: false,
    features: [
      "12 custom branded posts / month (Instagram & Facebook)",
      "1 weekly high-retention reel / short video",
      "Hashtag strategy & copy tailored for Rwanda",
      "Monthly performance report",
      "WhatsApp direct support",
    ],
  },
  {
    id: "mkt-pkg-2",
    name: "Growth & Ads Accelerator",
    price: "350,000",
    period: "per month",
    popular: true,
    features: [
      "20 custom posts / month + daily stories",
      "3 professionally filmed reels by our video team",
      "Meta & TikTok ad campaign management",
      "Lead generation & inquiry monitoring",
      "Bi-weekly strategy call with growth manager",
    ],
  },
  {
    id: "mkt-pkg-3",
    name: "Enterprise Market Dominance",
    price: "750,000",
    period: "per month",
    popular: false,
    features: [
      "Daily active posting across 4 platforms",
      "6 cinematic 4K reels & TikToks / month",
      "Full influencer & creator outreach",
      "Crisis management & 24/7 comment moderation",
      "Complete brand media production coverage",
    ],
  },
];

// Helper to get cards from localStorage or defaults
export function getStoredServiceCards(): ServiceCardItem[] {
  const normalizeList = (items: ServiceCardItem[]): ServiceCardItem[] =>
    items.map((c) => ({
      ...c,
      image: resolveMediaUrl(c.image, AVAILABLE_SERVICE_IMAGES[0]?.path || FALLBACK_SERVICE_IMAGE),
    }));

  if (typeof window === "undefined") return normalizeList(INITIAL_SERVICE_CARDS);
  try {
    const raw = localStorage.getItem("jreal_service_cards");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizeList(parsed);
      }
    }
  } catch (e) {
    console.error("Error reading jreal_service_cards:", e);
  }
  return normalizeList(INITIAL_SERVICE_CARDS);
}

export function saveStoredServiceCards(cards: ServiceCardItem[]) {
  if (typeof window === "undefined") return;
  try {
    const normalized = cards.map((c) => ({
      ...c,
      image: resolveMediaUrl(c.image, AVAILABLE_SERVICE_IMAGES[0]?.path || FALLBACK_SERVICE_IMAGE),
    }));
    localStorage.setItem("jreal_service_cards", JSON.stringify(normalized));
    window.dispatchEvent(new Event("jreal_services_updated"));
  } catch (e) {
    console.error("Error saving jreal_service_cards:", e);
  }
}

// Helper to get bundles from localStorage or defaults
export function getStoredBrandBundles(): BrandBundleItem[] {
  if (typeof window === "undefined") return INITIAL_BRAND_BUNDLES;
  try {
    const raw = localStorage.getItem("jreal_brand_bundles");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading jreal_brand_bundles:", e);
  }
  return INITIAL_BRAND_BUNDLES;
}

export function saveStoredBrandBundles(bundles: BrandBundleItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jreal_brand_bundles", JSON.stringify(bundles));
    window.dispatchEvent(new Event("jreal_bundles_updated"));
  } catch (e) {
    console.error("Error saving jreal_brand_bundles:", e);
  }
}

// Helper to get marketing packages
export function getStoredMarketingPackages(): MarketingPackageItem[] {
  if (typeof window === "undefined") return INITIAL_MARKETING_PACKAGES;
  try {
    const raw = localStorage.getItem("jreal_marketing_packages");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading jreal_marketing_packages:", e);
  }
  return INITIAL_MARKETING_PACKAGES;
}

export function saveStoredMarketingPackages(packages: MarketingPackageItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jreal_marketing_packages", JSON.stringify(packages));
    window.dispatchEvent(new Event("jreal_marketing_pkgs_updated"));
  } catch (e) {
    console.error("Error saving jreal_marketing_packages:", e);
  }
}
