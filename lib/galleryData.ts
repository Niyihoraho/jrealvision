// JREAL VISION DESIGN — Multi-Vendor Art Marketplace Data & Types
// Based on Multi-Vendor Art Marketplace Prototype Workflow (gallery.pdf)

export interface Artwork {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  artistCity: string;
  artistAvatar: string;
  artistBio: string;
  artistPhone: string;
  artistVerified: boolean;
  description: string;
  medium: string;
  dimensions: string;
  framing: "Framed (Solid Wood)" | "Framed (Floating Frame)" | "Stretched Canvas" | "Unframed" | "Gallery Wrapped";
  price: number; // in RWF
  images: {
    front: string;
    detail: string;
    inRoom: string;
  };
  status: "Draft" | "Pending Review" | "Published" | "Sold";
  year: string;
  certificateOfAuthenticity: boolean;
  featured?: boolean;
  views?: number;
  likes?: number;
  weight?: string;
  curatorNotes?: string;
}

export interface Artist {
  id: string;
  name: string;
  statement: string;
  city: "Kigali" | "Huye" | "Musanze" | "Rubavu" | "Gisenyi";
  avatar: string;
  phone: string;
  email: string;
  payoutMethod: "MTN MoMo" | "Airtel Money" | "Bank Account";
  payoutNumber: string;
  payoutAccountName: string;
  payoutLocked: boolean;
  status: "Pending" | "Approved" | "Suspended";
  joinedDate: string;
  totalGrossSales: number;
  commissionPaid: number;
  taxWithheld: number;
  netPaid: number;
  pendingBalance: number;
  socialLinks: {
    instagram?: string;
    portfolio?: string;
    twitter?: string;
  };
}

export interface EscrowOrder {
  id: string;
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  artistId: string;
  artistName: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  buyerAddress: string;
  buyerCity: string;
  grossAmount: number; // P
  platformCommissionRate: number; // 0.15 (15%)
  platformCommissionFee: number; // P * 0.15
  withholdingTaxRate: number; // 0.15 (15%)
  withholdingTaxAmount: number; // P * 0.15
  artistNetPayout: number; // P - (Commission + Tax) = P * 0.70
  status:
    | "Payment Lock (Escrow)"
    | "Ready for Pickup"
    | "Shipped / In Transit"
    | "Delivery Confirmed"
    | "Dispute Window (48h)"
    | "Settled & Disbursed";
  paymentProvider: "MTN MoMo" | "Airtel Money" | "Credit Card" | "Paypack";
  payoutStatus: "held_in_escrow" | "pending_clearance" | "approved" | "disbursed";
  orderDate: string;
  courierName?: string;
  trackingNumber?: string;
  inspectionHoursLeft?: number;
  payoutTransactionRef?: string;
  packagedPhoto?: string;
}

// Financial formula based on Part 3 of gallery.pdf:
// Platform Commission Fee = P * 15%
// Withholding Tax Amount = P * 15%
// Artist Net Payout = P - (Platform Commission Fee + Withholding Tax Amount) = P * 70%
export function calculateFinancialBreakdown(grossSalePrice: number) {
  const commissionRate = 0.15;
  const withholdingTaxRate = 0.15;
  const platformCommissionFee = Math.round(grossSalePrice * commissionRate);
  const withholdingTaxAmount = Math.round(grossSalePrice * withholdingTaxRate);
  const artistNetPayout = grossSalePrice - (platformCommissionFee + withholdingTaxAmount);

  return {
    grossSalePrice,
    commissionRate,
    withholdingTaxRate,
    platformCommissionFee,
    withholdingTaxAmount,
    artistNetPayout,
  };
}

export const galleryMediums = [
  "All Mediums",
  "Oil on Canvas",
  "Acrylic on Canvas",
  "Imigongo Modern Fusion",
  "Charcoal & Acrylic",
  "Mixed Media",
  "Sculptures",
  "Digital Print",
];

export const galleryCities = ["All Cities", "Kigali", "Huye", "Musanze", "Rubavu"];

export const framingOptions = [
  "All Framing",
  "Framed (Solid Wood)",
  "Framed (Floating Frame)",
  "Stretched Canvas",
  "Unframed",
];

