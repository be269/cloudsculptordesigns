#!/usr/bin/osascript

-- AppleScript to search Photos app for product images
-- This will search for each product and list matching photos

tell application "Photos"
	activate

	-- Array of search terms for each product
	set searchTerms to {"brain lamp", "dragon egg", "magic lamp", "oni devil", "asian dragon", "alien visitor", "alien figurine", "octopus", "life size brain", "flexi dragon", "rocket ship", "game of thrones", "cat sitting", "snake", "turtle", "dog sitting", "monkey", "frog", "bird", "spider", "t-rex", "gray alien", "robot", "stegosaurus", "statue of liberty", "skeletal dragon", "midgard serpent", "oni mask", "gorilla", "female face", "robot hand", "rock dragon", "futuristic head", "geared heart", "brick flowers", "retro rocket", "3d painting", "steampunk dragon", "elephant", "cheetah", "lion", "tiger", "bear", "wolf", "panda", "koala", "penguin", "zebra"}

	set outputText to "PHOTOS SEARCH RESULTS" & return & "===================" & return & return

	repeat with searchTerm in searchTerms
		set outputText to outputText & "Searching for: " & searchTerm & return

		try
			set foundPhotos to search for searchTerm
			set photoCount to count of foundPhotos

			if photoCount > 0 then
				set outputText to outputText & "  ✅ Found " & photoCount & " photo(s)" & return
			else
				set outputText to outputText & "  ❌ No photos found" & return
			end if
		on error
			set outputText to outputText & "  ⚠️  Search error" & return
		end try

		set outputText to outputText & return
	end repeat

	-- Save results to file
	set outputFile to POSIX file "/tmp/photos-search-results.txt"
	try
		set fileRef to open for access outputFile with write permission
		set eof of fileRef to 0
		write outputText to fileRef
		close access fileRef
	on error
		try
			close access outputFile
		end try
	end try

	return outputText

end tell
