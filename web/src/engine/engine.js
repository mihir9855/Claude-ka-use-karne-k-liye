import {LH} from './lh.js'
export {LH}
export var _listeners=[],_version=0,_saveHook=null,_toast=function(){},_copy=function(){};
export function subscribe(fn){_listeners.push(fn);return function(){_listeners=_listeners.filter(function(x){return x!==fn})}}
export function getVersion(){return _version}
export function notify(){_version++;_listeners.slice().forEach(function(f){f()})}
export function setSaveHook(f){_saveHook=f}
export function setToastHandler(f){_toast=f}
export function setCopyHandler(f){_copy=f}
export function toast(msg,undo){_toast(msg,undo)}
export function save(){try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}notify();if(_saveHook)_saveHook()}
export function persistQuiet(){try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}}
export function setDB(d){DB=d}
export function setPdfMode(m){PDFMODE=m}
export function fallbackCopy(text){_copy(text)}
export var KEY='bt-data-v1';
export var SECTIONS=['Stone','Carving','Fitting','Transport','Site visit','Other'];
export var SCOL=['coral','amber','violet','blue','pink','teal'];
export var TYPES=['Stone supplier','Carving worker','Fitting team','Daily wage (via seth)','Transport','Other'];
export var MODES=['Cash','UPI','Bank','Cheque'];
export var DEF_STAGES=['Foundation','Plinth','Pillars and beams','Walls and ceiling','Spire (shikhar)','Finishing and handover'];
export var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
export function INR(n){return '₹'+Number(n||0).toLocaleString('en-IN')}
export function SHORT(n){var a=Math.abs(n),s=n<0?'−':'';if(a>=10000000)return s+'₹'+(a/10000000).toFixed(2).replace(/\.?0+$/,'')+'Cr';if(a>=100000)return s+'₹'+(a/100000).toFixed(2).replace(/\.?0+$/,'')+'L';return s+'₹'+a.toLocaleString('en-IN')}
export function num(v){var n=parseInt(String(v==null?'':v).replace(/[^0-9]/g,''),10);return isNaN(n)?0:n}
export function pad(n,l){return ('0000000'+n).slice(-l)}
export function today(){var d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1,2)+'-'+pad(d.getDate(),2)}
export function fmt(iso){if(!iso)return '';var p=iso.split('-');if(p.length<3)return iso;return (+p[2])+' '+MON[+p[1]-1]+' '+p[0]}
export function words(n){var a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'],b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
 function two(x){return x<20?a[x]:b[Math.floor(x/10)]+(x%10?' '+a[x%10]:'')}
 function three(x){var r='';if(x>=100){r+=a[Math.floor(x/100)]+' Hundred';x=x%100;if(x)r+=' '}if(x)r+=two(x);return r}
 var r=[],cr=Math.floor(n/10000000);n=n%10000000;var lk=Math.floor(n/100000);n=n%100000;var th=Math.floor(n/1000);n=n%1000;
 if(cr)r.push(two(cr)+' Crore');if(lk)r.push(two(lk)+' Lakh');if(th)r.push(two(th)+' Thousand');if(n)r.push(three(n));return 'Rupees '+(r.join(' ')||'Zero')+' only'}
export function blank(){return {biz:{name:'Brihad Temple Construction Co.',phone:'+91 77789 52024, +91 98986 30320',addr:'Email: brihadtemple.co@gmail.com',lhBW:false},projects:[],parties:[],txns:[],seq:0,vseq:0,proposals:[],pseq:0,terms:{}}}
export var DB=(function(){try{var d=JSON.parse(localStorage.getItem(KEY));if(d&&d.projects&&d.parties&&d.txns){d.biz=d.biz||blank().biz;if(!d.biz.phone)d.biz.phone=blank().biz.phone;if(!d.biz.addr)d.biz.addr=blank().biz.addr;d.seq=d.seq||0;d.vseq=d.vseq||0;d.proposals=d.proposals||[];d.pseq=d.pseq||0;d.terms=d.terms||{};return d}}catch(e){}return blank()})();
export function uid(){DB.seq=(DB.seq||0)+1;return 'i'+Date.now().toString(36)+DB.seq}
export function derive(){
  var D={projects:[],byId:{},parties:[],pById:{},months:[],heat:{},looseIn:0,looseOut:0,looseSec:{}};SECTIONS.forEach(function(s){D.looseSec[s]=0});
  DB.projects.forEach(function(p){
    var q=Object.assign({},p);q.received=0;q.spent=0;q.billed=0;q.paidParty=0;q.stageRec={};q.sec={};SECTIONS.forEach(function(s){q.sec[s]=0});
    var done=0;q.stages.forEach(function(s){if(s.done)done++});
    q.doneCount=done;q.progress=q.stages.length?Math.round(done/q.stages.length*100):0;
    q.curIdx=-1;for(var i=0;i<q.stages.length;i++){if(!q.stages[i].done){q.curIdx=i;break}}
    q.status=(q.stages.length&&done===q.stages.length)?'done':'active';
    D.byId[p.id]=q;D.projects.push(q)});
  DB.parties.forEach(function(p){var q=Object.assign({},p);q.bills=0;q.paid=0;q.lines=[];D.pById[p.id]=q;D.parties.push(q)});
  var months=[],d=new Date();d.setDate(1);
  for(var i=5;i>=0;i--){var m=new Date(d.getFullYear(),d.getMonth()-i,1);months.push({k:m.getFullYear()+'-'+pad(m.getMonth()+1,2),l:MON[m.getMonth()],inn:0,out:0})}
  D.months=months;
  var curM=today().slice(0,7);
  DB.txns.forEach(function(t){
    var p=D.byId[t.projId];
    if(t.kind==='in'){if(p){p.received+=t.amount;if(t.stageId)p.stageRec[t.stageId]=(p.stageRec[t.stageId]||0)+t.amount}else D.looseIn+=t.amount}
    else if(t.kind==='out'){if(p){p.spent+=t.amount;p.sec[t.section]=(p.sec[t.section]||0)+t.amount}else{D.looseOut+=t.amount;D.looseSec[t.section]=(D.looseSec[t.section]||0)+t.amount}}
    var pt=t.partyId&&D.pById[t.partyId];
    if(pt){if(t.kind==='bill'){pt.bills+=t.amount;if(p)p.billed+=t.amount}else if(t.kind==='out'){pt.paid+=t.amount;if(p)p.paidParty+=t.amount}pt.lines.push(t)}
    D.months.forEach(function(m){if(t.date&&t.date.slice(0,7)===m.k){if(t.kind==='in')m.inn+=t.amount;else if(t.kind==='out')m.out+=t.amount}});
    if(t.kind==='out'&&t.date&&t.date.slice(0,7)===curM){var dd=+t.date.slice(8,10);D.heat[dd]=(D.heat[dd]||0)+t.amount}
  });
  D.projects.forEach(function(p){p.due=Math.max(0,p.billed-p.paidParty)});
  D.totalValue=0;D.received=0;D.spent=0;D.toReceive=0;D.sec={};SECTIONS.forEach(function(s){D.sec[s]=0});
  D.projects.forEach(function(p){D.totalValue+=p.value;D.received+=p.received;D.spent+=p.spent;D.toReceive+=Math.max(0,p.value-p.received);SECTIONS.forEach(function(s){D.sec[s]+=p.sec[s]||0})});
  D.received+=D.looseIn;D.spent+=D.looseOut;SECTIONS.forEach(function(s){D.sec[s]+=D.looseSec[s]||0});D.cash=D.received-D.spent;
  D.owe=0;D.parties.forEach(function(p){p.bal=p.bills-p.paid;if(p.bal>0)D.owe+=p.bal});
  D.month=D.months[5];
  return D}
export function dateSort(a,b){return a.date===b.date?(a.n<b.n?1:-1):(a.date<b.date?1:-1)}
export function sortedTxns(kinds){var out=[];DB.txns.forEach(function(t,i){if(!kinds||kinds.indexOf(t.kind)>=0)out.push(Object.assign({n:i},t))});out.sort(dateSort);return out}
export function stageName(p,id){var s=p&&p.stages.filter(function(x){return x.id===id})[0];return s?s.name:''}
export function enrich(D,list){return list.map(function(t){var p=D.byId[t.projId];return Object.assign({},t,{stageName:t.stageId?stageName(p,t.stageId):''})})}
export function findTxn(id){for(var i=0;i<DB.txns.length;i++)if(DB.txns[i].id===id)return DB.txns[i]}
export function voucherInfo(t){var D=derive(),p=D.byId[t.projId],inn=t.kind==='in';return {t:t,inn:inn,proj:p?p.name:'',trust:p?(p.trust||''):'',stage:inn?(t.stageId?stageName(p,t.stageId):''):t.section,who:t.who||''}}
export function voucherPaper(t){
  if(t.kind==='in')return letterPaper(t);
  var v=voucherInfo(t),b=DB.biz,INK='#1F2230',MU='#7A7E92',SF='#E08A2E',LN='#E9E6DC';
  function row(l,val){return '<div style="padding:10px 0;border-bottom:1px solid '+LN+';display:flex;justify-content:space-between;gap:16px;align-items:baseline"><span style="font-size:12px;color:'+MU+';flex-shrink:0">'+l+'</span><b style="font-size:15px;text-align:right;overflow-wrap:anywhere">'+val+'</b></div>'}
  return '<div class="vfit"><div class="vin" data-w="720" style="width:720px"><div class="paper" style="padding:0;border-radius:6px;background:#fff;border:1px solid #DAD7CC;color:'+INK+';font-family:Manrope,system-ui,sans-serif;height:507px;display:flex;flex-direction:column;overflow:hidden">'
  +'<div style="height:6px;background:'+SF+';flex-shrink:0"></div>'
  +'<div style="text-align:center;font-family:\'Noto Sans Devanagari\',\'Mangal\',sans-serif;font-size:14px;font-weight:700;color:#55597A;padding:9px 0 0;letter-spacing:.02em">॥ श्री गणेशाय नमः ॥</div>'
  +'<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:8px 34px 0"><div style="display:flex;align-items:center;gap:16px;min-width:0"><img src="'+LH.l+'" alt="Brihad Temple logo" style="height:58px;width:auto;flex-shrink:0"><div style="min-width:0"><div style="font-size:16px;font-weight:800;letter-spacing:.12em;white-space:nowrap">'+esc(b.name.toUpperCase())+'</div><div style="font-size:11.5px;color:'+MU+';margin-top:4px;line-height:1.5">'+esc(b.phone||'')+(b.phone&&b.addr?'<br>':'')+esc(b.addr||'')+'</div></div></div>'
  +'<div style="text-align:right;flex-shrink:0"><div style="font-size:12.5px;font-weight:800;letter-spacing:.26em">'+(v.inn?'RECEIPT VOUCHER':'PAYMENT VOUCHER')+'</div><div style="font-size:13px;color:'+MU+';margin-top:6px">No. <b style="color:'+INK+'">'+esc(t.vno)+'</b></div><div style="font-size:13px;color:'+MU+';margin-top:2px">Date <b style="color:'+INK+'">'+fmt(t.date)+'</b></div></div></div>'
  +'<div style="display:flex;align-items:center;gap:8px;margin:14px 34px 0"><span style="height:1px;flex:1;background:'+SF+'"></span><span style="width:6px;height:6px;background:'+SF+';transform:rotate(45deg)"></span><span style="height:1px;flex:1;background:'+SF+'"></span></div>'
  +'<div style="display:grid;grid-template-columns:1fr 1.1fr;gap:30px;padding:20px 34px 0;align-items:start"><div style="background:#F7F4EC;border-radius:14px;padding:22px 20px;text-align:center"><div style="font-size:11px;font-weight:700;letter-spacing:.16em;color:'+MU+'">'+(v.inn?'AMOUNT RECEIVED':'AMOUNT PAID')+'</div><div class="disp tn" style="font-size:44px;line-height:1.1;margin-top:6px;letter-spacing:-0.03em">'+INR(t.amount)+'</div><div style="font-size:12.5px;color:#55597A;margin-top:6px;line-height:1.45">'+words(t.amount)+'</div></div>'
  +'<div>'+row(v.inn?'Received from':'Paid to',esc(v.who))+(v.proj?row('Project',esc(v.proj)+(v.stage?' · '+esc(v.stage):'')):'')+row('For',esc(t.note||v.stage||'Payment'))+row('Mode of payment',esc(modeStr(t,'en')))+'</div></div>'
  +'<div style="display:flex;gap:60px;padding:0 34px;margin-top:auto">'+[v.inn?"Client's signature":"Receiver's signature",'Authorised signatory'].map(function(x){return '<div style="flex:1;min-width:0;border-top:1px solid '+INK+';padding-top:5px;text-align:center;font-size:11.5px;color:'+MU+'">'+x+'</div>'}).join('')+'</div>'
  +'<div style="text-align:center;font-size:10px;letter-spacing:.12em;color:#A3A6B6;padding:12px 0 12px;flex-shrink:0">'+esc(t.vno)+' · COMPUTER GENERATED</div>'
  +'<div style="height:6px;background:'+SF+';flex-shrink:0"></div></div></div></div>'}
