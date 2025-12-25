#!/usr/bin/env python3
"""
Create a rotating GIF of the alien with color cycling
"""

import os
import trimesh
import numpy as np
from PIL import Image
from io import BytesIO

# Paths
STL_PATH = os.path.expanduser("~/Desktop/STLs/Alien_1.stl")
OUTPUT_GIF = os.path.expanduser("~/cloudsculptordesigns/public/images/products/alien-rotating.gif")

# Animation settings
FRAMES_PER_COLOR = 8  # 8 frames per color = smooth rotation
ROTATION_PER_FRAME = 360 / 24  # Complete rotation over all frames
FRAME_DURATION = 100  # ms per frame

# Filament colors
COLORS = [
    [245, 245, 245, 255],  # white
    [220, 40, 40, 255],    # red
    [255, 140, 0, 255],    # orange
    [255, 220, 0, 255],    # yellow
    [50, 205, 50, 255],    # lime-green
    [0, 128, 128, 255],    # teal
    [30, 90, 200, 255],    # blue
    [128, 0, 128, 255],    # purple
    [255, 105, 180, 255],  # pink
    [255, 215, 0, 255],    # gold
    [139, 90, 43, 255],    # brown
    [57, 255, 20, 255],    # glow-green
]

def render_frame(mesh, rotation_deg, color):
    """Render a single frame of the mesh"""
    # Clone mesh
    frame_mesh = mesh.copy()

    # Apply rotation
    rotation = trimesh.transformations.rotation_matrix(
        np.radians(rotation_deg), [0, 1, 0]
    )
    frame_mesh.apply_transform(rotation)

    # Apply color
    frame_mesh.visual.face_colors = color

    # Create scene and render
    scene = trimesh.Scene(frame_mesh)

    try:
        png_data = scene.save_image(resolution=(400, 400), visible=False)
        img = Image.open(BytesIO(png_data)).convert('RGBA')

        # Replace white background with dark blue
        data = np.array(img)
        r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

        # Make white pixels the dark background color
        white_mask = (r > 240) & (g > 240) & (b > 240)
        data[white_mask] = [22, 28, 41, 255]  # Site background color

        return Image.fromarray(data, 'RGBA').convert('P', palette=Image.ADAPTIVE, colors=256)

    except Exception as e:
        print(f"  Render error: {e}")
        return None

def main():
    print("=== Alien GIF Creator ===\n")

    # Load STL
    print(f"Loading {STL_PATH}...")
    mesh = trimesh.load(STL_PATH)

    if isinstance(mesh, trimesh.Scene):
        geometries = list(mesh.geometry.values())
        if geometries:
            mesh = geometries[0]
        else:
            print("No geometry found!")
            return

    print(f"Loaded mesh with {len(mesh.faces):,} faces")

    # Center and scale
    mesh.vertices -= mesh.centroid
    scale = 2.0 / max(mesh.extents)
    mesh.vertices *= scale

    # Initial rotation for good viewing angle
    rot_x = trimesh.transformations.rotation_matrix(np.radians(15), [1, 0, 0])
    rot_y = trimesh.transformations.rotation_matrix(np.radians(-30), [0, 1, 0])
    mesh.apply_transform(rot_x)
    mesh.apply_transform(rot_y)

    # Generate frames
    frames = []
    total_frames = len(COLORS) * FRAMES_PER_COLOR

    print(f"\nGenerating {total_frames} frames...")

    for color_idx, color in enumerate(COLORS):
        for frame_idx in range(FRAMES_PER_COLOR):
            frame_num = color_idx * FRAMES_PER_COLOR + frame_idx
            rotation = frame_num * ROTATION_PER_FRAME

            print(f"  Frame {frame_num + 1}/{total_frames} - Color {color_idx + 1}, Rotation {rotation:.1f}°")

            frame = render_frame(mesh, rotation, color)
            if frame:
                frames.append(frame)

    if not frames:
        print("No frames generated!")
        return

    # Save as GIF
    print(f"\nSaving GIF to {OUTPUT_GIF}...")
    frames[0].save(
        OUTPUT_GIF,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_DURATION,
        loop=0,  # Loop forever
        optimize=True
    )

    # Check file size
    size_kb = os.path.getsize(OUTPUT_GIF) / 1024
    print(f"Output file size: {size_kb:.1f} KB")
    print("\nDone!")

if __name__ == "__main__":
    main()
