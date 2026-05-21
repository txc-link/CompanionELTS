import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import crypto from 'crypto'

export default defineConfig({
  plugins: [react(), tailwindcss(), xfyunMtProxy()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: {
    allowedHosts: ['192.168.64.6', 'localhost'],
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
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  }
})

/**
 * 讯飞机器翻译（v2）本地代理：
 * - 浏览器无法设置 Date/Host/Digest/Authorization（forbidden headers）
 * - 在 Vite dev server 中生成鉴权头后转发到 https://itrans.xfyun.cn/v2/its
 * - 浏览器通过自定义 header 传入 apiKey/apiSecret：x-xf-api-key / x-xf-api-secret
 */
function xfyunMtProxy() {
  const HDR_KEY = 'x-xf-api-key'
  const HDR_SECRET = 'x-xf-api-secret'

  return {
    name: 'xfyun-mt-proxy',
    configureServer(server: any) {
      const routes = [
        // 讯飞机器翻译（旧）
        { route: '/api/xf/v2/its', host: 'itrans.xfyun.cn', path: '/v2/its' },
        // 机器翻译 niutrans（小牛翻译）
        { route: '/api/xf/v2/ots', host: 'ntrans.xfyun.cn', path: '/v2/ots' },
      ]

      for (const r of routes) server.middlewares.use(r.route, (req: any, res: any, next: any) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }
        if (req.method !== 'POST') return next()

        const apiKey = req.headers[HDR_KEY] as string | undefined
        const apiSecret = req.headers[HDR_SECRET] as string | undefined
        if (!apiKey || !apiSecret) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify({ message: `Missing ${HDR_KEY}/${HDR_SECRET}` }))
          return
        }

        let body = ''
        req.on('data', (chunk: any) => { body += chunk })
        req.on('end', async () => {
          try {
            const UPSTREAM_URL = `https://${r.host}${r.path}`
            const date = new Date().toUTCString()
            const digest = 'SHA-256=' + crypto.createHash('sha256').update(body, 'utf8').digest('base64')
            const signOrigin = `host: ${r.host}\ndate: ${date}\nPOST ${r.path} HTTP/1.1\ndigest: ${digest}`
            const signature = crypto.createHmac('sha256', apiSecret).update(signOrigin).digest('base64')
            const authorization = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line digest", signature="${signature}"`

            const upstream = await fetch(UPSTREAM_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Date': date,
                'Digest': digest,
                'Authorization': authorization,
              },
              body,
            })

            const text = await upstream.text()
            res.statusCode = upstream.status
            res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8')
            res.end(text)
          } catch (e: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify({ message: 'xf proxy error', error: String(e?.message || e) }))
          }
        })
      })
    },
  }
}
