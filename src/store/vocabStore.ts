import { create } from 'zustand'
import type { VocabWord } from '@/lib/dictionary'
import type { StudyTask } from '@/types/study'

export interface VocabPlan {
  totalWords: number
  dailyTarget: number
  wordsLearned: number
  estimatedDays: number
}

interface VocabTaskState {
  /** 全局单词本 */
  vocabList: VocabWord[]
  /** 词汇学习计划 */
  vocabPlan: VocabPlan

  // 单词本操作
  addWord: (word: VocabWord) => void
  removeWord: (id: string) => void
  hasWord: (word: string) => boolean
  getCount: () => number

  // 计划操作
  setPlanTotal: (total: number) => void
  setDailyTarget: (target: number) => void
}

export const useVocabTaskStore = create<VocabTaskState>((set, get) => ({
  vocabList: [],
  vocabPlan: {
    totalWords: 4500,
    dailyTarget: 30,
    wordsLearned: 0,
    estimatedDays: 150,
  },

  addWord: (word) => {
    const exists = get().vocabList.some((w) => w.word.toLowerCase() === word.word.toLowerCase())
    if (exists) return
    set((state) => {
      const newList = [word, ...state.vocabList]
      const learned = newList.length
      const dailyTarget = state.vocabPlan.dailyTarget
      const remaining = Math.max(0, state.vocabPlan.totalWords - learned)
      const estimatedDays = dailyTarget > 0 ? Math.ceil(remaining / dailyTarget) : remaining
      return {
        vocabList: newList,
        vocabPlan: { ...state.vocabPlan, wordsLearned: learned, estimatedDays },
      }
    })
  },

  removeWord: (id) => {
    set((state) => {
      const newList = state.vocabList.filter((w) => w.id !== id)
      const learned = newList.length
      const dailyTarget = state.vocabPlan.dailyTarget
      const remaining = Math.max(0, state.vocabPlan.totalWords - learned)
      const estimatedDays = dailyTarget > 0 ? Math.ceil(remaining / dailyTarget) : remaining
      return {
        vocabList: newList,
        vocabPlan: { ...state.vocabPlan, wordsLearned: learned, estimatedDays },
      }
    })
  },

  hasWord: (word: string) =>
    get().vocabList.some((w) => w.word.toLowerCase() === word.toLowerCase()),

  getCount: () => get().vocabList.length,

  setPlanTotal: (total) =>
    set((s) => {
      const remaining = Math.max(0, total - s.vocabList.length)
      const estimatedDays = s.vocabPlan.dailyTarget > 0 ? Math.ceil(remaining / s.vocabPlan.dailyTarget) : remaining
      return { vocabPlan: { ...s.vocabPlan, totalWords: total, estimatedDays } }
    }),

  setDailyTarget: (target) =>
    set((s) => {
      const remaining = Math.max(0, s.vocabPlan.totalWords - s.vocabList.length)
      const estimatedDays = target > 0 ? Math.ceil(remaining / target) : remaining
      return { vocabPlan: { ...s.vocabPlan, dailyTarget: target, estimatedDays } }
    }),
}))

/** 将单词转为今日 StudyTask（供 Study/Dashboard 组件使用） */
export function vocabWordToTask(word: VocabWord): StudyTask {
  return {
    id: `task-vocab-${word.word.toLowerCase()}-${Date.now()}`,
    userId: 'current',
    title: word.word,
    description: word.meaning || '从阅读中收藏的生词',
    category: 'vocabulary',
    priority: 'medium',
    status: 'pending',
    dueDate: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString(),
  }
}
