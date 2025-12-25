"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import * as THREE from "three";

// 24 filament colors matching Blender animation
const FILAMENT_COLORS = [
  { name: "Red", hex: "#ff0000" },
  { name: "Orange", hex: "#ff8000" },
  { name: "Yellow", hex: "#ffff00" },
  { name: "Lime", hex: "#80ff00" },
  { name: "Green", hex: "#00ff00" },
  { name: "Spring Green", hex: "#00ff80" },
  { name: "Cyan", hex: "#00ffff" },
  { name: "Sky Blue", hex: "#0080ff" },
  { name: "Blue", hex: "#0000ff" },
  { name: "Purple", hex: "#8000ff" },
  { name: "Magenta", hex: "#ff00ff" },
  { name: "Hot Pink", hex: "#ff0080" },
  { name: "Light Gray", hex: "#cccccc" },
  { name: "Gray", hex: "#808080" },
  { name: "Dark Gray", hex: "#333333" },
  { name: "White", hex: "#ffffff" },
  { name: "Brown", hex: "#996633" },
  { name: "Beige", hex: "#ffcc99" },
  { name: "Pink", hex: "#ffbfcc" },
  { name: "Maroon", hex: "#800000" },
  { name: "Teal", hex: "#008080" },
  { name: "Indigo", hex: "#800080" },
  { name: "Gold", hex: "#ffd700" },
  { name: "Silver", hex: "#c0c0c0" },
];

// Size options for ordering (scale is for visual preview only)
const SIZE_OPTIONS = [
  { name: "Small", height: 4, scale: 0.8 },
  { name: "Medium", height: 8, scale: 1.0 },
  { name: "Large", height: 12, scale: 1.2 },
];

interface ModelProps {
  url: string;
  color: string;
  isRotating: boolean;
  scale: number;
  onLoaded?: () => void;
}

