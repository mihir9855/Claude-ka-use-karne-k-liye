// Copies the web app (repo root index.html) into www/ for Capacitor.
const fs = require('fs'), path = require('path');
fs.mkdirSync(path.join(__dirname, '../www'), { recursive: true });
fs.copyFileSync(path.join(__dirname, '../../index.html'), path.join(__dirname, '../www/index.html'));
