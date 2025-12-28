"use client";

import { useRef, useState, useEffect, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";
import * as THREE from "three";
import { ErrorBoundary } from "react-error-boundary";

interface ThreeMFModelProps {
  url: string;
  isRotating: boolean;
  onLoaded?: () => void;
  onError?: (error: Error) => void;
}

function ThreeMFModel({ url, isRotating, onLoaded, onError }: ThreeMFModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);

  useEffect(() => {
    const loader = new ThreeMFLoader();

    loader.load(
      url,
      (object) => {
        // 3MFLoader returns a Group containing meshes with materials
        const group = object;

        // Compute bounding box before any transformation
        const box = new THREE.Box3().setFromObject(group);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Scale to fit in view (normalize to ~2 units)
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2.0 / maxDim;

        // Create a parent group for transformations
        const parentGroup = new THREE.Group();

        // Add the model to parent
        parentGroup.add(group);

        // Center the model
        group.position.set(-center.x, -center.y, -center.z);

        // Apply scale to parent
        parentGroup.scale.setScalar(scale);

        // Rotate to Y-up orientation (3MF is typically Z-up)
        parentGroup.rotation.x = -Math.PI / 2;

        // Ensure materials are double-sided for visibility
        group.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.side = THREE.DoubleSide;
              });
            } else {
              child.material.side = THREE.DoubleSide;
            }
          }
        });

        setModel(parentGroup);
        onLoaded?.();
      },
      (progress) => {
        if (progress.total > 0) {
          console.log("Loading 3MF:", (progress.loaded / progress.total * 100).toFixed(0) + "%");
        }
      },
      (error) => {
        console.error("Error loading 3MF:", error);
        onError?.(error instanceof Error ? error : new Error(String(error)));
      }
    );

    return () => {
      // Cleanup
      if (model) {
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (child.material instanceof THREE.Material) {
              child.material.dispose();
            } else if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            }
          }
        });
      }
    };
  }, [url]);

  // Rotate the group
  useFrame((state, delta) => {
    if (groupRef.current && isRotating) {
      groupRef.current.rotation.y += delta * 0.5;
    }
  });

  if (!model) return null;

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

// Loading component for Suspense
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#4A9FD4" wireframe />
    </mesh>
  );
}

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "#1e2739" }}>
      <div className="text-center p-4">
        <div className="text-red-400 mb-2">Failed to load 3D model</div>
        <div className="text-xs text-[#9BA8BE] mb-3">{error.message}</div>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-[#4A9FD4] text-white rounded-lg text-sm hover:bg-[#3d8bc0]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

interface ThreeMFViewerProps {
  modelUrl: string;
  className?: string;
}

export default function ThreeMFViewer({
  modelUrl,
  className = "",
}: ThreeMFViewerProps) {
  const [isRotating, setIsRotating] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Toggle rotation
  const toggleRotation = useCallback(() => {
    setIsRotating((prev) => !prev);
  }, []);

  // Reset error state when modelUrl changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    setErrorMessage("");
  }, [modelUrl]);

  const handleModelLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleModelError = useCallback((error: Error) => {
    setHasError(true);
    setErrorMessage(error.message);
    setIsLoading(false);
  }, []);

  if (hasError) {
    return (
      <div className={`relative ${className}`} style={{ minHeight: "100%", height: "100%" }}>
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: "#1e2739", borderRadius: "8px" }}>
          <div className="text-center p-4">
            <div className="text-red-400 mb-2">Failed to load 3D model</div>
            {errorMessage && <div className="text-xs text-[#9BA8BE] mb-3">{errorMessage}</div>}
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
              }}
              className="px-4 py-2 bg-[#4A9FD4] text-white rounded-lg text-sm hover:bg-[#3d8bc0]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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

      {/* 3D Canvas - fills entire container */}
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onError={() => setHasError(true)}
        onReset={() => setHasError(false)}
      >
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50, near: 0.1, far: 1000 }}
          style={{ background: "linear-gradient(180deg, #4a5a6d 0%, #3a4a5d 50%, #2a3a4d 100%)", borderRadius: "8px" }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.0} />
          <directionalLight position={[-5, -5, -5]} intensity={0.8} />
          <directionalLight position={[0, -5, 5]} intensity={0.6} />
          <directionalLight position={[0, 5, -5]} intensity={0.6} />
          <hemisphereLight args={["#ffffff", "#444444", 0.5]} />

          <Suspense fallback={<LoadingFallback />}>
            <ThreeMFModel
              url={modelUrl}
              isRotating={isRotating}
              onLoaded={handleModelLoaded}
              onError={handleModelError}
            />
          </Suspense>

          <OrbitControls
            enableZoom={true}
            enablePan={false}
            minDistance={1.5}
            maxDistance={10}
            target={[0, 0, 0]}
          />
        </Canvas>
      </ErrorBoundary>

      {/* Minimal overlay - just rotation control */}
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

      {/* Info overlay */}
      <div
        className="absolute bottom-3 left-3 px-3 py-2 rounded-lg flex items-center gap-2"
        style={{ backgroundColor: "rgba(22, 28, 41, 0.95)", border: "1px solid #2a3649" }}
      >
        <span className="text-sm" style={{ color: "#E8EDF5" }}>
          Painted 3MF Model
        </span>
        <span className="text-xs" style={{ color: "#6B7280" }}>•</span>
        <span className="text-xs" style={{ color: "#9BA8BE" }}>
          Drag to rotate • Scroll to zoom
        </span>
      </div>
    </div>
  );
}
