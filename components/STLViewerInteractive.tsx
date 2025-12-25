"use client";

import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";

// Matte filament colors (Row 1 - 22 colors)
const MATTE_COLORS = [
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
];

// Metallic/Silk filament colors (Row 2 - silk versions)
const METALLIC_COLORS = [
  { name: "Gold", hex: "#ffd700" },
  { name: "Silver", hex: "#c0c0c0" },
  { name: "Silk Red", hex: "#ff0000" },
  { name: "Silk Orange", hex: "#ff8000" },
  { name: "Silk Yellow", hex: "#ffff00" },
  { name: "Silk Lime", hex: "#80ff00" },
  { name: "Silk Green", hex: "#00ff00" },
  { name: "Silk Cyan", hex: "#00ffff" },
  { name: "Silk Blue", hex: "#0000ff" },
  { name: "Silk Purple", hex: "#8000ff" },
  { name: "Silk Magenta", hex: "#ff00ff" },
  { name: "Silk Pink", hex: "#ffbfcc" },
  { name: "Silk Teal", hex: "#008080" },
  { name: "Silk Indigo", hex: "#800080" },
];

// Dual-color silk filaments (gradient effect)
const DUAL_COLORS: { name: string; hex1: string; hex2: string }[] = [
  { name: "Silk Red/Gold", hex1: "#ffcc00", hex2: "#ff3333" },
  { name: "Silk Green/Blue", hex1: "#00ff00", hex2: "#0000ff" },
  { name: "Silk Pink/Blue", hex1: "#ff69b4", hex2: "#00bfff" },
  { name: "Silk Gold/Silver", hex1: "#ffd700", hex2: "#c0c0c0" },
  { name: "Silk Copper/Gold", hex1: "#b87333", hex2: "#ffd700" },
  { name: "Silk Black/Gold", hex1: "#1a1a1a", hex2: "#ffd700" },
  { name: "Silk Black/Blue", hex1: "#1a1a1a", hex2: "#0066ff" },
  { name: "Silk Black/Green", hex1: "#1a1a1a", hex2: "#00cc00" },
  { name: "Silk Black/Purple", hex1: "#1a1a1a", hex2: "#9933ff" },
  { name: "Silk Pink/Gold", hex1: "#ff69b4", hex2: "#ffd700" },
  { name: "Silk Green/Purple", hex1: "#00cc00", hex2: "#9933ff" },
  { name: "Silk Red/Blue", hex1: "#ff3333", hex2: "#0066ff" },
];

// Tri-color silk filaments (3-color gradient) - based on SUNLU & ERYONE products
const TRI_COLORS: { name: string; hex1: string; hex2: string; hex3: string }[] = [
  { name: "Gold/Silver/Copper", hex1: "#ffd700", hex2: "#c0c0c0", hex3: "#b87333" },
  { name: "Red/Blue/Green", hex1: "#ff3333", hex2: "#0066ff", hex3: "#00cc00" },
  { name: "Red/Gold/Purple", hex1: "#ff3333", hex2: "#ffd700", hex3: "#9933ff" },
  { name: "Orange/Blue/Green", hex1: "#ff6600", hex2: "#0066ff", hex3: "#00cc00" },
  { name: "Red/Yellow/Blue", hex1: "#ff3333", hex2: "#ffcc00", hex3: "#0066ff" },
  { name: "Blue/Green/Purple", hex1: "#0066ff", hex2: "#00cc00", hex3: "#9933ff" },
];

// Combined colors with metallic property
const FILAMENT_COLORS = [
  ...MATTE_COLORS.map(c => ({ ...c, metallic: false, hex: c.hex, hex2: undefined as string | undefined, hex3: undefined as string | undefined })),
  ...METALLIC_COLORS.map(c => ({ ...c, metallic: true, hex: c.hex, hex2: undefined as string | undefined, hex3: undefined as string | undefined })),
  ...DUAL_COLORS.map(c => ({ name: c.name, metallic: true, hex: c.hex1, hex2: c.hex2, hex3: undefined as string | undefined })),
  ...TRI_COLORS.map(c => ({ name: c.name, metallic: true, hex: c.hex1, hex2: c.hex2, hex3: c.hex3 as string | undefined })),
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
  color2?: string;
  color3?: string;
  isRotating: boolean;
  scale: number;
  isMetallic: boolean;
}

