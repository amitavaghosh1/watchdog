build:
	zip watchdog.zip -r assets/ background.js manifest.json popup.html popup.js
	mkdir -p dist
	mv watchdog.zip dist/watchdog.crx.zip
