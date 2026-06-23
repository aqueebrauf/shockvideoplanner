import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { join } from 'node:path';

// Set VITE_BASE_PATH in GitHub Actions or .env for your repo name, e.g. /shockvideoplanner/
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
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
});
