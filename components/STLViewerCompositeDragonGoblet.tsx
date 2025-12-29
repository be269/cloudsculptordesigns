"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import * as THREE from "three";

interface ModelProps {
  url: string;
  color: string;
  isMetallic: boolean;
  position?: [number, number, number];
  rotationY?: number;
}

function Model({ url, color, isMetallic, position = [0, 0, 0], rotationY = 0 }: ModelProps) {
  const rawGeometry = useLoader(STLLoader, url);

  const { geometry, baseScale } = useMemo(() => {
    const cloned = rawGeometry.clone();

    // Rotate geometry so the flat bottom faces down
    cloned.rotateX(-Math.PI / 2);

    if (rotationY !== 0) {
      cloned.rotateY((rotationY * Math.PI) / 180);
    }

    cloned.computeBoundingBox();

    const box = cloned.boundingBox!;
    const center = new THREE.Vector3();
    box.getCenter(center);

    cloned.translate(-center.x, -center.y, -center.z);
    cloned.computeVertexNormals();

    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    return {
      geometry: cloned,
      baseScale: 2.0 / maxDim,
    };
  }, [rawGeometry, rotationY]);

  const finalScale = baseScale * 1.0;

  return (
    <mesh geometry={geometry} scale={[finalScale, finalScale, finalScale]} position={position}>
      <meshStandardMaterial
        color={color}
        roughness={isMetallic ? 0.15 : 0.6}
        metalness={isMetallic ? 0.8 : 0.05}
      />
    </mesh>
  );
}

interface CompositeDragonGobletSceneProps {
  color1Url: string;
  color2Url: string;
  isRotating: boolean;
  scale: number;
}

function CompositeDragonGobletScene({
  color1Url,
  color2Url,
  isRotating,
  scale,
}: CompositeDragonGobletSceneProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current && isRotating) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* Color 1 part - Silver metallic */}
      <Model
        url={color1Url}
        color="#e8e8e8"
        isMetallic={true}
        position={[0, 0, 0]}
      />
      {/* Color 2 part - Black */}
      <Model
        url={color2Url}
        color="#1a1a1a"
        isMetallic={false}
        position={[0, 0, 0]}
      />
    </group>
  );
}

interface STLViewerCompositeDragonGobletProps {
  className?: string;
}

export default function STLViewerCompositeDragonGoblet({
  className = "",
}: STLViewerCompositeDragonGobletProps) {
  const [isRotating, setIsRotating] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const toggleRotation = useCallback(() => {
    setIsRotating((prev) => !prev);
  }, []);

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
        camera={{ position: [0, 0.2, 3], fov: 50 }}
        style={{ background: "linear-gradient(180deg, #4a5a6d 0%, #3a4a5d 50%, #2a3a4d 100%)", borderRadius: "8px" }}
        onCreated={() => setIsLoading(false)}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-5, -5, -5]} intensity={0.6} />
        <directionalLight position={[0, -5, 5]} intensity={0.5} />
        <directionalLight position={[0, 5, -5]} intensity={0.5} />
        <hemisphereLight args={["#ffffff", "#444444", 0.4]} />

        <CompositeDragonGobletScene
          color1Url="/models/dragon_cup_color1_web.stl"
          color2Url="/models/dragon_cup_color2_web.stl"
          isRotating={isRotating}
          scale={1.0}
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

      {/* Color info overlay */}
      <div
        className="absolute bottom-3 left-3 px-3 py-2 rounded-lg flex items-center gap-2"
        style={{ backgroundColor: "rgba(22, 28, 41, 0.95)", border: "1px solid #2a3649" }}
      >
        <div className="flex gap-1">
          <div
            className="w-4 h-4 rounded-full border border-white/30"
            style={{ backgroundColor: "#e8e8e8" }}
          />
          <div
            className="w-4 h-4 rounded-full border border-white/30"
            style={{ backgroundColor: "#1a1a1a" }}
          />
        </div>
        <span className="text-sm" style={{ color: "#E8EDF5" }}>
          Silver & Black
        </span>
      </div>
    </div>
  );
}
