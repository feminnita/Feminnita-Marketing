"""
Gera refresh token OAuth2 para Google Analytics Data API.
Uso: python scripts/get-ga4-token.py
"""
import json, webbrowser, urllib.parse, urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

CLIENT_ID     = "511036701017-478crcdao8n7k7gba18c94a9m10snrv3.apps.googleusercontent.com"
CLIENT_SECRET = "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"
REDIRECT_URI  = "http://localhost:8765"
SCOPE         = "https://www.googleapis.com/auth/analytics.readonly"

received_code = None

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        global received_code
        params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        received_code = params.get("code", [None])[0]
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"<h2>Autorizado! Pode fechar esta aba.</h2>")
    def log_message(self, *args): pass

server = HTTPServer(("localhost", 8765), Handler)
thread = threading.Thread(target=server.handle_request)
thread.start()

auth_url = (
    "https://accounts.google.com/o/oauth2/auth"
    f"?client_id={CLIENT_ID}"
    f"&redirect_uri={urllib.parse.quote(REDIRECT_URI)}"
    f"&response_type=code"
    f"&scope={urllib.parse.quote(SCOPE)}"
    "&access_type=offline"
    "&prompt=consent"
)

print("Abrindo browser para autorização...")
webbrowser.open(auth_url)
print("Aguardando autorização no browser...")
thread.join(timeout=120)

code = received_code
if not code:
    print("Timeout — tente novamente.")
    exit(1)

print(f"Código recebido!")

data = urllib.parse.urlencode({
    "code": code,
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "redirect_uri": REDIRECT_URI,
    "grant_type": "authorization_code",
}).encode()

req = urllib.request.Request("https://oauth2.googleapis.com/token", data=data, method="POST")
req.add_header("Content-Type", "application/x-www-form-urlencoded")

with urllib.request.urlopen(req) as resp:
    tokens = json.loads(resp.read())

print("\n✅ Sucesso! Adicione ao .env:")
print(f'GOOGLE_CLIENT_ID={CLIENT_ID}')
print(f'GOOGLE_CLIENT_SECRET={CLIENT_SECRET}')
print(f'GOOGLE_REFRESH_TOKEN={tokens["refresh_token"]}')
print(f'GA4_PROPERTY_ID=523875765')
