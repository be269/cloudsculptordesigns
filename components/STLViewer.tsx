"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";

// Filament colors for cycling (skin colors)
const SKIN_COLORS = [
  { name: "white", hex: "#f5f5f5" },
  { name: "gray", hex: "#808080" },
  { name: "red", hex: "#dc2828" },
  { name: "orange", hex: "#ff8c00" },
  { name: "yellow", hex: "#ffdc00" },
  { name: "lime-green", hex: "#32cd32" },
  { name: "forest-green", hex: "#228b22" },
  { name: "teal", hex: "#008080" },
  { name: "light-blue", hex: "#87ceeb" },
  { name: "blue", hex: "#1e5ac8" },
  { name: "purple", hex: "#800080" },
  { name: "pink", hex: "#ff69b4" },
  { name: "magenta", hex: "#ff0090" },
  { name: "gold", hex: "#ffd700" },
  { name: "bronze", hex: "#cd7f32" },
  { name: "copper", hex: "#b87333" },
  { name: "glow-green", hex: "#39ff14" },
];

const EYE_COLOR = "#0a0a0a"; // Near black for eyes

interface ModelProps {
  url: string;
  colorIndex: number;
}

function Model({ url, colorIndex }: ModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometry = useLoader(STLLoader, url);

  // Center and scale the geometry
  useMemo(() => {
    geometry.center();
    geometry.computeBoundingBox();
    const box = geometry.boundingBox;
    if (box) {
      const maxDim = Math.max(
        box.max.x - box.min.x,
        box.max.y - box.min.y,
        box.max.z - box.min.z
      );
      const scale = 2.5 / maxDim;
      geometry.scale(scale, scale, scale);
    }
    geometry.computeVertexNormals();
  }, [geometry]);

  // Rotate the model
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3; // Slow rotation
    }
  });

  // Get current skin color
  const skinColor = SKIN_COLORS[colorIndex % SKIN_COLORS.length];

  // Create vertex colors to keep eyes black
  const colors = useMemo(() => {
    const positionAttribute = geometry.getAttribute("position");
    const normalAttribute = geometry.getAttribute("normal");
    const count = positionAttribute.count;
    const colors = new Float32Array(count * 3);

    const skinRGB = new THREE.Color(skinColor.hex);
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

      // Eyes are typically in upper third of model, front-facing
      // Check if vertex is likely an eye based on position and normal
      const nx = (normalAttribute?.array[i * 3] || 0) as number;
      const nz = (normalAttribute?.array[i * 3 + 2] || 0) as number;

      // Eye detection: upper portion, front-facing normals, and recessed (negative Z normal)
      const isUpperArea = normalizedY > 0.55 && normalizedY < 0.85;
      const isFrontFacing = nz > 0.5;
      const isRecessed = nz < -0.3; // Pointing inward

      // Be conservative - only mark as eye if clearly recessed and in eye area
      const isEye = isUpperArea && isRecessed && normalizedZ > 0.6;

      const color = isEye ? eyeRGB : skinRGB;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return colors;
  }, [geometry, skinColor.hex]);

  // Apply colors to geometry
  useEffect(() => {
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  }, [geometry, colors]);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  );
}

interface STLViewerProps {
  modelUrl: string;
  className?: string;
}

export default function STLViewer({ modelUrl, className = "" }: STLViewerProps) {
  const [colorIndex, setColorIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Cycle colors every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % SKIN_COLORS.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Handle loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const currentColor = SKIN_COLORS[colorIndex % SKIN_COLORS.length];

  return (
    <div className={`relative ${className}`} style={{ minHeight: "400px" }}>
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

      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ background: "#1e2739", borderRadius: "8px" }}
        onCreated={() => setIsLoading(false)}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />

        <Model url={modelUrl} colorIndex={colorIndex} />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={8}
          autoRotate={false}
        />
      </Canvas>

      {/* Color indicator */}
      <div
        className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-lg"
        style={{ backgroundColor: "rgba(30, 39, 57, 0.9)", border: "1px solid #2a3649" }}
      >
        <div
          className="w-5 h-5 rounded-full border border-white/20"
          style={{ backgroundColor: currentColor.hex }}
        />
        <span className="text-sm capitalize" style={{ color: "#E8EDF5" }}>
          {currentColor.name.replace("-", " ")}
        </span>
      </div>

      <div
        className="absolute bottom-4 right-4 text-xs px-2 py-1 rounded"
        style={{ backgroundColor: "rgba(30, 39, 57, 0.9)", color: "#9BA8BE" }}
      >
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
