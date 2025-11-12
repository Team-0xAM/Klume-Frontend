import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(), // 임시로 비활성화 - 이벤트 중복 실행 문제 해결을 위해
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  define: {
    global: 'globalThis', // sockjs-client를 위한 global 폴리필
  },
  server: {
    port: 5173, // 포트를 5173으로 고정
    strictPort: true, // 포트가 사용 중이면 에러 발생
  },
})
