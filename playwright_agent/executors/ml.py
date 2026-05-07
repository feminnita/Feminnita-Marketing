"""
Executor ML — Acessa o painel do Mercado Livre via browser e executa ações
"""
import os, json, time
from playwright.sync_api import Page
from config import ML_EMAIL_FEMINNITA, ML_PASSWORD_FEMINNITA, ML_EMAIL_FNT, ML_PASSWORD_FNT

COOKIES_DIR = "/opt/playwright-agent/cookies"

_SAMESITE_MAP = {
    "no_restriction": "None",
    "lax": "Lax",
    "strict": "Strict",
    "unspecified": "None",
}

def get_credentials(account: str):
    if account == "fnt":
        return ML_EMAIL_FNT, ML_PASSWORD_FNT
    return ML_EMAIL_FEMINNITA, ML_PASSWORD_FEMINNITA

ML_SELLER_URL = "https://www.mercadolivre.com.br"
ML_ITEMS_URL  = "https://www.mercadolivre.com.br/anuncios"
ML_ADS_URL    = "https://ads.mercadolivre.com.br"

def _load_cookies(account: str) -> list:
    path = os.path.join(COOKIES_DIR, f"{account}_ml.json")
    if not os.path.exists(path):
        return []
    raw = json.load(open(path))
    cookies = []
    for c in raw:
        pw = {
            "name": c["name"],
            "value": c["value"],
            "domain": c["domain"],
            "path": c.get("path", "/"),
            "secure": c.get("secure", False),
            "httpOnly": c.get("httpOnly", False),
            "sameSite": _SAMESITE_MAP.get(c.get("sameSite", "unspecified"), "None"),
        }
        if "expirationDate" in c:
            pw["expires"] = int(c["expirationDate"])
        cookies.append(pw)
    return cookies

def _is_logged_in(page: Page) -> bool:
    return (
        page.locator(".nav-user-menu, [data-testid='avatar'], a[href*='minhas-compras']").count() > 0
        or ("login" not in page.url and "lgz" not in page.url)
    )

def login(page: Page, account: str = "feminnita") -> bool:
    # Tenta cookie injection primeiro
    cookies = _load_cookies(account)
    if cookies:
        print(f"[ML] Injetando {len(cookies)} cookies — conta={account}")
        page.context.add_cookies(cookies)
        page.goto("https://www.mercadolivre.com.br/", timeout=30000, wait_until="domcontentloaded")
        page.wait_for_timeout(3000)
        if _is_logged_in(page):
            print(f"[ML] Login via cookies OK — url={page.url[:80]}")
            return True
        print(f"[ML] Cookies expirados, tentando login normal")

    # Fallback: login com senha
    email, password = get_credentials(account)
    print(f"[ML] Fazendo login com senha — conta={account} email={email}")

    page.goto("https://www.mercadolivre.com.br/", timeout=30000, wait_until="domcontentloaded")
    page.wait_for_timeout(2000)

    try:
        page.click("a[href*='login']", timeout=8000)
        page.wait_for_timeout(4000)
    except Exception as e:
        print(f"[ML] Step entrar: {e}")

    try:
        page.wait_for_selector("input[name='user_id']", timeout=10000)
        page.fill("input[name='user_id']", email, timeout=5000)
        page.click("button[type='submit']", timeout=5000)
        page.wait_for_timeout(5000)
    except Exception as e:
        print(f"[ML] Step email: {e}")

    try:
        page.wait_for_selector(
            "input[type='password'], li:has-text('Você vai digitar sua senha')",
            timeout=10000
        )
        if page.locator("li:has-text('Você vai digitar sua senha')").count() > 0:
            print("[ML] Tela de metodo detectada — clicando Senha")
            page.locator("li:has-text('Você vai digitar sua senha')").first.click(timeout=5000)
            page.wait_for_timeout(3000)
    except Exception as e:
        print(f"[ML] Step metodo: {e}")

    try:
        page.wait_for_selector("input[type='password']", timeout=10000)
        page.fill("input[type='password']", password, timeout=5000)
        page.click("button[type='submit']", timeout=5000)
        page.wait_for_timeout(3000)
    except Exception as e:
        print(f"[ML] Step senha: {e}")

    url = page.url
    logged = _is_logged_in(page)
    print(f"[ML] Login {'OK' if logged else 'FALHOU'} — url={url[:80]}")
    return logged

def pause_item(page: Page, payload: dict) -> str:
    item_id = payload["itemId"]
    title   = payload.get("itemTitle", item_id)
    print(f"[ML] Pausando anúncio {item_id} — {title}")
    page.goto(f"https://www.mercadolivre.com.br/anuncios/{item_id}")
    page.wait_for_load_state("networkidle")
    btn = page.locator("button:has-text('Pausar'), button:has-text('pausar')").first
    btn.click(timeout=8000)
    page.wait_for_timeout(2000)
    return f"Anúncio {item_id} pausado com sucesso"

def activate_item(page: Page, payload: dict) -> str:
    item_id = payload["itemId"]
    print(f"[ML] Reativando anúncio {item_id}")
    page.goto(f"https://www.mercadolivre.com.br/anuncios/{item_id}")
    page.wait_for_load_state("networkidle")
    btn = page.locator("button:has-text('Ativar'), button:has-text('ativar'), button:has-text('Reativar')").first
    btn.click(timeout=8000)
    page.wait_for_timeout(2000)
    return f"Anúncio {item_id} reativado com sucesso"

