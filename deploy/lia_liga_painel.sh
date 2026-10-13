#!/bin/bash
# Liga a Lia ao painel administrativo (tela Atendimento) e ao Telegram de alertas.
# - aplica os pacotes novos (git am; conflito = aborta sem mexer)
# - cria o segredo compartilhado com o painel (se ainda nao existir)
# - copia o token do robo de alertas do Telegram do sistema de gestao
# - recompila e reinicia; manda um alerta de teste no Telegram
set -e
cd /var/www/feminnita-marketing
echo "Versao antes: $(git log --oneline -1)"
if ! git -c user.name="Feminnita" -c user.email="feminnita@gmail.com" am --3way /tmp/lia_patches/*.patch; then
  git am --abort || true
  echo "CONFLITO ao aplicar - NADA foi aplicado. Mande print para o Claude."
  exit 1
fi
echo "Versao depois: $(git log --oneline -1)"
grep -q '^PAINEL_ATENDIMENTO_SECRET=' .env || echo "PAINEL_ATENDIMENTO_SECRET=$(openssl rand -hex 24)" >> .env
grep -q '^PAINEL_ATENDIMENTO_URL=' .env || echo 'PAINEL_ATENDIMENTO_URL=https://painel-administrativo-7lw1.onrender.com' >> .env
for v in TELEGRAM_ALERTA_TOKEN TELEGRAM_ALERTA_CHAT_ID; do
  grep -q "^$v=" .env || grep "^$v=" /opt/gestao/.env >> .env
done
echo "Variaveis: $(grep -cE '^(PAINEL_ATENDIMENTO_SECRET|PAINEL_ATENDIMENTO_URL|TELEGRAM_ALERTA_TOKEN|TELEGRAM_ALERTA_CHAT_ID)=' .env) de 4 configuradas"
cp dist/index.js /tmp/index.js.antes-lia-painel
npm run build:server --silent > /tmp/build_lia_painel.log 2>&1 || { tail -20 /tmp/build_lia_painel.log; cp /tmp/index.js.antes-lia-painel dist/index.js; echo "BUILD FALHOU - voltei o sistema anterior"; exit 1; }
pm2 restart feminnita-marketing --update-env >/dev/null
sleep 8
pm2 jlist | python3 -c "import sys,json;[print('Sistema:',p['name'],p['pm2_env']['status']) for p in json.load(sys.stdin) if p['name']=='feminnita-marketing']"
node -e 'require("dotenv").config();fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_ALERTA_TOKEN}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:process.env.TELEGRAM_ALERTA_CHAT_ID,text:"Teste: alerta de atendimento da Lia ligado. Quando uma cliente pedir uma pessoa, o aviso chega aqui."})}).then(r=>r.json()).then(j=>console.log("Telegram de teste:",j.ok?"ENVIADO":"FALHOU"))'
