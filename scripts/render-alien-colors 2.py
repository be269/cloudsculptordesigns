#!/usr/bin/env python3
"""
Render Alien_1.stl in 24 popular filament colors for product page slideshow
"""

import os
import trimesh
import numpy as np
from PIL import Image
from io import BytesIO

# Paths
STL_PATH = os.path.expanduser("~/Desktop/STLs/Alien_1.stl")
OUTPUT_DIR = os.path.expanduser("~/cloudsculptordesigns/public/images/products/alien-colors")

# Image size for renders
RENDER_SIZE = (800, 800)

# 24 popular 3D printing filament colors with their RGB values and names
FILAMENT_COLORS = [
    ("white", [245, 245, 245, 255]),
    ("black", [30, 30, 30, 255]),
    ("gray", [128, 128, 128, 255]),
    ("silver", [192, 192, 200, 255]),
    ("red", [220, 40, 40, 255]),
    ("dark-red", [139, 0, 0, 255]),
    ("orange", [255, 140, 0, 255]),
    ("yellow", [255, 220, 0, 255]),
    ("lime-green", [50, 205, 50, 255]),
    ("forest-green", [34, 139, 34, 255]),
    ("teal", [0, 128, 128, 255]),
    ("light-blue", [135, 206, 235, 255]),
    ("blue", [30, 90, 200, 255]),
    ("navy", [0, 0, 128, 255]),
    ("purple", [128, 0, 128, 255]),
    ("violet", [148, 0, 211, 255]),
    ("pink", [255, 105, 180, 255]),
    ("magenta", [255, 0, 144, 255]),
    ("gold", [255, 215, 0, 255]),
    ("bronze", [205, 127, 50, 255]),
    ("copper", [184, 115, 51, 255]),
    ("brown", [139, 90, 43, 255]),
    ("beige", [245, 222, 179, 255]),
    ("glow-green", [57, 255, 20, 255]),
]

def render_mesh_with_color(mesh, color, output_path):
    """Render mesh with a specific color and save to file"""
    # Clone mesh to avoid modifying original
    colored_mesh = mesh.copy()

    # Apply color to all faces
    colored_mesh.visual.face_colors = color

    # Create scene with the mesh
    scene = trimesh.Scene(colored_mesh)

    # Set camera to frame the object nicely
    # Get bounding box for camera positioning
    bounds = colored_mesh.bounds
    center = colored_mesh.centroid
    extent = max(colored_mesh.extents)

    # Try to render
    try:
        # Render with specific camera angle
        png_data = scene.save_image(
            resolution=RENDER_SIZE,
            visible=False
        )

        # Load and process the image
        img = Image.open(BytesIO(png_data)).convert('RGBA')

        # Convert white background to transparent
        data = np.array(img)
        r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

        # Make white/near-white pixels transparent
        white_mask = (r > 240) & (g > 240) & (b > 240)
        data[white_mask] = [0, 0, 0, 0]

        # Create result with dark background instead for better visibility
        result = Image.new('RGB', RENDER_SIZE, (22, 28, 41))  # Match site background
        rgba_result = Image.fromarray(data, 'RGBA')
        result.paste(rgba_result, (0, 0), rgba_result)

        # Save as JPEG
        result.save(output_path, 'JPEG', quality=90)
        return True

    except Exception as e:
        print(f"  Render error: {e}")
        return False

def main():
    print("=== Alien Color Render Script ===\n")

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}\n")

    # Load the STL file
    print(f"Loading {STL_PATH}...")
    try:
        mesh = trimesh.load(STL_PATH)

        # Handle if it's a scene
        if isinstance(mesh, trimesh.Scene):
            geometries = list(mesh.geometry.values())
            if geometries:
                mesh = geometries[0]
            else:
                print("No geometry found in STL!")
                return

        print(f"  Loaded mesh with {len(mesh.faces)} faces")

    except Exception as e:
        print(f"Error loading STL: {e}")
        return

    # Center and scale the mesh
    mesh.vertices -= mesh.centroid
    scale = 2.0 / max(mesh.extents)
    mesh.vertices *= scale

    # Rotate for better viewing angle
    rot_x = trimesh.transformations.rotation_matrix(np.radians(15), [1, 0, 0])
    rot_y = trimesh.transformations.rotation_matrix(np.radians(-30), [0, 1, 0])
    mesh.apply_transform(rot_x)
    mesh.apply_transform(rot_y)

    print(f"\nRendering {len(FILAMENT_COLORS)} color variations...\n")

    successful = 0
    for color_name, color_rgba in FILAMENT_COLORS:
        output_path = os.path.join(OUTPUT_DIR, f"alien-{color_name}.jpg")
        print(f"Rendering {color_name}...")

        if render_mesh_with_color(mesh, color_rgba, output_path):
            print(f"  Saved: {output_path}")
            successful += 1
        else:
            print(f"  Failed to render {color_name}")

    print(f"\n=== Complete ===")
    print(f"Successfully rendered {successful}/{len(FILAMENT_COLORS)} colors")
    print(f"Output directory: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
