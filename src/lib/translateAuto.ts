import { translateWithGoogle, getGoogleApiKey } from '@/lib/translate'
import { translateWithBaidu, isBaiduConfigured } from '@/lib/baiduTranslate'
import { translateWithYoudao, isYoudaoConfigured } from '@/lib/youdaoTranslate'
import { translateWithXf, isXfConfigured, getXfAppId } from '@/lib/xfTranslate'

export type ServiceKey = 'google' | 'baidu' | 'youdao' | 'xf'

const ENABLED_KEY = 'translation_services_enabled'

export function getEnabledServices(): Record<ServiceKey, boolean> {
  try {
    const raw = localStorage.getItem(ENABLED_KEY)
    if (!raw) return { google: true, baidu: true, youdao: true, xf: true }
    const val = JSON.parse(raw)
    return {
      google: val?.google !== false,
      baidu: val?.baidu !== false,
      youdao: val?.youdao !== false,
      xf: val?.xf !== false,
    }
  } catch {
    return { google: true, baidu: true, youdao: true, xf: true }
  }
}

export function isAnyTranslatorConfigured(): boolean {
  const enabled = getEnabledServices()
  return (
    (enabled.baidu && isBaiduConfigured()) ||
    (enabled.youdao && isYoudaoConfigured()) ||
    (enabled.xf && isXfConfigured() && !!getXfAppId()) ||
    (enabled.google && !!getGoogleApiKey())
  )
}

export const SERVICE_LABEL: Record<ServiceKey, string> = {
  google: 'Google 翻译',
  baidu: '百度翻译',
  youdao: '有道翻译',
  xf: '讯飞翻译',
}

export async function translateAuto(
  text: string,
  sourceLang: 'en' | 'zh' = 'en',
  targetLang: 'en' | 'zh' = 'zh'
): Promise<{ provider: ServiceKey; result: string } | null> {
  const enabled = getEnabledServices()

  // 优先级：百度 → 有道 → 讯飞 → Google（可按需调整）
  if (enabled.baidu && isBaiduConfigured()) {
    const r = await translateWithBaidu(text, sourceLang, targetLang)
    if (r) return { provider: 'baidu', result: r }
  }

  if (enabled.youdao && isYoudaoConfigured()) {
    const ydFrom = sourceLang === 'en' ? 'en' : 'auto'
    const ydTo = targetLang === 'zh' ? 'zh-CHS' : targetLang
    const r = await translateWithYoudao(text, ydFrom, ydTo)
    if (r) return { provider: 'youdao', result: r }
  }

  if (enabled.xf && isXfConfigured()) {
    const appId = getXfAppId()
    if (appId) {
      const r = await translateWithXf(text, sourceLang, targetLang, appId)
      if (r) return { provider: 'xf', result: r }
    }
  }

  if (enabled.google && getGoogleApiKey()) {
    const gTarget = targetLang === 'zh' ? 'zh-CN' : targetLang
    const gSource = sourceLang === 'zh' ? 'zh-CN' : sourceLang
    const r = await translateWithGoogle(text, gTarget, gSource)
    if (r) return { provider: 'google', result: r }
  }

  return null
}

