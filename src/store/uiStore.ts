import { create } from 'zustand'

export interface ToastItem {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface UIState {
  currentPage: string
  sidebarCollapsed: boolean
  sidebarOpen: boolean
  toasts: ToastItem[]
  modal: {
    isOpen: boolean
    content: React.ReactNode | null
    title?: string
  }

  setCurrentPage: (page: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  addToast: (toast: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
  openModal: (content: React.ReactNode, title?: string) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  currentPage: 'dashboard',
  sidebarCollapsed: false,
  sidebarOpen: false,
  toasts: [],
  modal: {
    isOpen: false,
    content: null,
    title: undefined,
  },

  setCurrentPage: (page) => set({ currentPage: page }),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newToast: ToastItem = { ...toast, id }
    set((state) => ({ toasts: [...state.toasts, newToast] }))

    const duration = toast.duration ?? 4000
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }))
    }, duration)
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  openModal: (content, title) =>
    set({ modal: { isOpen: true, content, title } }),

  closeModal: () =>
    set({ modal: { isOpen: false, content: null, title: undefined } }),
}))
