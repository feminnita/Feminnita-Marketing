"""
Scraper de metricas ML Ads via interceptacao de resposta GraphQL (Playwright).
Abordagem: navegar no dashboard de publicidade e capturar as respostas GraphQL
que o browser faz automaticamente, paginando via clique no botao de proxima pagina.
"""
import json, os, time
from urllib.parse import unquote
from playwright.sync_api import Page, Response
from executors.ml import login

COOKIES_DIR = "/opt/playwright-agent/cookies"
ADS_URL = "https://publicidade.mercadolivre.com.br/"
PA_HOST = "pa.mercadolivre.com.br"

NEXT_PAGE_SELECTOR = "li.andes-pagination__button--next:not(.andes-pagination__button--disabled) a.andes-pagination__link"


def _load_advertiser_ids(account: str):
    path = os.path.join(COOKIES_DIR, f"{account}_ml.json")
    raw = json.load(open(path))
    user_id = None
    advertiser_id = None
    for c in raw:
        if c["name"] == "orguseridp":
            try:
                user_id = int(c["value"])
            except Exception:
                pass
        if c["name"] == "_ma_dsp_account-structure":
            try:
                data = json.loads(unquote(c["value"]))
                advertiser_id = int(data.get("advertiserId", 0))
            except Exception:
                pass
    return user_id, advertiser_id


def _drain(pending: list, raw_campaigns: list) -> int | None:
    """Process captured responses, return total if found."""
    total = None
    to_process = list(pending)
    pending.clear()
    for resp in to_process:
        try:
            body = resp.json()
            cwm = (body.get("data") or {}).get("padsAdvertiser", {}).get("campaignsWithMetrics", {})
            if not cwm:
                continue
            results = cwm.get("results", [])
            if not results:
                continue
            paging_total = cwm.get("paging", {}).get("total")
            if paging_total is not None:
                total = paging_total
            raw_campaigns.extend(results)
        except Exception:
            pass
    return total


def _click_next_page(page: Page) -> bool:
    try:
        btn = page.locator(NEXT_PAGE_SELECTOR).first
        if btn.count() > 0 and btn.is_visible(timeout=2000):
            btn.click()
            return True
    except Exception:
        pass
    return False


def scrape(page: Page, account: str = "feminnita") -> list[dict]:
    print(f"[ML Metrics] Iniciando scraping — conta={account}")

    if not login(page, account):
        raise Exception(f"[ML Metrics] Falha no login — conta={account}")

    user_id, advertiser_id = _load_advertiser_ids(account)
    if not user_id or not advertiser_id:
        raise Exception(f"[ML Metrics] userId/advertiserId nao encontrados nos cookies — conta={account}")

    print(f"[ML Metrics] userId={user_id} advertiserId={advertiser_id}")

    pending_responses: list[Response] = []
    raw_campaigns: list[dict] = []
    total_expected: int | None = None

    def on_response(response: Response):
        if PA_HOST in response.url and response.status == 200:
            pending_responses.append(response)

    page.on("response", on_response)

    page.goto(ADS_URL, timeout=40000, wait_until="domcontentloaded")
    page.wait_for_load_state("networkidle", timeout=30000)
    page.wait_for_timeout(3000)

    found = _drain(pending_responses, raw_campaigns)
    if found is not None:
        total_expected = found
        print(f"[ML Metrics] Total campanhas: {total_expected}")
    print(f"[ML Metrics] Capturados {len(raw_campaigns)}/{total_expected or '?'}")

    for _ in range(20):
        if total_expected is not None and len(raw_campaigns) >= total_expected:
            break

        if not _click_next_page(page):
            print("[ML Metrics] Sem botao de proxima pagina — parando")
            break

        page.wait_for_load_state("networkidle", timeout=15000)
        page.wait_for_timeout(1500)

        found = _drain(pending_responses, raw_campaigns)
        if found is not None:
            total_expected = found
        print(f"[ML Metrics] Capturados {len(raw_campaigns)}/{total_expected or '?'}")

    all_campaigns = []
    for item in raw_campaigns:
        impressions = int(item.get("impressions") or 0)
        clicks      = int(item.get("clicks") or 0)
        all_campaigns.append({
            "platform":      "ml",
            "account":       account,
            "campaign_id":   str(item.get("id", "")),
            "campaign_name": item.get("name", ""),
            "impressions":   impressions,
            "clicks":        clicks,
            "ctr":           round(clicks / impressions * 100, 4) if impressions else 0,
            "spend":         float(item.get("cost") or 0),
            "conversions":   int(item.get("soldItemsConversion") or 0),
            "roas":          float(item.get("roas") or 0),
            "acos":          float(item.get("tacos") or 0),
            "revenue":       float(item.get("amountTotal") or 0),
        })

    print(f"[ML Metrics] {len(all_campaigns)} campanhas capturadas — conta={account}")
    return all_campaigns
