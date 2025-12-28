#!/usr/bin/env python3
"""
Blender script to create rotating STL animation with color cycling
Run with: /Applications/Blender.app/Contents/MacOS/Blender --background --python this_script.py
"""

import bpy
import os
import math

# Paths - using iCloud synced project
STL_PATH = os.path.expanduser("~/Desktop/STLs/Alien_1.stl")
ICLOUD_PROJECT = os.path.expanduser("~/Library/Mobile Documents/com~apple~CloudDocs/Claude/cloudsculptordesigns")
OUTPUT_DIR = os.path.join(ICLOUD_PROJECT, "public/images/products")
OUTPUT_MP4 = os.path.join(OUTPUT_DIR, "alien-rotating.mp4")

# Animation settings
FPS = 30
SECONDS_PER_COLOR = 1  # Reduced for faster render
FRAMES_PER_COLOR = FPS * SECONDS_PER_COLOR  # 30 frames
IMAGE_SIZE = 512

# 24 Popular filament colors (RGB 0-1)
COLORS = [
    (0.96, 0.96, 0.96),  # white
    (0.12, 0.12, 0.12),  # black
    (0.5, 0.5, 0.5),     # gray
    (0.75, 0.75, 0.78),  # silver
    (0.86, 0.16, 0.16),  # red
    (0.55, 0.0, 0.0),    # dark red
    (1.0, 0.55, 0.0),    # orange
    (1.0, 0.86, 0.0),    # yellow
    (0.2, 0.8, 0.2),     # lime green
    (0.13, 0.55, 0.13),  # forest green
    (0.0, 0.5, 0.5),     # teal
    (0.53, 0.81, 0.92),  # light blue
    (0.12, 0.35, 0.78),  # blue
    (0.0, 0.0, 0.5),     # navy
    (0.5, 0.0, 0.5),     # purple
    (1.0, 0.41, 0.71),   # pink
    (1.0, 0.0, 0.56),    # magenta
    (1.0, 0.84, 0.0),    # gold
    (0.8, 0.5, 0.2),     # bronze
    (0.72, 0.45, 0.2),   # copper
    (0.55, 0.35, 0.17),  # brown
    (0.96, 0.87, 0.7),   # beige
    (0.22, 1.0, 0.08),   # glow green
    (0.33, 0.42, 0.18),  # olive
]

BACKGROUND_COLOR = (0.086, 0.11, 0.16, 1.0)  # #161c29

def setup_scene():
    """Set up the Blender scene"""
    # Clear existing objects
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Set background color
    bpy.context.scene.world.use_nodes = True
    bg_node = bpy.context.scene.world.node_tree.nodes.get('Background')
    if bg_node:
        bg_node.inputs[0].default_value = BACKGROUND_COLOR

    # Set render settings
    scene = bpy.context.scene
    scene.render.resolution_x = IMAGE_SIZE
    scene.render.resolution_y = IMAGE_SIZE
    scene.render.film_transparent = False
    scene.render.fps = FPS

    # Use Eevee for speed with optimized settings
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.eevee.taa_render_samples = 16  # Reduce samples for speed
    scene.eevee.use_gtao = False  # Disable ambient occlusion
    scene.eevee.use_bloom = False  # Disable bloom
    scene.eevee.use_ssr = False  # Disable screen space reflections

    # Output settings for MP4
    scene.render.image_settings.file_format = 'FFMPEG'
    scene.render.ffmpeg.format = 'MPEG4'
    scene.render.ffmpeg.codec = 'H264'
    scene.render.ffmpeg.constant_rate_factor = 'MEDIUM'
    scene.render.filepath = OUTPUT_MP4

