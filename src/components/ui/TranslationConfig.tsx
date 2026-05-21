import { useState, useEffect, useCallback } from 'react'
import { getGoogleApiKey, setGoogleApiKey, translateWithGoogle } from '@/lib/translate'
import { getBaiduAppId, setBaiduAppId, getBaiduSecretKey, setBaiduSecretKey, isBaiduConfigured, translateWithBaidu } from '@/lib/baiduTranslate'
import { getYoudaoAppKey, setYoudaoAppKey, getYoudaoAppSecret, setYoudaoAppSecret, isYoudaoConfigured, translateWithYoudao } from '@/lib/youdaoTranslate'
import { getXfApiKey, setXfApiKey, getXfApiSecret, setXfApiSecret, isXfConfigured, translateWithXf } from '@/lib/xfTranslate'
import { cn } from '@/utils/cn'

interface TranslationConfigProps {
  className?: string
}

type ActiveService = 'google' | 'baidu' | 'youdao' | 'xf'

// 服务配置项
const SERVICES: { key: ActiveService; label: string; icon: string }[] = [
  { key: 'google', label: 'Google', icon: '🔤' },
  { key: 'baidu', label: '百度', icon: '🌸' },
  { key: 'youdao', label: '有道', icon: '📖' },
  { key: 'xf', label: '讯飞', icon: '🎤' },
]

