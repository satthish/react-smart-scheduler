import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Library build config
//
// Running `npm run build` produces artefacts in /dist:
//
//   index.es.js     — ES module build (for bundlers: Vite, webpack, Rollup)
//   index.umd.js    — UMD build (for CDN / <script> tags)
//   index.d.ts      — Rolled-up TypeScript declarations (single file)
//   index.es.js.map — Source maps for both bundles
//   index.umd.js.map
//   scheduler.css   — All library styles in one file
//
// React / ReactDOM stay as peer deps — never double-bundled.
//
// Why UMD instead of a separate CJS pass?
//   UMD covers the CJS require() path via the `exports` map while keeping
//   the dist clean. Bundler consumers pick the leaner ESM build automatically.
// ─────────────────────────────────────────────────────────────────────────────

const pkg = { version: '0.1.2' };

const BANNER = `/*!
 * react-smart-scheduler v${pkg.version}
 * (c) ${new Date().getFullYear()} react-smart-scheduler contributors
 * Released under the MIT License
 * https://github.com/satthish/react-smart-scheduler
 */`;

export default defineConfig({
  plugins: [
    react(),

    // vite-plugin-dts — generates .d.ts from TypeScript source.
    // rollupTypes:true merges all declarations into one index.d.ts so
    // consumers see a clean, flat API without internal module noise.
    dts({
      include: ['src'],
      outDir: 'dist',
      rollupTypes: true,
    }),
  ],

  build: {
    // Source maps let consumers debug into library code
    sourcemap: true,

    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactSmartScheduler',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },

    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],

      output: {
        // MIT license banner at the top of every emitted file
        banner: BANNER,

        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },

        // Rename Vite's generic style.css to scheduler.css for stable imports:
        //   import 'react-smart-scheduler/dist/scheduler.css'
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'scheduler.css';
          return assetInfo.name ?? 'asset';
        },
      },
    },

    // Single CSS output — keeps the consumer import story simple
    cssCodeSplit: false,
  },
});
