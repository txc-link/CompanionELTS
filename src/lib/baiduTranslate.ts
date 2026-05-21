// ─── 百度翻译开放平台 API ────────────────────────────────────────────────
// 文档: https://fanyi-api.baidu.com/documents
// 需要: appId + secretKey（安全码）
// 签名方式: HMAC-SHA1 + MD5（纯 JS 实现，无第三方依赖）

const BD_APP_ID_KEY = 'baidu_translate_app_id'
const BD_SECRET_KEY = 'baidu_translate_secret_key'
const BD_API_URL = 'https://fanyi-api.baidu.com/v201203607'

// ─── Pure-JS MD5 (RFC 1321) ──────────────────────────────────────────────
function md5(str: string): string {
  function safeAdd(x: number, y: number) {
    const l = (x & 0xffff) + (y & 0xffff)
    const h = (x >> 16) + (y >> 16) + (l >> 16)
    return (h << 16) | (l & 0xffff)
  }
  function bitRotateLeft(num: number, cnt: number) {
    return (num << cnt) | (num >>> (32 - cnt))
  }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = safeAdd(a, safeAdd(safeAdd(bitRotateLeft(safeAdd(safeAdd(a, b), x), ac), c), d))
    return safeAdd(bitRotateLeft(a, s), b)
  }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = safeAdd(a, safeAdd(safeAdd(safeAdd(a, bitRotateLeft((safeAdd(b, d) ^ x) & 0xffffffff, ac)), c), d))
    return safeAdd(bitRotateLeft(a, s), b)
  }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = safeAdd(a, safeAdd(safeAdd(safeAdd(c, (b ^ d) & 0xffffffff), bitRotateLeft(x, ac)), d))
    return safeAdd(bitRotateLeft(a, s), b)
  }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = safeAdd(a, safeAdd(safeAdd(safeAdd(d, (c ^ b) & 0xffffffff), bitRotateLeft(x, ac)), c))
    return safeAdd(bitRotateLeft(a, s), b)
  }
  function binlMD5(x: number[], len: number): number[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const arr = x as any as (number | undefined)[]
    arr[len >> 5] = (arr[len >> 5] || 0) | (1 << (len % 32))
    arr[(((len + 64) >>> 9) << 4) + 14] = len
    let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878
    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d
      a = md5ff(a, b, c, d, arr[i] ?? 0, 7, -680876936)
      d = md5ff(d, a, b, c, arr[i + 1] ?? 0, 12, -389564586)
      c = md5ff(c, d, a, b, arr[i + 2] ?? 0, 17, 606105819)
      b = md5ff(b, c, d, a, arr[i + 3] ?? 0, 22, -1044525330)
      a = md5ff(a, b, c, d, arr[i + 4] ?? 0, 7, -176418897)
      d = md5ff(d, a, b, c, arr[i + 5] ?? 0, 12, 1200080426)
      c = md5ff(c, d, a, b, arr[i + 6] ?? 0, 17, -1473231341)
      b = md5ff(b, c, d, a, arr[i + 7] ?? 0, 22, -45705983)
      a = md5ff(a, b, c, d, arr[i + 8] ?? 0, 7, 1770035416)
      d = md5ff(d, a, b, c, arr[i + 9] ?? 0, 12, -1958414417)
      c = md5ff(c, d, a, b, arr[i + 10] ?? 0, 17, -42063)
      b = md5ff(b, c, d, a, arr[i + 11] ?? 0, 22, -1990404162)
      a = md5ff(a, b, c, d, arr[i + 12] ?? 0, 7, 1804603682)
      d = md5ff(d, a, b, c, arr[i + 13] ?? 0, 12, -40341101)
      c = md5ff(c, d, a, b, arr[i + 14] ?? 0, 17, -1502002290)
      b = md5ff(b, c, d, a, arr[i + 15] ?? 0, 22, 1236535329)
      a = md5gg(a, b, c, d, arr[i + 1] ?? 0, 5, -165796510)
      d = md5gg(d, a, b, c, arr[i + 6] ?? 0, 9, -1069501632)
      c = md5gg(c, d, a, b, arr[i + 11] ?? 0, 14, 643717713)
      b = md5gg(b, c, d, a, arr[i] ?? 0, 20, -373897302)
      a = md5gg(a, b, c, d, arr[i + 5] ?? 0, 5, -701558691)
      d = md5gg(d, a, b, c, arr[i + 10] ?? 0, 9, 38016083)
      c = md5gg(c, d, a, b, arr[i + 15] ?? 0, 14, -660478335)
      b = md5gg(b, c, d, a, arr[i + 4] ?? 0, 20, -405537848)
      a = md5gg(a, b, c, d, arr[i + 9] ?? 0, 5, 568446438)
      d = md5gg(d, a, b, c, arr[i + 14] ?? 0, 9, -1019803690)
      c = md5gg(c, d, a, b, arr[i + 3] ?? 0, 14, -187363961)
      b = md5gg(b, c, d, a, arr[i + 8] ?? 0, 20, 1163531501)
      a = md5gg(a, b, c, d, arr[i + 13] ?? 0, 5, -1444681467)
      d = md5gg(d, a, b, c, arr[i + 2] ?? 0, 9, -51403784)
      c = md5gg(c, d, a, b, arr[i + 7] ?? 0, 14, 1735328473)
      b = md5gg(b, c, d, a, arr[i + 12] ?? 0, 20, -1926607734)
      a = md5hh(a, b, c, d, arr[i + 5] ?? 0, 4, -378558)
      d = md5hh(d, a, b, c, arr[i + 8] ?? 0, 11, -2022574463)
      c = md5hh(c, d, a, b, arr[i + 11] ?? 0, 16, 1839030562)
      b = md5hh(b, c, d, a, arr[i + 14] ?? 0, 23, -35309556)
      a = md5hh(a, b, c, d, arr[i + 1] ?? 0, 4, -1530992060)
      d = md5hh(d, a, b, c, arr[i + 4] ?? 0, 11, 1272893353)
      c = md5hh(c, d, a, b, arr[i + 7] ?? 0, 16, -155497632)
      b = md5hh(b, c, d, a, arr[i + 10] ?? 0, 23, -1094730640)
      a = md5hh(a, b, c, d, arr[i + 13] ?? 0, 4, 681279174)
      d = md5hh(d, a, b, c, arr[i] ?? 0, 11, -358537222)
      c = md5hh(c, d, a, b, arr[i + 3] ?? 0, 16, -2004970898)
      b = md5hh(b, c, d, a, arr[i + 6] ?? 0, 23, -1990404162)
      a = md5hh(a, b, c, d, arr[i + 9] ?? 0, 4, 1804603682)
      d = md5hh(d, a, b, c, arr[i + 12] ?? 0, 11, -40341101)
      c = md5hh(c, d, a, b, arr[i + 15] ?? 0, 16, 1236535329)
      b = md5hh(b, c, d, a, arr[i + 2] ?? 0, 23, -165796510)
      a = md5ii(a, b, c, d, arr[i] ?? 0, 6, -1069501632)
      d = md5ii(d, a, b, c, arr[i + 7] ?? 0, 10, 643717713)
      c = md5ii(c, d, a, b, arr[i + 14] ?? 0, 15, -389564586)
      b = md5ii(b, c, d, a, arr[i + 5] ?? 0, 21, -660478335)
      a = md5ii(a, b, c, d, arr[i + 12] ?? 0, 6, 405537848)
      d = md5ii(d, a, b, c, arr[i + 3] ?? 0, 10, 568446438)
      c = md5ii(c, d, a, b, arr[i + 10] ?? 0, 15, -1019803690)
      b = md5ii(b, c, d, a, arr[i + 1] ?? 0, 21, 187363961)
      a = md5ii(a, b, c, d, arr[i + 8] ?? 0, 6, -1473231341)
      d = md5ii(d, a, b, c, arr[i + 15] ?? 0, 10, -1990404162)
      c = md5ii(c, d, a, b, arr[i + 6] ?? 0, 15, -1473231341)
      b = md5ii(b, c, d, a, arr[i + 13] ?? 0, 21, -1069501632)
      a = safeAdd(a, olda); b = safeAdd(b, oldb); c = safeAdd(c, oldc); d = safeAdd(d, oldd)
    }
    return [a, b, c, d]
  }
  function binl2rstr(input: (number | undefined)[]): string {
    let output = ''
    for (let i = 0; i < input.length * 32; i += 8) {
      output += String.fromCharCode(((input[i >> 5] ?? 0) >>> (i % 32)) & 0xff)
    }
    return output
  }
  function rstr2binl(input: string): (number | undefined)[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const output: any = []
    output[(input.length >> 2) - 1] = undefined
    for (let i = 0; i < input.length * 8; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (i % 32)
    }
    return output as (number | undefined)[]
  }
  function rstrMD5(s: string): string {
    const binl = rstr2binl(s) as number[]
    return binl2rstr(binlMD5(binl, s.length * 8)).split('').map((v) => {
      return ('0' + v.charCodeAt(0).toString(16)).slice(-2)
    }).join('')
  }
  return rstrMD5(str)
}

