"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, ArrowLeft, Check, Palette, Play } from "lucide-react";
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
  additionalImages?: string[];
  weight?: number;
  colors?: string[];
  hasColorOptions?: boolean;
  colorPreviewGif?: string;
  colorPreviewVideo?: string;  // WebM/MP4 video path (without extension)
}

// Size options with pricing multipliers
const SIZE_OPTIONS = [
  { name: "Small", multiplier: 1, label: "Small (Standard)" },
  { name: "Medium", multiplier: 2, label: "Medium (1.5× size)" },
  { name: "Large", multiplier: 4, label: "Large (2× size)" },
];

// Available filament colors
const FILAMENT_COLORS = [
  { name: "white", label: "White", hex: "#f5f5f5" },
  { name: "black", label: "Black", hex: "#1e1e1e" },
  { name: "gray", label: "Gray", hex: "#808080" },
  { name: "silver", label: "Silver", hex: "#c0c0c8" },
  { name: "red", label: "Red", hex: "#dc2828" },
  { name: "dark-red", label: "Dark Red", hex: "#8b0000" },
  { name: "orange", label: "Orange", hex: "#ff8c00" },
  { name: "yellow", label: "Yellow", hex: "#ffdc00" },
  { name: "lime-green", label: "Lime Green", hex: "#32cd32" },
  { name: "forest-green", label: "Forest Green", hex: "#228b22" },
  { name: "teal", label: "Teal", hex: "#008080" },
  { name: "light-blue", label: "Light Blue", hex: "#87ceeb" },
  { name: "blue", label: "Blue", hex: "#1e5ac8" },
  { name: "navy", label: "Navy", hex: "#000080" },
  { name: "purple", label: "Purple", hex: "#800080" },
  { name: "pink", label: "Pink", hex: "#ff69b4" },
  { name: "magenta", label: "Magenta", hex: "#ff0090" },
  { name: "gold", label: "Gold", hex: "#ffd700" },
  { name: "bronze", label: "Bronze", hex: "#cd7f32" },
  { name: "copper", label: "Copper", hex: "#b87333" },
  { name: "brown", label: "Brown", hex: "#8b5a2b" },
  { name: "beige", label: "Beige", hex: "#f5deb3" },
  { name: "glow-green", label: "Glow Green", hex: "#39ff14" },
  { name: "olive", label: "Olive", hex: "#556b2f" },
];

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[0]);
  const [selectedColor, setSelectedColor] = useState(FILAMENT_COLORS[0]);
  const hasColorPreview = product.colorPreviewVideo || product.colorPreviewGif;
  const [showColorPreview, setShowColorPreview] = useState(hasColorPreview ? true : false);
  const [colorManuallySelected, setColorManuallySelected] = useState(false);

  // Calculate price based on selected size
  const currentPrice = product.price * selectedSize.multiplier;

  // Combine main image with additional images
  const allImages = [product.image, ...(product.additionalImages || [])];
  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = () => {
    // Create variant ID if size/color selected
    const variantId = `${product.id}-${selectedSize.name.toLowerCase()}-${selectedColor.name}`;
    const variantTitle = `${product.title} (${selectedSize.name}, ${selectedColor.label})`;

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: variantId,
        title: variantTitle,
        price: currentPrice,
        image: product.image,
        quantity: 1,
        weight: product.weight ? product.weight * selectedSize.multiplier : undefined,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-8" style={{ backgroundColor: '#161c29' }}>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center mb-8 transition-colors hover:text-[#4A9FD4]"
          style={{ color: '#4A9FD4' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images / 3D Viewer */}
          <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: '#1e2739', border: '1px solid #2a3649' }}>
            {/* View Toggle (if color preview available) */}
            {hasColorPreview && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowColorPreview(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    showColorPreview ? 'ring-2 ring-[#4A9FD4]' : 'hover:bg-[#2a3649]'
                  }`}
                  style={{
                    backgroundColor: showColorPreview ? 'rgba(74, 159, 212, 0.2)' : 'transparent',
                    border: '1px solid #2a3649',
                    color: showColorPreview ? '#4A9FD4' : '#9BA8BE',
                  }}
                >
                  <Palette className="w-4 h-4" />
                  Color Preview
                </button>
                <button
                  onClick={() => setShowColorPreview(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    !showColorPreview ? 'ring-2 ring-[#4A9FD4]' : 'hover:bg-[#2a3649]'
                  }`}
                  style={{
                    backgroundColor: !showColorPreview ? 'rgba(74, 159, 212, 0.2)' : 'transparent',
                    border: '1px solid #2a3649',
                    color: !showColorPreview ? '#4A9FD4' : '#9BA8BE',
                  }}
                >
                  Photos
                </button>
              </div>
            )}

            {/* Color Preview Video/GIF or Static Image */}
            {showColorPreview && hasColorPreview ? (
              <div className="aspect-square rounded-lg overflow-hidden relative" style={{ backgroundColor: '#161c29' }}>
                {colorManuallySelected ? (
                  <>
                    {/* Show static product image when color is manually selected */}
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-contain"
                    />
                    {/* Color overlay indicator */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white"
                          style={{ backgroundColor: selectedColor.hex }}
                        />
                        <span className="text-white text-sm font-medium">
                          {selectedColor.label} selected
                        </span>
                      </div>
                      <button
                        onClick={() => setColorManuallySelected(false)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg transition-all hover:bg-opacity-90"
                        style={{ backgroundColor: '#4A9FD4' }}
                      >
                        <Play className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium">View All Colors</span>
                      </button>
                    </div>
                  </>
                ) : product.colorPreviewVideo ? (
                  // Video player (WebM with MP4 fallback)
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain"
                  >
                    <source src={`${product.colorPreviewVideo}.webm`} type="video/webm" />
                    <source src={`${product.colorPreviewVideo}.mp4`} type="video/mp4" />
                  </video>
                ) : (
                  // Legacy GIF support
                  <Image
                    src={product.colorPreviewGif!}
                    alt={`${product.title} - Color Options`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                )}
              </div>
            ) : (
              <>
                {/* Main Image */}
                <div className="aspect-square rounded-lg overflow-hidden relative mb-4" style={{ backgroundColor: '#2a3649' }}>
                  {(() => {
                    const currentImg = allImages[selectedImage];
                    const isBadge = currentImg.includes('authorized') || currentImg.includes('badge') || currentImg.includes('seller');
                    return (
                      <Image
                        src={currentImg}
                        alt={product.title}
                        fill
                        className={isBadge ? "object-contain p-8" : "object-cover"}
                      />
                    );
                  })()}
                </div>

                {/* Thumbnail Gallery */}
                {allImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {allImages.map((img, index) => {
                      const isBadge = img.includes('authorized') || img.includes('badge') || img.includes('seller');
                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden relative transition-all ${
                            selectedImage === index ? 'ring-2 ring-[#4A9FD4]' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: '#2a3649' }}
                        >
                          <Image
                            src={img}
                            alt={`${product.title} - Image ${index + 1}`}
                            fill
                            className={isBadge ? "object-contain p-1" : "object-cover"}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="text-sm font-semibold mb-2" style={{ color: '#4A9FD4' }}>
              {product.category}
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#E8EDF5' }}>
              {product.title}
            </h1>
            <div className="text-3xl font-bold mb-2" style={{ color: '#E8EDF5' }}>
              ${currentPrice.toFixed(2)}
            </div>
            {selectedSize.multiplier > 1 && (
              <div className="text-sm mb-4" style={{ color: '#9BA8BE' }}>
                Base price: ${product.price.toFixed(2)} × {selectedSize.multiplier} ({selectedSize.name})
              </div>
            )}

            <p className="mb-6 text-lg" style={{ color: '#9BA8BE' }}>
              {product.description}
            </p>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3" style={{ color: '#E8EDF5' }}>Features:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#4A9FD4' }} />
                      <span style={{ color: '#9BA8BE' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            <div className="pt-6 mb-6 space-y-3" style={{ borderTop: '1px solid #2a3649' }}>
              <div>
                <span className="font-semibold" style={{ color: '#E8EDF5' }}>Materials: </span>
                <span style={{ color: '#9BA8BE' }}>{product.materials}</span>
              </div>
              <div>
                <span className="font-semibold" style={{ color: '#E8EDF5' }}>Dimensions: </span>
                <span style={{ color: '#9BA8BE' }}>{product.dimensions}</span>
              </div>
              <div>
                <span className="font-semibold" style={{ color: '#E8EDF5' }}>Shipping: </span>
                <span style={{ color: '#9BA8BE' }}>
                  {product.shippingCost} - {product.shippingTime}
                </span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <label className="block font-semibold mb-3" style={{ color: '#E8EDF5' }}>
                Size:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 px-4 rounded-lg text-center transition-all ${
                      selectedSize.name === size.name
                        ? 'ring-2 ring-[#4A9FD4]'
                        : 'hover:bg-[#2a3649]'
                    }`}
                    style={{
                      backgroundColor: selectedSize.name === size.name ? 'rgba(74, 159, 212, 0.2)' : '#1e2739',
                      border: '1px solid #2a3649',
                    }}
                  >
                    <div className="font-semibold" style={{ color: '#E8EDF5' }}>{size.name}</div>
                    <div className="text-sm" style={{ color: '#9BA8BE' }}>
                      ${(product.price * size.multiplier).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector */}
            <div className="mb-6">
              <label className="block font-semibold mb-3" style={{ color: '#E8EDF5' }}>
                Color: <span style={{ color: '#9BA8BE' }}>{selectedColor.label}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {FILAMENT_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => {
                      setSelectedColor(color);
                      if (hasColorPreview) {
                        setColorManuallySelected(true);
                      }
                    }}
                    className={`w-8 h-8 rounded-full transition-all ${
                      selectedColor.name === color.name
                        ? 'ring-2 ring-offset-2 ring-[#4A9FD4] ring-offset-[#161c29]'
                        : 'hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: color.hex,
                      border: color.name === 'white' || color.name === 'beige' ? '1px solid #2a3649' : 'none',
                    }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block font-semibold mb-2" style={{ color: '#E8EDF5' }}>
                Quantity:
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-[#2a3649]"
                  style={{ border: '1px solid #2a3649', color: '#9BA8BE' }}
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold text-lg" style={{ color: '#E8EDF5' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-[#2a3649]"
                  style={{ border: '1px solid #2a3649', color: '#9BA8BE' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center shadow-lg text-white ${
                added ? "bg-green-600 hover:bg-green-700" : "hover:opacity-90"
              }`}
              style={added ? {} : { backgroundColor: '#4A9FD4' }}
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
              <div
                className="mt-6 p-4 rounded-lg"
                style={{ backgroundColor: 'rgba(74, 159, 212, 0.1)', border: '1px solid rgba(74, 159, 212, 0.3)' }}
              >
                <p className="text-sm" style={{ color: '#6BB5E0' }}>
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
