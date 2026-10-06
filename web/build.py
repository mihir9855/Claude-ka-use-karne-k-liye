import base64,sys
body=open('body.html',encoding='utf8').read()
algo=open('algo.js',encoding='utf8').read()
app=open('app.js',encoding='utf8').read()
open('index.html','w',encoding='utf8').write(body+'\n<script>\n'+algo+'\n'+app+'\n</script>\n')
