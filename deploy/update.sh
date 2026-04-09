#!/bin/bash
# ============================================================
# Feminnita Marketing — Atualizar deploy no VPS
# Rodar como root: bash /opt/marketing/deploy/update.sh
# ============================================================
set -e

APP_DIR="/opt/marketing"
SERVICE="marketing"

echo "[update] Parando serviço..."
systemctl stop $SERVICE

echo "[update] Atualizando código..."
cd $APP_DIR
git pull

echo "[update] Instalando dependências..."
pnpm install --frozen-lockfile

echo "[update] Fazendo build..."
pnpm build

echo "[update] Reiniciando serviço..."
systemctl start $SERVICE

echo "[update] Concluído!"
systemctl status $SERVICE --no-pager -l | head -10
