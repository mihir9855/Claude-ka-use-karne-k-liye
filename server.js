// Zero-dependency backend: serves the game, the full NSE+BSE stock list and live prices (Yahoo Finance).
// Run: node server.js   (then open http://localhost:3000)
const http = require("http"), https = require("https"), fs = require("fs"), os = require("os"), path = require("path");
const PORT = process.env.PORT || 3000;
const TICK_MS = 5000, BATCH = 25, STALE_MS = 12000, MASTER_REFRESH_MS = 6 * 3600e3, EXTRA_TTL_MS = 2 * 3600e3, MAX_EXTRA = 400;
const CORE = ["RELIANCE", "TCS", "HDFCBANK", "INFY", "ICICIBANK", "SBIN", "BHARTIARTL", "ITC", "LT", "HINDUNILVR", "KOTAKBANK", "AXISBANK", "MARUTI", "SUNPHARMA", "TATAMOTORS", "TATASTEEL", "WIPRO", "ADANIENT", "ASIANPAINT", "ZOMATO", "ADANIPORTS", "APOLLOHOSP", "BAJAJ-AUTO", "BAJFINANCE", "BAJAJFINSV", "BPCL", "BRITANNIA", "CIPLA", "COALINDIA", "DIVISLAB", "DRREDDY", "EICHERMOT", "GRASIM", "HCLTECH", "HDFCLIFE", "HEROMOTOCO", "HINDALCO", "INDUSINDBK", "JSWSTEEL", "M&M", "NESTLEIND", "NTPC", "ONGC", "POWERGRID", "SBILIFE", "SHRIRAMFIN", "TATACONSUM", "TECHM", "TITAN", "ULTRACEMCO", "TRENT", "ADANIGREEN", "ADANIPOWER", "AMBUJACEM", "BANKBARODA", "BEL", "CANBK", "CHOLAFIN", "DLF", "GAIL", "GODREJCP", "HAL", "HAVELLS", "ICICIPRULI", "IOC", "IRCTC", "IRFC", "JINDALSTEL", "LICI", "LODHA", "NAUKRI", "NHPC", "PFC", "PIDILITIND", "PNB", "RECLTD", "SIEMENS", "TATAPOWER", "TORNTPHARM", "VEDL", "VBL", "YESBANK", "PAYTM", "NYKAA", "IDEA", "SUZLON", "IDFCFIRSTB", "BHEL", "SAIL", "POLICYBZR", "DMART", "MUTHOOTFIN", "MRF", "TVSMOTOR", "ABB", "PETRONET", "COLPAL"];
const YAHOO_OVERRIDE = { ZOMATO: "ETERNAL" };      // game symbol -> Yahoo symbol
const extra = {};                                    // stocks opened by players: SYM -> last-used time
const quotes = {}, fetchedAt = {}, wanted = {}, unlisted = {};
let lastOk = 0, rr = 0;

/* ---------- master list of every listed stock (NSE + BSE) ---------- */
let master = [], meta = {}, masterInfo = { nse: false, bse: false, updated: 0 };
const CACHE = path.join(os.tmpdir(), "dsa-master.json");
try { const c = JSON.parse(fs.readFileSync(CACHE, "utf8")); setMaster(c.list, c.info); } catch (e) {}

function setMaster(list, info) {
  master = list; meta = {}; for (const m of list) meta[m.sym] = m; masterInfo = info;
}
function getText(url, headers = {}, redirects = 3) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36", "Accept-Encoding": "identity", ...headers }, timeout: 20000 }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirects) return resolve(getText(new URL(res.headers.location, url).href, headers, redirects - 1));
      if (res.statusCode !== 200) { res.resume(); return reject(new Error("HTTP " + res.statusCode)); }
      let b = ""; res.setEncoding("utf8"); res.on("data", d => b += d); res.on("end", () => resolve(b));
    }).on("error", reject).on("timeout", function () { this.destroy(new Error("timeout")); });
  });
}
const getJSON = async (url, h) => JSON.parse(await getText(url, h));

