#!/usr/bin/env python3
"""
Viral Marketing Video Creator for Cloud Sculptor Designs
Creates stunning TikTok/Instagram-ready videos with:
- Neon glow effects
- Smooth color transitions
- Dynamic camera movement
- Particle effects
- Brand text overlays

Run with: /Applications/Blender.app/Contents/MacOS/Blender --background --python this_script.py
"""

import bpy
import os
import math
import random

# Paths
STL_PATH = os.path.expanduser("~/Desktop/STLs/Alien_1.stl")
OUTPUT_DIR = os.path.expanduser("~/cloudsculptordesigns/public/videos")

# Create output directory
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Video settings
FPS = 30
DURATION_SECONDS = 15  # Sweet spot for TikTok/Reels
TOTAL_FRAMES = FPS * DURATION_SECONDS

# Resolution presets
RESOLUTIONS = {
    'vertical': (1080, 1920),   # 9:16 for TikTok, Reels, Shorts
    'square': (1080, 1080),     # 1:1 for Instagram feed, Facebook
}

# Brand colors
BRAND_DARK = (0.086, 0.11, 0.16)      # #161c29
BRAND_MID = (0.118, 0.153, 0.224)     # #1e2739
BRAND_ACCENT = (0.29, 0.62, 0.83)     # #4A9FD4

# Rainbow color sequence for smooth transitions
RAINBOW_COLORS = [
    (1.0, 0.2, 0.2),    # Red
    (1.0, 0.5, 0.0),    # Orange
    (1.0, 1.0, 0.0),    # Yellow
    (0.2, 1.0, 0.2),    # Green
    (0.0, 0.8, 1.0),    # Cyan
    (0.3, 0.3, 1.0),    # Blue
    (0.8, 0.2, 1.0),    # Purple
    (1.0, 0.3, 0.6),    # Pink
    (1.0, 0.2, 0.2),    # Back to Red (loop)
]

