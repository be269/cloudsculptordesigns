"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  image: string;
  slug: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in">
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-4">
          <div className="text-sm text-primary-600 dark:text-primary-400 font-semibold mb-1">
            {product.category}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              ${product.price.toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition-colors duration-200"
              title="Add to cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>

          {product.stock < 100 && (
            <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
              Only {product.stock} left in stock!
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
