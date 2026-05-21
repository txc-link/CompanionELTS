import { useState, useMemo } from 'react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Card, CardTitle } from '@/components/ui/Card'

// ─── Helpers ───────────────────────────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0') }
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function toMonthStr(year: number, month: number) {
  return `${year}-${pad(month + 1)}`
}

const WEEK_DAYS_ZH = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const MONTH_NAMES_ZH = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
]

// ─── Full Month Mock Data for May 2026 ─────────────────────────────────────
// 31 days, realistic IELTS study plan
const MAY_TASKS = [
  // 5/1 周四
  { id: 'm-1-1', date: '2026-05-01', title: '阅读 Passage 1 精读', category: 'reading' as const, priority: 'medium' as const, status: 'completed' as const },
  { id: 'm-1-2', date: '2026-05-01', title: '听力 Section 1 入门练习', category: 'listening' as const, priority: 'low' as const, status: 'completed' as const },
  { id: 'm-1-3', date: '2026-05-01', title: '词汇 List 1-2 新词学习', category: 'vocabulary' as const, priority: 'high' as const, status: 'completed' as const },
  // 5/2 周五
  { id: 'm-2-1', date: '2026-05-02', title: '写作 Task 1 柱状图练习', category: 'writing' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-2-2', date: '2026-05-02', title: '听力 Section 2 场景对话', category: 'listening' as const, priority: 'medium' as const, status: 'completed' as const },
  { id: 'm-2-3', date: '2026-05-02', title: '词汇 List 3-4 复习', category: 'vocabulary' as const, priority: 'medium' as const, status: 'completed' as const },
  // 5/3 周六
  { id: 'm-3-1', date: '2026-05-03', title: '阅读 Passage 2 精读', category: 'reading' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-3-2', date: '2026-05-03', title: '口语 Part 1 日常话题 5 题', category: 'speaking' as const, priority: 'medium' as const, status: 'completed' as const },
  { id: 'm-3-3', date: '2026-05-03', title: '语法：时态综合复习', category: 'grammar' as const, priority: 'low' as const, status: 'completed' as const },
  // 5/4 周日
  { id: 'm-4-1', date: '2026-05-04', title: '本周错题复盘整理', category: 'writing' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-4-2', date: '2026-05-04', title: '口语 Part 2 独立陈述 2 题', category: 'speaking' as const, priority: 'medium' as const, status: 'completed' as const },
  // 5/5 周一
  { id: 'm-5-1', date: '2026-05-05', title: '阅读 Passage 3 精读', category: 'reading' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-5-2', date: '2026-05-05', title: '听力 Section 3 学术讨论', category: 'listening' as const, priority: 'medium' as const, status: 'completed' as const },
  { id: 'm-5-3', date: '2026-05-05', title: '词汇 List 5-6 新词学习', category: 'vocabulary' as const, priority: 'high' as const, status: 'completed' as const },
  // 5/6 周二
  { id: 'm-6-1', date: '2026-05-06', title: '写作 Task 2 教育话题一篇', category: 'writing' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-6-2', date: '2026-05-06', title: '听力 Section 4 学术讲座', category: 'listening' as const, priority: 'medium' as const, status: 'completed' as const },
  // 5/7 周三
  { id: 'm-7-1', date: '2026-05-07', title: '阅读 Passage 4 精读', category: 'reading' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-7-2', date: '2026-05-07', title: '口语 Part 3 深度讨论 3 题', category: 'speaking' as const, priority: 'medium' as const, status: 'completed' as const },
  { id: 'm-7-3', date: '2026-05-07', title: '词汇 List 7-8 复习', category: 'vocabulary' as const, priority: 'medium' as const, status: 'completed' as const },
  // 5/8 周四
  { id: 'm-8-1', date: '2026-05-08', title: '阅读 Passage 5 精读', category: 'reading' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-8-2', date: '2026-05-08', title: '听力完整一套 Test 1', category: 'listening' as const, priority: 'high' as const, status: 'completed' as const },
  // 5/9 周五
  { id: 'm-9-1', date: '2026-05-09', title: '写作 Task 1 表格题练习', category: 'writing' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-9-2', date: '2026-05-09', title: '词汇 List 9-10 新词学习', category: 'vocabulary' as const, priority: 'medium' as const, status: 'completed' as const },
  // 5/10 周六
  { id: 'm-10-1', date: '2026-05-10', title: '口语 Part 1 常见话题复习', category: 'speaking' as const, priority: 'medium' as const, status: 'completed' as const },
  { id: 'm-10-2', date: '2026-05-10', title: '第二周错题整理', category: 'writing' as const, priority: 'high' as const, status: 'completed' as const },
  // 5/11 周日
  { id: 'm-11-1', date: '2026-05-11', title: '阅读 Passage 6 精读', category: 'reading' as const, priority: 'medium' as const, status: 'completed' as const },
  { id: 'm-11-2', date: '2026-05-11', title: '全科模拟测试一套', category: 'reading' as const, priority: 'high' as const, status: 'completed' as const },
  // 5/12 周一
  { id: 'm-12-1', date: '2026-05-12', title: '阅读 Passage 7 精读', category: 'reading' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-12-2', date: '2026-05-12', title: '听力 Section 2 旅游场景', category: 'listening' as const, priority: 'medium' as const, status: 'completed' as const },
  // 5/13 周二
  { id: 'm-13-1', date: '2026-05-13', title: '写作 Task 2 科技话题一篇', category: 'writing' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-13-2', date: '2026-05-13', title: '词汇 List 11-12 新词', category: 'vocabulary' as const, priority: 'medium' as const, status: 'completed' as const },
  // 5/14 周三
  { id: 'm-14-1', date: '2026-05-14', title: '阅读 Passage 8 精读', category: 'reading' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-14-2', date: '2026-05-14', title: '口语 Part 2 事件描述题 3 题', category: 'speaking' as const, priority: 'medium' as const, status: 'completed' as const },
  // 5/15 周四
  { id: 'm-15-1', date: '2026-05-15', title: '听力完整一套 Test 2', category: 'listening' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-15-2', date: '2026-05-15', title: '语法：从句综合练习', category: 'grammar' as const, priority: 'medium' as const, status: 'completed' as const },
  // 5/16 周五
  { id: 'm-16-1', date: '2026-05-16', title: '写作 Task 1 流程图练习', category: 'writing' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-16-2', date: '2026-05-16', title: '词汇 List 13-14 复习', category: 'vocabulary' as const, priority: 'medium' as const, status: 'completed' as const },
  // 5/17 周六
  { id: 'm-17-1', date: '2026-05-17', title: '阅读 Passage 9 精读', category: 'reading' as const, priority: 'medium' as const, status: 'completed' as const },
  { id: 'm-17-2', date: '2026-05-17', title: '口语 Part 3 社会话题讨论', category: 'speaking' as const, priority: 'medium' as const, status: 'completed' as const },
  // 5/18 周日
  { id: 'm-18-1', date: '2026-05-18', title: '第三周错题复盘', category: 'writing' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-18-2', date: '2026-05-18', title: '全科模拟测试第二套', category: 'reading' as const, priority: 'high' as const, status: 'completed' as const },
  // 5/19 周一
  { id: 'm-19-1', date: '2026-05-19', title: '阅读 Passage 10 精读', category: 'reading' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-19-2', date: '2026-05-19', title: '听力 Section 1 租房场景', category: 'listening' as const, priority: 'medium' as const, status: 'completed' as const },
  { id: 'm-19-3', date: '2026-05-19', title: '写作 Task 2 环境话题一篇', category: 'writing' as const, priority: 'high' as const, status: 'completed' as const },
  // 5/20 周二
  { id: 'm-20-1', date: '2026-05-20', title: '阅读 Passage 11 精读', category: 'reading' as const, priority: 'high' as const, status: 'completed' as const },
  { id: 'm-20-2', date: '2026-05-20', title: '听力 Section 3 导师辅导', category: 'listening' as const, priority: 'medium' as const, status: 'completed' as const },
  { id: 'm-20-3', date: '2026-05-20', title: '词汇 List 15-16 新词', category: 'vocabulary' as const, priority: 'medium' as const, status: 'completed' as const },
  { id: 'm-20-4', date: '2026-05-20', title: '口语 Part 1 工作学习话题', category: 'speaking' as const, priority: 'medium' as const, status: 'completed' as const },
  // 5/21 周三 (今天)
  { id: 'm-21-1', date: '2026-05-21', title: '阅读 Passage 12 精读', category: 'reading' as const, priority: 'high' as const, status: 'pending' as const },
  { id: 'm-21-2', date: '2026-05-21', title: '听力 Section 4 环保讲座', category: 'listening' as const, priority: 'high' as const, status: 'pending' as const },
  { id: 'm-21-3', date: '2026-05-21', title: '写作 Task 1 饼图练习', category: 'writing' as const, priority: 'high' as const, status: 'pending' as const },
  { id: 'm-21-4', date: '2026-05-21', title: '语法：虚拟语气复习', category: 'grammar' as const, priority: 'medium' as const, status: 'pending' as const },
  // 5/22 周四
  { id: 'm-22-1', date: '2026-05-22', title: '阅读 Passage 13 精读', category: 'reading' as const, priority: 'medium' as const, status: 'pending' as const },
  { id: 'm-22-2', date: '2026-05-22', title: '听力完整一套 Test 3', category: 'listening' as const, priority: 'high' as const, status: 'pending' as const },
  { id: 'm-22-3', date: '2026-05-22', title: '写作 Task 2 媒体话题一篇', category: 'writing' as const, priority: 'high' as const, status: 'pending' as const },
  // 5/23 周五
  { id: 'm-23-1', date: '2026-05-23', title: '口语 Part 2 人物描述题 3 题', category: 'speaking' as const, priority: 'medium' as const, status: 'pending' as const },
  { id: 'm-23-2', date: '2026-05-23', title: '词汇 List 17-18 新词', category: 'vocabulary' as const, priority: 'medium' as const, status: 'pending' as const },
  { id: 'm-23-3', date: '2026-05-23', title: '全科模拟测试第三套', category: 'reading' as const, priority: 'high' as const, status: 'pending' as const },
  // 5/24 周六
  { id: 'm-24-1', date: '2026-05-24', title: '第四周错题全面复盘', category: 'writing' as const, priority: 'high' as const, status: 'pending' as const },
  { id: 'm-24-2', date: '2026-05-24', title: '口语 Part 3 文化话题讨论', category: 'speaking' as const, priority: 'medium' as const, status: 'pending' as const },
  // 5/25 周日
  { id: 'm-25-1', date: '2026-05-25', title: '阅读 Passage 14 精读', category: 'reading' as const, priority: 'medium' as const, status: 'pending' as const },
  { id: 'm-25-2', date: '2026-05-25', title: '词汇 List 19-20 复习冲刺', category: 'vocabulary' as const, priority: 'medium' as const, status: 'pending' as const },
  // 5/26 周一
  { id: 'm-26-1', date: '2026-05-26', title: '写作 Task 2 政府话题一篇', category: 'writing' as const, priority: 'high' as const, status: 'pending' as const },
  { id: 'm-26-2', date: '2026-05-26', title: '听力 Section 1 银行场景', category: 'listening' as const, priority: 'medium' as const, status: 'pending' as const },
  // 5/27 周二
  { id: 'm-27-1', date: '2026-05-27', title: '阅读 Passage 15 精读', category: 'reading' as const, priority: 'high' as const, status: 'pending' as const },
  { id: 'm-27-2', date: '2026-05-27', title: '口语 Part 2 地点描述题 2 题', category: 'speaking' as const, priority: 'medium' as const, status: 'pending' as const },
  // 5/28 周三
  { id: 'm-28-1', date: '2026-05-28', title: '听力完整一套 Test 4', category: 'listening' as const, priority: 'high' as const, status: 'pending' as const },
  { id: 'm-28-2', date: '2026-05-28', title: '语法：倒装句练习', category: 'grammar' as const, priority: 'medium' as const, status: 'pending' as const },
  // 5/29 周四
  { id: 'm-29-1', date: '2026-05-29', title: '写作 Task 1 综合题型练习', category: 'writing' as const, priority: 'high' as const, status: 'pending' as const },
  { id: 'm-29-2', date: '2026-05-29', title: '词汇 List 21-22 总复习', category: 'vocabulary' as const, priority: 'medium' as const, status: 'pending' as const },
  // 5/30 周五
  { id: 'm-30-1', date: '2026-05-30', title: '阅读 Passage 16 考前冲刺', category: 'reading' as const, priority: 'high' as const, status: 'pending' as const },
  { id: 'm-30-2', date: '2026-05-30', title: '口语 Part 1+2+3 模拟一套', category: 'speaking' as const, priority: 'high' as const, status: 'pending' as const },
  // 5/31 周六
  { id: 'm-31-1', date: '2026-05-31', title: '全科模拟测试最终套', category: 'reading' as const, priority: 'high' as const, status: 'pending' as const },
  { id: 'm-31-2', date: '2026-05-31', title: '本月错题总复盘', category: 'writing' as const, priority: 'high' as const, status: 'pending' as const },
]

// ─── Category Config ───────────────────────────────────────────────────────
const CAT_ICONS: Record<string, string> = {
  reading: '📖', listening: '🎧', writing: '✍️',
  speaking: '🎤', vocabulary: '📚', grammar: '🧠',
}
const CAT_COLORS: Record<string, string> = {
  reading: 'text-info', listening: 'text-accent-green',
  writing: 'text-accent-gold', speaking: 'text-accent-amber',
  vocabulary: 'text-accent-green', grammar: 'text-info',
}
const PRIORITY_LABEL: Record<string, string> = { high: '高', medium: '中', low: '低' }
const PRIORITY_BG: Record<string, string> = {
  high: 'bg-danger/15 text-danger',
  medium: 'bg-accent-gold/15 text-accent-gold',
  low: 'bg-bg-elevated text-text-muted',
}

// ─── Calendar builder ─────────────────────────────────────────────────────
function buildCalendarDays(year: number, month: number, selectedDate: string) {
  const today = new Date()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = firstDay.getDay()

  const days: Array<{
    dateStr: string
    dayNumber: number
    isToday: boolean
    isCurrentMonth: boolean
    isSelected: boolean
    taskCount: number
    completedCount: number
    tasks: typeof MAY_TASKS
  }> = []

  // Prev month padding
  for (let i = startPad - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    days.push({
      dateStr: toDateStr(d), dayNumber: d.getDate(),
      isToday: false, isCurrentMonth: false, isSelected: false,
      taskCount: 0, completedCount: 0, tasks: [],
    })
  }

  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    const dateStr = toDateStr(d)
    const tasks = MAY_TASKS.filter((t) => t.date === dateStr)
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    days.push({
      dateStr, dayNumber: i,
      isToday, isCurrentMonth: true, isSelected: selectedDate === dateStr,
      taskCount: tasks.length,
      completedCount: tasks.filter((t) => t.status === 'completed').length,
      tasks,
    })
  }

  // Next month padding to fill 6 rows (42 cells)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({
      dateStr: toDateStr(d), dayNumber: i,
      isToday: false, isCurrentMonth: false, isSelected: false,
      taskCount: 0, completedCount: 0, tasks: [],
    })
  }

  return days
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function Study() {
  const today = new Date()
  const thisYear = today.getFullYear()
  const thisMonth = today.getMonth() // 0-indexed

  const [currentYear, setCurrentYear] = useState(thisYear)
  const [currentMonth, setCurrentMonth] = useState(thisMonth)
  const [selectedDate, setSelectedDate] = useState<string>(toDateStr(today))
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState<string>('reading')
  const [newTaskPriority, setNewTaskPriority] = useState<string>('medium')
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set(MAY_TASKS.filter((t) => t.status === 'completed').map((t) => t.id))
  )

  const calendarDays = buildCalendarDays(currentYear, currentMonth, selectedDate)

  // Selected day's tasks - ALL tasks (both pending and completed), completed first
  const selectedDayTasks = useMemo(
    () => MAY_TASKS.filter((t) => t.date === selectedDate)
      .sort((a, b) => {
        const aDone = completedIds.has(a.id)
        const bDone = completedIds.has(b.id)
        if (aDone === bDone) return 0
        return aDone ? -1 : 1 // completed first
      }),
    [selectedDate, completedIds]
  )
  const dayPending = selectedDayTasks.filter((t) => !completedIds.has(t.id))
  const dayCompleted = selectedDayTasks.filter((t) => completedIds.has(t.id))

  // Week stats: current week's completed/pending
  const weekStart = useMemo(() => {
    const d = new Date(selectedDate)
    const day = d.getDay()
    const monday = new Date(d)
    monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
    return monday
  }, [selectedDate])

  const weekTasks = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + 6)
    return MAY_TASKS.filter((t) => {
      const d = new Date(t.date)
      return d >= weekStart && d <= end
    })
  }, [weekStart])

  const weekStats = useMemo(() => {
    const completed = weekTasks.filter((t) => completedIds.has(t.id)).length
    const total = weekTasks.length
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0
    return { completed, total, pct }
  }, [weekTasks, completedIds])

  // Week plan: Mon-Fri for current week
  const weekPlan = useMemo(() => {
    const days = []
    for (let i = 0; i < 5; i++) {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      const dateStr = toDateStr(d)
      const tasks = MAY_TASKS.filter((t) => t.date === dateStr)
      const mainTask = tasks[0]
      days.push({
        dateStr,
        dayLabel: WEEK_DAYS_ZH[d.getDay()],
        task: mainTask ? mainTask.title : null,
        icon: mainTask ? CAT_ICONS[mainTask.category] : '📋',
        done: mainTask ? completedIds.has(mainTask.id) : false,
      })
    }
    return days
  }, [weekStart, completedIds])

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  function toggleTask(id: string) {
    setCompletedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">🧠 AI 学习规划</h1>
          <p className="text-sm text-text-muted mt-1">智能排课表 · 助力高分破局</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)}>
          + 添加任务
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Calendar + Stats */}
        <div className="lg:col-span-2 space-y-4">
          {/* Calendar */}
          <Card>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-1.5 rounded-[8px] hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h2 className="text-base font-bold text-text-primary">
                {MONTH_NAMES_ZH[currentMonth]} {currentYear}
              </h2>
              <button onClick={nextMonth} className="p-1.5 rounded-[8px] hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEK_DAYS_ZH.map((d) => (
                <div key={d} className="text-center text-[11px] font-semibold text-text-muted py-1">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => (
                <div
                  key={idx}
                  onClick={() => day.isCurrentMonth && setSelectedDate(day.dateStr)}
                  className={cn(
                    'relative flex flex-col items-center justify-start pt-1.5 pb-1 rounded-[8px] text-xs',
                    'min-h-[52px] transition-all duration-200',
                    day.isCurrentMonth
                      ? day.isSelected
                        ? 'bg-accent-green text-bg-primary cursor-pointer shadow-[0_2px_8px_rgba(110,197,110,0.2)]'
                        : day.isToday
                        ? 'bg-accent-green/10 border border-accent-green/40 cursor-pointer hover:bg-accent-green/15'
                        : 'hover:bg-bg-elevated cursor-pointer'
                      : 'opacity-30 pointer-events-none',
                  )}
                >
                  <span className={cn(
                    'font-semibold text-[13px] leading-none mb-0.5',
                    day.isToday && !day.isSelected ? 'text-accent-green' : '',
                  )}>
                    {day.dayNumber}
                  </span>
                  {/* Task dots */}
                  {day.taskCount > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: Math.min(day.taskCount, 3) }, (_, i) => (
                        <div
                          key={i}
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            i < day.completedCount ? 'bg-accent-green' : 'bg-accent-gold'
                          )}
                        />
                      ))}
                    </div>
                  )}
                  {day.isToday && !day.isSelected && (
                    <span className="text-[9px] text-accent-green font-medium mt-0.5">今天</span>
                  )}
                </div>
              ))}
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
                { label: '本周完成', value: weekStats.completed, unit: '项', color: 'text-accent-green' },
                { label: '本周总任务', value: weekStats.total, unit: '项', color: 'text-accent-gold' },
                { label: '完成率', value: `${weekStats.pct}%`, unit: '', color: 'text-info' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
                  <p className="text-[11px] text-text-muted">{stat.label}</p>
                  {stat.unit && <p className="text-[9px] text-text-muted/60">{stat.unit}</p>}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Task List + Week Plan */}
        <div className="space-y-4">
          {/* Task List */}
          <Card>
            <CardTitle>
              {selectedDate} 任务列表
              <span className="ml-auto text-text-muted font-normal normal-case tracking-normal text-xs">
                {dayCompleted.length}/{selectedDayTasks.length}
              </span>
            </CardTitle>

            {selectedDayTasks.length === 0 && (
              <div className="text-center py-6">
                <span className="text-3xl">🎉</span>
                <p className="text-sm text-text-muted mt-2">这一天没有安排任务</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={() => setAddModalOpen(true)}>
                  去添加
                </Button>
              </div>
            )}

            {/* All tasks: completed first, then pending */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {selectedDayTasks.map((task) => {
                const done = completedIds.has(task.id)
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      'rounded-[10px] p-3 cursor-pointer transition-all duration-200 hover:bg-bg-elevated',
                      done
                        ? 'bg-accent-green/5 border-l-2 border-l-accent-green'
                        : 'border-l-2 border-l-border-subtle'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {/* Checkbox */}
                      <div
                        className={cn(
                          'w-4 h-4 rounded-[4px] flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200',
                          done
                            ? 'bg-accent-green border-accent-green'
                            : 'border border-border-accent'
                        )}
                      >
                        {done && (
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <path d="M2 5L4.5 7.5L8 2.5" stroke="#0f1a12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{CAT_ICONS[task.category]}</span>
                          <span className={cn(
                            'text-xs transition-all duration-200',
                            done ? 'text-text-muted line-through' : 'text-text-primary'
                          )}>
                            {task.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', PRIORITY_BG[task.priority])}>
                            {PRIORITY_LABEL[task.priority]}
                          </span>
                          {done && (
                            <span className="text-[10px] text-accent-green">已完成</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Week Plan */}
          <Card>
            <CardTitle>本周计划</CardTitle>
            <div className="space-y-2.5">
              {weekPlan.map((item) => (
                <div
                  key={item.dateStr}
                  className={cn(
                    'flex items-center gap-3 rounded-[8px] p-2.5 transition-all duration-200',
                    item.done ? 'bg-accent-green/5' : 'bg-bg-elevated hover:bg-border-subtle'
                  )}
                >
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-medium', item.done ? 'text-text-muted line-through' : 'text-text-primary')}>
                      {item.task || '无任务'}
                    </p>
                    <p className="text-[10px] text-text-muted">{item.dayLabel}</p>
                  </div>
                  {item.done && (
                    <div className="w-4 h-4 rounded-full bg-accent-green flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3 5.5L6.5 2" stroke="#0f1a12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="添加任务" size="sm">
        <div className="space-y-4">
          <Input
            label="任务名称"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="为任务赋予一个名称…"
          />
          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">任务类型</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CAT_ICONS).map(([cat, icon]) => (
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
                  {icon} {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-text-secondary mb-2 block">任务优先级</label>
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
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setAddModalOpen(false)}>取消</Button>
            <Button variant="primary" size="sm" onClick={() => {
              if (!newTaskTitle.trim()) return
              setAddModalOpen(false)
              setNewTaskTitle('')
            }}>确认添加</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
