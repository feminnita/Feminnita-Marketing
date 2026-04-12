#!/bin/bash
certbot --nginx --non-interactive --agree-tos \
  -m admin@feminnita.com.br \
  -d marketing.feminnita.com.br
systemctl reload nginx
echo "HTTPS configurado!"
