import type { User, Partner, StudyTask, Achievement, StudyStats } from '@/types'

// ─── Auth Mock Data ───────────────────────────────────────────────────────
export const mockUser: User = {
  id: 'user-1',
  email: 'kaoyaren@example.com',
  nickname: '烤鸭人',
  avatarUrl: undefined,
  level: 3,
  studyStreak: 5,
  flowersCollected: 120,
  totalScore: 0,
  tasksCompleted: 0,
  createdAt: '2026-01-01T00:00:00Z',
}

export const mockPartner: Partner = {
  id: 'partner-1',
  userId: 'user-1',
  partnerUserId: 'partner-1',
  partnerNickname: '小明',
  partnerAvatarUrl: undefined,
  bindCode: 'ABCD12',
  isBound: true,
  partnerLevel: 2,
  partnerStreak: 3,
  partnerScore: 5.5,
  partnerTasks: 10,
  partnerFlowers: 80,
  bindAt: '2026-01-15T00:00:00Z',
}

// ─── Study Mock Data ───────────────────────────────────────────────────────
export const mockStudyTasks: StudyTask[] = [
  { id: 'st1', userId: 'user-1', title: '完成阅读篇章3', category: 'reading', priority: 'high', status: 'pending', createdAt: '2026-05-21T00:00:00Z' },
  { id: 'st2', userId: 'user-1', title: '复习词汇表 - 第四周', category: 'vocabulary', priority: 'medium', status: 'pending', createdAt: '2026-05-21T00:00:00Z' },
  { id: 'st3', userId: 'user-1', title: '写作Task2作文：科技话题', category: 'writing', priority: 'high', status: 'completed', createdAt: '2026-05-21T00:00:00Z', completedAt: '2026-05-21T10:00:00Z' },
  { id: 'st4', userId: 'user-1', title: '听力练习 - Section 4', category: 'listening', priority: 'medium', status: 'pending', createdAt: '2026-05-21T00:00:00Z' },
  { id: 'st5', userId: 'user-1', title: '口语模拟测试 - Part 2', category: 'speaking', priority: 'low', status: 'pending', createdAt: '2026-05-21T00:00:00Z' },
  { id: 'st6', userId: 'user-1', title: '语法：条件句复习', category: 'grammar', priority: 'medium', status: 'completed', createdAt: '2026-05-21T00:00:00Z', completedAt: '2026-05-21T11:00:00Z' },
]

export const mockAchievements: Achievement[] = [
  { id: 'a1', title: '连续7天', description: '坚持学习一周，滴水穿石', icon: '🔥', progress: 5, total: 7 },
  { id: 'a2', title: '首篇作文', description: '完成第一篇写作练习', icon: '✍️', progress: 1, total: 1, unlockedAt: '2026-05-01T00:00:00Z' },
  { id: 'a3', title: '听力大师', description: '连续10篇听力8分以上', icon: '🎧', progress: 8, total: 10 },
  { id: 'a4', title: '词汇之星', description: '背完雅思核心3000词', icon: '📚', progress: 24, total: 50 },
]

export const mockStudyStats: StudyStats = {
  todayDuration: 3600,
  weekDuration: 18000,
  totalDuration: 864000,
  weekTasks: 14,
  weekScore: 38,
  streak: 5,
  level: 3,
  flowersCollected: 120,
}

/**
 * Initialize stores with mock data for development.
 * Import and call this in AppLayout's useEffect.
 */
export function initMockData() {
  // This function is called directly in AppLayout,
  // no dynamic require needed - just import stores
}