// Zero-dependency backend: serves the game and a live-price API.
// Run: node server.js   (then open http://localhost:3000)
const http = require("http"), https = require("https"), fs = require("fs"), path = require("path");
const PORT = process.env.PORT || 3000;
const REFRESH_MS = +process.env.REFRESH_MS || 15000;
const BASE = {
  RELIANCE:"RELIANCE", TCS:"TCS", HDFCBANK:"HDFCBANK", INFY:"INFY", ICICIBANK:"ICICIBANK",
  SBIN:"SBIN", BHARTIARTL:"BHARTIARTL", ITC:"ITC", LT:"LT", HINDUNILVR:"HINDUNILVR",
  KOTAKBANK:"KOTAKBANK", AXISBANK:"AXISBANK", MARUTI:"MARUTI", SUNPHARMA:"SUNPHARMA",
  TATAMOTORS:"TATAMOTORS", TATASTEEL:"TATASTEEL", WIPRO:"WIPRO", ADANIENT:"ADANIENT",
  ASIANPAINT:"ASIANPAINT", ZOMATO:"ETERNAL"
};
// Keys look like "NSE:TCS" / "BSE:TCS" (Yahoo suffixes .NS and .BO)
const SYMBOLS = {};
for (const [k, y] of Object.entries(BASE)) { SYMBOLS["NSE:" + k] = y + ".NS"; SYMBOLS["BSE:" + k] = y + ".BO"; }
const quotes = {}; let lastOk = 0;

function getJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 8000 }, res => {
      let b = ""; res.on("data", d => b += d);
      res.on("end", () => res.statusCode === 200 ? (() => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } })() : reject(new Error("HTTP " + res.statusCode)));
    }).on("error", reject).on("timeout", function () { this.destroy(new Error("timeout")); });
  });
}

async function fetchOne(sym, yahoo) {
  const j = await getJSON(`https://query1.finance.yahoo.com/v8/finance/chart/${yahoo}?interval=1m&range=1d`);
  const m = j.chart.result[0].meta;
  quotes[sym] = { price: m.regularMarketPrice, prev: m.chartPreviousClose ?? m.previousClose, time: m.regularMarketTime };
}

async function refresh() {
  const res = await Promise.allSettled(Object.entries(SYMBOLS).map(([s, y]) => fetchOne(s, y)));
  const ok = res.filter(r => r.status === "fulfilled").length;
  if (ok) lastOk = Date.now();
  console.log(`[${new Date().toISOString()}] refreshed ${ok}/${res.length}` + (ok ? "" : ` (${res[0].reason?.message})`));
}
refresh(); setInterval(refresh, REFRESH_MS);

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css" };
http.createServer((req, res) => {
  if (req.url.startsWith("/api/quotes")) {
    res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    return res.end(JSON.stringify({ live: Date.now() - lastOk < REFRESH_MS * 3, updated: lastOk, quotes }));
  }
  const file = req.url.split("?")[0] === "/" ? "index.html" : path.basename(req.url.split("?")[0]);
  if (!TYPES[path.extname(file)]) { res.writeHead(404); return res.end("Not found"); }
  fs.readFile(path.join(__dirname, file), (e, d) => {
    if (e) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] }); res.end(d);
  });
}).listen(PORT, () => console.log(`Game running at http://localhost:${PORT}`));
