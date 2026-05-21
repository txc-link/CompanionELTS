import { useState, useEffect, useCallback } from 'react'
import { getGoogleApiKey, setGoogleApiKey, translateWithGoogle } from '@/lib/translate'
import { getBaiduAppId, setBaiduAppId, getBaiduSecretKey, setBaiduSecretKey, isBaiduConfigured, translateWithBaidu } from '@/lib/baiduTranslate'
import { cn } from '@/utils/cn'

interface TranslationConfigProps {
  className?: string
}

type ActiveService = 'google' | 'baidu'

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

  const handleTestTranslation = useCallback(async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      let result: string | null = null
      if (activeService === 'google' && isGoogleConfigured) {
        result = await translateWithGoogle('hello world', 'zh-CN')
        setTestResult(result ? { success: true, message: `Google 翻译成功: "${result}"` } : { success: false, message: 'Google 翻译失败，请检查 API Key' })
      } else if (activeService === 'baidu' && isBaiduConfigured()) {
        result = await translateWithBaidu('hello world', 'en', 'zh')
        setTestResult(result ? { success: true, message: `百度翻译成功: "${result}"` } : { success: false, message: '百度翻译失败，请检查 App ID 和 Secret Key' })
      } else {
        setTestResult({ success: false, message: `请先配置 ${activeService === 'google' ? 'Google' : '百度'} 翻译凭证` })
      }
    } catch {
      setTestResult({ success: false, message: '翻译请求失败，请稍后重试' })
    } finally {
      setIsTesting(false)
      setTimeout(() => setTestResult(null), 5000)
    }
  }, [activeService, isGoogleConfigured])

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

        {/* Divider */}
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
            获取：百度翻译开放平台 (fanyi-api.baidu.com) → 注册账号 → 创建应用 → 获取 App ID 和 Secret Key
          </p>
        </div>

        {/* Test area */}
        <div className="border-t border-border-subtle pt-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">测试翻译：</span>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveService('google')}
                className={cn('px-3 py-1 rounded-[6px] text-xs font-medium transition-all duration-200', activeService === 'google' ? 'bg-accent-green text-bg-primary' : 'bg-bg-elevated text-text-muted')}
              >
                Google
              </button>
              <button
                onClick={() => setActiveService('baidu')}
                className={cn('px-3 py-1 rounded-[6px] text-xs font-medium transition-all duration-200', activeService === 'baidu' ? 'bg-accent-green text-bg-primary' : 'bg-bg-elevated text-text-muted')}
              >
                百度
              </button>
            </div>
            <button
              onClick={handleTestTranslation}
              disabled={isTesting || (activeService === 'google' && !isGoogleConfigured) || (activeService === 'baidu' && !isBaiduConfiguredState)}
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

        {/* Other services */}
        <div className="p-3 rounded-[8px] bg-bg-elevated/50 border border-border-subtle/50">
          <p className="text-xs text-text-muted">
            <span className="text-text-secondary font-medium">其他翻译服务</span> · 有道、讯飞正在开发中
          </p>
        </div>
      </div>
    </div>
  )
}