function splitCSV(line) { const o = []; let c = "", q = false; for (const ch of line) { if (ch === '"') q = !q; else if (ch === "," && !q) { o.push(c.trim()); c = ""; } else c += ch; } o.push(c.trim()); return o; }
async function loadNSE() {
  const txt = await getText("https://nsearchives.nseindia.com/content/equities/EQUITY_L.csv").catch(() => getText("https://archives.nseindia.com/content/equities/EQUITY_L.csv"));
  const rows = txt.split(/\r?\n/).filter(Boolean), head = splitCSV(rows[0]).map(h => h.toUpperCase());
  const iS = head.indexOf("SYMBOL"), iN = head.findIndex(h => h.startsWith("NAME")), iI = head.findIndex(h => h.startsWith("ISIN"));
  if (iS < 0) throw new Error("bad NSE csv");
  return rows.slice(1).map(splitCSV).filter(r => r[iS]).map(r => ({ sym: r[iS].toUpperCase(), name: r[iN] || r[iS], isin: (r[iI] || "").toUpperCase() }));
}
async function loadBSE() {
  const j = await getJSON("https://api.bseindia.com/BseIndiaAPI/api/ListofScripData/w?Group=&Atea=&Scripcode=&segment=Equity&status=Active", { Referer: "https://www.bseindia.com/", Origin: "https://www.bseindia.com", Accept: "application/json" });
  const arr = Array.isArray(j) ? j : (j.Table || j.data || []);
  const g = (o, k) => { const key = Object.keys(o).find(x => x.toLowerCase() === k); return key ? String(o[key] ?? "").trim() : ""; };
  return arr.map(o => ({ code: g(o, "scrip_cd"), sym: g(o, "scrip_id").toUpperCase(), name: g(o, "scrip_name") || g(o, "issuer_name"), isin: g(o, "isin_number").toUpperCase() })).filter(o => o.code);
}
async function refreshMaster() {
  const [n, b] = await Promise.allSettled([loadNSE(), loadBSE()]);
  const info = { nse: n.status === "fulfilled", bse: b.status === "fulfilled", updated: Date.now() };
  if (!info.nse && !info.bse) { console.log("master list refresh failed:", n.reason?.message, "/", b.reason?.message); return; }
  const byIsin = {}, list = [];
  if (info.nse) for (const r of n.value) { const m = { sym: r.sym, name: r.name, nse: true, bse: null, isin: r.isin }; list.push(m); if (r.isin) byIsin[r.isin] = m; }
  if (info.bse) for (const r of b.value) {
    const m = r.isin && byIsin[r.isin];
    if (m) m.bse = r.code;
    else { const sym = (r.sym && !list.some(x => x.sym === r.sym)) ? r.sym : r.code; list.push({ sym, name: r.name, nse: false, bse: r.code, isin: r.isin }); }
  }
  list.sort((a, c) => a.sym.localeCompare(c.sym));
  setMaster(list, info);
  try { fs.writeFileSync(CACHE, JSON.stringify({ list, info })); } catch (e) {}
  console.log(`master list: ${list.length} stocks (NSE ${info.nse ? "ok" : "failed"}, BSE ${info.bse ? "ok" : "failed"})`);
}
refreshMaster(); setInterval(refreshMaster, MASTER_REFRESH_MS);

/* ---------- live prices ---------- */
function yahooFor(ex, sym) {
  const m = meta[sym], base = YAHOO_OVERRIDE[sym] || sym;
  if (ex === "NSE") return m && masterInfo.nse && !m.nse ? null : base + ".NS";
  if (m && masterInfo.bse && !m.bse) return null;
  return (m && m.bse ? m.bse : base) + ".BO";
}
const allKeys = () => [...CORE, ...Object.keys(extra)].flatMap(s => ["NSE:" + s, "BSE:" + s]);
async function fetchKey(key) {
  const [ex, sym] = key.split(":"), y = yahooFor(ex, sym);
  fetchedAt[key] = Date.now();
  if (!y) { unlisted[key] = true; return; }
  delete unlisted[key];
  const j = await getJSON(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(y)}?interval=1m&range=1d`);
  const m = j.chart.result[0].meta;
  quotes[key] = { price: m.regularMarketPrice, prev: m.chartPreviousClose ?? m.previousClose, time: m.regularMarketTime };
}
// Real index levels: NIFTY 50 (^NSEI) and S&P BSE SENSEX (^BSESN), with today's intraday curve for the sparkline.
async function fetchIndex(ex) {
  const j = await getJSON(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ex === "NSE" ? "^NSEI" : "^BSESN")}?interval=5m&range=1d`);
  const r = j.chart.result[0], m = r.meta, closes = (r.indicators.quote[0].close || []).filter(v => v != null);
  const step = Math.max(1, Math.ceil(closes.length / 90));
  quotes["IDX:" + ex] = { price: m.regularMarketPrice, prev: m.chartPreviousClose ?? m.previousClose, time: m.regularMarketTime, series: closes.filter((_, i) => i % step === 0 || i === closes.length - 1) };
}
async function cycle() {
  const now = Date.now(), batch = new Set();
  for (const s of Object.keys(extra)) if (now - extra[s] > EXTRA_TTL_MS) { delete extra[s]; delete quotes["NSE:" + s]; delete quotes["BSE:" + s]; }
  for (const k of Object.keys(wanted)) {
    if (now - wanted[k] > 60000) delete wanted[k];
    else { if (extra[k.split(":")[1]]) extra[k.split(":")[1]] = now; if (now - (fetchedAt[k] || 0) > STALE_MS) batch.add(k); }
  }
  const keys = allKeys();
  for (let i = 0; i < BATCH && keys.length; i++) batch.add(keys[rr++ % keys.length]);
  const list = [...batch], res = await Promise.allSettled([...list.map(fetchKey), fetchIndex("NSE"), fetchIndex("BSE")]);
  const ok = res.filter(r => r.status === "fulfilled").length;
  if (ok) lastOk = Date.now();
  console.log(`[${new Date().toISOString()}] refreshed ${ok}/${list.length}` + (ok ? "" : ` (${res[0].reason?.message})`));
}
cycle(); setInterval(cycle, TICK_MS);

