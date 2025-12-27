#!/usr/bin/env python3
"""
Product Render Script for Blender
Renders STL models in realistic desk/table environments for product photos.

Usage:
    /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/render-products.py
"""

import bpy
import os
import math
import json

# Configuration
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
MODELS_DIR = os.path.join(PROJECT_DIR, "public", "models")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "public", "images", "products", "renders")
PRODUCTS_JSON = os.path.join(PROJECT_DIR, "data", "products.json")

# Render settings
RENDER_WIDTH = 1200
RENDER_HEIGHT = 1200
SAMPLES = 128

# Color mapping for products
COLORS = {
    "silver": (0.91, 0.91, 0.91, 1.0),
    "gold": (1.0, 0.84, 0.0, 1.0),
    "gray": (0.4, 0.4, 0.4, 1.0),
    "white": (0.95, 0.95, 0.95, 1.0),
    "red": (0.5, 0.05, 0.05, 1.0),
    "dark_red": (0.25, 0.01, 0.01, 1.0),  # Very dark red for Oni
    "blue": (0.1, 0.3, 0.8, 1.0),
    "green": (0.15, 0.5, 0.25, 1.0),
    "grass_green": (0.05, 0.35, 0.05, 1.0),  # Deep grass green for aliens
    "black": (0.05, 0.05, 0.05, 1.0),
    "copper": (0.72, 0.45, 0.20, 1.0),
    "teal": (0.0, 0.5, 0.5, 1.0),
}

# Desk/environment styles with contrasting colors
ENVIRONMENTS = [
    {
        "name": "dark_wood_desk",
        "desk_color": (0.15, 0.08, 0.04, 1.0),  # Dark walnut
        "desk_roughness": 0.3,
        "wall_color": (0.25, 0.22, 0.20, 1.0),  # Dark warm gray
        "accent_color": (0.6, 0.5, 0.3, 1.0),   # Brass accent
    },
    {
        "name": "slate_modern",
        "desk_color": (0.12, 0.12, 0.14, 1.0),  # Dark slate
        "desk_roughness": 0.15,
        "wall_color": (0.18, 0.18, 0.20, 1.0),  # Charcoal
        "accent_color": (0.8, 0.6, 0.2, 1.0),   # Gold accent
    },
    {
        "name": "rich_mahogany",
        "desk_color": (0.25, 0.10, 0.08, 1.0),  # Mahogany
        "desk_roughness": 0.25,
        "wall_color": (0.15, 0.12, 0.10, 1.0),  # Deep brown
        "accent_color": (0.7, 0.7, 0.65, 1.0),  # Silver accent
    },
    {
        "name": "concrete_industrial",
        "desk_color": (0.25, 0.25, 0.27, 1.0),  # Concrete gray
        "desk_roughness": 0.7,
        "wall_color": (0.20, 0.20, 0.22, 1.0),  # Dark gray
        "accent_color": (0.9, 0.5, 0.2, 1.0),   # Copper accent
    },
    {
        "name": "black_glass",
        "desk_color": (0.02, 0.02, 0.02, 1.0),  # Near black
        "desk_roughness": 0.05,
        "wall_color": (0.10, 0.10, 0.12, 1.0),  # Very dark
        "accent_color": (0.9, 0.85, 0.7, 1.0),  # Warm light
    },
]

# Model-specific settings (rotation in degrees around Z axis)
MODEL_SETTINGS = {
    "Alien_1.stl": {"color": "grass_green", "scale": 0.015, "metallic": 0.3, "rotation": 0},
    "Alien_2.stl": {"color": "grass_green", "scale": 0.015, "metallic": 0.3, "rotation": 0},
    "Alien_3.stl": {"color": "grass_green", "scale": 0.015, "metallic": 0.3, "rotation": 0},
    "Alien_4.stl": {"color": "grass_green", "scale": 0.015, "metallic": 0.3, "rotation": 0},
    "brain.stl": {"color": "white", "scale": 0.01, "metallic": 0.0, "rotation": 0},
    "castle.stl": {"color": "gray", "scale": 0.008, "metallic": 0.0, "rotation": 0},
    "celtic_skull.stl": {"color": "white", "scale": 0.012, "metallic": 0.0, "rotation": 0},
    "chinese_dragon.stl": {"color": "gold", "scale": 0.01, "metallic": 0.9, "rotation": 0},
    "dragon_egg.stl": {"color": "gold", "scale": 0.015, "metallic": 0.7, "rotation": 0},
    "foo_lion.stl": {"color": "gold", "scale": 0.01, "metallic": 0.8, "rotation": 0},
    "forest_goddess.stl": {"color": "grass_green", "scale": 0.012, "metallic": 0.0, "rotation": 0},
    "magic_lamp.stl": {"color": "gold", "scale": 0.015, "metallic": 0.9, "rotation": 0},
    "oni_wall_mask.stl": {"color": "dark_red", "scale": 0.012, "metallic": 0.0, "rotation": 0},
    "retro_rocket.stl": {"color": "dark_red", "scale": 0.01, "metallic": 0.3, "rotation": 0},
    "robot_hand.stl": {"color": "silver", "scale": 0.01, "metallic": 0.9, "rotation": 0},
    "rocket_with_plume.stl": {"color": "white", "scale": 0.01, "metallic": 0.3, "rotation": 0},
}


