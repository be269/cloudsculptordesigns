"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ShoppingCart, ArrowLeft, Check, Palette, Box } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

// Import color constants from STLViewerInteractive
import {
  FILAMENT_COLORS,
  MATTE_COLORS,
  METALLIC_COLORS,
  DUAL_COLORS,
  SIZE_OPTIONS as VIEWER_SIZE_OPTIONS
} from "@/components/STLViewerInteractive";

// Dynamically import STLViewerInteractive to avoid SSR issues with Three.js
const STLViewerInteractive = dynamic(
  () => import("@/components/STLViewerInteractive"),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#161c29' }}><span className="text-[#9BA8BE]">Loading 3D Viewer...</span></div> }
);

// Dynamically import composite rocket viewer for rocket with plume
const STLViewerCompositeRocket = dynamic(
  () => import("@/components/STLViewerCompositeRocket"),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#161c29' }}><span className="text-[#9BA8BE]">Loading 3D Viewer...</span></div> }
);

// Dynamically import composite lamp viewer for magic lamp with base
const STLViewerCompositeLamp = dynamic(
  () => import("@/components/STLViewerCompositeLamp"),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#161c29' }}><span className="text-[#9BA8BE]">Loading 3D Viewer...</span></div> }
);

// Dynamically import composite goddess viewer for forest goddess planter with base
const STLViewerCompositeGoddess = dynamic(
  () => import("@/components/STLViewerCompositeGoddess"),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#161c29' }}><span className="text-[#9BA8BE]">Loading 3D Viewer...</span></div> }
);

// Dynamically import composite alien2 viewer for 4-piece alien
const STLViewerCompositeAlien2 = dynamic(
  () => import("@/components/STLViewerCompositeAlien2"),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#161c29' }}><span className="text-[#9BA8BE]">Loading 3D Viewer...</span></div> }
);

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
  colorPreviewVideo?: string;
  modelUrl?: string;
  defaultColorIndex?: number;
  useCompositeRocketViewer?: boolean;
  useCompositeLampViewer?: boolean;
  useCompositeGoddessViewer?: boolean;
  useCompositeAlien2Viewer?: boolean;
  modelRotationX?: number;
  modelRotationY?: number;
  hideColorOptions?: boolean;
}

