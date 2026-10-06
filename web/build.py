import base64,sys
S='assets/sample-rajkot.png'
b=base64.b64encode(open(S,'rb').read()).decode()
body=open('body.html',encoding='utf8').read()
algo=open('algo.js',encoding='utf8').read()
app=open('app.js',encoding='utf8').read().replace('__IMG__','data:image/png;base64,'+b)
open('index.html','w',encoding='utf8').write(body+'\n<script>\n'+algo+'\n'+app+'\n</script>\n')