def clear_scene():
    """Remove all objects from the scene."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)


def setup_render_settings():
    """Configure render settings."""
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.render.resolution_x = RENDER_WIDTH
    scene.render.resolution_y = RENDER_HEIGHT
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = 'JPEG'
    scene.render.image_settings.quality = 95


def create_material(name, color, roughness=0.5, metallic=0.0):
    """Create a PBR material."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    principled = nodes.get('Principled BSDF')
    if principled:
        principled.inputs['Base Color'].default_value = color
        principled.inputs['Roughness'].default_value = roughness
        principled.inputs['Metallic'].default_value = metallic
    return mat


def create_desk_environment(env_style, prop_set=0):
    """Create a realistic desk/table environment with varied props."""

    # Create desk surface (large plane)
    bpy.ops.mesh.primitive_plane_add(size=8, location=(0, 0, 0))
    desk = bpy.context.active_object
    desk.name = "Desk"

    desk_mat = create_material(
        "DeskMaterial",
        env_style["desk_color"],
        roughness=env_style["desk_roughness"],
        metallic=0.0
    )
    desk.data.materials.append(desk_mat)

    # Create backdrop wall
    bpy.ops.mesh.primitive_plane_add(size=10, location=(0, 3, 3))
    wall = bpy.context.active_object
    wall.name = "Wall"
    wall.rotation_euler = (math.radians(90), 0, 0)

    bpy.ops.object.modifier_add(type='SUBSURF')
    wall.modifiers["Subdivision"].levels = 3

    wall_mat = create_material(
        "WallMaterial",
        env_style["wall_color"],
        roughness=0.8,
        metallic=0.0
    )
    wall.data.materials.append(wall_mat)

    props = []

    # Props scaled appropriately for ~4" (10cm) tall products
    # All measurements in meters to match Blender units

    if prop_set == 0:
        # Standard pencil (~19cm long, 7mm diameter) - good scale reference
        bpy.ops.mesh.primitive_cylinder_add(radius=0.0035, depth=0.19, location=(0.12, -0.06, 0.0035))
        pencil = bpy.context.active_object
        pencil.name = "Pencil"
        pencil.rotation_euler = (math.radians(90), 0, math.radians(15))
        pencil_mat = create_material("PencilMat", (0.9, 0.75, 0.2, 1.0), roughness=0.6)
        pencil.data.materials.append(pencil_mat)
        props.append(pencil)

    elif prop_set == 1:
        # Quarter coin (24mm diameter, 1.75mm thick) - great size reference
        bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=0.00175, location=(0.1, -0.05, 0.001))
        coin = bpy.context.active_object
        coin.name = "Coin"
        coin_mat = create_material("CoinMat", (0.72, 0.45, 0.20, 1.0), roughness=0.2, metallic=0.9)
        coin.data.materials.append(coin_mat)
        props.append(coin)

    elif prop_set == 2:
        # Ballpoint pen (~14cm long, 10mm diameter)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.005, depth=0.14, location=(0.11, -0.07, 0.005))
        pen = bpy.context.active_object
        pen.name = "Pen"
        pen.rotation_euler = (math.radians(90), 0, math.radians(-12))
        pen_mat = create_material("PenMat", (0.1, 0.1, 0.15, 1.0), roughness=0.3, metallic=0.5)
        pen.data.materials.append(pen_mat)
        props.append(pen)

    elif prop_set == 3:
        # Business card (89 x 51mm)
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0.1, -0.04, 0.0005))
        card = bpy.context.active_object
        card.name = "BusinessCard"
        card.scale = (0.089, 0.051, 0.0005)
        card.rotation_euler = (0, 0, math.radians(8))
        card_mat = create_material("CardMat", (0.95, 0.95, 0.95, 1.0), roughness=0.5)
        card.data.materials.append(card_mat)
        props.append(card)

    else:
        # No props - clean shot
        pass

    return desk, wall, props


