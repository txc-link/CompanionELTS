import { useState, useEffect, useCallback } from 'react'
import { getGoogleApiKey, setGoogleApiKey, translateWithGoogle } from '@/lib/translate'
import { getBaiduApiKey, setBaiduApiKey, getBaiduSecretKey, setBaiduSecretKey, isBaiduConfigured, translateWithBaidu } from '@/lib/baiduTranslate'
import { getYoudaoAppKey, setYoudaoAppKey, getYoudaoAppSecret, setYoudaoAppSecret, isYoudaoConfigured, translateWithYoudao } from '@/lib/youdaoTranslate'
import { getXfApiKey, setXfApiKey, getXfApiSecret, setXfApiSecret, isXfConfigured, translateWithXf } from '@/lib/xfTranslate'

const XF_APP_ID_KEY = 'xftranslate_app_id'
function getXfAppId(): string { try { return localStorage.getItem(XF_APP_ID_KEY) || '' } catch { return '' } }
function setXfAppId(id: string) { try { localStorage.setItem(XF_APP_ID_KEY, id) } catch {} }
import { cn } from '@/utils/cn'

interface TranslationConfigProps {
  className?: string
}

type ServiceKey = 'google' | 'baidu' | 'youdao' | 'xf'

interface ServiceMeta {
  key: ServiceKey
  label: string
  icon: string
  desc: string
  color: string
}

const SERVICES_META: ServiceMeta[] = [
  { key: 'google', label: 'Google', icon: '🔤', desc: 'Google Cloud Translation', color: '#4285F4' },
  { key: 'baidu', label: '百度', icon: '🌸', desc: '百度翻译开放平台', color: '#2932E1' },
  { key: 'youdao', label: '有道', icon: '📖', desc: '网易有道智云', color: '#D83B01' },
  { key: 'xf', label: '讯飞', icon: '🎤', desc: '讯飞开放平台', color: '#18B36B' },
]

// ─── Persist enabled state ─────────────────────────────────────────────────
const ENABLED_KEY = 'translation_services_enabled'
const ENABLED_DEFAULT: Record<ServiceKey, boolean> = { google: true, baidu: false, youdao: false, xf: false }

function getEnabledServices(): Record<ServiceKey, boolean> {
  try {
    const raw = localStorage.getItem(ENABLED_KEY)
    return raw ? JSON.parse(raw) : ENABLED_DEFAULT
  } catch { return ENABLED_DEFAULT }
}
function setEnabledServices(val: Record<ServiceKey, boolean>) {
  try { localStorage.setItem(ENABLED_KEY, JSON.stringify(val)) } catch {}
}

