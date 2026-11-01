"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Plus, Check } from "lucide-react";
import { useCart } from "./CartProvider";
import { productCategories, type Product } from "@/lib/data";
import { resolveMediaUrl, FALLBACK_PRODUCT_IMAGE } from "@/lib/mediaUtils";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const categoryName =
    productCategories.find((c) => c.id === product.category)?.name ||
    product.category.replace(/-/g, " ");

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Product Image */}
      <Link
        href={`/shop/${product.id}`}
        className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden bg-gray-50 block"
      >
        <Image
          src={resolveMediaUrl(product.image, FALLBACK_PRODUCT_IMAGE)}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>

      {/* Product Info & Actions */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Category Tag */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#1E5627] mb-1">
            <MapPin className="w-3 h-3 text-[#1E5627] shrink-0" />
            <span className="capitalize truncate">{categoryName}</span>
          </div>

          {/* Product Title */}
          <Link href={`/shop/${product.id}`} className="block group/title mb-2">
            <p className="text-[13px] sm:text-sm font-medium text-gray-900 leading-snug group-hover/title:text-[#1E5627] transition-colors line-clamp-1">
              {product.name}
            </p>
          </Link>

          {/* Price Line */}
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              {product.price.toLocaleString()} RWF
            </span>
            <span className="text-[11px] text-gray-400 font-normal">/ piece</span>
          </div>
        </div>

        {/* Full-width Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className={`w-full text-xs sm:text-[13px] font-semibold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 shadow-2xs active:scale-[0.98] ${
            isAdded
              ? "bg-[#0E6C2B] text-white"
              : "bg-[#1E5627] hover:bg-[#154420] text-white"
          }`}
          aria-label={`Add ${product.name} to cart`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
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
  );
}
