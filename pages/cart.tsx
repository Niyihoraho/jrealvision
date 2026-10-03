import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { useCart } from "@/app/components/CartProvider";
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();

  return (
    <>
      <Head>
        <title>Shopping Cart ({totalItems}) — JREAL VISION DESIGN</title>
        <meta
          name="description"
          content="Review your selected design services, custom merchandise, and Rwandan fine art before checkout."
        />
      </Head>

      <Header />

      <main className="min-h-screen bg-[#F8FAFC] pt-24 sm:pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Subtle Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 py-1">
            <Link href="/" className="hover:text-slate-800 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <Link href="/shop" className="hover:text-slate-800 transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-800 font-medium">Cart</span>
          </nav>

          {/* Cart Header */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-200/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#128C38]/10 flex items-center justify-center text-[#128C38]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Your Cart
              </h1>
              {totalItems > 0 && (
                <span className="w-6 h-6 rounded-full bg-[#128C38] text-white text-xs font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </div>

            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Cart Content */}
          {items.length === 0 ? (
            /* ── Clean Minimal Empty State ── */
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-8 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-300 border border-slate-100">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-1">
                Your cart is empty
              </h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Add products from our print shop, design studio, or fine art gallery to get started.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#128C38] hover:bg-[#0E6C2B] text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors"
                >
                  Browse Shop
                </Link>
                <Link
                  href="/gallery"
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                >
                  Art Gallery
                </Link>
              </div>
            </div>
          ) : (
            /* ── Two Column Cart Layout ── */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Items List (8 cols) */}
              <div className="lg:col-span-8 space-y-3.5">
                {items.map((item) => (
                  <div
                    key={`${item.id}-${item.options || ""}`}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all flex gap-4 sm:gap-5 items-start"
                  >
                    {/* Item Thumbnail */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0">
                      <Image
                        src={item.image || "/image/shopping_merch.jpg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 80px, 96px"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate">
                            {item.name}
                          </h3>

                          {item.options && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {item.options}
                            </p>
                          )}
                        </div>

                        {/* Trash Button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="mt-2 text-[#128C38] font-bold text-sm sm:text-base">
                        {(item.price * item.quantity).toLocaleString()} RWF
                        {item.quantity > 1 && (
                          <span className="text-xs font-normal text-slate-400 ml-2">
                            ({item.price.toLocaleString()} RWF each)
                          </span>
                        )}
                      </div>

                      {/* Stepper Controls */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <span className="text-xs font-bold text-slate-800 w-6 text-center">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Back to shopping link */}
                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#128C38] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Continue shopping</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Order Summary (4 cols) */}
              <div className="lg:col-span-4 lg:sticky lg:top-32">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Order Summary
                  </h2>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})</span>
                      <span className="font-semibold text-slate-800">
                        {totalPrice.toLocaleString()} RWF
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-500">
                      <span>Delivery</span>
                      <span className="text-slate-400">Calculated next</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <span className="text-sm font-medium text-slate-700">Total</span>
                    <span className="text-xl sm:text-2xl font-black text-slate-900">
                      {totalPrice.toLocaleString()} <span className="text-xs font-bold text-slate-500">RWF</span>
                    </span>
                  </div>

                  {/* Primary Checkout Button */}
                  <Link
                    href="/checkout"
                    className="w-full py-3.5 px-4 bg-[#128C38] hover:bg-[#0E6C2B] text-white font-bold text-sm rounded-xl transition-all shadow-2xs hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer text-center"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-1">
                    Secure checkout · MTN MoMo, Airtel Money, Bank Transfer & Delivery
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
