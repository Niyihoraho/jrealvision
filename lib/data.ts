// JREAL VISION DESIGN — E-Commerce Platform Data

// ============================================
// COMPANY INFO
// ============================================
export const companyInfo = {
  name: "JREAL VISION DESIGN",
  tagline: "Shop • Customize • Print • Deliver",
  description:
    "Design, printing, branding, media & marketing solutions for individuals and organizations.",
  mission:
    "To provide creative, high-quality design, printing, branding, and digital marketing solutions that help businesses and individuals stand out and succeed.",
  vision:
    "To become Rwanda's leading creative business platform — connecting design, printing, media, and marketing under one roof.",
  location: "Kigali City, Rwanda",
  email: "info@jrealvision.rw",
  phone: "+250 788 000 000",
  whatsapp: "+250788000000",
  socialMedia: {
    instagram: "#",
    tiktok: "#",
    facebook: "#",
    linkedin: "#",
  },
};

// ============================================
// PRODUCT CATEGORIES (Shop)
// ============================================
export interface ProductCategory {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

export const productCategories: ProductCategory[] = [
  { id: "t-shirts", name: "T-Shirts", image: "/image/shopping_merch.jpg", productCount: 12 },
  { id: "business-cards", name: "Business Cards", image: "/image/printing_products.jpg", productCount: 8 },
  { id: "banners", name: "Banners", image: "/image/printing_products.jpg", productCount: 6 },
  { id: "mugs", name: "Mugs", image: "/image/shopping_merch.jpg", productCount: 5 },
  { id: "stickers", name: "Stickers", image: "/image/graphic design tool.jpg", productCount: 10 },
  { id: "posters", name: "Posters", image: "/image/graphic design tool.jpg", productCount: 7 },
  { id: "flyers", name: "Flyers", image: "/image/printing_products.jpg", productCount: 9 },
  { id: "rollup-banners", name: "Roll-up Banners", image: "/image/printing_products.jpg", productCount: 4 },
  { id: "invitations", name: "Invitations", image: "/image/printing_products.jpg", productCount: 6 },
  { id: "notebooks", name: "Branded Notebooks", image: "/image/shopping_merch.jpg", productCount: 5 },
  { id: "frames", name: "Frames", image: "/image/graphic design tool.jpg", productCount: 4 },
  { id: "promotional", name: "Promotional Products", image: "/image/shopping_merch.jpg", productCount: 15 },
];

// ============================================
// PRODUCTS (Shop items)
// ============================================
export interface ProductAttributeValue {
  id: string;
  name: string;
  stock: number;
  colorCode?: string;
  priceOffset?: number;
  inStock?: boolean;
}

export interface ProductAttribute {
  id: string;
  name: string;
  values: ProductAttributeValue[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  options?: string[];
  attributes?: ProductAttribute[];
  customizable: boolean;
}

export const products: Product[] = [
  {
    id: "tshirt-basic-white",
    name: "Basic White T-Shirt",
    category: "t-shirts",
    price: 8000,
    image: "/image/graphic design tool.jpg",
    images: [
      "/image/graphic design tool.jpg",
      "/service/Product Photography.jpeg",
      "/service/Fashion & Lifestyle Lookbooks.jpeg",
      "/image/printing_products.jpg",
    ],
    description: "High-quality cotton T-shirt with custom print",
    options: ["S", "M", "L", "XL", "2XL"],
    attributes: [
      {
        id: "attr_size",
        name: "Size",
        values: [
          { id: "s", name: "S", stock: 30 },
          { id: "m", name: "M", stock: 45 },
          { id: "l", name: "L", stock: 50 },
          { id: "xl", name: "XL", stock: 25 },
          { id: "2xl", name: "2XL", stock: 15 },
        ],
      },
      {
        id: "attr_color",
        name: "Color",
        values: [
          { id: "white", name: "White", colorCode: "#FFFFFF", stock: 40 },
          { id: "black", name: "Black", colorCode: "#0F172A", stock: 50 },
          { id: "navy", name: "Navy", colorCode: "#1E3A8A", stock: 35 },
          { id: "red", name: "Red", colorCode: "#DC2626", stock: 20 },
          { id: "grey", name: "Grey", colorCode: "#9CA3AF", stock: 25 },
        ],
      },
    ],
    customizable: true,
  },
  {
    id: "tshirt-basic-black",
    name: "Basic Black T-Shirt",
    category: "t-shirts",
    price: 8000,
    image: "/image/printing_products.jpg",
    images: [
      "/image/printing_products.jpg",
      "/service/Product Photography.jpeg",
      "/service/Fashion & Lifestyle Lookbooks.jpeg",
      "/service/Packaging & Product Labels.jpeg",
    ],
    description: "Premium black cotton T-shirt with custom design",
    options: ["S", "M", "L", "XL", "2XL"],
    attributes: [
      {
        id: "attr_size",
        name: "Size",
        values: [
          { id: "s", name: "S", stock: 20 },
          { id: "m", name: "M", stock: 35 },
          { id: "l", name: "L", stock: 40 },
          { id: "xl", name: "XL", stock: 15 },
          { id: "2xl", name: "2XL", stock: 10 },
        ],
      },
      {
        id: "attr_color",
        name: "Color",
        values: [
          { id: "black", name: "Black", colorCode: "#0F172A", stock: 50 },
          { id: "white", name: "White", colorCode: "#FFFFFF", stock: 30 },
          { id: "navy", name: "Navy", colorCode: "#1E3A8A", stock: 20 },
          { id: "red", name: "Red", colorCode: "#DC2626", stock: 15 },
          { id: "grey", name: "Grey", colorCode: "#9CA3AF", stock: 10 },
        ],
      },
    ],
    customizable: true,
  },
  {
    id: "tshirt-polo",
    name: "Polo Shirt",
    category: "t-shirts",
    price: 15000,
    image: "/image/graphic design tool.jpg",
    images: [
      "/image/graphic design tool.jpg",
      "/service/Product Photography.jpeg",
      "/service/Corporate & Executive Portraits.jpg",
      "/service/Custom Packaging & Boxes.jpeg",
    ],
    description: "Professional polo shirt with embroidered logo",
    options: ["S", "M", "L", "XL", "2XL"],
    attributes: [
      {
        id: "attr_size",
        name: "Size",
        values: [
          { id: "s", name: "S", stock: 15 },
          { id: "m", name: "M", stock: 25 },
          { id: "l", name: "L", stock: 30 },
          { id: "xl", name: "XL", stock: 20 },
          { id: "2xl", name: "2XL", stock: 10 },
        ],
      },
      {
        id: "attr_color",
        name: "Color",
        values: [
          { id: "navy", name: "Navy", colorCode: "#1E3A8A", stock: 35 },
          { id: "black", name: "Black", colorCode: "#0F172A", stock: 30 },
          { id: "white", name: "White", colorCode: "#FFFFFF", stock: 25 },
          { id: "red", name: "Red", colorCode: "#DC2626", stock: 10 },
          { id: "grey", name: "Grey", colorCode: "#9CA3AF", stock: 15 },
        ],
      },
    ],
    customizable: true,
  },
  {
    id: "business-card-standard",
    name: "Standard Business Cards",
    category: "business-cards",
    price: 25000,
    image: "/image/graphic design tool.jpg",
    description: "500 pcs premium business cards, double-sided",
    customizable: true,
  },
  {
    id: "business-card-premium",
    name: "Premium Business Cards",
    category: "business-cards",
    price: 45000,
    image: "/image/graphic design tool.jpg",
    description: "500 pcs luxury business cards with special finish",
    customizable: true,
  },
  {
    id: "banner-small",
    name: "Small Banner (2x3ft)",
    category: "banners",
    price: 15000,
    image: "/image/graphic design tool.jpg",
    description: "High-quality printed banner, perfect for events",
    customizable: true,
  },
  {
    id: "banner-large",
    name: "Large Banner (4x8ft)",
    category: "banners",
    price: 35000,
    image: "/image/graphic design tool.jpg",
    description: "Large format banner for outdoor advertising",
    customizable: true,
  },
  {
    id: "mug-white",
    name: "Custom White Mug",
    category: "mugs",
    price: 5000,
    image: "/image/graphic design tool.jpg",
    description: "Ceramic mug with custom print, perfect gift",
    customizable: true,
  },
  {
    id: "mug-magic",
    name: "Magic Color-Changing Mug",
    category: "mugs",
    price: 8000,
    image: "/image/graphic design tool.jpg",
    description: "Heat-sensitive mug that reveals your design",
    customizable: true,
  },
  {
    id: "sticker-sheet",
    name: "Custom Sticker Sheet",
    category: "stickers",
    price: 3000,
    image: "/image/graphic design tool.jpg",
    description: "A4 sheet of custom-cut stickers",
    customizable: true,
  },
  {
    id: "poster-a3",
    name: "A3 Poster Print",
    category: "posters",
    price: 5000,
    image: "/image/graphic design tool.jpg",
    description: "High-quality A3 poster, glossy or matte finish",
    customizable: true,
  },
  {
    id: "flyer-a5",
    name: "A5 Flyers (100 pcs)",
    category: "flyers",
    price: 20000,
    image: "/image/graphic design tool.jpg",
    description: "100 double-sided A5 flyers, full color",
    customizable: true,
  },
];

// ============================================
// SERVICES
// ============================================
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  features: string[];
  benefits: string[];
  cta: string;
  ctaLink: string;
}

export const services: Service[] = [
  {
    id: "shopping",
    title: "Online Shopping",
    description:
      "Shop branded corporate merchandise, custom apparel, drinkware, notebooks, and personalized products delivered to your door.",
    icon: "ShoppingBag",
    image: "/image/shopping_merch.jpg",
    features: [
      "Custom T-Shirts & Polos",
      "Branded Mugs & Bottles",
      "Corporate Gift Boxes",
      "Stationery & Notebooks",
      "Custom Stickers & Decals",
      "Kigali Doorstep Delivery",
    ],
    benefits: [
      "Instant checkout via MTN MoMo, Airtel & Card",
      "Wholesale discounts for corporate orders",
      "Direct tracking and fast dispatch",
    ],
    cta: "Start Shopping",
    ctaLink: "/shop",
  },
  {
    id: "gallery",
    title: "Art Gallery",
    description:
      "Discover and buy original Rwandan paintings, Imigongo heritage reliefs, fine canvas art, and sculptures from renowned artists.",
    icon: "Brush",
    image: "/image/gallery/imigongo-fusion.jpg",
    features: [
      "Original Canvas Art",
      "Sacred Imigongo Patterns",
      "African Cultural Sculptures",
      "Museum Quality Framing",
      "Certificates of Authenticity",
      "Worldwide Insured Delivery",
    ],
    benefits: [
      "Authentic Rwandan visual heritage",
      "Direct artist revenue and empowerment",
      "Escrow protection on every artwork purchase",
    ],
    cta: "Explore Gallery",
    ctaLink: "/gallery",
  },
  {
    id: "graphic-design",
    title: "Graphic Design",
    description:
      "Professional design services from logos to complete brand identities. We create visuals that communicate your message.",
    icon: "Palette",
    image: "/image/graphic design tool.jpg",
    features: [
      "Logo Design",
      "Brand Identity",
      "Business Cards",
      "Flyers & Posters",
      "Social Media Designs",
      "Packaging Design",
    ],
    benefits: [
      "Custom unique visual identity",
      "High-resolution vector formats",
      "Fast revisions and quick delivery",
    ],
    cta: "Order a Design",
    ctaLink: "/design",
  },
  {
    id: "printing",
    title: "Printing",
    description:
      "High-quality printing for all your business and personal needs. From business cards to large format banners.",
    icon: "Printer",
    image: "/image/printing_products.jpg",
    features: [
      "Business Cards",
      "Brochures & Flyers",
      "Banners & Posters",
      "Packaging",
      "Promotional Materials",
      "Large Format Printing",
    ],
    benefits: [
      "Premium paper and vibrant ink",
      "Bulk discounts for businesses & NGOs",
      "Same-day & next-day printing available",
    ],
    cta: "Shop Printing",
    ctaLink: "/shop",
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    description:
      "We don't just design your product — we help you sell it. Complete digital marketing solutions.",
    icon: "TrendingUp",
    image: "/image/digital_marketing.jpg",
    features: [
      "Social Media Management",
      "Content Creation",
      "Advertising Campaigns",
      "Product Promotion",
      "Marketing Strategy",
      "Monthly Packages",
    ],
    benefits: [
      "Targeted audience reach in Rwanda",
      "Consistent high-quality content calendar",
      "Detailed monthly performance reports",
    ],
    cta: "View Packages",
    ctaLink: "/digital-marketing",
  },
  {
    id: "photography",
    title: "Photography",
    description:
      "Professional photography services for products, events, corporate, and more. Capture your brand beautifully.",
    icon: "Camera",
    image: "/image/comera extensions.jpg",
    features: [
      "Product Photography",
      "Corporate Photography",
      "Event Photography",
      "Food Photography",
      "Portraits",
      "Real Estate Photography",
    ],
    benefits: [
      "Studio and on-location shooting",
      "Professional color grading & retouching",
      "Web-ready & print-ready high-res files",
    ],
    cta: "Book a Session",
    ctaLink: "/photography",
  },
  {
    id: "videography",
    title: "Videography",
    description:
      "From promotional videos to social media reels. We create engaging video content that drives results.",
    icon: "Video",
    image: "/image/videodeck.jpg",
    features: [
      "Product Videos",
      "Promotional Videos",
      "Social Media Reels",
      "Corporate Videos",
      "Event Videos",
      "Video Editing",
    ],
    benefits: [
      "4K video production & drone coverage",
      "Engaging hooks designed for social media",
      "Scripting, directing, and post-production",
    ],
    cta: "Book Videography",
    ctaLink: "/videography",
  },
  {
    id: "branding",
    title: "Branding",
    description:
      "Complete branding packages that connect all our services. Launch your business with a professional identity.",
    icon: "Star",
    image: "/image/graphic design tool.jpg",
    features: [
      "Logo Design",
      "Business Cards",
      "Signboard Design",
      "T-Shirts & Merch",
      "Social Media Setup",
      "Complete Brand Package",
    ],
    benefits: [
      "Unified brand guidelines & color systems",
      "Ready-to-launch marketing collateral",
      "Save up to 30% with bundled packages",
    ],
    cta: "Start Branding",
    ctaLink: "/branding",
  },
];

// ============================================
// MARKETING PACKAGES
// ============================================
export interface MarketingPackage {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
}

export const marketingPackages: MarketingPackage[] = [
  {
    id: "starter",
    name: "Starter",
    price: "150,000",
    period: "/month",
    features: [
      "Social media posts (12/month)",
      "Basic content creation",
      "Monthly page management",
      "1 platform",
    ],
    highlighted: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: "350,000",
    period: "/month",
    features: [
      "Content creation (20/month)",
      "Product photography",
      "Short videos & reels",
      "Social media management",
      "Advertising support",
      "3 platforms",
    ],
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "600,000",
    period: "/month",
    features: [
      "Full digital marketing",
      "Professional photography",
      "Videography & editing",
      "Content strategy",
      "Campaign management",
      "Monthly reporting",
      "All platforms",
    ],
    highlighted: false,
  },
];

// ============================================
// STATS
// ============================================
export interface Stat {
  label: string;
  value: string;
  suffix?: string;
  icon: string;
}

export const stats: Stat[] = [
  { label: "Happy Clients", value: "150", suffix: "+", icon: "Users" },
  { label: "Projects Done", value: "500", suffix: "+", icon: "Briefcase" },
  { label: "Products Sold", value: "2000", suffix: "+", icon: "ShoppingBag" },
  { label: "Years Experience", value: "5", suffix: "+", icon: "Award" },
];

// ============================================
// TESTIMONIALS
// ============================================
export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  project?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Patrick Mugisha",
    role: "Owner",
    company: "Kigali Bistro Restaurant",
    content:
      "JREAL VISION handled everything — logo, menu design, T-shirts, photography, and social media. One team, one project, incredible results. Our restaurant looks completely professional now.",
    rating: 5,
    project: "Complete Business Branding",
  },
  {
    id: "2",
    name: "Grace Uwamahoro",
    role: "Marketing Director",
    company: "Rwanda Youth Initiative",
    content:
      "We needed campaign materials, banners, and promotional videos for our awareness program. JREAL VISION delivered high-quality work on time and within budget. Highly recommended!",
    rating: 5,
    project: "NGO Campaign Materials",
  },
  {
    id: "3",
    name: "Jean Claude Habimana",
    role: "Founder",
    company: "TechHub Kigali",
    content:
      "The branding package was exactly what we needed to launch. From business cards to social media presence, JREAL VISION made us look established from day one.",
    rating: 5,
    project: "Startup Branding Package",
  },
];

