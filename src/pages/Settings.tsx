import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

// ─── Mock Data ──────────────────────────────────────────────────────────────
const targetScores = ['6.0', '6.5', '7.0', '7.5']

const notificationTypes = [
  { label: '学习提醒', key: 'studyReminder' },
  { label: '对战通知', key: 'battleNotification' },
]

const aiPushModes = ['关闭', '轻松', '普通', '严格']

// ─── Component ──────────────────────────────────────────────────────────────
export default function Settings() {
  const [activeTarget, setActiveTarget] = useState('7.0')
  const [notifications, setNotifications] = useState({
    studyReminder: true,
    battleNotification: true,
  })
  const [aiPushMode, setAiPushMode] = useState('普通')
  const [darkMode, setDarkMode] = useState(true)
  const [nickname, setNickname] = useState('烤鸭人')

  return (
    <div className="max-w-[800px] mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">
          {'\u{2699}\u{FE0F}'} 个人设置
        </h1>
      </div>

      {/* Profile Card */}
      <Card>
        <CardTitle>个人信息</CardTitle>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-accent-amber to-accent-gold flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-bg-primary">烤</span>
          </div>
          <div className="flex-1 space-y-2">
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              label="昵称"
            />
            <div className="text-xs text-text-muted">
              邮箱：kaoyaren@example.com
            </div>
          </div>
        </div>
      </Card>

      {/* Goal Setting */}
      <Card>
        <CardTitle>目标设置</CardTitle>
        <div className="space-y-4">
          {/* Target Score Pills */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">
              目标分数
            </label>
            <div className="flex gap-2">
              {targetScores.map((score) => (
                <button
                  key={score}
                  onClick={() => setActiveTarget(score)}
                  className={cn(
                    'px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer',
                    activeTarget === score
                      ? 'bg-accent-green text-bg-primary shadow-[0_0_12px_rgba(110,197,110,0.3)]'
                      : 'bg-bg-elevated text-text-secondary border border-border-subtle hover:border-accent-green/50'
                  )}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>

          {/* Exam Date */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">
              考试日期
            </label>
            <input
              type="date"
              defaultValue="2026-07-18"
              className="w-full rounded-[8px] border border-border-subtle bg-bg-secondary px-3.5 py-2.5 text-sm text-text-primary outline-none focus:border-accent-green focus:shadow-[0_0_0_2px_rgba(110,197,110,0.15)] transition-all duration-200"
            />
          </div>

          {/* Level */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted">当前等级</span>
            <Badge variant="warning">L3 · 进阶级</Badge>
          </div>
        </div>
      </Card>

      {/* Partner Management */}
      <Card>
        <CardTitle>搭子管理</CardTitle>
        <div className="space-y-3">
          {/* Partner Card */}
          <div className="flex items-center gap-3 p-3 rounded-[12px] bg-bg-elevated border border-border-subtle">
            {/* Partner Avatar */}
            <div className="w-[40px] h-[40px] rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-accent-green">小</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">小明</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 rounded-full bg-border-subtle overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-gold transition-all duration-500"
                    style={{ width: '62%' }}
                  />
                </div>
                <span className="text-[10px] text-text-muted font-medium">62%</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="danger" size="sm">
              解绑搭子
            </Button>
            <Button variant="secondary" size="sm">
              邀请新搭子
            </Button>
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardTitle>通知偏好</CardTitle>
        <div className="space-y-4">
          {/* Toggle Switches */}
          {notificationTypes.map((n) => (
            <div key={n.key} className="flex items-center justify-between">
              <span className="text-sm text-text-primary">{n.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notifications[n.key as keyof typeof notifications]}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [n.key]: !prev[n.key as keyof typeof notifications],
                    }))
                  }
                />
                <span
                  className={cn(
                    'w-[44px] h-[24px] rounded-full transition-all duration-200 peer',
                    notifications[n.key as keyof typeof notifications]
                      ? 'bg-accent-green'
                      : 'bg-border-subtle'
                  )}
                >
                  <span
                    className={cn(
                      'block w-[20px] h-[20px] bg-white rounded-full transition-all duration-200 mt-[2px]',
                      notifications[n.key as keyof typeof notifications]
                        ? 'ml-[22px]'
                        : 'ml-[2px]'
                    )}
                  />
                </span>
              </label>
            </div>
          ))}

          {/* AI Push Mode Tabs */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">
              AI 推送频率
            </label>
            <div className="flex gap-1.5">
              {aiPushModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAiPushMode(mode)}
                  className={cn(
                    'px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all duration-200 cursor-pointer',
                    aiPushMode === mode
                      ? 'bg-accent-green text-bg-primary'
                      : 'bg-bg-elevated text-text-secondary border border-border-subtle hover:border-accent-green/50'
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Quiet Hours */}
          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">
              免打扰时段
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                defaultValue="23:00"
                className="rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-green transition-all duration-200"
              />
              <span className="text-text-muted text-xs">至</span>
              <input
                type="time"
                defaultValue="09:00"
                className="rounded-[8px] border border-border-subtle bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-green transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Theme Toggle */}
      <Card>
        <CardTitle>主题设置</CardTitle>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-primary">深色模式</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span
              className={cn(
                'w-[44px] h-[24px] rounded-full transition-all duration-200 peer',
                darkMode ? 'bg-accent-green' : 'bg-border-subtle'
              )}
            >
              <span
                className={cn(
                  'block w-[20px] h-[20px] bg-white rounded-full transition-all duration-200 mt-[2px]',
                  darkMode ? 'ml-[22px]' : 'ml-[2px]'
                )}
              />
            </span>
          </label>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="!border-danger/30">
        <CardTitle className="!text-danger">危险操作</CardTitle>
        <div className="flex gap-2">
          <Button variant="danger" size="sm">
            注销账户
          </Button>
          <Button variant="ghost" size="sm">
            导出学习数据
          </Button>
        </div>
      </Card>
    </div>
  )
}
