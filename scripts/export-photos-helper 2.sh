#!/bin/bash

# Interactive helper to export photos from Photos app

echo "📸 Product Photos Export Helper"
echo "================================"
echo ""
echo "This will help you export the right photos for each product."
echo ""
echo "INSTRUCTIONS:"
echo "1. Keep this terminal window open"
echo "2. Open Photos app"
echo "3. Follow the search terms below"
echo "4. For each search, select the BEST photo"
echo "5. Drag it to the products folder"
echo "6. Rename it to the exact filename shown"
echo ""
echo "Press Enter to start..."
read

DEST="/Users/brandonbutler/cloudsculptordesigns/public/images/products"
mkdir -p "$DEST"

echo ""
echo "==================================="
echo "PRODUCTS WITH PHOTOS FOUND (32)"
echo "==================================="
echo ""

# Products with photos found
declare -A products
products=(
  ["brain lamp"]="3d-printed-brain-lamp.jpg|13 photos|⭐ HIGH PRIORITY"
  ["dragon egg"]="dragon-egg-lamp.jpg|9 photos"
  ["magic lamp"]="magic-lamp-incense-holder.jpg|1 photo"
  ["asian dragon"]="articulated-asian-style-dragon.jpg|1 photo"
  ["alien visitor"]="alien-visitor-2.jpg|2 photos"
  ["alien figurine"]="3d-printed-alien-figurine.jpg|1 photo"
  ["octopus"]="octopus-3d-printed-articulated.jpg|26 photos|⭐⭐ HIGH PRIORITY"
  ["rocket ship"]="rocket-ship-3d-printed-desk-toy.jpg|5 photos"
  ["game of thrones"]="game-of-thrones-dragon.jpg|8 photos"
  ["snake"]="articulated-snake-flexi-toy.jpg|15 photos|⭐ HIGH PRIORITY"
  ["turtle"]="turtle-3d-printed-articulated.jpg|21 photos|⭐⭐ HIGH PRIORITY"
  ["dog sitting"]="dog-figurine-sitting.jpg|1 photo"
  ["monkey"]="monkey-3d-printed-articulated.jpg|2 photos"
  ["frog"]="frog-3d-printed-articulated.jpg|2 photos"
  ["bird"]="bird-3d-printed-perched.jpg|52 photos|⭐⭐⭐ HIGHEST PRIORITY"
  ["spider"]="spider-3d-printed-articulated.jpg|10 photos"
  ["t-rex"]="dinosaur-trex-3d-printed.jpg|1 photo"
  ["robot"]="robot-3d-printed-articulated.jpg|16 photos|⭐ HIGH PRIORITY"
  ["gorilla"]="gorilla-flexible-3d-printed.jpg|2 photos"
  ["rock dragon"]="rock-dragon-3d-printed.jpg|1 photo"
  ["brick flowers"]="life-size-brick-block-flowers.jpg|1 photo"
  ["steampunk dragon"]="3d-printed-articulated-steampunk-dragon.jpg|1 photo"
  ["lion"]="lion-3d-printed-maned-cat.jpg|5 photos"
  ["tiger"]="tiger-3d-printed-striped-big-cat.jpg|3 photos"
  ["bear"]="bear-3d-printed-standing.jpg|11 photos|⭐ HIGH PRIORITY"
  ["wolf"]="wolf-3d-printed-howling.jpg|8 photos"
  ["panda"]="panda-3d-printed-cute.jpg|2 photos"
  ["koala"]="koala-3d-printed-climbing.jpg|1 photo"
  ["penguin"]="penguin-3d-printed-waddling.jpg|3 photos"
  ["zebra"]="zebra-3d-printed-striped.jpg|3 photos"
)

count=1
for search_term in "${!products[@]}"; do
  IFS='|' read -r filename photo_count priority <<< "${products[$search_term]}"

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "[$count/32] $search_term"
  if [ -n "$priority" ]; then
    echo "     $priority - $photo_count"
  else
    echo "     $photo_count available"
  fi
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "1. In Photos app, search: '$search_term'"
  echo "2. Select the BEST photo"
  echo "3. File → Export → Export 1 Photo"
  echo "4. Save to: $DEST/"
  echo "5. Name it: $filename"
  echo ""

  # Check if already exists
  if [ -f "$DEST/$filename" ]; then
    echo "✅ Already exists: $filename"
  else
    echo "⏳ Waiting for: $filename"
  fi

  echo ""
  echo "Press Enter when done (or 's' to skip)..."
  read response

  if [ "$response" = "s" ]; then
    echo "⏭️  Skipped"
  else
    # Check if file was added
    if [ -f "$DEST/$filename" ]; then
      echo "✅ Confirmed: $filename"
    else
      echo "⚠️  Not found yet - you can add it later"
    fi
  fi

  ((count++))
done

echo ""
echo "==================================="
echo "🎉 EXPORT PROCESS COMPLETE!"
echo "==================================="
echo ""
echo "Checking which images were added..."
/Users/brandonbutler/cloudsculptordesigns/scripts/check-images.sh
echo ""
echo "Next steps:"
echo "1. Review missing images"
echo "2. Run: npm run build"
echo "3. Run: npx firebase deploy --only hosting"
