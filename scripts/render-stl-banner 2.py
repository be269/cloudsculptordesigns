#!/usr/bin/env python3
"""
Render STL files and create a banner for Cloud Sculptor Designs
"""

import os
import trimesh
import numpy as np
from PIL import Image, ImageDraw, ImageFont

# Paths
STL_FOLDER = os.path.expanduser("~/Desktop/STLs")
OUTPUT_DIR = os.path.expanduser("~/Desktop")
BANNER_OUTPUT = os.path.join(OUTPUT_DIR, "new-banner-stl.png")

# Banner dimensions
BANNER_WIDTH = 1200
BANNER_HEIGHT = 400

# Colors matching the site
BG_COLOR_DARK = (22, 28, 41)  # #161c29
BG_COLOR_MID = (30, 39, 57)   # #1e2739
ACCENT_COLOR = (74, 159, 212)  # #4A9FD4
MODEL_COLOR = [80, 140, 200, 255]  # Blue color for models

def load_and_render_stl(stl_path, output_path, size=(500, 500)):
    """Load an STL and render it to an image"""
    try:
        print(f"Loading {os.path.basename(stl_path)}...")
        mesh = trimesh.load(stl_path)

        # Handle mesh or scene
        if isinstance(mesh, trimesh.Scene):
            # Get the geometry from the scene
            geometries = list(mesh.geometry.values())
            if geometries:
                mesh = geometries[0]
            else:
                print(f"  No geometry found in {stl_path}")
                return False

        # Center the mesh
        mesh.vertices -= mesh.centroid

        # Scale to fit nicely in view
        scale = 1.5 / max(mesh.extents)
        mesh.vertices *= scale

        # Apply color to the mesh
        mesh.visual.face_colors = MODEL_COLOR

        # Rotate for better viewing angle
        # Tilt forward
        rot_x = trimesh.transformations.rotation_matrix(np.radians(20), [1, 0, 0])
        # Rotate slightly
        rot_y = trimesh.transformations.rotation_matrix(np.radians(-25), [0, 1, 0])
        mesh.apply_transform(rot_x)
        mesh.apply_transform(rot_y)

        # Create scene
        scene = trimesh.Scene(mesh)

        # Set background to a color we can key out (green screen style)
        # Actually, trimesh renders with white bg by default

        # Render
        try:
            png_data = scene.save_image(resolution=size, visible=False)

            # Load the image and process it
            from io import BytesIO
            img = Image.open(BytesIO(png_data)).convert('RGBA')

            # Convert white/light gray background to transparent
            data = np.array(img)

            # Find pixels that are close to white (background)
            # The background is typically RGB close to (255,255,255)
            r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]

            # Threshold for "white" - if all RGB > 240, make transparent
            white_mask = (r > 240) & (g > 240) & (b > 240)
            data[white_mask] = [0, 0, 0, 0]  # Make transparent

            # Save processed image
            result = Image.fromarray(data, 'RGBA')
            result.save(output_path)

            print(f"  Rendered to {output_path}")
            return True

        except Exception as e:
            print(f"  Render error: {e}")
            return False

    except Exception as e:
        print(f"  Error loading {stl_path}: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_gradient_background(width, height):
    """Create a dark blue gradient background"""
    img = Image.new('RGB', (width, height), BG_COLOR_DARK)
    draw = ImageDraw.Draw(img)

    for y in range(height):
        # Lighter in the middle vertically
        vert_factor = 1 - abs(y - height/2) / (height/2) * 0.3
        r = int(BG_COLOR_DARK[0] + (BG_COLOR_MID[0] - BG_COLOR_DARK[0]) * vert_factor)
        g = int(BG_COLOR_DARK[1] + (BG_COLOR_MID[1] - BG_COLOR_DARK[1]) * vert_factor)
        b = int(BG_COLOR_DARK[2] + (BG_COLOR_MID[2] - BG_COLOR_DARK[2]) * vert_factor)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    return img

def add_glow_lines(img, color, width=2):
    """Add accent lines at top and bottom"""
    draw = ImageDraw.Draw(img)
    draw.line([(0, 0), (img.width, 0)], fill=color, width=width)
    draw.line([(0, img.height-width), (img.width, img.height-width)], fill=color, width=width)
    return img

def composite_renders_on_banner(banner, render_files):
    """Arrange rendered models on the banner"""
    # Positions for 6 models: 3 left, 3 right
    # Format: (x, y, size, flip_horizontal)
    positions = [
        # Left side
        (0, 50, 250, False),      # Far left
        (150, 120, 180, False),   # Left-center
        (80, 0, 160, False),      # Top left

        # Right side
        (950, 50, 250, True),     # Far right
        (820, 120, 180, True),    # Right-center
        (960, 0, 160, True),      # Top right
    ]

    banner_rgba = banner.convert('RGBA')

    for i, render_path in enumerate(render_files[:6]):
        if i >= len(positions):
            break

        try:
            x, y, target_size, flip = positions[i]

            # Load render
            render = Image.open(render_path).convert('RGBA')

            # Check if image has any non-transparent content
            bbox = render.getbbox()
            if not bbox:
                print(f"  Skipping {os.path.basename(render_path)} - empty render")
                continue

            # Crop to content
            render = render.crop(bbox)

            # Resize maintaining aspect ratio
            aspect = render.width / render.height
            if aspect > 1:
                new_width = target_size
                new_height = int(target_size / aspect)
            else:
                new_height = target_size
                new_width = int(target_size * aspect)

            render = render.resize((new_width, new_height), Image.LANCZOS)

            # Flip if needed
            if flip:
                render = render.transpose(Image.FLIP_LEFT_RIGHT)

            # Paste with transparency
            banner_rgba.paste(render, (x, y), render)
            print(f"  Added {os.path.basename(render_path)} at ({x}, {y}), size {new_width}x{new_height}")

        except Exception as e:
            print(f"  Could not add {render_path}: {e}")

    return banner_rgba.convert('RGB')

def add_center_text(banner):
    """Add center logo/text"""
    draw = ImageDraw.Draw(banner)
    center_x = BANNER_WIDTH // 2
    center_y = BANNER_HEIGHT // 2

    # Try to use a nice font
    try:
        font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
    except:
        font_large = ImageFont.load_default()

    text1 = "CLOUD SCULPTOR"
    text2 = "DESIGNS"

    # Get text sizes
    bbox1 = draw.textbbox((0, 0), text1, font=font_large)
    bbox2 = draw.textbbox((0, 0), text2, font=font_large)
    w1 = bbox1[2] - bbox1[0]
    w2 = bbox2[2] - bbox2[0]

    # Draw shadow
    shadow = (20, 25, 35)
    for dx, dy in [(2, 2), (1, 1)]:
        draw.text((center_x - w1//2 + dx, center_y - 35 + dy), text1, font=font_large, fill=shadow)
        draw.text((center_x - w2//2 + dx, center_y + 10 + dy), text2, font=font_large, fill=shadow)

    # Draw main text
    text_color = (232, 237, 245)
    draw.text((center_x - w1//2, center_y - 35), text1, font=font_large, fill=text_color)
    draw.text((center_x - w2//2, center_y + 10), text2, font=font_large, fill=text_color)

    return banner

def main():
    print("=== STL Banner Creator ===\n")

    # List STL files
    stl_files = sorted([f for f in os.listdir(STL_FOLDER) if f.lower().endswith('.stl')])
    print(f"Found {len(stl_files)} STL files:")
    for f in stl_files:
        print(f"  - {f}")

    # Render each STL
    print("\n=== Rendering STLs ===")
    rendered = []
    for stl_file in stl_files:
        stl_path = os.path.join(STL_FOLDER, stl_file)
        safe_name = stl_file.replace('.stl', '.png').replace(' ', '_')
        output_path = os.path.join(OUTPUT_DIR, f"render_{safe_name}")
        if load_and_render_stl(stl_path, output_path):
            rendered.append(output_path)

    # Create banner
    print("\n=== Creating banner ===")
    banner = create_gradient_background(BANNER_WIDTH, BANNER_HEIGHT)

    if rendered:
        print(f"Compositing {len(rendered)} models...")
        banner = composite_renders_on_banner(banner, rendered)

    # Add text
    print("Adding center text...")
    banner = add_center_text(banner)

    # Add accent lines
    banner = add_glow_lines(banner, ACCENT_COLOR)

    # Save
    banner.save(BANNER_OUTPUT, quality=95)
    print(f"\nBanner saved to {BANNER_OUTPUT}")

if __name__ == "__main__":
    main()
