#!/usr/bin/osascript

-- Auto export photos for Cloud Sculptor Designs
-- This script searches Photos for product images and exports them

set destFolder to "/Users/brandonbutler/cloudsculptordesigns/public/images/products/"
set exportedCount to 0

tell application "Photos"
	activate
	delay 1

	-- Define products: {search term, filename}
	set productList to {¬
		{"brain lamp", "3d-printed-brain-lamp"}, ¬
		{"dragon egg", "dragon-egg-lamp"}, ¬
		{"magic lamp", "magic-lamp-incense-holder"}, ¬
		{"oni devil", "oni-devil-desk-organizer"}, ¬
		{"asian dragon", "articulated-asian-style-dragon"}, ¬
		{"alien", "alien-visitor-2"}, ¬
		{"octopus", "octopus-3d-printed-articulated"}, ¬
		{"brain model", "life-size-3d-printed-brain"}, ¬
		{"dragon flexi", "dragon-flexi-3d-printed-articulated"}, ¬
		{"rocket", "rocket-ship-3d-printed-desk-toy"}, ¬
		{"game of thrones", "game-of-thrones-dragon"}, ¬
		{"cat", "cat-figurine-sitting"}, ¬
		{"snake", "articulated-snake-flexi-toy"}, ¬
		{"turtle", "turtle-3d-printed-articulated"}, ¬
		{"dog", "dog-figurine-sitting"}, ¬
		{"monkey", "monkey-3d-printed-articulated"}, ¬
		{"frog", "frog-3d-printed-articulated"}, ¬
		{"bird", "bird-3d-printed-perched"}, ¬
		{"spider", "spider-3d-printed-articulated"}, ¬
		{"t-rex", "dinosaur-trex-3d-printed"}, ¬
		{"robot", "robot-3d-printed-articulated"}, ¬
		{"stegosaurus", "dinosaur-stegosaurus-3d-printed"}, ¬
		{"statue of liberty", "statue-of-liberty-3d-printed"}, ¬
		{"skeletal dragon", "3d-printed-articulated-skeletal-dragon"}, ¬
		{"serpent", "midgard-serpent-jormungandr"}, ¬
		{"oni mask", "behind-oni-wall-mask"}, ¬
		{"gorilla", "gorilla-flexible-3d-printed"}, ¬
		{"face fidget", "female-face-fidget-toy-pixels"}, ¬
		{"controller holder", "robot-hand-controller-holder"}, ¬
		{"rock dragon", "rock-dragon-3d-printed"}, ¬
		{"head planter", "futuristic-cityscape-head-planter"}, ¬
		{"geared heart", "geared-heart-3d-printed"}, ¬
		{"brick flower", "life-size-brick-block-flowers"}, ¬
		{"retro rocket", "retro-style-3d-printed-rocket-ship-large"}, ¬
		{"painting", "custom-3d-printed-painting"}, ¬
		{"steampunk dragon", "3d-printed-articulated-steampunk-dragon"}, ¬
		{"elephant", "elephant-3d-printed-articulated"}, ¬
		{"cheetah", "cheetah-3d-printed-big-cat"}, ¬
		{"lion", "lion-3d-printed-maned-cat"}, ¬
		{"tiger", "tiger-3d-printed-striped-big-cat"}, ¬
		{"bear", "bear-3d-printed-standing"}, ¬
		{"wolf", "wolf-3d-printed-howling"}, ¬
		{"panda", "panda-3d-printed-cute"}, ¬
		{"koala", "koala-3d-printed-climbing"}, ¬
		{"penguin", "penguin-3d-printed-waddling"}, ¬
		{"zebra", "zebra-3d-printed-striped"} ¬
	}

	set resultLog to ""

	repeat with productInfo in productList
		set searchTerm to item 1 of productInfo
		set fileName to item 2 of productInfo

		try
			set foundPhotos to search for searchTerm
			set photoCount to count of foundPhotos

			if photoCount > 0 then
				-- Get the first (most relevant) photo
				set thePhoto to item 1 of foundPhotos

				-- Export the photo
				set exportPath to POSIX file (destFolder & fileName & ".jpg")

				with timeout of 60 seconds
					export {thePhoto} to exportPath with using originals
				end timeout

				set exportedCount to exportedCount + 1
				set resultLog to resultLog & "✅ " & searchTerm & " → " & fileName & ".jpg" & return
			else
				set resultLog to resultLog & "❌ No photos found for: " & searchTerm & return
			end if
		on error errMsg
			set resultLog to resultLog & "⚠️ Error with " & searchTerm & ": " & errMsg & return
		end try
	end repeat

	return "Exported " & exportedCount & " photos" & return & return & resultLog
end tell
