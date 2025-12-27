#!/usr/bin/env python3
"""Re-render Alien 3 and 4 with fixed positioning."""
import bpy
import os
import math

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
MODELS_DIR = os.path.join(PROJECT_DIR, "public", "models")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "public", "images", "products", "renders")

WIDTH = 1200
HEIGHT = 1200
SAMPLES = 128

COLORS = {
    "grass_green": (0.05, 0.35, 0.05, 1.0),
}

ENVIRONMENT = {
    "name": "slate_modern",
    "desk_color": (0.1, 0.1, 0.11, 1.0),
    "desk_roughness": 0.3,
    "wall_color": (0.15, 0.15, 0.17, 1.0),
}


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


def create_desk_environment():
    bpy.ops.mesh.primitive_plane_add(size=8, location=(0, 0, 0))
    desk = bpy.context.active_object
    desk.name = "Desk"
    desk_mat = create_material("DeskMaterial", ENVIRONMENT["desk_color"], roughness=ENVIRONMENT["desk_roughness"])
    desk.data.materials.append(desk_mat)
    
    bpy.ops.mesh.primitive_plane_add(size=10, location=(0, 3, 3))
    wall = bpy.context.active_object
    wall.name = "Wall"
    wall.rotation_euler = (math.radians(90), 0, 0)
    wall_mat = create_material("WallMaterial", ENVIRONMENT["wall_color"], roughness=0.8)
    wall.data.materials.append(wall_mat)


def create_lighting():
    # Key light - brighter for aliens
    bpy.ops.object.light_add(type='AREA', location=(2, -2, 3))
    key_light = bpy.context.active_object
    key_light.data.energy = 250
    key_light.data.size = 4
    key_light.data.color = (1.0, 0.95, 0.9)
    key_light.rotation_euler = (math.radians(50), 0, math.radians(40))
    
    # Fill light
    bpy.ops.object.light_add(type='AREA', location=(-2.5, -1, 2.5))
    fill_light = bpy.context.active_object
    fill_light.data.energy = 150
    fill_light.data.size = 5
    fill_light.rotation_euler = (math.radians(45), 0, math.radians(-40))
    
    # Top light
    bpy.ops.object.light_add(type='AREA', location=(0, 0, 4))
    top_light = bpy.context.active_object
    top_light.data.energy = 100
    top_light.data.size = 6
    
    # World
    world = bpy.context.scene.world
    if world is None:
        world = bpy.data.worlds.new("World")
        bpy.context.scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get('Background')
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.15, 0.15, 0.17, 1.0)
        bg_node.inputs['Strength'].default_value = 0.3


def create_camera():
    # Camera positioned to capture full figure - closer and lower
    bpy.ops.object.camera_add(location=(2.0, -2.0, 1.2))
    camera = bpy.context.active_object
    camera.rotation_euler = (math.radians(75), 0, math.radians(45))
    bpy.context.scene.camera = camera
    camera.data.lens = 50  # Wider lens to capture more
    camera.data.dof.use_dof = True
    camera.data.dof.focus_distance = 2.5
    camera.data.dof.aperture_fstop = 4.0


def render_alien(stl_file, output_path):
    """Import and render an alien STL."""
    stl_path = os.path.join(MODELS_DIR, stl_file)
    
    bpy.ops.wm.stl_import(filepath=stl_path)
    obj = bpy.context.active_object
    
    if obj is None:
        print(f"Failed to import: {stl_path}")
        return False
    
    obj.name = "Alien"
    obj.location = (0, 0, 0)
    
    # Scale - aliens are about 4" tall
    scale = 0.015
    obj.scale = (scale, scale, scale)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.context.view_layer.update()
    
    # Center and place on desk
    mesh = obj.data
    verts = [v.co for v in mesh.vertices]
    if verts:
        min_z = min(v.z for v in verts)
        max_z = max(v.z for v in verts)
        min_x = min(v.x for v in verts)
        max_x = max(v.x for v in verts)
        min_y = min(v.y for v in verts)
        max_y = max(v.y for v in verts)
        
        center_x = (min_x + max_x) / 2
        center_y = (min_y + max_y) / 2
        height = max_z - min_z
        
        print(f"  Model height: {height:.3f}m, bounds: x({min_x:.3f}, {max_x:.3f}), y({min_y:.3f}, {max_y:.3f}), z({min_z:.3f}, {max_z:.3f})")
        
        for v in mesh.vertices:
            v.co.x -= center_x
            v.co.y -= center_y
            v.co.z -= min_z  # Place bottom at z=0
        
        mesh.update()
    
    # Position on desk
    obj.location = (0, 0, 0.01)
    
    # Apply grass green material
    color = COLORS["grass_green"]
    mat = bpy.data.materials.new(name="AlienMaterial")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    principled = nodes.get('Principled BSDF')
    if principled:
        principled.inputs['Base Color'].default_value = color
        principled.inputs['Metallic'].default_value = 0.3
        principled.inputs['Roughness'].default_value = 0.35
    
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    
    # Render
    bpy.context.scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)
    return True


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    aliens = [
        ("Alien_3.stl", "Alien_3_render.jpg"),
        ("Alien_4.stl", "Alien_4_render.jpg"),
    ]
    
    for stl_file, output_name in aliens:
        output_path = os.path.join(OUTPUT_DIR, output_name)
        print(f"\nRendering: {stl_file}")
        
        clear_scene()
        setup_render_settings()
        create_desk_environment()
        create_lighting()
        create_camera()
        
        success = render_alien(stl_file, output_path)
        if success:
            print(f"  Saved: {output_path}")
        else:
            print(f"  Failed!")
    
    print("\nDone!")


if __name__ == "__main__":
    main()
