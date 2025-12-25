#!/usr/bin/osascript

on run argv
	set searchTerm to item 1 of argv
	set outputName to item 2 of argv
	set destFolder to POSIX file "/Users/brandonbutler/cloudsculptordesigns/public/images/products/"

	tell application "Photos"
		try
			set foundPhotos to search for searchTerm
			set photoCount to count of foundPhotos

			if photoCount > 0 then
				set thePhoto to item 1 of foundPhotos

				-- Export to temp location first
				set tempDest to POSIX file "/tmp/photo_export/"
				do shell script "mkdir -p /tmp/photo_export"

				with timeout of 120 seconds
					export {thePhoto} to tempDest
				end timeout

				-- Wait for export to complete
				delay 2

				-- Find the exported file and rename it
				do shell script "cd /tmp/photo_export && for f in *; do mv \"$f\" \"/Users/brandonbutler/cloudsculptordesigns/public/images/products/" & outputName & ".jpg\"; break; done"

				return "✅ Exported: " & searchTerm & " → " & outputName & ".jpg"
			else
				return "❌ No photos found for: " & searchTerm
			end if
		on error errMsg
			return "⚠️ Error: " & errMsg
		end try
	end tell
end run
