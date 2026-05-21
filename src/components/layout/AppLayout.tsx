import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { ToastContainer } from '@/components/ui/Toast'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useStudyStore } from '@/store/studyStore'
import { cn } from '@/utils/cn'
import { mockUser, mockPartner, mockStudyTasks, mockStudyStats, mockAchievements } from '@/test/mockData'

// Lazy load pages
import Dashboard from '@/pages/Dashboard'
import Writing from '@/pages/Writing'
import Upload from '@/pages/Upload'
import Settings from '@/pages/Settings'
import Skills from '@/pages/Skills'
import Study from '@/pages/Study'
import FocusTimer from '@/pages/FocusTimer'
import Reading from '@/pages/Reading'
import Listening from '@/pages/Listening'
import Speaking from '@/pages/Speaking'
import Analytics from '@/pages/Analytics'
import Achievements from '@/pages/Achievements'
import Vocab from '@/pages/Vocab'
import Leaderboard from '@/pages/Leaderboard'
import DailyMessages from '@/pages/DailyMessages'
import Square from '@/pages/Square'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8V12L15 15" stroke="#7a9170" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="9" stroke="#7a9170" strokeWidth="2"/>
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">{title}</h2>
        <p className="text-sm text-text-muted">Coming soon</p>
      </div>
    </div>
  )
}

export default function AppLayout() {
  const location = useLocation()
  const { sidebarCollapsed, sidebarOpen, setSidebarOpen, setCurrentPage } = useUIStore()
  const { login, bindPartner } = useAuthStore()
  const { setTasks, setStats, setAchievements } = useStudyStore()

  // Initialize mock data for development
  useEffect(() => {
    login(mockUser)
    bindPartner(mockPartner)
    setTasks(mockStudyTasks)
    setStats(mockStudyStats)
    setAchievements(mockAchievements)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update current page based on location
  useEffect(() => {
    setCurrentPage(location.pathname)
  }, [location.pathname, setCurrentPage])

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname, setSidebarOpen])

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="absolute left-0 top-0 h-full w-[240px]"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300',
          'md:ml-[240px]',
          sidebarCollapsed && 'md:ml-[72px]',
          'pb-[64px] md:pb-0'
        )}
      >
        <Header />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/study" element={<Study />} />
            <Route path="/timer" element={<FocusTimer />} />
            <Route path="/reading" element={<Reading />} />
            <Route path="/listening" element={<Listening />} />
            <Route path="/writing" element={<Writing />} />
            <Route path="/speaking" element={<Speaking />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/vocab" element={<Vocab />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/daily" element={<DailyMessages />} />
            <Route path="/square" element={<Square />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Mobile Bottom Nav */}
        <MobileNav />
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  )
}
