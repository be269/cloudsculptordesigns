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
    <div
      className="group rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in"
      style={{
        backgroundColor: '#1e2739',
        border: '1px solid #2a3649',
      }}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden" style={{ backgroundColor: '#2a3649' }}>
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="p-4">
          <div className="text-sm font-semibold mb-1" style={{ color: '#4A9FD4' }}>
            {product.category}
          </div>
          <h3
            className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-[#4A9FD4] transition-colors"
            style={{ color: '#E8EDF5' }}
          >
            {product.title}
          </h3>
          <p className="text-sm mb-3 line-clamp-2" style={{ color: '#9BA8BE' }}>
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold" style={{ color: '#E8EDF5' }}>
              ${product.price.toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              className="text-white p-2 rounded-lg transition-colors duration-200 hover:opacity-90"
              style={{ backgroundColor: '#4A9FD4' }}
              title="Add to cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>

        </div>
      </Link>
    </div>
  );
}
