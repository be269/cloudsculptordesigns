"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { items } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(22, 28, 41, 0.95)', borderBottom: '1px solid #2a3649' }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/images/logo.png"
              alt="Cloud Sculptor Designs"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="text-xl font-bold bg-gradient-to-r from-[#6BB5E0] via-[#4A9FD4] to-[#2E7AB3] bg-clip-text text-transparent">
              Cloud Sculptor Designs
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-300 hover:text-[#4A9FD4] transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-gray-300 hover:text-[#4A9FD4] transition-colors font-medium"
            >
              Products
            </Link>
            <Link
              href="/about"
              className="text-gray-300 hover:text-[#4A9FD4] transition-colors font-medium"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-300 hover:text-[#4A9FD4] transition-colors font-medium"
            >
              Contact
            </Link>
            <Link
              href="/cart"
              className="relative p-2 text-gray-300 hover:text-[#4A9FD4] transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: '#4A9FD4' }}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link href="/cart" className="relative p-2 text-gray-300">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: '#4A9FD4' }}
                >
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4" style={{ borderTop: '1px solid #2a3649' }}>
            <Link
              href="/"
              className="block text-gray-300 hover:text-[#4A9FD4] font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="block text-gray-300 hover:text-[#4A9FD4] font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/about"
              className="block text-gray-300 hover:text-[#4A9FD4] font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block text-gray-300 hover:text-[#4A9FD4] font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
