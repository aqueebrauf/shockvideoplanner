import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { join } from 'node:path';

// Set VITE_BASE_PATH in GitHub Actions or .env for your repo name, e.g. /shockvideoplanner/
const base = process.env.VITE_BASE_PATH || '/';

function anthropicProxy(apiKey) {
  return {
    '/api/anthropic': {
      target: 'https://api.anthropic.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq) => {
          if (apiKey) {
            proxyReq.setHeader('x-api-key', apiKey);
          }
          proxyReq.setHeader('anthropic-version', '2023-06-01');
        });
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.VITE_ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY;

  return {
    plugins: [
      react(),
      {
        name: 'github-pages-spa-fallback',
        closeBundle() {
          const dist = join(process.cwd(), 'dist');
          copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
        },
      },
    ],
    base,
    server: {
      proxy: anthropicProxy(apiKey),
    },
    preview: {
      proxy: anthropicProxy(apiKey),
    },
  };
});