def clear_scene():
    """Clear all objects from scene"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    # Clear all materials
    for mat in bpy.data.materials:
        bpy.data.materials.remove(mat)

def setup_render_settings(width, height):
    """Configure render settings for high quality social media video"""
    scene = bpy.context.scene

    # Resolution
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100

    # Frame range
    scene.frame_start = 1
    scene.frame_end = TOTAL_FRAMES
    scene.render.fps = FPS

    # Use Eevee for speed with quality settings
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.eevee.taa_render_samples = 32

    # Enable bloom for glow effect
    scene.eevee.use_bloom = True
    scene.eevee.bloom_threshold = 0.8
    scene.eevee.bloom_intensity = 0.5
    scene.eevee.bloom_radius = 6.0

    # Output settings
    scene.render.image_settings.file_format = 'FFMPEG'
    scene.render.ffmpeg.format = 'MPEG4'
    scene.render.ffmpeg.codec = 'H264'
    scene.render.ffmpeg.constant_rate_factor = 'HIGH'
    scene.render.ffmpeg.ffmpeg_preset = 'GOOD'

def setup_world():
    """Create atmospheric background"""
    world = bpy.context.scene.world
    world.use_nodes = True
    nodes = world.node_tree.nodes
    links = world.node_tree.links
    nodes.clear()

    # Create gradient background
    output = nodes.new('ShaderNodeOutputWorld')
    output.location = (300, 0)

    background = nodes.new('ShaderNodeBackground')
    background.location = (0, 0)

    # Gradient from dark blue to slightly lighter
    gradient = nodes.new('ShaderNodeTexGradient')
    gradient.gradient_type = 'SPHERICAL'
    gradient.location = (-400, 0)

    color_ramp = nodes.new('ShaderNodeValToRGB')
    color_ramp.location = (-200, 0)
    color_ramp.color_ramp.elements[0].color = (BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2], 1)
    color_ramp.color_ramp.elements[1].color = (BRAND_MID[0], BRAND_MID[1], BRAND_MID[2], 1)

    links.new(gradient.outputs['Fac'], color_ramp.inputs['Fac'])
    links.new(color_ramp.outputs['Color'], background.inputs['Color'])
    links.new(background.outputs['Background'], output.inputs['Surface'])

    background.inputs['Strength'].default_value = 1.0

def import_and_setup_model():
    """Import STL and set up with emissive material"""
    print(f"Importing {STL_PATH}...")
    bpy.ops.wm.stl_import(filepath=STL_PATH)

    obj = bpy.context.selected_objects[0]
    obj.name = "Alien"

    # Decimate for performance (keep more detail than before)
    decimate = obj.modifiers.new(name="Decimate", type='DECIMATE')
    decimate.ratio = 0.2  # Keep 20% for better quality
    bpy.ops.object.modifier_apply(modifier="Decimate")

    # Center and scale
    bpy.ops.object.origin_set(type='ORIGIN_CENTER_OF_MASS')
    obj.location = (0, 0, 0)

    max_dim = max(obj.dimensions)
    scale_factor = 2.0 / max_dim
    obj.scale = (scale_factor, scale_factor, scale_factor)
    bpy.ops.object.transform_apply(scale=True)

    # Rotate upright
    obj.rotation_euler = (math.radians(-90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)

    # Smooth shading
    bpy.ops.object.shade_smooth()

    # Create glowing material
    mat = bpy.data.materials.new(name="GlowMaterial")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    # Principled BSDF for base
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 200)
    bsdf.inputs['Roughness'].default_value = 0.3
    bsdf.inputs['Metallic'].default_value = 0.1

    # Emission for glow
    emission = nodes.new('ShaderNodeEmission')
    emission.location = (0, 0)
    emission.inputs['Strength'].default_value = 0.3

    # Mix shader
    mix = nodes.new('ShaderNodeMixShader')
    mix.location = (200, 100)
    mix.inputs['Fac'].default_value = 0.3

    # Output
    output = nodes.new('ShaderNodeOutputMaterial')
    output.location = (400, 100)

    links.new(bsdf.outputs['BSDF'], mix.inputs[1])
    links.new(emission.outputs['Emission'], mix.inputs[2])
    links.new(mix.outputs['Shader'], output.inputs['Surface'])

    obj.data.materials.clear()
    obj.data.materials.append(mat)

    return obj, mat

def setup_camera():
    """Create orbiting camera"""
    # Create camera
    bpy.ops.object.camera_add(location=(0, -5, 1))
    camera = bpy.context.object
    camera.name = "MainCamera"
    bpy.context.scene.camera = camera

    # Create empty for camera to track
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
    target = bpy.context.object
    target.name = "CameraTarget"

    # Add Track To constraint
    track = camera.constraints.new(type='TRACK_TO')
    track.target = target
    track.track_axis = 'TRACK_NEGATIVE_Z'
    track.up_axis = 'UP_Y'

    # Animate camera orbit
    camera.location = (0, -5, 1)
    camera.keyframe_insert(data_path="location", frame=1)

    # Orbit around
    for i, frame in enumerate([1, TOTAL_FRAMES//4, TOTAL_FRAMES//2, 3*TOTAL_FRAMES//4, TOTAL_FRAMES]):
        angle = (i / 4) * 2 * math.pi
        radius = 5 + math.sin(angle * 2) * 0.5  # Slight zoom in/out
        camera.location = (
            math.sin(angle) * radius,
            -math.cos(angle) * radius,
            1 + math.sin(angle * 3) * 0.3  # Slight height variation
        )
        camera.keyframe_insert(data_path="location", frame=frame)

    # Smooth camera motion
    if camera.animation_data and camera.animation_data.action:
        for fc in camera.animation_data.action.fcurves:
            for kf in fc.keyframe_points:
                kf.interpolation = 'BEZIER'
                kf.handle_left_type = 'AUTO'
                kf.handle_right_type = 'AUTO'

    return camera

def setup_lighting():
    """Create dramatic three-point lighting with colored accents"""
    # Key light (warm)
    bpy.ops.object.light_add(type='AREA', location=(3, -2, 4))
    key = bpy.context.object
    key.name = "KeyLight"
    key.data.energy = 300
    key.data.size = 3
    key.data.color = (1.0, 0.95, 0.9)

    # Fill light (cool blue - brand accent)
    bpy.ops.object.light_add(type='AREA', location=(-4, -1, 2))
    fill = bpy.context.object
    fill.name = "FillLight"
    fill.data.energy = 150
    fill.data.size = 4
    fill.data.color = BRAND_ACCENT

    # Rim light (white)
    bpy.ops.object.light_add(type='AREA', location=(0, 4, 3))
    rim = bpy.context.object
    rim.name = "RimLight"
    rim.data.energy = 200
    rim.data.size = 2
    rim.data.color = (1.0, 1.0, 1.0)

    # Bottom accent light (for drama)
    bpy.ops.object.light_add(type='POINT', location=(0, 0, -2))
    bottom = bpy.context.object
    bottom.name = "BottomLight"
    bottom.data.energy = 50
    bottom.data.color = (0.8, 0.2, 1.0)  # Purple accent

def animate_color(material):
    """Animate smooth rainbow color transitions"""
    nodes = material.node_tree.nodes

    bsdf = None
    emission = None
    for node in nodes:
        if node.type == 'BSDF_PRINCIPLED':
            bsdf = node
        elif node.type == 'EMISSION':
            emission = node

    if not bsdf or not emission:
        return

    # Calculate frames per color
    num_colors = len(RAINBOW_COLORS)
    frames_per_color = TOTAL_FRAMES // (num_colors - 1)

    for i, color in enumerate(RAINBOW_COLORS):
        frame = i * frames_per_color + 1
        if frame > TOTAL_FRAMES:
            frame = TOTAL_FRAMES

        # Set base color
        bsdf.inputs['Base Color'].default_value = (color[0], color[1], color[2], 1.0)
        bsdf.inputs['Base Color'].keyframe_insert(data_path="default_value", frame=frame)

        # Set emission color
        emission.inputs['Color'].default_value = (color[0], color[1], color[2], 1.0)
        emission.inputs['Color'].keyframe_insert(data_path="default_value", frame=frame)

    # Make color transitions smooth
    if material.node_tree.animation_data and material.node_tree.animation_data.action:
        for fc in material.node_tree.animation_data.action.fcurves:
            for kf in fc.keyframe_points:
                kf.interpolation = 'BEZIER'

def animate_rotation(obj):
    """Animate model rotation"""
    obj.rotation_euler = (0, 0, 0)
    obj.keyframe_insert(data_path="rotation_euler", frame=1)

    # Multiple full rotations
    obj.rotation_euler = (0, 0, math.radians(360 * 3))  # 3 full rotations
    obj.keyframe_insert(data_path="rotation_euler", frame=TOTAL_FRAMES)

    # Linear rotation
    if obj.animation_data and obj.animation_data.action:
        for fc in obj.animation_data.action.fcurves:
            for kf in fc.keyframe_points:
                kf.interpolation = 'LINEAR'

def add_particles(obj):
    """Add sparkle particle system"""
    # Create particle system
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.particle_system_add()

    ps = obj.particle_systems[0]
    ps.name = "Sparkles"

    settings = ps.settings
    settings.count = 100
    settings.lifetime = 50
    settings.emit_from = 'FACE'
    settings.physics_type = 'NO'

    # Make particles small glowing points
    settings.particle_size = 0.02
    settings.size_random = 0.5

    # Emission over time
    settings.frame_start = 1
    settings.frame_end = TOTAL_FRAMES

def add_text_overlay(text, location, size=0.3):
    """Add 3D text to scene"""
    bpy.ops.object.text_add(location=location)
    text_obj = bpy.context.object
    text_obj.data.body = text
    text_obj.data.size = size
    text_obj.data.align_x = 'CENTER'

    # Extrude for 3D look
    text_obj.data.extrude = 0.02

    # Create glowing material for text
    mat = bpy.data.materials.new(name=f"TextMaterial_{text[:10]}")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get('Principled BSDF')
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (1, 1, 1, 1)
        bsdf.inputs['Emission Color'].default_value = (1, 1, 1, 1)
        bsdf.inputs['Emission Strength'].default_value = 2.0

    text_obj.data.materials.append(mat)

    # Face camera
    text_obj.rotation_euler = (math.radians(90), 0, 0)

    return text_obj

def render_video(name, width, height):
    """Render the video at specified resolution"""
    setup_render_settings(width, height)

    output_path = os.path.join(OUTPUT_DIR, f"alien-viral-{name}.mp4")
    bpy.context.scene.render.filepath = output_path

    print(f"\nRendering {name} version ({width}x{height})...")
    print(f"Output: {output_path}")
    print(f"Frames: {TOTAL_FRAMES} ({DURATION_SECONDS}s at {FPS}fps)")

    bpy.ops.render.render(animation=True)

    if os.path.exists(output_path):
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"Created: {output_path} ({size_mb:.2f} MB)")

    return output_path

def main():
    print("=" * 50)
    print("Cloud Sculptor Designs - Viral Video Creator")
    print("=" * 50)

    clear_scene()
    setup_world()

    obj, material = import_and_setup_model()
    setup_camera()
    setup_lighting()

    animate_color(material)
    animate_rotation(obj)

    # Add subtle particles (optional - can be slow)
    # add_particles(obj)

    # Render both versions
    outputs = []
    for name, (width, height) in RESOLUTIONS.items():
        output = render_video(name, width, height)
        outputs.append(output)

    print("\n" + "=" * 50)
    print("DONE! Created videos:")
    for output in outputs:
        print(f"  - {output}")
    print("\nNext steps:")
    print("1. Upload to TikTok/Instagram")
    print("2. Add trending sound in the app")
    print("3. Add text: 'Link in bio' or your Etsy URL")
    print("=" * 50)

if __name__ == "__main__":
    main()
