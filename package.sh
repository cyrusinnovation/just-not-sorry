#!/bin/sh
VERSION=$1
echo "manifest.json package.json" | xargs sed -i.old "s/\"version\": \".*\"/\"version\": \"$VERSION\"/"
npm run build
mkdir -p dist
cd build
zip -r "../dist/just-not-sorry-chrome.zip" . *
