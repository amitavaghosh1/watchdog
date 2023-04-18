current_dir = $(shell pwd)

build:
	mkdir -p dist
	chrome --headless --pack-extension=$(current_dir) --pack-extension-key=$(current_dir)/../watchdog.pem	
	zip $(current_dir)/dist/watchdog.crx.zip $(current_dir)/../watchdog.crx
