import { create } from 'zustand'
import type { StudyTask, CalendarDay, TimerState, Achievement, StudyStats } from '@/types'

interface StudyState {
  tasks: StudyTask[]
  calendarDays: CalendarDay[]
  timer: TimerState
  achievements: Achievement[]
  stats: StudyStats

  setTasks: (tasks: StudyTask[]) => void
  addTask: (task: StudyTask) => void
  updateTask: (id: string, updates: Partial<StudyTask>) => void
  removeTask: (id: string) => void
  toggleTaskStatus: (id: string) => void

  setCalendarDays: (days: CalendarDay[]) => void
  setTimer: (timer: Partial<TimerState>) => void
  startTimer: (duration: number) => void
  stopTimer: () => void
  tickTimer: () => void

  setAchievements: (achievements: Achievement[]) => void
  setStats: (stats: Partial<StudyStats>) => void
}

export const useStudyStore = create<StudyState>((set) => ({
  tasks: [],
  calendarDays: [],
  timer: {
    isRunning: false,
    mode: 'idle',
    remaining: 0,
    duration: 0,
    startTime: undefined,
  },
  achievements: [],
  stats: {
    todayDuration: 0,
    weekDuration: 0,
    totalDuration: 0,
    weekTasks: 0,
    weekScore: 0,
    streak: 0,
    level: 1,
    flowersCollected: 0,
  },

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  removeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    })),

  toggleTaskStatus: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== id) return t
        const newStatus =
          t.status === 'completed' ? 'pending' : 'completed'
        return {
          ...t,
          status: newStatus,
          completedAt:
            newStatus === 'completed'
              ? new Date().toISOString()
              : undefined,
        }
      }),
    })),

  setCalendarDays: (days) => set({ calendarDays: days }),

  setTimer: (timer) =>
    set((state) => ({ timer: { ...state.timer, ...timer } })),

  startTimer: (duration) =>
    set({
      timer: {
        isRunning: true,
        mode: 'focus',
        remaining: duration * 60,
        duration: duration * 60,
        startTime: Date.now(),
      },
    }),

  stopTimer: () =>
    set((state) => ({
      timer: { ...state.timer, isRunning: false, mode: 'idle' },
    })),

  tickTimer: () =>
    set((state) => {
      if (!state.timer.isRunning || state.timer.remaining <= 0) {
        return { timer: { ...state.timer, isRunning: false, mode: 'idle' } }
      }
      return {
        timer: {
          ...state.timer,
          remaining: state.timer.remaining - 1,
          mode: state.timer.remaining - 1 <= 0 ? 'break' : 'focus',
        },
      }
    }),

  setAchievements: (achievements) => set({ achievements }),

  setStats: (stats) =>
    set((state) => ({ stats: { ...state.stats, ...stats } })),
}))