def create_lighting(lighting_variant=0):
    """Create varied lighting setups for each render."""

    # Different lighting setups for variety
    setups = [
        {"key_pos": (2, -2, 3), "key_energy": 200, "key_angle": 40, "fill_energy": 100, "warm": True},
        {"key_pos": (3, -1.5, 2.5), "key_energy": 180, "key_angle": 25, "fill_energy": 120, "warm": False},
        {"key_pos": (1.5, -2.5, 3.5), "key_energy": 220, "key_angle": 55, "fill_energy": 80, "warm": True},
        {"key_pos": (2.5, -2, 2), "key_energy": 160, "key_angle": 35, "fill_energy": 140, "warm": False},
        {"key_pos": (2, -3, 3), "key_energy": 190, "key_angle": 50, "fill_energy": 90, "warm": True},
    ]

    setup = setups[lighting_variant % len(setups)]

    # Key light
    bpy.ops.object.light_add(type='AREA', location=setup["key_pos"])
    key_light = bpy.context.active_object
    key_light.name = "KeyLight"
    key_light.data.energy = setup["key_energy"]
    key_light.data.size = 4
    key_light.data.color = (1.0, 0.95, 0.9) if setup["warm"] else (0.95, 0.98, 1.0)
    key_light.rotation_euler = (math.radians(50), 0, math.radians(setup["key_angle"]))

    # Fill light
    bpy.ops.object.light_add(type='AREA', location=(-2.5, -1, 2.5))
    fill_light = bpy.context.active_object
    fill_light.name = "FillLight"
    fill_light.data.energy = setup["fill_energy"]
    fill_light.data.size = 5
    fill_light.data.color = (1.0, 1.0, 1.0)
    fill_light.rotation_euler = (math.radians(45), 0, math.radians(-40))

    # Top light
    bpy.ops.object.light_add(type='AREA', location=(0, 0, 4))
    top_light = bpy.context.active_object
    top_light.name = "TopLight"
    top_light.data.energy = 80
    top_light.data.size = 6
    top_light.data.color = (1.0, 1.0, 1.0)
    top_light.rotation_euler = (0, 0, 0)

    # Rim light
    bpy.ops.object.light_add(type='AREA', location=(0, 2.5, 1.5))
    rim_light = bpy.context.active_object
    rim_light.name = "RimLight"
    rim_light.data.energy = 50
    rim_light.data.size = 2
    rim_light.data.color = (1.0, 1.0, 1.0)
    rim_light.rotation_euler = (math.radians(-100), 0, 0)

    # World lighting
    world = bpy.context.scene.world
    if world is None:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    bg_node = nodes.get('Background')
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.15, 0.15, 0.17, 1.0)
        bg_node.inputs['Strength'].default_value = 0.3


def create_camera(angle_variant=0):
    """Create and position the camera with varied angles."""

    # Different camera positions for variety
    positions = [
        {"loc": (3.5, -3.5, 2.5), "angle": 45},   # Standard 3/4 view
        {"loc": (4.0, -2.5, 2.0), "angle": 32},   # More frontal
        {"loc": (2.5, -4.0, 3.0), "angle": 58},   # Higher angle, more side
        {"loc": (3.0, -3.0, 1.8), "angle": 45},   # Lower angle
        {"loc": (4.5, -3.0, 2.8), "angle": 35},   # Wider shot
    ]

    pos = positions[angle_variant % len(positions)]

    bpy.ops.object.camera_add(location=pos["loc"])
    camera = bpy.context.active_object
    camera.name = "ProductCamera"
    camera.rotation_euler = (math.radians(65), 0, math.radians(pos["angle"]))
    bpy.context.scene.camera = camera
    camera.data.lens = 85
    camera.data.dof.use_dof = True
    camera.data.dof.focus_distance = 4.5
    camera.data.dof.aperture_fstop = 2.8
    return camera


def create_product_material(color_name, metallic=0.5):
    """Create a material for the product."""
    color = COLORS.get(color_name, COLORS["silver"])
    mat = bpy.data.materials.new(name=f"ProductMaterial_{color_name}")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    principled = nodes.get('Principled BSDF')
    if principled:
        principled.inputs['Base Color'].default_value = color
        principled.inputs['Metallic'].default_value = metallic
        principled.inputs['Roughness'].default_value = 0.25 if metallic > 0.5 else 0.4
        principled.inputs['Specular IOR Level'].default_value = 0.5
    return mat


