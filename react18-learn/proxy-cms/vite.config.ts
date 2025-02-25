import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    open: true,
    host: '172.28.113.244',
    proxy: {
      '/api': {
        target: 'http://172.28.113.248:8066', //本地
        // target: 'http://api.agentfff.xyz', //测试
        // target: 'http://172.28.113.232:8066',
        // target: 'http://fuxqis.wrrtxr.xyz', //生产环境
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    }
  }
})
