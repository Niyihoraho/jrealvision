import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Header from "@/app/components/Header";
import RoleGuard from "@/app/components/RoleGuard";
import ProductAttributeManager from "@/app/components/admin/ProductAttributeManager";
import ProductImageManager from "@/app/components/admin/ProductImageManager";
import {
  ProductAttribute,
  createDefaultApparelAttributes,
} from "@/lib/productAttributes";
import {
  ArrowLeft,
  Check,
  Loader2,
  Package,
  Eye,
  AlertCircle,
} from "lucide-react";
import { PRODUCT_CATEGORIES } from "./new";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("T-Shirts & Apparel");
  const [price, setPrice] = useState<number | "">(18000);
  const [stock, setStock] = useState<number | "">(100);
  const [description, setDescription] = useState("");
  const [customizable, setCustomizable] = useState(true);
  const [status, setStatus] = useState<"Active" | "Draft">("Active");
  const [featured, setFeatured] = useState(false);

  // Photos state
  const [images, setImages] = useState<string[]>(["/image/printing_products.jpg"]);
  const [coverImage, setCoverImage] = useState<string>("/image/printing_products.jpg");

  // Variant Attributes state
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load product on mount or when id changes
  useEffect(() => {
    if (!id || typeof id !== "string") return;

    let isMounted = true;

    // 1. Try local storage cache first for instant 0ms form display
    try {
      const rawLocal = localStorage.getItem("jreal_admin_products_v1");
      if (rawLocal) {
        const list = JSON.parse(rawLocal);
        const found = list.find((item: any) => item.id === id);
        if (found) {
          setTitle(found.title || found.name || "");
          setCategory(found.category || "T-Shirts & Apparel");
          setPrice(Number(found.price) || 0);
          setStock(Number(found.stock) || 0);
          setDescription(found.description || "");
          setCustomizable(found.customizable ?? true);
          setStatus(found.status || "Active");
          const imgs = found.images || [found.image || "/image/printing_products.jpg"];
          setImages(imgs);
          setCoverImage(found.image || imgs[0]);
          setAttributes(found.attributes || createDefaultApparelAttributes());
        }
      }
    } catch (e) {}
    fetch(`/api/products?id=${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.product) {
          const p = data.product;
          setTitle(p.name || p.title || "");
          setCategory(p.category || "T-Shirts & Apparel");
          setPrice(Number(p.price) || 0);
          setStock(Number(p.stock) || 0);
          setDescription(p.description || "");
          setCustomizable(p.customizable ?? true);
          setStatus(p.active !== false ? "Active" : "Draft");
          setFeatured(Boolean(p.featured));

          const imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.image || "/image/printing_products.jpg"];
          setImages(imgs);
          setCoverImage(p.image || imgs[0]);

          if (Array.isArray(p.attributes) && p.attributes.length > 0) {
            setAttributes(p.attributes);
          } else {
            setAttributes(createDefaultApparelAttributes());
          }
          setIsLoading(false);
          return;
        }

        // Fallback to local storage if DB query didn't return
        try {
          const rawLocal = localStorage.getItem("jreal_admin_products_v1");
          if (rawLocal) {
            const list = JSON.parse(rawLocal);
            const found = list.find((item: any) => item.id === id);
            if (found) {
              setTitle(found.title || found.name || "");
              setCategory(found.category || "T-Shirts & Apparel");
              setPrice(Number(found.price) || 0);
              setStock(Number(found.stock) || 0);
              setDescription(found.description || "");
              setCustomizable(found.customizable ?? true);
              setStatus(found.status || "Active");
              const imgs = found.images || [found.image || "/image/printing_products.jpg"];
              setImages(imgs);
              setCoverImage(found.image || imgs[0]);
              setAttributes(found.attributes || createDefaultApparelAttributes());
            }
          }
        } catch (e) {}
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn("[edit product load warning]:", err);
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Please enter a product title.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMessage("Please enter a valid product price.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const mainCover = coverImage || images[0] || "/image/printing_products.jpg";
    const allImages = images.length > 0 ? images : [mainCover];

    try {
      const payload = {
        id,
        name: title.trim(),
        category,
        price: Number(price),
        stock: Number(stock) || 0,
        description: description.trim(),
        images: allImages,
        image: mainCover,
        attributes,
        customizable,
        featured,
        active: status === "Active",
      };

      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update product in database");
      }

      // Update local storage cache
      try {
        const rawLocal = localStorage.getItem("jreal_admin_products_v1");
        if (rawLocal) {
          const existing = JSON.parse(rawLocal);
          const updated = existing.map((item: any) =>
            item.id === id
              ? {
                  ...item,
                  title: title.trim(),
                  category,
                  price: Number(price),
                  stock: Number(stock) || 0,
                  description: description.trim(),
                  image: mainCover,
                  images: allImages,
                  attributes,
                  customizable,
                  status,
                }
              : item
          );
          localStorage.setItem("jreal_admin_products_v1", JSON.stringify(updated));
          window.dispatchEvent(new Event("jreal_products_updated"));
        }
      } catch (err) {}

      // Redirect back to admin products list
      router.push("/admin/dashboard?tab=products");
    } catch (err: any) {
      console.error("[Update Product Error]:", err);
      setErrorMessage(err.message || "Failed to save product updates. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isLoading && !title) {
    return (
      <RoleGuard allowedRoles={["ADMIN", "STAFF"]}>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Header />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span>Loading product details...</span>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["ADMIN", "STAFF"]}>
      <Head>
        <title>Edit Product — JREAL Admin</title>
      </Head>

      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />

        <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {/* Top Breadcrumb & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                <Link
                  href="/admin/dashboard?tab=products"
                  className="hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Store Products</span>
                </Link>
                <span>/</span>
                <span className="text-slate-800 font-semibold">Edit Product</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Edit Product: {title || "Product"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Modify catalog details, variant stock counts, and high-resolution photo gallery.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/admin/dashboard?tab=products"
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                form="edit-product-form"
                disabled={isSubmitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to DB...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ── Left Column: Form Details (8 cols) ── */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Basic Information */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span>Basic Information</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Identify how this product is titled and categorized in the store.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Premium Corporate Heavyweight Polo"
                      className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                      >
                        {PRODUCT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        Base Price (RWF) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
                        placeholder="18000"
                        className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Product Description & Specifications
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe material composition (e.g. 220 GSM Cotton), printing method (UV, screen print, embroidery), dimensions, and packaging details..."
                      className="w-full text-xs p-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-emerald-600 leading-relaxed"
                    />
                  </div>
                </div>

                {/* 2. Photo Gallery & Uploads */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs">
                  <ProductImageManager
                    images={images}
                    coverImage={coverImage}
                    onChange={(newImages, newCover) => {
                      setImages(newImages);
                      setCoverImage(newCover);
                    }}
                  />
                </div>

                {/* 3. Customer Attributes & Stock Variants */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs">
                  <ProductAttributeManager
                    attributes={attributes}
                    onChange={(newAttrs) => setAttributes(newAttrs)}
                  />
                </div>
              </div>

              {/* ── Right Column: Settings & Live Preview (4 cols) ── */}
              <div className="lg:col-span-4 space-y-6">
                {/* Inventory & Settings Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Inventory & Visibility
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Total Stock Inventory (Units) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value ? Number(e.target.value) : "")}
                      placeholder="100"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-mono font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Store Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "Active" | "Draft")}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold"
                    >
                      <option value="Active">Active (Published to Store)</option>
                      <option value="Draft">Draft (Hidden from Catalog)</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customizable}
                        onChange={(e) => setCustomizable(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Client Customization Allowed
                        </span>
                        <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                          Customers can upload logos or specify artwork during checkout.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-emerald-600 rounded"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          Featured Showcase
                        </span>
                        <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                          Display prominently in shop banner and homepage.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Live Catalog Card Preview */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Store Card Preview
                      </span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      Live Layout
                    </span>
                  </div>

                  {/* Catalog Card */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <div className="aspect-4/3 bg-slate-100 relative overflow-hidden">
                      <img
                        src={coverImage || images[0] || "/image/printing_products.jpg"}
                        alt={title || "Product Preview"}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-2xs text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                        {category}
                      </span>
                      {images.length > 1 && (
                        <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
                          {images.length} Photos
                        </span>
                      )}
                      {customizable && (
                        <span className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          Customizable
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {title || "Untitled Product"}
                      </h4>

                      {attributes.length > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-slate-100">
                          {attributes.slice(0, 2).map((a) => (
                            <div key={a.id} className="text-[11px] text-slate-600 flex items-center gap-1 truncate">
                              <span className="font-semibold text-slate-700">{a.name}:</span>
                              <span>{a.values.map((v) => v.name).join(", ")}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-extrabold text-emerald-700">
                          {Number(price || 0).toLocaleString()} RWF
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Submit Block */}
                <div className="pt-2">
                  <button
                    type="submit"
                    form="edit-product-form"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating in Database...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Product Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </main>
      </div>
    </RoleGuard>
  );
}