export function printVoucher(id){
  var t=findTxn(id);if(!t)return;var pa=document.getElementById('printArea'),inn=t.kind==='in';
  pa.innerHTML=voucherPaper(t);
  document.getElementById('pgstyle').textContent='@page{size:'+(inn?'A4 portrait':'A5 landscape')+';margin:6mm}';
  var done=function(){pa.innerHTML='';window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);
  try{window.print()}catch(e){done();toast('Print is not available here. Download the PDF and print that.')}}
export var HI0=['शून्य','एक','दो','तीन','चार','पाँच','छह','सात','आठ','नौ','दस','ग्यारह','बारह','तेरह','चौदह','पंद्रह','सोलह','सत्रह','अठारह','उन्नीस','बीस','इक्कीस','बाईस','तेईस','चौबीस','पच्चीस','छब्बीस','सत्ताईस','अट्ठाईस','उनतीस','तीस','इकतीस','बत्तीस','तैंतीस','चौंतीस','पैंतीस','छत्तीस','सैंतीस','अड़तीस','उनतालीस','चालीस','इकतालीस','बयालीस','तैंतालीस','चौवालीस','पैंतालीस','छियालीस','सैंतालीस','अड़तालीस','उनचास','पचास','इक्यावन','बावन','तिरपन','चौवन','पचपन','छप्पन','सत्तावन','अट्ठावन','उनसठ','साठ','इकसठ','बासठ','तिरसठ','चौंसठ','पैंसठ','छियासठ','सड़सठ','अड़सठ','उनहत्तर','सत्तर','इकहत्तर','बहत्तर','तिहत्तर','चौहत्तर','पचहत्तर','छिहत्तर','सतहत्तर','अठहत्तर','उनासी','अस्सी','इक्यासी','बयासी','तिरासी','चौरासी','पचासी','छियासी','सत्तासी','अट्ठासी','नवासी','नब्बे','इक्यानवे','बानवे','तिरानवे','चौरानवे','पंचानवे','छियानवे','सत्तानवे','अट्ठानवे','निन्यानवे'];
export var GU0=['શૂન્ય','એક','બે','ત્રણ','ચાર','પાંચ','છ','સાત','આઠ','નવ','દસ','અગિયાર','બાર','તેર','ચૌદ','પંદર','સોળ','સત્તર','અઢાર','ઓગણીસ','વીસ','એકવીસ','બાવીસ','ત્રેવીસ','ચોવીસ','પચ્ચીસ','છવ્વીસ','સત્તાવીસ','અઠ્ઠાવીસ','ઓગણત્રીસ','ત્રીસ','એકત્રીસ','બત્રીસ','તેત્રીસ','ચોત્રીસ','પાંત્રીસ','છત્રીસ','સાડત્રીસ','આડત્રીસ','ઓગણચાલીસ','ચાલીસ','એકતાલીસ','બેતાલીસ','ત્રેતાલીસ','ચુમાલીસ','પિસ્તાલીસ','છેતાલીસ','સુડતાલીસ','અડતાલીસ','ઓગણપચાસ','પચાસ','એકાવન','બાવન','ત્રેપન','ચોપન','પંચાવન','છપ્પન','સત્તાવન','અઠ્ઠાવન','ઓગણસાઠ','સાઠ','એકસઠ','બાસઠ','ત્રેસઠ','ચોસઠ','પાંસઠ','છાસઠ','સડસઠ','અડસઠ','ઓગણોસિત્તેર','સિત્તેર','એકોતેર','બોતેર','તોતેર','ચુંમોતેર','પંચોતેર','છોતેર','સિત્યોતેર','ઇઠ્યોતેર','ઓગણએંસી','એંસી','એક્યાસી','બ્યાસી','ત્યાસી','ચોર્યાસી','પંચ્યાસી','છ્યાસી','સત્યાસી','અઠ્યાસી','નેવ્યાસી','નેવું','એકાણું','બાણું','ત્રાણું','ચોરાણું','પંચાણું','છન્નું','સત્તાણું','અઠ્ઠાણું','નવ્વાણું'];
export var TAG={en:['SHILP-VASTU TEMPLES · MURTI SCULPTURING','JAIN PARIKAR · JAIN PRATIMA · CNC ART'],hi:['शिल्प-वास्तु मंदिर · मूर्ति शिल्पकला','जैन परिकर · जैन प्रतिमा · सीएनसी आर्ट'],gu:['શિલ્પ-વાસ્તુ મંદિરો · મૂર્તિ શિલ્પકામ','જૈન પરિકર · જૈન પ્રતિમા · સીએનસી આર્ટ']};
/* letterhead image has no tagline text; it is written here in the document language */
export function hdrImgHtml(bw,lg,W,imgStyle){lg=TAG[lg]?lg:'en';var fam=lg==='en'?"'Noto Serif',Georgia,'Times New Roman',serif":LANG[lg].font,fs=(W*0.0135).toFixed(2),lh=(W*27/1500).toFixed(2);
  return '<div style="position:relative;flex-shrink:0"><img src="'+(bw?LH.b:LH.c)+'" alt="Brihad Temple Construction Co." style="'+imgStyle+'"><div style="position:absolute;right:4.8%;top:'+(62/285*100).toFixed(2)+'%;text-align:right;font-family:'+fam+';font-size:'+fs+'px;line-height:'+lh+'px;color:#1F2230;letter-spacing:'+(lg==='en'?'.06em':'0')+';white-space:nowrap">'+TAG[lg][0]+'<br>'+TAG[lg][1]+'</div></div>'}
