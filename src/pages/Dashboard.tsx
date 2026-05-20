import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useStudyStore } from '@/store/studyStore'
import { cn } from '@/utils/cn'

// ─── Helpers ────────────────────────────────────────────────────────────────
function getWeekDays() {
  const days = []
  const today = new Date()
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
    <div className="flex flex-col items-center gap-1.5">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2a3d2c"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-sm font-bold text-text-primary">{value}</span>
      </div>
      <span className="text-[10px] font-medium text-text-muted uppercase tracking-[0.5px]">
        {label}
      </span>
      {sublabel && (
        <span className="text-[9px] text-text-muted/60 -mt-0.5">{sublabel}</span>
      )}
    </div>
  )
}

// ─── Mock Data ──────────────────────────────────────────────────────────────
const mockTasks = [
  { id: '1', title: 'Complete Reading Passage 3', category: 'reading', priority: 'high', status: 'pending' as const },
  { id: '2', title: 'Review Vocabulary List - Week 4', category: 'vocabulary', priority: 'medium', status: 'pending' as const },
  { id: '3', title: 'Write Task 2 Essay: Technology', category: 'writing', priority: 'high', status: 'completed' as const },
  { id: '4', title: 'Listening Practice - Section 4', category: 'listening', priority: 'medium', status: 'pending' as const },
  { id: '5', title: 'Speaking Mock Test - Part 2', category: 'speaking', priority: 'low', status: 'pending' as const },
  { id: '6', title: 'Grammar: Conditionals Review', category: 'grammar', priority: 'medium', status: 'completed' as const },
]

const mockAchievements = [
  { id: 'a1', title: '7-Day Streak', icon: '🔥', progress: 5, total: 7, unlocked: false },
  { id: 'a2', title: 'First Essay', icon: '✍️', progress: 1, total: 1, unlocked: true },
  { id: 'a3', title: 'Listening Master', icon: '🎧', progress: 8, total: 10, unlocked: false },
  { id: 'a4', title: 'Vocabulary Star', icon: '📚', progress: 24, total: 50, unlocked: false },
]

