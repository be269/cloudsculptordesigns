# 📸 Product Image Download Guide

## Quick Summary

You need to download 10 product images from your Etsy shop and save them to your website.

**Save location:** `/Users/brandonbutler/cloudsculptordesigns/public/images/products/`

---

## Step-by-Step Instructions

### For Each Product:

1. **Click the Etsy URL** below
2. **Right-click the main product image** → "Save Image As..."
3. **Navigate to:** `/Users/brandonbutler/cloudsculptordesigns/public/images/products/`
4. **Save with the exact filename** listed below
5. **Download additional images** if you want multiple views (optional)

---

## Product List & Download Links

### 1. Brain Lamp ($74.99)
- **URL:** https://www.etsy.com/listing/642330385
- **Save as:** `brain-lamp.jpg`
- **Tips:** Get the main glowing brain image

### 2. Dragon Egg Lamp ($40.84)
- **URL:** https://www.etsy.com/listing/1504036004
- **Save as:** `dragon-egg-lamp.jpg`
- **Tips:** Best image showing the egg glowing

### 3. Magic Lamp Incense Holder ($29.99)
- **URL:** https://www.etsy.com/listing/1755820026
- **Save as:** `magic-lamp.jpg`
- **Tips:** Clear view of the lamp design

### 4. Oni Devil Desk Organizer ($23.74)
- **URL:** https://www.etsy.com/listing/1323402183
- **Save as:** `oni-devil.jpg`
- **Tips:** Front-facing view preferred

### 5. Articulated Asian Dragon ($23.57)
- **URL:** https://www.etsy.com/listing/1315553004
- **Save as:** `asian-dragon.jpg`
- **Tips:** Fully extended dragon pose

### 6. Alien Visitor #2 Figurine ($14.99)
- **URL:** https://www.etsy.com/listing/1506319826
- **Save as:** `alien-visitor-2.jpg`
- **Tips:** Show the "pondering" expression

### 7. 3D Printed Alien Figurine ($14.99)
- **URL:** https://www.etsy.com/listing/1315551212
- **Save as:** `alien-figurine.jpg`
- **Tips:** Clear, well-lit photo

### 8. Articulated Octopus ($22.99)
- **URL:** https://www.etsy.com/listing/1557901842
- **Save as:** `octopus.jpg`
- **Tips:** Show articulated arms

### 9. Life-Size Brain Model ($37.99)
- **URL:** https://www.etsy.com/listing/1701804727
- **Save as:** `brain-model.jpg`
- **Tips:** Clear anatomical detail

### 10. Flexi Dragon ($21.99)
- **URL:** https://www.etsy.com/listing/1504035698
- **Save as:** `flexi-dragon.jpg`
- **Tips:** Show flexibility/posing

---

## Optional: Download Multiple Images

If you want image galleries for each product:

Save additional images as:
- `brain-lamp-1.jpg`
- `brain-lamp-2.jpg`
- `brain-lamp-3.jpg`
- etc.

(We can add gallery functionality later)

---

## Optional: Download Videos

If products have video demos:

Save as: `{product-name}-video.mp4`

Example:
- `brain-lamp-video.mp4`
- `dragon-egg-lamp-video.mp4`

---

## After Downloading

### Check Your Progress

Run this command to see which images you have:

```bash
/Users/brandonbutler/cloudsculptordesigns/scripts/check-images.sh
```

### When All Images Are Downloaded

1. **Rebuild the site:**
   ```bash
   cd /Users/brandonbutler/cloudsculptordesigns
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   npx firebase deploy --only hosting
   ```

3. **Visit your site to see the images:**
   - https://cloud-sculptor-designs.web.app

---

## Image Optimization Tips

For best performance:

- **Format:** JPG or WebP preferred
- **Size:** 800x800 pixels (square) is ideal
- **File size:** Under 200KB per image

If images are too large, I can help you optimize them after download.

---

## Need Help?

After you've downloaded the images, I can help you:

- ✅ Verify all images are present
- ✅ Optimize file sizes
- ✅ Add image galleries
- ✅ Add video support
- ✅ Rebuild and redeploy

---

## Quick Copy-Paste List

Here are all the filenames you need (for reference):

```
brain-lamp.jpg
dragon-egg-lamp.jpg
magic-lamp.jpg
oni-devil.jpg
asian-dragon.jpg
alien-visitor-2.jpg
alien-figurine.jpg
octopus.jpg
brain-model.jpg
flexi-dragon.jpg
```

Save all files to: `/Users/brandonbutler/cloudsculptordesigns/public/images/products/`
