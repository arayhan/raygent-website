import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: here,
  // GitHub Pages serves this project site under /raygent-website/.
  base: '/raygent-website/',
  plugins: [react(), tailwindcss()],
  build: {
    // Resolved against root, so it lands in this repo whatever the cwd.
    outDir: 'dist',
    emptyOutDir: true,
  },
});