def import_stl():
    """Import and prepare the STL model"""
    print(f"Importing {STL_PATH}...")
    bpy.ops.wm.stl_import(filepath=STL_PATH)

    obj = bpy.context.selected_objects[0]
    obj.name = "Alien"

    # Decimate for faster rendering
    print("Decimating mesh for faster render...")
    decimate = obj.modifiers.new(name="Decimate", type='DECIMATE')
    decimate.ratio = 0.1  # Reduce to 10% of original faces
    bpy.ops.object.modifier_apply(modifier="Decimate")
    print(f"Mesh now has {len(obj.data.polygons)} faces")

    # Center the object
    bpy.ops.object.origin_set(type='ORIGIN_CENTER_OF_MASS')
    obj.location = (0, 0, 0)

    # Scale to fit
    max_dim = max(obj.dimensions)
    scale_factor = 2.0 / max_dim
    obj.scale = (scale_factor, scale_factor, scale_factor)
    bpy.ops.object.transform_apply(scale=True)

    # Rotate upright (STL is often Y-up, Blender is Z-up)
    obj.rotation_euler = (math.radians(-90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)

    # Smooth shading
    bpy.ops.object.shade_smooth()

    return obj

def setup_camera():
    """Set up camera"""
    bpy.ops.object.camera_add(location=(0, -4, 0))
    camera = bpy.context.object
    camera.rotation_euler = (math.radians(90), 0, 0)
    bpy.context.scene.camera = camera
    return camera

def setup_lighting():
    """Set up three-point lighting"""
    # Key light
    bpy.ops.object.light_add(type='AREA', location=(3, -2, 3))
    key = bpy.context.object
    key.data.energy = 200
    key.data.size = 2

    # Fill light
    bpy.ops.object.light_add(type='AREA', location=(-3, -2, 2))
    fill = bpy.context.object
    fill.data.energy = 100
    fill.data.size = 3

    # Rim light
    bpy.ops.object.light_add(type='AREA', location=(0, 3, 2))
    rim = bpy.context.object
    rim.data.energy = 80
    rim.data.size = 2

def create_material():
    """Create a material that can change color via keyframes"""
    mat = bpy.data.materials.new(name="FilamentColor")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()

    # Create Principled BSDF
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    bsdf.inputs['Roughness'].default_value = 0.4
    bsdf.inputs['Metallic'].default_value = 0.0

    # Create output node
    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (300, 0)

    # Connect
    mat.node_tree.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    return mat, bsdf

def main():
    print("=== Alien Video Creator (Blender) ===\n")

    setup_scene()
    obj = import_stl()
    setup_camera()
    setup_lighting()

    # Create and assign material
    mat, bsdf = create_material()
    obj.data.materials.clear()
    obj.data.materials.append(mat)

    # Calculate total frames
    total_frames = len(COLORS) * FRAMES_PER_COLOR
    bpy.context.scene.frame_start = 1
    bpy.context.scene.frame_end = total_frames

    print(f"\nAnimating {total_frames} frames ({len(COLORS)} colors × {FRAMES_PER_COLOR} frames)...")

    # Set up keyframes for rotation and color
    for color_idx, color in enumerate(COLORS):
        start_frame = color_idx * FRAMES_PER_COLOR + 1
        end_frame = start_frame + FRAMES_PER_COLOR - 1

        print(f"Color {color_idx + 1}/{len(COLORS)}: RGB({color[0]:.2f}, {color[1]:.2f}, {color[2]:.2f}) - frames {start_frame}-{end_frame}")

        # Set color at start of this segment
        bpy.context.scene.frame_set(start_frame)
        bsdf.inputs['Base Color'].default_value = (color[0], color[1], color[2], 1.0)
        bsdf.inputs['Base Color'].keyframe_insert(data_path="default_value", frame=start_frame)

        # Keep same color until end of segment
        bsdf.inputs['Base Color'].keyframe_insert(data_path="default_value", frame=end_frame)

        # Set rotation keyframes - full 360° rotation per color
        obj.rotation_euler = (0, 0, 0)
        obj.keyframe_insert(data_path="rotation_euler", frame=start_frame)
        obj.rotation_euler = (0, 0, math.radians(360))
        obj.keyframe_insert(data_path="rotation_euler", frame=end_frame)

    # Make color changes instant (constant interpolation)
    for fc in mat.node_tree.animation_data.action.fcurves:
        for kf in fc.keyframe_points:
            kf.interpolation = 'CONSTANT'

    # Make rotation linear
    for fc in obj.animation_data.action.fcurves:
        for kf in fc.keyframe_points:
            kf.interpolation = 'LINEAR'

    # Render animation
    print(f"\nRendering to {OUTPUT_MP4}...")
    bpy.ops.render.render(animation=True)

    # Get file size
    if os.path.exists(OUTPUT_MP4):
        size_mb = os.path.getsize(OUTPUT_MP4) / (1024 * 1024)
        print(f"\nOutput: {OUTPUT_MP4}")
        print(f"Size: {size_mb:.2f} MB")
    print("\nDone!")

if __name__ == "__main__":
    main()
