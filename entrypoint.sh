#!/bin/sh

# Create config.js with the environment variable
echo "window.KISSAN_MITRA_API_KEY = '${GEMINI_API_KEY}';" > /usr/share/nginx/html/config.js

# Allow nginx to start
exit 0
