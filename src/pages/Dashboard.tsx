import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useStudyStore } from '@/store/studyStore'
import { cn } from '@/utils/cn'

// ─── Helpers ────────────────────────────────────────────────────────────────
function getTodayStr() {
  return new Date().toISOString().slice(0, 10)
}

function getWeekDays() {
  const days = []
  const today = new Date()
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  for (let i = -2; i <= 4; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      date: d.toISOString().slice(0, 10),
      dayOfWeek: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      isToday: i === 0,
      isCompleted: i < 0,
      hasSession: i <= 1,
      intensity: Math.min(1, Math.max(0.2, 1 - Math.abs(i) * 0.15)),
    })
  }
  return days
}

// ─── SVG Progress Ring ──────────────────────────────────────────────────────
function ProgressRing({
  percent,
  size = 80,
  strokeWidth = 6,
  color = '#6ec56e',
  label,
  value,
  sublabel,
}: {
  percent: number
  size?: number
  strokeWidth?: number
  color?: string
  label: string
  value: string
  sublabel?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#2a3d2c" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-text-primary">{value}</span>
      </div>
      <span className="text-[10px] font-medium text-text-muted uppercase tracking-[0.5px]">{label}</span>
      {sublabel && <span className="text-[9px] text-text-muted/60 -mt-0.5">{sublabel}</span>}
    </div>
  )
}

// ─── Mock Data ──────────────────────────────────────────────────────────────
const categoryColors: Record<string, string> = {
  reading: 'bg-info/15 text-info',
  listening: 'bg-accent-green/15 text-accent-green',
  writing: 'bg-accent-gold/15 text-accent-gold',
  speaking: 'bg-accent-amber/15 text-accent-amber',
  vocabulary: 'bg-accent-green/15 text-accent-green',
  grammar: 'bg-info/15 text-info',
}

const categoryLabels: Record<string, string> = {
  reading: '阅读',
  listening: '听力',
  writing: '写作',
  speaking: '口语',
  vocabulary: '词汇',
  grammar: '语法',
}

const mockTasks = [
  { id: '1', title: '完成阅读篇章3', category: 'reading', priority: 'high', status: 'pending' as const },
  { id: '2', title: '复习词汇表 - 第四周', category: 'vocabulary', priority: 'medium', status: 'pending' as const },
  { id: '3', title: '写作Task2作文：科技话题', category: 'writing', priority: 'high', status: 'completed' as const },
  { id: '4', title: '听力练习 - Section 4', category: 'listening', priority: 'medium', status: 'pending' as const },
  { id: '5', title: '口语模拟测试 - Part 2', category: 'speaking', priority: 'low', status: 'pending' as const },
  { id: '6', title: '语法：条件句复习', category: 'grammar', priority: 'medium', status: 'completed' as const },
]

const mockAchievements = [
  { id: 'a1', title: '连续7天', icon: '🔥', progress: 5, total: 7, unlocked: false },
  { id: 'a2', title: '首篇作文', icon: '✍️', progress: 1, total: 1, unlocked: true },
  { id: 'a3', title: '听力大师', icon: '🎧', progress: 8, total: 10, unlocked: false },
  { id: 'a4', title: '词汇之星', icon: '📚', progress: 24, total: 50, unlocked: false },
]

