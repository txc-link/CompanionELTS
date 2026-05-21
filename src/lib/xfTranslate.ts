// ─── 讯飞机器翻译（新）API ──────────────────────────────────────────────
// 文档: https://www.xfyun.cn/doc/nlp/xftrans_new/API.html
// 鉴权方式: HMAC-SHA256，签名放在 URL 参数中
// 请求地址: https://itrans.xf-yun.com/v1/its

const XF_API_KEY_KEY = 'xftranslate_api_key'
const XF_API_SECRET_KEY = 'xftranslate_api_secret'
const XF_API_URL = 'https://itrans.xf-yun.com/v1/its'

// ─── Helpers ─────────────────────────────────────────────────────────────

/** 格式化 RFC1123 时间戳 */
function formatRFC1123Date(d: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${days[d.getUTCDay()]}, ${String(d.getUTCDate()).padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}:${String(d.getUTCSeconds()).padStart(2, '0')} GMT`
}

/** Base64 编码 */
function base64Encode(str: string): string {
  const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  let result = ''
  const bytes = new TextEncoder().encode(str)
  for (let i = 0; i < bytes.length; i += 3) {
    const b1 = bytes[i], b2 = bytes[i + 1] ?? 0, b3 = bytes[i + 2] ?? 0
    result += b64chars[b1 >> 2]
    result += b64chars[((b1 & 3) << 4) | (b2 >> 4)]
    result += bytes[i + 1] !== undefined ? b64chars[((b2 & 15) << 2) | (b3 >> 6)] : '='
    result += bytes[i + 2] !== undefined ? b64chars[b3 & 63] : '='
  }
  return result
}

/** 纯 JS HMAC-SHA256 */
function hmacSha256(key: string, message: string): Uint8Array {
  function padKey(k: string): Uint8Array {
    const keyBytes = new TextEncoder().encode(k)
    if (keyBytes.length > 64) {
      // 如果密钥超过64字节，先 SHA256 压缩
      const sha256Out = sha256bytes(keyBytes)
      const padded = new Uint8Array(64)
      sha256Out.forEach((v, i) => { padded[i] = v })
      return padded
    }
    const padded = new Uint8Array(64)
    keyBytes.forEach((v, i) => { padded[i] = v })
    return padded
  }

  function sha256bytes(dataBytes: Uint8Array): Uint8Array {
    function rotr(n: number, r: number) { return (n >>> r) | (n << (32 - r)) }
    function ch(x: number, y: number, z: number) { return (x & y) ^ (~x & z) }
    function maj(x: number, y: number, z: number) { return (x & y) ^ (x & z) ^ (y & z) }
    function sigma0(x: number) { return rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22) }
    function sigma1(x: number) { return rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25) }
    function gamma0(x: number) { return rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3) }
    function gamma1(x: number) { return rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10) }

    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ]

    function initH() {
      return [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]
    }

    function pad(data: Uint8Array): Uint8Array {
      const len = data.length
      const bits = len * 8
      const padded = new Uint8Array(Math.ceil((len + 9) / 64) * 64)
      data.forEach((v, i) => { padded[i] = v })
      padded[len] = 0x80
      const view = new DataView(new ArrayBuffer(8))
      view.setUint32(4, bits, false)
      for (let i = 0; i < 8; i++) padded[padded.length - 8 + i] = view.getUint8(i)
      return padded
    }

    function expand(block: Uint8Array): number[] {
      const W: number[] = []
      for (let t = 0; t < 16; t++) W[t] = (block[t * 4] << 24 | block[t * 4 + 1] << 16 | block[t * 4 + 2] << 8 | block[t * 4 + 3]) >>> 0
      for (let t = 16; t < 64; t++) W[t] = (gamma1(W[t - 2]) + W[t - 7] + gamma0(W[t - 15]) + W[t - 16]) >>> 0
      return W
    }

    const padded = pad(dataBytes)
    let [a, b, c, d, e, f, g, hh] = initH()

    for (let i = 0; i < padded.length / 64; i++) {
      const block = padded.slice(i * 64, i * 64 + 64)
      const W = expand(block)
      const [oa, ob, oc, od, oe, of, og, oh] = [a, b, c, d, e, f, g, hh]
      for (let t = 0; t < 64; t++) {
        const T1 = (hh + sigma1(e) + ch(e, f, g) + K[t] + W[t]) >>> 0
        const T2 = (sigma0(a) + maj(a, b, c)) >>> 0
        hh = g; g = f; f = e; e = (d + T1) >>> 0; d = c; c = b; b = a; a = (T1 + T2) >>> 0
      }
      a = (a + oa) >>> 0; b = (b + ob) >>> 0; c = (c + oc) >>> 0; d = (d + od) >>> 0
      e = (e + oe) >>> 0; f = (f + of) >>> 0; g = (g + og) >>> 0; hh = (hh + oh) >>> 0
    }

    const out = new Uint8Array(32)
    const view = new DataView(out.buffer)
    ;[a, b, c, d, e, f, g, hh].forEach((v, i) => view.setUint32(i * 4, v, false))
    return out
  }

  const keyed = padKey(key)
  const messageBytes = new TextEncoder().encode(message)
  const innerPad = new Uint8Array(64)
  const outerPad = new Uint8Array(64)
  for (let i = 0; i < 64; i++) {
    innerPad[i] = 0x36 ^ keyed[i]
    outerPad[i] = 0x5c ^ keyed[i]
  }
  const innerData = new Uint8Array(64 + messageBytes.length)
  innerPad.forEach((v, i) => { innerData[i] = v })
  messageBytes.forEach((v, i) => { innerData[64 + i] = v })
  const innerHash = sha256bytes(innerData)
  const outerData = new Uint8Array(64 + 32)
  outerPad.forEach((v, i) => { outerData[i] = v })
  innerHash.forEach((v, i) => { outerData[64 + i] = v })
  return sha256bytes(outerData)
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────
export function getXfApiKey(): string {
  try { return localStorage.getItem(XF_API_KEY_KEY) || '' } catch { return '' }
}
export function setXfApiKey(key: string) {
  try { localStorage.setItem(XF_API_KEY_KEY, key) } catch {}
}
export function getXfApiSecret(): string {
  try { return localStorage.getItem(XF_API_SECRET_KEY) || '' } catch { return '' }
}
export function setXfApiSecret(key: string) {
  try { localStorage.setItem(XF_API_SECRET_KEY, key) } catch {}
}
export function isXfConfigured(): boolean {
  return !!(getXfApiKey() && getXfApiSecret())
}

/**
 * 讯飞机器翻译（新）API
 * @param text 要翻译的文本
 * @param from 源语言（如 'en'）
 * @param to 目标语言（如 'zh'）
 */
export async function translateWithXf(
  text: string,
  from = 'en',
  to = 'zh'
): Promise<string | null> {
  if (!isXfConfigured()) return null
  try {
    const apiKey = getXfApiKey()
    const apiSecret = getXfApiSecret()

    const host = 'itrans.xf-yun.com'
    const dateStr = formatRFC1123Date(new Date())

    // signature 计算
    const signatureOrigin = `host: ${host}\ndate: ${dateStr}\nPOST /v1/its HTTP/1.1`
    const hmacBytes = hmacSha256(apiSecret, signatureOrigin)
    const signature = base64Encode(String.fromCharCode(...Array.from(hmacBytes)))
    const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`
    const authorization = base64Encode(authorizationOrigin)

    const url = `${XF_API_URL}?authorization=${encodeURIComponent(authorization)}&host=${encodeURIComponent(host)}&date=${encodeURIComponent(dateStr)}`

    const body = JSON.stringify({
      header: { appid: 'unknown', ua: 'translate/1.0', ql: 1 },
      payload: {
        business: { from, to },
        data: { text },
      },
    })

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
    if (!res.ok) return null
    const json = await res.json()

    // 讯飞返回: { "code": 0, "data": { "result": { "trans_result": [{ "dst": "..." }] } } }
    const result = json?.data?.result
    if (result?.trans_result) {
      return result.trans_result.map((r: { dst: string }) => r.dst).join('\n')
    }
    return null
  } catch {
    return null
  }
}