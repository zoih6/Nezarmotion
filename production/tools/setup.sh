#!/usr/bin/env bash
# One-shot environment setup (idempotent; re-run after every sandbox reset). Run from repo root.
set -e
command -v ffmpeg >/dev/null || { sudo apt-get update -qq >/dev/null 2>&1; sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq ffmpeg >/tmp/apt.log 2>&1; }
[ -d node_modules/playwright ] || npm i --no-audit --no-fund >/dev/null 2>&1
ls ~/.cache/ms-playwright 2>/dev/null | grep -q chromium || { npx playwright install chromium >/dev/null 2>&1; sudo npx playwright install-deps chromium >/tmp/deps.log 2>&1 || true; }
echo "setup ok: $(ffmpeg -version | head -1 | cut -c1-30), node $(node -v)"
