#!/usr/bin/env python3
"""
Create a rotating video of the alien with color cycling using Open3D
Outputs WebM and MP4 for excellent compression - typically 5-10x smaller than GIF
"""

import os
import numpy as np
from PIL import Image

try:
    import open3d as o3d
except ImportError:
    print("Please install open3d: pip3 install open3d")
    exit(1)

try:
    import imageio.v3 as iio
    from imageio_ffmpeg import get_ffmpeg_exe
except ImportError:
    print("Please install imageio: pip3 install imageio imageio-ffmpeg")
    exit(1)

# Paths
STL_PATH = os.path.expanduser("~/Desktop/STLs/Alien_1.stl")
OUTPUT_WEBM = os.path.expanduser("~/cloudsculptordesigns/public/images/products/alien-rotating.webm")
OUTPUT_MP4 = os.path.expanduser("~/cloudsculptordesigns/public/images/products/alien-rotating.mp4")

# Animation settings
# 1 full 360° rotation per color in 3 seconds
FPS = 30  # Smooth video framerate
SECONDS_PER_COLOR = 3
FRAMES_PER_COLOR = FPS * SECONDS_PER_COLOR  # 90 frames = 1 full rotation
IMAGE_SIZE = 512  # Divisible by 16 for codec compatibility

# 24 Popular filament colors (RGB 0-1)
COLORS = [
    [0.96, 0.96, 0.96],  # white
    [0.12, 0.12, 0.12],  # black
    [0.5, 0.5, 0.5],     # gray
    [0.75, 0.75, 0.78],  # silver
    [0.86, 0.16, 0.16],  # red
    [0.55, 0.0, 0.0],    # dark red
    [1.0, 0.55, 0.0],    # orange
    [1.0, 0.86, 0.0],    # yellow
    [0.2, 0.8, 0.2],     # lime green
    [0.13, 0.55, 0.13],  # forest green
    [0.0, 0.5, 0.5],     # teal
    [0.53, 0.81, 0.92],  # light blue
    [0.12, 0.35, 0.78],  # blue
    [0.0, 0.0, 0.5],     # navy
    [0.5, 0.0, 0.5],     # purple
    [1.0, 0.41, 0.71],   # pink
    [1.0, 0.0, 0.56],    # magenta
    [1.0, 0.84, 0.0],    # gold (silk)
    [0.8, 0.5, 0.2],     # bronze
    [0.72, 0.45, 0.2],   # copper
    [0.55, 0.35, 0.17],  # brown
    [0.96, 0.87, 0.7],   # beige
    [0.22, 1.0, 0.08],   # glow green
    [0.33, 0.42, 0.18],  # olive/army green
]

BACKGROUND_COLOR = [0.086, 0.11, 0.16]  # #161c29 in 0-1 range

def main():
    print("=== Alien Video Creator (Open3D + FFmpeg) ===\n")

    # Load STL
    print(f"Loading {STL_PATH}...")
    mesh = o3d.io.read_triangle_mesh(STL_PATH)

    if not mesh.has_vertices():
        print("Failed to load mesh!")
        return

    print(f"Loaded mesh with {len(mesh.vertices):,} vertices, {len(mesh.triangles):,} triangles")

    # Clean mesh to fix rendering artifacts
    print("Cleaning mesh...")
    mesh.remove_duplicated_vertices()
    mesh.remove_duplicated_triangles()
    mesh.remove_degenerate_triangles()
    mesh.remove_non_manifold_edges()

    # Orient normals consistently (all pointing outward)
    mesh.orient_triangles()
    mesh.compute_vertex_normals()

    print(f"After cleaning: {len(mesh.vertices):,} vertices, {len(mesh.triangles):,} triangles")

    # Center and scale mesh
    mesh.translate(-mesh.get_center())
    bbox = mesh.get_axis_aligned_bounding_box()
    scale = 2.0 / max(bbox.get_extent())
    mesh.scale(scale, center=mesh.get_center())

    # Initial rotation for good viewing angle (rotated 90 degrees as requested)
    R = mesh.get_rotation_matrix_from_xyz((np.radians(-90), np.radians(0), 0))
    mesh.rotate(R, center=mesh.get_center())

    # Create visualizer for offscreen rendering
    vis = o3d.visualization.Visualizer()
    vis.create_window(visible=False, width=IMAGE_SIZE, height=IMAGE_SIZE)

    # Set render options - use flat shading to avoid color splotches
    opt = vis.get_render_option()
    opt.background_color = np.array(BACKGROUND_COLOR)
    opt.mesh_shade_option = o3d.visualization.MeshShadeOption.Color  # Use vertex colors directly
    opt.light_on = False  # Disable lighting to prevent color artifacts
    opt.mesh_show_back_face = True  # Show back faces to avoid holes

    # Add mesh to scene
    vis.add_geometry(mesh)

    # Set up camera
    ctr = vis.get_view_control()
    ctr.set_zoom(0.7)
    ctr.set_front([0, 0, 1])
    ctr.set_up([0, 1, 0])

    # Generate frames - 1 full 360° rotation per color
    total_frames = len(COLORS) * FRAMES_PER_COLOR
    rotation_per_frame = 360 / FRAMES_PER_COLOR  # Full rotation per color!

    print(f"\nGenerating {total_frames} frames ({FRAMES_PER_COLOR} per color, {FPS} FPS)...")
    print(f"Each color: {SECONDS_PER_COLOR}s with one full 360° rotation\n")

    frames = []
    frame_count = 0
    for color_idx, color in enumerate(COLORS):
        print(f"Color {color_idx + 1}/{len(COLORS)}: RGB({color[0]:.2f}, {color[1]:.2f}, {color[2]:.2f})")

        # Set mesh color
        mesh.paint_uniform_color(color)
        vis.update_geometry(mesh)

        for frame_idx in range(FRAMES_PER_COLOR):
            # Rotate mesh
            R = mesh.get_rotation_matrix_from_xyz((0, np.radians(rotation_per_frame), 0))
            mesh.rotate(R, center=mesh.get_center())
            vis.update_geometry(mesh)

            vis.poll_events()
            vis.update_renderer()

            # Capture frame
            img = vis.capture_screen_float_buffer(do_render=True)
            img_array = (np.asarray(img) * 255).astype(np.uint8)
            frames.append(img_array)
            frame_count += 1

    vis.destroy_window()

    print(f"\nGenerated {frame_count} frames")

    # Convert to numpy array for imageio
    frames_array = np.array(frames)

    # Save as MP4 (H.264) - universal support
    print(f"\nEncoding MP4 to {OUTPUT_MP4}...")
    iio.imwrite(
        OUTPUT_MP4,
        frames_array,
        fps=FPS,
        codec="libx264",
        output_params=["-crf", "23", "-preset", "slow", "-pix_fmt", "yuv420p"]
    )

    # Save as WebM (VP9) - better compression
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