// ─── Component ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, partner } = useAuthStore()
  const { stats } = useStudyStore()
  const [aiSuggestion] = useState(
    '根据你近期的表现，建议重点提升阅读分数。尝试使用扫读技巧来练习篇章3。'
  )
  const [tasks] = useState(mockTasks)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(
    new Set(mockTasks.filter((t) => t.status === 'completed').map((t) => t.id))
  )

  const weekDays = getWeekDays()
  // Default selected date to today
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr)

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const mePercent = Math.min(100, ((stats.weekScore || 0) / 9) * 100)
  const partnerPercent = partner?.partnerScore
    ? Math.min(100, (partner.partnerScore / 9) * 100)
    : 0

  return (
    <div className="max-w-[1200px] mx-auto space-y-5">
      {/* AI Suggestion Bar */}
      <div className="rounded-[12px] bg-accent-green/8 border border-accent-green/20 px-4 py-3 flex items-start gap-3">
        <span className="text-lg flex-shrink-0 mt-0.5">💡</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary leading-snug">{aiSuggestion}</p>
        </div>
        <button className="flex-shrink-0 text-xs font-medium text-accent-green hover:underline cursor-pointer">
          查看详情
        </button>
      </div>

      {/* Calendar Strip */}
      <Card>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {weekDays.map((day) => {
            const isSelected = selectedDate === day.date
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 px-3 rounded-[12px] min-w-[56px] transition-all duration-200 cursor-pointer flex-shrink-0',
                  isSelected
                    ? 'bg-accent-green text-bg-primary shadow-[0_2px_8px_rgba(110,197,110,0.3)]'
                    : day.isToday
                    ? 'bg-accent-green/15 text-accent-green border border-accent-green/30 hover:bg-accent-green/25'
                    : 'bg-bg-elevated text-text-secondary hover:bg-border-subtle border border-transparent'
                )}
              >
                <span className="text-[10px] font-medium tracking-wide">
                  {day.dayOfWeek}
                </span>
                <span className="text-sm font-bold">{day.dayNumber}</span>
                {day.hasSession && !isSelected && (
                  <span className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    day.isCompleted ? 'bg-accent-green' : 'bg-text-muted/50'
                  )} />
                )}
                {isSelected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-bg-primary/60" />
                )}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Dual Progress Rings */}
      <Card>
        <CardTitle>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="#7a9170" strokeWidth="1.5"/>
            <path d="M7 4V7L9 9" stroke="#7a9170" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          本周进度
        </CardTitle>
        <div className="flex items-center justify-center gap-10 sm:gap-16 py-2">
          <ProgressRing
            percent={mePercent} color="#6ec56e"
            label="我"
            value={`${stats.weekScore || 0}/9`}
            sublabel={user?.nickname || '我'}
          />
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center">
              <span className="text-xs font-bold text-text-muted">VS</span>
            </div>
          </div>
          <ProgressRing
            percent={partnerPercent} color="#e8b84b"
            label="搭子"
            value={partner?.isBound ? `${partner.partnerScore || 0}/9` : '--'}
            sublabel={partner?.isBound ? partner.partnerNickname : '未绑定'}
          />
        </div>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card variant="stats">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-muted">已完成任务</span>
            <span className="text-lg">📋</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{stats.weekTasks || 0}</p>
          <p className="text-[10px] text-text-muted/60 mt-0.5">本周</p>
        </Card>
        <Card variant="stats">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-muted">平均分数</span>
            <span className="text-lg">⭐</span>
          </div>
          <p className="text-2xl font-bold text-accent-gold">
            {stats.weekScore > 0 ? (stats.weekScore / Math.max(1, stats.weekTasks)).toFixed(1) : '0.0'}
          </p>
          <p className="text-[10px] text-text-muted/60 mt-0.5">得分</p>
        </Card>
        <Card variant="stats">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-muted">红花</span>
            <span className="text-lg">🌸</span>
          </div>
          <p className="text-2xl font-bold text-accent-green">{stats.flowersCollected || 0}</p>
          <p className="text-[10px] text-text-muted/60 mt-0.5">已收集</p>
        </Card>
      </div>

      {/* Task List + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-3">
          <CardTitle>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="#7a9170" strokeWidth="1.5"/>
              <path d="M4.5 7L6.5 9L9.5 5" stroke="#7a9170" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            今日任务
            <span className="ml-auto text-text-muted font-normal normal-case tracking-normal">
              {completedTasks.size}/{tasks.length}
            </span>
          </CardTitle>
          <div className="space-y-1">
            {tasks.map((task) => {
              const done = completedTasks.has(task.id)
              return (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-200 text-left cursor-pointer',
                    done ? 'bg-accent-green/5' : 'hover:bg-bg-elevated'
                  )}
                >
                  <span
                    className={cn(
                      'flex-shrink-0 w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-all duration-200',
                      done ? 'bg-accent-green border-accent-green' : 'border-border-subtle group-hover:border-accent-green/50'
                    )}
                  >
                    {done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4.5 7.5L8 2.5" stroke="#0f1a12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span className={cn(
                    'flex-1 text-xs transition-all duration-200',
                    done ? 'text-text-muted line-through' : 'text-text-primary'
                  )}>
                    {task.title}
                  </span>
                  <span className={cn(
                    'text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0',
                    categoryColors[task.category] || 'bg-bg-elevated text-text-muted'
                  )}>
                    {categoryLabels[task.category] || task.category}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-border-subtle">
            <Button variant="ghost" size="sm" className="w-full">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2.5 6H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              添加任务
            </Button>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="lg:col-span-2">
          <CardTitle>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 8.75C9.07107 8.75 10.75 7.07107 10.75 5C10.75 2.92893 9.07107 1.25 7 1.25C4.92893 1.25 3.25 2.92893 3.25 5C3.25 7.07107 4.92893 8.75 7 8.75Z" stroke="#7a9170" strokeWidth="1.5"/>
              <path d="M4.6875 8L3.75 12.25L7 10.75L10.25 12.25L9.3125 8" stroke="#7a9170" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            成就
          </CardTitle>
          <div className="space-y-2.5">
            {mockAchievements.map((a) => (
              <div
                key={a.id}
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-[10px] transition-all duration-200',
                  a.unlocked ? 'bg-accent-gold/8 border border-accent-gold/20' : 'bg-bg-elevated/50'
                )}
              >
                <span className="text-lg flex-shrink-0">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn('text-xs font-medium', a.unlocked ? 'text-text-primary' : 'text-text-muted')}>
                      {a.title}
                    </span>
                    {a.unlocked ? (
                      <Badge variant="success" size="sm">已完成</Badge>
                    ) : (
                      <span className="text-[9px] text-text-muted/60 flex-shrink-0">
                        {a.progress}/{a.total}
                      </span>
                    )}
                  </div>
                  {!a.unlocked && (
                    <div className="mt-1.5 h-1.5 rounded-full bg-border-subtle overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent-green transition-all duration-500"
                        style={{ width: `${(a.progress / a.total) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-3">
            查看全部
          </Button>
        </Card>
      </div>
    </div>
  )
}