// ─── Service Card ─────────────────────────────────────────────────────────
function ServiceCard({
  meta,
  isConfigured,
  isEnabled,
  onToggle,
  onExpand,
  expanded,
  children,
}: {
  meta: ServiceMeta
  isConfigured: boolean
  isEnabled: boolean
  onToggle: (key: ServiceKey) => void
  onExpand: (key: ServiceKey) => void
  expanded: ServiceKey | null
  children: React.ReactNode
}) {
  const isExpanded = expanded === meta.key

  return (
    <div className={cn(
      'rounded-[12px] border transition-all duration-200',
      isEnabled
        ? 'border-accent-green/30 bg-accent-green/[0.03]'
        : 'border-border-subtle bg-bg-card',
    )}>
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Status dot */}
          <div className={cn(
            'w-2 h-2 rounded-full transition-all duration-300',
            isEnabled
              ? isConfigured ? 'bg-accent-green shadow-[0_0_6px_rgba(110,197,110,0.6)]' : 'bg-accent-gold shadow-[0_0_6px_rgba(234,179,8,0.6)]'
              : 'bg-text-muted/30'
          )} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">{meta.icon}</span>
              <span className="text-sm font-semibold text-text-primary">{meta.label}</span>
            </div>
            <p className="text-[10px] text-text-muted">{meta.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Configured badge */}
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded-full',
            isConfigured ? 'bg-accent-green/15 text-accent-green' : 'bg-bg-elevated text-text-muted'
          )}>
            {isConfigured ? '已配置' : '未配置'}
          </span>

          {/* Toggle switch */}
          <button
            onClick={() => onToggle(meta.key)}
            className={cn(
              'relative w-10 h-5 rounded-full transition-all duration-300 cursor-pointer',
              isEnabled ? 'bg-accent-green' : 'bg-bg-elevated border border-border-subtle'
            )}
            aria-label={isEnabled ? `禁用 ${meta.label}` : `启用 ${meta.label}`}
          >
            <span className={cn(
              'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300',
              isEnabled ? 'left-[22px]' : 'left-0.5'
            )} />
          </button>
        </div>
      </div>

      {/* Expand/Collapse credentials */}
      <button
        onClick={() => onExpand(meta.key)}
        className="w-full flex items-center justify-center gap-1 py-1.5 border-t border-border-subtle/50 text-xs text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
      >
        <span>{isExpanded ? '收起' : '配置凭证'}</span>
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={cn('transition-transform duration-200', isExpanded ? 'rotate-180' : '')}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Credentials area */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border-subtle/30">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function TranslationConfig({ className }: TranslationConfigProps) {
  // Credential states
  const [googleApiKey, setGoogleApiKeyState] = useState('')
  const [baiduApiKey, setBaiduApiKeyState] = useState('')
  const [baiduSecretKey, setBaiduSecretKeyState] = useState('')
  const [youdaoAppKey, setYoudaoAppKeyState] = useState('')
  const [youdaoAppSecret, setYoudaoAppSecretState] = useState('')
  const [xfApiKey, setXfApiKeyState] = useState('')
  const [xfApiSecret, setXfApiSecretState] = useState('')
  const [xfAppId, setXfAppIdState] = useState('')

  // UI state
  const [enabled, setEnabled] = useState<Record<ServiceKey, boolean>>(ENABLED_DEFAULT)
  const [expanded, setExpanded] = useState<ServiceKey | null>(null)
  const [savingKey, setSavingKey] = useState<ServiceKey | null>(null)
  const [testKey, setTestKey] = useState<ServiceKey | null>(null)
  const [testResult, setTestResult] = useState<{ key: ServiceKey; success: boolean; message: string } | null>(null)

  // Load
  useEffect(() => {
    try {
      setGoogleApiKeyState(getGoogleApiKey())
      setBaiduApiKeyState(getBaiduApiKey())
      setBaiduSecretKeyState(getBaiduSecretKey())
      setYoudaoAppKeyState(getYoudaoAppKey())
      setYoudaoAppSecretState(getYoudaoAppSecret())
      setXfApiKeyState(getXfApiKey())
      setXfApiSecretState(getXfApiSecret())
      setXfAppIdState(getXfAppId())
      setEnabled(getEnabledServices())
    } catch { /* localStorage access failed */ }
  }, [xfAppId])

  const isConfigured = (key: ServiceKey) => {
    if (key === 'google') return !!googleApiKey
    if (key === 'baidu') return !!(baiduApiKey && baiduSecretKey)
    if (key === 'youdao') return !!(youdaoAppKey && youdaoAppSecret)
    if (key === 'xf') return !!(xfAppId && xfApiKey && xfApiSecret)
    return false
  }

  const handleToggle = useCallback((key: ServiceKey) => {
    setEnabled((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      setEnabledServices(next)
      return next
    })
  }, [])

  const handleExpand = useCallback((key: ServiceKey) => {
    setExpanded((prev) => prev === key ? null : key)
  }, [])

  const handleSave = useCallback((key: ServiceKey) => {
    setSavingKey(key)
    setTestResult(null)
    try {
      if (key === 'google') setGoogleApiKey(googleApiKey.trim())
      if (key === 'baidu') { setBaiduApiKey(baiduApiKey.trim()); setBaiduSecretKey(baiduSecretKey.trim()) }
      if (key === 'youdao') { setYoudaoAppKey(youdaoAppKey.trim()); setYoudaoAppSecret(youdaoAppSecret.trim()) }
      if (key === 'xf') { setXfApiKey(xfApiKey.trim()); setXfApiSecret(xfApiSecret.trim()); setXfAppId(xfAppId.trim()) }
      setTestResult({ key, success: true, message: '凭证已保存' })
    } catch {
      setTestResult({ key, success: false, message: '保存失败' })
    } finally {
      setSavingKey(null)
      setTimeout(() => setTestResult(null), 3000)
    }
  }, [googleApiKey, baiduApiKey, baiduSecretKey, youdaoAppKey, youdaoAppSecret, xfApiKey, xfApiSecret, xfAppId])

  const handleTest = useCallback(async (key: ServiceKey) => {
    if (key === 'xf' && !xfAppId.trim()) {
      setTestResult({ key, success: false, message: '请先填写并保存 APPID，再点击测试' })
      return
    }
    setTestKey(key)
    setTestResult(null)
    try {
      let result: string | null = null
      if (key === 'google') result = await translateWithGoogle('hello world', 'zh-CN')
      else if (key === 'baidu') result = await translateWithBaidu('hello world', 'en', 'zh')
      else if (key === 'youdao') result = await translateWithYoudao('hello world', 'auto', 'zh-CHS')
      else if (key === 'xf') result = await translateWithXf('hello world', 'en', 'zh', xfAppId)
      setTestResult({
        key,
        success: !!result,
        message: result ? `翻译成功: "${result}"` : '翻译失败，请检查凭证是否正确',
      })
    } catch {
      setTestResult({ key, success: false, message: '请求失败，请稍后重试' })
    } finally {
      setTestKey(null)
      setTimeout(() => setTestResult(null), 5000)
    }
  }, [])

  return (
    <div className={cn('rounded-[16px] border border-border-subtle bg-bg-card p-[18px]', className)}>
      <div className="text-xs font-semibold text-text-muted uppercase tracking-[0.7px] mb-[14px] flex items-center gap-1.5">
        🌐 翻译配置
      </div>

      <div className="space-y-3">
        {SERVICES_META.map((meta) => {
          const configured = isConfigured(meta.key)
          const isEnabled = enabled[meta.key]
          const isExpanded = expanded === meta.key
          const result = testResult?.key === meta.key ? testResult : null

          return (
            <ServiceCard
              key={meta.key}
              meta={meta}
              isConfigured={configured}
              isEnabled={isEnabled}
              onToggle={handleToggle}
              onExpand={handleExpand}
              expanded={expanded}
            >
              {/* Google credentials */}
              {meta.key === 'google' && (
                <div className="space-y-2">
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`${meta.key}-api-key`} className="text-xs font-medium text-text-secondary">API Key</label>
                    <input
                      id={`${meta.key}-api-key`} type="password" value={googleApiKey}
                      onChange={(e) => setGoogleApiKeyState(e.target.value)}
                      placeholder="输入 Google Cloud API Key"
                      className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave('google')}
                      disabled={savingKey === 'google'}
                      className="px-4 py-2 rounded-[8px] text-sm font-medium bg-accent-green text-bg-primary hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {savingKey === 'google' ? '保存中...' : '保存'}
                    </button>
                    {configured && (
                      <button
                        onClick={() => handleTest('google')}
                        disabled={testKey === 'google'}
                        className="px-4 py-2 rounded-[8px] text-sm font-medium border border-border-subtle text-text-secondary hover:text-accent-green hover:border-accent-green disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {testKey === 'google' ? '测试中...' : '测试'}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    获取：Google Cloud Console → API 和服务 → 凭据 → 创建 API 密钥
                  </p>
                </div>
              )}

              {/* Baidu credentials */}
              {meta.key === 'baidu' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`${meta.key}-app-id`} className="text-xs font-medium text-text-secondary">API Key</label>
                      <input
                        id={`${meta.key}-app-id`} type="text" value={baiduApiKey}
                        onChange={(e) => setBaiduApiKeyState(e.target.value)}
                        placeholder="百度 API Key"
                        className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`${meta.key}-secret`} className="text-xs font-medium text-text-secondary">Secret Key</label>
                      <input
                        id={`${meta.key}-secret`} type="password" value={baiduSecretKey}
                        onChange={(e) => setBaiduSecretKeyState(e.target.value)}
                        placeholder="安全码"
                        className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave('baidu')}
                      disabled={savingKey === 'baidu'}
                      className="px-4 py-2 rounded-[8px] text-sm font-medium bg-accent-green text-bg-primary hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {savingKey === 'baidu' ? '保存中...' : '保存'}
                    </button>
                    {configured && (
                      <button
                        onClick={() => handleTest('baidu')}
                        disabled={testKey === 'baidu'}
                        className="px-4 py-2 rounded-[8px] text-sm font-medium border border-border-subtle text-text-secondary hover:text-accent-green hover:border-accent-green disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {testKey === 'baidu' ? '测试中...' : '测试'}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    获取：百度翻译开放平台 (fanyi-api.baidu.com) → 注册 → 创建应用 → 获取 App ID 和 Secret Key
                  </p>
                </div>
              )}

              {/* Youdao credentials */}
              {meta.key === 'youdao' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`${meta.key}-app-key`} className="text-xs font-medium text-text-secondary">App Key</label>
                      <input
                        id={`${meta.key}-app-key`} type="text" value={youdaoAppKey}
                        onChange={(e) => setYoudaoAppKeyState(e.target.value)}
                        placeholder="有道 App Key"
                        className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`${meta.key}-secret`} className="text-xs font-medium text-text-secondary">App Secret</label>
                      <input
                        id={`${meta.key}-secret`} type="password" value={youdaoAppSecret}
                        onChange={(e) => setYoudaoAppSecretState(e.target.value)}
                        placeholder="应用密钥"
                        className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave('youdao')}
                      disabled={savingKey === 'youdao'}
                      className="px-4 py-2 rounded-[8px] text-sm font-medium bg-accent-green text-bg-primary hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {savingKey === 'youdao' ? '保存中...' : '保存'}
                    </button>
                    {configured && (
                      <button
                        onClick={() => handleTest('youdao')}
                        disabled={testKey === 'youdao'}
                        className="px-4 py-2 rounded-[8px] text-sm font-medium border border-border-subtle text-text-secondary hover:text-accent-green hover:border-accent-green disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {testKey === 'youdao' ? '测试中...' : '测试'}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    获取：有道智云 AI 开放平台 (ai.youdao.com) → 注册 → 创建应用 → 获取 App Key 和 App Secret
                  </p>
                </div>
              )}

              {/* Xunfei credentials */}
              {meta.key === 'xf' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`${meta.key}-app-id`} className="text-xs font-medium text-text-secondary">APPID</label>
                      <input
                        id={`${meta.key}-app-id`} type="text" value={xfAppId}
                        onChange={(e) => setXfAppIdState(e.target.value)}
                        placeholder="讯飞 APPID"
                        className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`${meta.key}-api-key`} className="text-xs font-medium text-text-secondary">API Key</label>
                      <input
                        id={`${meta.key}-api-key`} type="text" value={xfApiKey}
                        onChange={(e) => setXfApiKeyState(e.target.value)}
                        placeholder="讯飞 API Key"
                        className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor={`${meta.key}-secret`} className="text-xs font-medium text-text-secondary">API Secret</label>
                      <input
                        id={`${meta.key}-secret`} type="password" value={xfApiSecret}
                        onChange={(e) => setXfApiSecretState(e.target.value)}
                        placeholder="API Secret"
                        className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60 outline-none focus:border-accent-green transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave('xf')}
                      disabled={savingKey === 'xf'}
                      className="px-4 py-2 rounded-[8px] text-sm font-medium bg-accent-green text-bg-primary hover:bg-accent-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {savingKey === 'xf' ? '保存中...' : '保存'}
                    </button>
                    {configured && (
                      <button
                        onClick={() => handleTest('xf')}
                        disabled={testKey === 'xf'}
                        className="px-4 py-2 rounded-[8px] text-sm font-medium border border-border-subtle text-text-secondary hover:text-accent-green hover:border-accent-green disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {testKey === 'xf' ? '测试中...' : '测试'}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    获取：讯飞开放平台 (xfyun.cn) → 注册 → 创建应用 → 机器翻译（新）→ 获取 API Key 和 API Secret
                  </p>
                </div>
              )}

              {/* Result feedback */}
              {result && (
                <div className={cn(
                  'mt-1 px-3 py-2 rounded-[8px] text-xs',
                  result.success ? 'bg-accent-green/10 text-accent-green' : 'bg-danger/10 text-danger'
                )}>
                  {result.message}
                </div>
              )}
            </ServiceCard>
          )
        })}
      </div>
    </div>
  )
}