const categoryColors: Record<string, string> = {
  reading: 'bg-info/15 text-info',
  listening: 'bg-accent-green/15 text-accent-green',
  writing: 'bg-accent-gold/15 text-accent-gold',
  speaking: 'bg-accent-amber/15 text-accent-amber',
  vocabulary: 'bg-accent-green/15 text-accent-green',
  grammar: 'bg-info/15 text-info',
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, partner } = useAuthStore()
  const { stats } = useStudyStore()
  const [aiSuggestion] = useState(
    'Based on your recent performance, focus on improving your Reading score. Try the skimming technique for passage 3.'
  )
  const [tasks] = useState(mockTasks)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(
    new Set(mockTasks.filter((t) => t.status === 'completed').map((t) => t.id))
  )
  const weekDays = useState(getWeekDays)[0]

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
          Details
        </button>
      </div>

      {/* Calendar Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {weekDays.map((day) => (
          <button
            key={day.date}
            className={cn(
              'flex flex-col items-center gap-1.5 py-2.5 px-3.5 rounded-[12px] min-w-[52px] transition-all duration-200 flex-shrink-0 cursor-pointer',
              day.isToday
                ? 'bg-accent-green text-bg-primary'
                : 'bg-bg-card border border-border-subtle text-text-secondary hover:bg-bg-elevated'
            )}
          >
            <span className={cn(
              'text-[10px] font-medium uppercase tracking-[0.5px]',
              day.isToday && 'text-bg-primary/70'
            )}>
              {day.dayOfWeek}
            </span>
            <span className={cn(
              'text-sm font-bold',
              day.isToday && 'text-bg-primary'
            )}>
              {day.dayNumber}
            </span>
            {day.hasSession && !day.isToday && (
              <span className={cn(
                'h-1 w-1 rounded-full',
                day.isCompleted ? 'bg-accent-green' : 'bg-text-muted/40'
              )} />
            )}
          </button>
        ))}
      </div>

      {/* Dual Progress Rings */}
      <Card>
        <CardTitle>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7" cy="7" r="5.5" stroke="#7a9170" strokeWidth="1.5"/>
            <path d="M7 4V7L9 9" stroke="#7a9170" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          WEEKLY PROGRESS
        </CardTitle>
        <div className="flex items-center justify-center gap-10 sm:gap-16 py-2">
          <div className="relative flex flex-col items-center">
            <ProgressRing
              percent={mePercent}
              color="#6ec56e"
              label="Me"
              value={`${stats.weekScore || 0}/9`}
              sublabel={`${user?.nickname || 'You'}`}
            />
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center">
              <span className="text-xs font-bold text-text-muted">VS</span>
            </div>
          </div>

          <div className="relative flex flex-col items-center">
            <ProgressRing
              percent={partnerPercent}
              color="#e8b84b"
              label="Partner"
              value={partner?.isBound ? `${partner.partnerScore || 0}/9` : '--'}
              sublabel={partner?.isBound ? partner.partnerNickname : 'Not bound'}
            />
          </div>
        </div>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tasks Stats */}
        <Card variant="stats">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-muted">Tasks Done</span>
            <span className="text-lg">📋</span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {stats.weekTasks || 0}
          </p>
          <p className="text-[10px] text-text-muted/60 mt-0.5">This week</p>
        </Card>

        {/* Score Stats */}
        <Card variant="stats">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-muted">Avg. Score</span>
            <span className="text-lg">⭐</span>
          </div>
          <p className="text-2xl font-bold text-accent-gold">
            {stats.weekScore > 0 ? (stats.weekScore / Math.max(1, stats.weekTasks)).toFixed(1) : '0.0'}
          </p>
          <p className="text-[10px] text-text-muted/60 mt-0.5">Band score</p>
        </Card>

        {/* Flowers Stats */}
        <Card variant="stats">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-text-muted">Flowers</span>
            <span className="text-lg">🌸</span>
          </div>
          <p className="text-2xl font-bold text-accent-green">
            {stats.flowersCollected || 0}
          </p>
          <p className="text-[10px] text-text-muted/60 mt-0.5">Collected</p>
        </Card>
      </div>

      {/* Task List + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Tasks */}
        <Card className="lg:col-span-3">
          <CardTitle>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1.5" y="1.5" width="11" height="11" rx="2" stroke="#7a9170" strokeWidth="1.5"/>
              <path d="M4.5 7L6.5 9L9.5 5" stroke="#7a9170" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            TODAY'S TASKS
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
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] transition-all duration-200 text-left cursor-pointer group',
                    done
                      ? 'bg-accent-green/5'
                      : 'hover:bg-bg-elevated'
                  )}
                >
                  {/* Checkbox */}
                  <span
                    className={cn(
                      'flex-shrink-0 w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-all duration-200',
                      done
                        ? 'bg-accent-green border-accent-green'
                        : 'border-border-subtle group-hover:border-accent-green/50'
                    )}
                  >
                    {done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 5L4.5 7.5L8 2.5" stroke="#0f1a12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>

                  {/* Title */}
                  <span
                    className={cn(
                      'flex-1 text-xs transition-all duration-200',
                      done
                        ? 'text-text-muted line-through'
                        : 'text-text-primary'
                    )}
                  >
                    {task.title}
                  </span>

                  {/* Category Badge */}
                  <span
                    className={cn(
                      'text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0',
                      categoryColors[task.category] || 'bg-bg-elevated text-text-muted'
                    )}
                  >
                    {task.category}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-border-subtle">
            <Button variant="ghost" size="sm" className="w-full">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 2.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2.5 6H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add Task
            </Button>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="lg:col-span-2">
          <CardTitle>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 8.75C9.07107 8.75 10.75 7.07107 10.75 5C10.75 2.92893 9.07107 1.25 7 1.25C4.92893 1.25 3.25 2.92893 3.25 5C3.25 7.07107 4.92893 8.75 7 8.75Z" stroke="#7a9170" strokeWidth="1.5"/>
              <path d="M4.6875 8L3.75 12.25L7 10.75L10.25 12.25L9.3125 8" stroke="#7a9170" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            ACHIEVEMENTS
          </CardTitle>
          <div className="space-y-2.5">
            {mockAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  'flex items-center gap-3 p-2.5 rounded-[10px] transition-all duration-200',
                  achievement.unlocked
                    ? 'bg-accent-gold/8 border border-accent-gold/20'
                    : 'bg-bg-elevated/50'
                )}
              >
                <span className="text-lg flex-shrink-0">{achievement.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      'text-xs font-medium',
                      achievement.unlocked ? 'text-text-primary' : 'text-text-muted'
                    )}>
                      {achievement.title}
                    </span>
                    {achievement.unlocked ? (
                      <Badge variant="success" size="sm">Done</Badge>
                    ) : (
                      <span className="text-[9px] text-text-muted/60 flex-shrink-0">
                        {achievement.progress}/{achievement.total}
                      </span>
                    )}
                  </div>
                  {/* Progress bar */}
                  {!achievement.unlocked && (
                    <div className="mt-1.5 h-1.5 rounded-full bg-border-subtle overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent-green transition-all duration-500"
                        style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button variant="ghost" size="sm" className="w-full mt-3">
            View All
          </Button>
        </Card>
      </div>
    </div>
  )
}
