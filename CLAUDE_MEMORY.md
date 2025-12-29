# Cloud Sculptor Designs - Claude Memory File

Last updated: 2025-12-28

## Project Overview
- **Site**: cloudsculptordesigns.com (Firebase Hosting)
- **Framework**: Next.js with static export
- **Hosting**: Firebase (cloud-sculptor-designs.web.app → cloudsculptordesigns.com)
- **Project Path**: `/Users/cloudsculptordesigns/Library/Mobile Documents/com~apple~CloudDocs/Claude/cloudsculptordesigns`

## Key Commands
- **Build**: `npm run build` (outputs to `out/` folder)
- **Deploy**: `npx firebase-tools deploy --only hosting`
- **Clean rebuild**: `rm -rf out && npm run build`
- **"Make it so"**: User's phrase meaning "commit to GitHub and deploy to cloudsculptordesigns.com"

## 3D Model Viewer Architecture

### STL Files
- Original high-poly models stored in `/public/models/` (e.g., `magic_lamp.stl`)
- Web-optimized versions use `_web.stl` suffix (e.g., `magic_lamp_web.stl`)
- Optimization done with Python `pyfqmr` library (quadric mesh decimation)
- Target: 50K-75K faces, 2-6MB file size for web

### Viewer Components
1. **STLViewerInteractive.tsx** - Main STL viewer with color picker
2. **GLTFViewer.tsx** - For GLB/GLTF painted models (not actively used)
3. **Composite viewers** - For multi-part models:
   - `STLViewerCompositeLamp.tsx` - Magic lamp (body + base)
   - `STLViewerCompositeGoddess.tsx` - Forest goddess (figure + base)
   - `STLViewerCompositePolygon.tsx` - Futuristic cityscape planter
   - `STLViewerCompositeRocket.tsx` - Rocket with plume
   - `STLViewerCompositeAlien2.tsx` - Alien 2

### Camera Settings
- Position: `[0, 0, 3.2]` (zoomed out for better framing)
- FOV: 50
- Near/Far: 0.1/1000

## Products.json Configuration

### Key Fields
- `modelUrl`: Path to STL file (use `_web.stl` versions)
- `modelRotationX`: Degrees to rotate model (e.g., 90 for upright orientation)
- `modelRotationY`: Y-axis rotation
- `defaultColorIndex`: Default color swatch index (0-indexed)
- `hideColorOptions`: Hide color picker (for lamps with built-in LEDs)
- `hideSizeOptions`: Hide size selector
- `useCompositeLampViewer`, `useCompositeGoddessViewer`, etc.: Use composite viewer
- `glbUrl`: For GLB models (currently unused)
- `notes`: Special instructions shown on product page

### Color Index Reference
- 0-23: Matte colors
- 24-37: Metallic colors
- 38-49: Dual-color options
- 50+: Tri-color options (e.g., 55 = Blue/Green/Purple)

## Recent Issues & Fixes

### Git LFS Deployment Issue
- **Problem**: Models showed 132 bytes (LFS pointer files deployed instead of actual content)
- **Fix**: Clean rebuild with `rm -rf out && npm run build`

### Model Orientation
- Some models need `modelRotationX: 90` to stand upright (e.g., Foo Lion, Oni mask, Alien Pilot)

### 3MF Support
- Three.js ThreeMFLoader doesn't support slicer-generated 3MF files
- Abandoned 3MF/GLB approach, using STL with color picker instead

## File Size Guidelines
- STL files under 2MB can use original
- Larger files need `_web.stl` optimized version
- Use pyfqmr for decimation: `simplify_mesh(vertices, faces, target_faces)`

## Products with Special Configurations
1. **Alien Pilot Hover Pod**: 4-color model, rotated 90deg, tri-color default (index 55)
2. **Foo Lion**: Rotated 90deg, metallic gold default (index 24)
3. **Oni Wall Mask**: Rotated 90deg
4. **Brain Lamp**: Color picker hidden (has LED lighting)
5. **Dragon Egg Lamp**: Color picker hidden (has LED lighting)

## Deployment Checklist
1. Update `products.json` if needed
2. Run `rm -rf out && npm run build`
3. Run `npx firebase-tools deploy --only hosting`
4. Verify at cloudsculptordesigns.com
