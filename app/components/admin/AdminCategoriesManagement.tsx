import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import ConfirmModal from "@/app/components/ConfirmModal";
import {
  Layers,
  Plus,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Search,
  Package,
  ShoppingBag,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { productCategories, products as defaultProducts, type ProductCategory } from "@/lib/data";

export interface AdminCategoryItem {
  id: string;
  name: string;
  image: string;
  productCount: number;
  description: string;
  startingPrice: string;
  showOnHomeSlider: boolean;
  order: number;
  featuredProductIds: string[];
}

export const INITIAL_ADMIN_CATEGORIES: AdminCategoryItem[] = [
  {
    id: "t-shirts",
    name: "T-Shirts & Apparel",
    image: "/image/shopping_merch.jpg",
    productCount: 12,
    description: "",
    startingPrice: "From 8,000 RWF",
    showOnHomeSlider: true,
    order: 1,
    featuredProductIds: ["tshirt-basic-white", "tshirt-basic-black", "tshirt-polo"],
  },
  {
    id: "business-cards",
    name: "Business Cards & Stationery",
    image: "/image/printing_products.jpg",
    productCount: 8,
    description: "",
    startingPrice: "From 25,000 RWF",
    showOnHomeSlider: true,
    order: 2,
    featuredProductIds: ["business-card-standard", "business-card-premium"],
  },
  {
    id: "banners",
    name: "Banners & Signage",
    image: "/image/printing_products.jpg",
    productCount: 6,
    description: "",
    startingPrice: "From 15,000 RWF",
    showOnHomeSlider: true,
    order: 3,
    featuredProductIds: ["banner-small", "banner-large"],
  },
  {
    id: "mugs",
    name: "Custom Mugs & Drinkware",
    image: "/image/shopping_merch.jpg",
    productCount: 5,
    description: "",
    startingPrice: "From 5,000 RWF",
    showOnHomeSlider: true,
    order: 4,
    featuredProductIds: ["mug-white", "mug-magic"],
  },
  {
    id: "stickers",
    name: "Stickers & Decals",
    image: "/image/graphic design tool.jpg",
    productCount: 10,
    description: "",
    startingPrice: "From 3,000 RWF",
    showOnHomeSlider: true,
    order: 5,
    featuredProductIds: ["sticker-sheet"],
  },
  {
    id: "posters",
    name: "Posters & Art Prints",
    image: "/image/graphic design tool.jpg",
    productCount: 7,
    description: "",
    startingPrice: "From 5,000 RWF",
    showOnHomeSlider: true,
    order: 6,
    featuredProductIds: ["poster-a3"],
  },
  {
    id: "flyers",
    name: "Flyers & Marketing",
    image: "/image/printing_products.jpg",
    productCount: 9,
    description: "",
    startingPrice: "From 20,000 RWF",
    showOnHomeSlider: true,
    order: 7,
    featuredProductIds: ["flyer-a5"],
  },
  {
    id: "rollup-banners",
    name: "Roll-up Banners",
    image: "/image/printing_products.jpg",
    productCount: 4,
    description: "",
    startingPrice: "From 45,000 RWF",
    showOnHomeSlider: true,
    order: 8,
    featuredProductIds: [],
  },
  {
    id: "invitations",
    name: "Invitations & Cards",
    image: "/image/printing_products.jpg",
    productCount: 6,
    description: "",
    startingPrice: "From 10,000 RWF",
    showOnHomeSlider: false,
    order: 9,
    featuredProductIds: [],
  },
  {
    id: "notebooks",
    name: "Branded Notebooks",
    image: "/image/shopping_merch.jpg",
    productCount: 5,
    description: "",
    startingPrice: "From 12,000 RWF",
    showOnHomeSlider: false,
    order: 10,
    featuredProductIds: [],
  },
  {
    id: "frames",
    name: "Frames & Cases",
    image: "/image/graphic design tool.jpg",
    productCount: 4,
    description: "",
    startingPrice: "From 18,000 RWF",
    showOnHomeSlider: false,
    order: 11,
    featuredProductIds: [],
  },
  {
    id: "promotional",
    name: "Promotional Products",
    image: "/image/shopping_merch.jpg",
    productCount: 15,
    description: "",
    startingPrice: "From 4,000 RWF",
    showOnHomeSlider: true,
    order: 12,
    featuredProductIds: [],
  },
];

export default function AdminCategoriesManagement() {
  const [categories, setCategories] = useState<AdminCategoryItem[]>(INITIAL_ADMIN_CATEGORIES);
  const [catalogProducts, setCatalogProducts] = useState<any[]>(defaultProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "HOME_SLIDER" | "HIDDEN">("ALL");

  // Add / Edit Modal State
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

  // Simplified Form State: Category Name, Image, and Homepage Slider Toggle
  const [formData, setFormData] = useState<{
    name: string;
    image: string;
    showOnHomeSlider: boolean;
    featuredProductIds: string[];
  }>({
    name: "",
    image: "/image/shopping_merch.jpg",
    showOnHomeSlider: true,
    featuredProductIds: [],
  });

  // Image upload handling
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Product Selection Modal State
  const [productSelectionCatId, setProductSelectionCatId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");

  // Load products from API + localStorage to dynamically compute starting prices and counts
  const loadAllProducts = useCallback(async () => {
    try {
      let prods: any[] = [];
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.products) && data.products.length > 0) {
          prods = data.products;
        }
      }
      if (prods.length === 0) {
        const rawLocal = localStorage.getItem("jreal_admin_products_v1");
        if (rawLocal) {
          const parsed = JSON.parse(rawLocal);
          if (Array.isArray(parsed) && parsed.length > 0) prods = parsed;
        }
      }
      if (prods.length === 0) {
        prods = defaultProducts;
      }
      setCatalogProducts(prods);
    } catch {
      setCatalogProducts(defaultProducts);
    }
  }, []);

  // Compute category stats automatically based on products in catalog
  const getCategoryStats = useCallback(
    (catName: string, catId?: string) => {
      const nameLower = (catName || "").trim().toLowerCase();
      const idLower = (catId || "").trim().toLowerCase();

      const matching = catalogProducts.filter((p) => {
        const pCat = (p.category || "").trim().toLowerCase();
        return (nameLower && pCat === nameLower) || (idLower && pCat === idLower);
      });

      const count = matching.length;
      const prices = matching
        .map((p) => Number(p.price) || 0)
        .filter((pr) => pr > 0);

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const startingPrice =
        minPrice > 0 ? `From ${minPrice.toLocaleString()} RWF` : "From 0 RWF";

      return {
        count,
        minPrice,
        startingPrice,
        matchingProducts: matching,
      };
    },
    [catalogProducts]
  );

  // Load categories and products on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jreal_admin_categories");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load saved categories", e);
    }

    loadAllProducts();

    const handleProdUpdate = () => loadAllProducts();
    window.addEventListener("jreal_products_updated", handleProdUpdate);
    return () => {
      window.removeEventListener("jreal_products_updated", handleProdUpdate);
    };
  }, [loadAllProducts]);

  // Save changes to localStorage and dispatch event for live updates
  const saveAndBroadcast = (updated: AdminCategoryItem[]) => {
    setCategories(updated);
    try {
      localStorage.setItem("jreal_admin_categories", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("jreal_categories_updated", { detail: updated }));
      // Also sync to API
      fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      }).catch(() => {});
    } catch (e) {
      console.error("Storage error", e);
    }
  };

  // Open modal for new category
  const openAddCategory = () => {
    setEditingId(null);
    setModalError(null);
    setFormData({
      name: "",
      image: "/image/shopping_merch.jpg",
      showOnHomeSlider: true,
      featuredProductIds: [],
    });
    setIsModalOpen(true);
  };

  // Open modal for editing category
  const openEditCategory = (cat: AdminCategoryItem) => {
    setEditingId(cat.id);
    setModalError(null);
    setFormData({
      name: cat.name,
      image: cat.image || "/image/shopping_merch.jpg",
      showOnHomeSlider: cat.showOnHomeSlider,
      featuredProductIds: cat.featuredProductIds || [],
    });
    setIsModalOpen(true);
  };

  // Handle image upload with instant preview
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setModalError(null);

    try {
      // 1. Instant local base64 preview so the image shows up right away ("here show the image we appload")
      const base64Data: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setFormData((prev) => ({ ...prev, image: base64Data }));

      // 2. Upload to server in background
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Data,
          filename: file.name,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setFormData((prev) => ({ ...prev, image: data.url }));
        }
      }
    } catch (err: any) {
      console.warn("[category image upload error]:", err);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Save Category Form (Auto slug, auto starting price, auto product count)
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    if (!cleanName) {
      setModalError("Please enter a category name");
      return;
    }

    // Auto-generate clean slug/id under the hood without bothering the user
    const slug =
      editingId ||
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") ||
      `cat_${Date.now()}`;

    // Automatically calculate starting price (smallest product price) and product count
    const stats = getCategoryStats(cleanName, slug);

    const categoryData: AdminCategoryItem = {
      id: slug,
      name: cleanName,
      image: formData.image.trim() || "/image/shopping_merch.jpg",
      productCount: stats.count,
      description: "",
      startingPrice: stats.startingPrice,
      showOnHomeSlider: formData.showOnHomeSlider,
      featuredProductIds: formData.featuredProductIds || [],
      order: editingId
        ? (categories.find((c) => c.id === editingId)?.order || 1)
        : categories.length + 1,
    };

    if (editingId) {
      const updated = categories.map((c) => (c.id === editingId ? categoryData : c));
      saveAndBroadcast(updated);
    } else {
      saveAndBroadcast([...categories, categoryData]);
    }

    setIsModalOpen(false);
    setModalError(null);
  };

  // Toggle Show on Home Slider
  const handleToggleHomeSlider = (id: string) => {
    const updated = categories.map((c) =>
      c.id === id ? { ...c, showOnHomeSlider: !c.showOnHomeSlider } : c
    );
    saveAndBroadcast(updated);
  };

  // Delete Category
  const handleDeleteCategory = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Product Category",
      message: `Are you sure you want to delete the "${name}" category? Products assigned to this category will become unassigned.`,
      confirmLabel: "Delete Category",
      variant: "danger",
      onConfirm: () => {
        const updated = categories.filter((c) => c.id !== id);
        saveAndBroadcast(updated);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Move Category Order (Up / Down)
  const handleMoveOrder = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Re-index orders
    const reordered = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    saveAndBroadcast(reordered);
  };

  // Toggle a product inside category's featured products list
  const handleToggleProductInCat = (catId: string, productId: string) => {
    const updated = categories.map((c) => {
      if (c.id !== catId) return c;
      const currentIds = c.featuredProductIds || [];
      const newIds = currentIds.includes(productId)
        ? currentIds.filter((id) => id !== productId)
        : [...currentIds, productId];
      return { ...c, featuredProductIds: newIds };
    });
    saveAndBroadcast(updated);
  };

  // Filtered categories
  const filteredCategories = categories.filter((cat) => {
    const matchesFilter =
      activeFilter === "ALL" ||
      (activeFilter === "HOME_SLIDER" && cat.showOnHomeSlider) ||
      (activeFilter === "HIDDEN" && !cat.showOnHomeSlider);

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      cat.name.toLowerCase().includes(q) ||
      cat.id.toLowerCase().includes(q);

    return matchesFilter && matchesSearch;
  });

  const activeHomeSliderCount = categories.filter((c) => c.showOnHomeSlider).length;
  const currentSelectionCat = categories.find((c) => c.id === productSelectionCatId);

  // Live auto-calculated stats for the category currently being edited/added in modal
  const modalStats = getCategoryStats(formData.name, editingId || undefined);

  return (
    <div className="space-y-8">
      {/* ── Header & Action Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#128C38]/10 text-[#128C38]">
              <Layers className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Categories & Homepage Slider Management
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Create product categories with automatic smallest starting price and live product count.
          </p>
        </div>

        <button
          onClick={openAddCategory}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#128C38] hover:bg-[#0B5424] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* ── Stats Highlights ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
              Total Categories
            </span>
            <span className="text-2xl font-black text-gray-900">{categories.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-600 block uppercase tracking-wider">
              On Homepage Slider
            </span>
            <span className="text-2xl font-black text-[#128C38]">{activeHomeSliderCount} Active</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#128C38]">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-400 block uppercase tracking-wider">
              Total Products in Catalog
            </span>
            <span className="text-2xl font-black text-gray-900">{catalogProducts.length} Items</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── Live Homepage Slider Preview ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#128C38]" />
            <h3 className="text-sm font-bold text-gray-900">
              Live Homepage Slider Preview ({activeHomeSliderCount} cards showing on site)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-gray-400">
            Horizontal scroll view as customers see it
          </span>
        </div>

        {/* Live Mini Carousel */}
        <div className="flex items-center gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories
            .filter((c) => c.showOnHomeSlider)
            .map((cat) => {
              const stats = getCategoryStats(cat.name, cat.id);
              const displayCount = stats.count > 0 ? stats.count : cat.productCount || 0;
              const displayPrice = stats.minPrice > 0 ? stats.startingPrice : cat.startingPrice || "From 0 RWF";

              return (
                <div
                  key={cat.id}
                  className="w-56 shrink-0 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-[16/10] w-full bg-gray-200 overflow-hidden">
                    <img
                      src={cat.image || "/image/shopping_merch.jpg"}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/image/shopping_merch.jpg";
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-white/95 text-[10px] font-bold px-2 py-0.5 rounded text-gray-900 shadow-xs">
                        {displayCount} Products
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-xs text-gray-900 line-clamp-1 mb-1">{cat.name}</h4>
                    <p className="text-[10px] text-emerald-700 font-semibold line-clamp-1 mb-2">
                      {displayPrice}
                    </p>
                    <div className="w-full py-1.5 bg-[#128C38] text-white text-[10px] font-bold rounded-lg text-center">
                      Shop Now →
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search categories by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#128C38]"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeFilter === "ALL" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600"
            }`}
          >
            All ({categories.length})
          </button>
          <button
            onClick={() => setActiveFilter("HOME_SLIDER")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeFilter === "HOME_SLIDER"
                ? "bg-[#128C38] text-white shadow-xs"
                : "text-gray-600"
            }`}
          >
            Active on Slider ({activeHomeSliderCount})
          </button>
          <button
            onClick={() => setActiveFilter("HIDDEN")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeFilter === "HIDDEN" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600"
            }`}
          >
            Hidden ({categories.length - activeHomeSliderCount})
          </button>
        </div>
      </div>

      {/* ── Categories Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Starting Price</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Home Slide Show</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((cat, index) => {
                const stats = getCategoryStats(cat.name, cat.id);
                const displayCount = stats.count > 0 ? stats.count : cat.productCount || 0;
                const displayStartingPrice =
                  stats.minPrice > 0 ? stats.startingPrice : cat.startingPrice || "From 0 RWF";
                const featuredCount = (cat.featuredProductIds || []).length;

                return (
                  <tr key={cat.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Order column */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-500 w-5">{cat.order || index + 1}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => handleMoveOrder(index, "up")}
                            disabled={index === 0}
                            className="p-0.5 text-gray-400 hover:text-gray-800 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleMoveOrder(index, "down")}
                            disabled={index === categories.length - 1}
                            className="p-0.5 text-gray-400 hover:text-gray-800 disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Category Image & Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                          <img
                            src={cat.image || "/image/shopping_merch.jpg"}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/image/shopping_merch.jpg";
                            }}
                          />
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 text-sm block">{cat.name}</span>
                          <span className="text-[10px] text-gray-400">
                            {displayCount} item{displayCount !== 1 ? "s" : ""} in catalog
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Auto-Calculated Starting Price */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {displayStartingPrice}
                      </span>
                    </td>

                    {/* Products Count & Select Featured */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-bold text-[11px]">
                          {displayCount} Products
                        </span>
                        <button
                          onClick={() => setProductSelectionCatId(cat.id)}
                          className="text-[11px] font-bold text-[#128C38] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Featured ({featuredCount})</span>
                        </button>
                      </div>
                    </td>

                    {/* Home Slider Toggle Switch */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleHomeSlider(cat.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          cat.showOnHomeSlider
                            ? "bg-[#128C38]/10 text-[#128C38] border border-[#128C38]/30 hover:bg-[#128C38]/20"
                            : "bg-gray-100 text-gray-400 border border-gray-200 hover:text-gray-700"
                        }`}
                      >
                        {cat.showOnHomeSlider ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Shown on Home</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Hidden</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Edit & Delete Actions */}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditCategory(cat)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Category"
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

      {/* ── REDESIGNED SIMPLE MODAL: ADD / EDIT CATEGORY ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingId ? "Edit Product Category" : "Add New Product Category"}
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Starting price and product count are automatically calculated from catalog products.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              {modalError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
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

              {/* 1. Category Name */}
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Hoodies & Sweatshirts"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#128C38]"
                />
              </div>

              {/* 2. Auto-Calculated Category Stats Card */}
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#128C38]" />
                  <span className="text-[11px] font-bold text-[#0B5424] uppercase tracking-wider">
                    Automatic Product Pricing & Count
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Starting Price
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {modalStats.startingPrice}
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">
                      Smallest price in catalog
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">
                      Products Count
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {modalStats.count} {modalStats.count === 1 ? "Product" : "Products"}
                    </span>
                    <span className="text-[10px] text-emerald-700 block mt-0.5">
                      Auto-counted from catalog
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Category Image Field with 2 Optionals */}
              <div className="space-y-2.5 pt-1">
                <label className="block text-xs font-bold text-gray-800">
                  Category Image
                </label>

                {/* Option 1: File Upload */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-[#128C38]" />
                      Option 1: Upload Photo
                    </span>
                    {isUploadingImage && (
                      <span className="text-[11px] text-[#128C38] flex items-center gap-1 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                      </span>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="w-full py-2 px-3 border border-dashed border-gray-300 rounded-lg bg-white hover:bg-emerald-50/50 hover:border-[#128C38] text-xs font-semibold text-gray-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 text-[#128C38]" />
                    <span>{formData.image ? "Upload a different photo" : "Select & Upload Photo"}</span>
                  </button>
                </div>

                {/* Option 2: Image Link */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5">
                  <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-gray-500" />
                    Option 2: Image Link / URL (Optional)
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. /image/shopping_merch.jpg or https://..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-gray-200 focus:outline-none focus:border-[#128C38]"
                  />
                </div>

                {/* Live Preview ("here show the image we appload") */}
                {formData.image && (
                  <div className="p-2.5 bg-white rounded-xl border border-gray-200 flex items-center gap-3 shadow-2xs">
                    <div className="relative w-14 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center">
                      <img
                        src={formData.image}
                        alt="Category Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/image/shopping_merch.jpg";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-gray-800 block">
                        Category Image Preview
                      </span>
                      <span className="text-[11px] text-gray-400 truncate block">
                        {formData.image.startsWith("data:") ? "Uploaded from device" : formData.image}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Clear image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* 4. Show in Homepage Slide Show Toggle */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">
                    Show in Homepage Slide Show
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Category card will appear in the slider on the home page.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showOnHomeSlider}
                  onChange={(e) =>
                    setFormData({ ...formData, showOnHomeSlider: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#128C38] rounded cursor-pointer"
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#128C38] hover:bg-[#0B5424] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {editingId ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: SELECT PRODUCTS FOR HOMEPAGE SHOWCASE ── */}
      {productSelectionCatId && currentSelectionCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[11px] text-[#128C38] font-bold uppercase tracking-wider block">
                  Curate Category Products
                </span>
                <h3 className="text-base font-bold text-gray-900">
                  Select Showcase Products for "{currentSelectionCat.name}"
                </h3>
              </div>
              <button
                onClick={() => setProductSelectionCatId(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Check which specific products from your catalog should be highlighted when customers view this category slide on the homepage or shop page.
            </p>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products in catalog..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#128C38]"
              />
            </div>

            {/* Products List with Checkboxes */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {catalogProducts
                .filter((p) =>
                  !productSearch.trim() ||
                  (p.name || p.title || "").toLowerCase().includes(productSearch.toLowerCase()) ||
                  (p.category || "").toLowerCase().includes(productSearch.toLowerCase())
                )
                .map((product) => {
                  const isChecked = (currentSelectionCat.featuredProductIds || []).includes(product.id);
                  const priceNum = Number(product.price) || 0;

                  return (
                    <div
                      key={product.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleToggleProductInCat(currentSelectionCat.id, product.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleToggleProductInCat(currentSelectionCat.id, product.id);
                        }
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? "border-[#128C38] bg-emerald-50/30 ring-1 ring-[#128C38]"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? "bg-[#128C38] border-[#128C38] text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div>
                          <p className="text-xs font-bold text-gray-900 leading-tight">
                            {product.name || product.title}
                          </p>
                          <span className="text-[11px] text-gray-400">
                            {product.category} • {priceNum.toLocaleString()} RWF
                          </span>
                        </div>
                      </div>

                      {isChecked && (
                        <span className="text-[10px] font-bold text-[#128C38] bg-[#128C38]/10 px-2 py-0.5 rounded-md">
                          Selected ✓
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {(currentSelectionCat.featuredProductIds || []).length} products selected
              </span>
              <button
                onClick={() => setProductSelectionCatId(null)}
                className="px-5 py-2 bg-[#128C38] hover:bg-[#0B5424] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Done
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
    </div>
  );
}
