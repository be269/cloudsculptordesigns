"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";
import { FILAMENT_COLORS, SIZE_OPTIONS } from "./STLViewerInteractive";

interface ModelProps {
  url: string;
  color: string;
  color2?: string;
  color3?: string;
  isMetallic: boolean;
  position?: [number, number, number];
}

function Model({ url, color, color2, color3, isMetallic, position = [0, 0, 0] }: ModelProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const rawGeometry = useLoader(STLLoader, url);

  // Clone, rotate, and center the geometry once to avoid mutating cached geometry
  const { geometry, baseScale, yMin, yMax } = useMemo(() => {
    const cloned = rawGeometry.clone();

    // Rotate geometry so the flat bottom faces down
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

  // Colors as THREE.Color - update when color props change
  const colorObj = useMemo(() => new THREE.Color(color), [color]);
  const color2Obj = useMemo(() => color2 ? new THREE.Color(color2) : null, [color2]);
  const color3Obj = useMemo(() => color3 ? new THREE.Color(color3) : null, [color3]);

  // Gradient shader material for dual/tri colors - recreate when colors change
  const gradientMaterial = useMemo(() => {
    if (!color2Obj) return null;

    return new THREE.ShaderMaterial({
      uniforms: {
        color1: { value: colorObj.clone() },
        color2: { value: color2Obj.clone() },
        color3: { value: color3Obj ? color3Obj.clone() : color2Obj.clone() },
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
          float t = clamp((vPosition.y - yMin) / (yMax - yMin), 0.0, 1.0);

          vec3 baseColor;
          if (hasColor3 > 0.5) {
            if (t < 0.5) {
              baseColor = mix(color1, color2, t * 2.0);
            } else {
              baseColor = mix(color2, color3, (t - 0.5) * 2.0);
            }
          } else {
            baseColor = mix(color1, color2, t);
          }

          vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.0);
          float ambient = 0.4;

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
      materialRef.current.uniforms.color1.value.set(color);
      materialRef.current.uniforms.color2.value.copy(color2Obj);
      if (color3Obj) {
        materialRef.current.uniforms.color3.value.copy(color3Obj);
      }
      materialRef.current.uniforms.hasColor3.value = color3Obj ? 1.0 : 0.0;
      materialRef.current.uniformsNeedUpdate = true;
    }
  }, [color, color2Obj, color3Obj]);

  const finalScale = baseScale * 1.0;

  return (
    <mesh geometry={geometry} scale={[finalScale, finalScale, finalScale]} position={position}>
      {color2 && gradientMaterial ? (
        <primitive object={gradientMaterial} ref={materialRef} attach="material" />
      ) : (
        <meshStandardMaterial
          color={color}
          roughness={isMetallic ? 0.15 : 0.6}
          metalness={isMetallic ? 0.8 : 0.05}
        />
      )}
    </mesh>
  );
}

interface CompositeRocketSceneProps {
  plumeUrl: string;
  rocketUrl: string;
  rocketColor: string;
  rocketColor2?: string;
  rocketColor3?: string;
  isRotating: boolean;
  scale: number;
  isMetallic: boolean;
}

function CompositeRocketScene({
  plumeUrl,
  rocketUrl,
  rocketColor,
  rocketColor2,
  rocketColor3,
  isRotating,
  scale,
  isMetallic
}: CompositeRocketSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Rotate the group for smooth centered rotation
  useFrame((state, delta) => {
    if (groupRef.current && isRotating) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Smoke plume - always white, at bottom */}
      <Model
        url={plumeUrl}
        color="#ffffff"
        isMetallic={false}
        position={[0, -0.8, 0]}
      />
      {/* Rocket - on top, color changeable, positioned to align with plume */}
      <Model
        url={rocketUrl}
        color={rocketColor}
        color2={rocketColor2}
        color3={rocketColor3}
        isMetallic={isMetallic}
        position={[0.12, 0.6, 0]}
      />
    </group>
  );
}

interface STLViewerCompositeRocketProps {
  className?: string;
  colorIndex: number;
  sizeIndex: number;
  onColorChange?: (index: number) => void;
}

export default function STLViewerCompositeRocket({
  className = "",
  colorIndex,
  sizeIndex,
  onColorChange
}: STLViewerCompositeRocketProps) {
  const [isRotating, setIsRotating] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const toggleRotation = useCallback(() => {
    setIsRotating((prev) => !prev);
  }, []);

  const currentColor = FILAMENT_COLORS[colorIndex];
  const currentSize = SIZE_OPTIONS[sizeIndex];

  return (
    <div className={`relative ${className}`} style={{ minHeight: "100%", height: "100%" }}>
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
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: "linear-gradient(180deg, #4a5a6d 0%, #3a4a5d 50%, #2a3a4d 100%)", borderRadius: "8px" }}
        onCreated={() => setIsLoading(false)}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.6} />
        <directionalLight position={[0, -5, 5]} intensity={0.5} />
        <directionalLight position={[0, 5, -5]} intensity={0.5} />
        <hemisphereLight args={["#ffffff", "#444444", 0.4]} />

        <CompositeRocketScene
          plumeUrl="/models/rocket_with_plume.stl"
          rocketUrl="/models/retro_rocket.stl"
          rocketColor={currentColor.hex}
          rocketColor2={currentColor.hex2}
          rocketColor3={currentColor.hex3}
          isRotating={isRotating}
          scale={currentSize.scale}
          isMetallic={currentColor.metallic}
        />

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2}
          maxDistance={10}
          target={[0, 0, 0]}
        />
      </Canvas>

      {/* Rotation control */}
      <div className="absolute top-3 right-3">
        <button
          onClick={toggleRotation}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isRotating
              ? "bg-[#4A9FD4] text-white"
              : "text-[#E8EDF5] hover:bg-[#2a3649]"
          }`}
          style={{
            backgroundColor: isRotating ? "#4A9FD4" : "rgba(22, 28, 41, 0.95)",
            border: "1px solid #4A9FD4"
          }}
          title={isRotating ? "Pause rotation" : "Resume rotation"}
        >
          {isRotating ? "⏸" : "▶"}
        </button>
      </div>

      {/* Color and size info overlay */}
      <div
        className="absolute bottom-3 left-3 px-3 py-2 rounded-lg flex items-center gap-2"
        style={{ backgroundColor: "rgba(22, 28, 41, 0.95)", border: "1px solid #2a3649" }}
      >
        <div
          className="w-5 h-5 rounded-full border-2 border-white/30"
          style={{
            background: currentColor.hex3
              ? `linear-gradient(135deg, ${currentColor.hex} 0%, ${currentColor.hex2} 50%, ${currentColor.hex3} 100%)`
              : currentColor.hex2
                ? `linear-gradient(135deg, ${currentColor.hex} 0%, ${currentColor.hex2} 100%)`
                : currentColor.hex
          }}
        />
        <span className="text-sm" style={{ color: "#E8EDF5" }}>
          Rocket: {currentColor.name}
        </span>
        <span className="text-xs" style={{ color: "#6B7280" }}>•</span>
        <span className="text-xs" style={{ color: "#9BA8BE" }}>
          Plume: White
        </span>
      </div>
    </div>
  );
}
