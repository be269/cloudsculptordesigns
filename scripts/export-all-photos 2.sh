#!/bin/bash

# Export all product photos from Photos app

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEST_DIR="/Users/brandonbutler/cloudsculptordesigns/public/images/products"

mkdir -p "$DEST_DIR"

echo "📸 Exporting Product Photos from Photos App"
echo "============================================"
echo ""

# Define products: "search term|output filename"
products=(
  "brain lamp|3d-printed-brain-lamp"
  "dragon egg|dragon-egg-lamp"
  "magic lamp|magic-lamp-incense-holder"
  "oni|oni-devil-desk-organizer"
  "asian dragon|articulated-asian-style-dragon"
  "alien|alien-visitor-2"
  "3d printed alien|3d-printed-alien-figurine"
  "octopus|octopus-3d-printed-articulated"
  "brain model|life-size-3d-printed-brain"
  "flexi dragon|dragon-flexi-3d-printed-articulated"
  "rocket|rocket-ship-3d-printed-desk-toy"
  "game of thrones|game-of-thrones-dragon"
  "cat|cat-figurine-sitting"
  "snake|articulated-snake-flexi-toy"
  "turtle|turtle-3d-printed-articulated"
  "dog|dog-figurine-sitting"
  "monkey|monkey-3d-printed-articulated"
  "frog|frog-3d-printed-articulated"
  "bird|bird-3d-printed-perched"
  "spider|spider-3d-printed-articulated"
  "t-rex|dinosaur-trex-3d-printed"
  "gray alien|alien-3d-printed-gray"
  "robot|robot-3d-printed-articulated"
  "stegosaurus|dinosaur-stegosaurus-3d-printed"
  "statue of liberty|statue-of-liberty-3d-printed"
  "skeletal dragon|3d-printed-articulated-skeletal-dragon"
  "serpent|midgard-serpent-jormungandr"
  "oni mask|behind-oni-wall-mask"
  "gorilla|gorilla-flexible-3d-printed"
  "face fidget|female-face-fidget-toy-pixels"
  "controller holder|robot-hand-controller-holder"
  "rock dragon|rock-dragon-3d-printed"
  "head planter|futuristic-cityscape-head-planter"
  "geared heart|geared-heart-3d-printed"
  "brick flower|life-size-brick-block-flowers"
  "retro rocket|retro-style-3d-printed-rocket-ship-large"
  "3d painting|custom-3d-printed-painting"
  "steampunk dragon|3d-printed-articulated-steampunk-dragon"
  "elephant|elephant-3d-printed-articulated"
  "cheetah|cheetah-3d-printed-big-cat"
  "lion|lion-3d-printed-maned-cat"
  "tiger|tiger-3d-printed-striped-big-cat"
  "bear|bear-3d-printed-standing"
  "wolf|wolf-3d-printed-howling"
  "panda|panda-3d-printed-cute"
  "koala|koala-3d-printed-climbing"
  "penguin|penguin-3d-printed-waddling"
  "zebra|zebra-3d-printed-striped"
)

exported=0
failed=0
skipped=0

for product in "${products[@]}"; do
  IFS='|' read -r search_term output_name <<< "$product"

  # Check if file already exists
  if [ -f "$DEST_DIR/$output_name.jpg" ]; then
    echo "⏭️  Skipping (exists): $output_name.jpg"
    ((skipped++))
    continue
  fi

  echo -n "🔍 Searching: '$search_term' → $output_name.jpg ... "

  # Clear temp directory
  rm -rf /tmp/photo_export
  mkdir -p /tmp/photo_export

  # Run the export script
  result=$(osascript "$SCRIPT_DIR/export-single-photo.scpt" "$search_term" "$output_name" 2>&1)

  if [[ "$result" == *"✅"* ]]; then
    echo "✅"
    ((exported++))
  else
    echo "❌"
    echo "   $result"
    ((failed++))
  fi
done

echo ""
echo "============================================"
echo "📊 Export Summary"
echo "============================================"
echo "✅ Exported: $exported"
echo "⏭️  Skipped:  $skipped"
echo "❌ Failed:   $failed"
echo ""
echo "Images saved to: $DEST_DIR"
