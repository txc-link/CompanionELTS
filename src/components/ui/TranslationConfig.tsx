import { useState, useEffect, useCallback } from 'react'
import { getGoogleApiKey, setGoogleApiKey, translateWithGoogle } from '@/lib/translate'
import { cn } from '@/utils/cn'

interface TranslationConfigProps {
  className?: string
}

export default function TranslationConfig({ className }: TranslationConfigProps) {
  const [googleApiKey, setGoogleApiKeyState] = useState('')
  const [isKeyConfigured, setIsKeyConfigured] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    try {
      const savedKey = getGoogleApiKey()
      setGoogleApiKeyState(savedKey)
      setIsKeyConfigured(!!savedKey)
    } catch { /* localStorage access failed */ }
  }, [])

  const handleSaveGoogleKey = useCallback(() => {
    setIsSaving(true)
    setTestResult(null)
    try {
      setGoogleApiKey(googleApiKey.trim())
      const hasKey = !!googleApiKey.trim()
      setIsKeyConfigured(hasKey)
      setTestResult({ success: true, message: hasKey ? 'API Key 已保存' : 'API Key 已清除' })
    } catch {
      setTestResult({ success: false, message: '保存失败，请重试' })
    } finally {
      setIsSaving(false)
      setTimeout(() => setTestResult(null), 3000)
    }
  }, [googleApiKey])

  const handleTestTranslation = useCallback(async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      const result = await translateWithGoogle('hello', 'zh-CN')
      setTestResult(result ? { success: true, message: `翻译成功: "${result}"` } : { success: false, message: '翻译失败，请检查 API Key 是否有效' })
    } catch {
      setTestResult({ success: false, message: '翻译请求失败，请稍后重试' })
    } finally {
      setIsTesting(false)
      setTimeout(() => setTestResult(null), 5000)
    }
  }, [])

  return (
    <div className={cn('rounded-[16px] border border-border-subtle bg-bg-card p-[18px]', className)}>
      <div className="text-xs font-semibold text-text-muted uppercase tracking-[0.7px] mb-[14px] flex items-center gap-1.5">
        🌐 翻译配置
      </div>

      <div className="space-y-4">
        {/* Google Translate */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', isKeyConfigured ? 'bg-accent-green' : 'bg-text-muted/40')} />
            <span className="text-sm text-text-secondary">Google Translate</span>
          </div>
          <span className={cn('text-xs px-2 py-0.5 rounded-full', isKeyConfigured ? 'bg-accent-green/15 text-accent-green' : 'bg-bg-elevated text-text-muted')}>
            {isKeyConfigured ? '已配置' : '未配置'}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="google-api-key" className="text-xs font-medium text-text-secondary">API Key</label>
          <input
            id="google-api-key" type="password" value={googleApiKey}
            onChange={(e) => { setGoogleApiKeyState(e.target.value); setIsKeyConfigured(false) }}
            placeholder="输入 Google Cloud API Key"
            className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleSaveGoogleKey} disabled={isSaving} className={cn('px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 bg-accent-green text-bg-primary hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed')}>
            {isSaving ? '保存中...' : '保存'}
          </button>
          {isKeyConfigured && (
            <button onClick={handleTestTranslation} disabled={isTesting} className={cn('px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 bg-bg-elevated text-text-secondary border border-border-subtle hover:border-accent-green hover:text-accent-green disabled:opacity-50')}>
              {isTesting ? '测试中...' : '测试翻译'}
            </button>
          )}
        </div>

        {testResult && (
          <div className={cn('px-3 py-2 rounded-[8px] text-sm', testResult.success ? 'bg-accent-green/10 text-accent-green' : 'bg-danger/10 text-danger')}>
            {testResult.message}
          </div>
        )}

        <div className="p-3 rounded-[8px] bg-bg-elevated border border-border-subtle">
          <p className="text-xs text-text-muted leading-relaxed">
            <span className="font-medium text-text-secondary">获取 API Key：</span>
            访问 Google Cloud Console → 创建项目 → 启用 Cloud Translation API → 创建 API 密钥
          </p>
        </div>

        <div className="p-3 rounded-[8px] bg-bg-elevated/50 border border-border-subtle/50">
          <p className="text-xs text-text-muted">
            <span className="text-text-secondary font-medium">其他翻译服务</span> · 百度、有道、讯飞正在开发中
          </p>
        </div>
      </div>
    </div>
  )
}
