#!/usr/bin/env python3
"""
Create a banner using product photos with background removal
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from rembg import remove
import io

# Paths
PRODUCTS_DIR = os.path.expanduser("~/cloudsculptordesigns/public/images/products")
OUTPUT_DIR = os.path.expanduser("~/Desktop")
BANNER_OUTPUT = os.path.join(OUTPUT_DIR, "new-banner-photos.png")

# Banner dimensions
BANNER_WIDTH = 1200
BANNER_HEIGHT = 400

# Colors matching the site
BG_COLOR_DARK = (22, 28, 41)
BG_COLOR_MID = (30, 39, 57)
ACCENT_COLOR = (74, 159, 212)

# Select best product images for banner
SELECTED_PRODUCTS = [
    "articulated-asian-style-dragon.jpg",      # Dragon - left
    "german-castle.jpg",                        # Castle - left back
    "foo-lion-mask.jpg",                        # Foo lion - left
    "kong-mech-robot.jpg",                      # Robot - right
    "3d-printed-alien-figurine.jpg",           # Alien - right
    "behind-oni-wall-mask.jpg",                # Oni mask - right
]

def remove_background(img_path):
    """Remove background from an image using rembg"""
    print(f"  Removing background from {os.path.basename(img_path)}...")
    with open(img_path, 'rb') as f:
        input_data = f.read()

    output_data = remove(input_data)
    return Image.open(io.BytesIO(output_data)).convert('RGBA')

def create_gradient_background(width, height):
    """Create a dark blue gradient background"""
    img = Image.new('RGB', (width, height), BG_COLOR_DARK)
    draw = ImageDraw.Draw(img)

    # Vertical gradient - lighter in middle
    for y in range(height):
        factor = 1 - abs(y - height/2) / (height/2) * 0.3
        r = int(BG_COLOR_DARK[0] + (BG_COLOR_MID[0] - BG_COLOR_DARK[0]) * factor)
        g = int(BG_COLOR_DARK[1] + (BG_COLOR_MID[1] - BG_COLOR_DARK[1]) * factor)
        b = int(BG_COLOR_DARK[2] + (BG_COLOR_MID[2] - BG_COLOR_DARK[2]) * factor)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    return img

def add_product_to_banner(banner, product_img, x, y, max_size, flip=False):
    """Add a product image to the banner at specified position"""
    # Crop to bounding box (remove empty space)
    bbox = product_img.getbbox()
    if bbox:
        product_img = product_img.crop(bbox)

    # Resize maintaining aspect ratio
    aspect = product_img.width / product_img.height
    if aspect > 1:
        new_width = min(max_size, product_img.width)
        new_height = int(new_width / aspect)
    else:
        new_height = min(max_size, product_img.height)
        new_width = int(new_height * aspect)

    product_img = product_img.resize((new_width, new_height), Image.LANCZOS)

    # Flip if needed
    if flip:
        product_img = product_img.transpose(Image.FLIP_LEFT_RIGHT)

    # Paste onto banner
    banner.paste(product_img, (x, y), product_img)
    return banner

def add_center_text(banner):
    """Add centered text"""
    draw = ImageDraw.Draw(banner)
    center_x = BANNER_WIDTH // 2
    center_y = BANNER_HEIGHT // 2

    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 42)
    except:
        font = ImageFont.load_default()

    text1 = "CLOUD SCULPTOR"
    text2 = "DESIGNS"

    # Get text sizes
    bbox1 = draw.textbbox((0, 0), text1, font=font)
    bbox2 = draw.textbbox((0, 0), text2, font=font)
    w1 = bbox1[2] - bbox1[0]
    w2 = bbox2[2] - bbox2[0]

    # Shadow
    shadow = (15, 20, 30)
    for dx, dy in [(3, 3), (2, 2), (1, 1)]:
        draw.text((center_x - w1//2 + dx, center_y - 40 + dy), text1, font=font, fill=shadow)
        draw.text((center_x - w2//2 + dx, center_y + 15 + dy), text2, font=font, fill=shadow)

    # Main text
    draw.text((center_x - w1//2, center_y - 40), text1, font=font, fill=(232, 237, 245))
    draw.text((center_x - w2//2, center_y + 15), text2, font=font, fill=(232, 237, 245))

    return banner

def main():
    print("=== Product Photo Banner Creator ===\n")

    # Create background
    print("Creating gradient background...")
    banner = create_gradient_background(BANNER_WIDTH, BANNER_HEIGHT)
    banner = banner.convert('RGBA')

    # Load and process product images
    print("\nProcessing product images...")

    # Positions for products: (x, y, max_size, flip)
    # Left side products (facing right/center)
    # Right side products (facing left/center)
    positions = [
        # Left side - 3 products
        (-30, 30, 320, False),     # Far left, large
        (200, 100, 220, False),    # Left-center
        (100, -20, 200, False),    # Top left

        # Right side - 3 products (flipped to face center)
        (920, 30, 320, True),      # Far right, large
        (750, 100, 220, True),     # Right-center
        (900, -20, 200, True),     # Top right
    ]

    for i, product_file in enumerate(SELECTED_PRODUCTS):
        product_path = os.path.join(PRODUCTS_DIR, product_file)
        if not os.path.exists(product_path):
            print(f"  Warning: {product_file} not found, skipping")
            continue

        print(f"\nProcessing {product_file}...")

        # Remove background
        try:
            product_img = remove_background(product_path)

            # Add to banner
            if i < len(positions):
                x, y, size, flip = positions[i]
                banner = add_product_to_banner(banner, product_img, x, y, size, flip)
                print(f"  Added at position ({x}, {y})")
        except Exception as e:
            print(f"  Error processing {product_file}: {e}")

    # Add center text
    print("\nAdding center text...")
    banner = banner.convert('RGB')
    banner = add_center_text(banner)

    # Add accent lines
    draw = ImageDraw.Draw(banner)
    draw.line([(0, 0), (BANNER_WIDTH, 0)], fill=ACCENT_COLOR, width=2)
    draw.line([(0, BANNER_HEIGHT-2), (BANNER_WIDTH, BANNER_HEIGHT-2)], fill=ACCENT_COLOR, width=2)

    # Save
    banner.save(BANNER_OUTPUT, quality=95)
    print(f"\nBanner saved to {BANNER_OUTPUT}")
    print("Check your Desktop!")

if __name__ == "__main__":
    main()
