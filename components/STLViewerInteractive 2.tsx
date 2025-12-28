"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
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

// Size options with heights
const SIZE_OPTIONS = [
  { name: "Small", height: 4, scale: 1.0 },
  { name: "Medium", height: 8, scale: 2.0 },
  { name: "Large", height: 12, scale: 3.0 },
];

// Height ruler component
function HeightRuler({ maxHeight, modelHeight }: { maxHeight: number; modelHeight: number }) {
  const ticks = [];
  for (let i = 0; i <= maxHeight; i += 2) {
    const y = (i / maxHeight) * 3 - 1.5; // Scale to scene units
    ticks.push(
      <group key={i} position={[-2.5, y, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 0.02, 0.02]} />
          <meshBasicMaterial color="#4A9FD4" opacity={0.6} transparent />
        </mesh>
        <Text
          position={[-0.35, 0, 0]}
          fontSize={0.15}
          color="#9BA8BE"
          anchorX="right"
        >
          {i}"
        </Text>
      </group>
    );
  }

  // Model height indicator
  const modelY = (modelHeight / maxHeight) * 3 - 1.5;

  return (
    <group>
      {/* Vertical ruler line */}
      <mesh position={[-2.5, 0, 0]}>
        <boxGeometry args={[0.02, 3.2, 0.02]} />
        <meshBasicMaterial color="#4A9FD4" opacity={0.4} transparent />
      </mesh>
      {ticks}
      {/* Current height marker */}
      <mesh position={[-2.3, modelY, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.1, 0.2, 3]} />
        <meshBasicMaterial color="#4A9FD4" />
      </mesh>
    </group>
  );
}

const EYE_COLOR = "#0a0a0a"; // Near black for eyes

interface ModelProps {
  url: string;
  color: string;
  isRotating: boolean;
  scale: number;
}

function Model({ url, color, isRotating, scale }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const rawGeometry = useLoader(STLLoader, url);

  // Clone and center the geometry once to avoid mutating cached geometry
  const { geometry, baseScale } = useMemo(() => {
    const cloned = rawGeometry.clone();
    cloned.computeBoundingBox();

    // Get the center of the bounding box
    const box = cloned.boundingBox!;
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Translate geometry so its center is at origin
    cloned.translate(-center.x, -center.y, -center.z);
    cloned.computeVertexNormals();

    // Calculate scale to fit in view
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    return {
      geometry: cloned,
      baseScale: 2.0 / maxDim
    };
  }, [rawGeometry]);

  // Create vertex colors to keep eyes black
  const vertexColors = useMemo(() => {
    const positionAttribute = geometry.getAttribute("position");
    const normalAttribute = geometry.getAttribute("normal");
    const count = positionAttribute.count;
    const colors = new Float32Array(count * 3);

    const skinRGB = new THREE.Color(color);
    const eyeRGB = new THREE.Color(EYE_COLOR);

    // Get bounding box to determine model bounds
    const positions = positionAttribute.array as Float32Array;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < count; i++) {
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    }

    const heightRange = maxY - minY;
    const depthRange = maxZ - minZ;

    for (let i = 0; i < count; i++) {
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      // Normalize position to 0-1 range
      const normalizedY = (y - minY) / heightRange;
      const normalizedZ = (z - minZ) / depthRange;

      // Check if vertex is likely an eye based on position and normal
      const nz = (normalAttribute?.array[i * 3 + 2] || 0) as number;

      // Eye detection: upper portion and recessed (negative Z normal)
      const isUpperArea = normalizedY > 0.55 && normalizedY < 0.85;
      const isRecessed = nz < -0.3; // Pointing inward
      const isEye = isUpperArea && isRecessed && normalizedZ > 0.6;

      const vertexColor = isEye ? eyeRGB : skinRGB;
      colors[i * 3] = vertexColor.r;
      colors[i * 3 + 1] = vertexColor.g;
      colors[i * 3 + 2] = vertexColor.b;
    }

    return colors;
  }, [geometry, color]);

  // Apply colors to geometry
  useEffect(() => {
    geometry.setAttribute("color", new THREE.BufferAttribute(vertexColors, 3));
  }, [geometry, vertexColors]);

  // Rotate the group (not the mesh) for smooth centered rotation
  useFrame((state, delta) => {
    if (groupRef.current && isRotating) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  const finalScale = baseScale * scale;

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} scale={[finalScale, finalScale, finalScale]}>
        <meshStandardMaterial
          vertexColors
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

interface STLViewerInteractiveProps {
  modelUrl: string;
  className?: string;
}

export default function STLViewerInteractive({ modelUrl, className = "" }: STLViewerInteractiveProps) {
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
      // If a color is selected, resume cycling from current
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
        onCreated={() => setIsLoading(false)}
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
        />

        <HeightRuler maxHeight={14} modelHeight={currentSize.height} />

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
          className="flex gap-2 p-1 rounded-lg"
          style={{ backgroundColor: "rgba(22, 28, 41, 0.95)", border: "1px solid #2a3649" }}
        >
          <button
            onClick={toggleRotation}
            className="px-3 py-1.5 rounded text-sm font-medium transition-all text-[#E8EDF5] hover:bg-[#2a3649]"
            title={isRotating ? "Pause rotation" : "Resume rotation"}
          >
            {isRotating ? "⏸ Rotation" : "▶ Rotation"}
          </button>
          <button
            onClick={toggleColorCycling}
            className="px-3 py-1.5 rounded text-sm font-medium transition-all text-[#E8EDF5] hover:bg-[#2a3649]"
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

      {/* Instructions */}
      <div
        className="absolute top-4 right-4 text-xs px-2 py-1 rounded hidden sm:block"
        style={{ backgroundColor: "rgba(22, 28, 41, 0.9)", color: "#9BA8BE" }}
      >
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
