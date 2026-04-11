#!/bin/bash
cat > /etc/nginx/sites-available/marketing << 'EOF'
server {
    listen 80;
    server_name marketing.feminnita.com.br;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_read_timeout 120s;
    }
}
EOF
echo "=== Config escrito ==="
cat /etc/nginx/sites-available/marketing
ln -sf /etc/nginx/sites-available/marketing /etc/nginx/sites-enabled/marketing
nginx -t && systemctl reload nginx
echo "=== OK. Testando ==="
curl -s -o /dev/null -w "HTTP status: %{http_code}\n" http://marketing.feminnita.com.br/
