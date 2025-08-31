const fs = require('fs');

console.log('=== 환경변수 확인 ===');
console.log('VITE_BACKEND_HOST:', process.env.VITE_BACKEND_HOST);
console.log('VITE_BACKEND_PORT:', process.env.VITE_BACKEND_PORT);

const host = process.env.VITE_BACKEND_HOST;
const port = process.env.VITE_BACKEND_PORT;

if (!host || !port) {
  console.error('환경변수 누락: VITE_BACKEND_HOST, VITE_BACKEND_PORT 필요');
  process.exit(1);
}

const config = {
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/proxy?path=:path*"
    }
  ]
};

console.log('생성할 config:', JSON.stringify(config, null, 2));

fs.writeFileSync('vercel.json', JSON.stringify(config, null, 2));
console.log('vercel.json 생성 완료');