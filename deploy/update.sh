#!/bin/bash
# ============================================================
# Feminnita Marketing — Atualizar deploy no VPS
# Rodar como root: bash /opt/marketing/deploy/update.sh
# ============================================================
set -e

APP_DIR="/opt/marketing"
SERVICE="marketing"

echo "[update] Atualizando código..."
cd $APP_DIR

# Descartar modificações locais para garantir pull limpo
git stash --include-untracked 2>/dev/null || true
# Remover arquivos não rastreados que possam bloquear o pull
git clean -fd --exclude="*.env" 2>/dev/null || true
git pull

echo "[update] Instalando dependências..."
# Sem --frozen-lockfile para tolerar atualizações de package.json
pnpm install

echo "[update] Fazendo build..."
pnpm build

echo "[update] Gerando ícones PWA..."
convert $APP_DIR/dist/public/logo.png -resize 512x512 -background '#6B1D28' -gravity center -extent 512x512 $APP_DIR/dist/public/icon-512.png 2>/dev/null || true
convert $APP_DIR/dist/public/icon-512.png -resize 192x192 $APP_DIR/dist/public/icon-192.png 2>/dev/null || true

echo "[update] Reiniciando serviço..."
# Garantir que a porta 3000 está livre antes de subir o novo processo
fuser -k 3000/tcp 2>/dev/null || true
sleep 1
systemctl restart $SERVICE

echo "[update] Concluído!"
systemctl status $SERVICE --no-pager -l | head -10