export function hdrTagPdf(d,W,y0){d.setTextColor(31,34,48);d.setFont('times','normal');d.setFontSize(W*0.0378);var x=W*1428/1500;d.text(TAG.en[0],x,y0+W*82/1500,{align:'right'});d.text(TAG.en[1],x,y0+W*109/1500,{align:'right'})}
export var REFL={en:{Bank:'Ref. no.',Cheque:'Cheque no.'},hi:{Bank:'संदर्भ क्र.',Cheque:'चेक क्र.'},gu:{Bank:'સંદર્ભ ક્રમાંક',Cheque:'ચેક નંબર'}};
export function refSfx(t,lg){lg=REFL[lg]?lg:'en';var r=String(t.ref||'').trim();if(!r||(t.mode!=='Bank'&&t.mode!=='Cheque'))return '';return ' · '+REFL[lg][t.mode]+' '+r}
export function modeStr(t,lg){lg=REFL[lg]?lg:'en';var m=(LANG[lg]&&LANG[lg].mode&&LANG[lg].mode[t.mode])||t.mode;return m+refSfx(t,lg)}
export var LANG={
en:{name:'English',modeL:'Mode',forL:'Details',title:'RECEIPT',date:'DATE',ref:'REF. NO.',to:'To,',amt:'Amount received',sign:'For BRIHAD TEMPLE CONSTRUCTION CO.',auth:'Authorised Signatory',mode:{Cash:'Cash',UPI:'UPI',Bank:'Bank',Cheque:'Cheque'},mon:MON,font:"Georgia,'Times New Roman',serif"},
hi:{name:'हिन्दी',title:'रसीद',date:'दिनांक',ref:'संदर्भ क्र.',to:'प्रति,',amt:'प्राप्त राशि',sign:'कृते बृहद टेम्पल कंस्ट्रक्शन कं.',auth:'अधिकृत हस्ताक्षरकर्ता',modeL:'भुगतान का तरीका',forL:'विवरण',mode:{Cash:'नकद',UPI:'UPI',Bank:'बैंक',Cheque:'चेक'},mon:['जनवरी','फ़रवरी','मार्च','अप्रैल','मई','जून','जुलाई','अगस्त','सितंबर','अक्टूबर','नवंबर','दिसंबर'],font:"'Noto Sans Devanagari','Mangal',sans-serif",n:HI0,u:['सौ','हज़ार','लाख','करोड़'],rs:'रुपये',only:'मात्र'},
gu:{name:'ગુજરાતી',title:'પહોંચ',date:'તારીખ',ref:'સંદર્ભ ક્રમાંક',to:'પ્રતિ,',amt:'મળેલી રકમ',sign:'વતી બૃહદ ટેમ્પલ કન્સ્ટ્રક્શન કં.',auth:'અધિકૃત સહી',h:['','એકસો','બસો','ત્રણસો','ચારસો','પાંચસો','છસો','સાતસો','આઠસો','નવસો'],modeL:'ચુકવણીની રીત',forL:'વિગત',mode:{Cash:'રોકડ',UPI:'UPI',Bank:'બેંક',Cheque:'ચેક'},mon:['જાન્યુઆરી','ફેબ્રુઆરી','માર્ચ','એપ્રિલ','મે','જૂન','જુલાઈ','ઓગસ્ટ','સપ્ટેમ્બર','ઓક્ટોબર','નવેમ્બર','ડિસેમ્બર'],font:"'Noto Sans Gujarati','Shruti',sans-serif",n:GU0,u:['સો','હજાર','લાખ','કરોડ'],rs:'રૂપિયા',only:'પૂરા'}
};
LANG.hi.R={cont:'जारी',page:'पृष्ठ',title:'प्रोजेक्ट रिपोर्ट',client:'ग्राहक',trust:'ट्रस्ट',started:'शुरू',handover:'हस्तांतरण',rdate:'रिपोर्ट दिनांक',s1:'1. सारांश',deal:'कुल सौदा राशि',rec:'प्राप्त',spent:'अब तक खर्च',cash:'हाथ में नकद (प्राप्त − खर्च)',budget:'बचा बजट (सौदा − खर्च)',toRec:'ग्राहक से लेना बाकी',due:'सप्लायर और कारीगरों को देना बाकी',prog:'प्रगति',done:'{t} में से {d} चरण पूर्ण ({p}%)',s2:'2. चरण-वार ग्राहक भुगतान',stage:'चरण',target:'लक्षित तिथि',status:'स्थिति',c1:'पूर्ण',c2:'जारी',c3:'आगामी',pays:'ग्राहक देगा',got:'प्राप्त',bal:'बाकी',total:'कुल',s3:'3. प्राप्त भुगतान',date:'दिनांक',mode:'तरीका',from:'किससे प्राप्त',vch:'वाउचर',amt:'राशि',s4:'4. विभाग-वार खर्च',sect:'विभाग',paid:'चुकाया',share:'हिस्सा',s5:'5. किए गए भुगतान',to:'किसे दिया',s6:'6. लोग और बाकी राशि',name:'नाम',type:'प्रकार',billed:'बिल',balDue:'बाकी राशि',none1:'अभी कोई भुगतान प्राप्त नहीं हुआ।',none2:'अभी कोई खर्च नहीं।',none3:'अभी कोई भुगतान नहीं किया गया।',none4:'इस प्रोजेक्ट से कोई व्यक्ति जुड़ा नहीं है।',sec:{Stone:'पत्थर',Carving:'नक्काशी',Fitting:'फिटिंग',Transport:'परिवहन','Site visit':'साइट विज़िट',Other:'अन्य'},typ:['पत्थर सप्लायर','नक्काशी कारीगर','फिटिंग टीम','दैनिक मजदूरी (सेठ द्वारा)','परिवहन','अन्य']};
LANG.gu.R={cont:'ચાલુ',page:'પાનું',title:'પ્રોજેક્ટ રિપોર્ટ',client:'ગ્રાહક',trust:'ટ્રસ્ટ',started:'શરૂઆત',handover:'સોંપણી',rdate:'રિપોર્ટ તારીખ',s1:'1. સારાંશ',deal:'કુલ સોદાની રકમ',rec:'મળેલ',spent:'અત્યાર સુધીનો ખર્ચ',cash:'હાથ પરની રોકડ (મળેલ − ખર્ચ)',budget:'બાકી બજેટ (સોદો − ખર્ચ)',toRec:'ગ્રાહક પાસેથી લેવાના બાકી',due:'સપ્લાયર અને કારીગરોને ચૂકવવાના બાકી',prog:'પ્રગતિ',done:'{t} માંથી {d} તબક્કા પૂર્ણ ({p}%)',s2:'2. તબક્કાવાર ગ્રાહક ચુકવણી',stage:'તબક્કો',target:'લક્ષ્ય તારીખ',status:'સ્થિતિ',c1:'પૂર્ણ',c2:'ચાલુ',c3:'આવનાર',pays:'ગ્રાહક આપશે',got:'મળેલ',bal:'બાકી',total:'કુલ',s3:'3. મળેલી ચુકવણીઓ',date:'તારીખ',mode:'રીત',from:'કોની પાસેથી',vch:'વાઉચર',amt:'રકમ',s4:'4. વિભાગવાર ખર્ચ',sect:'વિભાગ',paid:'ચૂકવ્યા',share:'હિસ્સો',s5:'5. કરેલી ચુકવણીઓ',to:'કોને આપ્યા',s6:'6. વ્યક્તિઓ અને બાકી રકમ',name:'નામ',type:'પ્રકાર',billed:'બિલ',balDue:'બાકી રકમ',none1:'હજી કોઈ ચુકવણી મળી નથી.',none2:'હજી કોઈ ખર્ચ નથી.',none3:'હજી કોઈ ચુકવણી કરી નથી.',none4:'આ પ્રોજેક્ટ સાથે કોઈ વ્યક્તિ જોડાયેલ નથી.',sec:{Stone:'પથ્થર',Carving:'કોતરણી',Fitting:'ફિટિંગ',Transport:'પરિવહન','Site visit':'સાઇટ મુલાકાત',Other:'અન્ય'},typ:['પથ્થર સપ્લાયર','કોતરણી કારીગર','ફિટિંગ ટીમ','રોજમદાર (શેઠ મારફતે)','પરિવહન','અન્ય']};
export function curLang(){return LANG[DB.biz.lang]?DB.biz.lang:'en'}
export function wordsL(n,lg){if(lg==='en')return words(n);var L=LANG[lg],p=[],cr=Math.floor(n/10000000);n%=10000000;var lk=Math.floor(n/100000);n%=100000;var th=Math.floor(n/1000);n%=1000;var hu=Math.floor(n/100);n%=100;
 if(cr)p.push(L.n[cr]+' '+L.u[3]);if(lk)p.push(L.n[lk]+' '+L.u[2]);if(th)p.push(L.n[th]+' '+L.u[1]);if(hu)p.push(L.h?L.h[hu]:L.n[hu]+' '+L.u[0]);if(n)p.push(L.n[n]);
 return L.rs+' '+(p.join(' ')||L.n[0])+' '+L.only}
export function fmtL(iso,lg){if(!iso)return '';var q=iso.split('-');return (+q[2])+' '+LANG[lg].mon[+q[1]-1]+' '+q[0]}
export function shri(n,lg){n=String(n||'').trim();if(!n)return n;if(/^(shri|shree|shri\.|mr|mrs|ms|smt|dr|m\/s|श्री|શ્રી)\b/i.test(n)||/trust|co\.|company|pvt|ltd|mandal|sangh|samaj|foundation|committee|ट्रस्ट|ટ્રસ્ટ|મંડળ|मंडल/i.test(n))return n;return (lg==='en'?'Shri ':lg==='hi'?'श्री ':'શ્રી ')+n}
export function letterBody(t,lg,html){
  var v=voucherInfo(t),L=LANG[lg],b=function(s){return html?'<b>'+esc(s)+'</b>':s},a=INR(t.amount)+'/-',w=wordsL(t.amount,lg),today_=t.date===today(),d=fmtL(t.date,lg),forName=v.trust||v.proj,who=shri(v.who,lg);
  if(lg==='hi')return (today_?'आज ':'दिनांक '+b(d)+' को ')+(forName?b(forName)+' के निमित्त ':'')+'अंकों में रुपये '+b(a)+' (शब्दों में '+w+') '+b(who)+' के हस्ते प्राप्त हुए हैं।';
  if(lg==='gu')return (today_?'આજ રોજ ':'તા. '+b(d)+' ના રોજ ')+(forName?b(forName)+' ના પેટે ':'')+'અંકે રૂપિયા '+b(a)+' (અંકે '+w+') '+b(who)+' ના હસ્તે મળેલ છે.';
  return 'Received '+(today_?'today':'on '+b(d))+' a payment of '+b(a)+' ('+w+') from '+b(who)+(forName?', towards '+b(forName):'')+'.'}
export function letterDetail(t,lg,html){var v=voucherInfo(t),L=LANG[lg],e=function(s){return html?esc(s):s},m=L.mode[t.mode]||t.mode,parts=[L.modeL+': '+e(m+refSfx(t,lg))];if(t.note)parts.push(L.forL+': '+e(t.note));return parts.join('  ·  ')}
export function letterPlain(t){var lg=curLang(),L=LANG[lg],v=voucherInfo(t);return [DB.biz.name,L.title+' · '+t.vno,L.date+': '+fmtL(t.date,lg),'',letterBody(t,lg,false),letterDetail(t,lg,false),'',L.amt+': '+INR(t.amount)+'/-'].join('\n')}
export function letterPaper(t,lg){
  lg=lg||curLang();var v=voucherInfo(t),L=LANG[lg],bw=DB.biz.lhBW;
  return '<div class="vfit"><div class="vin" data-w="700" style="width:700px"><div class="paper" style="padding:0;overflow:hidden;border:1px solid #D8D6CE;border-radius:0;font-family:'+L.font+';min-height:990px;display:flex;flex-direction:column;color:#1F2230">'+hdrImgHtml(bw,lg,700,'width:100%;display:block')
  +'<div style="padding:0 6%;flex:1;display:flex;flex-direction:column"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:12px;letter-spacing:'+(lg==='en'?'.12em':'.02em')+';font-weight:700;margin-top:2px"><span>'+L.date+': <span style="border-bottom:1px solid #1F2230;padding:0 8px;letter-spacing:0">'+fmtL(t.date,lg)+'</span></span><span>'+L.ref+': <span style="border-bottom:1px solid #1F2230;padding:0 8px;letter-spacing:0">'+esc(t.vno)+'</span></span></div>'
  +'<div style="text-align:center;font-size:16px;letter-spacing:'+(lg==='en'?'.3em':'.12em')+';font-weight:700;margin:30px 0 22px;text-decoration:underline;text-underline-offset:6px">'+L.title+'</div>'
    +'<p style="font-size:15.5px;line-height:2;margin:6px 0 10px;text-align:justify">'+letterBody(t,lg,true)+'</p><div style="font-size:15px;color:#1F2230;line-height:1.8">'+letterDetail(t,lg,true)+'</div>'
  +'<div style="margin:18px 0 4px;display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid #E4E2DB;font-size:14px"><span style="color:#62668A">'+L.amt+'</span><b class="tn">'+INR(t.amount)+'/-</b></div>'
  +'<div style="margin-top:auto;padding:46px 0 34px;text-align:right;font-size:14px"><div style="height:60px"></div><div style="display:inline-block;border-top:1.5px solid #1F2230;min-width:230px;height:1px"></div></div></div>'
  +'<img src="'+LH.f+'" alt="" style="width:100%;display:block;margin-top:auto;flex-shrink:0"></div></div></div>'}
export function pdfLetterNative(t){
  var C=pdfLib();if(!C)return;var v=voucherInfo(t),D=derive(),p=D.byId[t.projId],bw=DB.biz.lhBW,d=new C({unit:'mm',format:'a4'}),L=14,R=196,y;
  try{d.addImage(bw?LH.b:LH.c,'PNG',0,4,210,210*285/1500);hdrTagPdf(d,210,4);d.addImage(LH.f,'PNG',0,297-210*185/1500-2,210,210*185/1500)}catch(e){}
  y=52;d.setTextColor(31,34,48);d.setFont('times','bold');d.setFontSize(9);d.text('DATE:',L,y);d.setFont('times','normal');d.setFontSize(10);d.text(fmt(t.date),L+13,y);d.line(L+12,y+1.2,L+48,y+1.2);
  d.setFont('times','bold');d.setFontSize(9);d.text('REF. NO.:',82,y);d.setFont('times','normal');d.setFontSize(10);d.text(t.vno,82+19,y);d.line(82+18,y+1.2,82+50,y+1.2);
  y=72;d.setFont('times','bold');d.setFontSize(14);d.text('R E C E I P T',105,y,{align:'center'});d.line(88,y+1.5,122,y+1.5);
  y=92;d.setFont('times','normal');
  var body=letterBody(t,'en',false).replace(/₹/g,'Rs. ');
  var ls=d.splitTextToSize(body,R-L);d.setFontSize(11.5);d.text(ls,L,y,{lineHeightFactor:1.7});y+=ls.length*7.2+8;
  {[['Amount received',t.amount]].forEach(function(x){d.setFontSize(10.5);d.setFont('times','normal');d.text(x[0],L,y);d.setFont('times','bold');d.text(rs(x[1]),R,y,{align:'right'});d.setDrawColor(210,208,200);d.setLineWidth(0.2);d.line(L,y+2,R,y+2);y+=8})}
  y=Math.max(y+22,248);d.setDrawColor(31,34,48);d.setLineWidth(0.4);d.line(R-62,y,R,y);
  finishPdf(d,t.vno+'.pdf','Saved '+t.vno+'.pdf')}