function Model({ url, color, isRotating, scale, onLoaded }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [baseScale, setBaseScale] = useState(1);
  const { scene } = useThree();

  // Load 3MF model
  useEffect(() => {
    const loader = new ThreeMFLoader();
    loader.load(
      url,
      (loadedGroup) => {
        // Rotate so model sits upright (Z-up to Y-up)
        loadedGroup.rotation.x = -Math.PI / 2;

        // Compute bounding box
        const box = new THREE.Box3().setFromObject(loadedGroup);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        // Center the model
        loadedGroup.position.sub(center);

        // Calculate scale to fit in view
        const maxDim = Math.max(size.x, size.y, size.z);
        setBaseScale(2.0 / maxDim);

        setModel(loadedGroup);
        onLoaded?.();
      },
      undefined,
      (error) => {
        console.error("Error loading 3MF:", error);
      }
    );
  }, [url, onLoaded]);

  // Update colors on all meshes when color changes
  useEffect(() => {
    if (!model) return;

    const newColor = new THREE.Color(color);

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Check if this mesh has vertex colors (painted regions like eyes)
        const hasVertexColors = child.geometry.attributes.color !== undefined;

        if (hasVertexColors) {
          // Keep vertex colors for painted areas
          if (child.material instanceof THREE.MeshPhongMaterial ||
              child.material instanceof THREE.MeshStandardMaterial) {
            child.material.vertexColors = true;
          }
        } else {
          // Apply the selected color to non-painted meshes
          if (child.material instanceof THREE.MeshPhongMaterial) {
            child.material.color = newColor;
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.color = newColor;
          } else {
            // Replace with standard material
            child.material = new THREE.MeshStandardMaterial({
              color: newColor,
              roughness: 0.3,
              metalness: 0.1,
            });
          }
        }
      }
    });
  }, [model, color]);

  // Rotate the group for smooth centered rotation
  useFrame((state, delta) => {
    if (groupRef.current && isRotating) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  const finalScale = baseScale * scale;

  if (!model) return null;

  return (
    <group ref={groupRef} scale={[finalScale, finalScale, finalScale]}>
      <primitive object={model} />
    </group>
  );
}

interface ThreeMFViewerInteractiveProps {
  modelUrl: string;
  className?: string;
}

export default function ThreeMFViewerInteractive({ modelUrl, className = "" }: ThreeMFViewerInteractiveProps) {
  const [colorIndex, setColorIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState<number | null>(null);
  const [sizeIndex, setSizeIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [isColorCycling, setIsColorCycling] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Color cycling effect
  useEffect(() => {
    if (!isColorCycling || selectedColorIndex !== null) return;

    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % FILAMENT_COLORS.length);
    }, 2000); // 2 seconds per color

    return () => clearInterval(interval);
  }, [isColorCycling, selectedColorIndex]);

  // Handle color selection
  const handleColorClick = useCallback((index: number) => {
    setSelectedColorIndex(index);
    setColorIndex(index);
    setIsColorCycling(false);
  }, []);

  // Resume color cycling
  const handleAllColors = useCallback(() => {
    setSelectedColorIndex(null);
    setIsColorCycling(true);
  }, []);

  // Toggle rotation
  const toggleRotation = useCallback(() => {
    setIsRotating((prev) => !prev);
  }, []);

  // Toggle color cycling
  const toggleColorCycling = useCallback(() => {
    if (selectedColorIndex !== null) {
      setSelectedColorIndex(null);
      setIsColorCycling(true);
    } else {
      setIsColorCycling((prev) => !prev);
    }
  }, [selectedColorIndex]);

  const currentColor = FILAMENT_COLORS[colorIndex];
  const currentSize = SIZE_OPTIONS[sizeIndex];

  return (
    <div className={`relative ${className}`} style={{ minHeight: "500px" }}>
      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ backgroundColor: "#1e2739" }}
        >
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#4A9FD4] border-t-transparent rounded-full mx-auto mb-2" />
            <span style={{ color: "#9BA8BE" }}>Loading 3D Model...</span>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "#161c29", borderRadius: "8px" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <directionalLight position={[0, -5, 5]} intensity={0.5} />

        <Model
          url={modelUrl}
          color={currentColor.hex}
          isRotating={isRotating}
          scale={currentSize.scale}
          onLoaded={() => setIsLoading(false)}
        />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>

      {/* Controls overlay */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 justify-between items-start">
        {/* Size selector */}
        <div
          className="flex gap-1 p-1 rounded-lg"
          style={{ backgroundColor: "rgba(22, 28, 41, 0.95)", border: "1px solid #2a3649" }}
        >
          {SIZE_OPTIONS.map((size, idx) => (
            <button
              key={size.name}
              onClick={() => setSizeIndex(idx)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                sizeIndex === idx
                  ? "bg-[#4A9FD4] text-white"
                  : "text-[#9BA8BE] hover:bg-[#2a3649]"
              }`}
            >
              {size.name} ({size.height}")
            </button>
          ))}
        </div>

        {/* Play/Pause controls */}
        <div
          className="flex gap-1 p-1 rounded-lg"
          style={{ backgroundColor: "rgba(22, 28, 41, 0.98)", border: "1px solid #4A9FD4" }}
        >
          <button
            onClick={toggleRotation}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              isRotating
                ? "bg-[#4A9FD4] text-white"
                : "text-[#E8EDF5] hover:bg-[#2a3649]"
            }`}
            title={isRotating ? "Pause rotation" : "Resume rotation"}
          >
            {isRotating ? "⏸ Spin" : "▶ Spin"}
          </button>
          <button
            onClick={toggleColorCycling}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
              isColorCycling && selectedColorIndex === null
                ? "bg-[#4A9FD4] text-white"
                : "text-[#E8EDF5] hover:bg-[#2a3649]"
            }`}
            title={isColorCycling ? "Pause color cycling" : "Resume color cycling"}
          >
            {isColorCycling && selectedColorIndex === null ? "⏸ Colors" : "▶ Colors"}
          </button>
        </div>
      </div>

      {/* Current color display */}
      <div
        className="absolute bottom-20 left-4 flex items-center gap-3 px-4 py-3 rounded-lg"
        style={{ backgroundColor: "rgba(22, 28, 41, 0.95)", border: "1px solid #2a3649" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-white/30 shadow-lg"
          style={{ backgroundColor: currentColor.hex }}
        />
        <div>
          <div className="text-lg font-semibold" style={{ color: "#E8EDF5" }}>
            {currentColor.name}
          </div>
          <div className="text-xs" style={{ color: "#9BA8BE" }}>
            {currentSize.height}" tall
          </div>
        </div>
      </div>

      {/* Color palette */}
      <div
        className="absolute bottom-4 left-4 right-4 p-3 rounded-lg"
        style={{ backgroundColor: "rgba(22, 28, 41, 0.95)", border: "1px solid #2a3649" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium" style={{ color: "#9BA8BE" }}>
            Click a color or
          </span>
          <button
            onClick={handleAllColors}
            className={`px-2 py-1 rounded text-xs font-medium transition-all ${
              selectedColorIndex === null && isColorCycling
                ? "bg-[#4A9FD4] text-white"
                : "bg-[#2a3649] text-[#9BA8BE] hover:bg-[#3a4659]"
            }`}
          >
            All Colors
          </button>
          <span className="text-xs ml-auto hidden sm:block" style={{ color: "#6B7280" }}>
            Drag to rotate • Scroll to zoom
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILAMENT_COLORS.map((color, idx) => (
            <button
              key={color.name}
              onClick={() => handleColorClick(idx)}
              className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                colorIndex === idx
                  ? "border-white shadow-lg scale-110"
                  : "border-transparent hover:border-white/50"
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
