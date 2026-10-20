import {DB,KEY,notify,save,setSaveHook} from './engine.js'
var listeners=[];function emit(){listeners.slice().forEach(function(f){f()})}

var K='bt-sync-v1',COLS=['projects','parties','txns','proposals'],SEQS=['seq','vseq','pseq'];
var M=(function(){try{var m=JSON.parse(localStorage.getItem(K));if(m&&m.base)return m}catch(e){}return {cfg:null,auth:null,cur:null,base:{},t:{},last:0,err:''}})();
var busy=false,again=false,timer=null,syncing=false;
function keep(){try{localStorage.setItem(K,JSON.stringify(M))}catch(e){}}
function H(s){var a=0xdeadbeef,b=0x41c6ce57;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return (4294967296*(2097151&b)+(a>>>0)).toString(36)}
function items(){var o={};COLS.forEach(function(c){(DB[c]||[]).forEach(function(x){if(x&&x.id)o[x.id]=[c,JSON.stringify(x)]})});o.cfg=['cfg',JSON.stringify({biz:DB.biz,terms:DB.terms||{}})];return o}
function on(){return !!(M.cfg&&M.auth)}
/* remember which items changed locally, and when */
function scan(){
  var L=items(),first=!M.cur,now=Date.now(),cur={};
  Object.keys(L).forEach(function(id){var h=H(L[id][1]);cur[id]=h;if(!first&&M.cur[id]!==h)M.t[id]=now;else if(first&&M.t[id]==null)M.t[id]=0});
  if(!first)Object.keys(M.cur).forEach(function(id){if(!(id in cur))M.t[id]=now});
  M.cur=cur;keep();return L}
function friendly(m){var map={EMAIL_NOT_FOUND:'No account with this email. Use Create account.',INVALID_PASSWORD:'Wrong password.',INVALID_LOGIN_CREDENTIALS:'Wrong email or password.',EMAIL_EXISTS:'This email already has an account. Use Sign in.',WEAK_PASSWORD:'Password needs at least 6 characters.',OPERATION_NOT_ALLOWED:'Email/Password sign-in is not switched on in Firebase.',INVALID_EMAIL:'This email address is not valid.',API_KEY_INVALID:'The API key is wrong.',TOO_MANY_ATTEMPTS_TRY_LATER:'Too many tries. Wait a few minutes.'};
  var k=String(m||'').split(' ')[0].split(':')[0];return map[k]||String(m||'Something went wrong')}
function jfetch(url,opt){return fetch(url,opt).then(function(r){return r.text().then(function(t){var j=null;try{j=JSON.parse(t)}catch(e){}if(!r.ok){var e=new Error(j&&j.error&&j.error.message||('HTTP '+r.status));e.status=r.status;throw e}return j})})}
function login(create,email,pw){
  return jfetch('https://identitytoolkit.googleapis.com/v1/accounts:'+(create?'signUp':'signInWithPassword')+'?key='+encodeURIComponent(M.cfg.key),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,password:pw,returnSecureToken:true})}).then(function(j){
    M.auth={uid:j.localId,email:j.email,id:j.idToken,rf:j.refreshToken,exp:Date.now()+(+j.expiresIn||3600)*1000};keep()})}
function token(){
  if(M.auth.exp-60000>Date.now())return Promise.resolve(M.auth.id);
  return jfetch('https://securetoken.googleapis.com/v1/token?key='+encodeURIComponent(M.cfg.key),{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=refresh_token&refresh_token='+encodeURIComponent(M.auth.rf)}).then(function(j){
    M.auth.id=j.id_token;M.auth.rf=j.refresh_token||M.auth.rf;M.auth.exp=Date.now()+(+j.expires_in||3600)*1000;keep();return M.auth.id})}
function docUrl(){return 'https://firestore.googleapis.com/v1/projects/'+encodeURIComponent(M.cfg.pid)+'/databases/(default)/documents/users/'+encodeURIComponent(M.auth.uid)+'/sync/main'}
function getDoc(tok){
  return fetch(docUrl(),{headers:{Authorization:'Bearer '+tok}}).then(function(r){
    if(r.status===404)return {items:{},seq:{}};
    return r.text().then(function(t){var j=null;try{j=JSON.parse(t)}catch(e){}if(!r.ok){var e=new Error(j&&j.error&&j.error.message||('HTTP '+r.status));e.status=r.status;throw e}
      var f=(j&&j.fields)||{},out={items:{},seq:{}};var im=(f.items&&f.items.mapValue&&f.items.mapValue.fields)||{};
      Object.keys(im).forEach(function(id){var q=(im[id].mapValue&&im[id].mapValue.fields)||{};out.items[id]={k:q.k&&q.k.stringValue,s:q.s&&q.s.stringValue,del:!!(q.del&&q.del.booleanValue),t:+(q.t&&q.t.integerValue||0)}});
      SEQS.forEach(function(s){out.seq[s]=+(f[s]&&f[s].integerValue||0)});return out})})}
