import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    proxy: {
      // 百度翻译 API (OAuth + 翻译)
      '/api/baidu': {
        target: 'https://aip.baidubce.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/baidu/, ''),
        secure: true,
      },
      // Google Cloud Translation
      '/api/google': {
        target: 'https://translation.googleapis.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/google/, ''),
        secure: true,
      },
      // 网易有道翻译
      '/api/youdao': {
        target: 'https://openapi.youdao.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/youdao/, ''),
        secure: true,
      },
      // 讯飞机器翻译
      '/api/xf': {
        target: 'https://itrans.xfyun.cn',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/xf/, ''),
        secure: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  }
})