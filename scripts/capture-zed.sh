#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p screenshots

npx -y playwright screenshot \
  --browser=chromium \
  --load-storage scripts/zed-storage-state.json \
  --viewport-size=1440,1200 \
  --wait-for-timeout=3000 \
  https://zed.dev/ \
  screenshots/zed-home-desktop-hero.png

npx -y playwright screenshot \
  --browser=chromium \
  --load-storage scripts/zed-storage-state.json \
  --viewport-size=1440,1200 \
  --wait-for-timeout=3000 \
  --full-page \
  https://zed.dev/ \
  screenshots/zed-home-desktop-full.png

npx -y playwright screenshot \
  --browser=chromium \
  --load-storage scripts/zed-storage-state.json \
  --viewport-size=390,844 \
  --wait-for-timeout=3000 \
  --full-page \
  https://zed.dev/ \
  screenshots/zed-home-mobile-full.png

npx -y playwright screenshot \
  --browser=chromium \
  --color-scheme=dark \
  --load-storage scripts/zed-storage-state.json \
  --viewport-size=1440,1200 \
  --wait-for-timeout=3000 \
  https://zed.dev/ \
  screenshots/zed-home-dark-desktop-hero.png

npx -y playwright screenshot \
  --browser=chromium \
  --color-scheme=dark \
  --load-storage scripts/zed-storage-state.json \
  --viewport-size=1440,1200 \
  --wait-for-timeout=3000 \
  --full-page \
  https://zed.dev/ \
  screenshots/zed-home-dark-desktop-full.png

npx -y playwright screenshot \
  --browser=chromium \
  --color-scheme=dark \
  --load-storage scripts/zed-storage-state.json \
  --viewport-size=390,844 \
  --wait-for-timeout=3000 \
  --full-page \
  https://zed.dev/ \
  screenshots/zed-home-dark-mobile-full.png
