# Cloud Sculptor Designs - Project Notes

## Overview
E-commerce website for 3D printed art at www.cloudsculptordesigns.com

## Tech Stack
- **Framework**: Next.js 14 with static export (`output: 'export'`)
- **Hosting**: Firebase Hosting (https://cloud-sculptor-designs.web.app)
- **Domain**: cloudsculptordesigns.com (via Squarespace)
- **State**: Zustand for cart management
- **Styling**: Tailwind CSS
- **3D Viewers**: React Three Fiber with STL/GLB support

## Color Theme
- Dark blue: #161c29
- Mid blue: #1e2739
- Light blue: #2a3649
- Accent blue: #4A9FD4

## Key Configuration
- `trailingSlash: true` in next.config.mjs required for Firebase static routing
- Images are unoptimized for static export

---

## WORKFLOW: Deployment

### Auto-Deploy (GitHub Actions)
Push to main branch → GitHub Actions builds and deploys automatically.
Requires `FIREBASE_SERVICE_ACCOUNT` secret in GitHub repo settings.

### Manual Deploy
```bash
cd ~/cloudsculptordesigns-dev
npm run build
npx firebase-tools deploy --only hosting
```
Must be logged in via `npx firebase-tools login` first.

### Quick Deploy Script
```bash
./deploy.sh
```

---

## WORKFLOW: Product Management

### Adding a New Product
1. **Add images** to `public/images/products/`
   - Main image: `product-name.jpg`
   - Additional: `product-name-01.jpg`, `product-name-02.jpg`, etc.

2. **Add STL model** (optional) to `public/models/`
   - File: `product_name.stl`

3. **Edit `data/products.json`** - add product object:
```json
{
    "id": "ETSY_LISTING_ID",
    "title": "Product Title",
    "price": 19.99,
    "category": "Category",
    "description": "Description text",
    "materials": "PLA Plastic, 3D-printed",
    "dimensions": "Approximately X inches tall",
    "features": ["Feature 1", "Feature 2"],
    "stock": 999,
    "shippingCost": "FREE",
    "shippingTime": "Ships within 1 week",
    "etsyUrl": "https://www.etsy.com/listing/ID",
    "notes": "",
    "slug": "product-slug",
    "image": "/images/products/product-name.jpg",
    "additionalImages": ["/images/products/product-name-01.jpg"],
    "modelUrl": "/models/product_name.stl",
    "defaultColorIndex": 0
}
```

4. **Rebuild and deploy**

### Product Properties Reference
- `modelUrl`: Enables 3D viewer with color picker
- `defaultColorIndex`: Default color (see color list below)
- `hideColorOptions`: true = hide color picker
- `modelRotationX/Y`: Rotate model in degrees
- `useCompositeAlien2Viewer`: Multi-piece alien viewer
- `useCompositeLampViewer`: Lamp + base viewer
- `useCompositeGoddessViewer`: Goddess + base viewer
- `useCompositeRocketViewer`: Rocket + plume viewer
- `dimensionsBySize`: Custom dimensions per size { small, medium, large }

### Color Index Reference (MATTE_COLORS)
0: Red, 1: Orange, 2: Yellow, 3: Lime, 4: Green, 5: Spring Green,
6: Grass Green, 7: Cyan, 8: Sky Blue, 9: Blue, 10: Purple, 11: Magenta,
12: Hot Pink, 13: Light Gray, 14: Gray, 15: Dark Gray, 16: Black,
17: White, 18: Brown, 19: Beige, 20: Pink, 21: Maroon, 22: Teal, 23: Indigo

---

## WORKFLOW: 3D Viewer Tuning

### Adjusting Camera Zoom
Edit the `camera` prop in the viewer component:
- `STLViewerInteractive.tsx` - line ~320
- `STLViewerCompositeAlien2.tsx` - line ~293
- Other composite viewers similarly

Camera format: `camera={{ position: [x, y, z], fov: 50 }}`
- Decrease z = zoom in
- Current: z=2.5-3 for zoomed view

### Adjusting Model Position (Composite Viewers)
For multi-piece models like Alien #2, edit positions in the composite viewer:
```tsx
position={[x, y, z]}  // [left/right, up/down, forward/back]
rotationX={degrees}   // tilt
modelScale={0.5}      // piece scale
```

Coordinate conventions (user POV facing model):
- Positive x = user's left
- Positive y = up
- Negative z = towards back
- ~0.04 units ≈ 0.5 inch

### Model Scale
All viewers now use fixed scale (1.0) regardless of size selection.
Size buttons only affect price and displayed dimensions.

---

## WORKFLOW: Etsy Sync (Future)

Etsy API integration for:
- Price sync
- Inventory sync
- Order tracking

Requires Etsy API key setup.

---

## Pipecox Products (Authorized Seller Badge)
Products designed by pipecox include `/images/products/pipecox-authorized-seller.png`:
- Foo Dog, Rotating Face Planter, Alien Visitor #2, 3D Printed Alien Figurine
- Oni Devil Desk Organizer, Behind Oni Wall Mask, Alien Pilot Mask
- Foo Lion Mask, Ushi Creature, Female Face Fidget Toy
- Futuristic Cityscape Head Planter, Forest Goddess Planter

## Key Files
- `data/products.json` - Product catalog
- `components/ProductDetailClient.tsx` - Product detail page
- `components/STLViewerInteractive.tsx` - Main 3D viewer with colors
- `components/STLViewerComposite*.tsx` - Multi-piece viewers
- `public/images/products/` - Product images
- `public/models/` - STL files
- `.github/workflows/firebase-deploy.yml` - Auto-deploy config

## Notes
- Owner has 10+ years 3D printing experience
- Does custom and large orders
- Can put company name/logo on anything
- Quote: "I love making things that make people happy"

---

## CURRENT WORK (Session State)

**Last Updated**: 2025-12-26

### In Progress
- None

### Recently Completed (This Session)
- **DEPLOYED** to Firebase (https://cloud-sculptor-designs.web.app)
- Added Admin Photo Manager: add `?admin=true` to any product URL
  - Blue + button to add photos
  - Red X buttons to delete photos
  - Requires `node scripts/photo-server.js` running locally
- Added `hideSizeOptions` feature for products (used on Midgard Serpent)
- Fixed dragon product images (were showing cup placeholder)
- Added dragon egg images 02-09 to dragon egg listings
- Created `render-aliens-3-4.py` script with raised camera, darker green
- Added `STLViewerCompositePolygon.tsx` for polygon vase with base
- Added polygon vase models (`polygon_vase.stl`, `polygon_vase_base.stl`)
- Added 11 dragon egg lamp images
- Added Alien models 2, 3, 4 (`Alien_2.stl`, `Alien_3.stl`, `Alien_4.stl`)
- Created GitHub Actions auto-deploy workflow
- Created Etsy sync scripts (not yet functional)
- Created `deploy.sh` quick deploy script
- Added photo navigation arrows (ChevronLeft/ChevronRight) to product detail page for cycling through product images

### Next Up
- Finish product rendering pipeline
- Test and commit all pending changes
- Set up GitHub secrets for auto-deploy

### Uncommitted Files (35 files)
Run `git status` for full list. Key additions:
- `.github/workflows/firebase-deploy.yml`
- `components/STLViewerCompositePolygon.tsx`
- `scripts/render-products.py` and related render scripts
- `public/models/polygon_vase*.stl`, `Alien_2-4.stl`
- `public/images/products/dragon-egg-lamp-*.jpg`