export function voucherText(t){if(t.kind==='in')return letterPlain(t);var v=voucherInfo(t),b=DB.biz;return [b.name,(v.inn?'RECEIPT VOUCHER ':'PAYMENT VOUCHER ')+t.vno,'Date: '+fmt(t.date),(v.inn?'Received from: ':'Paid to: ')+v.who,'Project: '+v.proj+(v.stage?' ('+v.stage+')':''),'Amount: '+INR(t.amount),words(t.amount),'Mode: '+modeStr(t,'en')].concat(t.note?['Note: '+t.note]:[]).concat(b.phone?['Phone: '+b.phone]:[]).join('\n')}
export function pdfLib(){var J=window.jspdf;if(!J||!J.jsPDF){toast('PDF tool could not load. Check your internet and try again.');return null}return J.jsPDF}
export var PDFMODE='save';
export function finishPdf(d,name,msg){
  var mode=PDFMODE;PDFMODE='save';
  if(mode!=='share'){try{d.save(name);toast(msg||('Saved '+name))}catch(e){toast('Could not save the PDF on this device.')}return}
  var blob;try{blob=d.output('blob')}catch(e){toast('Could not make the PDF.');return}
  var cap=window.Capacitor,pl=cap&&cap.Plugins;
  if(cap&&cap.isNativePlatform&&cap.isNativePlatform()&&pl&&pl.Filesystem&&pl.Share){
    var rd=new FileReader();rd.onload=function(){var b64=String(rd.result).split(',')[1];
      pl.Filesystem.writeFile({path:name,data:b64,directory:'CACHE'}).then(function(r){return pl.Share.share({title:name,dialogTitle:'Share PDF',files:[r.uri]})}).catch(function(e){if(!(e&&/cancel/i.test(String(e.message||e))))toast('Could not share the PDF.')})};
    rd.readAsDataURL(blob);return}
  var file=null;try{file=new File([blob],name,{type:'application/pdf'})}catch(e){}
  if(file&&navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:name}).catch(function(e){if(!e||e.name!=='AbortError')toast('Could not share the PDF.')});return}
  try{d.save(name);toast('This device cannot share files directly. The PDF was downloaded, send it from your files.')}catch(e){toast('Could not share the PDF.')}}
export function rs(n){return 'Rs. '+Number(n).toLocaleString('en-IN')}
export function pdfLetter(t){
  var C=pdfLib();if(!C)return;var lg=curLang();
  if(!window.html2canvas){if(lg==='en'){pdfLetterNative(t);return}toast('Hindi and Gujarati PDF needs internet. Connect and try again.');return}
  var host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0;width:700px;background:#fff';host.innerHTML=letterPaper(t,lg);document.body.appendChild(host);
  var done=function(){if(host.parentNode)host.parentNode.removeChild(host)};
  var go=function(){window.html2canvas(host.querySelector('.paper'),{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false}).then(function(cv){var d=new C({unit:'mm',format:'a4'});var h=Math.min(297,210*cv.height/cv.width);d.addImage(cv.toDataURL('image/jpeg',0.95),'JPEG',0,0,210,h);done();finishPdf(d,t.vno+'.pdf','Saved '+t.vno+'.pdf')}).catch(function(){done();toast('Could not make the PDF. Try again.')})};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(go);else go()}
export function ganeshImg(){var cv=document.createElement('canvas'),px=56,txt='॥ श्री गणेशाय नमः ॥',ctx=cv.getContext('2d');ctx.font='700 '+px+'px "Noto Sans Devanagari","Mangal",sans-serif';var w=Math.ceil(ctx.measureText(txt).width)+8;cv.width=w;cv.height=Math.round(px*1.5);ctx=cv.getContext('2d');ctx.font='700 '+px+'px "Noto Sans Devanagari","Mangal",sans-serif';ctx.fillStyle='#55597A';ctx.textBaseline='middle';ctx.fillText(txt,4,cv.height/2);return {uri:cv.toDataURL('image/png'),r:cv.width/cv.height}}
export function pdfVoucher(t){
  if(t.kind==='in'){pdfLetter(t);return}
  var run=function(){pdfVoucherRun(t)};
  if(document.fonts&&document.fonts.load)document.fonts.load('700 28px "Noto Sans Devanagari"','श्री गणेशाय नमः').then(run,run);else run()}
export function pdfVoucherRun(t){
  var C=pdfLib();if(!C)return;var v=voucherInfo(t),b=DB.biz,d=new C({orientation:'landscape',unit:'mm',format:'a5'}),W=210,H=148,X0=14,X1=W-14,INK=[31,34,48],MU=[122,126,146],SF=[224,138,46];
  d.setDrawColor(218,215,204);d.setLineWidth(0.3);d.rect(5,5,W-10,H-10);
  d.setFillColor(SF[0],SF[1],SF[2]);d.rect(5,5,W-10,2.2,'F');d.rect(5,H-7.2,W-10,2.2,'F');
  try{var gi=ganeshImg(),gh=4.2;d.addImage(gi.uri,'PNG',W/2-gh*gi.r/2,8.2,gh*gi.r,gh)}catch(e){}
  var lgh=16,lgw=lgh*LH.r;try{d.addImage(LH.l,'PNG',X0,13,lgw,lgh)}catch(e){}var tx=X0+lgw+5;
  d.setTextColor(INK[0],INK[1],INK[2]);d.setFont('helvetica','bold');d.setFontSize(10.5);d.text(b.name.toUpperCase(),tx,19,{charSpace:0.5});
  d.setFont('helvetica','normal');d.setFontSize(7.5);d.setTextColor(MU[0],MU[1],MU[2]);var yy=24.5;[b.phone,b.addr].filter(Boolean).forEach(function(s){d.text(s,tx,yy);yy+=4});
  d.setFont('helvetica','bold');d.setFontSize(8.5);d.setTextColor(INK[0],INK[1],INK[2]);d.text(v.inn?'RECEIPT VOUCHER':'PAYMENT VOUCHER',X1,18,{align:'right'});
  d.setFont('helvetica','normal');d.setFontSize(8.5);d.setTextColor(MU[0],MU[1],MU[2]);d.text('No.',X1-38,24);d.text('Date',X1-38,29.5);d.setFont('helvetica','bold');d.setTextColor(INK[0],INK[1],INK[2]);d.text(t.vno,X1,24,{align:'right'});d.text(fmt(t.date),X1,29.5,{align:'right'});
  d.setDrawColor(SF[0],SF[1],SF[2]);d.setLineWidth(0.3);d.line(X0,36,W/2-3,36);d.line(W/2+3,36,X1,36);d.setFillColor(SF[0],SF[1],SF[2]);d.rect(W/2-0.9,35.1,1.8,1.8,'F');
  var ws=d.splitTextToSize(words(t.amount),70);d.setFillColor(247,244,236);d.roundedRect(X0,44,78,46,3,3,'F');
  d.setFont('helvetica','bold');d.setFontSize(7);d.setTextColor(MU[0],MU[1],MU[2]);d.text(v.inn?'AMOUNT RECEIVED':'AMOUNT PAID',X0+39,54,{align:'center',charSpace:0.8});
  d.setFontSize(20);d.setTextColor(INK[0],INK[1],INK[2]);d.text('Rs. '+Number(t.amount).toLocaleString('en-IN'),X0+39,67,{align:'center'});
  d.setFont('helvetica','normal');d.setFontSize(8.5);d.setTextColor(85,89,122);d.text(ws,X0+39,75,{align:'center'});
  var rx=102,ry=48;
  function row(l,val){d.setFont('helvetica','normal');d.setFontSize(8);d.setTextColor(MU[0],MU[1],MU[2]);d.text(l,rx,ry);d.setFont('helvetica','bold');d.setFontSize(10);d.setTextColor(INK[0],INK[1],INK[2]);var ls=d.splitTextToSize(String(val),X1-rx-34);d.text(ls,X1,ry,{align:'right'});var h=Math.max(1,ls.length)*4.6;d.setDrawColor(233,230,220);d.setLineWidth(0.25);d.line(rx,ry+h-1.2,X1,ry+h-1.2);ry+=h+6}
  row(v.inn?'Received from':'Paid to',v.who);if(v.proj)row('Project',v.proj+(v.stage?' - '+v.stage:''));row('For',t.note||v.stage||'Payment');row('Mode of payment',modeStr(t,'en'));
  var sy=122,names=[v.inn?"Client's signature":"Receiver's signature",'Authorised signatory'];d.setDrawColor(INK[0],INK[1],INK[2]);d.setLineWidth(0.3);[X0,W/2+10].forEach(function(x,i){d.line(x,sy,x+70,sy);d.setFont('helvetica','normal');d.setFontSize(7.5);d.setTextColor(MU[0],MU[1],MU[2]);d.text(names[i],x+35,sy+4.5,{align:'center'})});
  d.setFontSize(6);d.setTextColor(163,166,182);d.text(t.vno+'  |  COMPUTER GENERATED',W/2,H-10.5,{align:'center',charSpace:0.4});
  finishPdf(d,t.vno+'.pdf','Saved '+t.vno+'.pdf')}
