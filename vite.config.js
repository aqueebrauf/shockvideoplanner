import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set VITE_BASE_PATH in GitHub Actions or .env for your repo name, e.g. /Shock-Video-Planner/
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  plugins: [react()],
  base,
});
