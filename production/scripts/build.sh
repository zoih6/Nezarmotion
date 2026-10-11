#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out ../deliverables
node scripts/qa.mjs
node scripts/render.mjs --fps 30 --dur 120 --sub 1 --out out/silent.mp4
python3 scripts/mix.py --silent out/silent.mp4 --output ../deliverables/nezar-poetic-motion.mp4 --scratch out
printf '\nComplete: ../deliverables/nezar-poetic-motion.mp4\n'
ffmpeg -v error -y -threads 2 -i ../deliverables/nezar-poetic-motion.mp4 -vf 'scale=720:1280:flags=lanczos' -c:v libx264 -preset medium -crf 24 -maxrate 950k -bufsize 1900k -threads 2 -pix_fmt yuv420p -c:a copy -movflags +faststart ../deliverables/nezar-poetic-motion-light.mp4
printf 'Light version: ../deliverables/nezar-poetic-motion-light.mp4\n'