export function money(n){n=Number(n||0);return (n<0?'-':'')+'Rs. '+Math.abs(n).toLocaleString('en-IN')}
export function pdfReportNative(pid){
  var C=pdfLib();if(!C)return;var D=derive(),p=D.byId[pid];if(!p)return;
  var d=new C({unit:'mm',format:'a4'});
  if(!d.autoTable){toast('Report tool could not load. Check your internet and try again.');return}
  var bw=DB.biz.lhBW,W=210,M=14,INK=[31,34,48],MU=[110,114,138],AC=[74,78,140];
  try{d.addImage(bw?LH.b:LH.c,'PNG',0,4,W,W*285/1500);hdrTagPdf(d,W,4)}catch(e){}
  var y=4+W*285/1500+6;
  d.setTextColor(INK[0],INK[1],INK[2]);d.setFont('helvetica','bold');d.setFontSize(16);d.text('PROJECT REPORT',W/2,y,{align:'center',charSpace:1.2});
  d.setDrawColor(AC[0],AC[1],AC[2]);d.setLineWidth(0.6);d.line(W/2-22,y+2,W/2+22,y+2);
  y+=11;d.setFontSize(13);d.text(p.name,M,y);
  d.setFont('helvetica','normal');d.setFontSize(9);d.setTextColor(MU[0],MU[1],MU[2]);
  var meta=[];if(p.client)meta.push('Client: '+p.client);if(p.trust)meta.push('Trust: '+p.trust);if(p.start)meta.push('Started: '+fmt(p.start));if(p.handover)meta.push('Handover: '+fmt(p.handover));
  y+=5.5;d.text(d.splitTextToSize(meta.join('   |   '),W-2*M),M,y);y+=6;
  d.text('Report date: '+fmt(today()),M,y);y+=4;
  var done=p.doneCount+' of '+p.stages.length+' stages completed ('+p.progress+'%)';
  var tx=DB.txns.filter(function(t){return t.projId===p.id});
  tx.sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0});
  var pct=p.value?Math.round(p.received/p.value*100):0;
  function sec(title){y=d.lastAutoTable?d.lastAutoTable.finalY+9:y+4;if(y>232){d.addPage();y=18}d.setFont('helvetica','bold');d.setFontSize(11);d.setTextColor(AC[0],AC[1],AC[2]);d.text(title,M,y);d.setDrawColor(220,218,210);d.setLineWidth(0.3);d.line(M,y+1.8,W-M,y+1.8);y+=4}
  var base={margin:{left:M,right:M},styles:{font:'helvetica',fontSize:8.5,textColor:INK,cellPadding:2.2,lineColor:[230,228,220],lineWidth:0.1},headStyles:{fillColor:AC,textColor:255,fontStyle:'bold'},alternateRowStyles:{fillColor:[248,246,240]},footStyles:{fillColor:[238,236,228],textColor:INK,fontStyle:'bold'},showFoot:'lastPage',theme:'grid'};
  function table(o){d.autoTable(Object.assign({},base,o,{startY:y}));}
  d.lastAutoTable=null;
  // 1 summary
  sec('1. Summary');
  table({body:[['Deal value',money(p.value),'Received ('+pct+'%)',money(p.received)],['Spent so far',money(p.spent),'Cash in hand (received - spent)',money(p.received-p.spent)],['Budget left (value - spent)',money(p.value-p.spent),'Still to receive from client',money(Math.max(0,p.value-p.received))],['Due to suppliers and workers',money(p.due),'Progress',done]],styles:Object.assign({},base.styles,{fontSize:9}),columnStyles:{0:{fontStyle:'bold',fillColor:[244,242,236]},1:{halign:'right'},2:{fontStyle:'bold',fillColor:[244,242,236]},3:{halign:'right'}},alternateRowStyles:{}});
  // 2 stages
  sec('2. Stage-wise client payments');
  var stRows=p.stages.map(function(s,i){var rec=p.stageRec[s.id]||0;return [String(i+1),s.name,s.date?fmt(s.date):'-',s.done?'Completed':(i===p.curIdx?'In progress':'Upcoming'),money(s.amount),money(rec),money(Math.max(0,s.amount-rec))]});
  var tA=0,tR=0;p.stages.forEach(function(s){tA+=s.amount;tR+=(p.stageRec[s.id]||0)});
  table({head:[['#','Stage','Target date','Status','Client pays','Received','Balance']],body:stRows,foot:[['','Total','','',money(tA),money(tR),money(Math.max(0,tA-tR))]],columnStyles:{0:{cellWidth:8},4:{halign:'right'},5:{halign:'right'},6:{halign:'right'}},didParseCell:function(h){if(h.section!=='body'&&h.column.index>=4)h.cell.styles.halign='right'}});
  // 3 received
  sec('3. Payments received');
  var inn=tx.filter(function(t){return t.kind==='in'}),tIn=0;
  table({head:[['Date','Stage','Mode','Received from','Voucher','Amount']],body:inn.length?inn.map(function(t){tIn+=t.amount;return [fmt(t.date),stageName(p,t.stageId)||'-',modeStr(t,'en'),t.who,t.vno,money(t.amount)]}):[['','No payments received yet.','','','','']],foot:inn.length?[['','','','','Total',money(tIn)]]:undefined,columnStyles:{5:{halign:'right'}},didParseCell:function(h){if(h.section!=='body'&&h.column.index===5)h.cell.styles.halign='right'}});
  // 4 expenses by section
  sec('4. Expenses by section');
  var secRows=SECTIONS.filter(function(s){return p.sec[s]>0}).map(function(s){return [s,money(p.sec[s]),(p.spent?Math.round(p.sec[s]/p.spent*100):0)+'%']});
  table({head:[['Section','Paid','Share']],body:secRows.length?secRows:[['No expenses yet.','','']],foot:secRows.length?[['Total',money(p.spent),'100%']]:undefined,columnStyles:{1:{halign:'right'},2:{halign:'right',cellWidth:24}},didParseCell:function(h){if(h.section!=='body'&&h.column.index>=1)h.cell.styles.halign='right'}});
  // 5 payments made
  sec('5. Payments made');
  var out=tx.filter(function(t){return t.kind==='out'}),tOut=0;
  table({head:[['Date','Paid to','Section','Mode','Voucher','Amount']],body:out.length?out.map(function(t){tOut+=t.amount;return [fmt(t.date),t.who,t.section,modeStr(t,'en'),t.vno,money(t.amount)]}):[['','No payments made yet.','','','','']],foot:out.length?[['','','','','Total',money(tOut)]]:undefined,columnStyles:{5:{halign:'right'}},didParseCell:function(h){if(h.section!=='body'&&h.column.index===5)h.cell.styles.halign='right'}});
  // 6 people
  sec('6. People and what is still due');
  var pp={};tx.forEach(function(t){if(!t.partyId)return;var o=pp[t.partyId]=pp[t.partyId]||{b:0,p:0};if(t.kind==='bill')o.b+=t.amount;else if(t.kind==='out')o.p+=t.amount});
  var pr=Object.keys(pp).map(function(k){var q=D.pById[k]||{name:'-',type:''};return [q.name,q.type,money(pp[k].b),money(pp[k].p),money(pp[k].b-pp[k].p)]}),tb=0,tp=0;Object.keys(pp).forEach(function(k){tb+=pp[k].b;tp+=pp[k].p});
  table({head:[['Name','Type','Billed','Paid','Balance due']],body:pr.length?pr:[['No people linked to this project.','','','','']],foot:pr.length?[['Total','',money(tb),money(tp),money(tb-tp)]]:undefined,columnStyles:{2:{halign:'right'},3:{halign:'right'},4:{halign:'right'}},didParseCell:function(h){if(h.section!=='body'&&h.column.index>=2)h.cell.styles.halign='right'}});
  // footer
  var n=d.getNumberOfPages();for(var i=1;i<=n;i++){d.setPage(i);d.setFont('helvetica','normal');d.setFontSize(7.5);d.setTextColor(MU[0],MU[1],MU[2]);d.text(DB.biz.name+'  |  '+p.name+'  |  Report '+fmt(today()),M,289);d.text('Page '+i+' of '+n,W-M,289,{align:'right'})}
  finishPdf(d,'Report-'+p.name.replace(/[^a-z0-9]+/gi,'-')+'.pdf','Report saved')}
