import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Card, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'

// ─── Mock Messages ───────────────────────────────────────────────────────────
const DAILY_MESSAGES = [
  {
    id: 'm1',
    time: '08:00',
    type: 'reminder',
    icon: '🌅',
    title: '早安提醒',
    content: '新的一天开始了！今天的目标：完成一篇Task2写作 + 20分钟听力。加油！',
    action: '查看计划',
  },
  {
    id: 'm2',
    time: '12:30',
    type: 'tip',
    icon: '💡',
    title: '学习技巧',
    content: '雅思写作中，使用复杂句式可以提升Lexical Resource得分。但不要为了复杂而复杂，自然衔接最重要。',
    action: '去练习',
  },
  {
    id: 'm3',
    time: '15:00',
    type: 'encourage',
    icon: '💪',
    title: '加油鼓励',
    content: '你今天已经学习了2小时啦！保持这个节奏，目标分数在向你招手~🌟',
    action: null,
  },
  {
    id: 'm4',
    time: '18:00',
    type: 'challenge',
    icon: '🎯',
    title: '搭子挑战',
    content: '你的搭子小明已完成今日任务，你要不要也来比一比？',
    action: '接受挑战',
  },
  {
    id: 'm5',
    time: '21:00',
    type: 'review',
    icon: '📝',
    title: '今日复盘',
    content: '今天你完成了80%的计划！继续保持。明天建议加强Task 1图表描述练习。',
    action: '查看详情',
  },
]

const AI_PERSONAS = [
  { id: 'strict', name: '严格模式', emoji: '😤', desc: '高标准严要求，适合冲刺期', active: false },
  { id: 'gentle', name: '温和鼓励', emoji: '🤗', desc: '正向反馈为主，适合入门', active: true },
  { id: 'fun', name: '搞笑风格', emoji: '😆', desc: '梗多有趣，适合放松学习', active: false },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function DailyMessages() {
  const [activeTab, setActiveTab] = useState<'ai' | 'system'>('ai')
  const [showPersonaModal, setShowPersonaModal] = useState(false)
  const [unreadCount] = useState(3)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{'📬'} 每日消息</h1>
          <p className="text-sm text-text-muted mt-1">
            AI 主动推送 · 学习提醒 · 复盘建议
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="danger" size="sm">{unreadCount} 未读</Badge>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([
          { key: 'ai', label: 'AI 消息', emoji: '🤖' },
          { key: 'system', label: '系统通知', emoji: '📢' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-[10px] text-sm font-semibold transition-all duration-200',
              activeTab === tab.key
                ? 'bg-accent-green text-bg-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {/* AI Persona Selector */}
      {activeTab === 'ai' && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI 助手模式</CardTitle>
              <p className="text-xs text-text-muted mt-0.5">选择 AI 消息推送风格</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowPersonaModal(true)}>
              切换模式
            </Button>
          </div>

          <div className="flex items-center gap-3 mt-3 p-3 rounded-[10px] bg-accent-green/5 border border-accent-green/20">
            <span className="text-2xl">{AI_PERSONAS[1].emoji}</span>
            <div>
              <p className="text-sm font-semibold text-text-primary">{AI_PERSONAS[1].name}</p>
              <p className="text-xs text-text-muted">{AI_PERSONAS[1].desc}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Message List */}
      {activeTab === 'ai' && (
        <div className="space-y-3">
          {DAILY_MESSAGES.map((msg) => (
            <Card
              key={msg.id}
              className={cn(
                'hover:border-border-accent transition-all duration-300',
                msg.type === 'challenge' ? 'border-accent-gold/30 bg-accent-gold/5' : ''
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-bg-elevated flex items-center justify-center flex-shrink-0 text-xl">
                  {msg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text-primary">{msg.title}</p>
                    <span className="text-[10px] text-text-muted">{msg.time}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">{msg.content}</p>
                  {msg.action && (
                    <Button variant="secondary" size="sm" className="mt-2">
                      {msg.action}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-3">
          {[
            { emoji: '🎉', title: '恭喜解锁成就「连续7天」', time: '昨天' },
            { emoji: '📢', title: '本周排行榜已重置', time: '2天前' },
            { emoji: '🔔', title: '搭子小明给你送了小红花', time: '3天前' },
          ].map((item, i) => (
            <Card key={i}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm text-text-primary">{item.title}</p>
                  <p className="text-[10px] text-text-muted">{item.time}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* AI Persona Modal */}
      <Modal
        isOpen={showPersonaModal}
        onClose={() => setShowPersonaModal(false)}
        title="选择 AI 助手模式"
        size="sm"
      >
        <div className="space-y-3">
          {AI_PERSONAS.map((persona) => (
            <div
              key={persona.id}
              className={cn(
                'flex items-center gap-3 p-3 rounded-[10px] border cursor-pointer transition-all duration-200',
                persona.active
                  ? 'border-accent-green bg-accent-green/5'
                  : 'border-border-subtle hover:border-accent-green/50'
              )}
              onClick={() => setShowPersonaModal(false)}
            >
              <span className="text-2xl">{persona.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{persona.name}</p>
                <p className="text-xs text-text-muted">{persona.desc}</p>
              </div>
              {persona.active && (
                <span className="text-sm text-accent-green">✅ 已选</span>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}