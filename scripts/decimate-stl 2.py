#!/usr/bin/env python3
"""
Decimate STL file to create a web-friendly version
"""

import os
import trimesh

# Paths
INPUT_STL = os.path.expanduser("~/Desktop/STLs/Alien_1.stl")
OUTPUT_STL = os.path.expanduser("~/cloudsculptordesigns/public/models/alien-web.stl")

# Target: reduce to ~5% of original faces for web
TARGET_FACE_RATIO = 0.05

def main():
    print("=== STL Decimation Script ===\n")

    print(f"Loading {INPUT_STL}...")
    mesh = trimesh.load(INPUT_STL)

    if isinstance(mesh, trimesh.Scene):
        geometries = list(mesh.geometry.values())
        if geometries:
            mesh = geometries[0]
        else:
            print("No geometry found!")
            return

    original_faces = len(mesh.faces)
    print(f"Original: {original_faces:,} faces")

    # Calculate target faces
    target_faces = int(original_faces * TARGET_FACE_RATIO)
    print(f"Target: {target_faces:,} faces ({TARGET_FACE_RATIO*100:.0f}%)")

    # Simplify using quadric decimation
    print("\nDecimating mesh...")
    simplified = mesh.simplify_quadric_decimation(target_faces)

    print(f"Result: {len(simplified.faces):,} faces")

    # Export
    print(f"\nSaving to {OUTPUT_STL}...")
    simplified.export(OUTPUT_STL)

    # Check file size
    size_mb = os.path.getsize(OUTPUT_STL) / (1024 * 1024)
    print(f"Output file size: {size_mb:.2f} MB")

    print("\nDone!")

if __name__ == "__main__":
    main()
