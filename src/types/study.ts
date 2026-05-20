export interface StudyTask {
  id: string
  userId: string
  title: string
  description?: string
  category: 'reading' | 'listening' | 'writing' | 'speaking' | 'vocabulary' | 'grammar'
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
  dueDate?: string
  completedAt?: string
  createdAt: string
  score?: number
  duration?: number
}

export interface StudySession {
  id: string
  userId: string
  date: string
  duration: number
  tasksCompleted: number
  score: number
}

export interface CalendarDay {
  date: string
  dayOfWeek: string
  dayNumber: number
  isToday: boolean
  isCompleted: boolean
  hasSession: boolean
  intensity: number
}

export interface TimerState {
  isRunning: boolean
  mode: 'focus' | 'break' | 'idle'
  remaining: number
  duration: number
  startTime?: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
  progress: number
  total: number
}

export interface StudyStats {
  todayDuration: number
  weekDuration: number
  totalDuration: number
  weekTasks: number
  weekScore: number
  streak: number
  level: number
  flowersCollected: number
}
