#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p screenshots

storage_state="$(mktemp)"
trap 'rm -f "$storage_state"' EXIT

cat > "$storage_state" <<'JSON'
{
  "cookies": [],
  "origins": [
    {
      "origin": "https://zed.dev",
      "localStorage": [
        {
          "name": "c15t",
          "value": "{\"consents\":{\"necessary\":true,\"functionality\":false,\"measurement\":false,\"experience\":false,\"marketing\":false},\"selectedConsents\":{\"necessary\":true,\"functionality\":false,\"measurement\":false,\"experience\":false,\"marketing\":false},\"consentInfo\":{\"time\":1778781600000,\"subjectId\":\"kerosene-screenshot-reference\"}}"
        }
      ]
    }
  ]
}
JSON

npx -y playwright screenshot \
  --browser=chromium \
  --load-storage "$storage_state" \
  --viewport-size=1440,1200 \
  --wait-for-timeout=3000 \
  https://zed.dev/ \
  screenshots/zed-home-desktop-hero.png

npx -y playwright screenshot \
  --browser=chromium \
  --load-storage "$storage_state" \
  --viewport-size=1440,1200 \
  --wait-for-timeout=3000 \
  --full-page \
  https://zed.dev/ \
  screenshots/zed-home-desktop-full.png

npx -y playwright screenshot \
  --browser=chromium \
  --load-storage "$storage_state" \
  --viewport-size=390,844 \
  --wait-for-timeout=3000 \
  --full-page \
  https://zed.dev/ \
  screenshots/zed-home-mobile-full.png

npx -y playwright screenshot \
  --browser=chromium \
  --color-scheme=dark \
  --load-storage "$storage_state" \
  --viewport-size=1440,1200 \
  --wait-for-timeout=3000 \
  https://zed.dev/ \
  screenshots/zed-home-dark-desktop-hero.png

npx -y playwright screenshot \
  --browser=chromium \
  --color-scheme=dark \
  --load-storage "$storage_state" \
  --viewport-size=1440,1200 \
  --wait-for-timeout=3000 \
  --full-page \
  https://zed.dev/ \
  screenshots/zed-home-dark-desktop-full.png

npx -y playwright screenshot \
  --browser=chromium \
  --color-scheme=dark \
  --load-storage "$storage_state" \
  --viewport-size=390,844 \
  --wait-for-timeout=3000 \
  --full-page \
  https://zed.dev/ \
  screenshots/zed-home-dark-mobile-full.png
