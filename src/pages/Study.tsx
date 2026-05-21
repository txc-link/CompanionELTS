import { useState } from 'react'
import { cn } from '@/utils/cn'
import { useStudyStore } from '@/store/studyStore'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Card, CardTitle } from '@/components/ui/Card'
import type { StudyTask } from '@/types/study'

// ─── Mock Calendar Data ───────────────────────────────────────────────────────
const today = new Date()
const year = today.getFullYear()
const month = today.getMonth()

function getCalendarDays(year: number, month: number): Array<{
  date: Date
  dayNumber: number
  isToday: boolean
  isCurrentMonth: boolean
  intensity: number
  hasSession: boolean
  completed: boolean
}> {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()
  const days: Array<{
    date: Date
    dayNumber: number
    isToday: boolean
    isCurrentMonth: boolean
    intensity: number
    hasSession: boolean
    completed: boolean
  }> = []

  // Pad with previous month days
  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({
      date: d,
      dayNumber: d.getDate(),
      isToday: false,
      isCurrentMonth: false,
      intensity: 0,
      hasSession: false,
      completed: false,
    })
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    const intensity = Math.floor(Math.random() * 4)
    days.push({
      date: d,
      dayNumber: i,
      isToday,
      isCurrentMonth: true,
      intensity,
      hasSession: intensity > 0,
      completed: intensity >= 3,
    })
  }

  // Pad with next month days to fill 6 rows
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({
      date: d,
      dayNumber: i,
      isToday: false,
      isCurrentMonth: false,
      intensity: 0,
      hasSession: false,
      completed: false,
    })
  }

  return days
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const PRIORITY_COLORS = {
  high: 'border-l-danger bg-danger/5',
  medium: 'border-l-accent-gold bg-accent-gold/5',
  low: 'border-l-border-accent bg-bg-elevated/50',
}

