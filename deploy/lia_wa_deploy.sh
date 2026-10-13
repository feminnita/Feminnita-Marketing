#!/bin/bash
# Publica a Lia no WhatsApp oficial (MODO TESTE) no sistema de marketing.
# Sem git pull: aplica os pacotes de mudanca (git am) sobre o que ja esta no servidor,
# preservando as mudancas locais (Sofia, renovador Shopee). Conflito = aborta sem mexer.
set -e
cd /var/www/feminnita-marketing
echo "Versao antes: $(git log --oneline -1)"
cp dist/index.js /tmp/index.js.antes-lia-wa
if ! git -c user.name="Feminnita" -c user.email="feminnita@gmail.com" am --3way /tmp/lia_patches/*.patch; then
  git am --abort || true
  echo "CONFLITO ao aplicar - NADA foi aplicado. Mande print para o Claude."
  exit 1
fi
echo "Versao depois: $(git log --oneline -1)"
node -e 'require("dotenv").config();const m=require("mysql2/promise");(async()=>{const c=await m.createConnection(process.env.DATABASE_URL);const fs=require("fs");for(const s of fs.readFileSync("drizzle/0048_wa_oficial.sql","utf8").split(";").map(x=>x.trim()).filter(Boolean)){await c.query(s)}const [r]=await c.query("show tables like \"wa_%\"");console.log("tabelas:",r.map(x=>Object.values(x)[0]).join(", "));await c.end()})()'
grep -q '^WA_MODO=' .env || echo 'WA_MODO=teste' >> .env
echo "WA_MODO: $(grep '^WA_MODO=' .env | cut -d= -f2)"
npm run build:full --silent > /tmp/build_lia_wa.log 2>&1 || { tail -20 /tmp/build_lia_wa.log; cp /tmp/index.js.antes-lia-wa dist/index.js; echo "BUILD FALHOU - voltei o sistema anterior"; exit 1; }
pm2 restart feminnita-marketing --update-env >/dev/null
sleep 8
pm2 jlist | python3 -c "import sys,json;[print('Sistema:',p['name'],p['pm2_env']['status']) for p in json.load(sys.stdin) if p['name']=='feminnita-marketing']"
curl -s -o /dev/null -w "Webhook com token errado: %{http_code} (esperado 403)\n" "http://127.0.0.1:3002/api/webhooks/whatsapp-oficial?hub.mode=subscribe&hub.verify_token=errado&hub.challenge=1"
curl -s -o /dev/null -w "Webhook sem assinatura: %{http_code} (esperado 401)\n" -X POST -H "Content-Type: application/json" -d '{}' "http://127.0.0.1:3002/api/webhooks/whatsapp-oficial"
curl -s -o /dev/null -w "Atendido sem segredo: %{http_code} (esperado 401)\n" -X POST -H "Content-Type: application/json" -d '{}' "http://127.0.0.1:3002/api/atendimento/liberar"
