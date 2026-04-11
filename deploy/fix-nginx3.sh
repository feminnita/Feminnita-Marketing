#!/bin/bash
set -e

echo "[1/4] Escrevendo config nginx..."
cat > /etc/nginx/sites-available/marketing << 'NGINXCONF'
server {
    listen 80;
    server_name marketing.feminnita.com.br;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_read_timeout 120s;
    }
}
NGINXCONF

echo "[2/4] Verificando symlink em sites-enabled..."
if [ -L /etc/nginx/sites-enabled/marketing ]; then
    echo "       Symlink ja existe."
else
    ln -sf /etc/nginx/sites-available/marketing /etc/nginx/sites-enabled/marketing
    echo "       Symlink criado."
fi

echo "[3/4] Testando configuracao nginx..."
nginx -t

echo "[4/4] Recarregando nginx..."
systemctl reload nginx

echo "=== VERIFICACAO FINAL ==="
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/)
echo "HTTP status: $STATUS"
echo "CONCLUIDO."
