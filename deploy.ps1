# deploy.ps1 — Full deploy: build local + envia tudo para o VPS + restart
# Uso: .\deploy.ps1

# Servidor REAL do marketing.feminnita.com.br: Vultr 216.238.107.134
# (NÃO é o Hostinger 72.61.55.194 — esse tem uma cópia que não serve o domínio)
$VPS = "root@216.238.107.134"
$REMOTE_DIR = "/var/www/feminnita-marketing"

Write-Host "==> Aplicando migrações no banco..." -ForegroundColor Cyan
npm run db:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "AVISO: db:push falhou, continuando deploy..." -ForegroundColor Yellow
}

Write-Host "==> Buildando localmente (frontend + backend)..." -ForegroundColor Cyan
npm run build:full
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: build falhou. Deploy cancelado." -ForegroundColor Red
    exit 1
}

Write-Host "==> Compactando frontend..." -ForegroundColor Cyan
tar -czf dist/public.tar.gz -C dist public
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: tar falhou." -ForegroundColor Red
    exit 1
}

Write-Host "==> Enviando frontend (tar) para o VPS..." -ForegroundColor Cyan
scp dist/public.tar.gz "$VPS`:$REMOTE_DIR/dist/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: scp public.tar.gz falhou." -ForegroundColor Red
    exit 1
}

Write-Host "==> Extraindo frontend no VPS..." -ForegroundColor Cyan
ssh $VPS "cd $REMOTE_DIR/dist && rm -rf public && tar -xzf public.tar.gz && rm public.tar.gz"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: extração no VPS falhou." -ForegroundColor Red
    exit 1
}

Write-Host "==> Enviando backend (dist/index.js) para o VPS..." -ForegroundColor Cyan
scp dist/index.js "$VPS`:$REMOTE_DIR/dist/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: scp dist/index.js falhou." -ForegroundColor Red
    exit 1
}

Write-Host "==> Reiniciando pm2 no VPS..." -ForegroundColor Cyan
ssh $VPS "pm2 restart feminnita-marketing"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: pm2 restart falhou." -ForegroundColor Red
    exit 1
}

Write-Host "Deploy completo!" -ForegroundColor Green
