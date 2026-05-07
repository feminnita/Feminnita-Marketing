"""
Agente Playwright — Feminnita Marketing
Executa ações aprovadas de Gabi (ML), Luiza (Shopee) e Duda (Tray) via browser.

Fluxo:
  1. Polling na tabela agent_actions (status='approved')
  2. Identifica plataforma pelo agentName
  3. Abre browser Playwright e executa
  4. Atualiza status: done | falhou (volta a approved para nova tentativa)
"""

import time
import traceback
from playwright.sync_api import sync_playwright
from config import POLL_INTERVAL, HEADLESS, WEBSHARE_HOST, WEBSHARE_PORT, WEBSHARE_USER, WEBSHARE_PASS
from db import get_approved_actions, set_executing, set_done, set_failed, save_marketplace_metrics
from executors import ml, shopee, tray
from executors import ml_metrics, shopee_metrics, amazon_metrics

AGENT_PLATFORM = {
    "gabi":  "ml",
    "luiza": "shopee",
    "duda":  "tray",
    "alice": "amazon",
}

METRICS_SCRAPERS = {
    "ml":     ml_metrics.scrape,
    "shopee": shopee_metrics.scrape,
    "amazon": amazon_metrics.scrape,
}

def scrape_metrics_action(browser, payload: dict) -> str:
    platform = payload.get("platform", "ml")
    account  = payload.get("account", "feminnita")
    scraper  = METRICS_SCRAPERS.get(platform)
    if not scraper:
        raise Exception(f"Plataforma de métricas desconhecida: {platform}")

    context = browser.new_context(
        viewport={"width": 1280, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
    )
    page = context.new_page()
    try:
        metrics = scraper(page, account=account)
        if metrics:
            save_marketplace_metrics(metrics)
            return f"{len(metrics)} campanhas {platform.upper()} coletadas e salvas (conta={account})"
        else:
            return f"Nenhuma metrica capturada para {platform}/{account}"
    finally:
        try:
            context.close()
        except Exception:
            pass

def process_action(browser, action: dict):
    action_id   = action["id"]
    agent_name  = action["agentName"].lower()
    action_type = action["actionType"]
    payload     = action.get("payload") or {}
    title       = action["title"]

    print(f"\n[Agente] ID={action_id} agent={agent_name} acao={action_type}")
    print(f"[Agente] Titulo: {title}")

    set_executing(action_id)

    # Acao de scraping de metricas — nao depende de plataforma de agente
    if action_type == "scrape_ads_metrics":
        try:
            result = scrape_metrics_action(browser, payload)
            set_done(action_id, result)
            print(f"[Agente] OK: {result}")
        except Exception as e:
            set_failed(action_id, str(e))
            print(f"[Agente] ERRO: {e}")
        return

    platform = AGENT_PLATFORM.get(agent_name)
    if not platform:
        set_failed(action_id, f"Agente desconhecido: {agent_name}")
        return

    context = browser.new_context(
        viewport={"width": 1280, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
    )
    page = context.new_page()

    try:
        if platform == "ml":
            result = ml.execute(page, action_type, payload)
        elif platform == "shopee":
            result = shopee.execute(page, action_type, payload)
        elif platform == "tray":
            result = tray.execute(page, action_type, payload)
        elif platform == "amazon":
            result = f"Amazon executor ainda nao implementado para: {action_type}"
        else:
            raise Exception(f"Plataforma nao suportada: {platform}")

        set_done(action_id, result)
        print(f"[Agente] OK: {result}")

    except Exception as e:
        error = traceback.format_exc()
        set_failed(action_id, str(e))
        print(f"[Agente] ERRO: {e}")
        print(error)

    finally:
        try:
            context.close()
        except Exception:
            pass

def run():
    print("[Agente] Iniciando agente Playwright — Feminnita Marketing")
    print(f"[Agente] Polling a cada {POLL_INTERVAL}s | headless={HEADLESS}")
    print("[Agente] Scraping de metricas: sob demanda (disparado pelos agentes)")

    proxy = None
    if WEBSHARE_HOST and WEBSHARE_PORT:
        # Porta 5696/1080 = SOCKS5 direto; demais = HTTP (ex: privoxy local na 8118)
        protocol = "socks5" if WEBSHARE_PORT in ("5696", "1080") else "http"
        proxy = {"server": f"{protocol}://{WEBSHARE_HOST}:{WEBSHARE_PORT}"}
        if WEBSHARE_USER and WEBSHARE_PASS:
            proxy["username"] = WEBSHARE_USER
            proxy["password"] = WEBSHARE_PASS
        print(f"[Agente] Proxy: {protocol}://{WEBSHARE_HOST}:{WEBSHARE_PORT}")
    else:
        print("[Agente] Proxy: nao configurado (uso direto do IP do VPS)")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=HEADLESS, args=["--no-sandbox"], proxy=proxy)

        while True:
            try:
                actions = get_approved_actions()
                if actions:
                    print(f"[Agente] {len(actions)} acao(oes) aprovada(s)")
                    for action in actions:
                        process_action(browser, action)
                else:
                    print(f"[Agente] Nenhuma acao pendente. Aguardando {POLL_INTERVAL}s...")
            except Exception as e:
                print(f"[Agente] Erro no loop: {e}")

            time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    run()
