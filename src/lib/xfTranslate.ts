// ─── 机器翻译 niutrans（小牛翻译） ─────────────────────────────────────
// 文档: https://www.xfyun.cn/doc/nlp/niutrans/API.html
// 端点: https://ntrans.xfyun.cn/v2/ots
//
// ⚠️重要：该 WebAPI 需要 Date / Digest / Authorization 等鉴权头；
// 这些 header 在浏览器 fetch 里属于 forbidden headers（无法可靠设置）。
// 因此：鉴权与转发在 Vite dev server 的中间件中完成（vite.config.ts）。
// 浏览器端仅把请求 body 和 apiKey/apiSecret 通过自定义 header 传给本地中间件。

const XF_API_KEY_KEY = 'xftranslate_api_key'
const XF_API_SECRET_KEY = 'xftranslate_api_secret'
const XF_API_URL = '/api/xf/v2/ots'
const XF_HDR_API_KEY = 'x-xf-api-key'
const XF_HDR_API_SECRET = 'x-xf-api-secret'

// ─── Helpers ─────────────────────────────────────────────────────────────

// ─── Pure-JS base64 (no Buffer in browser) ──────────────────────────────
function btoa(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const bytes = new TextEncoder().encode(str)
  let r = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const [a, b, c] = [bytes[i], bytes[i + 1] ?? 0, bytes[i + 2] ?? 0]
    r += chars[a >> 2] + chars[((a & 3) << 4) | (b >> 4)]
    r += bytes[i + 1] !== undefined ? chars[((b & 15) << 2) | (c >> 6)] : '='
    r += bytes[i + 2] !== undefined ? chars[c & 63] : '='
  }
  return r
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────
export function getXfApiKey(): string { try { return localStorage.getItem(XF_API_KEY_KEY) || '' } catch { return '' } }
export function setXfApiKey(key: string) { try { localStorage.setItem(XF_API_KEY_KEY, key) } catch {} }
export function getXfApiSecret(): string { try { return localStorage.getItem(XF_API_SECRET_KEY) || '' } catch { return '' } }
export function setXfApiSecret(key: string) { try { localStorage.setItem(XF_API_SECRET_KEY, key) } catch {} }
export function isXfConfigured(): boolean { return !!(getXfApiKey() && getXfApiSecret()) }

function normalizeLangForNiutrans(lang: string): string {
  const v = (lang || '').toLowerCase()
  if (!v) return v
  // niutrans: 中文(简体)=cn，中文(繁体)=cht
  if (v === 'zh' || v.startsWith('zh-')) return 'cn'
  if (v === 'zh-cn' || v === 'zh-hans' || v === 'zh-chs') return 'cn'
  if (v === 'zh-tw' || v === 'zh-hant' || v === 'zh-cht') return 'cht'
  return v
}

/**
 * 机器翻译 niutrans（小牛翻译）
 * 文档: https://www.xfyun.cn/doc/nlp/niutrans/API.html
 * 端点: https://ntrans.xfyun.cn/v2/ots
 * 鉴权: HMAC-SHA256, headers="host date request-line digest"
 * Body: { common: { app_id }, business: { from, to }, data: { text: base64 } }
 * 注意: text 需要 base64 编码；niutrans 允许更大的文本（base64 后 ≤ 20000 bytes）
 */
export async function translateWithXf(
  text: string,
  from = 'en',
  to = 'zh',
  appId = ''
): Promise<string | null> {
  if (!isXfConfigured()) return null
  try {
    const apiKey = getXfApiKey()
    const apiSecret = getXfApiSecret()
    if (!appId) return null

    const fromLang = normalizeLangForNiutrans(from)
    const toLang = normalizeLangForNiutrans(to)

    // Body: v2 格式，text 必须 base64 编码，compact JSON（无空格）
    const textB64 = btoa(text)
    const body = JSON.stringify({
      common: { app_id: appId },
      business: { from: fromLang, to: toLang },
      data: { text: textB64 },
    }, null, 0) // 紧凑格式，无空格

    const res = await fetch(XF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // 把密钥通过自定义 header 发送给本地 Vite 中间件（仅开发环境使用）
        [XF_HDR_API_KEY]: apiKey,
        [XF_HDR_API_SECRET]: apiSecret,
      },
      body,
    })

    if (!res.ok) {
      const errText = await res.text()
      console.warn('[Xunfei] HTTP', res.status, ':', errText)
      return null
    }
    const json = await res.json()

    if (json.code !== 0) {
      console.warn('[Xunfei] error:', json.code, json.message, 'sid:', json.sid)
      // 11200 = licc failed (服务未开通/配额耗尽)
      if (json.code === 11200) {
        console.warn('[Xunfei] 请在讯飞控制台确认「机器翻译」服务已开通')
      }
      return null
    }

    // 响应: { code:0, data: { result: { from, to, trans_result: { src, dst } } } }
    const transResult = json?.data?.result?.trans_result
    if (transResult) {
      return transResult.dst || null
    }
    return null
  } catch (e) {
    console.error('[Xunfei] error:', e)
    return null
  }
}