const CATEGORY_ICONS: Record<StudyTask['category'], string> = {
  reading: '\uD83D\uDCD6',
  listening: '\uD83C\uDFA7',
  writing: '\u270D\uFE0F',
  speaking: '\uD83C\uDFA4',
  vocabulary: '\uD83D\uDCDA',
  grammar: '\uD83E\uDDE0',
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Study() {
  const [currentYear, setCurrentYear] = useState(year)
  const [currentMonth, setCurrentMonth] = useState(month)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState<StudyTask['category']>('reading')
  const [newTaskPriority, setNewTaskPriority] = useState<StudyTask['priority']>('medium')
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().slice(0, 10))

  const { tasks, toggleTaskStatus } = useStudyStore()

  const calendarDays = getCalendarDays(currentYear, currentMonth)

  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const pendingTasks = tasks.filter((t) => t.status !== 'completed')
  const todayStr = today.toISOString().split('T')[0]
  const todayCompleted = completedTasks.filter(
    (t) => t.completedAt?.startsWith(todayStr)
  ).length

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {'\uD83E\uDDE0'} AI 学习规划
          </h1>
          <p className="text-sm text-text-muted mt-1">
            智能排课表 · 助力高分破局
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)}>
          + 添加任务
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Calendar */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-[8px] hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h2 className="text-base font-bold text-text-primary">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-[8px] hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEK_DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-[11px] font-semibold text-text-muted py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDate === day.date.toISOString().slice(0, 10)
                return (
                <div
                  key={idx}
                  onClick={() => day.isCurrentMonth && setSelectedDate(day.date.toISOString().slice(0, 10))}
                  className={cn(
                    'relative flex flex-col items-center justify-start pt-1.5 pb-1 rounded-[8px] text-xs',
                    'min-h-[52px] transition-all duration-200',
                    day.isCurrentMonth
                      ? isSelected
                        ? 'bg-accent-green text-bg-primary cursor-pointer shadow-[0_2px_8px_rgba(110,197,110,0.2)]'
                        : day.isToday
                        ? 'bg-accent-green/10 border border-accent-green/40 cursor-pointer hover:bg-accent-green/15'
                        : 'hover:bg-bg-elevated cursor-pointer'
                      : 'opacity-30 pointer-events-none',
                  )}
                >
                  <span
                    className={cn(
                      'font-semibold text-[13px] leading-none mb-1',
                      day.isToday ? 'text-accent-green' : 'text-text-secondary'
                    )}
                  >
                    {day.dayNumber}
                  </span>

                  {/* Session dot indicator */}
                  {day.hasSession && (
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: day.intensity }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            day.completed
                              ? 'bg-accent-green'
                              : 'bg-accent-gold'
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {/* Today label */}
                  {day.isToday && (
                    <span className="text-[9px] text-accent-green font-medium mt-0.5">TODAY</span>
                  )}
                </div>
              )})}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border-subtle">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent-gold" />
                <span className="text-[10px] text-text-muted">学习中</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent-green" />
                <span className="text-[10px] text-text-muted">已完成</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent-green" />
                <span className="text-[10px] text-text-muted">已选中</span>
              </div>
            </div>
          </Card>

          {/* Weekly Stats */}
          <Card>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '\u4ECA\u65E5\u5B8C\u6210', value: `${todayCompleted}`, unit: '\u4EF6', color: 'text-accent-green' },
                { label: '\u672C\u5468\u5B8C\u6210', value: '14', unit: '\u4EF6', color: 'text-accent-gold' },
                { label: '\u7ED9\u5206\u7387', value: '89%', unit: '', color: 'text-info' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
                  <p className="text-[11px] text-text-muted">{stat.label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Task List */}
        <div className="space-y-4">
          <Card>
            <CardTitle>\u4EF6\u4E1A\u52A1\u5217\u8868</CardTitle>

            {pendingTasks.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-text-muted">\u6CA1\u6709\u5F85\u5B8C\u6210\u4EFB\u52A1</p>
                <Button variant="secondary" size="sm" className="mt-2" onClick={() => setAddModalOpen(true)}>
                  \u6DFB\u52A0\u4E00\u4E2A
                </Button>
              </div>
            )}

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    'rounded-[10px] border-l-2 p-3 cursor-pointer transition-all duration-200',
                    'hover:bg-bg-elevated group',
                    PRIORITY_COLORS[task.priority]
                  )}
                  onClick={() => toggleTaskStatus(task.id)}
                >
                  <div className="flex items-start gap-2">
                    {/* Checkbox */}
                    <div
                      className={cn(
                        'w-4 h-4 rounded-[4px] border flex-shrink-0 mt-0.5',
                        'transition-all duration-200',
                        task.status === 'completed'
                          ? 'bg-accent-green border-accent-green'
                          : 'border-border-accent group-hover:border-accent-green/60'
                      )}
                    >
                      {task.status === 'completed' && (
                        <svg className="w-full h-full text-bg-primary p-0.5" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{CATEGORY_ICONS[task.category]}</span>
                        <span className={cn(
                          'text-xs font-medium truncate',
                          task.status === 'completed'
                            ? 'text-text-muted line-through'
                            : 'text-text-primary'
                        )}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full',
                          task.priority === 'high' ? 'bg-danger/15 text-danger' :
                          task.priority === 'medium' ? 'bg-accent-gold/15 text-accent-gold' :
                          'bg-bg-elevated text-text-muted'
                        )}>
                          {task.priority === 'high' ? '\u9AD8' : task.priority === 'medium' ? '\u4E2D' : '\u4F4E'}
                        </span>
                        <span className="text-[10px] text-text-muted">{CATEGORY_ICONS[task.category]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {completedTasks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border-subtle">
                <p className="text-[11px] text-text-muted mb-2">
                  \u5DF2\u5B8C\u6210 {completedTasks.length} \u4EF6
                </p>
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                  {completedTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskStatus(task.id)}
                      className="flex items-center gap-2 text-xs text-text-muted cursor-pointer hover:text-text-secondary transition-colors line-through"
                    >
                      <span>{CATEGORY_ICONS[task.category]}</span>
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Weekly Plan */}
          <Card>
            <CardTitle>\u672C\u5468\u8BA1\u5212</CardTitle>
            <div className="space-y-2.5">
              {[
                { day: '\u5468\u4E00', task: '\u542C\u529B\u771F\u9898 1\u5957', done: true, icon: '\uD83C\uDFA7' },
                { day: '\u5468\u4E8C', task: '\u5199\u4F5C Task2 \u4E00\u7BC7', done: true, icon: '\u270D\uFE0F' },
                { day: '\u5468\u4E09', task: '\u9605\u8BFB\u7C7B\u578B\u7EC3\u4E60', done: false, icon: '\uD83D\uDCD6' },
                { day: '\u5468\u56DB', task: '\u53E3\u8BED Part1 \u7EC3\u4E60', done: false, icon: '\uD83C\uDFA4' },
                { day: '\u5468\u4E94', task: '\u8BCD\u6C47\u590D\u4E60', done: false, icon: '\uD83D\uDCDA' },
              ].map((item) => (
                <div
                  key={item.day}
                  className={cn(
                    'flex items-center gap-3 rounded-[8px] p-2.5 transition-all duration-200',
                    item.done ? 'bg-accent-green/5' : 'bg-bg-elevated hover:bg-border-subtle'
                  )}
                >
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-xs font-medium',
                      item.done ? 'text-text-muted line-through' : 'text-text-primary'
                    )}>
                      {item.task}
                    </p>
                    <p className="text-[10px] text-text-muted">{item.day}</p>
                  </div>
                  {item.done && (
                    <div className="w-4 h-4 rounded-full bg-accent-green flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-bg-primary" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="\u6DFB\u52A0\u4EFB\u52A1"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="\u4EFB\u52A1\u540D\u79F0"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="\u4E3A\u4EFB\u52A1\u8D4B\u4E00\u4E2A\u540D\u79F0\u2026"
          />

          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">
              \u4EFB\u52A1\u7C7B\u578B
            </label>
            <div className="flex flex-wrap gap-2">
              {(['reading', 'listening', 'writing', 'speaking', 'vocabulary'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewTaskCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all duration-200 cursor-pointer',
                    newTaskCategory === cat
                      ? 'bg-accent-green text-bg-primary'
                      : 'bg-bg-elevated text-text-secondary border border-border-subtle hover:border-accent-green/50'
                  )}
                >
                  {CATEGORY_ICONS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">
              \u4EFB\u52A1\u4F18\u5148\u7EA7
            </label>
            <div className="flex gap-2">
              {(['high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewTaskPriority(p)}
                  className={cn(
                    'px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all duration-200 cursor-pointer',
                    newTaskPriority === p
                      ? p === 'high' ? 'bg-danger text-white'
                        : p === 'medium' ? 'bg-accent-gold text-bg-primary'
                        : 'bg-accent-green text-bg-primary'
                      : 'bg-bg-elevated text-text-secondary border border-border-subtle'
                  )}
                >
                  {p === 'high' ? '\u9AD8' : p === 'medium' ? '\u4E2D' : '\u4F4E'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setAddModalOpen(false)}>
              \u53D6\u6D88
            </Button>
            <Button variant="primary" size="sm" onClick={() => {
              if (!newTaskTitle.trim()) return
              // In real app, this would use addTask from store
              setAddModalOpen(false)
              setNewTaskTitle('')
            }}>
              \u786E\u8BA4\u6DFB\u52A0
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}