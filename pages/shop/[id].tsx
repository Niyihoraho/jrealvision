import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import { useCart } from "@/app/components/CartProvider";
import { products, companyInfo } from "@/lib/data";
import type { ProductAttribute } from "@/lib/productAttributes";
import { resolveMediaUrl, FALLBACK_PRODUCT_IMAGE } from "@/lib/mediaUtils";
import {
  ShoppingCart,
  Check,
  Upload,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Camera,
  Eye,
} from "lucide-react";

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const initialProduct = products.find((p) => p.id === id) || products[0];
  const [product, setProduct] = useState(initialProduct);

  // Multi-image Production Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const productImages: string[] =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
      ? [product.image]
      : ["/image/printing_products.jpg"];

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id, product?.id]);

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    // 1. Initial check against local sample data
    const match = products.find((p) => p.id === id);
    if (match) {
      setProduct(match);
    }

    // 2. Check admin local cache
    try {
      const rawAdmin = localStorage.getItem("jreal_admin_products_v1");
      if (rawAdmin) {
        const parsed = JSON.parse(rawAdmin);
        const found = parsed.find((p: any) => p.id === id);
        if (found) {
          setProduct({
            id: found.id,
            name: found.title || found.name,
            category: found.category || "store",
            price: Number(found.price) || 0,
            image: found.image || (found.images && found.images[0]) || "/image/printing_products.jpg",
            images: Array.isArray(found.images) && found.images.length > 0 ? found.images : [found.image || "/image/printing_products.jpg"],
            description: found.description || "",
            customizable: found.customizable ?? true,
            attributes: found.attributes || [],
          });
        }
      }
    } catch (e) {}

    // 3. Fetch authoritative live data directly from Database
    fetch(`/api/products?id=${encodeURIComponent(id)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.product) {
          const p = data.product;
          setProduct({
            id: p.id,
            name: p.name || p.title,
            category: p.category,
            price: Number(p.price) || 0,
            image: p.image || (Array.isArray(p.images) && p.images[0]) || "/image/printing_products.jpg",
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || "/image/printing_products.jpg"],
            description: p.description || "",
            customizable: true,
            attributes: p.attributes || [],
          });
        }
      })
      .catch(() => {});
  }, [id]);

  const { addItem } = useCart();

  // Customization State
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);

  const isApparel =
    product?.category === "t-shirts" ||
    product?.category?.toLowerCase().includes("apparel") ||
    product?.category?.toLowerCase().includes("polo");

  const isCardOrPrint =
    product?.category === "business-cards" ||
    product?.category === "flyers" ||
    product?.category === "posters" ||
    product?.category?.toLowerCase().includes("stationery") ||
    product?.category?.toLowerCase().includes("banner");

  const defaultSizes = isApparel
    ? ["S", "M", "L", "XL", "2XL"]
    : isCardOrPrint
    ? ["Standard", "Premium Thick", "Custom"]
    : ["Default"];

  const defaultColors = isApparel
    ? [
        { name: "White", colorCode: "#FFFFFF" },
        { name: "Black", colorCode: "#0F172A" },
        { name: "Navy", colorCode: "#1E3A8A" },
        { name: "Red", colorCode: "#DC2626" },
        { name: "Grey", colorCode: "#9CA3AF" },
      ]
    : [
        { name: "Full Color", colorCode: "#2563EB" },
        { name: "Monochrome", colorCode: "#000000" },
      ];

  // Dynamic or fallback attributes
  const rawAttributes: ProductAttribute[] =
    product?.attributes && product.attributes.length > 0
      ? product.attributes
      : [
          {
            id: "attr_size",
            name: isApparel ? "Size" : isCardOrPrint ? "Finish" : "Option",
            values: defaultSizes.map((s) => ({
              id: `val_${s.toLowerCase()}`,
              name: s,
              stock: 35,
            })),
          },
          {
            id: "attr_color",
            name: isApparel ? "Color" : "Style",
            values: defaultColors.map((c) => ({
              id: `val_${c.name.toLowerCase()}`,
              name: c.name,
              colorCode: c.colorCode,
              stock: 40,
            })),
          },
        ];

  // Selected values map: attributeName -> valueName
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({
    Size: "L",
    Color: "White",
    Finish: "Standard",
    Style: "Full Color",
    Option: "Default",
  });

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading product...</p>
      </div>
    );
  }

  // Quantity discounts
  const discountMultiplier =
    quantity >= 50 ? 0.85 : quantity >= 20 ? 0.9 : quantity >= 10 ? 0.95 : 1.0;
  const unitPrice = Math.round(product.price * discountMultiplier);
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const attributeStrings = rawAttributes.map((attr) => {
      const chosen =
        selectedAttributes[attr.name] ||
        (attr.name.toLowerCase() === "size"
          ? attr.values.find((v) => v.name === "L")?.name || attr.values[0]?.name
          : attr.name.toLowerCase() === "color"
          ? attr.values.find((v) => v.name === "White")?.name || attr.values[0]?.name
          : attr.values[0]?.name);
      return `${attr.name}: ${chosen}`;
    });

    const customOptions = [
      ...attributeStrings,
      uploadedFileName ? `Artwork: ${uploadedFileName}` : "Artwork: None (Need Design)",
      notes ? `Notes: ${notes}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    addItem({
      id: `${product.id}-${Date.now()}`,
      name: product.name,
      price: unitPrice,
      quantity,
      image: product.image,
      options: customOptions,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleCheckout = () => {
    handleAddToCart();
    router.push("/cart");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
    }
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <>
      <Head>
        <title>{product.name} | JREAL VISION DESIGN Shop</title>
        <meta name="description" content={product.description} />
      </Head>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6 py-2">
            <Link href="/" className="hover:text-[#128C38]">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-[#128C38]">
              Shop
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-semibold capitalize truncate">
              {product.name}
            </span>
          </div>

          {/* Product Hero Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm grid lg:grid-cols-2 gap-10 lg:gap-14 mb-16">
            {/* Left: Product Image & Interactive Production Gallery */}
            <div className="space-y-4">
              {/* Main Image Container */}
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-md group">
                <img
                  src={resolveMediaUrl(productImages[activeImageIndex] || product.image, FALLBACK_PRODUCT_IMAGE)}
                  alt={`${product.name} - View ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                  }}
                  onClick={() => setIsLightboxOpen(true)}
                />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  {product.customizable ? (
                    <span className="bg-[#128C38] text-white text-xs font-bold uppercase px-3 py-1.5 rounded-full shadow-md pointer-events-auto">
                      Customizable
                    </span>
                  ) : <span />}

                  <div className="flex items-center gap-2 pointer-events-auto">
                    {productImages.length > 1 && (
                      <span className="bg-slate-900/75 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        <Camera className="w-3 h-3 text-emerald-400" />
                        <span>{activeImageIndex + 1}/{productImages.length}</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                      title="View full resolution production photo"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Left / Right Navigation Buttons (if multiple images) */}
                {productImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                      title="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
                      title="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Bottom Center Indicator Dots */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
                    {productImages.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex(i);
                        }}
                        className={`transition-all rounded-full ${
                          activeImageIndex === i ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60 hover:bg-white"
                        }`}
                        title={`Go to photo ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails Row (Production Photos Strip) */}
              {productImages.length > 1 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-[#128C38]" />
                      Production & Angle Photos ({productImages.length})
                    </span>
                    <span className="text-[11px] text-slate-400">Click to preview</span>
                  </div>

                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5">
                    {productImages.map((img, idx) => {
                      const isActive = activeImageIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative aspect-square w-18 sm:w-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                            isActive
                              ? "border-[#128C38] ring-2 ring-[#128C38]/20 shadow-md scale-105"
                              : "border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-300"
                          }`}
                        >
                          <img
                            src={resolveMediaUrl(img, FALLBACK_PRODUCT_IMAGE)}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                            }}
                          />
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded">
                              Cover
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-[#128C38] flex-shrink-0" />
                  <span>Quality Assured Print</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-700">
                  <Truck className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                  <span>Prompt Delivery</span>
                </div>
              </div>
            </div>

            {/* Right: Customization & Purchase */}
            <div className="flex flex-col">
              <div className="mb-4">
                <span className="text-xs uppercase font-bold tracking-wider text-[#128C38] bg-emerald-50 px-2.5 py-1 rounded-md">
                  {product.category}
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price Display */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 mb-6 flex items-baseline justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium">Price per unit</div>
                  <div className="text-3xl font-extrabold text-[#128C38]">
                    {unitPrice.toLocaleString()}{" "}
                    <span className="text-sm font-semibold text-gray-500">RWF</span>
                  </div>
                </div>
                {discountMultiplier < 1 && (
                  <span className="px-2.5 py-1 bg-amber-100 text-[#F59E0B] rounded-full text-xs font-bold">
                    {Math.round((1 - discountMultiplier) * 100)}% Volume Discount
                  </span>
                )}
              </div>

              {/* Options / Dynamic Product Attributes */}
              <div className="space-y-5 flex-grow">
                {rawAttributes.map((attr) => {
                  const isSize = attr.name.toLowerCase() === "size";
                  const isColor = attr.name.toLowerCase() === "color";
                  const selectedValName =
                    selectedAttributes[attr.name] ||
                    (isSize
                      ? attr.values.find((v) => v.name === "L")?.name || attr.values[0]?.name
                      : isColor
                      ? attr.values.find((v) => v.name === "White")?.name || attr.values[0]?.name
                      : attr.values[0]?.name);
                  const selectedVal = attr.values.find((v) => v.name === selectedValName);

                  return (
                    <div key={attr.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                          SELECT {attr.name}
                        </label>
                        {selectedVal && (
                          <span className="text-[11px] font-medium text-slate-500">
                            Selected: <strong className="text-slate-800">{selectedVal.name}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {attr.values.map((v) => {
                          const isSelected = selectedValName === v.name;

                          let pillStyle = "";
                          if (isSelected) {
                            if (isSize) {
                              pillStyle = "bg-[#128C38] text-white shadow-sm ring-2 ring-[#128C38]/20 font-bold";
                            } else if (isColor) {
                              pillStyle = "bg-[#0F172A] text-white shadow-sm font-bold";
                            } else {
                              pillStyle = "bg-[#128C38] text-white shadow-sm font-bold";
                            }
                          } else {
                            pillStyle = "bg-[#F1F5F9] text-slate-800 hover:bg-slate-200 font-semibold";
                          }

                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() =>
                                setSelectedAttributes((prev) => ({
                                  ...prev,
                                  [attr.name]: v.name,
                                }))
                              }
                              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${pillStyle}`}
                            >
                              {v.colorCode && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                                  style={{ backgroundColor: v.colorCode }}
                                />
                              )}
                              <span>{v.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g. print placement on chest, specific Pantone color, deadline..."
                    className="w-full text-xs p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#128C38] focus:bg-white transition-colors"
                  />
                </div>

                {/* Quantity Controls */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Quantity
                    </label>
                    <span className="text-xs font-semibold text-gray-500">
                      Total:{" "}
                      <strong className="text-gray-900 text-sm">
                        {totalPrice.toLocaleString()} RWF
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-2xl bg-gray-50 p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white hover:shadow-sm text-gray-700 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-sm text-gray-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white hover:shadow-sm text-gray-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckout}
                      className="flex-grow py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all duration-300 bg-[#128C38] hover:bg-[#0E6C2B] text-white hover:shadow-xl hover:scale-[1.01] cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Checkout ({totalPrice.toLocaleString()} RWF)
                    </button>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className={`px-4 py-3.5 rounded-2xl font-bold text-xs border transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                        isAdded
                          ? "bg-emerald-50 border-emerald-300 text-[#128C38]"
                          : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                      title="Add to cart"
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#128C38]" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Direct WhatsApp Order */}
                <a
                  href={`https://wa.me/${companyInfo.whatsapp.replace(/\+/g, "")}?text=Hello%20JREAL%20VISION,%20I%20would%20like%20to%20order%20${encodeURIComponent(
                    product.name
                  )}%20(Qty:%20${quantity},%20${encodeURIComponent(
                    rawAttributes
                      .map((a) => `${a.name}: ${selectedAttributes[a.name] || a.values[0]?.name}`)
                      .join(", ")
                  )})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-[#128C38] text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  Order directly via WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
                Related Products
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((rp) => (
                  <ProductCard key={rp.id} product={rp} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── PRODUCTION PHOTO FULL-RESOLUTION LIGHTBOX MODAL ── */}
        {isLightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Header Controls */}
            <div
              className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h3 className="font-bold text-sm sm:text-base text-white">{product.name}</h3>
                <p className="text-xs text-white/70">
                  Production View {activeImageIndex + 1} of {productImages.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Large Image */}
            <div
              className="relative max-w-5xl flex-1 w-full flex items-center justify-center overflow-hidden my-auto py-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={resolveMediaUrl(productImages[activeImageIndex] || product.image, FALLBACK_PRODUCT_IMAGE)}
                alt={`${product.name} full view`}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                }}
              />

              {productImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    title="Previous photo"
                  >
                    <ChevronLeft className="w-7 h-7" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 cursor-pointer"
                    title="Next photo"
                  >
                    <ChevronRight className="w-7 h-7" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Thumbnails Strip */}
            {productImages.length > 1 && (
              <div
                className="flex items-center justify-center gap-2.5 max-w-full overflow-x-auto py-2 px-4 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIndex(i)}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === i
                        ? "border-emerald-400 scale-105 shadow-lg ring-2 ring-emerald-400/40 opacity-100"
                        : "border-white/20 opacity-50 hover:opacity-90"
                    }`}
                  >
                    <img
                      src={resolveMediaUrl(img, FALLBACK_PRODUCT_IMAGE)}
                      alt={`thumb ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_PRODUCT_IMAGE;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
