#!/usr/bin/env python3
"""Render selected STL models - brain and aliens."""
import bpy
import os
import math
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
MODELS_DIR = os.path.join(PROJECT_DIR, "public", "models")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "public", "images", "products", "renders")

# Resolution
WIDTH = 1200
HEIGHT = 1200
SAMPLES = 128

# Colors
COLORS = {
    "silver": (0.91, 0.91, 0.91, 1.0),
    "white": (0.95, 0.95, 0.95, 1.0),
    "grass_green": (0.05, 0.35, 0.05, 1.0),  # Deep grass green
}

ENVIRONMENTS = [
    {"name": "dark_wood_desk", "desk_color": (0.15, 0.08, 0.04, 1.0), "desk_roughness": 0.4, "wall_color": (0.12, 0.10, 0.09, 1.0), "accent_color": (0.8, 0.6, 0.3, 1.0)},
    {"name": "slate_modern", "desk_color": (0.1, 0.1, 0.11, 1.0), "desk_roughness": 0.3, "wall_color": (0.15, 0.15, 0.17, 1.0), "accent_color": (0.7, 0.7, 0.75, 1.0)},
    {"name": "rich_mahogany", "desk_color": (0.2, 0.08, 0.05, 1.0), "desk_roughness": 0.35, "wall_color": (0.1, 0.08, 0.06, 1.0), "accent_color": (0.9, 0.7, 0.4, 1.0)},
    {"name": "concrete_industrial", "desk_color": (0.2, 0.2, 0.2, 1.0), "desk_roughness": 0.7, "wall_color": (0.18, 0.17, 0.17, 1.0), "accent_color": (0.6, 0.55, 0.5, 1.0)},
    {"name": "black_glass", "desk_color": (0.02, 0.02, 0.02, 1.0), "desk_roughness": 0.05, "wall_color": (0.10, 0.10, 0.12, 1.0), "accent_color": (0.9, 0.85, 0.7, 1.0)},
]

# Models to re-render
MODELS_TO_RENDER = [
    {"file": "brain.stl", "color": "white", "scale": 0.01, "metallic": 0.0, "rotation": 0},
    {"file": "Alien_1.stl", "color": "grass_green", "scale": 0.015, "metallic": 0.3, "rotation": 0},
    {"file": "Alien_2.stl", "color": "grass_green", "scale": 0.015, "metallic": 0.3, "rotation": 0},
    {"file": "Alien_3.stl", "color": "grass_green", "scale": 0.015, "metallic": 0.3, "rotation": 0},
    {"file": "Alien_4.stl", "color": "grass_green", "scale": 0.015, "metallic": 0.3, "rotation": 0},
    {"file": "forest_goddess.stl", "color": "grass_green", "scale": 0.012, "metallic": 0.0, "rotation": 0},
]


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)


def setup_render_settings():
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.device = 'CPU'
    scene.cycles.samples = SAMPLES
    scene.cycles.use_denoising = True
    scene.render.resolution_x = WIDTH
    scene.render.resolution_y = HEIGHT
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'JPEG'
    scene.render.image_settings.quality = 95


def create_material(name, color, roughness=0.5, metallic=0.0):
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
    bpy.ops.mesh.primitive_plane_add(size=8, location=(0, 0, 0))
    desk = bpy.context.active_object
    desk.name = "Desk"
    desk_mat = create_material("DeskMaterial", env_style["desk_color"], roughness=env_style["desk_roughness"])
    desk.data.materials.append(desk_mat)
    
    bpy.ops.mesh.primitive_plane_add(size=10, location=(0, 3, 3))
    wall = bpy.context.active_object
    wall.name = "Wall"
    wall.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.modifier_add(type='SUBSURF')
    wall.modifiers["Subdivision"].levels = 3
    wall_mat = create_material("WallMaterial", env_style["wall_color"], roughness=0.8)
    wall.data.materials.append(wall_mat)


