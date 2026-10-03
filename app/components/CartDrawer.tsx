"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-[#128C38]" />
            <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
            <span className="bg-[#128C38] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {totalItems}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium text-lg">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-1">Add products to get started</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-6 px-6 py-2.5 bg-[#128C38] text-white rounded-full font-semibold hover:bg-[#0B5424] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.options}`}
                  className="flex gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#128C38]/20 transition-colors"
                >
                  <div className="w-20 h-20 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {item.name}
                    </h4>
                    {item.options && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.options}</p>
                    )}
                    <p className="text-[#128C38] font-bold text-sm mt-1">
                      {item.price.toLocaleString()} RWF
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#128C38] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#128C38] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="text-2xl font-extrabold text-gray-900">
                {totalPrice.toLocaleString()} RWF
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block text-center w-full py-3.5 bg-[#128C38] hover:bg-[#0E6C2B] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-base"
            >
              Checkout
            </Link>
            <Link
              href="/request-quote"
              onClick={() => setIsCartOpen(false)}
              className="block text-center w-full py-2.5 text-[#128C38] font-semibold hover:bg-emerald-50 rounded-xl transition-colors text-sm"
            >
              Request a Quote Instead
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
