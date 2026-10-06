/* ---------- stone-part detection (pure functions, no libraries) ---------- */
function toMask(canvas,workW){
  const k=Math.min(1,workW/canvas.width),w=Math.round(canvas.width*k),h=Math.round(canvas.height*k);
  const full=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height),d=full.data;
  const m=new Uint8Array(w*h),W=canvas.width;
  for(let y=0;y<canvas.height;y++){const ty=Math.min(h-1,Math.floor(y*k));
    for(let x=0;x<W;x++){const i=(y*W+x)*4;
      if(d[i+3]>40&&(d[i]*0.3+d[i+1]*0.59+d[i+2]*0.11)<150){m[ty*w+Math.min(w-1,Math.floor(x*k))]=1}}}
  return {m,w,h,k};
}
function dilate(m,w,h,r){
  if(r<=0)return m.slice();
  const t=new Uint8Array(w*h),o=new Uint8Array(w*h);
  for(let y=0;y<h;y++){let c=0;const row=y*w;
    for(let x=0;x<Math.min(w,r);x++)c+=m[row+x];
    for(let x=0;x<w;x++){if(x+r<w)c+=m[row+x+r];if(x-r-1>=0)c-=m[row+x-r-1];t[row+x]=c>0?1:0}}
  for(let x=0;x<w;x++){let c=0;
    for(let y=0;y<Math.min(h,r);y++)c+=t[y*w+x];
    for(let y=0;y<h;y++){if(y+r<h)c+=t[(y+r)*w+x];if(y-r-1>=0)c-=t[(y-r-1)*w+x];o[y*w+x]=c>0?1:0}}
  return o;
}
function label(m,w,h,want){ // want: value to label (1=ink, 0=white); 4-conn for white, 8-conn for ink
  const lab=new Int32Array(w*h),st=new Int32Array(w*h),out=[];let n=0;
  for(let s=0;s<w*h;s++){
    if(m[s]!==want||lab[s])continue;n++;let sp=0;st[sp++]=s;lab[s]=n;
    let x0=w,y0=h,x1=0,y1=0,a=0,edge=false;
    while(sp){const p=st[--sp],x=p%w,y=(p-x)/w;a++;
      if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;if(x===0||y===0||x===w-1||y===h-1)edge=true;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
        if(!dx&&!dy)continue;if(want===0&&dx&&dy)continue;
        const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=w||Y>=h)continue;const q=Y*w+X;
        if(m[q]===want&&!lab[q]){lab[q]=n;st[sp++]=q}}}
    out.push({id:n,x0,y0,x1:x1+1,y1:y1+1,area:a,edge});
  }
  return {lab,comps:out};
}
/* inner drawing area: the biggest white cell enclosed by a sheet border (title-block frame) */
function drawingArea(mask){
  const {m,w,h}=mask;
  const {comps}=label(m,w,h,0);
  let best=null;
  for(const c of comps){if(c.edge)continue;const cw=c.x1-c.x0,ch=c.y1-c.y0;
    if(cw>w*0.55&&ch>h*0.4&&(!best||c.area>best.area))best=c}
  if(!best)return {x0:0,y0:0,x1:w,y1:h,framed:false};
  return {x0:best.x0+2,y0:best.y0+2,x1:best.x1-2,y1:best.y1-2,framed:true};
}
/* make outlines solid: fill white holes fully enclosed inside the box so widths mean real thickness */
function fillHoles(m,w,h,box){
  const bw=box.x1-box.x0+2,bh=box.y1-box.y0+2,t=new Uint8Array(bw*bh);
  for(let y=box.y0;y<box.y1;y++)for(let x=box.x0;x<box.x1;x++)if(m[y*w+x])t[(y-box.y0+1)*bw+(x-box.x0+1)]=1;
  const {lab,comps}=label(t,bw,bh,0),lim=0.08*Math.max(bw,bh),open=new Set(comps.filter(c=>c.edge||(Math.min(c.x1-c.x0,c.y1-c.y0)>lim&&(c.x1-c.x0)*(c.y1-c.y0)<0.55*bw*bh)).map(c=>c.id));
  for(let y=1;y<bh-1;y++)for(let x=1;x<bw-1;x++){const i=y*bw+x;if(!t[i]&&!open.has(lab[i]))m[(y-1+box.y0)*w+(x-1+box.x0)]=1}
  return m;
}
/* split a blob by cutting at thin necks / gaps in its ink profile */
function splitBlob(m,w,h,box,p,depth){
  fillHoles(m,w,h,box);
  const bw=box.x1-box.x0,bh=box.y1-box.y0;
  // tighten
  let x0=box.x1,y0=box.y1,x1=box.x0,y1=box.y0;
  const col=new Float32Array(bw),row=new Float32Array(bh);
  for(let y=box.y0;y<box.y1;y++)for(let x=box.x0;x<box.x1;x++)if(m[y*w+x]){col[x-box.x0]++;row[y-box.y0]++;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<x0)return [];
  const tb={x0,y0,x1:x1+1,y1:y1+1};
  if(depth>=p.maxDepth)return [tb];
  const cut=(prof,off,len,minPiece)=>{ // returns {pos,ratio}|null
    const n=prof.length,sm=new Float32Array(n);
    const R=Math.max(1,Math.round(n*0.012));
    for(let i=0;i<n;i++){let s=0,c=0;for(let j=Math.max(0,i-R);j<=Math.min(n-1,i+R);j++){s+=prof[j];c++}sm[i]=s/c}
    const lm=new Float32Array(n),rm=new Float32Array(n);
    let mx=0;for(let i=0;i<n;i++){mx=Math.max(mx,sm[i]);lm[i]=mx}
    mx=0;for(let i=n-1;i>=0;i--){mx=Math.max(mx,sm[i]);rm[i]=mx}
    let bestI=-1,bestR=1e9;
    for(let i=minPiece;i<n-minPiece;i++){
      const side=Math.min(lm[i],rm[i]);if(side<p.minInk)continue;
      const r=sm[i]/side;
      if(r<p.neck&&r<bestR){bestR=r;bestI=i}
    }
    return bestI<0?null:{pos:bestI,ratio:bestR};
  };
  const mpx=Math.max(3,Math.round(Math.min(bw,bh)*p.minPiece));
  const cx=cut(col,box.x0,bw,Math.max(3,Math.round(bw*p.minPiece))),cy=cut(row,box.y0,bh,Math.max(3,Math.round(bh*p.minPiece)));
  let pick=null;
  if(cx&&cy)pick=cy.ratio<=cx.ratio*1.6?['y',cy]:['x',cx];else if(cx)pick=['x',cx];else if(cy)pick=['y',cy];
  if(!pick)return [tb];
  const [ax,c]=pick;
  const A=ax==='x'?{x0:box.x0,y0:box.y0,x1:box.x0+c.pos,y1:box.y1}:{x0:box.x0,y0:box.y0,x1:box.x1,y1:box.y0+c.pos};
  const B=ax==='x'?{x0:box.x0+c.pos,y0:box.y0,x1:box.x1,y1:box.y1}:{x0:box.x0,y0:box.y0+c.pos,x1:box.x1,y1:box.y1};
  return splitBlob(m,w,h,A,p,depth+1).concat(splitBlob(m,w,h,B,p,depth+1));
}
/* views: very coarse blobs (e.g. elevation and plan drawn side by side) */
function findViews(mask,area){
  const {m,w,h}=mask,r=Math.max(4,Math.round(w*0.035));
  const roi=new Uint8Array(w*h);
  for(let y=area.y0;y<area.y1;y++)for(let x=area.x0;x<area.x1;x++)roi[y*w+x]=m[y*w+x];
  const d=dilate(roi,w,h,r),{lab,comps}=label(d,w,h,1);
  const bb=new Map();
  for(let y=area.y0;y<area.y1;y++)for(let x=area.x0;x<area.x1;x++){
    if(!roi[y*w+x])continue;const id=lab[y*w+x];let b=bb.get(id);
    if(!b){b={x0:x,y0:y,x1:x+1,y1:y+1};bb.set(id,b)}
    if(x<b.x0)b.x0=x;if(x+1>b.x1)b.x1=x+1;if(y<b.y0)b.y0=y;if(y+1>b.y1)b.y1=y+1}
  const A=(area.x1-area.x0)*(area.y1-area.y0);
  return [...bb.values()].filter(b=>(b.x1-b.x0)*(b.y1-b.y0)>A*0.06).sort((a,b)=>a.x0-b.x0||a.y0-b.y0);
}
function detectParts(mask,roi,opt){
  const {m,w,h}=mask,p=Object.assign({join:0.012,neck:0.45,minPiece:0.06,minInk:6,maxDepth:6,minArea:0.003},opt||{});
  const sub=new Uint8Array(w*h);
  for(let y=roi.y0;y<roi.y1;y++)for(let x=roi.x0;x<roi.x1;x++)sub[y*w+x]=m[y*w+x];
  const r=Math.max(1,Math.round(w*p.join));
  const d=dilate(sub,w,h,r),{lab,comps}=label(d,w,h,1);
  const roiA=(roi.x1-roi.x0)*(roi.y1-roi.y0),out=[];
  for(const c of comps){
    if((c.x1-c.x0)*(c.y1-c.y0)<roiA*p.minArea)continue;
    // restrict original ink to this blob
    const mm=new Uint8Array(w*h);
    for(let y=c.y0;y<c.y1;y++)for(let x=c.x0;x<c.x1;x++)if(sub[y*w+x]&&lab[y*w+x]===c.id)mm[y*w+x]=1;
    fillHoles(mm,w,h,{x0:c.x0,y0:c.y0,x1:c.x1,y1:c.y1});
    const parts=splitBlob(mm,w,h,{x0:c.x0,y0:c.y0,x1:c.x1,y1:c.y1},p,0);
    for(const b of parts)if((b.x1-b.x0)*(b.y1-b.y0)>=roiA*p.minArea)out.push(b);
  }
  return out.sort((a,b)=>a.y0-b.y0||a.x0-b.x0);
}
