#!/usr/bin/env python3
"""
Create a rotating video of the alien with color cycling using trimesh + pyrender
Better flat color support than Open3D
"""

import os
import numpy as np
import trimesh
import pyrender
from PIL import Image

try:
    import imageio.v3 as iio
except ImportError:
    print("Please install imageio: pip3 install imageio imageio-ffmpeg")
    exit(1)

# Paths
STL_PATH = os.path.expanduser("~/Desktop/STLs/Alien_1.stl")
OUTPUT_MP4 = os.path.expanduser("~/cloudsculptordesigns/public/images/products/alien-rotating.mp4")
OUTPUT_WEBM = os.path.expanduser("~/cloudsculptordesigns/public/images/products/alien-rotating.webm")

# Animation settings
FPS = 30
SECONDS_PER_COLOR = 3
FRAMES_PER_COLOR = FPS * SECONDS_PER_COLOR  # 90 frames = 1 full rotation
IMAGE_SIZE = 512

# 24 Popular filament colors (RGB 0-255)
COLORS = [
    [245, 245, 245],  # white
    [30, 30, 30],     # black
    [128, 128, 128],  # gray
    [192, 192, 200],  # silver
    [220, 40, 40],    # red
    [140, 0, 0],      # dark red
    [255, 140, 0],    # orange
    [255, 220, 0],    # yellow
    [50, 205, 50],    # lime green
    [34, 140, 34],    # forest green
    [0, 128, 128],    # teal
    [135, 206, 235],  # light blue
    [30, 90, 200],    # blue
    [0, 0, 128],      # navy
    [128, 0, 128],    # purple
    [255, 105, 180],  # pink
    [255, 0, 143],    # magenta
    [255, 215, 0],    # gold
    [205, 127, 50],   # bronze
    [184, 115, 51],   # copper
    [140, 90, 43],    # brown
    [245, 222, 179],  # beige
    [57, 255, 20],    # glow green
    [85, 107, 47],    # olive
]

BACKGROUND_COLOR = [22, 28, 41, 255]  # #161c29 with alpha

def main():
    print("=== Alien Video Creator (trimesh + pyrender) ===\n")

    # Load STL
    print(f"Loading {STL_PATH}...")
    mesh = trimesh.load(STL_PATH)

    if not isinstance(mesh, trimesh.Trimesh):
        print("Failed to load mesh as Trimesh!")
        return

    print(f"Loaded mesh with {len(mesh.vertices):,} vertices, {len(mesh.faces):,} faces")

    # Clean mesh
    print("Cleaning mesh...")
    mesh.merge_vertices()
    mesh.fix_normals()
    print(f"After cleaning: {len(mesh.vertices):,} vertices, {len(mesh.faces):,} faces")

    # Center mesh at origin
    mesh.vertices -= mesh.centroid

    # Scale to fit in view
    scale = 2.0 / mesh.bounding_box.extents.max()
    mesh.apply_scale(scale)

    # Rotate for good viewing angle (upright)
    rotation = trimesh.transformations.rotation_matrix(np.radians(-90), [1, 0, 0])
    mesh.apply_transform(rotation)

    # Create pyrender scene
    scene = pyrender.Scene(bg_color=np.array(BACKGROUND_COLOR) / 255.0)

    # Create camera
    camera = pyrender.PerspectiveCamera(yfov=np.pi / 3.0)
    camera_pose = np.array([
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 3.0],  # Camera distance
        [0, 0, 0, 1]
    ])
    scene.add(camera, pose=camera_pose)

    # Add lighting
    light = pyrender.DirectionalLight(color=[1.0, 1.0, 1.0], intensity=3.0)
    scene.add(light, pose=camera_pose)

    # Add ambient light
    ambient = pyrender.DirectionalLight(color=[1.0, 1.0, 1.0], intensity=1.0)
    ambient_pose = np.array([
        [1, 0, 0, 0],
        [0, 0, 1, 0],
        [0, -1, 0, 3],
        [0, 0, 0, 1]
    ])
    scene.add(ambient, pose=ambient_pose)

    # Create offscreen renderer
    renderer = pyrender.OffscreenRenderer(IMAGE_SIZE, IMAGE_SIZE)

    # Generate frames
    total_frames = len(COLORS) * FRAMES_PER_COLOR
    rotation_per_frame = 2 * np.pi / FRAMES_PER_COLOR  # Full rotation per color

    print(f"\nGenerating {total_frames} frames ({FRAMES_PER_COLOR} per color, {FPS} FPS)...")
    print(f"Each color: {SECONDS_PER_COLOR}s with one full 360° rotation\n")

    frames = []
    mesh_node = None

    for color_idx, color in enumerate(COLORS):
        print(f"Color {color_idx + 1}/{len(COLORS)}: RGB({color[0]}, {color[1]}, {color[2]})")

        # Create material with flat color (no texture, uniform color)
        material = pyrender.MetallicRoughnessMaterial(
            baseColorFactor=[color[0]/255, color[1]/255, color[2]/255, 1.0],
            metallicFactor=0.1,
            roughnessFactor=0.7,
            smooth=False  # Flat shading
        )

        for frame_idx in range(FRAMES_PER_COLOR):
            # Remove previous mesh
            if mesh_node is not None:
                scene.remove_node(mesh_node)

            # Create rotation transform
            angle = frame_idx * rotation_per_frame
            rot_matrix = trimesh.transformations.rotation_matrix(angle, [0, 1, 0])

            # Create a copy of mesh with rotation applied
            rotated_mesh = mesh.copy()
            rotated_mesh.apply_transform(rot_matrix)

            # Create pyrender mesh with material
            pyrender_mesh = pyrender.Mesh.from_trimesh(rotated_mesh, material=material, smooth=False)
            mesh_node = scene.add(pyrender_mesh)

            # Render
            color_img, _ = renderer.render(scene)
            frames.append(color_img)

    renderer.delete()

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
