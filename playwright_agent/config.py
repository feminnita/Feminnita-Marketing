import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

DATABASE_URL = os.environ["DATABASE_URL"]

ML_EMAIL_FEMINNITA  = os.environ.get("ML_EMAIL_FEMINNITA", "")
ML_PASSWORD_FEMINNITA = os.environ.get("ML_PASSWORD_FEMINNITA", "")
ML_EMAIL_FNT        = os.environ.get("ML_EMAIL_FNT", "")
ML_PASSWORD_FNT     = os.environ.get("ML_PASSWORD_FNT", "")

SHOPEE_EMAIL_FEMINNITA  = os.environ.get("SHOPEE_EMAIL_FEMINNITA", "")
SHOPEE_PASSWORD_FEMINNITA = os.environ.get("SHOPEE_PASSWORD_FEMINNITA", "")
SHOPEE_EMAIL_FNT        = os.environ.get("SHOPEE_EMAIL_FNT", "")
SHOPEE_PASSWORD_FNT     = os.environ.get("SHOPEE_PASSWORD_FNT", "")

AMAZON_EMAIL    = os.environ.get("AMAZON_EMAIL", "")
AMAZON_PASSWORD = os.environ.get("AMAZON_PASSWORD", "")

TRAY_EMAIL     = os.environ.get("TRAY_EMAIL", "")
TRAY_PASSWORD  = os.environ.get("TRAY_PASSWORD", "")
TRAY_STORE_URL = os.environ.get("TRAY_STORE_URL", "")

POLL_INTERVAL  = int(os.environ.get("POLL_INTERVAL", "30"))  # segundos
HEADLESS       = os.environ.get("HEADLESS", "true").lower() == "true"

WEBSHARE_HOST  = os.environ.get("WEBSHARE_HOST", "")
WEBSHARE_PORT  = os.environ.get("WEBSHARE_PORT", "")
WEBSHARE_USER  = os.environ.get("WEBSHARE_USER", "")
WEBSHARE_PASS  = os.environ.get("WEBSHARE_PASS", "")
