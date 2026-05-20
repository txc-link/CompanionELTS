export interface User {
  id: string
  email: string
  nickname: string
  avatarUrl?: string
  createdAt: string
  level?: number
  studyStreak?: number
  totalScore?: number
  tasksCompleted?: number
  flowersCollected?: number
}

export interface Partner {
  id: string
  userId: string
  partnerUserId?: string
  partnerNickname?: string
  partnerAvatarUrl?: string
  bindCode: string
  bindAt?: string
  isBound: boolean
  partnerLevel?: number
  partnerStreak?: number
  partnerScore?: number
  partnerTasks?: number
  partnerFlowers?: number
}

export interface AuthState {
  user: User | null
  partner: Partner | null
  isLoading: boolean
  isAuthenticated: boolean
}
