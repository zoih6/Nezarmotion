#!/usr/bin/env bash
# Render the whole film in 4 parts (crash-safe chunks), run from production/film
set -e
cd "$(dirname "$0")/../film"
for p in "1 0 900" "2 900 1800" "3 1800 2700" "4 2700 3601"; do set -- $p
  [ -f segments/p$1.mp4 ] && continue
  PAGE=index.html VO=none python3 ../tools/render_seg.py p$1 $2 $3
done
echo ALLDONE
