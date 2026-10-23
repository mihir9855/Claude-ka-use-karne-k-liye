/* In-browser stand-in for the Python API, so preview.html works as a single file with generated demo data. */
const DEMO_NAMES={RELIANCE:'Reliance Industries',TCS:'Tata Consultancy Services',HDFCBANK:'HDFC Bank',INFY:'Infosys',ICICIBANK:'ICICI Bank',ITC:'ITC',SBIN:'State Bank of India',BHARTIARTL:'Bharti Airtel',KOTAKBANK:'Kotak Mahindra Bank',LT:'Larsen & Toubro',AXISBANK:'Axis Bank',ASIANPAINT:'Asian Paints',MARUTI:'Maruti Suzuki',SUNPHARMA:'Sun Pharma',TITAN:'Titan Company',BAJFINANCE:'Bajaj Finance',WIPRO:'Wipro',HCLTECH:'HCL Technologies',TATAMOTORS:'Tata Motors',TATASTEEL:'Tata Steel',NTPC:'NTPC',ONGC:'ONGC',ZOMATO:'Zomato',DMART:'Avenue Supermarts',IRCTC:'IRCTC',HAL:'Hindustan Aeronautics',BEL:'Bharat Electronics',PNB:'Punjab National Bank',YESBANK:'Yes Bank',TRENT:'Trent',ADANIENT:'Adani Enterprises',COALINDIA:'Coal India',VEDL:'Vedanta',IDEA:'Vodafone Idea'};
const DEMO_DEFAULTS=['RELIANCE','TCS','HDFCBANK','INFY','ITC','TATAMOTORS','SBIN','ASIANPAINT'].map(s=>s+'.NS');
const _h=s=>{let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}return h>>>0};
const _rng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const _gauss=r=>{let u=0;for(let i=0;i<6;i++)u+=r();return(u-3)/.707};
const _clamp=(x,a=0,b=100)=>Math.max(a,Math.min(b,x));
const _cache={};
function _hist(sym){
  if(_cache['h'+sym])return _cache['h'+sym];
  const r=_rng(_h(sym)),vol=.01+r()*.012,drift=-.0008+r()*.0022;let p=150+r()*3350;
  const days=[];const d=new Date();d.setHours(0,0,0,0);
  while(days.length<250){if(d.getDay()%6)days.push(new Date(d));d.setDate(d.getDate()-1)}
  days.reverse();
  return _cache['h'+sym]=days.map(day=>{const o=p,c=o*(1+drift+_gauss(r)*vol);p=c;
    return{t:day.toISOString().slice(0,10),o,h:Math.max(o,c)*(1+r()*vol),l:Math.min(o,c)*(1-r()*vol),c,v:(.6+r()*1.2)*1e6}});
}
function _fund(sym){
  if(_cache['f'+sym])return _cache['f'+sym];
  const r=_rng(_h(sym+'f')),s0=20+r()*280,g=-.01+r()*.06,m=.05+r()*.17;
  const sales=[],profit=[],labels=[];let q=new Date();let qi=Math.floor(q.getMonth()/3)+1,y=q.getFullYear();
  const qs=[];for(let i=0;i<6;i++){qs.unshift('Q'+qi+' '+y);qi--;if(qi===0){qi=4;y--}}
  for(let i=0;i<6;i++){const sv=s0*Math.pow(1+g,i);sales.push(+sv.toFixed(1));profit.push(+(sv*m*(.9+r()*.2)).toFixed(2))}
  return _cache['f'+sym]={sales,profit,labels:qs,roe:6+r()*29,de:r()*2,pe:9+r()*36,name:DEMO_NAMES[sym.split('.')[0]]||sym.split('.')[0]};
}
function _tech(a){
  if(a.length<55)return{score:0,checks:[]};
  const c=a.map(k=>k.c),n=c.length,avg=(arr,k)=>arr.slice(-k).reduce((s,x)=>s+x,0)/k;
  const px=c[n-1],m20=avg(c,20),m50=avg(c,50);
  let g=0,l=0,r=50;for(let i=1;i<n;i++){const d=c[i]-c[i-1];g=(g*13+Math.max(d,0))/14;l=(l*13+Math.max(-d,0))/14}r=100-100/(1+g/(l||1e-9));
  const hi=Math.max(...a.slice(-20).map(k=>k.h)),vr=a[n-1].v/avg(a.map(k=>k.v),20),sg=x=>(x>=0?'+':'')+(x*100).toFixed(1)+'%';
  const rp=r>=50&&r<=70?20:r>70?10:0;
  const checks=[{n:'Price above MA 50',ok:px>m50,pts:20,v:sg(px/m50-1)},{n:'MA 20 above MA 50',ok:m20>m50,pts:20,v:sg(m20/m50-1)},
    {n:'RSI between 50 and 70',ok:r>=50&&r<=70,pts:rp,v:r.toFixed(0)},{n:'Near 20-day high',ok:px>=hi*.98,pts:20,v:(px/hi*100).toFixed(1)+'%'},
    {n:'Volume above average',ok:vr>1,pts:20,v:vr.toFixed(2)+'x'}];
  return{score:checks.reduce((s,k)=>s+(k.ok||k.n.startsWith('RSI')?k.pts:0),0),checks};
}
function _fundScore(f){
  const gr=(a,l)=>a.length>l&&a[a.length-1-l]?a[a.length-1]/a[a.length-1-l]-1:null;
  let gp=gr(f.profit,4),gs=gr(f.sales,4);if(gp==null)gp=gr(f.profit,1);if(gs==null)gs=gr(f.sales,1);
  const pc=x=>x==null?'n/a':(x>=0?'+':'')+(x*100).toFixed(1)+'%';
  const checks=[{n:'Profit growth',ok:gp!=null&&gp>.05,v:pc(gp)},{n:'Sales growth',ok:gs!=null&&gs>.03,v:pc(gs)},
    {n:'ROE above 15%',ok:f.roe>15,v:f.roe.toFixed(0)+'%'},{n:'Debt/equity low',ok:f.de<1||f.de>3,v:f.de.toFixed(1)},
    {n:'P/E under market',ok:f.pe>0&&f.pe<24,v:f.pe.toFixed(0)+' vs 24'}];
  const s=_clamp(50+(gp||0)*120)*.3+_clamp(50+(gs||0)*200)*.2+_clamp(f.roe*3)*.2+(f.de>3?60:_clamp(100-f.de*25))*.15+_clamp(100-(f.pe/24-.6)*80)*.15;
  return{score:Math.round(s),checks,profit_yoy:gp,sales_yoy:gs};
}
function _quote(sym){const h=_hist(sym),r=_rng(Math.floor(Date.now()/5000)+_h(sym));
  return{price:h[h.length-1].c*(1+(r()-.5)*.004),prev:h[h.length-2].c}}
