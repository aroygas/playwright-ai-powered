import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Single source of Vite config: used by `npm run playground:dev` and by the CT runner (`ctViteConfig`).
// Keep aliases in sync with tsconfig `paths`.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@playground': path.join(root, 'playground', 'src'),
      '@ui': path.join(root, 'src', 'ui'),
      '@utils': path.join(root, 'src', 'utils'),
    },
  },
  server: { port: 5173, strictPort: true },
});
