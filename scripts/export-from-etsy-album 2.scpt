#!/usr/bin/osascript

on run argv
	set searchTerm to item 1 of argv
	set outputName to item 2 of argv
	set destFolder to "/Users/brandonbutler/cloudsculptordesigns/public/images/products/"

	tell application "Photos"
		try
			set etsyAlbum to album "Etsy"
			set allPhotos to media items of etsyAlbum
			set matchedPhoto to missing value

			-- Search through album photos for matching filename or description
			repeat with aPhoto in allPhotos
				set photoName to filename of aPhoto
				set photoName to my toLowerCase(photoName)
				set searchLower to my toLowerCase(searchTerm)

				if photoName contains searchLower then
					set matchedPhoto to aPhoto
					exit repeat
				end if
			end repeat

			if matchedPhoto is not missing value then
				-- Export to temp location
				do shell script "mkdir -p /tmp/photo_export && rm -rf /tmp/photo_export/*"
				set tempDest to POSIX file "/tmp/photo_export/"

				with timeout of 120 seconds
					export {matchedPhoto} to tempDest
				end timeout

				delay 2

				-- Move and rename
				do shell script "cd /tmp/photo_export && for f in *; do mv \"$f\" \"" & destFolder & outputName & ".jpg\"; break; done"

				return "✅ Exported: " & searchTerm & " → " & outputName & ".jpg"
			else
				return "❌ No match in Etsy album for: " & searchTerm
			end if
		on error errMsg
			return "⚠️ Error: " & errMsg
		end try
	end tell
end run

on toLowerCase(theText)
	set lowercaseChars to "abcdefghijklmnopqrstuvwxyz"
	set uppercaseChars to "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	set resultText to ""
	repeat with i from 1 to length of theText
		set theChar to character i of theText
		set charOffset to offset of theChar in uppercaseChars
		if charOffset > 0 then
			set resultText to resultText & character charOffset of lowercaseChars
		else
			set resultText to resultText & theChar
		end if
	end repeat
	return resultText
end toLowerCase
