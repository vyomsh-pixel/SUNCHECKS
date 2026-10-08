import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

// Fix Windows junction path discrepancy for Vite dependency optimization
try {
  const realCwd = fs.realpathSync(process.cwd());
  if (process.cwd() !== realCwd) {
    process.chdir(realCwd);
  }
} catch (e) {
  // Ignore fallback
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
});
