#!/usr/bin/env python3
"""
Banner Creation Script for Cloud Sculptor Designs
Creates a new banner with product images arranged around the logo
"""

from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
from rembg import remove
import os

# Paths
BASE_DIR = os.path.expanduser("~/cloudsculptordesigns")
PRODUCTS_DIR = os.path.join(BASE_DIR, "public/images/products")
BANNER_PATH = os.path.join(BASE_DIR, "public/images/banner.png")
OUTPUT_PATH = os.path.expanduser("~/Desktop/new-banner-preview.png")

# Banner dimensions (match current banner)
BANNER_WIDTH = 1200
BANNER_HEIGHT = 400

# Colors from site theme
DARK_BLUE = (22, 28, 41)  # #161c29
MID_BLUE = (30, 39, 57)   # #1e2739
LIGHT_BLUE = (42, 54, 73) # #2a3649
ACCENT_BLUE = (74, 159, 212)  # #4A9FD4

def create_gradient_background(width, height):
    """Create a dark blue gradient background"""
    img = Image.new('RGBA', (width, height), DARK_BLUE)
    draw = ImageDraw.Draw(img)

    # Create vertical gradient
    for y in range(height):
        # Gradient from slightly lighter at top to darker at bottom
        ratio = y / height
        r = int(DARK_BLUE[0] + (MID_BLUE[0] - DARK_BLUE[0]) * (1 - ratio) * 0.5)
        g = int(DARK_BLUE[1] + (MID_BLUE[1] - DARK_BLUE[1]) * (1 - ratio) * 0.5)
        b = int(DARK_BLUE[2] + (MID_BLUE[2] - DARK_BLUE[2]) * (1 - ratio) * 0.5)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))

    # Add subtle radial gradient from center
    center_x, center_y = width // 2, height // 2
    max_dist = (width ** 2 + height ** 2) ** 0.5 / 2

    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)

    for y in range(height):
        for x in range(0, width, 4):  # Skip pixels for speed
            dist = ((x - center_x) ** 2 + (y - center_y) ** 2) ** 0.5
            alpha = int(30 * (1 - dist / max_dist))
            if alpha > 0:
                overlay_draw.point((x, y), fill=(LIGHT_BLUE[0], LIGHT_BLUE[1], LIGHT_BLUE[2], alpha))

    img = Image.alpha_composite(img, overlay)
    return img

def remove_background(image_path):
    """Remove background from product image using rembg"""
    print(f"  Removing background from {os.path.basename(image_path)}...")
    with open(image_path, 'rb') as f:
        input_data = f.read()
    output_data = remove(input_data)
    return Image.open(os.io.BytesIO(output_data)).convert('RGBA')

def remove_background_pil(img):
    """Remove background from PIL Image using rembg"""
    import io
    # Convert to bytes
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    # Remove background
    output_data = remove(buffer.read())
    return Image.open(io.BytesIO(output_data)).convert('RGBA')

def load_and_process_image(image_path, max_height=300, remove_bg=True):
    """Load image, optionally remove background, resize proportionally"""
    import io

    print(f"  Processing {os.path.basename(image_path)}...")

    # Load image
    img = Image.open(image_path).convert('RGBA')

    # Remove background if requested
    if remove_bg:
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        output_data = remove(buffer.read())
        img = Image.open(io.BytesIO(output_data)).convert('RGBA')

    # Resize proportionally to max height
    ratio = max_height / img.height
    new_width = int(img.width * ratio)
    img = img.resize((new_width, max_height), Image.Resampling.LANCZOS)

    return img

def extract_logo_area(banner_path, center_width=400, center_height=None):
    """Extract the center logo area from existing banner"""
    banner = Image.open(banner_path).convert('RGBA')

    if center_height is None:
        center_height = banner.height

    # Calculate center crop
    left = (banner.width - center_width) // 2
    top = (banner.height - center_height) // 2
    right = left + center_width
    bottom = top + center_height

    return banner.crop((left, top, right, bottom))

def main():
    print("Creating new banner for Cloud Sculptor Designs...")
    print()

    # Create gradient background
    print("1. Creating gradient background...")
    banner = create_gradient_background(BANNER_WIDTH, BANNER_HEIGHT)

    # Extract logo from existing banner
    print("2. Extracting logo from existing banner...")
    logo = extract_logo_area(BANNER_PATH, center_width=350, center_height=BANNER_HEIGHT)

    # Product images to use (selected 7 for balanced composition)
    products = [
        ("german-castle.jpg", 280, "left-back"),       # Tall, detailed - far left
        ("kong-mech-robot.jpg", 260, "left-mid"),      # Impressive mech - left
        ("behind-oni-wall-mask.jpg", 200, "left-front"), # Colorful - left front
        ("robot-hand-controller-holder.jpg", 220, "right-mid"),  # Metallic - right
        ("forest-goddess-planter.jpg", 240, "right-back"),  # Elegant - right back
        ("3d-printed-brain-lamp.jpg", 180, "right-front"),  # Unique - right front
        ("alien-pilot-mask.jpg", 200, "bottom-center"),  # Colorful anchor - bottom
    ]

    # Load and process product images
    print("3. Processing product images (removing backgrounds)...")
    processed_images = {}
    for filename, height, position in products:
        path = os.path.join(PRODUCTS_DIR, filename)
        if os.path.exists(path):
            processed_images[position] = load_and_process_image(path, max_height=height)
        else:
            print(f"   WARNING: {filename} not found!")

    # Compose banner
    print("4. Composing final banner...")

    # Position products (x, y coordinates)
    positions = {
        "left-back": (20, 50),
        "left-mid": (180, 80),
        "left-front": (100, 180),
        "right-back": (920, 50),
        "right-mid": (780, 80),
        "right-front": (950, 180),
        "bottom-center": (500, 220),
    }

    # Place products on banner
    for position, coords in positions.items():
        if position in processed_images:
            img = processed_images[position]
            x, y = coords

            # Adjust x position based on image width for right-side items
            if "right" in position:
                x = BANNER_WIDTH - x - img.width + coords[0]

            # Ensure within bounds
            x = max(0, min(x, BANNER_WIDTH - img.width))
            y = max(0, min(y, BANNER_HEIGHT - img.height))

            print(f"   Placing {position} at ({x}, {y})")
            banner.paste(img, (x, y), img)

    # Place logo in center
    print("5. Placing logo in center...")
    logo_x = (BANNER_WIDTH - logo.width) // 2
    logo_y = (BANNER_HEIGHT - logo.height) // 2
    banner.paste(logo, (logo_x, logo_y), logo)

    # Save preview
    print("6. Saving preview...")
    banner.save(OUTPUT_PATH, 'PNG')
    print()
    print(f"Banner preview saved to: {OUTPUT_PATH}")
    print("Please review before deploying to site!")

if __name__ == "__main__":
    main()
