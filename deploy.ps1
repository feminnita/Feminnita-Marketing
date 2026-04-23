# deploy.ps1 — Full deploy: build local + envia tudo para o VPS + restart
# Uso: .\deploy.ps1

$VPS = "root@72.61.55.194"
$REMOTE_DIR = "/opt/marketing"

Write-Host "==> Buildando localmente..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: build falhou. Deploy cancelado." -ForegroundColor Red
    exit 1
}

Write-Host "==> Enviando frontend (dist/public) para o VPS..." -ForegroundColor Cyan
scp -r dist/public "$VPS`:$REMOTE_DIR/dist/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: scp dist/public falhou." -ForegroundColor Red
    exit 1
}

Write-Host "==> Enviando backend (dist/index.js) para o VPS..." -ForegroundColor Cyan
scp dist/index.js "$VPS`:$REMOTE_DIR/dist/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: scp dist/index.js falhou." -ForegroundColor Red
    exit 1
}

Write-Host "==> Reiniciando pm2 no VPS..." -ForegroundColor Cyan
ssh $VPS "pm2 restart feminnita"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: pm2 restart falhou." -ForegroundColor Red
    exit 1
}

Write-Host "Deploy completo!" -ForegroundColor Green
