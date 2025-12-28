#!/bin/bash

# Script to check which product images are missing

echo "🔍 Checking for product images..."
echo ""

IMAGES_DIR="/Users/brandonbutler/cloudsculptordesigns/public/images/products"
MISSING=0
FOUND=0

# Array of required images
declare -a images=(
  "brain-lamp.jpg"
  "dragon-egg-lamp.jpg"
  "magic-lamp.jpg"
  "oni-devil.jpg"
  "asian-dragon.jpg"
  "alien-visitor-2.jpg"
  "alien-figurine.jpg"
  "octopus.jpg"
  "brain-model.jpg"
  "flexi-dragon.jpg"
)

for img in "${images[@]}"; do
  if [ -f "$IMAGES_DIR/$img" ]; then
    echo "✅ Found: $img"
    ((FOUND++))
  else
    echo "❌ Missing: $img"
    ((MISSING++))
  fi
done

echo ""
echo "📊 Summary:"
echo "  Found: $FOUND/10"
echo "  Missing: $MISSING/10"
echo ""

if [ $MISSING -eq 0 ]; then
  echo "🎉 All images are ready!"
  echo "Run 'npm run build && npx firebase deploy' to update your site"
else
  echo "⚠️  Please download the missing images from Etsy"
  echo "Save them to: $IMAGES_DIR/"
fi
