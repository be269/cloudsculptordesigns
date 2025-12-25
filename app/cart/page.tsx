"use client";

import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const total = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-700 py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-500 mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-400 mb-8">
              Add some amazing 3D printed items to your cart!
            </p>
            <Link
              href="/products"
              className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-lg shadow-primary-600/25"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-700 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Shopping Cart
        </h1>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-dark-600 rounded-lg shadow-lg border border-dark-500 p-6 flex flex-col sm:flex-row gap-4"
            >
              {/* Product Image */}
              <div className="w-full sm:w-32 h-32 bg-dark-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="text-4xl">🎨</div>
              </div>

              {/* Product Info */}
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-2xl font-bold text-white">
                  ${item.price.toFixed(2)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg border border-dark-400 hover:bg-dark-500 hover:border-primary-600/50 flex items-center justify-center text-gray-300 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-dark-400 hover:bg-dark-500 hover:border-primary-600/50 flex items-center justify-center text-gray-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Remove from cart"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="mt-8 bg-dark-600 rounded-lg shadow-lg border border-dark-500 p-6">
          <div className="space-y-4">
            <div className="flex justify-between text-lg">
              <span className="text-gray-300">Subtotal:</span>
              <span className="font-semibold text-white">
                ${total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-300">Shipping:</span>
              <span className="font-semibold text-white">
                Calculated at checkout
              </span>
            </div>
            <div className="border-t border-dark-500 pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span className="text-white">Total:</span>
                <span className="text-white">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/checkout"
              className="block w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-semibold py-3 rounded-lg text-center transition-all shadow-lg shadow-primary-600/25"
            >
              Proceed to Checkout
            </Link>
            <Link
              href="/products"
              className="block w-full bg-dark-500 hover:bg-dark-400 border border-dark-400 text-white font-semibold py-3 rounded-lg text-center transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
