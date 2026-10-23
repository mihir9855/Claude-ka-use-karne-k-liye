// Zero-dependency backend: serves the game and a live-price API (NSE + BSE via Yahoo Finance).
// Run: node server.js   (then open http://localhost:3000)
const http = require("http"), https = require("https"), fs = require("fs"), path = require("path");
const PORT = process.env.PORT || 3000;
const TICK_MS = 5000, BATCH = 25, STALE_MS = 12000;
const CORE = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "LT", "HINDUNILVR", "KOTAKBANK", "AXISBANK", "MARUTI", "SUNPHARMA", "TATAMOTORS", "TATASTEEL", "WIPRO", "ADANIENT", "ASIANPAINT", "ZOMATO", "ADANIPORTS", "APOLLOHOSP", "BAJAJ-AUTO", "BAJFINANCE", "BAJAJFINSV", "BPCL", "BRITANNIA", "CIPLA", "COALINDIA", "DIVISLAB", "DRREDDY", "EICHERMOT", "GRASIM", "HCLTECH", "HDFCLIFE", "HEROMOTOCO", "HINDALCO", "INDUSINDBK", "JSWSTEEL", "M&M", "NESTLEIND", "NTPC", "ONGC", "POWERGRID", "SBILIFE", "SHRIRAMFIN", "TATACONSUM", "TECHM", "TITAN", "ULTRACEMCO", "TRENT", "ADANIGREEN", "ADANIPOWER", "AMBUJACEM", "BANKBARODA", "BEL", "CANBK", "CHOLAFIN", "DLF", "GAIL", "GODREJCP", "HAL", "HAVELLS", "ICICIPRULI", "IOC", "IRCTC", "IRFC", "JINDALSTEL", "LICI", "LODHA", "NAUKRI", "NHPC", "PFC", "PIDILITIND", "PNB", "RECLTD", "SIEMENS", "TATAPOWER", "TORNTPHARM", "VEDL", "VBL", "YESBANK", "PAYTM", "NYKAA", "IDEA", "SUZLON", "IDFCFIRSTB", "BHEL", "SAIL", "POLICYBZR", "DMART", "MUTHOOTFIN", "MRF", "TVSMOTOR", "ABB", "PETRONET", "COLPAL"];
const YAHOO_OVERRIDE = { ZOMATO: "ETERNAL" };   // game symbol -> Yahoo symbol
const extra = {};                                  // stocks added by players via search: SYM -> Yahoo base symbol
const quotes = {}, fetchedAt = {}, wanted = {};
let lastOk = 0, rr = 0;

const yahooBase = sym => YAHOO_OVERRIDE[sym] || extra[sym] || sym;
const allKeys = () => [...CORE, ...Object.keys(extra)].flatMap(s => ["NSE:" + s, "BSE:" + s]);

function getJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 8000 }, res => {
      let b = ""; res.on("data", d => b += d);
      res.on("end", () => res.statusCode === 200 ? (() => { try { resolve(JSON.parse(b)); } catch (e) { reject(e); } })() : reject(new Error("HTTP " + res.statusCode)));
    }).on("error", reject).on("timeout", function () { this.destroy(new Error("timeout")); });
  });
}

async function fetchKey(key) {
  const [ex, sym] = key.split(":");
  fetchedAt[key] = Date.now();
  const j = await getJSON(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooBase(sym) + (ex === "NSE" ? ".NS" : ".BO"))}?interval=1m&range=1d`);
  const m = j.chart.result[0].meta;
  quotes[key] = { price: m.regularMarketPrice, prev: m.chartPreviousClose ?? m.previousClose, time: m.regularMarketTime };
}

// Every 5s: refresh what players are looking at first, then walk through the rest of the market.
async function cycle() {
  const keys = allKeys(), now = Date.now(), batch = new Set();
  for (const k of Object.keys(wanted)) {
    if (now - wanted[k] > 60000) delete wanted[k];
    else if (now - (fetchedAt[k] || 0) > STALE_MS) batch.add(k);
  }
  for (let i = 0; i < BATCH && keys.length; i++) batch.add(keys[rr++ % keys.length]);
  const list = [...batch], res = await Promise.allSettled(list.map(fetchKey));
  const ok = res.filter(r => r.status === "fulfilled").length;
  if (ok) lastOk = Date.now();
  console.log(`[${new Date().toISOString()}] refreshed ${ok}/${list.length}` + (ok ? "" : ` (${res[0].reason?.message})`));
}
cycle(); setInterval(cycle, TICK_MS);

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".webmanifest": "application/manifest+json", ".png": "image/png" };
const ALLOWED = /^(index\.html|manifest\.webmanifest|sw\.js|icons\/[\w.-]+\.png)$/;
const json = (res, o, code = 200) => { res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" }); res.end(JSON.stringify(o)); };

http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x"), p = u.pathname;
  if (p === "/api/quotes") {
    for (const k of (u.searchParams.get("want") || "").split(",").slice(0, 40)) if (/^(NSE|BSE):[A-Z0-9&.-]{1,20}$/.test(k)) wanted[k] = Date.now();
    return json(res, { live: Date.now() - lastOk < TICK_MS * 6, updated: lastOk, quotes });
  }
  if (p === "/api/search") {          // find any NSE/BSE equity by name or symbol
    const q = (u.searchParams.get("q") || "").trim().slice(0, 40);
    if (q.length < 2) return json(res, { results: [] });
    try {
      const j = await getJSON(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=20&newsCount=0`);
      const seen = new Set(), results = [];
      for (const r of j.quotes || []) {
        const m = /^([A-Z0-9&-]+)\.(NS|BO)$/.exec(r.symbol || "");
        if (r.quoteType !== "EQUITY" || !m || seen.has(m[1])) continue;
        seen.add(m[1]); results.push({ sym: m[1], name: r.longname || r.shortname || m[1], exchange: m[2] === "NS" ? "NSE" : "BSE" });
      }
      json(res, { results });
    } catch (e) { json(res, { results: [], error: e.message }); }
    return;
  }
  if (p === "/api/add") {             // start tracking a searched stock
    const sym = (u.searchParams.get("sym") || "").toUpperCase();
    if (!/^[A-Z0-9&-]{1,20}$/.test(sym) || Object.keys(extra).length >= 150) return json(res, { ok: false }, 400);
    if (!CORE.includes(sym)) extra[sym] = sym;
    wanted["NSE:" + sym] = wanted["BSE:" + sym] = Date.now();
    await Promise.allSettled(["NSE:" + sym, "BSE:" + sym].map(fetchKey));
    return json(res, { ok: true });
  }
  const file = p === "/" ? "index.html" : p.replace(/^\/+/, "");
  if (!ALLOWED.test(file)) { res.writeHead(404); return res.end("Not found"); }
  fs.readFile(path.join(__dirname, file), (e, d) => {
    if (e) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] }); res.end(d);
  });
}).listen(PORT, () => console.log(`Game running at http://localhost:${PORT}`));
