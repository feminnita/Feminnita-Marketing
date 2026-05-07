"""
Executor Shopee — Acessa o painel do Shopee Seller Center via browser
"""
import json, os
from playwright.sync_api import Page
from config import SHOPEE_EMAIL_FEMINNITA, SHOPEE_PASSWORD_FEMINNITA, SHOPEE_EMAIL_FNT, SHOPEE_PASSWORD_FNT

COOKIES_DIR = "/opt/playwright-agent/cookies"
SELLER_URL  = "https://seller.shopee.com.br"

_SAMESITE_MAP = {"no_restriction": "None", "lax": "Lax", "strict": "Strict", "unspecified": "None"}

def get_credentials(account: str):
    if account == "fnt":
        return SHOPEE_EMAIL_FNT, SHOPEE_PASSWORD_FNT
    return SHOPEE_EMAIL_FEMINNITA, SHOPEE_PASSWORD_FEMINNITA

def _load_cookies(account: str) -> list:
    path = os.path.join(COOKIES_DIR, f"{account}_shopee.json")
    if not os.path.exists(path):
        return []
    raw = json.load(open(path))
    cookies = []
    for c in raw:
        pw = {k: c[k] for k in ("name", "value", "domain", "path", "secure", "httpOnly") if k in c}
        pw["sameSite"] = _SAMESITE_MAP.get(c.get("sameSite", "unspecified"), "None")
        if "expirationDate" in c:
            pw["expires"] = int(c["expirationDate"])
        cookies.append(pw)
    return cookies

def _is_logged_in(page: Page) -> bool:
    return "login" not in page.url and "/portal/login" not in page.url

def login(page: Page, account: str = "feminnita") -> bool:
    # Tenta cookie injection primeiro
    cookies = _load_cookies(account)
    if cookies:
        print(f"[Shopee] Injetando {len(cookies)} cookies — conta={account}")
        page.context.add_cookies(cookies)
        page.goto(f"{SELLER_URL}/portal/dashboard", timeout=30000, wait_until="domcontentloaded")
        page.wait_for_timeout(3000)
        if _is_logged_in(page):
            print(f"[Shopee] Login via cookies OK — url={page.url[:80]}")
            return True
        print(f"[Shopee] Cookies expirados, tentando login normal")

    # Fallback: login com senha
    email, password = get_credentials(account)
    print(f"[Shopee] Login com senha — conta={account} email={email}")
    page.goto(f"{SELLER_URL}/portal/login")
    page.wait_for_load_state("networkidle")
    try:
        page.fill("input[name='loginKey'], input[placeholder*='e-mail'], input[type='email']", email, timeout=10000)
        page.fill("input[name='password'], input[type='password']", password, timeout=5000)
        page.locator("button[type='submit'], button:has-text('Entrar'), button:has-text('Login')").first.click()
        page.wait_for_load_state("networkidle", timeout=20000)
    except Exception as e:
        print(f"[Shopee] Erro no login: {e}")
        return False
    logged = "/portal/dashboard" in page.url or "/portal/product" in page.url
    print(f"[Shopee] Login {'OK' if logged else 'FALHOU'} — {page.url[:80]}")
    return logged

def pause_product(page: Page, payload: dict) -> str:
    item_id = payload["itemId"]
    print(f"[Shopee] Desativando produto {item_id}")
    page.goto(f"{SELLER_URL}/portal/product/edit/{item_id}")
    page.wait_for_load_state("networkidle")
    toggle = page.locator("button[aria-label*='desativar'], .product-status-toggle").first
    toggle.click(timeout=8000)
    page.wait_for_timeout(2000)
    return f"Produto {item_id} desativado no Shopee"

def update_price(page: Page, payload: dict) -> str:
    item_id = payload["itemId"]
    price   = payload["price"]
    print(f"[Shopee] Atualizando preço {item_id} → R${price}")
    page.goto(f"{SELLER_URL}/portal/product/edit/{item_id}")
    page.wait_for_load_state("networkidle")
    price_input = page.locator("input[placeholder*='preço'], input[placeholder*='Preço']").first
    price_input.fill(str(price), timeout=8000)
    page.locator("button:has-text('Salvar'), button:has-text('Confirmar')").first.click()
    page.wait_for_timeout(2000)
    return f"Preço do produto {item_id} atualizado para R${price}"

def update_stock(page: Page, payload: dict) -> str:
    item_id  = payload["itemId"]
    quantity = payload["quantity"]
    print(f"[Shopee] Atualizando estoque {item_id} → {quantity}")
    page.goto(f"{SELLER_URL}/portal/product/edit/{item_id}")
    page.wait_for_load_state("networkidle")
    stock_input = page.locator("input[placeholder*='estoque'], input[placeholder*='Estoque']").first
    stock_input.fill(str(quantity), timeout=8000)
    page.locator("button:has-text('Salvar'), button:has-text('Confirmar')").first.click()
    page.wait_for_timeout(2000)
    return f"Estoque do produto {item_id} atualizado para {quantity}"

def manage_ads_campaign(page: Page, payload: dict) -> str:
    action    = payload.get("adsAction", "pause")
    camp_name = payload.get("campaignName", "")
    print(f"[Shopee] Ads — {action} campanha '{camp_name}'")
    page.goto(f"{SELLER_URL}/portal/marketing/ads")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(3000)
    if camp_name:
        page.locator(f"text={camp_name}").first.click(timeout=5000)
    if action == "pause":
        page.locator("button:has-text('Pausar'), button[aria-label*='pausar']").first.click(timeout=5000)
    elif action == "activate":
        page.locator("button:has-text('Ativar'), button[aria-label*='ativar']").first.click(timeout=5000)
    page.wait_for_timeout(2000)
    return f"Campanha '{camp_name}' — ação '{action}' executada"

ACTIONS = {
    "pause_product":       pause_product,
    "update_price":        update_price,
    "update_stock":        update_stock,
    "manage_ads_campaign": manage_ads_campaign,
}

def execute(page: Page, action_type: str, payload: dict) -> str:
    if not login(page, payload.get("account", "feminnita")):
        raise Exception("Falha no login do Shopee")
    handler = ACTIONS.get(action_type)
    if not handler:
        raise Exception(f"Ação Shopee desconhecida: {action_type}")
    return handler(page, payload)