def import_and_render_stl(stl_path, output_path, settings):
    """Import an STL file and render it."""

    # Import STL
    bpy.ops.wm.stl_import(filepath=stl_path)
    obj = bpy.context.active_object

    if obj is None:
        print(f"Failed to import: {stl_path}")
        return False

    obj.name = "Product"

    # First, reset location to origin
    obj.location = (0, 0, 0)

    # Apply scale
    scale = settings.get("scale", 0.01)
    obj.scale = (scale, scale, scale)

    # Apply all transforms (location, rotation, scale) to make mesh data accurate
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # Update the scene
    bpy.context.view_layer.update()

    # Get mesh bounding box directly from mesh data (more reliable)
    mesh = obj.data
    verts = [v.co for v in mesh.vertices]
    if verts:
        min_z = min(v.z for v in verts)
        min_x = min(v.x for v in verts)
        max_x = max(v.x for v in verts)
        min_y = min(v.y for v in verts)
        max_y = max(v.y for v in verts)

        # Center X and Y, place bottom on desk surface
        center_x = (min_x + max_x) / 2
        center_y = (min_y + max_y) / 2

        # Move mesh so it's centered and sitting on the desk
        for v in mesh.vertices:
            v.co.x -= center_x
            v.co.y -= center_y
            v.co.z -= min_z

        mesh.update()

    # Position object slightly above desk (on the coaster area)
    obj.location = (0, 0, 0.02)  # Slight lift above desk surface

    # Apply rotation if specified
    rotation = settings.get("rotation", 0)
    if rotation != 0:
        obj.rotation_euler = (0, 0, math.radians(rotation))

    # Apply material
    color_name = settings.get("color", "silver")
    metallic = settings.get("metallic", 0.5)
    mat = create_product_material(color_name, metallic)

    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

    # Smooth shading
    bpy.ops.object.shade_smooth()

    # Adjust camera to frame object nicely
    camera = bpy.context.scene.camera
    if camera:
        dims = obj.dimensions
        max_dim = max(dims)
        # Calculate distance based on object size
        distance = max_dim * 2.5 + 1.5

        camera.location = (distance * 0.6, -distance * 0.6, distance * 0.4 + 0.5)

        # Point at object (slightly above center for better composition)
        target = obj.location.copy()
        target.z += max_dim * 0.2
        direction = target - camera.location
        rot_quat = direction.to_track_quat('-Z', 'Y')
        camera.rotation_euler = rot_quat.to_euler()

        camera.data.dof.focus_distance = direction.length

    # Render
    bpy.context.scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)

    # Remove the product object for next render
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.ops.object.delete()

    return True


def main():
    """Main rendering function."""

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Get list of STL files
    stl_files = [f for f in os.listdir(MODELS_DIR) if f.endswith('.stl')]

    # Skip component files (et2 parts, bases, etc.)
    skip_files = ['et2_head.stl', 'et2_body.stl', 'et2_left_arm.stl', 'et2_right_arm.stl',
                  'forest_goddess_base.stl', 'magic_lamp_base.stl', 'alien.stl']
    stl_files = [f for f in stl_files if f not in skip_files]

    print(f"\nFound {len(stl_files)} STL files to render")
    print(f"Output directory: {OUTPUT_DIR}\n")

    rendered = []

    for i, stl_file in enumerate(stl_files):
        stl_path = os.path.join(MODELS_DIR, stl_file)
        output_name = stl_file.replace('.stl', '_render.jpg')
        output_path = os.path.join(OUTPUT_DIR, output_name)

        # Get settings and cycle through environments sequentially for variety
        settings = MODEL_SETTINGS.get(stl_file, {"color": "silver", "scale": 0.01, "metallic": 0.5, "rotation": 0})
        env_style = ENVIRONMENTS[i % len(ENVIRONMENTS)]  # Sequential cycling

        print(f"Rendering: {stl_file}")
        print(f"  Color: {settings.get('color')}, Environment: {env_style['name']}")

        try:
            # Setup fresh scene for each render with varied environments
            clear_scene()
            setup_render_settings()
            create_desk_environment(env_style, prop_set=i % 5)  # Cycle through 5 prop sets
            create_lighting(lighting_variant=i)  # Varied lighting per render
            create_camera(angle_variant=i)  # Varied camera angles

            success = import_and_render_stl(stl_path, output_path, settings)
            if success:
                print(f"  Saved: {output_path}")
                rendered.append({
                    "model": stl_file,
                    "render": f"/images/products/renders/{output_name}"
                })
            else:
                print(f"  Failed!")
        except Exception as e:
            print(f"  Error: {e}")

    # Save manifest
    manifest_path = os.path.join(OUTPUT_DIR, "manifest.json")
    with open(manifest_path, 'w') as f:
        json.dump(rendered, f, indent=2)

    print(f"\nCompleted! Rendered {len(rendered)} images")
    print(f"Manifest saved to: {manifest_path}")


if __name__ == "__main__":
    main()
