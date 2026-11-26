import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { liveSyncPlugin } from './vite-plugin-live-sync.ts';

export default defineConfig({
  plugins: [react(), liveSyncPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('node_modules\\three')) {
            return 'three';
          }
          if (id.includes('node_modules/motion') || id.includes('node_modules\\motion')) {
            return 'motion';
          }
          return undefined;
        },
      },
    },
  },
});
