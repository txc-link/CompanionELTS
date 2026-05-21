import { useState, useMemo } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useStudyStore } from '@/store/studyStore'
import { cn } from '@/utils/cn'

// ─── Helpers ────────────────────────────────────────────────────────────────
function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function getWeekDays() {
  const days = []
  const today = new Date()
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  for (let i = -2; i <= 4; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      date: toDateStr(d),
      dayOfWeek: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      isToday: i === 0,
      isCompleted: i < 0,
      hasSession: i <= 1,
    })
  }
  return days
}

// ─── Multi-Day Mock Data ───────────────────────────────────────────────────
const ALL_TASKS = [
  // 周二 5/19
  { id: 't-19-1', date: '2026-05-19', title: '完成阅读篇章3', category: 'reading', status: 'completed' as const, priority: 'high' as const },
  { id: 't-19-2', date: '2026-05-19', title: '听力 Section 2 练习', category: 'listening', status: 'completed' as const, priority: 'medium' as const },
  { id: 't-19-3', date: '2026-05-19', title: '写作 Task2 科技话题', category: 'writing', status: 'completed' as const, priority: 'high' as const },
  // 周三 5/20
  { id: 't-20-1', date: '2026-05-20', title: '完成阅读篇章4', category: 'reading', status: 'completed' as const, priority: 'medium' as const },
  { id: 't-20-2', date: '2026-05-20', title: '听力 Section 3 练习', category: 'listening', status: 'completed' as const, priority: 'medium' as const },
  { id: 't-20-3', date: '2026-05-20', title: '词汇 List 5-6 复习', category: 'vocabulary', status: 'completed' as const, priority: 'low' as const },
  { id: 't-20-4', date: '2026-05-20', title: '口语 Part1 练习 5 题', category: 'speaking', status: 'completed' as const, priority: 'medium' as const },
  // 周四 5/21 (今天)
  { id: 't-21-1', date: '2026-05-21', title: '完成阅读篇章5', category: 'reading', status: 'pending' as const, priority: 'high' as const },
  { id: 't-21-2', date: '2026-05-21', title: '听力 Section 4 练习', category: 'listening', status: 'pending' as const, priority: 'medium' as const },
  { id: 't-21-3', date: '2026-05-21', title: '写作 Task1 图表题', category: 'writing', status: 'pending' as const, priority: 'high' as const },
  { id: 't-21-4', date: '2026-05-21', title: '语法：虚拟语气复习', category: 'grammar', status: 'pending' as const, priority: 'low' as const },
  // 周五 5/22
  { id: 't-22-1', date: '2026-05-22', title: '阅读 Passage 6 精读', category: 'reading', status: 'pending' as const, priority: 'medium' as const },
  { id: 't-22-2', date: '2026-05-22', title: '听力完整一套', category: 'listening', status: 'pending' as const, priority: 'high' as const },
  { id: 't-22-3', date: '2026-05-22', title: '写作 Task2 社会话题', category: 'writing', status: 'pending' as const, priority: 'high' as const },
  // 周六 5/23
  { id: 't-23-1', date: '2026-05-23', title: '口语 Part2 独立陈述 3 题', category: 'speaking', status: 'pending' as const, priority: 'medium' as const },
  { id: 't-23-2', date: '2026-05-23', title: '词汇 List 7-8 预习', category: 'vocabulary', status: 'pending' as const, priority: 'low' as const },
  { id: 't-23-3', date: '2026-05-23', title: '全科模拟测试', category: 'reading', status: 'pending' as const, priority: 'high' as const },
  // 周日 5/24
  { id: 't-24-1', date: '2026-05-24', title: '本周错题复盘', category: 'writing', status: 'pending' as const, priority: 'medium' as const },
  { id: 't-24-2', date: '2026-05-24', title: '口语 Part3 深度讨论', category: 'speaking', status: 'pending' as const, priority: 'medium' as const },
  // 周一 5/25
  { id: 't-25-1', date: '2026-05-25', title: '词汇 List 9-10 复习', category: 'vocabulary', status: 'pending' as const, priority: 'low' as const },
  { id: 't-25-2', date: '2026-05-25', title: '写作模板背诵', category: 'writing', status: 'pending' as const, priority: 'medium' as const },
]

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
          className="transition-all duration-500 ease-out"
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

// ─── Category Config ─────────────────────────────────────────────────────────
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

