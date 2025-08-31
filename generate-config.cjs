const fs = require('fs');
const template = fs.readFileSync('vercel.template.json', 'utf8');
const config = template
  .replace('BACKEND_HOST', process.env.VITE_BACKEND_HOST || '52.78.132.85')
  .replace('BACKEND_PORT', process.env.VITE_BACKEND_PORT || '8080');
fs.writeFileSync('vercel.json', config);