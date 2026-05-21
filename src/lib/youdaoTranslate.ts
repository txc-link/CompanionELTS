// ─── 网易有道智云翻译 API ────────────────────────────────────────────────
// 文档: https://ai.youdao.com/DOCSIRMA/html/trans/api/wbfy/index.html
// 签名方式: MD5(appId + input + salt + curtime + appSecret)
// signType: v3

const YD_APP_KEY_KEY = 'youdao_translate_app_key'
const YD_APP_SECRET_KEY = 'youdao_translate_app_secret'
const YD_API_URL = 'https://openapi.youdao.com/api'

// ─── Pure-JS SHA256 (RFC 4634) ───────────────────────────────────────────
function sha256(str: string): string {
  function rightRotate(n: number, r: number) { return (n >>> r) | (n << (32 - r)) }
  function ch(x: number, y: number, z: number) { return (x & y) ^ (~x & z) }
  function maj(x: number, y: number, z: number) { return (x & y) ^ (x & z) ^ (y & z) }
  function sigma0(x: number) { return rightRotate(x, 2) ^ rightRotate(x, 13) ^ rightRotate(x, 22) }
  function sigma1(x: number) { return rightRotate(x, 6) ^ rightRotate(x, 11) ^ rightRotate(x, 25) }
  function gamma0(x: number) { return rightRotate(x, 7) ^ rightRotate(x, 18) ^ (x >>> 3) }
  function gamma1(x: number) { return rightRotate(x, 17) ^ rightRotate(x, 19) ^ (x >>> 10) }

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
    return [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ]
  }

  function pad(msg: string): string {
    const len = msg.length
    const bits = len * 8
    msg += '\x80'
    while (msg.length % 64 !== 56) msg += '\x00'
    const view = new DataView(new ArrayBuffer(8))
    view.setUint32(4, bits, false)
    for (let i = 0; i < 8; i++) msg += String.fromCharCode(view.getUint8(i))
    return msg
  }

  function expand(block: string): number[] {
    const W: number[] = []
    for (let t = 0; t < 16; t++) W[t] = block.charCodeAt(t * 4) << 24 | block.charCodeAt(t * 4 + 1) << 16 | block.charCodeAt(t * 4 + 2) << 8 | block.charCodeAt(t * 4 + 3)
    for (let t = 16; t < 64; t++) W[t] = (gamma1(W[t - 2]) + W[t - 7] + gamma0(W[t - 15]) + W[t - 16]) >>> 0
    return W
  }

  const padded = pad(str)
  const h = initH()

  for (let i = 0; i < padded.length / 64; i++) {
    const block = padded.slice(i * 64, i * 64 + 64)
    const W = expand(block)
    let [a, b, c, d, e, f, g, hh] = h

    for (let t = 0; t < 64; t++) {
      const T1 = (hh + sigma1(e) + ch(e, f, g) + K[t] + W[t]) >>> 0
      const T2 = (sigma0(a) + maj(a, b, c)) >>> 0
      hh = g; g = f; f = e; e = (d + T1) >>> 0
      d = c; c = b; b = a; a = (T1 + T2) >>> 0
    }

    h[0] = (h[0] + a) >>> 0
    h[1] = (h[1] + b) >>> 0
    h[2] = (h[2] + c) >>> 0
    h[3] = (h[3] + d) >>> 0
    h[4] = (h[4] + e) >>> 0
    h[5] = (h[5] + f) >>> 0
    h[6] = (h[6] + g) >>> 0
    h[7] = (h[7] + hh) >>> 0
  }

  const hex = (n: number) => (n >>> 0).toString(16).padStart(8, '0')
  return h.map(hex).join('')
}

// ─── LocalStorage helpers ─────────────────────────────────────────────────
export function getYoudaoAppKey(): string {
  try { return localStorage.getItem(YD_APP_KEY_KEY) || '' } catch { return '' }
}
export function setYoudaoAppKey(key: string) {
  try { localStorage.setItem(YD_APP_KEY_KEY, key) } catch {}
}
export function getYoudaoAppSecret(): string {
  try { return localStorage.getItem(YD_APP_SECRET_KEY) || '' } catch { return '' }
}
export function setYoudaoAppSecret(key: string) {
  try { localStorage.setItem(YD_APP_SECRET_KEY, key) } catch {}
}
export function isYoudaoConfigured(): boolean {
  return !!(getYoudaoAppKey() && getYoudaoAppSecret())
}

/**
 * 有道智云翻译 v1 API
 * @param text 要翻译的文本
 * @param from 源语言（如 'en'）
 * @param to 目标语言（如 'zh-CHS'）
 */
export async function translateWithYoudao(
  text: string,
  from = 'auto',
  to = 'zh-CHS'
): Promise<string | null> {
  if (!isYoudaoConfigured()) return null
  try {
    const appKey = getYoudaoAppKey()
    const appSecret = getYoudaoAppSecret()
    const salt = String(Date.now())
    const curtime = Math.floor(Date.now() / 1000)

    // input: 前10个字符+文本长度+后10个字符（最多50字符）
    const input = text.length <= 10 ? text : text.slice(0, 10) + text.length + text.slice(-10)
    const signStr = appKey + input + salt + curtime + appSecret
    const sign = sha256(signStr)

    const body = new URLSearchParams({
      q: text,
      appKey,
      salt,
      curtime: String(curtime),
      sign,
      signType: 'v3',
      from,
      to,
      docType: 'json',
      vocabId: '',
    })

    const res = await fetch(YD_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    if (!res.ok) { console.warn('[Youdao] HTTP error:', res.status); return null }
    const data = await res.json()
    console.log('[Youdao] response:', JSON.stringify(data).substring(0, 200))

    // 成功: { "errorCode": "0", "translation": ["结果"] }
    if (data.errorCode !== '0') {
      console.warn('[Youdao] error:', data.errorCode)
      return null
    }
    return data?.translation?.[0] ?? null
  } catch {
    return null
  }
}