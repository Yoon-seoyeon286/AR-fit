import { defineConfig } from 'vite';

export default defineConfig({
  base: '/AR-fit/', // 본인의 GitHub 저장소 이름으로 변경
  optimizeDeps: {
    include: ['three']
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  }
});