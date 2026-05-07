"""
Scraper de metricas Shopee Ads — interceptacao da resposta pas/v1/homepage/query/.
Navega para o painel Shopee Ads e captura os dados de cada campanha ativa.
"""
from playwright.sync_api import Page, Response
from executors.shopee import login

PAS_URL  = "https://seller.shopee.com.br/portal/marketing/pas/assembly?source_page_id=2"
PAS_HOST = "seller.shopee.com.br"
QUERY_PATH = "pas/v1/homepage/query/"


def _extract_entries(data: dict, account: str) -> list[dict]:
    entry_list = (data.get("data") or {}).get("entry_list") or []
    results = []
    for entry in entry_list:
        campaign = entry.get("campaign") or {}
        campaign_id = campaign.get("campaign_id")
        if not campaign_id:
            continue
        report = entry.get("report") or {}
        impressions = int(report.get("impression") or 0)
        clicks      = int(report.get("click") or 0)
        # Shopee armazena valores em micro-unidades (1/100000 BRL)
        cost        = (report.get("cost") or 0) / 100000
        revenue     = (report.get("broad_gmv") or 0) / 100000
        roas        = float(report.get("broad_roi") or 0)
        acos        = float(report.get("broad_cir") or 0) * 100  # ratio → percentual
        orders      = int(report.get("broad_order") or 0)
        results.append({
            "platform":      "shopee",
            "account":       account,
            "campaign_id":   str(campaign_id),
            "campaign_name": entry.get("title") or str(campaign_id),
            "impressions":   impressions,
            "clicks":        clicks,
            "ctr":           round(clicks / impressions * 100, 4) if impressions else 0,
            "spend":         round(cost, 2),
            "conversions":   orders,
            "roas":          round(roas, 4),
            "acos":          round(acos, 4),
            "revenue":       round(revenue, 2),
        })
    return results


def scrape(page: Page, account: str = "feminnita") -> list[dict]:
    print(f"[Shopee Metrics] Iniciando scraping — conta={account}")

    if not login(page, account):
        raise Exception(f"[Shopee Metrics] Falha no login — conta={account}")

    pending: list[dict] = []

    def on_response(response: Response):
        if PAS_HOST not in response.url:
            return
        if QUERY_PATH not in response.url:
            return
        if response.status != 200:
            return
        try:
            pending.append(response.json())
        except Exception:
            pass

    page.on("response", on_response)

    print(f"[Shopee Metrics] Navegando para Shopee Ads")
    page.goto(PAS_URL, timeout=40000, wait_until="domcontentloaded")
    page.wait_for_timeout(8000)

    for _ in range(3):
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(2000)

    all_campaigns = []
    for data in pending:
        found = _extract_entries(data, account)
        all_campaigns.extend(found)

    # Deduplicar por campaign_id
    seen: set = set()
    unique = []
    for m in all_campaigns:
        if m["campaign_id"] not in seen:
            seen.add(m["campaign_id"])
            unique.append(m)

    print(f"[Shopee Metrics] {len(unique)} campanhas capturadas — conta={account}")
    return unique
