// Drives the Crucible MCP server over stdio: node drive.mjs <recipe.json> <plan.json> <outdir>
// plan: [{look:{name, camera, width, height}} | {render:{name, camera, width, height, quality|renderer}} | {apply:[ops]}]
import {spawn} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';
const [recipeFile,planFile,outDir]=process.argv.slice(2);fs.mkdirSync(outDir,{recursive:true});
const jobs=path.resolve(outDir,'jobs');fs.mkdirSync(jobs,{recursive:true});
const srv=spawn(process.execPath,['/home/user/crucible-workspace/node_modules/crucible/bin/crucible-mcp.mjs','--backend','cpu','--memory','2048','--browser','/opt/pw-browsers/chromium','--jobs',jobs],{stdio:['pipe','pipe','pipe']});
let buf='',id=0,err='';const waits={};
srv.stdout.on('data',d=>{buf+=d;let i;while((i=buf.indexOf('\n'))>=0){const l=buf.slice(0,i);buf=buf.slice(i+1);try{const m=JSON.parse(l);if(waits[m.id]){waits[m.id](m);delete waits[m.id];}}catch{}}});
srv.stderr.on('data',d=>{err+=d;if(err.length>20000)err=err.slice(-10000);});
const rpc=(method,params)=>new Promise(r=>{const n=++id;waits[n]=r;srv.stdin.write(JSON.stringify({jsonrpc:'2.0',id:n,method,params})+'\n');});
const tool=async(name,args)=>{const t0=Date.now();const r=await rpc('tools/call',{name,arguments:args});const res=r.result||{};const txt=(res.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('\n');
  const img=(res.content||[]).find(c=>c.type==='image');let json=null;try{json=JSON.parse(txt);}catch{}
  return {err:res.isError||!!r.error,txt:txt||JSON.stringify(r.error),json,img,secs:((Date.now()-t0)/1000).toFixed(1)};};
const log=(...a)=>console.log(...a);
await rpc('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'flat-e1303',version:'1'}});
srv.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})+'\n');
const recipe=JSON.parse(fs.readFileSync(recipeFile,'utf8'));
let c=await tool('scene_create',{recipe});
if(c.err){log('CREATE FAILED',c.txt.slice(0,3000));process.exit(1);}
let rev=c.json.revision;const ins=c.json.inspection||{};
log('created in',c.secs,'s; counts',JSON.stringify(ins.counts),'diag',JSON.stringify(ins.diagnostics||[]).slice(0,1500));
const plan=JSON.parse(fs.readFileSync(planFile,'utf8'));
for(const step of plan){
  if(step.apply){const r=await tool('scene_apply',{expectedRevision:rev,operations:step.apply});if(r.err){log('APPLY FAILED',r.txt.slice(0,1500));continue;}rev=r.json.revision;log('apply ok rev',rev,r.json.renderError||'');continue;}
  const s=step.look||step.render;
  if(s.camera){const r=await tool('scene_apply',{expectedRevision:rev,operations:[{type:'set-camera',...s.camera}]});if(r.err){log('CAM FAILED',r.txt.slice(0,800));continue;}rev=r.json.revision;}
  if(step.look){const r=await tool('scene_look',{width:s.width||1024,height:s.height||640,labels:!!s.labels});
    if(r.img){fs.writeFileSync(path.join(outDir,s.name+'.png'),Buffer.from(r.img.data,'base64'));log('look',s.name,r.secs,'s');}else log('LOOK FAILED',s.name,r.txt.slice(0,1500));continue;}
  const settings={kind:'image',width:s.width||1280,height:s.height||800};
  if(s.quality)settings.quality=s.quality;if(s.renderer)settings.renderer=s.renderer;
  let sub=await tool('scene_render_submit',{expectedRevision:rev,settings});
  if(sub.err){log('SUBMIT FAILED',s.name,sub.txt.slice(0,2000));continue;}
  const jid=sub.json.jobId;log('submitted',s.name,jid,'estimate',JSON.stringify(sub.json.estimate||{}),JSON.stringify(sub.json.quality||{}));
  let st;while(true){await new Promise(r=>setTimeout(r,5000));st=await tool('scene_render_status',{jobId:jid});const state=st.json?.state||st.json?.status;if(['succeeded','failed','cancelled','completed'].includes(state)||st.err){log('state',state,st.err?st.txt.slice(0,800):'');break;}}
  const res=await tool('scene_render_result',{jobId:jid});
  if(res.err){log('RESULT FAILED',res.txt.slice(0,1500));continue;}
  const outs=res.json.outputs||res.json.artifacts||[];
  for(const o of outs){const p=o.path||o.file;if(p&&p.endsWith('.png')){fs.copyFileSync(p,path.join(outDir,s.name+'.png'));log('render',s.name,'saved', JSON.stringify(res.json.metrics?.report||{}).slice(0,400));}}
  await tool('scene_render_release',{jobId:jid});
}
srv.kill();process.exit(0);
