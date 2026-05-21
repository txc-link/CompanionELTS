import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'

const pageTitles: Record<string, string> = {
  '/': '首页',
  '/dashboard': '首页',
  '/study': '学习计划',
  '/timer': '专注计时',
  '/reading': '阅读练习',
  '/listening': '听力练习',
  '/writing': '写作练习',
  '/speaking': '口语练习',
  '/analytics': '分析',
  '/achievements': '成就',
  '/settings': '设置',
  '/upload': '上传中心',
  '/vocab': '词汇',
  '/skills': 'AI 中心',
  '/leaderboard': '排行榜',
  '/square': '学习广场',
  '/daily': '每日消息',
}

export function Header() {
  const { user, partner } = useAuthStore()
  const { currentPage, setSidebarOpen } = useUIStore()

  const title = pageTitles[currentPage] || 'Dashboard'
  const streak = user?.studyStreak || 0

  return (
    <header className="h-[64px] bg-bg-primary border-b border-border-subtle flex items-center justify-between px-6 md:px-8 flex-shrink-0">
      {/* Left: Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        {/* Hamburger (mobile) */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-2 -ml-2 rounded-[6px] text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer"
          aria-label="Open sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.125 5H16.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M3.125 10H16.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M3.125 15H16.875" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Page Title */}
        <h1 className="text-lg font-semibold text-text-primary hidden sm:block">
          {title}
        </h1>
      </div>

      {/* Right: Streak + Notification + Avatar */}
      <div className="flex items-center gap-3">
        {/* Streak Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-accent-amber/10 border border-accent-amber/20">
          <span className="streak-flame text-sm">🔥</span>
          <span className="text-xs font-semibold text-accent-amber">{streak}</span>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-[8px] text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 1.5C6.51472 1.5 4.5 3.51472 4.5 6V8.25C4.5 8.8875 4.2675 9.8025 3.8775 10.6125L3.1425 12.0825C2.55 13.2675 3.0225 14.25 4.35 14.25H13.65C14.9775 14.25 15.45 13.2675 14.8575 12.0825L14.1225 10.6125C13.7325 9.8025 13.5 8.8875 13.5 8.25V6C13.5 3.51472 11.4853 1.5 9 1.5Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M11.25 14.25C11.25 15.4926 10.2426 16.5 9 16.5C7.75736 16.5 6.75 15.4926 6.75 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-text-primary leading-tight">
              {user?.nickname || 'User'}
            </p>
            <p className="text-[10px] text-text-muted">
              Lv.{user?.level || 1}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-accent-green/20 border border-accent-green/30 flex items-center justify-center flex-shrink-0">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.nickname}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-accent-green font-semibold text-sm">
                {(user?.nickname || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
