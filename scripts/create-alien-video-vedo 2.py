#!/usr/bin/env python3
"""
Create a rotating video of the alien with color cycling using vedo (VTK)
Proper face coloring without interpolation artifacts
"""

import os
import numpy as np
from vedo import Mesh, Plotter, Light, settings

try:
    import imageio.v3 as iio
except ImportError:
    print("Please install imageio: pip3 install imageio imageio-ffmpeg")
    exit(1)

# Configure vedo for offscreen
settings.default_backend = 'vtk'

# Paths
STL_PATH = os.path.expanduser("~/Desktop/STLs/Alien_1.stl")
OUTPUT_MP4 = os.path.expanduser("~/cloudsculptordesigns/public/images/products/alien-rotating.mp4")
OUTPUT_WEBM = os.path.expanduser("~/cloudsculptordesigns/public/images/products/alien-rotating.webm")

# Animation settings
FPS = 30
SECONDS_PER_COLOR = 3
FRAMES_PER_COLOR = FPS * SECONDS_PER_COLOR
IMAGE_SIZE = 512

# 24 Popular filament colors (RGB 0-255)
COLORS = [
    (245, 245, 245),  # white
    (30, 30, 30),     # black
    (128, 128, 128),  # gray
    (192, 192, 200),  # silver
    (220, 40, 40),    # red
    (140, 0, 0),      # dark red
    (255, 140, 0),    # orange
    (255, 220, 0),    # yellow
    (50, 205, 50),    # lime green
    (34, 140, 34),    # forest green
    (0, 128, 128),    # teal
    (135, 206, 235),  # light blue
    (30, 90, 200),    # blue
    (0, 0, 128),      # navy
    (128, 0, 128),    # purple
    (255, 105, 180),  # pink
    (255, 0, 143),    # magenta
    (255, 215, 0),    # gold
    (205, 127, 50),   # bronze
    (184, 115, 51),   # copper
    (140, 90, 43),    # brown
    (245, 222, 179),  # beige
    (57, 255, 20),    # glow green
    (85, 107, 47),    # olive
]

BACKGROUND_COLOR = (22, 28, 41)  # #161c29

def main():
    print("=== Alien Video Creator (vedo/VTK) ===\n")

    # Load STL
    print(f"Loading {STL_PATH}...")
    mesh = Mesh(STL_PATH)

    print(f"Loaded mesh with {mesh.npoints:,} vertices, {mesh.ncells:,} faces")

    # Center the mesh
    com = mesh.center_of_mass()
    mesh.shift(-com[0], -com[1], -com[2])

    # Scale to fit
    bounds = mesh.bounds()
    max_extent = max(bounds[1]-bounds[0], bounds[3]-bounds[2], bounds[5]-bounds[4])
    mesh.scale(2.0 / max_extent)

    # Rotate upright
    mesh.rotate_x(-90, around=(0,0,0))

    # Create offscreen plotter
    plt = Plotter(offscreen=True, size=(IMAGE_SIZE, IMAGE_SIZE), bg=BACKGROUND_COLOR)

    # Add lights
    light1 = Light(pos=(2, 2, 3), focal_point=(0, 0, 0), intensity=1.0)
    light2 = Light(pos=(-2, -1, 2), focal_point=(0, 0, 0), intensity=0.5)

    # Generate frames
    total_frames = len(COLORS) * FRAMES_PER_COLOR
    rotation_per_frame = 360 / FRAMES_PER_COLOR

    print(f"\nGenerating {total_frames} frames ({FRAMES_PER_COLOR} per color, {FPS} FPS)...")
    print(f"Each color: {SECONDS_PER_COLOR}s with one full 360° rotation\n")

    frames = []

    for color_idx, color in enumerate(COLORS):
        print(f"Color {color_idx + 1}/{len(COLORS)}: RGB{color}")

        # Set solid color on the mesh with lighting
        mesh.color(color)
        mesh.lighting('shiny')  # Better lighting for 3D look
        mesh.phong()  # Smooth shading with proper lighting

        for frame_idx in range(FRAMES_PER_COLOR):
            # Create a copy with current rotation
            current_mesh = mesh.clone()
            current_mesh.rotate_y(frame_idx * rotation_per_frame, around=(0,0,0))

            # Show and capture
            plt.clear()
            plt.show(current_mesh, light1, light2, resetcam=True, interactive=False)

            # Capture frame
            img = plt.screenshot(asarray=True)
            frames.append(img)

    plt.close()

    print(f"\nGenerated {len(frames)} frames")

    # Convert to numpy array
    frames_array = np.array(frames)

    # Save as MP4
    print(f"\nEncoding MP4 to {OUTPUT_MP4}...")
    iio.imwrite(
        OUTPUT_MP4,
        frames_array,
        fps=FPS,
        codec="libx264",
        output_params=["-crf", "23", "-preset", "slow", "-pix_fmt", "yuv420p"]
    )

    # Save as WebM
    print(f"Encoding WebM to {OUTPUT_WEBM}...")
    iio.imwrite(
        OUTPUT_WEBM,
        frames_array,
        fps=FPS,
        codec="libvpx-vp9",
        output_params=["-crf", "30", "-b:v", "1M", "-pix_fmt", "yuv420p"]
    )

    # Check file sizes
    mp4_size = os.path.getsize(OUTPUT_MP4) / (1024 * 1024)
    webm_size = os.path.getsize(OUTPUT_WEBM) / (1024 * 1024)
    print(f"\nOutput file sizes:")
    print(f"  MP4:  {mp4_size:.2f} MB")
    print(f"  WebM: {webm_size:.2f} MB")
    print("\nDone!")

if __name__ == "__main__":
    main()