def update_price(page: Page, payload: dict) -> str:
    item_id = payload["itemId"]
    price   = payload["price"]
    print(f"[ML] Atualizando preço {item_id} → R${price}")
    page.goto(f"https://www.mercadolivre.com.br/anuncios/{item_id}/modificar")
    page.wait_for_load_state("networkidle")
    price_input = page.locator("input[name='price'], input[placeholder*='preço'], input[placeholder*='Preço']").first
    price_input.fill(str(price), timeout=8000)
    page.locator("button[type='submit'], button:has-text('Salvar')").first.click()
    page.wait_for_timeout(2000)
    return f"Preço do anúncio {item_id} atualizado para R${price}"

def update_stock(page: Page, payload: dict) -> str:
    item_id  = payload["itemId"]
    quantity = payload["quantity"]
    print(f"[ML] Atualizando estoque {item_id} → {quantity}")
    page.goto(f"https://www.mercadolivre.com.br/anuncios/{item_id}/modificar")
    page.wait_for_load_state("networkidle")
    stock_input = page.locator("input[name='available_quantity'], input[placeholder*='estoque'], input[placeholder*='Estoque']").first
    stock_input.fill(str(quantity), timeout=8000)
    page.locator("button[type='submit'], button:has-text('Salvar')").first.click()
    page.wait_for_timeout(2000)
    return f"Estoque do anúncio {item_id} atualizado para {quantity}"

def _find_campaign_row(page: Page, campaign_id: str, campaign_name: str) -> object:
    """
    Localiza a linha da campanha na tabela do painel de Ads.
    Tenta por nome primeiro (mais confiável), depois por ID como fallback.
    """
    if campaign_name:
        row = page.locator(f"tr:has-text('{campaign_name}'), [class*='campaign']:has-text('{campaign_name}')").first
        if row.count() > 0:
            print(f"[ML] Campanha encontrada pelo nome: {campaign_name}")
            return row
    # fallback por ID
    row = page.locator(f"[data-campaign-id='{campaign_id}'], [data-id='{campaign_id}'], tr:has-text('{campaign_id}')").first
    if row.count() > 0:
        print(f"[ML] Campanha encontrada pelo ID: {campaign_id}")
        return row
    return None


def pause_ads_campaign(page: Page, payload: dict) -> str:
    campaign_id   = payload.get("campaignId", "")
    campaign_name = payload.get("campaignName", "")
    print(f"[ML] Pausando campanha '{campaign_name or campaign_id}'")
    page.goto(f"{ML_ADS_URL}/campaigns")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)

    row = _find_campaign_row(page, campaign_id, campaign_name)
    if row:
        btn = row.locator("button[aria-label*='ausar'], button:has-text('Pausar'), button:has-text('pausar')").first
        btn.click(timeout=8000)
        page.wait_for_timeout(2000)
        return f"Campanha '{campaign_name or campaign_id}' pausada"

    # fallback: procurar toggle de status ativo
    toggle = page.locator("button[aria-label*='Pausar'], button:has-text('Pausar')").first
    toggle.click(timeout=8000)
    page.wait_for_timeout(2000)
    return f"Campanha pausada (fallback genérico)"


def update_ads_budget(page: Page, payload: dict) -> str:
    campaign_id   = payload.get("campaignId", "")
    campaign_name = payload.get("campaignName", "")
    budget        = payload["budget"]
    print(f"[ML] Atualizando orçamento '{campaign_name or campaign_id}' → R${budget}")

    # Tentar navegar direto pelo ID (pode funcionar se for o ID real do painel)
    page.goto(f"{ML_ADS_URL}/campaigns")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)

    row = _find_campaign_row(page, campaign_id, campaign_name)
    if row:
        # Clicar no botão de editar/configurar da linha
        edit_btn = row.locator("button[aria-label*='ditar'], button:has-text('Editar'), a:has-text('Editar'), [aria-label*='onfigurar']").first
        if edit_btn.count() > 0:
            edit_btn.click(timeout=8000)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(2000)

    # Preencher o campo de budget onde estiver
    budget_input = page.locator("input[name='budget'], input[name='daily_budget'], input[placeholder*='rçamento'], input[placeholder*='udget']").first
    budget_input.fill(str(budget), timeout=8000)
    page.locator("button:has-text('Salvar'), button[type='submit'], button:has-text('Confirmar')").first.click()
    page.wait_for_timeout(2000)
    return f"Orçamento de '{campaign_name or campaign_id}' atualizado para R${budget}/dia"

ACTIONS = {
    "pause_item":         pause_item,
    "activate_item":      activate_item,
    "update_price":       update_price,
    "update_stock":       update_stock,
    "pause_ads_campaign": pause_ads_campaign,
    "update_ads_budget":  update_ads_budget,
}

def execute(page: Page, action_type: str, payload: dict) -> str:
    if not login(page, payload.get("account", "feminnita")):
        raise Exception("Falha no login do Mercado Livre")
    handler = ACTIONS.get(action_type)
    if not handler:
        raise Exception(f"Ação ML desconhecida: {action_type}")
    return handler(page, payload)
