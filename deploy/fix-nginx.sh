#!/bin/bash
echo "=== Criando symlink ==="
ln -sf /etc/nginx/sites-available/marketing /etc/nginx/sites-enabled/marketing
echo "=== Verificando link ==="
ls -la /etc/nginx/sites-enabled/marketing
echo "=== Testando config nginx ==="
nginx -t
echo "=== Recarregando nginx ==="
systemctl reload nginx
echo "=== Testando HTTP ==="
curl -s -o /dev/null -w "HTTP status: %{http_code}\n" http://127.0.0.1:3000/