export function pdfReport(pid){
  var lg=curLang();if(lg==='en'){pdfReportNative(pid);return}
  var C=pdfLib();if(!C)return;
  if(!window.html2canvas){PDFMODE='save';toast('Hindi and Gujarati report needs internet. Connect and try again.');return}
  var D=derive(),p=D.byId[pid];if(!p){PDFMODE='save';return}
  var L=LANG[lg],R=L.R,bw=DB.biz.lhBW,PW=794,PH=1123,LIM=PH-62;
  var sn=function(s){return R.sec[s]||s},tn=function(t){var i=TYPES.indexOf(t);return i>=0?R.typ[i]:t},md=function(m){return L.mode[m]||m};
  var tx=DB.txns.filter(function(t){return t.projId===p.id}).sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0});
  var host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0;width:'+PW+'px;font-family:'+L.font+';color:#1F2230';
  host.innerHTML='<style>.rp{width:'+PW+'px;height:'+PH+'px;position:relative;background:#fff;overflow:hidden;font-size:12px;line-height:1.4}.rp h3{margin:0 0 6px;font-size:14px;color:#4A4E8C;border-bottom:1px solid #DCD9CE;padding-bottom:4px}.rp table{width:100%;border-collapse:collapse}.rp th{background:#4A4E8C;color:#fff;text-align:left;padding:6px 8px;font-size:11px}.rp td{padding:6px 8px;border:1px solid #E6E4DC;font-size:11.5px;vertical-align:top}.rp tbody tr:nth-child(even) td{background:#F8F6F0}.rp tr.ft td{background:#EEECE4!important;font-weight:700}.rp .r{text-align:right}.rp td.k{background:#F4F2EC!important;font-weight:700}.rp .sec{margin-bottom:16px}.rp .foot{position:absolute;left:40px;right:40px;bottom:18px;display:flex;justify-content:space-between;font-size:10px;color:#6E728A}</style>';
  document.body.appendChild(host);
  var pages=[];
  function newPage(first){var pg=document.createElement('div');pg.className='rp';pg.innerHTML=(first?hdrImgHtml(bw,lg,PW,'width:100%;height:'+Math.round(PW*285/1500)+'px;display:block'):'')+'<div class="cnt" style="padding:'+(first?'6px':'34px')+' 40px 0"></div><div class="foot"></div>';host.appendChild(pg);pages.push(pg);return pg}
  function cur(){return pages[pages.length-1]}
  function over(sec,pg){return sec.getBoundingClientRect().bottom-pg.getBoundingClientRect().top>LIM}
  function mkRow(def,i){var r=def.rows[i],tr=document.createElement('tr');if(r.foot)tr.className='ft';var cells=r.foot?r.c:r;tr.innerHTML=cells.map(function(c,j){return '<td class="'+((def.al&&def.al[j]==='r')?'r':'')+((def.kv&&(j===0||j===2))?' k':'')+'">'+c+'</td>'}).join('');return tr}
  function addSection(def){
    var i=0,cont=false;
    for(var g=0;g<60;g++){
      var pg=cur(),cnt=pg.querySelector('.cnt'),sec=document.createElement('div');sec.className='sec';
      sec.innerHTML='<h3>'+def.title+(cont?' ('+R.cont+')':'')+'</h3><table>'+(def.cols?'<thead><tr>'+def.cols.map(function(c,j){return '<th class="'+((def.al&&def.al[j]==='r')?'r':'')+'">'+c+'</th>'}).join('')+'</tr></thead>':'')+'<tbody></tbody></table>';
      cnt.appendChild(sec);var tb=sec.querySelector('tbody'),fit=0;
      while(i<def.rows.length){var tr=mkRow(def,i);tb.appendChild(tr);if(over(sec,pg)){tb.removeChild(tr);break}i++;fit++}
      if(i>=def.rows.length)return;
      if(def.rows[i]&&def.rows[i].foot&&fit>1){tb.removeChild(tb.lastChild);i--;fit--}
      if(fit===0){if(cnt.children.length>1){cnt.removeChild(sec);newPage(false);continue}tb.appendChild(mkRow(def,i));i++;if(i>=def.rows.length)return}
      cont=true;newPage(false)}}
  var pc=p.value?Math.round(p.received/p.value*100):0,meta=[];
  if(p.client)meta.push(R.client+': '+esc(p.client));if(p.trust)meta.push(R.trust+': '+esc(p.trust));if(p.start)meta.push(R.started+': '+fmtL(p.start,lg));if(p.handover)meta.push(R.handover+': '+fmtL(p.handover,lg));
  var go=function(){
    var first=newPage(true);
    first.querySelector('.cnt').innerHTML='<div style="text-align:center;margin:6px 0 14px"><div style="font-size:20px;font-weight:700;letter-spacing:.06em;display:inline-block;border-bottom:2px solid #4A4E8C;padding-bottom:3px">'+R.title+'</div></div><div style="font-size:18px;font-weight:700">'+esc(p.name)+'</div><div style="color:#6E728A;margin:4px 0 14px;font-size:11.5px;line-height:1.6">'+meta.join(' &nbsp;|&nbsp; ')+'<br>'+R.rdate+': '+fmtL(today(),lg)+'</div>';
    addSection({title:R.s1,kv:true,al:['','r','','r'],rows:[[R.deal,INR(p.value),R.rec+' ('+pc+'%)',INR(p.received)],[R.spent,INR(p.spent),R.cash,(p.received-p.spent<0?'−':'')+INR(Math.abs(p.received-p.spent))],[R.budget,(p.value-p.spent<0?'−':'')+INR(Math.abs(p.value-p.spent)),R.toRec,INR(Math.max(0,p.value-p.received))],[R.due,INR(p.due),R.prog,R.done.replace('{d}',p.doneCount).replace('{t}',p.stages.length).replace('{p}',p.progress)]]});
    var tA=0,tR=0;p.stages.forEach(function(s){tA+=s.amount;tR+=(p.stageRec[s.id]||0)});
    var sr=p.stages.map(function(s,i){var rc=p.stageRec[s.id]||0;return [String(i+1),esc(s.name),s.date?fmtL(s.date,lg):'-',s.done?R.c1:(i===p.curIdx?R.c2:R.c3),INR(s.amount),INR(rc),INR(Math.max(0,s.amount-rc))]});
    sr.push({foot:1,c:['',R.total,'','',INR(tA),INR(tR),INR(Math.max(0,tA-tR))]});
    addSection({title:R.s2,cols:['#',R.stage,R.target,R.status,R.pays,R.got,R.bal],al:['','','','','r','r','r'],rows:sr});
    var inn=tx.filter(function(t){return t.kind==='in'}),tIn=0,ir=inn.map(function(t){tIn+=t.amount;return [fmtL(t.date,lg),esc(stageName(p,t.stageId)||'-'),esc(md(t.mode)+refSfx(t,lg)),esc(t.who),esc(t.vno),INR(t.amount)]});
    if(!ir.length)ir=[['',R.none1,'','','','']];else ir.push({foot:1,c:['','','','',R.total,INR(tIn)]});
    addSection({title:R.s3,cols:[R.date,R.stage,R.mode,R.from,R.vch,R.amt],al:['','','','','','r'],rows:ir});
    var sr2=SECTIONS.filter(function(s){return p.sec[s]>0}).map(function(s){return [sn(s),INR(p.sec[s]),(p.spent?Math.round(p.sec[s]/p.spent*100):0)+'%']});
    if(!sr2.length)sr2=[[R.none2,'','']];else sr2.push({foot:1,c:[R.total,INR(p.spent),'100%']});
    addSection({title:R.s4,cols:[R.sect,R.paid,R.share],al:['','r','r'],rows:sr2});
    var out=tx.filter(function(t){return t.kind==='out'}),tO=0,or=out.map(function(t){tO+=t.amount;return [fmtL(t.date,lg),esc(t.who),sn(t.section),esc(md(t.mode)+refSfx(t,lg)),esc(t.vno),INR(t.amount)]});
    if(!or.length)or=[['',R.none3,'','','','']];else or.push({foot:1,c:['','','','',R.total,INR(tO)]});
    addSection({title:R.s5,cols:[R.date,R.to,R.sect,R.mode,R.vch,R.amt],al:['','','','','','r'],rows:or});
    var pp={};tx.forEach(function(t){if(!t.partyId)return;var o=pp[t.partyId]=pp[t.partyId]||{b:0,p:0};if(t.kind==='bill')o.b+=t.amount;else if(t.kind==='out')o.p+=t.amount});
    var tb=0,tp=0,pr=Object.keys(pp).map(function(k){var q=D.pById[k]||{name:'-',type:''};tb+=pp[k].b;tp+=pp[k].p;return [esc(q.name),tn(q.type),INR(pp[k].b),INR(pp[k].p),INR(pp[k].b-pp[k].p)]});
    if(!pr.length)pr=[[R.none4,'','','','']];else pr.push({foot:1,c:[R.total,'',INR(tb),INR(tp),INR(tb-tp)]});
    addSection({title:R.s6,cols:[R.name,R.type,R.billed,R.paid,R.balDue],al:['','','r','r','r'],rows:pr});
    var n=pages.length;pages.forEach(function(pg,i){pg.querySelector('.foot').innerHTML='<span>'+esc(DB.biz.name)+' &nbsp;|&nbsp; '+esc(p.name)+' &nbsp;|&nbsp; '+fmtL(today(),lg)+'</span><span>'+R.page+' '+(i+1)+' / '+n+'</span>'});
    var d=new C({unit:'mm',format:'a4'}),idx=0;
    var fail=function(){if(host.parentNode)host.parentNode.removeChild(host);PDFMODE='save';toast('Could not make the report. Try again.')};
    (function next(){
      if(idx>=pages.length){if(host.parentNode)host.parentNode.removeChild(host);finishPdf(d,'Report-'+p.name.replace(/[^a-z0-9]+/gi,'-')+'-'+lg+'.pdf','Report saved');return}
      window.html2canvas(pages[idx],{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false}).then(function(cv){if(idx>0)d.addPage();d.addImage(cv.toDataURL('image/jpeg',0.92),'JPEG',0,0,210,297);idx++;next()}).catch(fail)})()};
  var fam=lg==='hi'?'Noto Sans Devanagari':'Noto Sans Gujarati',smp=lg==='hi'?'अ':'અ';
  if(document.fonts&&document.fonts.load)Promise.all([document.fonts.load('400 12px "'+fam+'"',smp),document.fonts.load('700 12px "'+fam+'"',smp)]).then(function(){return document.fonts.ready}).then(go,go);else go()}
export function stmtLines(x){var D=derive();return x.lines.map(function(t,i){return {n:i,t:t}}).sort(function(a,b){return a.t.date===b.t.date?(a.n-b.n):(a.t.date<b.t.date?-1:1)}).map(function(o){var t=o.t,p=D.byId[t.projId];return {date:fmt(t.date),desc:(t.kind==='bill'?'Bill':'Paid ('+modeStr(t,'en')+')')+(t.note?' - '+t.note:'')+(p?' ['+p.name+']':''),bill:t.kind==='bill'?t.amount:0,paid:t.kind==='out'?t.amount:0}})}
export function pdfStatement(x){
  var C=pdfLib();if(!C)return;var d=new C({unit:'mm',format:'a4'}),b=DB.biz,y=34,L=stmtLines(x),bal=0;try{d.addImage(LH.l,'PNG',14,8,16*LH.r,16)}catch(e){}
  d.setFont('helvetica','bold');d.setFontSize(15);d.text(b.name,14,y);y+=6;d.setFont('helvetica','normal');d.setFontSize(9);if(b.phone||b.addr){d.text([b.addr,b.phone?'Phone: '+b.phone:''].filter(Boolean).join('  |  '),14,y);y+=6}
  d.setFont('helvetica','bold');d.setFontSize(12);d.text('Statement: '+x.name+' ('+x.type+')',14,y);y+=6;d.setFont('helvetica','normal');d.setFontSize(9);d.text('As on '+fmt(today()),14,y);y+=8;
  function head(){d.setFont('helvetica','bold');d.text('Date',14,y);d.text('Details',40,y);d.text('Billed',140,y,{align:'right'});d.text('Paid',166,y,{align:'right'});d.text('Balance',196,y,{align:'right'});y+=2;d.line(14,y,196,y);y+=5;d.setFont('helvetica','normal')}
  head();L.forEach(function(r){bal+=r.bill-r.paid;var lines=d.splitTextToSize(r.desc,92);if(y+lines.length*4.5>280){d.addPage();y=18;head()}d.text(r.date,14,y);d.text(lines,40,y);if(r.bill)d.text(rs(r.bill),140,y,{align:'right'});if(r.paid)d.text(rs(r.paid),166,y,{align:'right'});d.text(rs(bal),196,y,{align:'right'});y+=lines.length*4.5+1.5});
  y+=3;d.line(14,y,196,y);y+=6;d.setFont('helvetica','bold');d.text('Total billed '+rs(x.bills)+'   Paid '+rs(x.paid)+'   Balance '+rs(x.bills-x.paid),14,y);
  finishPdf(d,'Statement-'+x.name.replace(/[^a-z0-9]+/gi,'-')+'.pdf','Statement saved')}
export function stmtText(x){var L=stmtLines(x),bal=0,s=[DB.biz.name,'Statement: '+x.name+' ('+x.type+')','As on '+fmt(today()),''];L.forEach(function(r){bal+=r.bill-r.paid;s.push(r.date+' | '+r.desc+' | '+(r.bill?'+'+INR(r.bill):'-'+INR(r.paid))+' | Balance '+INR(bal))});s.push('','Billed '+INR(x.bills)+' · Paid '+INR(x.paid)+' · Balance '+INR(x.bills-x.paid));return s.join('\n')}
export function shareText(text,title){
  if(navigator.share){navigator.share({title:title,text:text}).catch(function(){});return}
  try{navigator.clipboard.writeText(text).then(function(){toast('Copied. Paste it into WhatsApp or any app.')},function(){fallbackCopy(text)})}catch(e){fallbackCopy(text)}}
