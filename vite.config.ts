import { defineConfig } from 'vite';

export default defineConfig({
  // Railway 배포시 루트 경로 사용
  base: '/',
  optimizeDeps: {
    include: ['three']
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});