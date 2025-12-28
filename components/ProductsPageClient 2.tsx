"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import products from "@/data/products.json";

export default function ProductsPageClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-dark-700 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            3D Printed Dragons, Rockets & Custom Creations
          </h1>
          <p className="text-lg text-gray-400">
            Shop our collection or request custom orders! Fast turnaround on bulk & large orders. All 3D printed with precision.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search dragons, rockets, fidgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-96 px-4 py-2 bg-dark-600 border border-dark-500 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
                    : "bg-dark-600 text-gray-300 border border-dark-500 hover:border-primary-600/50 hover:text-primary-400"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Count */}
        <div className="mb-4 text-gray-400">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
