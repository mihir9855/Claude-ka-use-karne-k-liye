const FT={mm:0.00328084,cm:0.0328084,m:3.28084,in:1/12,ft:1};
const UCODE={1:'in',2:'ft',4:'mm',5:'cm',6:'m'};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f2=x=>(Math.round(x*100)/100).toLocaleString('en-IN');
const f1=x=>(Math.round(x*10)/10).toLocaleString('en-IN');
const uid=()=>Math.random().toString(36).slice(2);

const S={canvas:null,src:'',w:0,h:0,mask:null,area:null,views:[],elev:0,plan:-1,parts:[],sel:null,s:0.03,fileScale:false,example:true,note:''};
const CFG={density:170,rate:0,allow:1,gdepth:12};

/* ---------- palette + settings ---------- */
const PALS=[['','આકાશી','#1565d8'],['safed','સફેદ','#ffffff'],['lilo','લીલો','#12805c'],['jambli','જાંબલી','#6a3de8'],['gulabi','ગુલાબી','#d6204f']];
function setPal(p){const r=document.documentElement;if(p)r.setAttribute('data-pal',p);else r.removeAttribute('data-pal');try{localStorage.setItem('pathar-pal',p)}catch(e){}
  document.querySelectorAll('#pal button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.p===p))}
$('#pal').innerHTML=PALS.map(p=>`<button type="button" data-p="${p[0]}" title="${p[1]}" aria-label="${p[1]}" style="background:${p[2]}"></button>`).join('');
$('#pal').onclick=e=>{const b=e.target.closest('button');if(b)setPal(b.dataset.p)};
try{setPal(localStorage.getItem('pathar-pal')||'')}catch(e){setPal('')}
function readCfg(){CFG.density=+$('#stone').value;CFG.rate=+$('#rate').value||0;CFG.allow=Math.max(0,+$('#allow').value||0);CFG.gdepth=Math.max(0,+$('#gdepth').value||0)}
['#stone','#rate','#allow','#gdepth'].forEach(i=>$(i).addEventListener('input',()=>{readCfg();refresh();try{localStorage.setItem('pathar-cfg',JSON.stringify({d:$('#stone').selectedIndex,r:CFG.rate,a:CFG.allow,g:CFG.gdepth}))}catch(e){}}));
try{const j=JSON.parse(localStorage.getItem('pathar-cfg')||'null');if(j){$('#stone').selectedIndex=j.d;$('#rate').value=j.r;$('#allow').value=j.a;$('#gdepth').value=j.g}}catch(e){}
readCfg();

/* ---------- calculations ---------- */
function planDepthIn(p){
  if(S.plan<0||S.plan===S.elev||!S.views[S.plan]||!S.views[S.elev])return null;
  const e=S.views[S.elev],pl=S.views[S.plan],k=S.mask.k,{m,w,h}=S.mask;
  const ec=(e.x0+e.x1)/2,pc=(pl.x0+pl.x1)/2;
  const xa=Math.round((pc+(p.x-ec))*k),xb=Math.round((pc+(p.x+p.w-ec))*k);
  let y0=1e9,y1=-1;
  for(let y=Math.round(pl.y0*k);y<Math.round(pl.y1*k);y++)for(let x=Math.max(0,xa);x<Math.min(w,xb);x++)if(m[y*w+x]){if(y<y0)y0=y;if(y>y1)y1=y}
  return y1>=y0?(y1-y0+1)/k*S.s:null;
}
function depthOf(p){
  if(p.depth!=null)return {v:p.depth,src:'તમે લખ્યું'};
  const pd=planDepthIn(p);if(pd!=null)return {v:pd,src:'પ્લાનમાંથી'};
  const W=p.w*S.s,H=p.h*S.s;
  if(p.depthRatio>0){const v=W*p.depthRatio;return S.userDepth&&CFG.gdepth>0&&v>CFG.gdepth?{v:CFG.gdepth,src:'તમારી કુલ ઊંડાઈ સુધી મર્યાદિત'}:{v,src:'AI નો અંદાજ (પહોળાઈના પ્રમાણમાં)'}}
  if(H/W>2.2)return {v:W,src:'થાંભલા જેવું: ઊંડાઈ = પહોળાઈ'};
  return {v:Math.min(CFG.gdepth,Math.max(W,H)),src:'અંદાજ'};
}
function calc(p){
  const W=p.w*S.s,H=p.h*S.s,d=depthOf(p),D=d.v,a=CFG.allow;
  const net=W*H*D*(p.fill/100)/1728,bw=W+a,bh=H+a,bd=D+a,block=bw*bh*bd/1728;
  return {W,H,D,dsrc:d.src,net,bw,bh,bd,block,kg:block*CFG.density*0.45359};
}
const cur=()=>S.parts.find(p=>p.id===S.sel);

/* ---------- boxes on the drawing ---------- */
const ov=$('#ov'),img=$('#img');
const pos=e=>{const r=ov.getBoundingClientRect();return [(e.clientX-r.left)/r.width*S.w,(e.clientY-r.top)/r.height*S.h]};
const place=(el,p)=>{el.style.left=p.x/S.w*100+'%';el.style.top=p.y/S.h*100+'%';el.style.width=p.w/S.w*100+'%';el.style.height=p.h/S.h*100+'%'};
function drawBoxes(){
  ov.innerHTML='';
  S.views.forEach((v,i)=>{if(S.views.length<2)return;const d=document.createElement('div');d.className='box view';place(d,{x:v.x0,y:v.y0,w:v.x1-v.x0,h:v.y1-v.y0});
    d.innerHTML=`<i>${i===S.elev?'એલિવેશન':i===S.plan?'પ્લાન':'વ્યૂ '+(i+1)}</i>`;ov.appendChild(d)});
  S.parts.forEach((p,i)=>{
    const d=document.createElement('div');d.className='box'+(p.id===S.sel?' sel':'');d.dataset.id=p.id;place(d,p);
    d.innerHTML=`<i>${i+1}</i>`+(p.id===S.sel?'<span class="h tl" data-m="tl"></span><span class="h br" data-m="br"></span>':'');
    ov.appendChild(d)});
}
let drag=null,drawMode=false;
ov.addEventListener('pointerdown',e=>{
  if(drawMode){const [x,y]=pos(e);drag={m:'new',x0:x,y0:y,el:document.createElement('div')};drag.el.className='box sel';ov.appendChild(drag.el);ov.setPointerCapture(e.pointerId);e.preventDefault();return}
  const h=e.target.closest('.h'),b=e.target.closest('.box:not(.view)');if(!b)return;
  const p=S.parts.find(q=>q.id===b.dataset.id);
  if(p.id!==S.sel){select(p.id);return}
  const [x,y]=pos(e);drag={m:h?h.dataset.m:'mv',p,x0:x,y0:y,o:{...p}};ov.setPointerCapture(e.pointerId);e.preventDefault();
});
ov.addEventListener('pointermove',e=>{
  if(!drag)return;const [x,y]=pos(e);
  if(drag.m==='new'){const r={x:Math.min(x,drag.x0),y:Math.min(y,drag.y0),w:Math.abs(x-drag.x0),h:Math.abs(y-drag.y0)};place(drag.el,r);drag.r=r;return}
  const p=drag.p,o=drag.o,dx=x-drag.x0,dy=y-drag.y0;
  if(drag.m==='mv'){p.x=o.x+dx;p.y=o.y+dy}
  else if(drag.m==='br'){p.w=Math.max(6,o.w+dx);p.h=Math.max(6,o.h+dy)}
  else{p.x=Math.min(o.x+dx,o.x+o.w-6);p.y=Math.min(o.y+dy,o.y+o.h-6);p.w=Math.max(6,o.w-dx);p.h=Math.max(6,o.h-dy)}
  const el=ov.querySelector('.box.sel');if(el)place(el,p);refresh();
});
function endDrag(){
  if(!drag)return;
  if(drag.m==='new'){const r=drag.r;drag.el.remove();
    if(r&&r.w>8&&r.h>8){const p={id:uid(),name:'નવો ભાગ '+(S.parts.length+1),x:r.x,y:r.y,w:r.w,h:r.h,depth:null,fill:100};S.parts.push(p);S.sel=p.id;setDraw(false);full()}}
  drag=null;
}
ov.addEventListener('pointerup',endDrag);ov.addEventListener('pointercancel',endDrag);
function setDraw(v){drawMode=v;ov.classList.toggle('draw',v);$('#draw').classList.toggle('on',v);$('#draw').textContent=v?'ડ્રોઇંગ પર ખેંચીને ચોકઠું બનાવો':'ભાગ હાથે દોરો'}
$('#draw').onclick=()=>setDraw(!drawMode);
$('#zoom').oninput=e=>{$('#stage').style.width=e.target.value+'%'};
function select(id){S.sel=id;full()}

/* ---------- detection ---------- */
function opts(){return {join:$('#s-join').value/1000,neck:$('#s-neck').value/100,minPiece:$('#s-piece').value/100}}
function detect(){
  const k=S.mask.k,roiV=S.views[S.elev];
  const roi=roiV?{x0:Math.round(roiV.x0*k),y0:Math.round(roiV.y0*k),x1:Math.round(roiV.x1*k),y1:Math.round(roiV.y1*k)}:{x0:Math.round(S.area.x*k),y0:Math.round(S.area.y*k),x1:Math.round((S.area.x+S.area.w)*k),y1:Math.round((S.area.y+S.area.h)*k)};
  const bs=detectParts(S.mask,roi,opts());
  S.parts=bs.map((b,i)=>({id:uid(),name:'ભાગ '+(i+1),x:b.x0/k,y:b.y0/k,w:(b.x1-b.x0)/k,h:(b.y1-b.y0)/k,depth:null,fill:100}));
  S.sel=S.parts[0]?S.parts[0].id:null;
}
function analyze(){
  S.mask=toMask(S.canvas,800);const k=S.mask.k,a=drawingArea(S.mask);
  S.area={x:a.x0/k,y:a.y0/k,w:(a.x1-a.x0)/k,h:(a.y1-a.y0)/k,framed:a.framed};
  S.views=findViews(S.mask,a).map(v=>({x0:v.x0/k,y0:v.y0/k,x1:v.x1/k,y1:v.y1/k}));
  if(S.views.length<2)S.views=S.views.slice(0,1);
  S.elev=0;let best=-1;S.views.forEach((v,i)=>{const ar=(v.x1-v.x0)*(v.y1-v.y0);if(ar>best){best=ar;S.elev=i}});S.plan=-1;
  if(S.noDetect){S.parts=[];S.sel=null}else detect();
}
$('#redo').onclick=()=>{if(!S.mask)return;detect();full()};

/* ---------- scale ---------- */
function extent(){
  if(!S.parts.length&&!S.area)return {w:0,h:0};
  if(!S.parts.length){const v=S.views[S.elev]||{x0:S.area.x,y0:S.area.y,x1:S.area.x+S.area.w,y1:S.area.y+S.area.h};return {w:v.x1-v.x0,h:v.y1-v.y0}}
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;S.parts.forEach(p=>{x0=Math.min(x0,p.x);y0=Math.min(y0,p.y);x1=Math.max(x1,p.x+p.w);y1=Math.max(y1,p.y+p.h)});
  return {w:x1-x0,h:y1-y0};
}
function renderScaleUI(){
  const sel=$('#refwhat'),old=sel.value;
  sel.innerHTML='<option value="H">આખા મંદિરની ઊંચાઈ</option><option value="W">આખા મંદિરની પહોળાઈ</option>'+S.parts.map((p,i)=>`<option value="p:${p.id}">${i+1}. ${esc(p.name)} ની પહોળાઈ</option>`).join('');
  if([...sel.options].some(o=>o.value===old))sel.value=old;
}
$('#setscale').onclick=()=>{
  const v=parseFloat($('#refval').value);if(!(v>0)){S.note='માપ લખો.';refresh();return}
  const inch=v*($('#refunit').value==='ft'?12:1),w=$('#refwhat').value,ex=extent();let px;
  if(w==='H')px=ex.h;else if(w==='W')px=ex.w;else{const p=S.parts.find(q=>q.id===w.slice(2));px=p?p.w:0}
  if(!px){S.note='આ માપ માટે ભાગ મળ્યો નથી.';refresh();return}
  S.s=inch/px;S.fileScale=false;S.example=false;S.note='';refresh();
};

function applyDims(user){
  const u=$('#m-unit').value==='ft'?12:1,w=(+$('#m-w').value||0)*u,h=(+$('#m-h').value||0)*u,d=(+$('#m-d').value||0)*u,ex=extent();
  if(!(w>0||h>0||d>0)){if(user){$('#m-msg').textContent='ઓછામાં ઓછું એક માપ લખો.'}return}
  S.note='';
  if((h>0||w>0)&&ex.h>0){
    S.s=h>0?h/ex.h:w/ex.w;S.fileScale=false;
    if(h>0&&w>0){const pw=ex.w*S.s;if(Math.abs(pw-w)/w>0.1)S.note=`ડ્રોઇંગના પ્રમાણ મુજબ પહોળાઈ ${f1(pw)}″ આવે છે, તમે ${f1(w)}″ લખી. ઊંચાઈ પ્રમાણે ગણતરી કરી છે, ઇમેજ થોડી ખેંચાયેલી હોઈ શકે.`}
  }
  if(d>0){CFG.gdepth=d;S.userDepth=true;$('#gdepth').value=d}
  refresh();
  let blk=0;S.parts.forEach(p=>blk+=calc(p).block);
  $('#m-msg').textContent=`✓ ગણતરી થઈ ગઈ. કુલ ${f2(blk)} ઘન ફૂટ પથ્થર. ઉપરની પટ્ટી જુઓ, અને નીચે “પરિણામ” અને “ખરીદીની યાદી” નવા માપ પ્રમાણે બદલાઈ ગયા છે.`;
  const bar=$('#bar');bar.classList.remove('flash');void bar.offsetWidth;bar.classList.add('flash');
}
let dimT=null;
['#m-w','#m-h','#m-d','#m-unit'].forEach(i=>$(i).addEventListener('input',()=>{clearTimeout(dimT);dimT=setTimeout(()=>applyDims(false),400)}));
$('#m-apply').onclick=()=>applyDims(true);
/* ---------- panels ---------- */
function groups(){
  const m=new Map();
  S.parts.forEach(p=>{const c=calc(p),key=[c.bw,c.bh,c.bd].map(x=>Math.round(x*2)/2).join('×');
    if(!m.has(key))m.set(key,{key,bw:c.bw,bh:c.bh,bd:c.bd,qty:0,vol:0,names:[]});const g=m.get(key);g.qty++;g.vol+=c.block;g.names.push(p.name)});
  return [...m.values()];
}
function renderTotals(){
  let blk=0,net=0,kg=0;S.parts.forEach(p=>{const c=calc(p);blk+=c.block;net+=c.net;kg+=c.kg});
  const ex=extent(),g=groups();
  $('#tot').textContent=f2(blk)+' ઘન ફૂટ';
  let md=0;S.parts.forEach(p=>{md=Math.max(md,calc(p).D)});
  $('#bar').innerHTML=`<b>${f2(blk)} ઘન ફૂટ</b> પથ્થર ખરીદવાનો<br><span style="font-size:.9rem">ઊંચાઈ ${f2(ex.h*S.s/12)}′ · પહોળાઈ ${f2(ex.w*S.s/12)}′ · ઊંડાઈ ${f2(md/12)}′ · ${S.parts.length} ભાગ</span>`;
  $('#tgrid').innerHTML=`<div><div class="k">કુલ ભાગ / ટુકડા</div><div class="v">${S.parts.length}</div></div>
  <div><div class="k">અલગ-અલગ સાઇઝ</div><div class="v">${g.length}</div></div>
  <div><div class="k">તૈયાર મંદિરનો પથ્થર</div><div class="v">${f2(net)} ઘન ફૂટ</div></div>
  <div><div class="k">આશરે વજન</div><div class="v">${Math.round(kg).toLocaleString('en-IN')} કિગ્રા</div></div>
  <div><div class="k">મંદિરની ઊંચાઈ</div><div class="v">${f1(ex.h*S.s)}″ (${f2(ex.h*S.s/12)} ફૂટ)</div></div>
  <div><div class="k">મંદિરની પહોળાઈ</div><div class="v">${f1(ex.w*S.s)}″ (${f2(ex.w*S.s/12)} ફૂટ)</div></div>
  ${CFG.rate?`<div><div class="k">અંદાજિત ખર્ચ</div><div class="v">₹ ${Math.round(blk*CFG.rate).toLocaleString('en-IN')}</div></div>`:''}`;
  $('#notes').innerHTML=(S.note?`<div class="note">${esc(S.note)}</div>`:'')+
   (S.parts.length>40?'<div class="note">ઘણા બધા ભાગ મળ્યા છે. “શોધ સેટિંગ” માં “ભાગ જોડવાની તાકાત” વધારો અને ફરી શોધો.</div>':'');
  $('#scaleinfo').textContent=`અત્યારે 1 પિક્સેલ = ${S.s.toFixed(4)} ઇંચ`+(S.fileScale?' (ફાઇલના એકમમાંથી, સાચું માપ)':'');
  $('#cnt').textContent=`આપોઆપ ${S.parts.length} ભાગ મળ્યા. ખોટા ભાગ કાઢો, ખૂટતા ઉમેરો, અને થાંભલી જેવા ભાગને ટુકડામાં વહેંચો.`;
}
function renderList(){
  $('#list').innerHTML=`<table><thead><tr><th>#</th><th>ભાગ</th><th class="r">બ્લોક ઘન ફૂટ</th><th class="r">બ્લોક સાઇઝ″</th></tr></thead><tbody>`+
  S.parts.map((p,i)=>{const c=calc(p);return `<tr data-id="${p.id}" class="${p.id===S.sel?'sel':''}"><td>${i+1}</td><td class="n">${esc(p.name)}</td><td class="r"><b>${f2(c.block)}</b></td><td class="r">${f1(c.bw)} × ${f1(c.bh)} × ${f1(c.bd)}</td></tr>`}).join('')+`</tbody></table>`;
  $('#buy').innerHTML=`<table><thead><tr><th>સાઇઝ (લંબાઈ × ઊંચાઈ × ઊંડાઈ ઇંચ)</th><th class="r">નંગ</th><th class="r">એકનો ઘન ફૂટ</th><th class="r">કુલ ઘન ફૂટ</th></tr></thead><tbody>`+
  groups().map(g=>`<tr><td>${f1(g.bw)} × ${f1(g.bh)} × ${f1(g.bd)}</td><td class="r">${g.qty}</td><td class="r">${f2(g.vol/g.qty)}</td><td class="r"><b>${f2(g.vol)}</b></td></tr>`).join('')+`</tbody></table>`;
}
$('#list').onclick=e=>{const r=e.target.closest('tr[data-id]');if(r)select(r.dataset.id)};
function renderViews(){
  const v=$('#views');
  if(S.views.length<2){v.innerHTML='';return}
  const opt=(sel,none)=>(none?`<option value="-1"${sel<0?' selected':''}>નથી</option>`:'')+S.views.map((_,i)=>`<option value="${i}"${i===sel?' selected':''}>વ્યૂ ${i+1}</option>`).join('');
  v.innerHTML=`<div class="note" style="margin-bottom:8px">ડ્રોઇંગમાં ${S.views.length} વ્યૂ મળ્યા (વાદળી ડૅશવાળા ચોકઠા). સામેનો દેખાવ અને પ્લાન પસંદ કરો. પ્લાન પસંદ કરશો તો ઊંડાઈ પ્લાનમાંથી આપોઆપ નીકળશે.</div>
  <div class="row"><label>સામેનો દેખાવ (એલિવેશન)<select id="v-elev">${opt(S.elev,false)}</select></label><label>ઉપરનો દેખાવ (પ્લાન)<select id="v-plan">${opt(S.plan,true)}</select></label></div>`;
  $('#v-elev').onchange=e=>{S.elev=+e.target.value;detect();full()};
  $('#v-plan').onchange=e=>{S.plan=+e.target.value;full()};
}
function renderEditor(){
  const p=cur(),ed=$('#editor');
  if(!p){ed.innerHTML='<h2>પસંદ કરેલો ભાગ</h2><p class="sub">કોઈ ચોકઠા પર ટેપ કરો અથવા “ભાગ હાથે દોરો” દબાવો.</p>';return}
  const idx=S.parts.indexOf(p),others=S.parts.filter(q=>q!==p);
  ed.innerHTML=`<h2>પસંદ કરેલો ભાગ: ${idx+1}</h2>
  <div class="row">
   <label style="flex-basis:100%">નામ<input id="e-name" value="${esc(p.name)}"></label>
   <label>ઊંડાઈ (ઇંચ)<input id="e-depth" type="number" inputmode="decimal" step="any" placeholder="આપોઆપ" value="${p.depth==null?'':p.depth}"></label>
   <label>કોતરણી પછી પથ્થર (%)<input id="e-fill" type="number" inputmode="decimal" step="any" value="${p.fill}"></label>
  </div>
  <div class="grid"><div><div class="k">પહોળાઈ</div><div class="v" id="o-w"></div></div><div><div class="k">ઊંચાઈ</div><div class="v" id="o-h"></div></div>
  <div><div class="k">ઊંડાઈ</div><div class="v" id="o-d"></div></div><div><div class="k">ખરીદવાનો બ્લોક</div><div class="v" id="o-b"></div></div></div>
  <p class="sub" id="o-src" style="margin-top:6px"></p>
  <h2 style="margin-top:14px">ટુકડામાં વહેંચો (જેમ કે થાંભલી)</h2>
  <div class="row"><label>કેટલા ટુકડા<select id="sp-n">${[2,3,4,5,6,8].map(n=>`<option>${n}</option>`).join('')}</select></label>
  <label>કેવી રીતે<select id="sp-ax"><option value="y">આડા કાપ (ઉપર-નીચે ટુકડા)</option><option value="x">ઊભા કાપ (ડાબે-જમણે ટુકડા)</option></select></label></div>
  <div class="row" style="margin-top:8px"><button class="b alt" id="sp-eq" type="button">બરાબર વહેંચો</button><button class="b alt" id="sp-auto" type="button">આકાર જોઈને આપોઆપ કાપો</button></div>
  <h2 style="margin-top:14px">બીજા ભાગ સાથે જોડો</h2>
  <div class="row"><label>જોડવાનો ભાગ<select id="mg">${others.map(q=>`<option value="${q.id}">${S.parts.indexOf(q)+1}. ${esc(q.name)}</option>`).join('')}</select></label><button class="b alt" id="mg-go" type="button" style="align-self:end">જોડો</button></div>
  <div class="row" style="margin-top:14px"><button class="b alt" id="e-del" type="button">આ ભાગ કાઢી નાખો</button></div>`;
  $('#e-name').oninput=e=>{p.name=e.target.value;refresh()};
  $('#e-depth').oninput=e=>{p.depth=e.target.value===''?null:Math.max(0,+e.target.value||0);refresh()};
  $('#e-fill').oninput=e=>{p.fill=Math.min(100,Math.max(0,+e.target.value||0));refresh()};
  $('#e-del').onclick=()=>{S.parts=S.parts.filter(q=>q!==p);S.sel=S.parts[0]?S.parts[0].id:null;full()};
  $('#sp-eq').onclick=()=>{const n=+$('#sp-n').value,ax=$('#sp-ax').value;replacePart(p,Array.from({length:n},(_,i)=>ax==='y'?{x:p.x,y:p.y+p.h*i/n,w:p.w,h:p.h/n}:{x:p.x+p.w*i/n,y:p.y,w:p.w/n,h:p.h}))};
  $('#sp-auto').onclick=()=>{
    const k=S.mask.k,{m,w,h}=S.mask,box={x0:Math.max(0,Math.round(p.x*k)),y0:Math.max(0,Math.round(p.y*k)),x1:Math.min(w,Math.round((p.x+p.w)*k)),y1:Math.min(h,Math.round((p.y+p.h)*k))};
    const mm=new Uint8Array(w*h);for(let y=box.y0;y<box.y1;y++)for(let x=box.x0;x<box.x1;x++)mm[y*w+x]=m[y*w+x];
    fillHoles(mm,w,h,box);const r=splitBlob(mm,w,h,box,{neck:0.7,minPiece:0.08,minInk:2,maxDepth:4},0);
    if(r.length<2){S.note='આ ભાગમાં કાપવાની પાતળી જગ્યા મળી નથી. “બરાબર વહેંચો” વાપરો.';refresh();return}
    S.note='';replacePart(p,r.map(b=>({x:b.x0/k,y:b.y0/k,w:(b.x1-b.x0)/k,h:(b.y1-b.y0)/k})));
  };
  $('#mg-go').onclick=()=>{const q=S.parts.find(z=>z.id===$('#mg').value);if(!q)return;
    const x0=Math.min(p.x,q.x),y0=Math.min(p.y,q.y),x1=Math.max(p.x+p.w,q.x+q.w),y1=Math.max(p.y+p.h,q.y+q.h);
    Object.assign(p,{x:x0,y:y0,w:x1-x0,h:y1-y0,depth:null});S.parts=S.parts.filter(z=>z!==q);full()};
  refresh();
}
function replacePart(p,boxes){
  const i=S.parts.indexOf(p),np=boxes.map((b,j)=>({id:uid(),name:`${p.name} – ટુકડો ${j+1}`,x:b.x,y:b.y,w:b.w,h:b.h,depth:p.depth,fill:p.fill}));
  S.parts.splice(i,1,...np);S.sel=np[0].id;
/* ---------- AI part finding (photos and shaded renders) ---------- */
let SAMPLE=null,AIOK=false,AICTL=null;
(async()=>{try{SAMPLE=window.claude?await claude.use('sample'):null}catch(e){SAMPLE=null}
  AIOK=!!SAMPLE})();
const AI_PROMPT=`You are helping a Gujarati marble-temple (mandir) maker decide which stone blocks to buy. The attached image shows a mandir, either a photo or a drawing.
Mandirs come in several styles, for example: (1) a large marble mandir with stepped plinth and an elephant frieze band, clusters of square carved pillars with bracket capitals, jali side panels, a carved back panel, a flat roof slab (chhajja), a jali railing band and many small domed pavilions (shikhar) stacked in tiers above; (2) a drawing with a peacock crown on top, an angled chhajja, pillars with square carved tops, an arch (toran) with carved spandrels, elephants at the base and a plinth of drawers with carved panels; (3) a drawing with a multi-foil curved arch, two kalash finials, round-capital pillars standing on elephants and a wide plinth of drawer panels; (4) a classic stone mandir with a carved plinth band, front pillars built from a base block, shaft sections and a kumbh, a jali arch, a roof slab and a shikhar made of many small domes around one tall central dome with a gold kalash. Expect any of these or a mix.
List every separately carved stone piece of the mandir itself, the way each would be bought and carved as its own block. Split built-up things into their real stone pieces: a pillar into base, shaft sections, bulging kumbh/capital and bracket pieces; the roof into slabs (chhajja), each shikhar, dome and kalash; arch/toran, carved panels, jali, steps, plinth layers, elephants, drawer or storage fronts, railings.
Ignore: wall, floor, background, furniture, people, deity statues (murti), hanging lamps, gold decoration, text, logos and borders.
For each piece give a tight axis-aligned box [x0,y0,x1,y1] on a 0-1000 scale relative to the image (x to the right, y downward). List repeated small pieces (for example each small dome) separately when you can see them clearly. At most 60 pieces, ordered from top to bottom.
Also give depth_ratio: your estimate of the piece's front-to-back thickness divided by its visible width (a round pillar piece is 1, a thin carved panel about 0.1, a roof slab about 0.8). And fill: the percent (30 to 100) of its bounding block that stays as stone after carving.
Name each piece in short Gujarati, for example "ડાબી થાંભલી - નીચેનો ટુકડો".
Reply with only a JSON array: [{"name":"...","box":[x0,y0,x1,y1],"depth_ratio":0.5,"fill":80}]`;
const AI_ERR={not_granted:'AI વાપરવાની મંજૂરી આપી નથી.',rate_limited:'થોડી વાર પછી ફરી પ્રયત્ન કરો.',invalid_json:'AI નો જવાબ સમજાયો નહીં. ફરી દબાવો.',images_unavailable:'આ વ્યૂમાં AI ઇમેજ જોઈ શકતું નથી. લિંક claude.ai ની એપ કે વેબસાઇટમાં ખોલો.',session_expired:'ફરી સાઇન ઇન કરો.',image_rejected:'ઇમેજ AI ને ચાલી નહીં. બીજી ઇમેજ અજમાવો.'};
function applyAi(arr){
  if(!Array.isArray(arr))throw {code:'invalid_json'};
  const parts=[];
  for(const it of arr){
    const bx=it&&it.box;if(!Array.isArray(bx)||bx.length!==4||bx.some(v=>typeof v!=='number'))continue;
    let [x0,y0,x1,y1]=bx;x0=Math.max(0,Math.min(x0,x1));x1=Math.min(1000,Math.max(bx[0],bx[2]));y0=Math.max(0,Math.min(y0,y1));y1=Math.min(1000,Math.max(bx[1],bx[3]));
    if(x1-x0<5||y1-y0<5)continue;
    const dr=+it.depth_ratio,fl=+it.fill;
    parts.push({id:uid(),name:String(it.name||'ભાગ '+(parts.length+1)).slice(0,60),x:x0/1000*S.w,y:y0/1000*S.h,w:(x1-x0)/1000*S.w,h:(y1-y0)/1000*S.h,depth:null,depthRatio:dr>0&&dr<=4?dr:0,fill:fl>=20&&fl<=100?fl:100});
  }
  if(!parts.length)throw {code:'invalid_json'};
  S.parts=parts;S.sel=parts[0].id;
}
async function runAi(){
  if(AICTL){AICTL.abort();return}
  if(!S.canvas)return;
  if(!SAMPLE){
    $('#aistat').textContent='AI આ વ્યૂમાં ઉપલબ્ધ નથી (લિંક claude.ai માં સાઇન ઇન કરીને ખોલો). ઓફલાઇન શોધ વાપરી છે, ફોટો માટે તે નબળી છે.';
    if(!S.parts.length){detect();full()}return}
  AICTL=new AbortController();$('#ai').textContent='રોકો';
  $('#aistat').textContent='AI ડ્રોઇંગ જોઈ રહ્યું છે. 1 થી 2 મિનિટ લાગી શકે...';
  try{
    const blob=await new Promise(r=>S.canvas.toBlob(r,'image/jpeg',0.9));
    const res=await SAMPLE.json(AI_PROMPT,{images:blob,signal:AICTL.signal});
    applyAi(res);S.note='AI એ '+S.parts.length+' ભાગ શોધ્યા. ચોકઠા થોડા આઘાપાછા હોઈ શકે, દરેક તપાસીને સુધારો અને પછી “માપ સેટ કરો” માં સાચું માપ લખો.';
    $('#aistat').textContent='';full();
  }catch(e){
    const c=e&&e.code;
    $('#aistat').textContent=c==='cancelled'?'':(AI_ERR[c]||'AI ચાલ્યું નહીં.')+(c==='cancelled'?'':' ઓફલાઇન શોધ વાપરી છે.');
    if(c!=='cancelled'&&!S.parts.length){detect();full()}
  }finally{AICTL=null;$('#ai').textContent='AI થી ભાગ શોધો'}
}
$('#ai').onclick=runAi;

full();
}
function refresh(){
  const p=cur();
  if(p&&$('#o-w')){const c=calc(p);$('#o-w').textContent=`${f1(c.W)}″ (${f2(c.W/12)} ફૂટ)`;$('#o-h').textContent=`${f1(c.H)}″ (${f2(c.H/12)} ફૂટ)`;$('#o-d').textContent=`${f1(c.D)}″`;$('#o-b').textContent=`${f2(c.block)} ઘન ફૂટ`;$('#o-src').textContent=`ઊંડાઈ: ${c.dsrc}. બ્લોક સાઇઝ ${f1(c.bw)} × ${f1(c.bh)} × ${f1(c.bd)} ઇંચ. તૈયાર ભાગનો પથ્થર ${f2(c.net)} ઘન ફૂટ.`}
  renderTotals();renderList();
}
function full(){document.body.classList.toggle('empty',!S.canvas);$('#zoomwrap').hidden=!S.canvas;drawBoxes();renderViews();renderScaleUI();renderEditor();refresh()}

/* ---------- copy ---------- */
$('#copy').onclick=async()=>{
  let blk=0;S.parts.forEach(p=>blk+=calc(p).block);
  const txt=['પથ્થર ખરીદીની યાદી',...groups().map(g=>`${f1(g.bw)}″ × ${f1(g.bh)}″ × ${f1(g.bd)}″ — ${g.qty} નંગ — ${f2(g.vol)} ઘન ફૂટ (${g.names.join(', ')})`),`કુલ: ${f2(blk)} ઘન ફૂટ`].join('\n');
  try{await navigator.clipboard.writeText(txt);$('#copy').textContent='કોપી થઈ ગયું'}catch(e){
    const ta=document.createElement('textarea');ta.value=txt;ta.style.width='100%';ta.rows=8;$('#buy').after(ta);ta.select();$('#copy').textContent='ઉપર લખાણ પસંદ છે, કોપી કરો'}
  setTimeout(()=>$('#copy').textContent='યાદી કોપી કરો',2500);
};

/* ---------- opening files ---------- */
function useCanvas(c,inPerPx,note,example,noDetect){S.noDetect=!!noDetect;
  S.canvas=c;S.w=c.width;S.h=c.height;S.src=c.toDataURL('image/png');S.example=!!example;S.note=note||'';
  S.fileScale=!!inPerPx;
  if(inPerPx)S.s=inPerPx;
  analyze();
  if(!inPerPx){const ex=extent();S.s=48/ex.h;$('#refval').value=4;$('#refunit').value='ft';$('#refwhat').value='H'}
  img.src=S.src;
/* ---------- AI part finding (photos and shaded renders) ---------- */
let SAMPLE=null,AIOK=false,AICTL=null;
(async()=>{try{SAMPLE=window.claude?await claude.use('sample'):null}catch(e){SAMPLE=null}
  AIOK=!!SAMPLE})();
const AI_PROMPT=`You are helping a Gujarati marble-temple (mandir) maker decide which stone blocks to buy. The attached image shows a mandir, either a photo or a drawing.
List every separately carved stone piece of the mandir itself, the way each would be bought and carved as its own block. Split built-up things into their real stone pieces: a pillar into base, shaft sections, bulging kumbh/capital and bracket pieces; the roof into slabs (chhajja), each shikhar, dome and kalash; arch/toran, carved panels, jali, steps, plinth layers, elephants, drawer or storage fronts, railings.
Ignore: wall, floor, background, furniture, people, deity statues (murti), hanging lamps, gold decoration, text, logos and borders.
For each piece give a tight axis-aligned box [x0,y0,x1,y1] on a 0-1000 scale relative to the image (x to the right, y downward). List repeated small pieces (for example each small dome) separately when you can see them clearly. At most 60 pieces, ordered from top to bottom.
Also give depth_ratio: your estimate of the piece's front-to-back thickness divided by its visible width (a round pillar piece is 1, a thin carved panel about 0.1, a roof slab about 0.8). And fill: the percent (30 to 100) of its bounding block that stays as stone after carving.
Name each piece in short Gujarati, for example "ડાબી થાંભલી - નીચેનો ટુકડો".
Reply with only a JSON array: [{"name":"...","box":[x0,y0,x1,y1],"depth_ratio":0.5,"fill":80}]`;
const AI_ERR={not_granted:'AI વાપરવાની મંજૂરી આપી નથી.',rate_limited:'થોડી વાર પછી ફરી પ્રયત્ન કરો.',invalid_json:'AI નો જવાબ સમજાયો નહીં. ફરી દબાવો.',images_unavailable:'આ વ્યૂમાં AI ઇમેજ જોઈ શકતું નથી. લિંક claude.ai ની એપ કે વેબસાઇટમાં ખોલો.',session_expired:'ફરી સાઇન ઇન કરો.',image_rejected:'ઇમેજ AI ને ચાલી નહીં. બીજી ઇમેજ અજમાવો.'};
function applyAi(arr){
  if(!Array.isArray(arr))throw {code:'invalid_json'};
  const parts=[];
  for(const it of arr){
    const bx=it&&it.box;if(!Array.isArray(bx)||bx.length!==4||bx.some(v=>typeof v!=='number'))continue;
    let [x0,y0,x1,y1]=bx;x0=Math.max(0,Math.min(x0,x1));x1=Math.min(1000,Math.max(bx[0],bx[2]));y0=Math.max(0,Math.min(y0,y1));y1=Math.min(1000,Math.max(bx[1],bx[3]));
    if(x1-x0<5||y1-y0<5)continue;
    const dr=+it.depth_ratio,fl=+it.fill;
    parts.push({id:uid(),name:String(it.name||'ભાગ '+(parts.length+1)).slice(0,60),x:x0/1000*S.w,y:y0/1000*S.h,w:(x1-x0)/1000*S.w,h:(y1-y0)/1000*S.h,depth:null,depthRatio:dr>0&&dr<=4?dr:0,fill:fl>=20&&fl<=100?fl:100});
  }
  if(!parts.length)throw {code:'invalid_json'};
  S.parts=parts;S.sel=parts[0].id;
}
async function runAi(){
  if(AICTL){AICTL.abort();return}
  if(!S.canvas)return;
  if(!SAMPLE){
    $('#aistat').textContent='AI આ વ્યૂમાં ઉપલબ્ધ નથી (લિંક claude.ai માં સાઇન ઇન કરીને ખોલો). ઓફલાઇન શોધ વાપરી છે, ફોટો માટે તે નબળી છે.';
    if(!S.parts.length){detect();full()}return}
  AICTL=new AbortController();$('#ai').textContent='રોકો';
  $('#aistat').textContent='AI ડ્રોઇંગ જોઈ રહ્યું છે. 1 થી 2 મિનિટ લાગી શકે...';
  try{
    const blob=await new Promise(r=>S.canvas.toBlob(r,'image/jpeg',0.9));
    const res=await SAMPLE.json(AI_PROMPT,{images:blob,signal:AICTL.signal});
    applyAi(res);S.note='AI એ '+S.parts.length+' ભાગ શોધ્યા. ચોકઠા થોડા આઘાપાછા હોઈ શકે, દરેક તપાસીને સુધારો અને પછી “માપ સેટ કરો” માં સાચું માપ લખો.';
    $('#aistat').textContent='';full();
  }catch(e){
    const c=e&&e.code;
    $('#aistat').textContent=c==='cancelled'?'':(AI_ERR[c]||'AI ચાલ્યું નહીં.')+(c==='cancelled'?'':' ઓફલાઇન શોધ વાપરી છે.');
    if(c!=='cancelled'&&!S.parts.length){detect();full()}
  }finally{AICTL=null;$('#ai').textContent='AI થી ભાગ શોધો'}
}
$('#ai').onclick=runAi;

full();
}
function parseDxf(text){
  const L=text.split(/\r?\n/),pr=[];for(let i=0;i+1<L.length;i+=2)pr.push([parseInt(L[i].trim(),10),L[i+1].trim()]);
  const hdr={},ents=[],blocks={};let sec='',cur=null,pv=null,poly=null,tgt=ents,bl=null;
  for(let i=0;i<pr.length;i++){const [c,v]=pr[i];
    if(c===0&&v==='SECTION'){sec=(pr[i+1]||[])[1];continue}
    if(c===0&&v==='ENDSEC'){cur=null;sec='';tgt=ents;continue}
    if(sec==='HEADER'){if(c===9)pv=v;else if(pv&&c===70){hdr[pv]=+v;pv=null}continue}
    if(sec!=='ENTITIES'&&sec!=='BLOCKS')continue;
    if(c===0){
      if(v==='BLOCK'){bl={name:'',bx:0,by:0,list:[]};tgt=bl.list;cur={t:'BLOCK',x:[],y:[],_b:bl};continue}
      if(v==='ENDBLK'){if(bl)blocks[bl.name]=bl;bl=null;tgt=ents;cur=null;continue}
      if(v==='VERTEX'&&poly){cur={t:'VERTEX',x:[],y:[]};poly.verts.push(cur);continue}
      if(v==='SEQEND'){poly=null;cur=null;continue}
      cur={t:v,x:[],y:[],flags:0};if(v==='POLYLINE'){poly=cur;cur.verts=[]}tgt.push(cur);continue}
    if(!cur)continue;const f=parseFloat(v);
    if(cur.t==='BLOCK'){if(c===2)cur._b.name=v;else if(c===10)cur._b.bx=f;else if(c===20)cur._b.by=f;continue}
    if(c===10)cur.x.push(f);else if(c===20)cur.y.push(f);else if(c===11)cur.x2=f;else if(c===21)cur.y2=f;
    else if(c===40)cur.r=f;else if(c===50)cur.a0=f;else if(c===51)cur.a1=f;else if(c===70)cur.flags=+v;
    else if(c===2)cur.name=v;else if(c===41)cur.sx=f;else if(c===42)cur.sy=f;
  }
  return {hdr,ents,blocks};
}
function dxfPaths(list,blocks,M,depth,out,skip){
  const T=(x,y)=>[M[0]*x+M[2]*y+M[4],M[1]*x+M[3]*y+M[5]];
  const arc=(cx,cy,r,a0,a1)=>{let s=a0*Math.PI/180,e=a1*Math.PI/180;if(e<=s)e+=2*Math.PI;const n=Math.max(8,Math.ceil((e-s)/0.1)),P=[];for(let i=0;i<=n;i++){const a=s+(e-s)*i/n;P.push(T(cx+r*Math.cos(a),cy+r*Math.sin(a)))}return P};
  for(const e of list){
    if(e.t==='LINE'&&e.x2!=null)out.push([T(e.x[0],e.y[0]),T(e.x2,e.y2)]);
    else if(e.t==='LWPOLYLINE'||e.t==='SPLINE'){const P=e.x.map((x,i)=>T(x,e.y[i]));if(e.t==='LWPOLYLINE'&&(e.flags&1))P.push(P[0]);out.push(P)}
    else if(e.t==='POLYLINE'){const P=e.verts.map(v=>T(v.x[0],v.y[0]));if(e.flags&1)P.push(P[0]);out.push(P)}
    else if(e.t==='CIRCLE')out.push(arc(e.x[0],e.y[0],e.r,0,360));
    else if(e.t==='ARC')out.push(arc(e.x[0],e.y[0],e.r,e.a0,e.a1));
    else if(e.t==='INSERT'&&blocks[e.name]&&depth<4){
      const b=blocks[e.name],sx=e.sx==null?1:e.sx,sy=e.sy==null?sx:e.sy,a=(e.a0||0)*Math.PI/180,co=Math.cos(a),si=Math.sin(a);
      const ix=e.x[0]||0,iy=e.y[0]||0;
      const N=[co*sx,si*sx,-si*sy,co*sy,ix-(co*sx*b.bx-si*sy*b.by),iy-(si*sx*b.bx+co*sy*b.by)];
      const C=[M[0]*N[0]+M[2]*N[1],M[1]*N[0]+M[3]*N[1],M[0]*N[2]+M[2]*N[3],M[1]*N[2]+M[3]*N[3],M[0]*N[4]+M[2]*N[5]+M[4],M[1]*N[4]+M[3]*N[5]+M[5]];
      dxfPaths(b.list,blocks,C,depth+1,out,skip)}
    else if(['ELLIPSE','HATCH','3DFACE','SOLID'].includes(e.t))skip.n++;
  }
}
function dxfToCanvas(text){
  const {hdr,ents,blocks}=parseDxf(text);if(!ents.length)throw new Error('DXF માં કંઈ મળ્યું નથી. ફાઇલ ASCII DXF તરીકે સેવ કરો.');
  const paths=[],skip={n:0};dxfPaths(ents,blocks,[1,0,0,1,0,0],0,paths,skip);
  let x0=1e30,y0=1e30,x1=-1e30,y1=-1e30;paths.forEach(P=>P.forEach(([x,y])=>{x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}));
  if(!(x1>x0))throw new Error('ડ્રોઇંગની રેખાઓ મળી નથી.');
  const m=24,W=1600,k=(W-2*m)/(x1-x0),H=Math.round((y1-y0)*k+2*m);
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);g.strokeStyle='#111';g.lineWidth=1.5;
  paths.forEach(P=>{g.beginPath();P.forEach(([x,y],i)=>{const X=m+(x-x0)*k,Y=H-m-(y-y0)*k;i?g.lineTo(X,Y):g.moveTo(X,Y)});g.stroke()});
  const u=UCODE[hdr.$INSUNITS];
  return {c,inPerPx:u?FT[u]*12/k:null,u,skipped:skip.n};
}
async function pdfToCanvas(buf){
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const pdf=await pdfjsLib.getDocument({data:buf}).promise,page=await pdf.getPage(1);
  const v0=page.getViewport({scale:1}),v=page.getViewport({scale:1600/v0.width});
  const c=document.createElement('canvas');c.width=v.width;c.height=v.height;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);
  await page.render({canvasContext:g,viewport:v}).promise;return c;
}
$('#open').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{
  const f=e.target.files[0];if(!f)return;const ext=f.name.split('.').pop().toLowerCase();
  S.note='ફાઇલ વાંચી રહ્યું છે...';renderTotals();
  try{
    if(ext==='dxf'){const r=dxfToCanvas(await f.text());
      useCanvas(r.c,r.inPerPx,r.inPerPx?`DXF નું એકમ (${r.u}) મળ્યું, એટલે સાચા માપ આપોઆપ આવ્યા છે.${r.skipped?' '+r.skipped+' વસ્તુઓ (hatch/ellipse) દોરી શકાઈ નથી.':''}`:'DXF માં એકમ નથી. “માપ સેટ કરો” માં એક માપ લખો, બાકીના બધા એ પ્રમાણે નીકળશે.')}
    else if(ext==='pdf'){if(typeof pdfjsLib==='undefined')throw new Error('PDF રીડર લોડ થયું નથી. ઇન્ટરનેટ તપાસો, અથવા PDF નો ફોટો/DXF વાપરો.');
      useCanvas(await pdfToCanvas(new Uint8Array(await f.arrayBuffer())),null,'PDF માં માપ નથી, એટલે ઊંચાઈ 4 ફૂટ માની છે. “માપ સેટ કરો” માં સાચું માપ લખો.')}
    else if(/^(png|jpe?g|webp|bmp)$/.test(ext)){const im=new Image();im.onload=()=>{const k=Math.min(1,1600/im.width),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);useCanvas(c,null,'ફોટો/ઇમેજમાં માપ નથી, એટલે ઊંચાઈ 4 ફૂટ માની છે. ભાગ શોધાઈ જાય પછી “માપ સેટ કરો” માં સાચું માપ લખો.',false,true);runAi()};im.src=URL.createObjectURL(f)}
    else S.note='ફક્ત DXF, PDF કે ફોટો ચાલશે. DWG ને AutoCAD માં DXF તરીકે સેવ કરો.';
  }catch(err){S.note='ફાઇલ વાંચી શકાઈ નથી: '+err.message}
  renderTotals();e.target.value='';
};

