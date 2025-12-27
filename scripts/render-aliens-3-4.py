#!/usr/bin/env python3
"""
Render Aliens 3 and 4 with raised camera, centered products, and darker grass green.

Usage:
    /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/render-aliens-3-4.py
"""

import bpy
import os
import math

# Configuration
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
MODELS_DIR = os.path.join(PROJECT_DIR, "public", "models")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "public", "images", "products", "renders")

# Render settings
RENDER_WIDTH = 1200
RENDER_HEIGHT = 1200
SAMPLES = 128

# Darker grass green color (reduced brightness for darker look)
DARK_GRASS_GREEN = (0.02, 0.22, 0.02, 1.0)  # Darker than original (0.05, 0.35, 0.05)


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


def create_desk_environment():
    """Create a dark desk environment that contrasts with green."""

    # Dark slate desk - good contrast with green
    desk_color = (0.08, 0.08, 0.10, 1.0)
    wall_color = (0.12, 0.12, 0.14, 1.0)

    # Create desk surface
    bpy.ops.mesh.primitive_plane_add(size=8, location=(0, 0, 0))
    desk = bpy.context.active_object
    desk.name = "Desk"
    desk_mat = create_material("DeskMaterial", desk_color, roughness=0.2, metallic=0.0)
    desk.data.materials.append(desk_mat)

    # Create backdrop wall
    bpy.ops.mesh.primitive_plane_add(size=10, location=(0, 3, 3))
    wall = bpy.context.active_object
    wall.name = "Wall"
    wall.rotation_euler = (math.radians(90), 0, 0)
    wall_mat = create_material("WallMaterial", wall_color, roughness=0.8, metallic=0.0)
    wall.data.materials.append(wall_mat)

    return desk, wall


def create_lighting_for_dark_green():
    """Create lighting optimized for darker green appearance."""

    # Key light - reduced energy and cooler tone to make green appear darker
    bpy.ops.object.light_add(type='AREA', location=(2.5, -2, 3.5))
    key_light = bpy.context.active_object
    key_light.name = "KeyLight"
    key_light.data.energy = 120  # Reduced from 200 for darker look
    key_light.data.size = 3
    key_light.data.color = (0.9, 0.95, 1.0)  # Slightly cool to make green less saturated
    key_light.rotation_euler = (math.radians(55), 0, math.radians(40))

    # Fill light - lower intensity
    bpy.ops.object.light_add(type='AREA', location=(-2, -1.5, 2))
    fill_light = bpy.context.active_object
    fill_light.name = "FillLight"
    fill_light.data.energy = 50  # Reduced for more contrast/shadow
    fill_light.data.size = 4
    fill_light.data.color = (0.95, 0.95, 1.0)
    fill_light.rotation_euler = (math.radians(50), 0, math.radians(-35))

    # Top light - subtle
    bpy.ops.object.light_add(type='AREA', location=(0, 0, 4))
    top_light = bpy.context.active_object
    top_light.name = "TopLight"
    top_light.data.energy = 40  # Reduced
    top_light.data.size = 5
    top_light.data.color = (1.0, 1.0, 1.0)
    top_light.rotation_euler = (0, 0, 0)

    # Rim light - subtle edge definition
    bpy.ops.object.light_add(type='AREA', location=(0, 2, 1.5))
    rim_light = bpy.context.active_object
    rim_light.name = "RimLight"
    rim_light.data.energy = 30
    rim_light.data.size = 2
    rim_light.data.color = (1.0, 1.0, 1.0)
    rim_light.rotation_euler = (math.radians(-100), 0, 0)

    # Dark world background
    world = bpy.context.scene.world
    if world is None:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    bg_node = nodes.get('Background')
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.08, 0.08, 0.10, 1.0)
        bg_node.inputs['Strength'].default_value = 0.2


def create_raised_centered_camera():
    """Create camera positioned higher to center product in frame."""

    # Raised camera position - higher Z, looking down more
    bpy.ops.object.camera_add(location=(2.8, -2.8, 4.0))  # Raised Z higher to 4.0
    camera = bpy.context.active_object
    camera.name = "ProductCamera"
    camera.rotation_euler = (math.radians(55), 0, math.radians(45))  # Steeper angle
    bpy.context.scene.camera = camera
    camera.data.lens = 85
    camera.data.dof.use_dof = True
    camera.data.dof.focus_distance = 4.0
    camera.data.dof.aperture_fstop = 2.8
    return camera


