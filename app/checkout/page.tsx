"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { CreditCard, Lock, Truck } from "lucide-react";

// California sales tax rate (base state rate)
// Note: Actual rates vary by city/county (7.25% - 10.75%)
// Using 7.25% as the base state rate
const CA_TAX_RATE = 0.0725;

// Free shipping threshold
const FREE_SHIPPING_THRESHOLD = 35;

// Packaging weight (box, bubble wrap, air pillows, tape) in lbs
const PACKAGING_WEIGHT = 0.4;

// USPS Priority Mail approximate rates by weight (lbs)
// These are baseline rates - actual rates vary by zone
const USPS_RATES: { maxWeight: number; rate: number }[] = [
  { maxWeight: 0.5, rate: 5.99 },   // Up to 8oz
  { maxWeight: 1, rate: 7.99 },     // Up to 1 lb
  { maxWeight: 2, rate: 9.99 },     // Up to 2 lbs
  { maxWeight: 3, rate: 11.99 },    // Up to 3 lbs
  { maxWeight: 5, rate: 14.99 },    // Up to 5 lbs
  { maxWeight: 10, rate: 19.99 },   // Up to 10 lbs
  { maxWeight: 20, rate: 29.99 },   // Up to 20 lbs
];

function calculateShipping(totalWeight: number, subtotal: number): number {
  // Free shipping for orders $35+
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  // Find applicable rate based on weight
  for (const tier of USPS_RATES) {
    if (totalWeight <= tier.maxWeight) {
      return tier.rate;
    }
  }

  // For very heavy orders, use highest rate
  return USPS_RATES[USPS_RATES.length - 1].rate;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const subtotal = getTotalPrice();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Integrate with Stripe Payment Intent API
    // For now, simulate checkout
    setTimeout(() => {
      clearCart();
      router.push("/order-confirmation");
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Calculate total weight from cart items (using weight property if available, default 0.5 lb)
  // Add packaging weight (box, bubble wrap, air pillows, tape)
  const totalWeight = useMemo(() => {
    const productWeight = items.reduce((sum, item) => {
      const itemWeight = item.weight || 0.5; // Default 0.5 lb per item
      return sum + (itemWeight * item.quantity);
    }, 0);
    return productWeight + PACKAGING_WEIGHT;
  }, [items]);

  // Calculate shipping
  const shippingCost = calculateShipping(totalWeight, subtotal);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  // Calculate tax - only applies to California
  const isCaliforniaOrder = formData.state.toLowerCase().trim() === 'ca' ||
                            formData.state.toLowerCase().trim() === 'california';
  const taxAmount = isCaliforniaOrder ? subtotal * CA_TAX_RATE : 0;
  const total = subtotal + shippingCost + taxAmount;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-700 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
          <a href="/products" className="text-primary-400 hover:text-primary-300 transition-colors">
            Continue shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-700 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-dark-600 rounded-lg shadow-lg border border-dark-500 p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Contact Information
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-dark-600 rounded-lg shadow-lg border border-dark-500 p-6">
                <h2 className="text-2xl font-semibold text-white mb-4">
                  Shipping Address
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-dark-500 border border-dark-400 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Payment - Placeholder for Stripe */}
              <div className="bg-dark-600 rounded-lg shadow-lg border border-dark-500 p-6">
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <CreditCard className="w-6 h-6 mr-2" />
                  Payment
                </h2>
                <div className="bg-primary-900/30 border border-primary-700/50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-primary-200 flex items-center">
                    <Lock className="w-4 h-4 mr-2" />
                    Secure payment powered by Stripe (Integration pending)
                  </p>
                </div>
                <p className="text-gray-400">
                  Payment processing will be integrated with Stripe for secure transactions.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-4 rounded-lg transition-all shadow-lg shadow-primary-600/25 flex items-center justify-center"
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Place Order - ${total.toFixed(2)}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-dark-600 rounded-lg shadow-lg border border-dark-500 p-6 sticky top-24">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Order Summary
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex-grow">
                      <p className="text-white font-medium">{item.title}</p>
                      <p className="text-sm text-gray-400">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-white font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-dark-500 mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-lg text-gray-300">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg text-gray-300">
                  <span className="flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    Shipping:
                  </span>
                  <span className="font-semibold text-white">
                    {isFreeShipping ? (
                      <span className="text-green-400">FREE</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>
                {!isFreeShipping && (
                  <p className="text-xs text-green-400">
                    Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping!
                  </p>
                )}
                <div className="flex justify-between text-lg text-gray-300">
                  <span>Tax {isCaliforniaOrder ? '(CA 7.25%)' : ''}:</span>
                  <span className="font-semibold text-white">
                    {isCaliforniaOrder ? `$${taxAmount.toFixed(2)}` : '$0.00'}
                  </span>
                </div>
                {!isCaliforniaOrder && formData.state && (
                  <p className="text-xs text-gray-500">
                    Sales tax only applies to California orders
                  </p>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-dark-500 text-white">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
