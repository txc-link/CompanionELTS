// ─── Google Translate API 服务 ──────────────────────────────────────────
// 使用 Google Cloud Translation v2 REST API (无需 SDK)
// 需要用户设置 API Key: /settings 页面可配置，存储在 localStorage

const GC_API_KEY_KEY = 'google_translate_api_key'

export function getGoogleApiKey(): string {
  try {
    return localStorage.getItem(GC_API_KEY_KEY) || ''
  } catch { return '' }
}

export function setGoogleApiKey(key: string) {
  try { localStorage.setItem(GC_API_KEY_KEY, key) } catch {}
}

/** 调用 Google Translate v2 REST API 翻译文本 */
export async function translateWithGoogle(
  text: string,
  targetLang = 'zh-CN',
  sourceLang = 'en'
): Promise<string | null> {
  const apiKey = getGoogleApiKey()
  if (!apiKey) return null

  try {
    const url = '/api/google/language/translate/v2'
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ q: text, target: targetLang, source: sourceLang, format: 'text', key: apiKey }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data?.data?.translations?.[0]?.translatedText || null
  } catch {
    return null
  }
}

/** 批量翻译（用于多个单词/短语） */
export async function batchTranslateWithGoogle(
  texts: string[],
  targetLang = 'zh-CN',
  sourceLang = 'en'
): Promise<Record<string, string>> {
  const apiKey = getGoogleApiKey()
  if (!apiKey || texts.length === 0) return {}

  try {
    const url = `https://translation.googleapis.com/language/translate/v2`
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ q: texts, target: targetLang, source: sourceLang, format: 'text', key: apiKey }),
    })
    if (!res.ok) return {}
    const data = await res.json()
    const translations: Record<string, string> = {}
    data?.data?.translations?.forEach((t: any, i: number) => {
      if (texts[i]) translations[texts[i]] = t.translatedText
    })
    return translations
  } catch {
    return {}
  }
}
