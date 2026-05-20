import { create } from 'zustand'
import type { User, Partner } from '@/types'

interface AuthState {
  user: User | null
  partner: Partner | null
  isLoading: boolean
  isAuthenticated: boolean

  setUser: (user: User | null) => void
  setPartner: (partner: Partner | null) => void
  setLoading: (loading: boolean) => void
  login: (user: User) => void
  logout: () => void
  bindPartner: (partner: Partner) => void
  unbindPartner: () => void
  updateUser: (updates: Partial<User>) => void
  updatePartner: (updates: Partial<Partner>) => void
}

const initialState = {
  user: null as User | null,
  partner: null as Partner | null,
  isLoading: true,
  isAuthenticated: false,
}

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,

  setUser: (user) =>
    set({ user, isAuthenticated: user !== null }),

  setPartner: (partner) => set({ partner }),

  setLoading: (isLoading) => set({ isLoading }),

  login: (user) =>
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
    }),

  logout: () =>
    set({
      user: null,
      partner: null,
      isAuthenticated: false,
      isLoading: false,
    }),

  bindPartner: (partner) => set({ partner }),

  unbindPartner: () => set({ partner: null }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  updatePartner: (updates) =>
    set((state) => ({
      partner: state.partner ? { ...state.partner, ...updates } : null,
    })),
}))
