#!/usr/bin/env python3
import os
import shutil
import json
import glob

# Paths
DOWNLOADS = os.path.expanduser("~/Downloads")
PRODUCTS_DIR = os.path.expanduser("~/cloudsculptordesigns/public/images/products")
PRODUCTS_JSON = os.path.expanduser("~/cloudsculptordesigns/data/products.json")

# Mapping: (source_folder, file_prefix) -> product_slug
IMAGE_MAPPINGS = {
    # Dragons
    ("Dragons", "Asian Dragon"): "articulated-asian-style-dragon",
    ("Dragons", "Dragon Cup"): "dragon-cup",
    ("Dragons", "Rock Dragon"): "rock-dragon-3d-printed",
    ("Dragons", "Skeleton Dragon"): "3d-printed-articulated-skeletal-dragon",
    ("Dragons", "Steam Punk Dragon"): "3d-printed-articulated-steampunk-dragon",

    # Brains
    ("Brains", "Brain Lamp"): "3d-printed-brain-lamp",
    ("Brains", "Brain"): "life-size-3d-printed-brain",

    # Aliens
    ("Aliens", "Alien1"): "3d-printed-alien-figurine",
    ("Aliens", "Alien2"): "alien-visitor-2",
    ("Aliens", "Alien Hand"): "alien-hand",

    # Masks
    ("Masks", "Behind Oni Wall Mask"): "behind-oni-wall-mask",
    ("Masks", "Oni Devil Mask"): "oni-devil-desk-organizer",
    ("Masks", "Alien Pilot"): "alien-pilot-mask",
    ("Masks", "Foo Lion"): "foo-lion-mask",

    # Rockets
    ("Rockets", "Rocket 10 Inch"): "retro-style-3d-printed-rocket-ship-large",
    ("Rockets", "Rocket"): "rocket-ship-3d-printed-desk-toy",

    # Robots
    ("Robots", "Kong Mech"): "kong-mech-robot",
    ("Robots", "Robot Hand"): "robot-hand-controller-holder",

    # Planters
    ("Planters", "Forest Godess"): "forest-goddess-planter",
    ("Planters", "Futuristic Cityscape Head Planter"): "futuristic-cityscape-head-planter",
    ("Planters", "Rotating Face"): "rotating-face-planter",

    # Castles
    ("Castles", "German Castle"): "german-castle",

    # Skulls
    ("Skulls", "Celtic"): "celtic-skull",
    ("Skulls", "Sugar"): "sugar-skull",

    # Fidgets
    ("Fidgets", "Face Fidget"): "female-face-fidget-toy-pixels",
    ("Fidgets", "Heart Gear Fidget"): "geared-heart-3d-printed",

    # Wine Holders
    ("Wine Holders", "Alien"): "alien-wine-holder",
    ("Wine Holders", "Asian Dragon"): "asian-dragon-wine-holder",
    ("Wine Holders", "Bear"): "bear-wine-holder",
    ("Wine Holders", "Octopus"): "octopus-wine-holder",
    ("Wine Holders", "Stiletto"): "stiletto-wine-holder",

    # Zelda
    ("Zelda", "Master Sword Kit"): "zelda-master-sword-kit",
    ("Zelda", "Shield"): "zelda-hylian-shield",

    # Octopus
    ("Octopus", "Adorable"): "adorable-octopus",
    ("Octopus", "Floppy"): "octopus-3d-printed-articulated",

    # Animals
    ("Animals", "Gorilla"): "gorilla-flexible-3d-printed",

    # Creatures
    ("Creatures", "Ushi"): "ushi-creature",

    # Brick Blocks
    ("Brick Blocks", "Brick Block Flowers"): "life-size-brick-block-flowers",

    # Magic Lamp
    ("Magic Lamp", "Magic Lamp Incense Holder"): "magic-lamp-incense-holder",
}

def copy_images():
    """Copy images from Downloads to products folder"""
    copied = {}

    for (folder, prefix), slug in IMAGE_MAPPINGS.items():
        source_dir = os.path.join(DOWNLOADS, folder)
        if not os.path.exists(source_dir):
            print(f"Skipping {folder} - folder not found")
            continue

        # Find all matching files
        files = sorted([f for f in os.listdir(source_dir)
                       if f.startswith(prefix) and f.lower().endswith('.jpg')])

        if not files:
            print(f"No files found for {prefix} in {folder}")
            continue

        copied[slug] = []

        for i, filename in enumerate(files):
            src = os.path.join(source_dir, filename)
            # Name format: slug-2.jpg, slug-3.jpg, etc. (skip -1 since main image exists)
            new_name = f"{slug}-{i+2}.jpg"
            dst = os.path.join(PRODUCTS_DIR, new_name)

            shutil.copy2(src, dst)
            copied[slug].append(f"/images/products/{new_name}")
            print(f"Copied {filename} -> {new_name}")

    return copied

def update_products_json(copied_images):
    """Update products.json with additional images"""
    with open(PRODUCTS_JSON, 'r') as f:
        products = json.load(f)

    updated_count = 0
    for product in products:
        slug = product.get('slug')
        if slug in copied_images:
            # Keep existing additionalImages if any (like pipecox badge)
            existing = product.get('additionalImages', [])
            # Filter out any pipecox badge from new images
            new_images = [img for img in copied_images[slug] if 'pipecox' not in img]
            # Combine: new images first, then any badges
            badges = [img for img in existing if 'pipecox' in img or 'authorized' in img]
            product['additionalImages'] = new_images + badges
            updated_count += 1
            print(f"Updated {slug} with {len(new_images)} additional images")

    with open(PRODUCTS_JSON, 'w') as f:
        json.dump(products, f, indent=2)

    print(f"\nUpdated {updated_count} products in products.json")

if __name__ == "__main__":
    print("=== Copying images ===\n")
    copied = copy_images()
    print(f"\n=== Copied images for {len(copied)} products ===\n")

    print("=== Updating products.json ===\n")
    update_products_json(copied)
    print("\nDone!")