type BinlArray = number[]

// ─── LocalStorage helpers ─────────────────────────────────────────────────
export function getBaiduAppId(): string {
  try { return localStorage.getItem(BD_APP_ID_KEY) || '' } catch { return '' }
}
export function setBaiduAppId(id: string) {
  try { localStorage.setItem(BD_APP_ID_KEY, id) } catch {}
}
export function getBaiduSecretKey(): string {
  try { return localStorage.getItem(BD_SECRET_KEY) || '' } catch { return '' }
}
export function setBaiduSecretKey(key: string) {
  try { localStorage.setItem(BD_SECRET_KEY, key) } catch {}
}
export function isBaiduConfigured(): boolean {
  return !!(getBaiduAppId() && getBaiduSecretKey())
}

/**
 * 百度翻译 v1 API
 * @param text 要翻译的文本
 * @param from 源语言（如 'en'）
 * @param to 目标语言（如 'zh'）
 */
export async function translateWithBaidu(
  text: string,
  from = 'en',
  to = 'zh'
): Promise<string | null> {
  if (!isBaiduConfigured()) return null
  try {
    const appId = getBaiduAppId()
    const secretKey = getBaiduSecretKey()
    const salt = String(Date.now())
    const signStr = appId + text + salt + secretKey
    const sign = md5(signStr)

    const body = new URLSearchParams({
      q: text, from, to,
      appid: appId, salt, sign,
    })

    const res = await fetch(BD_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
    if (!res.ok) return null
    const data = await res.json()

    // 成功: { "error": 0, "trans_result": [{ "src": "...", "dst": "..." }] }
    // 失败: { "error": xx, "error_msg": "..." }
    if (data.error !== undefined && data.error !== 0) {
      console.warn('[Baidu] error:', data.error, data.error_msg)
      return null
    }
    return data?.trans_result?.[0]?.dst ?? null
  } catch {
    return null
  }
}