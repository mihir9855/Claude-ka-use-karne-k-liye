// node topdf.js : print annotated.html to PDF (needs playwright)
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+path.resolve(__dirname,'annotated.html'));await p.waitForTimeout(800);
await p.pdf({path:path.resolve(__dirname,'Daduka_Sinhasan_Maap.pdf'),width:'420mm',height:'297mm',printBackground:true});await b.close()})();
