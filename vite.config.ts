import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const host = env.VITE_BACKEND_HOST;
  const port = env.VITE_BACKEND_PORT;

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: `http://${host}:${port}`,
          changeOrigin: true,
          rewrite: p => p.replace(/^\/api/, ''),
        },
      },
    },
  };
});