export default function TranslationConfig({ className }: TranslationConfigProps) {
  // Google
  const [googleApiKey, setGoogleApiKeyState] = useState('')
  const [isGoogleConfigured, setIsGoogleConfigured] = useState(false)
  const [isGoogleSaving, setIsGoogleSaving] = useState(false)

  // Baidu
  const [baiduAppId, setBaiduAppIdState] = useState('')
  const [baiduSecretKey, setBaiduSecretKeyState] = useState('')
  const [isBaiduConfiguredState, setIsBaiduConfiguredState] = useState(false)
  const [isBaiduSaving, setIsBaiduSaving] = useState(false)

  // Youdao
  const [youdaoAppKey, setYoudaoAppKeyState] = useState('')
  const [youdaoAppSecret, setYoudaoAppSecretState] = useState('')
  const [isYoudaoConfiguredState, setIsYoudaoConfiguredState] = useState(false)
  const [isYoudaoSaving, setIsYoudaoSaving] = useState(false)

  // Xunfei
  const [xfApiKey, setXfApiKeyState] = useState('')
  const [xfApiSecret, setXfApiSecretState] = useState('')
  const [isXfConfiguredState, setIsXfConfiguredState] = useState(false)
  const [isXfSaving, setIsXfSaving] = useState(false)

  // Test
  const [activeService, setActiveService] = useState<ActiveService>('google')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // Load saved credentials
  useEffect(() => {
    try {
      setGoogleApiKeyState(getGoogleApiKey())
      setIsGoogleConfigured(!!getGoogleApiKey())
      setBaiduAppIdState(getBaiduAppId())
      setBaiduSecretKeyState(getBaiduSecretKey())
      setIsBaiduConfiguredState(isBaiduConfigured())
      setYoudaoAppKeyState(getYoudaoAppKey())
      setYoudaoAppSecretState(getYoudaoAppSecret())
      setIsYoudaoConfiguredState(isYoudaoConfigured())
      setXfApiKeyState(getXfApiKey())
      setXfApiSecretState(getXfApiSecret())
      setIsXfConfiguredState(isXfConfigured())
    } catch { /* localStorage access failed */ }
  }, [])

  const handleSaveGoogle = useCallback(() => {
    setIsGoogleSaving(true)
    setTestResult(null)
    try {
      setGoogleApiKey(googleApiKey.trim())
      setIsGoogleConfigured(!!googleApiKey.trim())
      setTestResult({ success: true, message: googleApiKey.trim() ? 'Google API Key 已保存' : 'Google API Key 已清除' })
    } catch {
      setTestResult({ success: false, message: '保存失败' })
    } finally {
      setIsGoogleSaving(false)
      setTimeout(() => setTestResult(null), 3000)
    }
  }, [googleApiKey])

  const handleSaveBaidu = useCallback(() => {
    setIsBaiduSaving(true)
    setTestResult(null)
    try {
      setBaiduAppId(baiduAppId.trim())
      setBaiduSecretKey(baiduSecretKey.trim())
      setIsBaiduConfiguredState(isBaiduConfigured())
      setTestResult({ success: true, message: baiduAppId.trim() && baiduSecretKey.trim() ? '百度翻译凭证已保存' : '百度翻译凭证已清除' })
    } catch {
      setTestResult({ success: false, message: '保存失败' })
    } finally {
      setIsBaiduSaving(false)
      setTimeout(() => setTestResult(null), 3000)
    }
  }, [baiduAppId, baiduSecretKey])

  const handleSaveYoudao = useCallback(() => {
    setIsYoudaoSaving(true)
    setTestResult(null)
    try {
      setYoudaoAppKey(youdaoAppKey.trim())
      setYoudaoAppSecret(youdaoAppSecret.trim())
      setIsYoudaoConfiguredState(isYoudaoConfigured())
      setTestResult({ success: true, message: youdaoAppKey.trim() && youdaoAppSecret.trim() ? '有道翻译凭证已保存' : '有道翻译凭证已清除' })
    } catch {
      setTestResult({ success: false, message: '保存失败' })
    } finally {
      setIsYoudaoSaving(false)
      setTimeout(() => setTestResult(null), 3000)
    }
  }, [youdaoAppKey, youdaoAppSecret])

  const handleSaveXf = useCallback(() => {
    setIsXfSaving(true)
    setTestResult(null)
    try {
      setXfApiKey(xfApiKey.trim())
      setXfApiSecret(xfApiSecret.trim())
      setIsXfConfiguredState(isXfConfigured())
      setTestResult({ success: true, message: xfApiKey.trim() && xfApiSecret.trim() ? '讯飞翻译凭证已保存' : '讯飞翻译凭证已清除' })
    } catch {
      setTestResult({ success: false, message: '保存失败' })
    } finally {
      setIsXfSaving(false)
      setTimeout(() => setTestResult(null), 3000)
    }
  }, [xfApiKey, xfApiSecret])

  const handleTestTranslation = useCallback(async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      let result: string | null = null
      let ok = false

      if (activeService === 'google') {
        if (isGoogleConfigured) {
          result = await translateWithGoogle('hello world', 'zh-CN')
          ok = !!result
          setTestResult(result ? { success: true, message: `Google 翻译成功: "${result}"` } : { success: false, message: 'Google 翻译失败，请检查 API Key' })
        } else {
          setTestResult({ success: false, message: '请先配置 Google 翻译凭证' })
        }
      } else if (activeService === 'baidu') {
        if (isBaiduConfigured()) {
          result = await translateWithBaidu('hello world', 'en', 'zh')
          ok = !!result
          setTestResult(result ? { success: true, message: `百度翻译成功: "${result}"` } : { success: false, message: '百度翻译失败，请检查 App ID 和 Secret Key' })
        } else {
          setTestResult({ success: false, message: '请先配置百度翻译凭证' })
        }
      } else if (activeService === 'youdao') {
        if (isYoudaoConfigured()) {
          result = await translateWithYoudao('hello world', 'auto', 'zh-CHS')
          ok = !!result
          setTestResult(result ? { success: true, message: `有道翻译成功: "${result}"` } : { success: false, message: '有道翻译失败，请检查 App Key 和 App Secret' })
        } else {
          setTestResult({ success: false, message: '请先配置有道翻译凭证' })
        }
      } else if (activeService === 'xf') {
        if (isXfConfigured()) {
          result = await translateWithXf('hello world', 'en', 'zh')
          ok = !!result
          setTestResult(result ? { success: true, message: `讯飞翻译成功: "${result}"` } : { success: false, message: '讯飞翻译失败，请检查 API Key 和 API Secret' })
        } else {
          setTestResult({ success: false, message: '请先配置讯飞翻译凭证' })
        }
      }
    } catch {
      setTestResult({ success: false, message: '翻译请求失败，请稍后重试' })
    } finally {
      setIsTesting(false)
      setTimeout(() => setTestResult(null), 5000)
    }
  }, [activeService, isGoogleConfigured])

  const isConfigured = (key: ActiveService) => {
    if (key === 'google') return isGoogleConfigured
    if (key === 'baidu') return isBaiduConfiguredState
    if (key === 'youdao') return isYoudaoConfiguredState
    if (key === 'xf') return isXfConfiguredState
    return false
  }

  const isSaving = (key: ActiveService) => {
    if (key === 'google') return isGoogleSaving
    if (key === 'baidu') return isBaiduSaving
    if (key === 'youdao') return isYoudaoSaving
    if (key === 'xf') return isXfSaving
    return false
  }

  const serviceLabels: Record<ActiveService, string> = {
    google: 'Google',
    baidu: '百度',
    youdao: '有道',
    xf: '讯飞',
  }

  return (
    <div className={cn('rounded-[16px] border border-border-subtle bg-bg-card p-[18px]', className)}>
      <div className="text-xs font-semibold text-text-muted uppercase tracking-[0.7px] mb-[14px] flex items-center gap-1.5">
        🌐 翻译配置
      </div>

      <div className="space-y-5">
        {/* Google Translate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', isGoogleConfigured ? 'bg-accent-green' : 'bg-text-muted/40')} />
              <span className="text-sm text-text-secondary">Google Translate</span>
            </div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', isGoogleConfigured ? 'bg-accent-green/15 text-accent-green' : 'bg-bg-elevated text-text-muted')}>
              {isGoogleConfigured ? '已配置' : '未配置'}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="google-api-key" className="text-xs font-medium text-text-secondary">API Key</label>
            <input
              id="google-api-key" type="password" value={googleApiKey}
              onChange={(e) => { setGoogleApiKeyState(e.target.value); setIsGoogleConfigured(false) }}
              placeholder="输入 Google Cloud API Key"
              className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
            />
          </div>
          <button onClick={handleSaveGoogle} disabled={isGoogleSaving} className={cn('px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 bg-accent-green text-bg-primary hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed')}>
            {isGoogleSaving ? '保存中...' : '保存'}
          </button>
          <p className="text-[10px] text-text-muted leading-relaxed">
            获取：Google Cloud Console → API 和服务 → 凭据 → 创建 API 密钥
          </p>
        </div>

        <div className="border-t border-border-subtle" />

        {/* Baidu Translate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', isBaiduConfiguredState ? 'bg-accent-green' : 'bg-text-muted/40')} />
              <span className="text-sm text-text-secondary">百度翻译</span>
            </div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', isBaiduConfiguredState ? 'bg-accent-green/15 text-accent-green' : 'bg-bg-elevated text-text-muted')}>
              {isBaiduConfiguredState ? '已配置' : '未配置'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="baidu-app-id" className="text-xs font-medium text-text-secondary">App ID</label>
              <input
                id="baidu-app-id" type="text" value={baiduAppId}
                onChange={(e) => { setBaiduAppIdState(e.target.value); setIsBaiduConfiguredState(false) }}
                placeholder="百度 App ID"
                className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="baidu-secret-key" className="text-xs font-medium text-text-secondary">Secret Key</label>
              <input
                id="baidu-secret-key" type="password" value={baiduSecretKey}
                onChange={(e) => { setBaiduSecretKeyState(e.target.value); setIsBaiduConfiguredState(false) }}
                placeholder="安全码"
                className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
              />
            </div>
          </div>
          <button onClick={handleSaveBaidu} disabled={isBaiduSaving} className={cn('px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 bg-accent-green text-bg-primary hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed')}>
            {isBaiduSaving ? '保存中...' : '保存'}
          </button>
          <p className="text-[10px] text-text-muted leading-relaxed">
            获取：百度翻译开放平台 (fanyi-api.baidu.com) → 注册 → 创建应用 → 获取 App ID 和 Secret Key
          </p>
        </div>

        <div className="border-t border-border-subtle" />

        {/* Youdao Translate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', isYoudaoConfiguredState ? 'bg-accent-green' : 'bg-text-muted/40')} />
              <span className="text-sm text-text-secondary">网易有道</span>
            </div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', isYoudaoConfiguredState ? 'bg-accent-green/15 text-accent-green' : 'bg-bg-elevated text-text-muted')}>
              {isYoudaoConfiguredState ? '已配置' : '未配置'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="youdao-app-key" className="text-xs font-medium text-text-secondary">App Key</label>
              <input
                id="youdao-app-key" type="text" value={youdaoAppKey}
                onChange={(e) => { setYoudaoAppKeyState(e.target.value); setIsYoudaoConfiguredState(false) }}
                placeholder="有道 App Key"
                className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="youdao-app-secret" className="text-xs font-medium text-text-secondary">App Secret</label>
              <input
                id="youdao-app-secret" type="password" value={youdaoAppSecret}
                onChange={(e) => { setYoudaoAppSecretState(e.target.value); setIsYoudaoConfiguredState(false) }}
                placeholder="应用密钥"
                className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
              />
            </div>
          </div>
          <button onClick={handleSaveYoudao} disabled={isYoudaoSaving} className={cn('px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 bg-accent-green text-bg-primary hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed')}>
            {isYoudaoSaving ? '保存中...' : '保存'}
          </button>
          <p className="text-[10px] text-text-muted leading-relaxed">
            获取：有道智云 AI 开放平台 (ai.youdao.com) → 注册 → 创建应用 → 获取 App Key 和 App Secret
          </p>
        </div>

        <div className="border-t border-border-subtle" />

        {/* Xunfei Translate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full', isXfConfiguredState ? 'bg-accent-green' : 'bg-text-muted/40')} />
              <span className="text-sm text-text-secondary">讯飞翻译</span>
            </div>
            <span className={cn('text-xs px-2 py-0.5 rounded-full', isXfConfiguredState ? 'bg-accent-green/15 text-accent-green' : 'bg-bg-elevated text-text-muted')}>
              {isXfConfiguredState ? '已配置' : '未配置'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="xf-api-key" className="text-xs font-medium text-text-secondary">API Key</label>
              <input
                id="xf-api-key" type="text" value={xfApiKey}
                onChange={(e) => { setXfApiKeyState(e.target.value); setIsXfConfiguredState(false) }}
                placeholder="讯飞 API Key"
                className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="xf-api-secret" className="text-xs font-medium text-text-secondary">API Secret</label>
              <input
                id="xf-api-secret" type="password" value={xfApiSecret}
                onChange={(e) => { setXfApiSecretState(e.target.value); setIsXfConfiguredState(false) }}
                placeholder="API Secret"
                className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
              />
            </div>
          </div>
          <button onClick={handleSaveXf} disabled={isXfSaving} className={cn('px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 bg-accent-green text-bg-primary hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed')}>
            {isXfSaving ? '保存中...' : '保存'}
          </button>
          <p className="text-[10px] text-text-muted leading-relaxed">
            获取：讯飞开放平台 (xfyun.cn) → 注册 → 创建应用 → 机器翻译（新）→ 获取 API Key 和 API Secret
          </p>
        </div>

        {/* Test area */}
        <div className="border-t border-border-subtle pt-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-text-muted">测试翻译：</span>
            <div className="flex flex-wrap gap-1">
              {SERVICES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveService(s.key)}
                  className={cn(
                    'px-3 py-1 rounded-[6px] text-xs font-medium transition-all duration-200',
                    activeService === s.key ? 'bg-accent-green text-bg-primary' : 'bg-bg-elevated text-text-muted hover:text-text-secondary'
                  )}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleTestTranslation}
              disabled={isTesting || !isConfigured(activeService)}
              className={cn('px-3 py-1 rounded-[6px] text-xs font-medium transition-all duration-200 border border-border-subtle text-text-secondary hover:text-accent-green hover:border-accent-green disabled:opacity-40 disabled:cursor-not-allowed')}
            >
              {isTesting ? '测试中...' : '测试翻译'}
            </button>
          </div>

          {testResult && (
            <div className={cn('px-3 py-2 rounded-[8px] text-sm', testResult.success ? 'bg-accent-green/10 text-accent-green' : 'bg-danger/10 text-danger')}>
              {testResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}