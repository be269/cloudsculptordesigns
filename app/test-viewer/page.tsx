"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import to avoid SSR issues with Three.js
const STLViewerInteractive = dynamic(
  () => import("@/components/STLViewerInteractive"),
  { ssr: false }
);

export default function TestViewerPage() {
  const [colorIndex, setColorIndex] = useState(0);
  const [sizeIndex, setSizeIndex] = useState(1);

  return (
    <div className="min-h-screen py-12 px-4" style={{ backgroundColor: "#161c29" }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "#E8EDF5" }}>
          Interactive 3D Viewer Test
        </h1>

        <div className="rounded-lg overflow-hidden" style={{ height: "600px" }}>
          <STLViewerInteractive
            modelUrl="/models/Alien_1.stl"
            className="w-full h-full"
            colorIndex={colorIndex}
            sizeIndex={sizeIndex}
            onColorChange={setColorIndex}
          />
        </div>

        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "#1e2739", border: "1px solid #2a3649" }}>
          <h2 className="font-semibold mb-2" style={{ color: "#E8EDF5" }}>Features:</h2>
          <ul className="space-y-1 text-sm" style={{ color: "#9BA8BE" }}>
            <li>• Eyes will be black on actual print (unless specified in order notes)</li>
            <li>• 24 clickable color swatches</li>
            <li>• Size selector (Small/Medium/Large)</li>
            <li>• Play/Pause controls for rotation and color cycling</li>
            <li>• Drag to rotate, scroll to zoom</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
