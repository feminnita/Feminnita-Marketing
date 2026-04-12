#!/usr/bin/env bash
# Deploy Feminnita Marketing → VPS 72.61.55.194
# Run from Windows Git Bash: bash deploy/deploy.sh
set -e

VPS="root@72.61.55.194"
APP_DIR="/opt/feminnita-marketing"

echo "==> Building..."
npm run build

echo "==> Uploading dist..."
scp -r dist "$VPS:$APP_DIR/"

echo "==> Uploading .env..."
scp .env "$VPS:$APP_DIR/.env"

echo "==> Restarting service..."
ssh "$VPS" "systemctl restart marketing"

echo "==> Done! Check: http://marketing.feminnita.com.br"