def create_dark_green_material():
    """Create a darker grass green material."""
    mat = bpy.data.materials.new(name="DarkGrassGreen")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    principled = nodes.get('Principled BSDF')
    if principled:
        principled.inputs['Base Color'].default_value = DARK_GRASS_GREEN
        principled.inputs['Metallic'].default_value = 0.25  # Slight metallic for PLA look
        principled.inputs['Roughness'].default_value = 0.4
        principled.inputs['Specular IOR Level'].default_value = 0.5
    return mat


def import_and_render_alien(stl_file):
    """Import and render an alien STL with centered framing."""

    stl_path = os.path.join(MODELS_DIR, stl_file)
    output_name = stl_file.replace('.stl', '_render.jpg')
    output_path = os.path.join(OUTPUT_DIR, output_name)

    # Import STL
    bpy.ops.wm.stl_import(filepath=stl_path)
    obj = bpy.context.active_object

    if obj is None:
        print(f"Failed to import: {stl_path}")
        return False

    obj.name = "Alien"

    # Reset and scale
    obj.location = (0, 0, 0)
    scale = 0.015
    obj.scale = (scale, scale, scale)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.context.view_layer.update()

    # Center the mesh
    mesh = obj.data
    verts = [v.co for v in mesh.vertices]
    if verts:
        min_z = min(v.z for v in verts)
        min_x = min(v.x for v in verts)
        max_x = max(v.x for v in verts)
        min_y = min(v.y for v in verts)
        max_y = max(v.y for v in verts)
        max_z = max(v.z for v in verts)

        center_x = (min_x + max_x) / 2
        center_y = (min_y + max_y) / 2

        for v in mesh.vertices:
            v.co.x -= center_x
            v.co.y -= center_y
            v.co.z -= min_z

        mesh.update()

        # Calculate height for camera adjustment
        height = max_z - min_z
        print(f"  Model height after scaling: {height:.3f} units")

    # Position on desk
    obj.location = (0, 0, 0.02)

    # Apply dark green material
    mat = create_dark_green_material()
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

    # Smooth shading
    bpy.ops.object.shade_smooth()

    # Adjust camera to center on object
    camera = bpy.context.scene.camera
    if camera:
        dims = obj.dimensions
        max_dim = max(dims)

        # Calculate camera distance based on object size
        distance = max_dim * 2.2 + 1.2

        # Position camera higher and centered on object
        camera.location = (distance * 0.55, -distance * 0.55, distance * 0.5 + 0.8)

        # Point at center of object (vertically centered)
        target = obj.location.copy()
        target.z += max_dim * 0.35  # Aim at mid-height of object
        direction = target - camera.location
        rot_quat = direction.to_track_quat('-Z', 'Y')
        camera.rotation_euler = rot_quat.to_euler()

        camera.data.dof.focus_distance = direction.length

    # Render
    bpy.context.scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)

    print(f"  Saved: {output_path}")

    # Cleanup
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.ops.object.delete()

    return True


def main():
    """Main function to render Aliens 3 and 4."""

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    aliens_to_render = ["Alien_3.stl", "Alien_4.stl"]

    print("\n" + "="*50)
    print("Rendering Aliens 3 and 4")
    print("- Raised camera for centered framing")
    print("- Dark grass green color")
    print("- Reduced lighting for darker appearance")
    print("="*50 + "\n")

    for alien in aliens_to_render:
        stl_path = os.path.join(MODELS_DIR, alien)

        if not os.path.exists(stl_path):
            print(f"SKIPPED: {alien} not found")
            continue

        print(f"Rendering: {alien}")

        try:
            clear_scene()
            setup_render_settings()
            create_desk_environment()
            create_lighting_for_dark_green()
            create_raised_centered_camera()

            success = import_and_render_alien(alien)
            if not success:
                print(f"  Failed!")
        except Exception as e:
            print(f"  Error: {e}")
            import traceback
            traceback.print_exc()

    print("\nDone!")


if __name__ == "__main__":
    main()
