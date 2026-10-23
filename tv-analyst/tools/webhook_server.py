#!/usr/bin/env python3
"""Minimal TradingView webhook receiver (stdlib only).

Run:   WEBHOOK_SECRET=mysecret python3 webhook_server.py [port]
TV alert Webhook URL: https://<public-url>/<secret>   (ngrok/cloudflared se expose karo)
Har alert ../webhooks/alerts-log.md me append hota hai. Trade execute NAHI karta.
"""
import json, os, sys
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer

SECRET = os.environ.get("WEBHOOK_SECRET", "")
LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "webhooks", "alerts-log.md")

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if not SECRET or self.path.strip("/") != SECRET:
            self.send_response(403); self.end_headers(); return
        body = self.rfile.read(min(int(self.headers.get("Content-Length", 0)), 65536)).decode("utf-8", "replace")
        try:
            body = json.dumps(json.loads(body), separators=(",", ":"))
        except ValueError:
            pass
        body = body.replace("|", "\\|").replace("\n", " ")
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        with open(LOG, "a") as f:
            f.write(f"| {ts} | `{body}` |\n")
        self.send_response(200); self.end_headers(); self.wfile.write(b"ok")

    def log_message(self, *a):
        pass

if __name__ == "__main__":
    if not SECRET:
        sys.exit("WEBHOOK_SECRET set karo")
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    print(f"Listening on :{port}")
    HTTPServer(("0.0.0.0", port), Handler).serve_forever()
