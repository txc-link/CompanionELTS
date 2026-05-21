// ─── 百度翻译开放平台 API ────────────────────────────────────────────────
// 文档: https://console.bce.baidu.com/
// 验证方式: OAuth2 client_credentials (client_id=API Key, client_secret=Secret Key)
// 端点: https://aip.baidubce.com/oauth/2.0/token (获取 token)
//       https://aip.baidubce.com/rpc/2.0/mt/trans/v1 (翻译)

const BD_API_KEY_KEY = 'baidu_translate_api_key'
const BD_SECRET_KEY = 'baidu_translate_secret_key'
const BD_TOKEN_KEY = 'baidu_translate_access_token'
const BD_TOKEN_EXPIRY_KEY = 'baidu_translate_token_expiry'
const BD_TOKEN_URL = 'https://aip.baidubce.com/oauth/2.0/token'
const BD_TRANS_URL = 'https://aip.baidubce.com/rpc/2.0/mt/trans/v1'

// ─── LocalStorage helpers ─────────────────────────────────────────────────
export function getBaiduApiKey(): string {
  try { return localStorage.getItem(BD_API_KEY_KEY) || '' } catch { return '' }
}
export function setBaiduApiKey(key: string) {
  try { localStorage.setItem(BD_API_KEY_KEY, key) } catch {}
}
export function getBaiduSecretKey(): string {
  try { return localStorage.getItem(BD_SECRET_KEY) || '' } catch { return '' }
}
export function setBaiduSecretKey(key: string) {
  try { localStorage.setItem(BD_SECRET_KEY, key) } catch {}
}
export function isBaiduConfigured(): boolean {
  return !!(getBaiduApiKey() && getBaiduSecretKey())
}

/** 获取缓存的 access_token（30天有效期） */
function getCachedToken(): string | null {
  try {
    const token = localStorage.getItem(BD_TOKEN_KEY)
    const expiry = parseInt(localStorage.getItem(BD_TOKEN_EXPIRY_KEY) || '0')
    if (token && Date.now() < expiry - 60000) return token // 提前1分钟过期
  } catch { /* ignore */ }
  return null
}
function setCachedToken(token: string, expiresIn: number) {
  try {
    localStorage.setItem(BD_TOKEN_KEY, token)
    localStorage.setItem(BD_TOKEN_EXPIRY_KEY, String(Date.now() + expiresIn * 1000))
  } catch { /* ignore */ }
}

/**
 * 获取百度 access_token (OAuth2 client_credentials)
 */
async function getAccessToken(): Promise<string | null> {
  const apiKey = getBaiduApiKey()
  const secretKey = getBaiduSecretKey()
  if (!apiKey || !secretKey) return null

  try {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: secretKey,
    })
    const res = await fetch(`${BD_TOKEN_URL}?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.error) {
      console.warn('[Baidu OAuth] error:', data.error, data.error_description)
      return null
    }
    if (data.access_token) {
      setCachedToken(data.access_token, data.expires_in || 2592000)
      return data.access_token
    }
    return null
  } catch {
    return null
  }
}

/**
 * 百度翻译 API (OAuth2 + Bearer token)
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
    // 优先使用缓存 token
    let token = getCachedToken()
    if (!token) {
      token = await getAccessToken()
      if (!token) return null
    }

    const res = await fetch(BD_TRANS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        q: text,
        from,
        to,
      }),
    })

    if (!res.ok) {
      // 401 → token 过期，重新获取
      if (res.status === 401) {
        localStorage.removeItem(BD_TOKEN_KEY)
        localStorage.removeItem(BD_TOKEN_EXPIRY_KEY)
        const newToken = await getAccessToken()
        if (!newToken) return null
        return translateWithBaidu(text, from, to) // retry once
      }
      return null
    }

    const data = await res.json()

    // 错误: { "error_code": "...", "error_msg": "..." }
    if (data.error_code !== undefined) {
      console.warn('[Baidu Translate] error:', data.error_code, data.error_msg)
      return null
    }

    // 成功: { "result": { "trans_list": [{ "dst": "..." }] } }
    const transList = data?.result?.trans_list
    if (transList && transList.length > 0) {
      return transList.map((r: { dst: string }) => r.dst).join('\n')
    }
    return null
  } catch {
    return null
  }
}
