// Makes assets/icon.png (1024x1024) from the app's favicon so capacitor-assets can build the Android icons.
const fs = require('fs')
const sharp = require('sharp')

fs.mkdirSync('assets', { recursive: true })
sharp('web/public/favicon.svg', { density: 768 })
  .resize(1024, 1024)
  .png()
  .toFile('assets/icon.png')
  .then(() => console.log('assets/icon.png ready'))
