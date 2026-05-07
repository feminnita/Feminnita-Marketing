"""
Executor Tray — Acessa o painel da Tray via browser para edições de SEO e produtos
"""
from playwright.sync_api import Page
from config import TRAY_EMAIL, TRAY_PASSWORD

def login(page: Page, store_url: str) -> bool:
    print(f"[Tray] Fazendo login em {store_url}")
    page.goto(f"{store_url}/admin/login")
    page.wait_for_load_state("networkidle")
    page.fill("input[name='email'], input[type='email']", TRAY_EMAIL, timeout=10000)
    page.fill("input[name='password'], input[type='password']", TRAY_PASSWORD, timeout=5000)
    page.locator("button[type='submit'], button:has-text('Entrar')").first.click()
    page.wait_for_load_state("networkidle", timeout=20000)
    logged = "/admin/dashboard" in page.url or "/admin/" in page.url
    print(f"[Tray] Login {'OK' if logged else 'FALHOU'}")
    return logged

def update_seo_title(page: Page, payload: dict) -> str:
    store_url  = payload["storeUrl"]
    product_id = payload.get("productId")
    new_title  = payload["seoTitle"]
    print(f"[Tray] Atualizando SEO title produto {product_id}")
    page.goto(f"{store_url}/admin/products/edit/{product_id}")
    page.wait_for_load_state("networkidle")
    seo_tab = page.locator("a:has-text('SEO'), button:has-text('SEO'), [data-tab='seo']").first
    seo_tab.click(timeout=5000)
    title_input = page.locator("input[name='seo_title'], input[placeholder*='Título SEO']").first
    title_input.fill(new_title, timeout=5000)
    page.locator("button:has-text('Salvar'), button[type='submit']").first.click()
    page.wait_for_timeout(2000)
    return f"SEO title do produto {product_id} atualizado"

def update_seo_description(page: Page, payload: dict) -> str:
    store_url   = payload["storeUrl"]
    product_id  = payload.get("productId")
    description = payload["seoDescription"]
    print(f"[Tray] Atualizando SEO description produto {product_id}")
    page.goto(f"{store_url}/admin/products/edit/{product_id}")
    page.wait_for_load_state("networkidle")
    seo_tab = page.locator("a:has-text('SEO'), button:has-text('SEO'), [data-tab='seo']").first
    seo_tab.click(timeout=5000)
    desc_input = page.locator("textarea[name='seo_description'], textarea[placeholder*='Descrição SEO']").first
    desc_input.fill(description, timeout=5000)
    page.locator("button:has-text('Salvar'), button[type='submit']").first.click()
    page.wait_for_timeout(2000)
    return f"SEO description do produto {product_id} atualizada"

def update_product_description(page: Page, payload: dict) -> str:
    store_url   = payload["storeUrl"]
    product_id  = payload["productId"]
    description = payload["description"]
    print(f"[Tray] Atualizando descrição produto {product_id}")
    page.goto(f"{store_url}/admin/products/edit/{product_id}")
    page.wait_for_load_state("networkidle")
    desc_area = page.locator("textarea[name='description'], .ql-editor, [contenteditable='true']").first
    desc_area.fill(description, timeout=5000)
    page.locator("button:has-text('Salvar'), button[type='submit']").first.click()
    page.wait_for_timeout(2000)
    return f"Descrição do produto {product_id} atualizada"

def update_page_seo(page: Page, payload: dict) -> str:
    store_url = payload["storeUrl"]
    page_slug = payload.get("pageSlug", "")
    title     = payload.get("seoTitle", "")
    desc      = payload.get("seoDescription", "")
    print(f"[Tray] Atualizando SEO da página '{page_slug}'")
    page.goto(f"{store_url}/admin/pages")
    page.wait_for_load_state("networkidle")
    if page_slug:
        page.locator(f"a:has-text('{page_slug}'), tr:has-text('{page_slug}') a:has-text('Editar')").first.click(timeout=5000)
        page.wait_for_load_state("networkidle")
    if title:
        page.locator("input[name='seo_title']").fill(title, timeout=5000)
    if desc:
        page.locator("textarea[name='seo_description']").fill(desc, timeout=5000)
    page.locator("button:has-text('Salvar'), button[type='submit']").first.click()
    page.wait_for_timeout(2000)
    return f"SEO da página '{page_slug}' atualizado"

ACTIONS = {
    "update_seo_title":          update_seo_title,
    "update_seo_description":    update_seo_description,
    "update_product_description": update_product_description,
    "update_page_seo":           update_page_seo,
}

def execute(page: Page, action_type: str, payload: dict) -> str:
    store_url = payload.get("storeUrl", "")
    if not store_url:
        raise Exception("storeUrl não informado no payload")
    if not login(page, store_url):
        raise Exception("Falha no login da Tray")
    handler = ACTIONS.get(action_type)
    if not handler:
        raise Exception(f"Ação Tray desconhecida: {action_type}")
    return handler(page, payload)