function Model({ url, color, color2, color3, isRotating, scale, isMetallic }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const rawGeometry = useLoader(STLLoader, url);

  // Clone, rotate, and center the geometry once to avoid mutating cached geometry
  const { geometry, baseScale, yMin, yMax } = useMemo(() => {
    const cloned = rawGeometry.clone();

    // Rotate geometry so the flat bottom faces down (model sits on butt)
    // STL is typically Z-up, we need Y-up with model sitting upright
    cloned.rotateX(-Math.PI / 2);

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

    // Get Y bounds for gradient (after centering)
    const yMin = box.min.y - center.y;
    const yMax = box.max.y - center.y;

    return {
      geometry: cloned,
      baseScale: 2.0 / maxDim,
      yMin,
      yMax
    };
  }, [rawGeometry]);

  // Colors as THREE.Color
  const colorObj = useMemo(() => new THREE.Color(color), [color]);
  const color2Obj = useMemo(() => color2 ? new THREE.Color(color2) : null, [color2]);
  const color3Obj = useMemo(() => color3 ? new THREE.Color(color3) : null, [color3]);

  // Gradient shader material for dual/tri colors
  const gradientMaterial = useMemo(() => {
    if (!color2Obj) return null;

    return new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: colorObj },
        color2: { value: color2Obj },
        color3: { value: color3Obj || color2Obj }, // Fallback to color2 if no color3
        hasColor3: { value: color3Obj ? 1.0 : 0.0 },
        yMin: { value: yMin },
        yMax: { value: yMax },
        metalness: { value: isMetallic ? 0.8 : 0.1 },
        roughness: { value: isMetallic ? 0.15 : 0.3 },
      },
      vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        void main() {
          vPosition = position;
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform float hasColor3;
        uniform float yMin;
        uniform float yMax;
        uniform float metalness;
        uniform float roughness;
        varying vec3 vPosition;
        varying vec3 vNormal;

        void main() {
          // Calculate gradient factor based on Y position
          float t = clamp((vPosition.y - yMin) / (yMax - yMin), 0.0, 1.0);

          vec3 baseColor;
          if (hasColor3 > 0.5) {
            // 3-color gradient: color1 at bottom, color2 in middle, color3 at top
            if (t < 0.5) {
              baseColor = mix(color1, color2, t * 2.0);
            } else {
              baseColor = mix(color2, color3, (t - 0.5) * 2.0);
            }
          } else {
            // 2-color gradient
            baseColor = mix(color1, color2, t);
          }

          // Simple lighting
          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.0);
          float ambient = 0.4;

          // Metallic sheen
          vec3 viewDir = normalize(cameraPosition - vPosition);
          vec3 reflectDir = reflect(-lightDir, vNormal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0) * metalness;

          vec3 finalColor = baseColor * (ambient + diff * 0.6) + vec3(spec);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
    });
  }, [colorObj, color2Obj, color3Obj, yMin, yMax, isMetallic]);

  // Update shader uniforms when colors change
  useEffect(() => {
    if (materialRef.current && color2Obj) {
      materialRef.current.uniforms.color1.value = colorObj;
      materialRef.current.uniforms.color2.value = color2Obj;
      materialRef.current.uniforms.color3.value = color3Obj || color2Obj;
      materialRef.current.uniforms.hasColor3.value = color3Obj ? 1.0 : 0.0;
    }
  }, [colorObj, color2Obj, color3Obj]);

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
        {color2 && gradientMaterial ? (
          <primitive object={gradientMaterial} ref={materialRef} attach="material" />
        ) : (
          <meshStandardMaterial
            color={colorObj}
            roughness={isMetallic ? 0.15 : 0.3}
            metalness={isMetallic ? 0.8 : 0.1}
          />
        )}
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
        camera={{ position: [0, -0.5, 5], fov: 50 }}
        style={{ background: "linear-gradient(180deg, #4a5a6d 0%, #3a4a5d 50%, #2a3a4d 100%)", borderRadius: "8px" }}
        onCreated={() => setIsLoading(false)}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />
        <directionalLight position={[0, -5, 5]} intensity={0.6} />
        <directionalLight position={[0, 5, -5]} intensity={0.4} />

        <Model
          url={modelUrl}
          color={currentColor.hex}
          color2={currentColor.hex2}
          color3={currentColor.hex3}
          isRotating={isRotating}
          scale={currentSize.scale}
          isMetallic={currentColor.metallic}
        />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          target={[0, -0.5, 0]}
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

      {/* Color palette with color name header - compact */}
      <div
        className="absolute bottom-3 left-4 right-4 px-2 py-2 rounded-lg"
        style={{ backgroundColor: "rgba(22, 28, 41, 0.95)", border: "1px solid #2a3649" }}
      >
        {/* Current color display header */}
        <div className="flex items-center justify-between mb-2 pb-1.5" style={{ borderBottom: "1px solid #2a3649" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full border-2 border-white/30 shadow-lg"
              style={{
                background: currentColor.hex3
                  ? `linear-gradient(135deg, ${currentColor.hex} 0%, ${currentColor.hex2} 50%, ${currentColor.hex3} 100%)`
                  : currentColor.hex2
                    ? `linear-gradient(135deg, ${currentColor.hex} 0%, ${currentColor.hex2} 100%)`
                    : currentColor.hex
              }}
            />
            <div>
              <span className="text-sm font-semibold" style={{ color: "#E8EDF5" }}>
                {currentColor.name}
              </span>
              <span className="text-xs ml-2" style={{ color: "#9BA8BE" }}>
                {currentSize.height}"
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAllColors}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                selectedColorIndex === null && isColorCycling
                  ? "bg-[#4A9FD4] text-white"
                  : "bg-[#2a3649] text-[#9BA8BE] hover:bg-[#3a4659]"
              }`}
            >
              Cycle All
            </button>
            <span className="text-[10px] hidden sm:block" style={{ color: "#6B7280" }}>
              Drag • Scroll
            </span>
          </div>
        </div>
        {/* Color rows with label column */}
        <div className="flex">
          {/* Label column with vertical border */}
          <div
            className="flex flex-col justify-around pr-2 mr-2"
            style={{
              borderRight: "1px solid #4A9FD4",
              minWidth: "32px"
            }}
          >
            <span className="text-[10px] font-medium py-1" style={{ color: "#9BA8BE" }}>Basic</span>
            <span className="text-[10px] font-medium py-1" style={{ color: "#9BA8BE" }}>Silk</span>
            <span className="text-[10px] font-medium py-1" style={{ color: "#9BA8BE" }}>Dual</span>
            <span className="text-[10px] font-medium py-1" style={{ color: "#9BA8BE" }}>Tri</span>
          </div>

          {/* Color swatches column */}
          <div className="flex-1">
            {/* Basic colors row */}
            <div className="flex flex-wrap items-center gap-1 py-0.5">
              {FILAMENT_COLORS.slice(0, MATTE_COLORS.length).map((color, idx) => (
                <button
                  key={color.name}
                  onClick={() => handleColorClick(idx)}
                  className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
                    colorIndex === idx
                      ? "border-white shadow-lg scale-110"
                      : "border-transparent hover:border-white/50"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
            {/* Separator line */}
            <div className="h-px" style={{ background: "linear-gradient(90deg, #4A9FD4 0%, #4A9FD4 80%, transparent 100%)", opacity: 0.25 }} />
            {/* Metallic/Silk colors row */}
            <div className="flex flex-wrap items-center gap-1 py-0.5">
              {FILAMENT_COLORS.slice(MATTE_COLORS.length, MATTE_COLORS.length + METALLIC_COLORS.length).map((color, idx) => (
                <button
                  key={color.name}
                  onClick={() => handleColorClick(idx + MATTE_COLORS.length)}
                  className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
                    colorIndex === idx + MATTE_COLORS.length
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
              ))}
            </div>
            {/* Separator line */}
            <div className="h-px" style={{ background: "linear-gradient(90deg, #4A9FD4 0%, #4A9FD4 80%, transparent 100%)", opacity: 0.25 }} />
            {/* Dual-color silk row */}
            <div className="flex flex-wrap items-center gap-1 py-0.5">
              {FILAMENT_COLORS.slice(MATTE_COLORS.length + METALLIC_COLORS.length, MATTE_COLORS.length + METALLIC_COLORS.length + DUAL_COLORS.length).map((color, idx) => {
                const actualIdx = idx + MATTE_COLORS.length + METALLIC_COLORS.length;
                return (
                  <button
                    key={color.name}
                    onClick={() => handleColorClick(actualIdx)}
                    className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
                      colorIndex === actualIdx
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
            {/* Separator line */}
            <div className="h-px" style={{ background: "linear-gradient(90deg, #4A9FD4 0%, #4A9FD4 80%, transparent 100%)", opacity: 0.25 }} />
            {/* Tri-color silk row */}
            <div className="flex flex-wrap items-center gap-1 py-0.5">
              {FILAMENT_COLORS.slice(MATTE_COLORS.length + METALLIC_COLORS.length + DUAL_COLORS.length).map((color, idx) => {
                const actualIdx = idx + MATTE_COLORS.length + METALLIC_COLORS.length + DUAL_COLORS.length;
                return (
                  <button
                    key={color.name}
                    onClick={() => handleColorClick(actualIdx)}
                    className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
                      colorIndex === actualIdx
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
    </div>
  );
}
