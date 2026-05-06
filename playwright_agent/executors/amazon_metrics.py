"""
Scraper de métricas Amazon Ads — cookie injection + interceptação de responses.
Cookies exportados do browser via extensão (ex: Cookie-Editor) e salvos em
/opt/playwright-agent/cookies/feminnita_amazon.json
"""
import json, os
from playwright.sync_api import Page
from config import AMAZON_EMAIL, AMAZON_PASSWORD

COOKIES_DIR  = "/opt/playwright-agent/cookies"
ADS_BASE_URL = "https://advertising.amazon.com.br"

_SAMESITE_MAP = {"no_restriction": "None", "lax": "Lax", "strict": "Strict", "unspecified": "None"}


def _load_cookies(account: str) -> list:
    path = os.path.join(COOKIES_DIR, f"{account}_amazon.json")
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
    return "signin" not in page.url and "ap/signin" not in page.url and ADS_BASE_URL in page.url


def login(page: Page, account: str = "feminnita") -> bool:
    # 1) Tenta cookie injection
    cookies = _load_cookies(account)
    if cookies:
        print(f"[Amazon Metrics] Injetando {len(cookies)} cookies — conta={account}")
        page.context.add_cookies(cookies)
        page.goto(f"{ADS_BASE_URL}/cm/campaigns", timeout=30000, wait_until="domcontentloaded")
        page.wait_for_timeout(4000)
        if _is_logged_in(page):
            print(f"[Amazon Metrics] Login via cookies OK — url={page.url[:80]}")
            return True
        print("[Amazon Metrics] Cookies expirados, tentando login com senha")

    # 2) Fallback: login com senha
    print(f"[Amazon Metrics] Login com senha — {AMAZON_EMAIL}")
    page.goto(ADS_BASE_URL, timeout=20000, wait_until="domcontentloaded")
    page.wait_for_timeout(3000)
    try:
        page.fill("input[name='email'], #ap_email", AMAZON_EMAIL, timeout=8000)
        page.click("#continue, button:has-text('Continuar'), button:has-text('Continue')", timeout=8000)
        page.wait_for_timeout(1500)
        page.fill("input[name='password'], #ap_password", AMAZON_PASSWORD, timeout=8000)
        page.click("#signInSubmit, button[type='submit']", timeout=8000)
        page.wait_for_load_state("domcontentloaded", timeout=20000)
        page.wait_for_timeout(4000)
    except Exception as e:
        print(f"[Amazon Metrics] Erro no login: {e}")
        return False

    logged = _is_logged_in(page)
    print(f"[Amazon Metrics] Login {'OK' if logged else 'FALHOU'} — {page.url[:80]}")
    return logged


def _extract_campaign(item: dict, account: str) -> dict | None:
    if not isinstance(item, dict):
        return None
    campaign_id = (
        item.get("campaignId") or item.get("campaign_id") or
        item.get("id") or item.get("entityId")
    )
    if not campaign_id:
        return None
    return {
        "platform":      "amazon",
        "account":       account,
        "campaign_id":   str(campaign_id),
        "campaign_name": item.get("name") or item.get("campaignName") or str(campaign_id),
        "impressions":   int(item.get("impressions", 0) or 0),
        "clicks":        int(item.get("clicks", 0) or 0),
        "ctr":           float(item.get("clickThroughRate", 0) or item.get("ctr", 0) or 0),
        "spend":         float(item.get("cost", 0) or item.get("spend", 0) or 0),
        "conversions":   int(item.get("orders", 0) or item.get("purchasesClicks", 0) or item.get("conversions", 0) or 0),
        "roas":          float(item.get("roasClicks", 0) or item.get("roas", 0) or 0),
        "acos":          float(item.get("acosClicks", 0) or item.get("acos", 0) or 0),
        "revenue":       float(item.get("sales", 0) or item.get("salesClicks", 0) or item.get("revenue", 0) or 0),
    }


def _parse_response(url: str, data, account: str) -> list[dict]:
    results = []
    if isinstance(data, list):
        for item in data:
            c = _extract_campaign(item, account)
            if c:
                results.append(c)
    elif isinstance(data, dict):
        for key in ["campaigns", "data", "items", "results", "campaignMetrics", "campaignList"]:
            val = data.get(key)
            if isinstance(val, list):
                for item in val:
                    c = _extract_campaign(item, account)
                    if c:
                        results.append(c)
                if results:
                    break
        if not results:
            c = _extract_campaign(data, account)
            if c:
                results.append(c)
    return results


def scrape(page: Page, account: str = "feminnita") -> list[dict]:
    print(f"[Amazon Metrics] Iniciando scraping — conta={account}")
    if not login(page, account):
        raise Exception("[Amazon Metrics] Falha no login")

    api_responses = []

    _KEYWORDS = ["campaigns", "report", "metrics", "performance", "sponsored", "advertising", "cm/api"]

    def on_response(response):
        if response.status != 200:
            return
        url = response.url
        if not any(k in url for k in _KEYWORDS):
            return
        try:
            data = response.json()
            api_responses.append({"url": url, "data": data})
            print(f"[Amazon Metrics] Capturado: {url[:120]}")
        except Exception:
            pass

    page.on("response", on_response)

    pages_to_visit = [
        f"{ADS_BASE_URL}/cm/campaigns",
        f"{ADS_BASE_URL}/cm/sp/campaigns",
        f"{ADS_BASE_URL}/cm/sd/campaigns",
        ADS_BASE_URL,
    ]
    for url in pages_to_visit:
        try:
            page.goto(url, timeout=25000, wait_until="domcontentloaded")
            page.wait_for_timeout(6000)
            print(f"[Amazon Metrics] Visitado: {url} | responses={len(api_responses)}")
            if api_responses:
                break
        except Exception as e:
            print(f"[Amazon Metrics] {url}: {e}")

    all_metrics: list[dict] = []
    for resp in api_responses:
        all_metrics.extend(_parse_response(resp["url"], resp["data"], account))

    seen: set = set()
    unique = []
    for m in all_metrics:
        key = m["campaign_id"]
        if key not in seen:
            seen.add(key)
            unique.append(m)

    print(f"[Amazon Metrics] {len(unique)} campanhas capturadas")
    return unique