function enc(id,e){var f={k:{stringValue:e.k},t:{integerValue:String(e.t)}};if(e.del)f.del={booleanValue:true};else f.s={stringValue:e.s};return f}
function patch(tok,ents,seqs){
  var ids=Object.keys(ents),chunks=[];for(var i=0;i<ids.length;i+=40)chunks.push(ids.slice(i,i+40));
  if(!chunks.length)chunks.push([]);
  return chunks.reduce(function(p,ch,ci){return p.then(function(){
    var mask=ch.map(function(id){return 'updateMask.fieldPaths=items.'+id}),fields={};
    if(ch.length){fields.items={mapValue:{fields:{}}};ch.forEach(function(id){fields.items.mapValue.fields[id]={mapValue:{fields:enc(id,ents[id])}}})}
    if(ci===0&&seqs)SEQS.forEach(function(s){mask.push('updateMask.fieldPaths='+s);fields[s]={integerValue:String(seqs[s])}});
    if(!mask.length)return;
    return jfetch(docUrl()+'?'+mask.join('&'),{method:'PATCH',headers:{Authorization:'Bearer '+tok,'Content-Type':'application/json'},body:JSON.stringify({fields:fields})})})},Promise.resolve())}
function applyRemote(id,r){
  if(id==='cfg'){var c=JSON.parse(r.s);if(c.biz)DB.biz=c.biz;DB.terms=c.terms||{};return}
  COLS.forEach(function(c){DB[c]=(DB[c]||[]).filter(function(x){return x.id!==id})});
  if(r.del)return;var d=JSON.parse(r.s);if(COLS.indexOf(r.k)<0)return;DB[r.k].push(d)}
function run(){
  if(!on())return Promise.resolve();
  if(busy){again=true;return Promise.resolve()}
  busy=true;syncing=true;M.err='';ui();
  var L,pushE={},changed=false,tok;
  return token().then(function(t){tok=t;scan();return getDoc(tok)}).then(function(R){
    L=items();
    var ids={};[L,R.items,M.base].forEach(function(o){Object.keys(o).forEach(function(i){ids[i]=1})});
    Object.keys(ids).forEach(function(id){
      var l=L[id],r=R.items[id],b=M.base[id]||null;
      var lh=l?H(l[1]):null,rh=r&&!r.del?H(r.s):null;
      var lc=lh!==b,rc=!!r&&rh!==b;
      if(!lc&&!rc)return;
      if(lc&&rc&&lh===rh){M.base[id]=rh;if(rh===null)delete M.base[id];return}
      var useLocal=lc&&(!rc||(M.t[id]||0)>r.t);
      if(useLocal){pushE[id]=l?{k:l[0],s:l[1],t:M.t[id]||Date.now()}:{k:'x',del:true,t:M.t[id]||Date.now()};if(pushE[id].t===0)pushE[id].t=1}
      else{applyRemote(id,r);changed=true;if(rh===null)delete M.base[id];else M.base[id]=rh}
    });
    var seqs={},sq=false;SEQS.forEach(function(s){var m=Math.max(DB[s]||0,R.seq[s]||0);if(m>(DB[s]||0)){DB[s]=m;changed=true}seqs[s]=m;if(m>(R.seq[s]||0))sq=true});
    if(changed){try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}}
    return patch(tok,pushE,sq?seqs:null)
  }).then(function(){
    Object.keys(pushE).forEach(function(id){if(pushE[id].del)delete M.base[id];else M.base[id]=H(pushE[id].s)});
    var L2=items();M.cur={};Object.keys(L2).forEach(function(id){M.cur[id]=H(L2[id][1])});
    M.last=Date.now();M.err='';keep();
    
    return changed
  }).catch(function(e){
    M.err=e.status===401||e.status===403?'Not allowed. Check the Firestore rules and sign in again.':(e.message==='Failed to fetch'||e.name==='TypeError')?'No internet connection.':friendly(e.message);keep();return false
  }).then(function(ch){busy=false;syncing=false;ui(ch);if(again){again=false;soon()}})}
function soon(){if(!on())return;clearTimeout(timer);timer=setTimeout(run,2500)}
function stamp(){if(!M.last)return 'Not synced yet';var d=new Date(M.last);return 'Last synced '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}

function ui(redraw){if(redraw)notify();emit()}

function mk(){return {on:on(),email:M.auth?M.auth.email:'',cfg:M.cfg,mail:M.mail||'',busy:syncing,err:M.err||'',last:M.last||0}}
var snap=mk();
function refresh(){snap=mk()}
export var SY={
  soon:soon,
  run:function(){return run()},
  on:on,
  subscribe:function(f){listeners.push(f);return function(){listeners=listeners.filter(function(x){return x!==f})}},
  state:function(){refresh();return snap},
  signIn:function(create,key,pid,mail,pw){
    M.mail=mail;M.cfg={key:key,pid:pid};M.err='';keep();
    return login(create,mail,pw).then(function(){M.cur=null;M.base={};M.t={};keep();emit();return run()}).catch(function(e){
      M.err=(e.message==='Failed to fetch'||e.name==='TypeError')?'No internet connection.':friendly(e.message);keep();emit();throw new Error(M.err)})},
  signOut:function(){M.auth=null;M.cur=null;M.base={};M.t={};M.err='';keep();emit()}
};
setSaveHook(soon);
document.addEventListener('visibilitychange',function(){if(!document.hidden)soon()});
window.addEventListener('online',soon);window.addEventListener('focus',soon);
setInterval(function(){if(!document.hidden)run()},60000);
setTimeout(function(){if(on())run()},1200);
