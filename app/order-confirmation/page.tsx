import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 md:px-8">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Order Confirmed!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Thank you for your order! You will receive a confirmation email shortly with your order details.
        </p>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            What's Next?
          </h2>
          <ul className="text-left space-y-3 text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">1.</span>
              You'll receive an order confirmation email
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">2.</span>
              We'll start crafting your unique 3D printed items
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">3.</span>
              You'll receive a shipping notification with tracking
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">4.</span>
              Your order will arrive within the estimated timeframe
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/products"
            className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Continue Shopping
          </Link>
          <div>
            <Link
              href="/"
              className="text-primary-600 hover:underline"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
