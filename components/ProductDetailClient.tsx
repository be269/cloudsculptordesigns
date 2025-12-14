"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, ArrowLeft, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  materials: string;
  dimensions: string;
  features: string[];
  stock: number;
  shippingCost: string;
  shippingTime: string;
  notes: string;
  image: string;
}

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden relative">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="text-sm text-primary-600 dark:text-primary-400 font-semibold mb-2">
              {product.category}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {product.title}
            </h1>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              ${product.price.toFixed(2)}
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
              {product.description}
            </p>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Features:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6 space-y-3">
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Materials: </span>
                <span className="text-gray-700 dark:text-gray-300">{product.materials}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Dimensions: </span>
                <span className="text-gray-700 dark:text-gray-300">{product.dimensions}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Shipping: </span>
                <span className="text-gray-700 dark:text-gray-300">
                  {product.shippingCost} - {product.shippingTime}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-900 dark:text-white">Stock: </span>
                <span className={`${product.stock < 100 ? 'text-orange-600' : 'text-green-600'} font-medium`}>
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-900 dark:text-white mb-2">
                Quantity:
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center ${
                added
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-primary-600 hover:bg-primary-700"
              } text-white`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </>
              )}
            </button>

            {/* Additional Info */}
            {product.notes && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Note:</strong> {product.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
