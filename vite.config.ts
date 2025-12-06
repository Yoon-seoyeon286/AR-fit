import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ar-fitting-app/', // 여기를 본인의 저장소 이름으로 변경
  optimizeDeps: {
    include: ['three']
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true
  }
});