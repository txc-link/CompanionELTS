// ─── 讯飞机器翻译 API v2 ─────────────────────────────────────────────
// 文档: https://www.xfyun.cn/doc/nlp/xftrans/API.html
// 端点: https://itrans.xfyun.cn/v2/its
// 鉴权: HMAC-SHA256，headers="host date request-line digest"
// Body: { common, business, data } 三段式

const XF_API_KEY_KEY = 'xftranslate_api_key'
const XF_API_SECRET_KEY = 'xftranslate_api_secret'
const XF_API_URL = '/api/xf/v2/its'
const XF_HOST = 'itrans.xfyun.cn'

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatRFC1123(d: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[d.getUTCDay()]}, ${String(d.getUTCDate()).padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} GMT`
}

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

function btoaBytes(bytes: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let r = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const [a, b, c] = [bytes[i], bytes[i + 1] ?? 0, bytes[i + 2] ?? 0]
    r += chars[a >> 2] + chars[((a & 3) << 4) | (b >> 4)]
    r += bytes[i + 1] !== undefined ? chars[((b & 15) << 2) | (c >> 6)] : '='
    r += bytes[i + 2] !== undefined ? chars[c & 63] : '='
  }
  return r
}

// ─── Pure-JS HMAC-SHA256 ─────────────────────────────────────────────────
function sha256bytes(data: Uint8Array): Uint8Array {
  function rotr(n: number, r: number) { return (n >>> r) | (n << (32 - r)) }
  function ch(x: number, y: number, z: number) { return (x & y) ^ (~x & z) }
  function maj(x: number, y: number, z: number) { return (x & y) ^ (x & z) ^ (y & z) }
  function S0(x: number) { return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22) }
  function S1(x: number) { return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25) }
  function G0(x: number) { return rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3) }
  function G1(x: number) { return rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10) }
  const K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2,
  ]
  function pad(d: Uint8Array): Uint8Array {
    const len = d.length, out = new Uint8Array(Math.ceil((len + 9) / 64) * 64)
    d.forEach((v, i) => { out[i] = v })
    out[len] = 0x80
    const v = new DataView(new ArrayBuffer(8)); v.setUint32(4, len * 8, false)
    for (let i = 0; i < 8; i++) out[out.length - 8 + i] = v.getUint8(i)
    return out
  }
  const padded = pad(data)
  let [a, b, c, d, e, f, g, hh] = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]
  for (let i = 0; i < padded.length / 64; i++) {
    const block = padded.slice(i * 64, i * 64 + 64), W: number[] = []
    for (let t = 0; t < 16; t++) W[t] = (block[t * 4] << 24 | block[t * 4 + 1] << 16 | block[t * 4 + 2] << 8 | block[t * 4 + 3]) >>> 0
    for (let t = 16; t < 64; t++) W[t] = (G1(W[t - 2]) + W[t - 7] + G0(W[t - 15]) + W[t - 16]) >>> 0
    const [oa, ob, oc, od, oe, of, og, oh] = [a, b, c, d, e, f, g, hh]
    for (let t = 0; t < 64; t++) {
      const T1 = (hh + S1(e) + ch(e, f, g) + K[t] + W[t]) >>> 0
      const T2 = (S0(a) + maj(a, b, c)) >>> 0
      hh = g; g = f; f = e; e = (d + T1) >>> 0; d = c; c = b; b = a; a = (T1 + T2) >>> 0
    }
    a = (a + oa) >>> 0; b = (b + ob) >>> 0; c = (c + oc) >>> 0; d = (d + od) >>> 0
    e = (e + oe) >>> 0; f = (f + of) >>> 0; g = (g + og) >>> 0; hh = (hh + oh) >>> 0
  }
  const out = new Uint8Array(32); const view = new DataView(out.buffer)
  ;[a, b, c, d, e, f, g, hh].forEach((v, i) => view.setUint32(i * 4, v, false))
  return out
}

function hmacSha256(key: string, msg: string): string {
  const k = new TextEncoder().encode(key)
  const kp = new Uint8Array(64)
  ;(k.length > 64 ? sha256bytes(k) : k).forEach((v, i) => { kp[i] = v })
  const m = new TextEncoder().encode(msg)
  const ip = new Uint8Array(64), op = new Uint8Array(64)
  for (let i = 0; i < 64; i++) { ip[i] = 0x36 ^ kp[i]; op[i] = 0x5c ^ kp[i] }
  const inner = new Uint8Array(64 + m.length)
  ip.forEach((v, i) => { inner[i] = v }); m.forEach((v, i) => { inner[64 + i] = v })
  const ih = sha256bytes(inner)
  const outer = new Uint8Array(64 + 32)
  op.forEach((v, i) => { outer[i] = v }); ih.forEach((v, i) => { outer[64 + i] = v })
  return btoaBytes(sha256bytes(outer))
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────
export function getXfApiKey(): string { try { return localStorage.getItem(XF_API_KEY_KEY) || '' } catch { return '' } }
export function setXfApiKey(key: string) { try { localStorage.setItem(XF_API_KEY_KEY, key) } catch {} }
export function getXfApiSecret(): string { try { return localStorage.getItem(XF_API_SECRET_KEY) || '' } catch { return '' } }
export function setXfApiSecret(key: string) { try { localStorage.setItem(XF_API_SECRET_KEY, key) } catch {} }
export function isXfConfigured(): boolean { return !!(getXfApiKey() && getXfApiSecret()) }

/**
 * 讯飞机器翻译 API v2
 * 文档: https://www.xfyun.cn/doc/nlp/xftrans/API.html
 * 端点: https://itrans.xfyun.cn/v2/its
 * 鉴权: HMAC-SHA256, headers="host date request-line digest"
 * Body: { common: { app_id }, business: { from, to }, data: { text: base64 } }
 * 注意: text 需要 base64 编码，且 base64 编码后大小不超过 1024 bytes
 */
export async function translateWithXf(
  text: string,
  from = 'en',
  to = 'zh',
  appId = ''
): Promise<string | null> {
  if (!isXfConfigured()) return null
  try {
    const dateStr = formatRFC1123(new Date())
    const apiKey = getXfApiKey()
    const apiSecret = getXfApiSecret()

    // Body: v2 格式，text 必须 base64 编码，compact JSON（无空格）
    const textB64 = btoa(text)
    const body = JSON.stringify({
      common: { app_id: appId },
      business: { from, to },
      data: { text: textB64 },
    }, null, 0) // 紧凑格式，无空格

    // Digest: SHA-256(body) 并 base64
    const bodyBytes = new TextEncoder().encode(body)
    const bodyHash = btoaBytes(sha256bytes(bodyBytes))
    const digest = `SHA-256=${bodyHash}`

    // v2 signature origin: host date request-line digest
    const signOrigin = `host: ${XF_HOST}\ndate: ${dateStr}\nPOST /v2/its HTTP/1.1\ndigest: ${digest}`
    const signature = hmacSha256(apiSecret, signOrigin)

    // Authorization header
    const authOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line digest", signature="${signature}"`
    const auth = authOrigin

    console.log('[Xunfei] body:', body)
    console.log('[Xunfei] digest:', digest)
    console.log('[Xunfei] signOrigin:', JSON.stringify(signOrigin))
    console.log('[Xunfei] signature:', signature)
    console.log('[Xunfei] apiKey:', apiKey)
    console.log('[Xunfei] xfAppId:', appId)
    console.log('[Xunfei] apiSecret:', apiSecret)
    console.log('[Xunfei] XF_API_URL:', XF_API_URL)

    const res = await fetch(XF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        // 浏览器环境无法手动设置 Host/Date（属于 forbidden headers），
        // 使用 X-Date 作为替代，讯飞 HMAC 鉴权也接受 x-date。
        'X-Date': dateStr,
        'Digest': digest,
        'Authorization': auth,
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
