#!/bin/bash

# Script to help find product photos in iCloud Photos
# This creates a searchable keyword list for manual photo selection

echo "📸 Product Photo Search Helper"
echo "================================"
echo ""
echo "Looking for photos for these products:"
echo ""

# Read product data and create keyword search terms
cat << 'EOF'

SEARCH KEYWORDS FOR PHOTOS APP:

Use these keywords to search in your Photos app, then drag/drop images to:
/Users/brandonbutler/cloudsculptordesigns/public/images/products/

1. Brain Lamp → Search: "brain lamp" OR "brain light" OR "brain LED"
   Save as: 3d-printed-brain-lamp.jpg

2. Dragon Egg Lamp → Search: "dragon egg" OR "egg lamp"
   Save as: dragon-egg-lamp.jpg

3. Magic Lamp → Search: "magic lamp" OR "incense holder" OR "genie lamp"
   Save as: magic-lamp-incense-holder.jpg

4. Oni Devil Organizer → Search: "oni" OR "devil" OR "mask" OR "organizer"
   Save as: oni-devil-desk-organizer.jpg

5. Asian Dragon → Search: "asian dragon" OR "articulated dragon" OR "chinese dragon"
   Save as: articulated-asian-style-dragon.jpg

6. Alien Visitor #2 → Search: "alien visitor" OR "alien thinking"
   Save as: alien-visitor-2.jpg

7. Alien Figurine → Search: "alien figurine" OR "alien statue"
   Save as: 3d-printed-alien-figurine.jpg

8. Octopus → Search: "octopus" OR "articulated octopus"
   Save as: octopus-3d-printed-articulated.jpg

9. Brain Model → Search: "brain model" OR "life size brain"
   Save as: life-size-3d-printed-brain.jpg

10. Flexi Dragon → Search: "flexi dragon" OR "flexible dragon"
    Save as: dragon-flexi-3d-printed-articulated.jpg

11. Rocket Ship → Search: "rocket" OR "spaceship"
    Save as: rocket-ship-3d-printed-desk-toy.jpg

12. Game of Thrones Dragon → Search: "game of thrones" OR "GOT dragon"
    Save as: game-of-thrones-dragon.jpg

13-48. [Additional products - see full list in products.json]

EOF

echo ""
echo "📝 MANUAL SEARCH INSTRUCTIONS:"
echo ""
echo "1. Open Photos app on your Mac"
echo "2. Use the search keywords above to find each product's photos"
echo "3. Select the best photo(s) for each product"
echo "4. Drag and drop to: /Users/brandonbutler/cloudsculptordesigns/public/images/products/"
echo "5. Rename to the exact filename shown above"
echo ""
echo "OR use this faster method:"
echo ""
echo "1. Export all product photos from Photos app to ~/Desktop/product-photos-temp/"
echo "2. Run the batch rename script (coming next)"
echo ""
