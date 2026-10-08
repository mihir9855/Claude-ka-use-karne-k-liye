// Copies the web app (repo root index.html) and the bundled PDF reader into www/ for Capacitor.
const fs = require('fs'), path = require('path');
const www = path.join(__dirname, '../www');
fs.mkdirSync(path.join(www, 'pdfjs'), { recursive: true });
fs.copyFileSync(path.join(__dirname, '../../index.html'), path.join(www, 'index.html'));
const build = path.join(__dirname, '../node_modules/pdfjs-dist/build');
for (const f of ['pdf.min.js', 'pdf.worker.min.js']) fs.copyFileSync(path.join(build, f), path.join(www, 'pdfjs', f));
fs.mkdirSync(path.join(www, 'icons'), { recursive: true });
for (const f of ['icon-192.png', 'icon-512.png']) fs.copyFileSync(path.join(__dirname, '../../icons', f), path.join(www, 'icons', f));
