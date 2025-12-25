import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-dark-700 py-12 px-4 md:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mb-4">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-300 mb-8">
          Thank you for your order! You will receive a confirmation email shortly with your order details.
        </p>

        <div className="bg-dark-600 rounded-lg shadow-lg border border-dark-500 p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            What&apos;s Next?
          </h2>
          <ul className="text-left space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="text-primary-400 mr-2 font-semibold">1.</span>
              You&apos;ll receive an order confirmation email
            </li>
            <li className="flex items-start">
              <span className="text-primary-400 mr-2 font-semibold">2.</span>
              We&apos;ll start crafting your unique 3D printed items
            </li>
            <li className="flex items-start">
              <span className="text-primary-400 mr-2 font-semibold">3.</span>
              You&apos;ll receive a shipping notification with tracking
            </li>
            <li className="flex items-start">
              <span className="text-primary-400 mr-2 font-semibold">4.</span>
              Your order will arrive within the estimated timeframe
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/products"
            className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 text-white font-semibold px-8 py-3 rounded-lg transition-all shadow-lg shadow-primary-600/25"
          >
            Continue Shopping
          </Link>
          <div>
            <Link
              href="/"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
