import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ✅ 게시판 API는 /api/posts → 그대로 백엔드 /api/posts 로 전달 (rewrite 없음)
      '/api/posts': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // rewrite 하지 않음
      },
       '/api/comments': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
       '/api/chat/rooms': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/survey': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },

      '/api/survey/result': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },

      '/api/match': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      
      // ✅ 나머지는 /api → /api/school 로 rewrite (예: /api/user → /api/school/user)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
})