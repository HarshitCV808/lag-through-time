#!/bin/sh
# Publish dist/ to the gh-pages branch WITHOUT deleting older hashed assets.
# GitHub Pages caches the page for ~10 minutes; a cached page must still find the
# script file it points at, or the game loads blank.
set -e
REPO=https://github.com/HarshitCV808/lag-through-time.git
cd "$(dirname "$0")/.."
npm test
npm run build
TMP=$(mktemp -d)
git clone -q --depth 1 --branch gh-pages "$REPO" "$TMP"
cp -R dist/. "$TMP"/
touch "$TMP/.nojekyll"
cd "$TMP"
git add -A
git commit -q -m "Deploy build

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" || echo "Nothing new to deploy"
git push -q origin gh-pages
cd - >/dev/null
rm -rf "$TMP"
echo "Deployed. Live in about a minute: https://harshitcv808.github.io/lag-through-time/"