def create_lighting(lighting_variant=0):
    setups = [
        {"key_pos": (2, -2, 3), "key_energy": 200, "key_angle": 40, "fill_energy": 100, "warm": True},
        {"key_pos": (3, -1.5, 2.5), "key_energy": 180, "key_angle": 25, "fill_energy": 120, "warm": False},
        {"key_pos": (1.5, -2.5, 3.5), "key_energy": 220, "key_angle": 55, "fill_energy": 80, "warm": True},
        {"key_pos": (2.5, -2, 2), "key_energy": 160, "key_angle": 35, "fill_energy": 140, "warm": False},
        {"key_pos": (2, -3, 3), "key_energy": 190, "key_angle": 50, "fill_energy": 90, "warm": True},
    ]
    setup = setups[lighting_variant % len(setups)]
    
    bpy.ops.object.light_add(type='AREA', location=setup["key_pos"])
    key_light = bpy.context.active_object
    key_light.data.energy = setup["key_energy"]
    key_light.data.size = 4
    key_light.data.color = (1.0, 0.95, 0.9) if setup["warm"] else (0.95, 0.98, 1.0)
    key_light.rotation_euler = (math.radians(50), 0, math.radians(setup["key_angle"]))
    
    bpy.ops.object.light_add(type='AREA', location=(-2.5, -1, 2.5))
    fill_light = bpy.context.active_object
    fill_light.data.energy = setup["fill_energy"]
    fill_light.data.size = 5
    fill_light.rotation_euler = (math.radians(45), 0, math.radians(-40))
    
    bpy.ops.object.light_add(type='AREA', location=(0, 0, 4))
    top_light = bpy.context.active_object
    top_light.data.energy = 80
    top_light.data.size = 6
    
    bpy.ops.object.light_add(type='AREA', location=(0, 2.5, 1.5))
    rim_light = bpy.context.active_object
    rim_light.data.energy = 50
    rim_light.data.size = 2
    rim_light.rotation_euler = (math.radians(-100), 0, 0)
    
    world = bpy.context.scene.world
    if world is None:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get('Background')
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.15, 0.15, 0.17, 1.0)
        bg_node.inputs['Strength'].default_value = 0.3


def create_camera(angle_variant=0):
    positions = [
        {"loc": (3.5, -3.5, 2.5), "angle": 45},
        {"loc": (4.0, -2.5, 2.0), "angle": 32},
        {"loc": (2.5, -4.0, 3.0), "angle": 58},
        {"loc": (3.0, -3.0, 1.8), "angle": 45},
        {"loc": (4.5, -3.0, 2.8), "angle": 35},
    ]
    pos = positions[angle_variant % len(positions)]
    bpy.ops.object.camera_add(location=pos["loc"])
    camera = bpy.context.active_object
    camera.rotation_euler = (math.radians(65), 0, math.radians(pos["angle"]))
    bpy.context.scene.camera = camera
    camera.data.lens = 85
    camera.data.dof.use_dof = True
    camera.data.dof.focus_distance = 4.5
    camera.data.dof.aperture_fstop = 2.8


def create_product_material(color_name, metallic):
    color = COLORS.get(color_name, COLORS["white"])
    mat = bpy.data.materials.new(name="ProductMaterial")
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
    bpy.ops.wm.stl_import(filepath=stl_path)
    obj = bpy.context.active_object
    if obj is None:
        print(f"Failed to import: {stl_path}")
        return False
    
    obj.name = "Product"
    obj.location = (0, 0, 0)
    
    scale = settings.get("scale", 0.01)
    obj.scale = (scale, scale, scale)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.context.view_layer.update()
    
    mesh = obj.data
    verts = [v.co for v in mesh.vertices]
    if verts:
        min_z = min(v.z for v in verts)
        min_x = min(v.x for v in verts)
        max_x = max(v.x for v in verts)
        min_y = min(v.y for v in verts)
        max_y = max(v.y for v in verts)
        center_x = (min_x + max_x) / 2
        center_y = (min_y + max_y) / 2
        for v in mesh.vertices:
            v.co.x -= center_x
            v.co.y -= center_y
            v.co.z -= min_z
        mesh.update()
    
    obj.location = (0, 0, 0.02)
    
    rotation = settings.get("rotation", 0)
    if rotation != 0:
        obj.rotation_euler = (0, 0, math.radians(rotation))
    
    color_name = settings.get("color", "white")
    metallic = settings.get("metallic", 0.5)
    mat = create_product_material(color_name, metallic)
    
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    
    bpy.context.scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)
    return True


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"\nRe-rendering {len(MODELS_TO_RENDER)} models...")
    
    for i, model_info in enumerate(MODELS_TO_RENDER):
        stl_file = model_info["file"]
        stl_path = os.path.join(MODELS_DIR, stl_file)
        output_name = stl_file.replace('.stl', '_render.jpg')
        output_path = os.path.join(OUTPUT_DIR, output_name)
        
        env_style = ENVIRONMENTS[i % len(ENVIRONMENTS)]
        
        print(f"Rendering: {stl_file} (color: {model_info['color']})")
        
        clear_scene()
        setup_render_settings()
        create_desk_environment(env_style, prop_set=i % 5)
        create_lighting(lighting_variant=i)
        create_camera(angle_variant=i)
        
        success = import_and_render_stl(stl_path, output_path, model_info)
        if success:
            print(f"  Saved: {output_path}")
        else:
            print(f"  Failed!")
    
    print("\nDone!")


if __name__ == "__main__":
    main()