/* ---------- http ---------- */
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".webmanifest": "application/manifest+json", ".png": "image/png" };
const ALLOWED = /^(index\.html|manifest\.webmanifest|sw\.js|icons\/[\w.-]+\.png)$/;
const json = (res, o, code = 200) => { res.writeHead(code, { "Content-Type": "application/json", "Cache-Control": "no-store" }); res.end(JSON.stringify(o)); };
const SYM_OK = /^[A-Z0-9&.-]{1,20}$/;

async function yahooSearch(q) {
  const j = await getJSON(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=20&newsCount=0`);
  const seen = new Set(), items = [];
  for (const r of j.quotes || []) {
    const m = /^([A-Z0-9&-]+)\.(NS|BO)$/.exec(r.symbol || "");
    if (r.quoteType !== "EQUITY" || !m || seen.has(m[1])) continue;
    seen.add(m[1]); items.push({ sym: m[1], name: r.longname || r.shortname || m[1], nse: true, bse: true });
  }
  return items;
}

http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x"), p = u.pathname, sp = u.searchParams;
  if (p === "/api/quotes") {
    for (const k of (sp.get("want") || "").split(",").slice(0, 200)) if (/^(NSE|BSE):[A-Z0-9&.-]{1,20}$/.test(k)) wanted[k] = Date.now();
    return json(res, { live: Date.now() - lastOk < TICK_MS * 6, updated: lastOk, quotes, unlisted: Object.keys(unlisted) });
  }
  if (p === "/api/stocks") {            // browse / search the complete NSE + BSE list
    const q = (sp.get("q") || "").trim().toLowerCase().slice(0, 40), letter = (sp.get("letter") || "").toUpperCase().slice(0, 1);
    const page = Math.max(1, +sp.get("page") || 1), per = 20;
    if (!master.length) {
      let items = [];
      if (q.length >= 2) try { items = await yahooSearch(q); } catch (e) {}
      return json(res, { total: items.length, page: 1, pages: 1, items, source: "yahoo", note: "The full exchange list has not loaded yet; showing Yahoo search results." });
    }
    let L = master;
    if (q) L = L.filter(m => m.sym.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
    if (letter) L = L.filter(m => letter === "#" ? !/^[A-Z]/.test(m.sym) : m.sym[0] === letter);
    const pages = Math.max(1, Math.ceil(L.length / per));
    for (const m of L.slice((page - 1) * per, page * per)) {       // track the stocks on screen so each one shows a price
      if (!CORE.includes(m.sym) && (extra[m.sym] || Object.keys(extra).length < MAX_EXTRA)) extra[m.sym] = Date.now();
      wanted["NSE:" + m.sym] = wanted["BSE:" + m.sym] = Date.now();
    }
    return json(res, { total: L.length, all: master.length, page, pages, source: "exchange", updated: masterInfo.updated, nseOk: masterInfo.nse, bseOk: masterInfo.bse,
      items: L.slice((page - 1) * per, page * per).map(m => ({ sym: m.sym, name: m.name, nse: m.nse, bse: !!m.bse })) });
  }
  if (p === "/api/add") {               // start tracking a stock the player opened
    const sym = (sp.get("sym") || "").toUpperCase();
    if (!SYM_OK.test(sym) || (!CORE.includes(sym) && !extra[sym] && Object.keys(extra).length >= MAX_EXTRA)) return json(res, { ok: false }, 400);
    if (!CORE.includes(sym)) extra[sym] = Date.now();
    wanted["NSE:" + sym] = wanted["BSE:" + sym] = Date.now();
    await Promise.allSettled(["NSE:" + sym, "BSE:" + sym].map(fetchKey));
    return json(res, { ok: true, nse: !unlisted["NSE:" + sym], bse: !unlisted["BSE:" + sym] });
  }
  const file = p === "/" ? "index.html" : p.replace(/^\/+/, "");
  if (!ALLOWED.test(file)) { res.writeHead(404); return res.end("Not found"); }
  fs.readFile(path.join(__dirname, file), (e, d) => {
    if (e) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)], "Cache-Control": "no-cache" }); res.end(d);
  });
}).listen(PORT, () => console.log(`Game running at http://localhost:${PORT}`));
