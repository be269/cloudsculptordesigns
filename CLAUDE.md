# Cloud Sculptor Designs - Project Notes

## Overview
E-commerce website for 3D printed art at www.cloudsculptordesigns.com

## Tech Stack
- **Framework**: Next.js 14 with static export (`output: 'export'`)
- **Hosting**: Firebase Hosting (https://cloud-sculptor-designs.web.app)
- **Domain**: cloudsculptordesigns.com (via Squarespace)
- **State**: Zustand for cart management
- **Styling**: Tailwind CSS

## Color Theme
- Dark blue: #161c29
- Mid blue: #1e2739
- Light blue: #2a3649
- Accent blue: #4A9FD4

## Key Configuration
- `trailingSlash: true` in next.config.mjs required for Firebase static routing
- Images are unoptimized for static export

## Product Features
- Multi-image product galleries with thumbnail selection
- Badge detection by filename (contains 'authorized', 'badge', or 'seller') uses `object-contain` instead of `object-cover`
- Stock info removed from all displays
- Products support `additionalImages` array in products.json

## Pipecox Products (Authorized Seller Badge)
All products designed by pipecox have `/images/products/pipecox-authorized-seller.png` as additional image:
- Foo Dog
- Rotating Face Planter
- Alien Visitor #2
- 3D Printed Alien Figurine
- Oni Devil Desk Organizer
- Behind Oni Wall Mask
- Alien Pilot Mask
- Foo Lion Mask
- Ushi Creature
- Female Face Fidget Toy
- Futuristic Cityscape Head Planter
- Forest Goddess Planter

## Deployment
- **Hosting**: Firebase Hosting (NOT Netlify)
- **Workflow**: Push to GitHub, then build and deploy to Firebase
- **Commands**:
```bash
cd ~/cloudsculptordesigns-dev && npm run build && npx firebase deploy --only hosting
```
- Must be logged in via `firebase login` before deploying

## Key Files
- `data/products.json` - Product catalog
- `components/ProductDetailClient.tsx` - Product detail page with image gallery
- `components/ProductCard.tsx` - Product grid cards
- `public/images/products/` - Product images
- `public/images/banner.png` - Site banner
- `scripts/create-banner.py` - Banner generation script

## Banner Creation
Script at `scripts/create-banner.py` uses:
- Pillow for image manipulation
- rembg for AI background removal
- Outputs preview to ~/Desktop/new-banner-preview.png

## Notes
- Owner has 10+ years 3D printing experience
- Does custom and large orders
- Can put company name/logo on anything
- Quote: "I love making things that make people happy"