/* ---------- proposals (quotations) ---------- */
export var STONES={
gu:['ધ્રાંગધ્રા સેન્ડસ્ટોન','અંબાજી સેકેન્ડ-વાઇટ માર્બલ','મકરણા માર્બલ સેકેન્ડ-વાઇટ'],
hi:['ध्रांगध्रा सैंडस्टोन','अंबाजी सेकंड-व्हाइट मार्बल','मकराना सेकंड-व्हाइट मार्बल'],
en:['Dhrangadhra Sandstone','Ambaji Second-White Marble','Makrana Second-White Marble']};
export var NOTES_T={
gu:['મંદિર ના આ ભાવ માં GST નો સમાવેશ થતો નથી GST અલગ થી આપવાનો રહેશે.',
'મંદિર ના આ ભાવ માં 3Dફોટોસ અને વૉકથરૂં વિડીયો નો સમાવેશ થતો નથી.',
'મંદિર ના આ ભાવ માં માલ, ઘડતર, ફીટીંગ, ટ્રાન્સપોર્ટ, પાલખ, ક્રેન અને સાદું ગ્રાઈન્ડર મશીન પોલિશ નો સમાવેશ થાય છે.',
'તમામ કારીગરો ની જવાબદારી અમારી રહશે (એક્સિડન્ટ ની).',
'પથ્થર માં કલર વેરીએશન રહશે.',
'આ કામ દરમિયાન મંદિર માં વપરાતા ફીટીંગ મટિરિયલ જેમ કે રેતી, સિમેન્ટ, ઈંટ, કાંકરી, એરેલ્ડેટ (સોલિયુસન), વોટર પ્રૂફઈનગ માટેરિલ તથા મંદિર કવર કરવા માટે નું મટિરિયલ સંસ્થા શ્રી એ આપવાનું રહશે.',
'સાઇટ સુધી પાવર, પીવા તથા વાપરવાનું પાણી અને છાંટવા માટે પાણી ની મોટર સંસ્થા શ્રી એ આપવાની રહશે.',
'કારીગરો ને રહેવા માટે જાજરૂ-બાથરૂમ વાડી રૂમ તથા ઘડતર માટે ના પ્લોટ ની સગવડ સંસ્થા શ્રી એ કરી આપવાની રહશે.',
'આ ભાવ માં પાયા, પ્લીનથ, ફ્લોરિંગ અને દીવાલ ના પાટિયા નું ફીટીંગ મજૂરી અને માલ નો સમાવેસશ થતો નથી તથા ડુંઘા ફિનિશિંગ કે કલર કામ ની માલ મજૂરી નો સમાવેશ થતો નથી તથા આ ભાવ પ્લીનથ ઉપર થી પત્થર કામ કરવાનો છે. પ્લીનથ નીચે કોઈ પણ પ્રકાર નું પત્થર કામ નો સમાવેશ નથી, કોઈ પણ પ્રકાર નું રૂપકમ(મૂર્તિ કામ), સીહાસન, લાકડાના દરવાજા,ઘંટ,પિત્તડ ના કડશ, કડા, લાઇટ ફીટીંગ નળફીટીંગ નો આ એસ્ટીમેટ માં સમાવેશ નથી.'],
hi:['मंदिर के इन भावों में GST शामिल नहीं है, GST अलग से देना होगा।',
'मंदिर के इन भावों में 3D फोटो और वॉकथ्रू वीडियो शामिल नहीं हैं।',
'मंदिर के इन भावों में माल, घड़तर (नक्काशी), फिटिंग, ट्रांसपोर्ट, पाड़ (स्कैफोल्डिंग), क्रेन और साधारण ग्राइंडर मशीन पॉलिश शामिल हैं।',
'सभी कारीगरों की जिम्मेदारी (दुर्घटना की) हमारी रहेगी।',
'पत्थर में रंग का अंतर (कलर वेरिएशन) रहेगा।',
'इस कार्य के दौरान मंदिर में उपयोग होने वाला फिटिंग मटेरियल जैसे रेत, सीमेंट, ईंट, कंकर, अरल्डाइट (सॉल्यूशन), वाटरप्रूफिंग मटेरियल तथा मंदिर को ढकने का मटेरियल संस्था श्री को देना होगा।',
'साइट तक बिजली, पीने तथा उपयोग का पानी और छिड़काव के लिए पानी की मोटर संस्था श्री को देनी होगी।',
'कारीगरों के रहने के लिए शौचालय-बाथरूम, वाड़ी रूम तथा घड़तर के लिए प्लॉट की व्यवस्था संस्था श्री को करनी होगी।',
'इस भाव में नींव, प्लिंथ, फ्लोरिंग और दीवार के पाटिया की फिटिंग मजदूरी और माल शामिल नहीं है तथा डुंघा फिनिशिंग या कलर कार्य की माल-मजदूरी शामिल नहीं है। यह भाव प्लिंथ के ऊपर से पत्थर का कार्य करने का है। प्लिंथ के नीचे किसी भी प्रकार का पत्थर कार्य शामिल नहीं है। किसी भी प्रकार का रूपकाम (मूर्ति कार्य), सिंहासन, लकड़ी के दरवाजे, घंट, पीतल के कलश, कड़े, लाइट फिटिंग और नल फिटिंग इस एस्टिमेट में शामिल नहीं हैं।'],
en:['GST is not included in the rates of this temple. GST will have to be paid separately.',
'3D photos and a walkthrough video are not included in the rates of this temple.',
'The rates of this temple include material, carving, fitting, transport, scaffolding, crane and simple grinder machine polish.',
'We will be responsible for all the artisans (in case of accidents).',
'There will be natural colour variation in the stone.',
'During this work, the fitting material used in the temple such as sand, cement, bricks, gravel, Araldite (solution), waterproofing material, and the material to cover the temple will have to be provided by the Trust.',
'Electric power up to the site, drinking and utility water, and a water motor for sprinkling will have to be provided by the Trust.',
'The Trust will arrange toilet-bathroom and a room (vadi room) for the artisans to stay, and a plot for the carving work.',
'These rates do not include fitting labour and material for the foundation, plinth, flooring and wall panels (patiya), nor labour and material for dungha finishing or colour work. These rates are for stone work from the plinth upward. Any stone work below the plinth is not included. Any kind of figure work (murti), throne (sinhasan), wooden doors, bells, brass kalash, hooks (kada), light fitting and pipe fitting are not included in this estimate.']};
export var NOTES_S={
gu:['મંદિર ના આ ભાવ માં GST નો સમેવેશ થતો નથી GST અલગ થી આપવાનો રહશે.',
'મંદિર ના આ ભાવ માં 3Dફોટોસ અને વોંકથરું વિડીયો નો સમાવેશ થતો નથી.',
'મંદિર ના આ ભાવ માં માલ, ઘડતર, ફીટીંગ, ટ્રાન્સપોર્ટ, અને સાદું ગ્રાઈન્ડર મશીન પોલિશ નો સમાવેશ થાય છે.',
'તમામ કારીગરો ની જવાબદારી અમારી રહશે (એક્સિડન્ટ ની).',
'આ કામ દરમિયાન મદિર માં વપરાતા ફીટીંગ મટિરિયલ જેમ કે રેતી, સિમેન્ટ, ઈટ, કાંકરી, એરેલડેટ (સોલિયુસન), સંસ્થા શ્રી એ આપવાનું રહશે.',
'સાઇટ સુધી પાવર, પીવા તથા વાપરવાનું પાણી અને છાંટવા માટે પાણી ની મોટર સંસ્થા શ્રી એ આપવાની રહશે.',
'કારીગરો ને રહેવા માટે જાજરૂ-બાથરૂમ વાડી રૂમ ની સગવડ સંસ્થા શ્રી એ કરી આપવાની રહશે.',
'આ ભાવ માં દીવાલ ના પાટિયા નું ફીટીંગ મજૂરી અને માલ નો સમાવેસશ થતો નથી.',
'આ કલર કામ ની માલ મજૂરી નો સમાવેશ થતો નથી.',
'આ ભાવ મા કોઈ પણ પ્રકાર નું રૂપકમ (મૂર્તિ કામ), સીહાસન, લાકડાના દરવાજા, પિત્તડ ના કડશ, કડા, લાઇટ ફીટીંગ નળફીટીંગ નો આ એસ્ટીમેટ માં સમાવેશ નથી.'],
hi:['मंदिर के इन भावों में GST शामिल नहीं है, GST अलग से देना होगा।',
'मंदिर के इन भावों में 3D फोटो और वॉकथ्रू वीडियो शामिल नहीं हैं।',
'मंदिर के इन भावों में माल, घड़तर (नक्काशी), फिटिंग, ट्रांसपोर्ट और साधारण ग्राइंडर मशीन पॉलिश शामिल हैं।',
'सभी कारीगरों की जिम्मेदारी (दुर्घटना की) हमारी रहेगी।',
'इस कार्य के दौरान उपयोग होने वाला फिटिंग मटेरियल जैसे रेत, सीमेंट, ईंट, कंकर, अरल्डाइट (सॉल्यूशन) संस्था श्री को देना होगा।',
'साइट तक बिजली, पीने तथा उपयोग का पानी और छिड़काव के लिए पानी की मोटर संस्था श्री को देनी होगी।',
'कारीगरों के रहने के लिए शौचालय-बाथरूम और वाड़ी रूम की व्यवस्था संस्था श्री को करनी होगी।',
'इस भाव में दीवार के पाटिया की फिटिंग मजदूरी और माल शामिल नहीं है।',
'कलर कार्य की माल-मजदूरी शामिल नहीं है।',
'इस भाव में किसी भी प्रकार का रूपकाम (मूर्ति कार्य), सिंहासन, लकड़ी के दरवाजे, पीतल के कलश, कड़े, लाइट फिटिंग और नल फिटिंग इस एस्टिमेट में शामिल नहीं हैं।'],
en:['GST is not included in the rates of this temple. GST will have to be paid separately.',
'3D photos and a walkthrough video are not included in the rates.',
'The rates include material, carving, fitting, transport and simple grinder machine polish.',
'We will be responsible for all the artisans (in case of accidents).',
'During this work, the fitting material such as sand, cement, bricks, gravel and Araldite (solution) will have to be provided by the Trust.',
'Electric power up to the site, drinking and utility water, and a water motor for sprinkling will have to be provided by the Trust.',
'The Trust will arrange toilet-bathroom and a room (vadi room) for the artisans to stay.',
'Fitting labour and material for wall panels (patiya) are not included in these rates.',
'Labour and material for colour work are not included.',
'Any kind of figure work (murti), throne (sinhasan), wooden doors, brass kalash, hooks (kada), light fitting and pipe fitting are not included in this estimate.']};
export var ITEMS={gu:['મંદિર નું સિંહાસન','ઘર મંદિર'],hi:['मंदिर का सिंहासन','घर मंदिर'],en:['Temple sihasan','House temple']};
export var PT={
en:{date:'Date',ref:'Ref.',note:'Note:-',font:"Georgia,'Times New Roman',serif",
 head:function(g,l){return 'Shri '+g+' Temple'+(l?', '+l:'')},
 intro:function(g,l,v){return 'Rates for constructing the temple of Shri '+g+(l?' at '+(v?'village ':'')+l:'')+' are as follows.'},
 small:function(it,by,st,a,w){return it+' as per '+(by?by+'\'s ':'the ')+'design and size, made in '+st+': Rs. '+a+'/- ('+w+') has been fixed.'},tem:function(s,a,q){return 'Temple built in '+s+(q?' at Rs. '+q+'/- per sq. ft.,':'')+' total Rs. '+a+'/-'},ran:function(s,a){return 'Rang-mandap built in '+s+': total Rs. '+a+'/-'},when:function(d){return 'Date: '+d}},
hi:{date:'दिनांक',ref:'संदर्भ',note:'नोंध:-',font:"'Noto Sans Devanagari','Mangal',sans-serif",
 head:function(g,l){return 'श्री '+g+' मंदिर'+(l?', '+l:'')},
 intro:function(g,l,v){return (l?(v?'ग्राम ':'')+l+' में ':'')+'श्री '+g+' के मंदिर का निर्माण कार्य करने के भाव नीचे अनुसार हैं।'},
 small:function(it,by,st,a,w){return it+' '+(by?by+' के ':'')+'डिज़ाइन और साइज़ के अनुसार '+st+' में बनाकर देने के अंकों में रुपये '+a+'/- (शब्दों में '+w+') तय किए गए हैं।'},tem:function(s,a,q){return 'मंदिर '+s+' में '+(q?'रुपये '+q+'/- प्रति वर्ग फुट के भाव से ':'')+'बनाकर देने के कुल Rs. '+a+'/- होते हैं।'},ran:function(s,a){return 'रंग-मंडप '+s+' में बनाकर देने के कुल Rs. '+a+'/- होते हैं।'},when:function(d){return 'दिनांक: '+d}},
gu:{date:'તારીખ',ref:'સંદર્ભ',note:'નોંધ:-',font:"'Noto Sans Gujarati','Shruti',sans-serif",
 head:function(g,l){return 'શ્રી '+g+' મંદિર'+(l?', '+l:'')},
 intro:function(g,l,v){return (l?(v?'ગામ ':'')+l+' માં ':'')+'શ્રી '+g+' ના મંદિર નું બાંધકામ કરવાનાં ભાવ નીચે પ્રમાણે છે.'},
 small:function(it,by,st,a,w){return it+' '+(by?by+' ની ':'')+'ડીસાઇન અને સાઇઝ પ્રમાણે '+st+' માં કરી આપવાના અંકે રૂપિયા '+a+'/- (અંકે '+w+') નક્કી કરેલ છે.'},tem:function(s,a,q){return 'મંદિર '+s+' માં '+(q?'રૂપિયા '+q+'/- પ્રતિ સ્ક્વેર ફૂટ ના ભાવે ':'')+'બનાવી આપવાના કુલ Rs. '+a+'/- થાય છે.'},ran:function(s,a){return 'રંગ-મંડપ '+s+' માં બનાવી આપવાના કુલ Rs. '+a+'/- થાય છે.'},when:function(d){return 'તા. '+d}}};