/* ---------- AI part finding (photos and shaded renders) ---------- */
let SAMPLE=null,AIOK=false,AICTL=null;
(async()=>{try{SAMPLE=window.claude?await claude.use('sample'):null}catch(e){SAMPLE=null}
  AIOK=!!SAMPLE})();
const AI_PROMPT=`You are helping a Gujarati marble-temple (mandir) maker decide which stone blocks to buy. The attached image shows a mandir, either a photo or a drawing.
List every separately carved stone piece of the mandir itself, the way each would be bought and carved as its own block. Split built-up things into their real stone pieces: a pillar into base, shaft sections, bulging kumbh/capital and bracket pieces; the roof into slabs (chhajja), each shikhar, dome and kalash; arch/toran, carved panels, jali, steps, plinth layers, elephants, drawer or storage fronts, railings.
Ignore: wall, floor, background, furniture, people, deity statues (murti), hanging lamps, gold decoration, text, logos and borders.
For each piece give a tight axis-aligned box [x0,y0,x1,y1] on a 0-1000 scale relative to the image (x to the right, y downward). List repeated small pieces (for example each small dome) separately when you can see them clearly. At most 60 pieces, ordered from top to bottom.
Also give depth_ratio: your estimate of the piece's front-to-back thickness divided by its visible width (a round pillar piece is 1, a thin carved panel about 0.1, a roof slab about 0.8). And fill: the percent (30 to 100) of its bounding block that stays as stone after carving.
Name each piece in short Gujarati, for example "ડાબી થાંભલી - નીચેનો ટુકડો".
Reply with only a JSON array: [{"name":"...","box":[x0,y0,x1,y1],"depth_ratio":0.5,"fill":80}]`;
const AI_ERR={not_granted:'AI વાપરવાની મંજૂરી આપી નથી.',rate_limited:'થોડી વાર પછી ફરી પ્રયત્ન કરો.',invalid_json:'AI નો જવાબ સમજાયો નહીં. ફરી દબાવો.',images_unavailable:'આ વ્યૂમાં AI ઇમેજ જોઈ શકતું નથી. લિંક claude.ai ની એપ કે વેબસાઇટમાં ખોલો.',session_expired:'ફરી સાઇન ઇન કરો.',image_rejected:'ઇમેજ AI ને ચાલી નહીં. બીજી ઇમેજ અજમાવો.'};
function applyAi(arr){
  if(!Array.isArray(arr))throw {code:'invalid_json'};
  const parts=[];
  for(const it of arr){
    const bx=it&&it.box;if(!Array.isArray(bx)||bx.length!==4||bx.some(v=>typeof v!=='number'))continue;
    let [x0,y0,x1,y1]=bx;x0=Math.max(0,Math.min(x0,x1));x1=Math.min(1000,Math.max(bx[0],bx[2]));y0=Math.max(0,Math.min(y0,y1));y1=Math.min(1000,Math.max(bx[1],bx[3]));
    if(x1-x0<5||y1-y0<5)continue;
    const dr=+it.depth_ratio,fl=+it.fill;
    parts.push({id:uid(),name:String(it.name||'ભાગ '+(parts.length+1)).slice(0,60),x:x0/1000*S.w,y:y0/1000*S.h,w:(x1-x0)/1000*S.w,h:(y1-y0)/1000*S.h,depth:null,depthRatio:dr>0&&dr<=4?dr:0,fill:fl>=20&&fl<=100?fl:100});
  }
  if(!parts.length)throw {code:'invalid_json'};
  S.parts=parts;S.sel=parts[0].id;
}
async function runAi(){
  if(AICTL){AICTL.abort();return}
  if(!S.canvas)return;
  if(!SAMPLE){
    $('#aistat').textContent='AI આ વ્યૂમાં ઉપલબ્ધ નથી (લિંક claude.ai માં સાઇન ઇન કરીને ખોલો). ઓફલાઇન શોધ વાપરી છે, ફોટો માટે તે નબળી છે.';
    if(!S.parts.length){detect();full()}return}
  AICTL=new AbortController();$('#ai').textContent='રોકો';
  $('#aistat').textContent='AI ડ્રોઇંગ જોઈ રહ્યું છે. 1 થી 2 મિનિટ લાગી શકે...';
  try{
    const blob=await new Promise(r=>S.canvas.toBlob(r,'image/jpeg',0.9));
    const res=await SAMPLE.json(AI_PROMPT,{images:blob,signal:AICTL.signal});
    applyAi(res);S.note='AI એ '+S.parts.length+' ભાગ શોધ્યા. ચોકઠા થોડા આઘાપાછા હોઈ શકે, દરેક તપાસીને સુધારો અને પછી “માપ સેટ કરો” માં સાચું માપ લખો.';
    $('#aistat').textContent='';full();
  }catch(e){
    const c=e&&e.code;
    $('#aistat').textContent=c==='cancelled'?'':(AI_ERR[c]||'AI ચાલ્યું નહીં.')+(c==='cancelled'?'':' ઓફલાઇન શોધ વાપરી છે.');
    if(c!=='cancelled'&&!S.parts.length){detect();full()}
  }finally{AICTL=null;$('#ai').textContent='AI થી ભાગ શોધો'}
}
$('#ai').onclick=runAi;

full();