const _chk=s=>{s=s.trim().toUpperCase();if(!/\.(NS|BO)$/.test(s))throw new Error('Use an NSE (.NS) or BSE (.BO) symbol');return s};
async function demoApi(path){
  const u=new URL(path,location.href),p=u.pathname,q=u.searchParams;
  await new Promise(r=>setTimeout(r,80));
  if(p==='/api/config')return{demo:true,defaults:DEMO_DEFAULTS};
  if(p==='/api/search'){
    const t=q.get('q').trim().toUpperCase(),out=[];
    for(const [s,n] of Object.entries(DEMO_NAMES))if(s.includes(t)||n.toUpperCase().includes(t))out.push({symbol:s+'.NS',name:n,exchange:'NSE'});
    if(!out.length&&/^[A-Z0-9&-]{2,15}$/.test(t))out.push({symbol:t+'.NS',name:t+' (demo)',exchange:'NSE'},{symbol:t+'.BO',name:t+' (demo)',exchange:'BSE'});
    return out.slice(0,10);
  }
  if(p==='/api/scan')return q.get('symbols').split(',').filter(Boolean).slice(0,25).map(s=>{
    s=_chk(s);const h=_hist(s),f=_fund(s),qt=_quote(s);
    return{symbol:s,name:f.name,price:qt.price,prev:qt.prev,tech:_tech(h).score,fund:_fundScore(f).score,spark:h.slice(-40).map(k=>+k.c.toFixed(2))}});
  if(p==='/api/stock'){const s=_chk(q.get('symbol')),h=_hist(s),f=_fund(s);
    return{symbol:s,name:f.name,candles:h.slice(-260),quarters:{labels:f.labels,sales:f.sales,profit:f.profit},tech:_tech(h),fund:_fundScore(f),demo:true}}
  if(p==='/api/quotes'){const o={};q.get('symbols').split(',').filter(Boolean).forEach(s=>{s=_chk(s);o[s]=_quote(s)});return o}
  throw new Error('Not found');
}