// Initial Artists
export const initialArtists: Artist[] = [
  {
    id: "artist-1",
    name: "Mukamana Solange",
    statement:
      "My art captures the energy of Kigali’s evolving skyline, urban rhythm, and communal spirit using bold acrylic brushwork and warm African evening light.",
    city: "Kigali",
    avatar: "/image/photography/wedding.jpg",
    phone: "+250 788 123 456",
    email: "solange.art@jrealvision.rw",
    payoutMethod: "MTN MoMo",
    payoutNumber: "+250 788 123 456",
    payoutAccountName: "MUKAMANA SOLANGE",
    payoutLocked: true,
    status: "Approved",
    joinedDate: "January 2025",
    totalGrossSales: 450000,
    commissionPaid: 67500,
    taxWithheld: 67500,
    netPaid: 315000,
    pendingBalance: 0,
    socialLinks: {
      instagram: "https://instagram.com/solange_art_rw",
      portfolio: "https://jrealvision.rw/gallery?artist=artist-1",
    },
  },
  {
    id: "artist-2",
    name: "Nkurunziza Jean-Paul",
    statement:
      "Trained in traditional fine art and inspired by Rwanda’s terraced thousand hills, I paint landscapes that celebrate our rich soil, morning mist, and golden sunsets.",
    city: "Musanze",
    avatar: "/image/photography/brand.jpg",
    phone: "+250 782 555 789",
    email: "jp.nkurunziza@jrealvision.rw",
    payoutMethod: "MTN MoMo",
    payoutNumber: "+250 782 555 789",
    payoutAccountName: "JEAN PAUL NKURUNZIZA",
    payoutLocked: true,
    status: "Approved",
    joinedDate: "February 2025",
    totalGrossSales: 580000,
    commissionPaid: 87000,
    taxWithheld: 87000,
    netPaid: 406000,
    pendingBalance: 0,
    socialLinks: {
      instagram: "https://instagram.com/jp_hills_art",
    },
  },
  {
    id: "artist-3",
    name: "Uwase Diane",
    statement:
      "Celebrating Rwandan feminine grace, strength, and traditional cultural attire through textured oil portraits accented with delicate gold leaf overlays.",
    city: "Kigali",
    avatar: "/image/photography/conference.jpg",
    phone: "+250 783 999 111",
    email: "diane.uwase@jrealvision.rw",
    payoutMethod: "Airtel Money",
    payoutNumber: "+250 733 999 111",
    payoutAccountName: "UWASE DIANE",
    payoutLocked: true,
    status: "Approved",
    joinedDate: "March 2025",
    totalGrossSales: 320000,
    commissionPaid: 48000,
    taxWithheld: 48000,
    netPaid: 224000,
    pendingBalance: 120000,
    socialLinks: {
      instagram: "https://instagram.com/diane_uwase_portraits",
    },
  },
  {
    id: "artist-4",
    name: "Habiyambere Emmanuel",
    statement:
      "Re-imagining Rwanda’s 18th-century Imigongo geometric artistry with contemporary minimalism, architectural symmetry, and organic mineral earth pigments.",
    city: "Huye",
    avatar: "/image/photography/tourism.jpg",
    phone: "+250 788 444 888",
    email: "emmanuel.h@jrealvision.rw",
    payoutMethod: "MTN MoMo",
    payoutNumber: "+250 788 444 888",
    payoutAccountName: "EMMANUEL HABIYAMBERE",
    payoutLocked: true,
    status: "Approved",
    joinedDate: "April 2025",
    totalGrossSales: 280000,
    commissionPaid: 42000,
    taxWithheld: 42000,
    netPaid: 196000,
    pendingBalance: 0,
    socialLinks: {
      instagram: "https://instagram.com/imigongo_modern",
    },
  },
  {
    id: "artist-5",
    name: "Kalisa Olivier",
    statement:
      "Dedicated to wildlife conservation in the Virunga massif. My intense charcoal and acrylic studies portray our silverback mountain gorillas with raw dignity.",
    city: "Musanze",
    avatar: "/image/photography/wedding.jpg",
    phone: "+250 789 777 222",
    email: "olivier.kalisa@jrealvision.rw",
    payoutMethod: "MTN MoMo",
    payoutNumber: "+250 789 777 222",
    payoutAccountName: "KALISA OLIVIER",
    payoutLocked: false,
    status: "Pending", // Demonstrates onboarding approval queue
    joinedDate: "October 2026",
    totalGrossSales: 0,
    commissionPaid: 0,
    taxWithheld: 0,
    netPaid: 0,
    pendingBalance: 0,
    socialLinks: {
      instagram: "https://instagram.com/kalisa_wildlife",
    },
  },
];