// ============================================
// PORTFOLIO ITEMS
// ============================================
export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

export const portfolioItems: PortfolioItem[] = [
  {
    id: "portfolio-1",
    title: "Restaurant Branding",
    category: "Branding",
    image: "/image/graphic design tool.jpg",
    description: "Complete brand identity for a Kigali restaurant",
  },
  {
    id: "portfolio-2",
    title: "Corporate Photography",
    category: "Photography",
    image: "/image/comera extensions.jpg",
    description: "Professional corporate photoshoot",
  },
  {
    id: "portfolio-3",
    title: "Promotional Video",
    category: "Videography",
    image: "/image/videodeck.jpg",
    description: "Product promotional video for social media",
  },
  {
    id: "portfolio-4",
    title: "Event Banners",
    category: "Printing",
    image: "/image/graphic design tool.jpg",
    description: "Large format event banners and signage",
  },
  {
    id: "portfolio-5",
    title: "Social Media Campaign",
    category: "Marketing",
    image: "/image/graphic design tool.jpg",
    description: "Monthly social media marketing campaign",
  },
  {
    id: "portfolio-6",
    title: "Product Photography",
    category: "Photography",
    image: "/image/comera extensions.jpg",
    description: "E-commerce product photography session",
  },
];

// ============================================
// PROJECTS & HIGHLIGHTS (Compatibility)
// ============================================
export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  tags?: string[];
  client?: string;
  year?: string;
  images: string[];
}

export const projects: Project[] = portfolioItems.map((item) => ({
  ...item,
  tags: [item.category],
  client: "JREAL Client",
  year: "2025",
  images: [item.image],
}));

export interface Highlight {
  title: string;
  description: string;
}

export const highlights: Highlight[] = [
  {
    title: "All-in-One Creative Hub",
    description:
      "Design, high-resolution printing, branding, photography, videography, and digital marketing under one roof.",
  },
  {
    title: "Rapid Delivery & Precision",
    description:
      "Speed without compromising quality. Meet deadlines for your campaigns, events, and business launches.",
  },
  {
    title: "Tailored for Growth",
    description:
      "Custom solutions for individuals, growing SMEs, corporate institutions, and non-profit organizations.",
  },
  {
    title: "Transparent & Accessible",
    description:
      "Clear package pricing, transparent quotes, and direct online ordering with dedicated project support.",
  },
];