const categoryIcons: Record<string, string> = {
  reading: '📖',
  listening: '🎧',
  writing: '✍️',
  speaking: '🎤',
  vocabulary: '📚',
  grammar: '🧠',
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, partner } = useAuthStore()
  const { stats } = useStudyStore()
  const [aiSuggestion] = useState(
    '根据你近期的表现，建议重点提升阅读分数。尝试使用扫读技巧来练习篇章3。'
  )

  const weekDays = getWeekDays()
  const todayStr = toDateStr(new Date())
  const [selectedDate, setSelectedDate] = useState<string>(todayStr)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(
    new Set(ALL_TASKS.filter((t) => t.status === 'completed').map((t) => t.id))
  )

  // 选中日期的任务
  const dayTasks = useMemo(
    () => ALL_TASKS.filter((t) => t.date === selectedDate),
    [selectedDate]
  )

  // 选中日期的统计数据
  const dayStats = useMemo(() => {
    const total = dayTasks.length
    const completed = dayTasks.filter((t) => completedTasks.has(t.id)).length
    const pending = total - completed
    return { total, completed, pending }
  }, [dayTasks, completedTasks])

  // 切换日期时，显示对应日期的任务完成情况
  const toggleTask = (id: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const mePercent = dayStats.total > 0
    ? Math.min(100, (dayStats.completed / dayStats.total) * 100)
    : 0
  const partnerPercent = partner?.partnerScore
    ? Math.min(100, (partner.partnerScore / 9) * 100)
    : 0

  // 选中日期的中文显示
  const selectedDayInfo = weekDays.find((d) => d.date === selectedDate)
  const dateLabel = selectedDayInfo
    ? `${selectedDayInfo.dayOfWeek} ${selectedDayInfo.dayNumber}`
    : selectedDate

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
            const dayTasks2 = ALL_TASKS.filter((t) => t.date === day.date)
            const dayDone = dayTasks2.filter((t) => completedTasks.has(t.id)).length
            const dayTotal = dayTasks2.length
            const dayProgress = dayTotal > 0 ? dayDone / dayTotal : 0

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
                <span className="text-[10px] font-medium tracking-wide">{day.dayOfWeek}</span>
                <span className="text-sm font-bold">{day.dayNumber}</span>
                {/* Progress dots */}
                {dayTotal > 0 && !isSelected && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(dayTotal, 3) }, (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'w-1.5 h-1.5 rounded-full transition-all duration-200',
                          i < dayDone ? 'bg-accent-green' : 'bg-text-muted/40'
                        )}
                      />
                    ))}
                  </div>
                )}
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-bg-primary/60" />}
              </button>
            )
          })}
        </div>
      </Card>

      {/* Date Label + Dual Progress */}
      <Card>
        <CardTitle>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="#7a9170" strokeWidth="1.5"/>
            <path d="M7 4V7L9 9" stroke="#7a9170" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {dateLabel} 学习进度
        </CardTitle>
        <div className="flex items-center justify-center gap-10 sm:gap-16 py-2">
          <ProgressRing
            percent={mePercent} color="#6ec56e"
            label="我"
            value={`${dayStats.completed}/${dayStats.total}`}
            sublabel={`${dayStats.pending}项待完成`}
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
            <span className="text-lg">✅</span>
          </div>
          <p className="text-2xl font-bold text-accent-green">{dayStats.completed}</p>
          <p className="text-[10px] text-text-muted/60 mt-0.5">今日</p>
        </Card>
        <Card variant="stats">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-muted">待完成任务</span>
            <span className="text-lg">📋</span>
          </div>
          <p className="text-2xl font-bold text-accent-gold">{dayStats.pending}</p>
          <p className="text-[10px] text-text-muted/60 mt-0.5">今日</p>
        </Card>
        <Card variant="stats">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-muted">完成率</span>
            <span className="text-lg">📊</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {dayStats.total > 0 ? Math.round((dayStats.completed / dayStats.total) * 100) : 0}%
          </p>
          <p className="text-[10px] text-text-muted/60 mt-0.5">今日</p>
        </Card>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardTitle>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="#7a9170" strokeWidth="1.5"/>
              <path d="M4.5 7L6.5 9L9.5 5" stroke="#7a9170" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {dateLabel} 任务
            <span className="ml-auto text-text-muted font-normal normal-case tracking-normal">
              {dayStats.completed}/{dayStats.total}
            </span>
          </CardTitle>

          {dayTasks.length === 0 && (
            <div className="text-center py-8">
              <span className="text-3xl">🎉</span>
              <p className="text-sm text-text-muted mt-2">这一天没有安排任务</p>
              <Button variant="ghost" size="sm" className="mt-2">去添加</Button>
            </div>
          )}

          <div className="space-y-1">
            {dayTasks.map((task) => {
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
                  <span className={cn(
                    'flex-shrink-0 w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-all duration-200',
                    done ? 'bg-accent-green border-accent-green' : 'border-border-subtle'
                  )}>
                    {done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5L4.5 7.5L8 2.5" stroke="#0f1a12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <span className="text-lg flex-shrink-0">{categoryIcons[task.category] || '📋'}</span>
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
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardTitle>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="#7a9170" strokeWidth="1.5"/>
              <path d="M7 4V7L9 9" stroke="#7a9170" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {dateLabel} 各科进度
          </CardTitle>
          <div className="space-y-3 mt-2">
            {(['reading', 'listening', 'writing', 'speaking', 'vocabulary', 'grammar'] as const).map((cat) => {
              const catTasks = dayTasks.filter((t) => t.category === cat)
              if (catTasks.length === 0) return null
              const catDone = catTasks.filter((t) => completedTasks.has(t.id)).length
              const catTotal = catTasks.length
              const catPct = catTotal > 0 ? (catDone / catTotal) * 100 : 0
              const catColor =
                cat === 'reading' ? '#5b9bd5' :
                cat === 'listening' ? '#6ec56e' :
                cat === 'writing' ? '#e8b84b' :
                cat === 'speaking' ? '#c4893a' :
                cat === 'vocabulary' ? '#6ec56e' : '#5b9bd5'

              return (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-primary">{categoryIcons[cat]} {categoryLabels[cat]}</span>
                    <span className="text-xs text-text-muted">{catDone}/{catTotal}</span>
                  </div>
                  <div className="h-2 rounded-full bg-border-subtle overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${catPct}%`, backgroundColor: catColor }}
                    />
                  </div>
                </div>
              )
            })}

            {dayTasks.length === 0 && (
              <p className="text-sm text-text-muted text-center py-4">暂无任务安排</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
