import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Demo app config — aliases 'react-smart-scheduler' to local source
// so the demo always runs against the live source without a build step.
//
// For static hosting (Hostinger, Netlify, Vercel, GitHub Pages):
//   base: './' — all asset paths become relative to index.html,
//   so the site works at any URL depth (root domain or subdirectory).
export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'demo'),
  base: './',
  resolve: {
    alias: {
      'react-smart-scheduler': resolve(__dirname, 'src/index.ts'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: resolve(__dirname, 'demo-dist'),
    emptyOutDir: true,
    // Chunk size warning threshold (demo is fine to be larger)
    chunkSizeWarningLimit: 600,
  },
});