// Size options with pricing multipliers
const SIZE_OPTIONS = [
  { name: "Small", multiplier: 1, label: "Small (Standard)" },
  { name: "Medium", multiplier: 2, label: "Medium (1.5× size)" },
  { name: "Large", multiplier: 4, label: "Large (2× size)" },
];

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(product.defaultColorIndex ?? 0);
  const hasColorPreview = product.colorPreviewVideo || product.colorPreviewGif;
  const has3DViewer = !!product.modelUrl;
  const [viewMode, setViewMode] = useState<'3d' | 'colorPreview' | 'photos'>(
    has3DViewer ? '3d' : hasColorPreview ? 'colorPreview' : 'photos'
  );

  const selectedSize = SIZE_OPTIONS[selectedSizeIndex];
  const selectedColor = FILAMENT_COLORS[selectedColorIndex];
  const currentPrice = product.price * selectedSize.multiplier;

  const allImages = [product.image, ...(product.additionalImages || [])];
  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = () => {
    const variantId = product.hideColorOptions
      ? `${product.id}-${selectedSize.name.toLowerCase()}`
      : `${product.id}-${selectedSize.name.toLowerCase()}-${selectedColor.name.toLowerCase().replace(/[\/\s]/g, '-')}`;
    const variantTitle = product.hideColorOptions
      ? `${product.title} (${selectedSize.name})`
      : `${product.title} (${selectedSize.name}, ${selectedColor.name})`;

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

  // Color picker component for 3D viewer mode
  const ColorPicker = () => (
    <div className="space-y-3">
      {/* Current color header */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg"
          style={{
            background: selectedColor.hex3
              ? `linear-gradient(135deg, ${selectedColor.hex} 0%, ${selectedColor.hex2} 50%, ${selectedColor.hex3} 100%)`
              : selectedColor.hex2
                ? `linear-gradient(135deg, ${selectedColor.hex} 0%, ${selectedColor.hex2} 100%)`
                : selectedColor.hex
          }}
        />
        <span className="font-semibold" style={{ color: '#E8EDF5' }}>
          {selectedColor.name}
        </span>
      </div>

      {/* Color rows with labels */}
      <div className="space-y-3">
        {/* Basic colors */}
        <div>
          <div className="text-xs font-medium mb-1.5" style={{ color: '#9BA8BE' }}>Basic</div>
          <div className="flex flex-wrap gap-1.5 sm:gap-1.5">
            {FILAMENT_COLORS.slice(0, MATTE_COLORS.length).map((color, idx) => (
              <button
                key={color.name}
                onClick={() => setSelectedColorIndex(idx)}
                className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 transition-all hover:scale-110 ${
                  selectedColorIndex === idx
                    ? "border-white shadow-lg scale-110"
                    : "border-transparent hover:border-white/50"
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg, #4A9FD4 0%, #2a3649 50%, transparent 100%)', opacity: 0.4 }} />

        {/* Silk colors */}
        <div>
          <div className="text-xs font-medium mb-1.5" style={{ color: '#9BA8BE' }}>Silk</div>
          <div className="flex flex-wrap gap-1.5 sm:gap-1.5">
            {FILAMENT_COLORS.slice(MATTE_COLORS.length, MATTE_COLORS.length + METALLIC_COLORS.length).map((color, idx) => {
              const actualIdx = idx + MATTE_COLORS.length;
              return (
                <button
                  key={color.name}
                  onClick={() => setSelectedColorIndex(actualIdx)}
                  className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 transition-all hover:scale-110 ${
                    selectedColorIndex === actualIdx
                      ? "border-white shadow-lg scale-110"
                      : "border-transparent hover:border-white/50"
                  }`}
                  style={{
                    backgroundColor: color.hex,
                    background: `linear-gradient(135deg, ${color.hex} 0%, ${color.hex}dd 50%, ${color.hex} 100%)`,
                    boxShadow: "inset 0 0 3px rgba(255,255,255,0.5)"
                  }}
                  title={color.name}
                />
              );
            })}
          </div>
        </div>

        {/* Separator */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg, #4A9FD4 0%, #2a3649 50%, transparent 100%)', opacity: 0.4 }} />

        {/* Dual-color */}
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: '#9BA8BE' }}>Dual-Color</div>
          <div className="flex flex-wrap gap-1.5 sm:gap-1.5">
            {FILAMENT_COLORS.slice(MATTE_COLORS.length + METALLIC_COLORS.length, MATTE_COLORS.length + METALLIC_COLORS.length + DUAL_COLORS.length).map((color, idx) => {
              const actualIdx = idx + MATTE_COLORS.length + METALLIC_COLORS.length;
              return (
                <button
                  key={color.name}
                  onClick={() => setSelectedColorIndex(actualIdx)}
                  className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 transition-all hover:scale-110 ${
                    selectedColorIndex === actualIdx
                      ? "border-white shadow-lg scale-110"
                      : "border-transparent hover:border-white/50"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${color.hex} 0%, ${color.hex2} 100%)`,
                    boxShadow: "inset 0 0 3px rgba(255,255,255,0.5)"
                  }}
                  title={color.name}
                />
              );
            })}
          </div>
        </div>

        {/* Separator */}
        <div className="h-px" style={{ background: 'linear-gradient(90deg, #4A9FD4 0%, #2a3649 50%, transparent 100%)', opacity: 0.4 }} />

        {/* Tri-color */}
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: '#9BA8BE' }}>Tri-Color</div>
          <div className="flex flex-wrap gap-1.5 sm:gap-1.5">
            {FILAMENT_COLORS.slice(MATTE_COLORS.length + METALLIC_COLORS.length + DUAL_COLORS.length).map((color, idx) => {
              const actualIdx = idx + MATTE_COLORS.length + METALLIC_COLORS.length + DUAL_COLORS.length;
              return (
                <button
                  key={color.name}
                  onClick={() => setSelectedColorIndex(actualIdx)}
                  className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 transition-all hover:scale-110 ${
                    selectedColorIndex === actualIdx
                      ? "border-white shadow-lg scale-110"
                      : "border-transparent hover:border-white/50"
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${color.hex} 0%, ${color.hex2} 50%, ${color.hex3} 100%)`,
                    boxShadow: "inset 0 0 3px rgba(255,255,255,0.5)"
                  }}
                  title={color.name}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-6 sm:py-12 px-3 sm:px-4 md:px-8" style={{ backgroundColor: '#161c29' }}>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center mb-4 sm:mb-8 transition-colors hover:text-[#4A9FD4]"
          style={{ color: '#4A9FD4' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Images / 3D Viewer */}
          <div className="rounded-lg shadow-lg p-3 sm:p-4" style={{ backgroundColor: '#1e2739', border: '1px solid #2a3649' }}>
            {/* View Toggle (if 3D viewer or color preview available) */}
            {(has3DViewer || hasColorPreview) && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {has3DViewer && (
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${
                      viewMode === '3d' ? 'ring-2 ring-[#4A9FD4]' : 'hover:bg-[#2a3649]'
                    }`}
                    style={{
                      backgroundColor: viewMode === '3d' ? 'rgba(74, 159, 212, 0.2)' : 'transparent',
                      border: '1px solid #2a3649',
                      color: viewMode === '3d' ? '#4A9FD4' : '#9BA8BE',
                    }}
                  >
                    <Box className="w-4 h-4" />
                    3D Viewer
                  </button>
                )}
                {hasColorPreview && (
                  <button
                    onClick={() => setViewMode('colorPreview')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${
                      viewMode === 'colorPreview' ? 'ring-2 ring-[#4A9FD4]' : 'hover:bg-[#2a3649]'
                    }`}
                    style={{
                      backgroundColor: viewMode === 'colorPreview' ? 'rgba(74, 159, 212, 0.2)' : 'transparent',
                      border: '1px solid #2a3649',
                      color: viewMode === 'colorPreview' ? '#4A9FD4' : '#9BA8BE',
                    }}
                  >
                    <Palette className="w-4 h-4" />
                    Color Preview
                  </button>
                )}
                <button
                  onClick={() => setViewMode('photos')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm ${
                    viewMode === 'photos' ? 'ring-2 ring-[#4A9FD4]' : 'hover:bg-[#2a3649]'
                  }`}
                  style={{
                    backgroundColor: viewMode === 'photos' ? 'rgba(74, 159, 212, 0.2)' : 'transparent',
                    border: '1px solid #2a3649',
                    color: viewMode === 'photos' ? '#4A9FD4' : '#9BA8BE',
                  }}
                >
                  Photos
                </button>
              </div>
            )}

            {/* 3D Interactive Viewer - maximized */}
            {viewMode === '3d' && has3DViewer ? (
              <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#161c29', height: 'calc(100% - 48px)', minHeight: '300px' }}>
                {product.useCompositeRocketViewer ? (
                  <STLViewerCompositeRocket
                    className="w-full h-full"
                    colorIndex={selectedColorIndex}
                    sizeIndex={selectedSizeIndex}
                    onColorChange={setSelectedColorIndex}
                  />
                ) : product.useCompositeLampViewer ? (
                  <STLViewerCompositeLamp
                    className="w-full h-full"
                    colorIndex={selectedColorIndex}
                    sizeIndex={selectedSizeIndex}
                    onColorChange={setSelectedColorIndex}
                  />
                ) : product.useCompositeGoddessViewer ? (
                  <STLViewerCompositeGoddess
                    className="w-full h-full"
                    colorIndex={selectedColorIndex}
                    sizeIndex={selectedSizeIndex}
                    onColorChange={setSelectedColorIndex}
                  />
                ) : product.useCompositeAlien2Viewer ? (
                  <STLViewerCompositeAlien2
                    className="w-full h-full"
                    colorIndex={selectedColorIndex}
                    sizeIndex={selectedSizeIndex}
                    onColorChange={setSelectedColorIndex}
                  />
                ) : (
                  <STLViewerInteractive
                    modelUrl={product.modelUrl!}
                    className="w-full h-full"
                    colorIndex={selectedColorIndex}
                    sizeIndex={selectedSizeIndex}
                    onColorChange={setSelectedColorIndex}
                    modelRotationX={product.modelRotationX}
                    modelRotationY={product.modelRotationY}
                  />
                )}
              </div>
            ) : viewMode === 'colorPreview' && hasColorPreview ? (
              <div className="aspect-square rounded-lg overflow-hidden relative" style={{ backgroundColor: '#161c29' }}>
                {product.colorPreviewVideo ? (
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
            <div className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#4A9FD4' }}>
              {product.category}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3" style={{ color: '#E8EDF5' }}>
              {product.title}
            </h1>
            <div className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#E8EDF5' }}>
              ${currentPrice.toFixed(2)}
            </div>
            {selectedSize.multiplier > 1 && (
              <div className="text-sm mb-4" style={{ color: '#9BA8BE' }}>
                Base price: ${product.price.toFixed(2)} × {selectedSize.multiplier} ({selectedSize.name})
              </div>
            )}

            <p className="mb-5 text-base" style={{ color: '#9BA8BE' }}>
              {product.description}
            </p>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-5">
                <h3 className="font-semibold mb-2" style={{ color: '#E8EDF5' }}>Features:</h3>
                <ul className="space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-sm">
                      <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#4A9FD4' }} />
                      <span style={{ color: '#9BA8BE' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            <div className="pt-4 mb-5 space-y-2 text-sm" style={{ borderTop: '1px solid #2a3649' }}>
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
                  {currentPrice >= 35 ? 'FREE' : '$9.99'} - {product.shippingTime}
                </span>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-5">
              <label className="block font-semibold mb-2" style={{ color: '#E8EDF5' }}>
                Size:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SIZE_OPTIONS.map((size, idx) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSizeIndex(idx)}
                    className={`py-2 px-3 rounded-lg text-center transition-all ${
                      selectedSizeIndex === idx
                        ? 'ring-2 ring-[#4A9FD4]'
                        : 'hover:bg-[#2a3649]'
                    }`}
                    style={{
                      backgroundColor: selectedSizeIndex === idx ? 'rgba(74, 159, 212, 0.2)' : '#1e2739',
                      border: '1px solid #2a3649',
                    }}
                  >
                    <div className="font-semibold text-sm" style={{ color: '#E8EDF5' }}>{size.name}</div>
                    <div className="text-xs" style={{ color: '#9BA8BE' }}>
                      ${(product.price * size.multiplier).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selector - hide if product has hideColorOptions */}
            {!product.hideColorOptions && (
              <div className="mb-5">
                <label className="block font-semibold mb-2" style={{ color: '#E8EDF5' }}>
                  Color: <span className="font-normal" style={{ color: '#9BA8BE' }}>(54 options)</span>
                </label>
                <ColorPicker />
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-5">
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
                className="mt-5 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(74, 159, 212, 0.1)', border: '1px solid rgba(74, 159, 212, 0.3)' }}
              >
                <p className="text-sm" style={{ color: '#6BB5E0' }}>
                  <strong>Note:</strong> {product.notes}
                </p>
              </div>
            )}

            {/* Color & Print Disclaimer */}
            <div
              className="mt-4 p-3 rounded-lg"
              style={{ backgroundColor: 'rgba(155, 168, 190, 0.1)', border: '1px solid rgba(155, 168, 190, 0.2)' }}
            >
              <p className="text-xs" style={{ color: '#9BA8BE' }}>
                Colors shown may vary from actual product. Dual/tri-color prints have unique, random gradient patterns based on filament transition points. Each print is one-of-a-kind.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