// Initial Curated Artworks
export const initialArtworks: Artwork[] = [
  {
    id: "art-101",
    title: "The Thousand Hills at Dusk",
    artistId: "artist-2",
    artistName: "Nkurunziza Jean-Paul",
    artistCity: "Musanze",
    artistAvatar: "/image/photography/brand.jpg",
    artistBio:
      "Master landscape painter from Musanze capturing the mist, morning light, and lush terraced hillsides of Northern Rwanda.",
    artistPhone: "+250 782 555 789",
    artistVerified: true,
    description:
      "An original masterwork capturing the iconic terraced green hills of Rwanda under a radiant golden sunset. Created with rich impasto knife work and museum-grade oil pigments on archival Belgian linen canvas. The piece conveys deep serenity and connection to the Rwandan countryside.",
    medium: "Oil on Canvas",
    dimensions: "120 x 85 cm",
    framing: "Framed (Solid Wood)",
    price: 320000,
    images: {
      front: "/image/gallery/thousand-hills.jpg",
      detail: "/image/gallery/thousand-hills.jpg",
      inRoom: "/image/gallery/thousand-hills.jpg",
    },
    status: "Published",
    year: "2025",
    certificateOfAuthenticity: true,
    featured: true,
    views: 412,
    likes: 89,
    weight: "4.5 kg",
    curatorNotes: "Verified by JREAL Curatorial Team. Pristine condition with UV protective varnish.",
  },
  {
    id: "art-102",
    title: "Umulisa (The Graceful Mother)",
    artistId: "artist-3",
    artistName: "Uwase Diane",
    artistCity: "Kigali",
    artistAvatar: "/image/photography/conference.jpg",
    artistBio:
      "Award-winning contemporary portraitist known for exploring Rwandan femininity, cultural pride, and regal adornment.",
    artistPhone: "+250 783 999 111",
    artistVerified: true,
    description:
      "A luminous portrait blending traditional Rwandan headdress motifs with 24k gold leaf accents and warm umber tones. This painting celebrates the quiet dignity, maternal strength, and radiant spirit of contemporary African women.",
    medium: "Oil on Canvas",
    dimensions: "90 x 120 cm",
    framing: "Framed (Floating Frame)",
    price: 280000,
    images: {
      front: "/image/gallery/african-woman-portrait.jpg",
      detail: "/image/gallery/african-woman-portrait.jpg",
      inRoom: "/image/gallery/african-woman-portrait.jpg",
    },
    status: "Published",
    year: "2025",
    certificateOfAuthenticity: true,
    featured: true,
    views: 620,
    likes: 144,
    weight: "3.8 kg",
    curatorNotes: "Exhibited at Kigali Arts Festival 2025. Hand-signed with embossed wax seal.",
  },
  {
    id: "art-103",
    title: "Imigongo Heritage Symmetry",
    artistId: "artist-4",
    artistName: "Habiyambere Emmanuel",
    artistCity: "Huye",
    artistAvatar: "/image/photography/tourism.jpg",
    artistBio:
      "Huye-based geometric artisan elevating ancient Imigongo relief art to monumental modern architectural installations.",
    artistPhone: "+250 788 444 888",
    artistVerified: true,
    description:
      "A contemporary reinterpretation of Rwandan Imigongo geometric symbols. Built with textured mineral relief, organic pigments, deep obsidian black, chalk white, and warm terracotta. Evokes balance, unity, and generational wisdom.",
    medium: "Imigongo Modern Fusion",
    dimensions: "100 x 100 cm",
    framing: "Framed (Floating Frame)",
    price: 210000,
    images: {
      front: "/image/gallery/imigongo-fusion.jpg",
      detail: "/image/gallery/imigongo-fusion.jpg",
      inRoom: "/image/gallery/imigongo-fusion.jpg",
    },
    status: "Published",
    year: "2025",
    certificateOfAuthenticity: true,
    featured: true,
    views: 350,
    likes: 72,
    weight: "5.2 kg",
    curatorNotes: "Relief texture built using cured composite and natural earth pigments.",
  },
  {
    id: "art-104",
    title: "Kigali Lights & Urban Rhythm",
    artistId: "artist-1",
    artistName: "Mukamana Solange",
    artistCity: "Kigali",
    artistAvatar: "/image/photography/wedding.jpg",
    artistBio:
      "Kigali urban culture painter celebrating evening street life, motorcycle taxis, and the illuminated city hills.",
    artistPhone: "+250 788 123 456",
    artistVerified: true,
    description:
      "Dynamic twilight view overlooking the Kigali Convention Center dome and winding commercial boulevards. Expressive motion trails of evening traffic and glowing storefronts capture the unstoppable momentum of Rwanda’s capital.",
    medium: "Acrylic on Canvas",
    dimensions: "110 x 80 cm",
    framing: "Framed (Solid Wood)",
    price: 240000,
    images: {
      front: "/image/gallery/kigali-rhythm.jpg",
      detail: "/image/gallery/kigali-rhythm.jpg",
      inRoom: "/image/gallery/kigali-rhythm.jpg",
    },
    status: "Published",
    year: "2024",
    certificateOfAuthenticity: true,
    featured: true,
    views: 510,
    likes: 118,
    weight: "3.2 kg",
    curatorNotes: "Selected for Rwandan Embassy Cultural Exchange Showcase.",
  },
  {
    id: "art-105",
    title: "Guardian of Volcanoes (Silverback)",
    artistId: "artist-5",
    artistName: "Kalisa Olivier",
    artistCity: "Musanze",
    artistAvatar: "/image/photography/wedding.jpg",
    artistBio:
      "Musanze wildlife conservation painter focusing on endangered primates of the Albertine Rift.",
    artistPhone: "+250 789 777 222",
    artistVerified: true,
    description:
      "A commanding portrait of a mature silverback gorilla nestled in misty bamboo foliage of Volcanoes National Park. Heavy textural charcoal rendering captures the wisdom and gentle power of this majestic creature.",
    medium: "Charcoal & Acrylic",
    dimensions: "130 x 95 cm",
    framing: "Framed (Solid Wood)",
    price: 360000,
    images: {
      front: "/image/gallery/mountain-gorilla.jpg",
      detail: "/image/gallery/mountain-gorilla.jpg",
      inRoom: "/image/gallery/mountain-gorilla.jpg",
    },
    status: "Published",
    year: "2025",
    certificateOfAuthenticity: true,
    featured: true,
    views: 890,
    likes: 230,
    weight: "6.0 kg",
    curatorNotes: "10% of artwork proceeds donated to mountain gorilla habitat rangers.",
  },
  {
    id: "art-106",
    title: "Lake Kivu Morning Fishermen",
    artistId: "artist-2",
    artistName: "Nkurunziza Jean-Paul",
    artistCity: "Rubavu",
    artistAvatar: "/image/photography/brand.jpg",
    artistBio:
      "Master landscape painter from Musanze capturing the mist, morning light, and lush terraced hillsides.",
    artistPhone: "+250 782 555 789",
    artistVerified: true,
    description:
      "Traditional three-boat fishing flotilla gliding across tranquil Lake Kivu at dawn, silhouettes reflected on mist-covered waters with Congo mountains rising in the distance.",
    medium: "Oil on Canvas",
    dimensions: "75 x 50 cm",
    framing: "Stretched Canvas",
    price: 180000,
    images: {
      front: "/image/gallery/thousand-hills.jpg",
      detail: "/image/gallery/thousand-hills.jpg",
      inRoom: "/image/gallery/thousand-hills.jpg",
    },
    status: "Pending Review", // Demonstrates artwork moderation queue
    year: "2025",
    certificateOfAuthenticity: true,
    featured: false,
    views: 45,
    likes: 8,
    weight: "2.5 kg",
    curatorNotes: "Awaiting final admin check on edge stretching and varnish cure.",
  },
  {
    id: "art-107",
    title: "Nyungwe Forest Canopy Sunlight",
    artistId: "artist-1",
    artistName: "Mukamana Solange",
    artistCity: "Kigali",
    artistAvatar: "/image/photography/wedding.jpg",
    artistBio:
      "Kigali urban culture painter celebrating evening street life, motorcycle taxis, and Rwandan nature.",
    artistPhone: "+250 788 123 456",
    artistVerified: true,
    description:
      "Atmospheric study of prehistoric fern trees and sunlight beams cutting through Nyungwe ancient rainforest.",
    medium: "Acrylic on Canvas",
    dimensions: "60 x 80 cm",
    framing: "Framed (Floating Frame)",
    price: 150000,
    images: {
      front: "/image/gallery/kigali-rhythm.jpg",
      detail: "/image/gallery/kigali-rhythm.jpg",
      inRoom: "/image/gallery/kigali-rhythm.jpg",
    },
    status: "Draft", // Demonstrates artist draft status
    year: "2025",
    certificateOfAuthenticity: true,
    featured: false,
    views: 0,
    likes: 0,
    weight: "2.1 kg",
  },
  {
    id: "art-108",
    title: "Intore Warrior Dance Motion",
    artistId: "artist-3",
    artistName: "Uwase Diane",
    artistCity: "Kigali",
    artistAvatar: "/image/photography/conference.jpg",
    artistBio: "Award-winning contemporary portraitist known for exploring Rwandan heritage and cultural pride.",
    artistPhone: "+250 783 999 111",
    artistVerified: true,
    description:
      "Expressive dynamic representation of traditional Rwandan Intore dancer with flowing headdress and spear, frozen in airborne triumph.",
    medium: "Oil on Canvas",
    dimensions: "90 x 90 cm",
    framing: "Framed (Solid Wood)",
    price: 290000,
    images: {
      front: "/image/gallery/african-woman-portrait.jpg",
      detail: "/image/gallery/african-woman-portrait.jpg",
      inRoom: "/image/gallery/african-woman-portrait.jpg",
    },
    status: "Sold", // Demonstrates sold status
    year: "2024",
    certificateOfAuthenticity: true,
    featured: false,
    views: 740,
    likes: 195,
    weight: "4.0 kg",
    curatorNotes: "Acquired by private collector in Nyarutarama, Kigali.",
  },
];