export function stripGod(s){return String(s||'').trim().replace(/^(શ્રી|श्री|shri|shree)\s+/i,'').replace(/\s+(મંદિર|मंदिर|mandir|temple)$/i,'').trim()}
export function dmy(iso){if(!iso)return '';var q=iso.split('-');return q[2]+'-'+q[1]+'-'+q[0]}
export function amtTxt(n){return Number(n).toLocaleString('en-IN')+(String(n).length?'':'')}
export function presetNotes(kind,lg){var src=kind==='small'?NOTES_S:NOTES_T,o=DB.terms&&DB.terms[kind]&&DB.terms[kind][lg];return (o&&o.length?o:src[lg]).slice()}
export function findProp(id){for(var i=0;i<DB.proposals.length;i++)if(DB.proposals[i].id===id)return DB.proposals[i]}
export function propTitle(pr){var T=PT[pr.lg||'gu'];return T.head(esc(stripGod(pr.god)),esc(pr.loc||''))}

/* page blocks -> A4 pages (794 x 1123 px) */
export function proposalPages(pr,lg){
  var T=PT[lg],bw=DB.biz.lhBW,PW=794,PH=1123,HH=Math.round(PW*285/1500),FH=Math.round(PW*185/1500),LIMIT=PH-FH-26;
  var god=esc(stripGod(pr.god)),loc=esc(pr.loc||''),pad='padding:0 52px';
  var notes=(pr.notes||[]).filter(function(x){return String(x).trim()});
  /* k = how tight the spacing is (1 = roomy). A signature alone on a new page looks wrong, so tighten until it fits. */
  function layout(k,together){
    var m=function(x){return Math.round(x*k)},lh=function(x){return +(x*(0.8+0.2*k)).toFixed(2)},fs=function(x){return +(x*(k<0.8?0.94:1)).toFixed(1)};
    var blocks=[],n=0;
    blocks.push('<div style="display:flex;justify-content:space-between;gap:12px;font-size:14px;font-weight:700;margin-top:'+m(14)+'px"><span>'+T.ref+' '+esc(pr.vno||'')+'</span><span>'+T.when(dmy(pr.date))+'</span></div>');
    blocks.push('<div style="text-align:center;font-weight:700;font-size:21px;margin:'+m(26)+'px 0 '+m(14)+'px;line-height:1.5">'+T.head(god,loc)+'</div>');
    blocks.push('<div style="font-weight:700;font-size:'+fs(15.5)+'px;line-height:'+lh(1.9)+';margin:0 0 6px;text-align:center">'+T.intro(god,loc,pr.pt!=='c')+'</div>');
    if(pr.kind==='small'){var o0=(pr.options||[])[0]||{},am=num(o0.mandir);blocks.push('<div style="margin:'+m(22)+'px 0 0;font-size:'+fs(15.5)+'px;line-height:'+lh(2)+';font-weight:600;text-align:center">'+T.small(esc(pr.item||''),esc(pr.by||''),esc(o0.stone||''),amtTxt(am),esc(wordsL(am,lg)))+'</div>')}
    else (pr.options||[]).forEach(function(o){var l1=num(o.mandir)?T.tem(esc(o.stone||''),amtTxt(num(o.mandir)),num(o.sqft)?amtTxt(num(o.sqft)):''):'',l2=num(o.rang)?T.ran(esc(o.stone||''),amtTxt(num(o.rang))):'';if(!l1&&!l2)return;n++;
      blocks.push('<div style="margin:'+m(20)+'px 0 0;font-size:'+fs(15.5)+'px;line-height:'+lh(2)+';font-weight:600;text-align:center">'+n+'.&nbsp; '+l1+(l1&&l2?'<br>':'')+l2+'</div>')});
    notes.forEach(function(x,i){blocks.push((i===0?'<div style="font-weight:700;font-size:16px;margin:'+m(26)+'px 0 4px">'+T.note+'</div>':'')+'<div style="display:flex;gap:10px;margin:'+m(8)+'px 0 0;font-size:'+fs(14.5)+'px;line-height:'+lh(1.85)+'"><span style="width:26px;flex-shrink:0">'+(i+1)+'.</span><div>'+esc(x)+'</div></div>')});
    var sig='<div style="margin-top:'+m(30)+'px;text-align:right;font-size:15px"><div style="height:'+Math.max(40,m(60))+'px"></div><b>Pro. '+esc(pr.signer||'')+'</b></div>';
    if(together&&notes.length){var last=blocks.pop();blocks.push('<div>'+last+sig+'</div>')}else blocks.push(sig);
    var host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0;width:'+PW+'px';document.body.appendChild(host);
    var pages=[];
    function newPage(first){var pg=document.createElement('div');pg.className='pg';pg.style.fontFamily=T.font;pg.innerHTML=(first?hdrImgHtml(bw,lg,PW,'width:100%;height:'+HH+'px;display:block'):'<div style="height:34px"></div>')+'<div class="pc" style="'+pad+'"></div><img class="pf" src="'+LH.f+'" alt="" style="position:absolute;left:0;right:0;bottom:0;width:100%;height:'+FH+'px">';host.appendChild(pg);pages.push(pg);return pg}
    newPage(true);
    blocks.forEach(function(b){
      var pg=pages[pages.length-1],pc=pg.querySelector('.pc'),el=document.createElement('div');el.innerHTML=b;pc.appendChild(el);
      if(el.getBoundingClientRect().bottom-pg.getBoundingClientRect().top>LIMIT&&pc.children.length>1){pc.removeChild(el);var np=newPage(false);np.querySelector('.pc').appendChild(el)}});
    var lastOnly=pages.length>1&&pages[pages.length-1].querySelector('.pc').children.length===1;
    return {host:host,pages:pages,orphan:lastOnly}}
  var res,ks=[1,0.85,0.72,0.6];
  for(var i=0;i<ks.length;i++){res=layout(ks[i],false);if(!res.orphan||i===ks.length-1)break;document.body.removeChild(res.host)}
  if(res.orphan){document.body.removeChild(res.host);res=layout(0.6,true)}
  var pages=res.pages,total=pages.length;
  pages.forEach(function(pg,i){if(total>1){var s=document.createElement('div');s.style.cssText='position:absolute;right:52px;bottom:'+(FH+6)+'px;font-size:11px;color:#6E728A';s.textContent=(i+1)+' / '+total;pg.appendChild(s)}});
  var out=pages.map(function(pg){return pg.outerHTML});
  document.body.removeChild(res.host);return out}
export function proposalPreview(pr){var pg=proposalPages(pr,pr.lg||'gu');return pg.map(function(h){return '<div class="vfit" style="margin-bottom:12px"><div class="vin" data-w="794" style="width:794px"><div style="box-shadow:0 8px 24px rgba(0,0,0,.18)">'+h+'</div></div></div>'}).join('')}
export function warmFonts(){try{if(document.fonts&&document.fonts.load){document.fonts.load('400 14px "Noto Sans Gujarati"','અ');document.fonts.load('700 14px "Noto Sans Gujarati"','અ');document.fonts.load('400 14px "Noto Sans Devanagari"','अ');document.fonts.load('700 14px "Noto Sans Devanagari"','अ')}}catch(e){}}
export function pdfProposal(id){
  var pr=findProp(id);if(!pr)return;var C=pdfLib();if(!C){PDFMODE='save';return}
  if(!window.html2canvas){PDFMODE='save';toast('Making the PDF needs internet. Connect and try again.');return}
  var lg=pr.lg||'gu',fam=lg==='gu'?'Noto Sans Gujarati':lg==='hi'?'Noto Sans Devanagari':null,smp=lg==='gu'?'અ':'अ';
  var run=function(){
    var pages=proposalPages(pr,lg),host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0;width:794px';host.innerHTML=pages.join('');document.body.appendChild(host);
    var els=host.querySelectorAll('.pg'),d=new C({unit:'mm',format:'a4'}),idx=0;
    var fail=function(){if(host.parentNode)host.parentNode.removeChild(host);PDFMODE='save';toast('Could not make the PDF. Try again.')};
    (function next(){
      if(idx>=els.length){if(host.parentNode)host.parentNode.removeChild(host);finishPdf(d,'Proposal-'+(stripGod(pr.god)||'temple').replace(/[^a-z0-9ऀ-ॿ઀-૿]+/gi,'-')+'.pdf','Proposal saved');return}
      window.html2canvas(els[idx],{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false}).then(function(cv){if(idx>0)d.addPage();d.addImage(cv.toDataURL('image/jpeg',0.92),'JPEG',0,0,210,297);idx++;next()}).catch(fail)})()};
  if(fam&&document.fonts&&document.fonts.load)Promise.all([document.fonts.load('400 14px "'+fam+'"',smp),document.fonts.load('700 14px "'+fam+'"',smp)]).then(run,run);else run()}
export function printProposal(id){
  var pr=findProp(id);if(!pr)return;var pa=document.getElementById('printArea');
  pa.innerHTML=proposalPages(pr,pr.lg||'gu').map(function(h){return '<div class="vin" style="width:794px;break-after:page">'+h+'</div>'}).join('');
  document.getElementById('pgstyle').textContent='@page{size:A4 portrait;margin:0}';
  var done=function(){pa.innerHTML='';window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);
  try{window.print()}catch(e){done();toast('Print is not available here. Download the PDF and print that.')}}
export function proposalText(pr){var lg=pr.lg||'gu',T=PT[lg],god=stripGod(pr.god),loc=pr.loc||'',r=[T.head(god,loc),T.when(dmy(pr.date)),'',T.intro(god,loc,pr.pt!=='c'),''],n=0;
  if(pr.kind==='small'){var q0=(pr.options||[])[0]||{},qa=num(q0.mandir);r.push(T.small(pr.item||'',pr.by||'',q0.stone||'',amtTxt(qa),wordsL(qa,lg)))}
  else (pr.options||[]).forEach(function(o){var a=num(o.mandir)?T.tem(o.stone||'',amtTxt(num(o.mandir)),num(o.sqft)?amtTxt(num(o.sqft)):''):'',b=num(o.rang)?T.ran(o.stone||'',amtTxt(num(o.rang))):'';if(!a&&!b)return;n++;r.push(n+'. '+a);if(b)r.push('   '+b)});
  r.push('',T.note);(pr.notes||[]).forEach(function(x,i){if(String(x).trim())r.push((i+1)+'. '+x)});r.push('','Pro. '+(pr.signer||''));return r.join('\n')}
