#!/usr/bin/env python3
"""
Create a rotating video of the alien with color cycling using matplotlib
Works reliably without display/GPU issues
"""

import os
import numpy as np
import trimesh
import matplotlib
matplotlib.use('Agg')  # Headless rendering
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

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
FRAMES_PER_COLOR = FPS * SECONDS_PER_COLOR
IMAGE_SIZE = 512

# Reduce for faster rendering with matplotlib
MAX_FACES = 50000  # Decimate to this many faces

# 24 Popular filament colors (hex)
COLORS = [
    '#F5F5F5',  # white
    '#1E1E1E',  # black
    '#808080',  # gray
    '#C0C0C8',  # silver
    '#DC2828',  # red
    '#8C0000',  # dark red
    '#FF8C00',  # orange
    '#FFDC00',  # yellow
    '#32CD32',  # lime green
    '#228B22',  # forest green
    '#008080',  # teal
    '#87CEEB',  # light blue
    '#1E5AC8',  # blue
    '#000080',  # navy
    '#800080',  # purple
    '#FF69B4',  # pink
    '#FF008F',  # magenta
    '#FFD700',  # gold
    '#CD7F32',  # bronze
    '#B87333',  # copper
    '#8C5A2B',  # brown
    '#F5DEB3',  # beige
    '#39FF14',  # glow green
    '#556B2F',  # olive
]

BACKGROUND_COLOR = '#161c29'

def sample_faces(mesh, max_faces):
    """Sample a subset of faces for faster rendering"""
    if len(mesh.faces) <= max_faces:
        return mesh.vertices, mesh.faces

    # Randomly sample faces
    np.random.seed(42)
    indices = np.random.choice(len(mesh.faces), max_faces, replace=False)
    sampled_faces = mesh.faces[indices]

    # Get unique vertices used by sampled faces
    unique_verts = np.unique(sampled_faces.flatten())
    vert_map = {old: new for new, old in enumerate(unique_verts)}

    # Remap face indices
    new_faces = np.array([[vert_map[v] for v in face] for face in sampled_faces])
    new_verts = mesh.vertices[unique_verts]

    return new_verts, new_faces

def main():
    print("=== Alien Video Creator (matplotlib) ===\n")

    # Load STL
    print(f"Loading {STL_PATH}...")
    mesh = trimesh.load(STL_PATH)

    if not isinstance(mesh, trimesh.Trimesh):
        print("Failed to load mesh!")
        return

    print(f"Loaded mesh with {len(mesh.vertices):,} vertices, {len(mesh.faces):,} faces")

    # Center and normalize first
    mesh.vertices -= mesh.centroid
    scale = 1.0 / mesh.bounding_box.extents.max()
    mesh.apply_scale(scale)

    # Rotate upright
    rotation = trimesh.transformations.rotation_matrix(np.radians(-90), [1, 0, 0])
    mesh.apply_transform(rotation)

    # Sample faces for performance
    if len(mesh.faces) > MAX_FACES:
        print(f"Sampling {MAX_FACES:,} faces for performance...")
        vertices, faces = sample_faces(mesh, MAX_FACES)
        print(f"After sampling: {len(vertices):,} vertices, {len(faces):,} faces")
    else:
        vertices = mesh.vertices
        faces = mesh.faces

    # Create triangles for plotting
    triangles = vertices[faces]

    # Generate frames
    total_frames = len(COLORS) * FRAMES_PER_COLOR

    print(f"\nGenerating {total_frames} frames ({FRAMES_PER_COLOR} per color, {FPS} FPS)...")
    print(f"Each color: {SECONDS_PER_COLOR}s with one full 360° rotation\n")

    frames = []

    # Set up figure once
    fig = plt.figure(figsize=(IMAGE_SIZE/100, IMAGE_SIZE/100), dpi=100)

    for color_idx, color in enumerate(COLORS):
        print(f"Color {color_idx + 1}/{len(COLORS)}: {color}")

        for frame_idx in range(FRAMES_PER_COLOR):
            fig.clear()
            ax = fig.add_subplot(111, projection='3d')

            # Set background
            ax.set_facecolor(BACKGROUND_COLOR)
            fig.patch.set_facecolor(BACKGROUND_COLOR)

            # Calculate rotation angle
            angle = (frame_idx / FRAMES_PER_COLOR) * 360

            # Create rotation matrix around Y axis
            rad = np.radians(angle)
            rot = np.array([
                [np.cos(rad), 0, np.sin(rad)],
                [0, 1, 0],
                [-np.sin(rad), 0, np.cos(rad)]
            ])

            # Rotate vertices
            rotated_verts = vertices @ rot.T
            rotated_tris = rotated_verts[faces]

            # Create collection with flat shading
            collection = Poly3DCollection(
                rotated_tris,
                facecolors=color,
                edgecolors=color,  # Same as face to avoid edges
                linewidths=0.1,
                alpha=1.0
            )
            ax.add_collection3d(collection)

            # Set view
            ax.set_xlim(-0.6, 0.6)
            ax.set_ylim(-0.6, 0.6)
            ax.set_zlim(-0.6, 0.6)
            ax.set_box_aspect([1, 1, 1])
            ax.axis('off')

            # Render to array
            fig.canvas.draw()
            img = np.frombuffer(fig.canvas.tostring_rgb(), dtype=np.uint8)
            img = img.reshape(fig.canvas.get_width_height()[::-1] + (3,))
            frames.append(img)

    plt.close(fig)

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
