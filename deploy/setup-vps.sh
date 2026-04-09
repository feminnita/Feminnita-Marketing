#!/bin/bash
# ============================================================
# Feminnita Marketing — Setup inicial no VPS
# Ubuntu 22.04 | Porta 5052 | /opt/marketing
# Rodar como root: bash setup-vps.sh
# ============================================================
set -e

REPO="https://github.com/feminnita/Feminnita-Marketing.git"
APP_DIR="/opt/marketing"
PORT=5052
SERVICE="marketing"

echo ""
echo "========================================"
echo "  Feminnita Marketing — Setup VPS"
echo "========================================"
echo ""

# ── 1. Node.js 20 LTS ────────────────────────────────────────
echo "[1/7] Instalando Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
echo "  Node: $(node --version)"

# ── 2. pnpm ──────────────────────────────────────────────────
echo "[2/7] Instalando pnpm..."
npm install -g pnpm
echo "  pnpm: $(pnpm --version)"

# ── 3. Clonar repositório ────────────────────────────────────
echo "[3/7] Clonando repositório..."
if [ -d "$APP_DIR" ]; then
  echo "  Diretório já existe — fazendo git pull..."
  cd "$APP_DIR"
  git pull
else
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 4. Instalar dependências e build ─────────────────────────
echo "[4/7] Instalando dependências..."
pnpm install --frozen-lockfile

echo "[4/7] Fazendo build..."
pnpm build

# ── 5. Copiar .env ────────────────────────────────────────────
echo "[5/7] Configurando .env..."
if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  echo ""
  echo "  ⚠️  ATENÇÃO: edite o arquivo $APP_DIR/.env com suas credenciais!"
  echo "  Execute: nano $APP_DIR/.env"
  echo ""
fi

# ── 6. Systemd service ───────────────────────────────────────
echo "[6/7] Criando serviço systemd..."
cat > /etc/systemd/system/${SERVICE}.service << EOF
[Unit]
Description=Feminnita Marketing Platform
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}
ExecStart=/usr/bin/node ${APP_DIR}/dist/index.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=${SERVICE}
Environment=NODE_ENV=production
Environment=PORT=${PORT}

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ${SERVICE}
systemctl start ${SERVICE}
echo "  Serviço '$SERVICE' iniciado na porta $PORT"

# ── 7. Nginx ─────────────────────────────────────────────────
echo "[7/7] Configurando Nginx..."
cat > /etc/nginx/sites-available/${SERVICE} << EOF
server {
    listen 80;
    server_name marketing.feminnita.com.br;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 120s;
    }
}
EOF

ln -sf /etc/nginx/sites-available/${SERVICE} /etc/nginx/sites-enabled/${SERVICE}
nginx -t && systemctl reload nginx
echo "  Nginx configurado para marketing.feminnita.com.br"

echo ""
echo "========================================"
echo "  Setup concluído!"
echo "========================================"
echo ""
echo "  Próximos passos:"
echo "  1. Edite o .env:  nano $APP_DIR/.env"
echo "  2. Reinicie:      systemctl restart $SERVICE"
echo "  3. Veja os logs:  journalctl -u $SERVICE -f"
echo "  4. SSL (HTTPS):   certbot --nginx -d marketing.feminnita.com.br"
echo ""
echo "  Status atual:"
systemctl status ${SERVICE} --no-pager -l | head -15