// Initial Escrow Orders (Demonstrating Escrow Workflow from gallery.pdf)
export const initialEscrowOrders: EscrowOrder[] = [
  {
    id: "ESC-88410",
    artworkId: "art-108",
    artworkTitle: "Intore Warrior Dance Motion",
    artworkImage: "/image/gallery/african-woman-portrait.jpg",
    artistId: "artist-3",
    artistName: "Uwase Diane",
    buyerName: "Didier Hakizimana",
    buyerPhone: "+250 788 333 444",
    buyerEmail: "didier.h@rwanda-invest.rw",
    buyerAddress: "KG 548 St, House 12, Nyarutarama",
    buyerCity: "Kigali",
    grossAmount: 290000,
    platformCommissionRate: 0.15,
    platformCommissionFee: 43500, // 290,000 * 0.15
    withholdingTaxRate: 0.15,
    withholdingTaxAmount: 43500, // 290,000 * 0.15
    artistNetPayout: 203000, // 290,000 - 87,000 = 70%
    status: "Settled & Disbursed",
    paymentProvider: "MTN MoMo",
    payoutStatus: "disbursed",
    orderDate: "2026-09-24",
    courierName: "Kigali Express Couriers",
    trackingNumber: "KGL-EXP-9921",
    payoutTransactionRef: "MOMO-PAYPACK-TRX-7741029",
  },
  {
    id: "ESC-88411",
    artworkId: "art-102",
    artworkTitle: "Umulisa (The Graceful Mother)",
    artworkImage: "/image/gallery/african-woman-portrait.jpg",
    artistId: "artist-3",
    artistName: "Uwase Diane",
    buyerName: "Sarah Jenkins",
    buyerPhone: "+250 780 112 233",
    buyerEmail: "sarah.j@embassy.org",
    buyerAddress: "Avenue du Palais de Justice",
    buyerCity: "Kigali",
    grossAmount: 280000,
    platformCommissionRate: 0.15,
    platformCommissionFee: 42000,
    withholdingTaxRate: 0.15,
    withholdingTaxAmount: 42000,
    artistNetPayout: 196000,
    status: "Dispute Window (48h)",
    paymentProvider: "Credit Card",
    payoutStatus: "pending_clearance",
    orderDate: "2026-09-29",
    courierName: "JREAL White Glove Logistics",
    trackingNumber: "JRV-LOG-5510",
    inspectionHoursLeft: 28,
  },
  {
    id: "ESC-88412",
    artworkId: "art-104",
    artworkTitle: "Kigali Lights & Urban Rhythm",
    artworkImage: "/image/gallery/kigali-rhythm.jpg",
    artistId: "artist-1",
    artistName: "Mukamana Solange",
    buyerName: "Gervais Nkurunziza",
    buyerPhone: "+250 788 777 666",
    buyerEmail: "gervais@techkigali.rw",
    buyerAddress: "KN 3 Ave, Kiyovu",
    buyerCity: "Kigali",
    grossAmount: 240000,
    platformCommissionRate: 0.15,
    platformCommissionFee: 36000,
    withholdingTaxRate: 0.15,
    withholdingTaxAmount: 36000,
    artistNetPayout: 168000,
    status: "Payment Lock (Escrow)",
    paymentProvider: "MTN MoMo",
    payoutStatus: "held_in_escrow",
    orderDate: "2026-09-30",
  },
];
