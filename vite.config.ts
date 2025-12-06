import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    include: ['three']
  },
  server: {
    port: 3000,
    open: true
  }
});