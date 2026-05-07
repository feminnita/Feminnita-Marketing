import mysql.connector
import json
from datetime import datetime
from config import DATABASE_URL

def get_connection():
    # Parse mysql://user:pass@host:port/db
    url = DATABASE_URL.replace("mysql://", "")
    user_pass, rest = url.split("@", 1)
    user, password = user_pass.split(":", 1)
    host_port_db = rest.split("/", 1)
    host_port = host_port_db[0]
    db_name = host_port_db[1].split("?")[0]
    if ":" in host_port:
        host, port = host_port.split(":", 1)
        port = int(port)
    else:
        host, port = host_port, 4000

    return mysql.connector.connect(
        host=host, port=port, user=user, password=password,
        database=db_name, ssl_disabled=False, raise_on_warnings=False,
    )

def get_approved_actions():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """SELECT id, agentName, title, description, actionType, payload
           FROM agent_actions
           WHERE status = 'approved'
             AND agentName IN ('gabi', 'luiza', 'duda')
           ORDER BY createdAt ASC
           LIMIT 10"""
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    for row in rows:
        if row.get("payload") and isinstance(row["payload"], str):
            try:
                row["payload"] = json.loads(row["payload"])
            except Exception:
                pass
    return rows

def set_executing(action_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE agent_actions SET status='executing', updatedAt=%s WHERE id=%s",
        (datetime.now(), action_id)
    )
    conn.commit()
    cursor.close()
    conn.close()

def set_done(action_id: int, log: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE agent_actions SET status='done', executionLog=%s, executedAt=%s, updatedAt=%s WHERE id=%s",
        (log, datetime.now(), datetime.now(), action_id)
    )
    conn.commit()
    cursor.close()
    conn.close()

def save_marketplace_metrics(metrics: list[dict]):
    if not metrics:
        return
    conn = get_connection()
    cursor = conn.cursor()
    now = datetime.now()
    for m in metrics:
        cursor.execute(
            """INSERT INTO marketplace_ads_metrics
               (platform, account, campaignId, campaignName, impressions, clicks, ctr, spend, conversions, roas, acos, revenue, scrapedAt)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                m.get("platform", "ml"),
                m.get("account", "feminnita"),
                m["campaign_id"],
                m.get("campaign_name", ""),
                int(m.get("impressions", 0)),
                int(m.get("clicks", 0)),
                float(m.get("ctr", 0)),
                float(m.get("spend", 0)),
                int(m.get("conversions", 0)),
                float(m.get("roas", 0)),
                float(m.get("acos", 0)),
                float(m.get("revenue", 0)),
                now,
            )
        )
    conn.commit()
    cursor.close()
    conn.close()
    print(f"[DB] {len(metrics)} métricas salvas (plataforma={metrics[0].get('platform','?')})")


def get_latest_marketplace_metrics(platform: str = None, account: str = None) -> list[dict]:
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    filters = []
    params = []
    if platform:
        filters.append("m.platform = %s")
        params.extend([platform, platform])
    else:
        params.extend([])
    if account:
        filters.append("m.account = %s")
        params.extend([account, account])

    where_inner = ""
    where_outer = ""
    if platform:
        where_inner += " WHERE platform = %s"
        where_outer += " AND m.platform = %s"
    if account:
        where_inner += (" AND" if where_inner else " WHERE") + " account = %s"
        where_outer += " AND m.account = %s"

    inner_params = []
    outer_params = []
    if platform:
        inner_params.append(platform)
        outer_params.append(platform)
    if account:
        inner_params.append(account)
        outer_params.append(account)

    query = f"""
        SELECT m.* FROM marketplace_ads_metrics m
        INNER JOIN (
            SELECT campaignId, platform, account, MAX(scrapedAt) AS max_scraped
            FROM marketplace_ads_metrics
            {where_inner}
            GROUP BY campaignId, platform, account
        ) latest
          ON m.campaignId = latest.campaignId
         AND m.platform   = latest.platform
         AND m.account    = latest.account
         AND m.scrapedAt  = latest.max_scraped
        WHERE 1=1 {where_outer}
        ORDER BY m.platform, m.account, m.spend DESC
    """
    cursor.execute(query, inner_params + outer_params)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows


def set_failed(action_id: int, error: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE agent_actions SET status='failed', executionLog=%s, updatedAt=%s WHERE id=%s",
        (f"ERRO: {error}"[:1000], datetime.now(), action_id)
    )
    conn.commit()
    cursor.close()
    conn.close()
