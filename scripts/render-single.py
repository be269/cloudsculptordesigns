#!/usr/bin/env python3
"""Render a single STL model."""
import bpy
import os
import math

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
MODELS_DIR = os.path.join(PROJECT_DIR, "public", "models")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "public", "images", "products", "renders")

# Import functions from main script
exec(open(os.path.join(SCRIPT_DIR, "render-products.py")).read())

# Re-render just brain.stl
stl_file = "brain.stl"
stl_path = os.path.join(MODELS_DIR, stl_file)
output_path = os.path.join(OUTPUT_DIR, "brain_render.jpg")

settings = {"color": "white", "scale": 0.01, "metallic": 0.0, "rotation": 0}
env_style = ENVIRONMENTS[4]  # Use one of the dark environments

print(f"Re-rendering: {stl_file} with rotation: 0")

clear_scene()
setup_render_settings()
create_desk_environment(env_style, prop_set=4)
create_lighting(lighting_variant=4)
create_camera(angle_variant=4)

success = import_and_render_stl(stl_path, output_path, settings)
if success:
    print(f"Saved: {output_path}")
else:
    print("Failed!")
