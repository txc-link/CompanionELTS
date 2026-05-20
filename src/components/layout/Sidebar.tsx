import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

const navGroups = [
  {
    label: 'MAIN MENU',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { to: '/study', label: 'Study Plan', icon: 'study' },
      { to: '/timer', label: 'Focus Timer', icon: 'timer' },
    ],
  },
  {
    label: 'SKILLS',
    items: [
      { to: '/reading', label: 'Reading', icon: 'reading' },
      { to: '/listening', label: 'Listening', icon: 'listening' },
      { to: '/writing', label: 'Writing', icon: 'writing' },
      { to: '/speaking', label: 'Speaking', icon: 'speaking' },
    ],
  },
  {
    label: 'PROGRESS',
    items: [
      { to: '/analytics', label: 'Analytics', icon: 'analytics' },
      { to: '/achievements', label: 'Achievements', icon: 'achievements' },
    ],
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/settings', label: 'Settings', icon: 'settings' },
      { to: '/upload', label: 'Upload', icon: 'upload' },
    ],
  },
]

const iconMap: Record<string, React.ReactNode> = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="1.5" width="6.75" height="6.75" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9.75" y="1.5" width="6.75" height="3.75" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="9.75" y="7.5" width="6.75" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="1.5" y="10.5" width="6.75" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  study: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 14.25V3.75C3 3.33579 3.33579 3 3.75 3H14.25C14.6642 3 15 3.33579 15 3.75V12H3Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 12H15V14.25C15 14.6642 14.6642 15 14.25 15H3.75C3.33579 15 3 14.6642 3 14.25V12Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M6.75 6.75H11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  timer: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="10.5" r="5.25" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 2.25V3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5.25 3L6.75 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12.75 3L11.25 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 8.25V10.5L10.5 11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  reading: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.25 13.5V3.75C2.25 3.33579 2.58579 3 3 3H6C6.82843 3 7.5 3.67157 7.5 4.5V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15.75 13.5V3.75C15.75 3.33579 15.4142 3 15 3H12C11.1716 3 10.5 3.67157 10.5 4.5V13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2.25 13.5C2.25 14.3284 2.92157 15 3.75 15H14.25C15.0784 15 15.75 14.3284 15.75 13.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  listening: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 2.25C6.10051 2.25 3.75 4.60051 3.75 7.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14.25 10.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="2.25" y="10.5" width="3" height="3.75" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="12.75" y="10.5" width="3" height="3.75" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 13.5V15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  writing: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.75 2.25L15.75 5.25L7.5 13.5H4.5V10.5L12.75 2.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.25 15.75H15.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  speaking: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11.25C11.0711 11.25 12.75 9.57107 12.75 7.5V5.25C12.75 3.17893 11.0711 1.5 9 1.5C6.92893 1.5 5.25 3.17893 5.25 5.25V7.5C5.25 9.57107 6.92893 11.25 9 11.25Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3.75 8.25C3.75 11.1475 6.1025 13.5 9 13.5C11.8975 13.5 14.25 11.1475 14.25 8.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 13.5V16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6.75 16.5H11.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="10.5" width="3.75" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="7.5" y="6" width="3.75" height="10.5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="13.5" y="1.5" width="3.75" height="15" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  achievements: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11.25C11.4853 11.25 13.5 9.23528 13.5 6.75C13.5 4.26472 11.4853 2.25 9 2.25C6.51472 2.25 4.5 4.26472 4.5 6.75C4.5 9.23528 6.51472 11.25 9 11.25Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5.8125 10.3125L4.5 15.75L9 13.5L13.5 15.75L12.1875 10.3125" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="2.25" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 1.5V3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 14.25V16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3.75 3.75L5.25 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12.75 12.75L14.25 14.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M1.5 9H3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14.25 9H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3.75 14.25L5.25 12.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12.75 5.25L14.25 3.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  upload: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11.25V2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5.25 6L9 2.25L12.75 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2.25 12V14.25C2.25 15.0784 2.92157 15.75 3.75 15.75H14.25C15.0784 15.75 15.75 15.0784 15.75 14.25V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

export function Sidebar() {
  const { user, partner } = useAuthStore()
  const { sidebarCollapsed } = useUIStore()
  const location = useLocation()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-bg-secondary border-r border-border-subtle flex flex-col z-40 transition-all duration-300',
        sidebarCollapsed ? 'w-[72px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-[64px] border-b border-border-subtle px-4 flex-shrink-0',
        sidebarCollapsed && 'justify-center px-0'
      )}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-accent-green flex items-center justify-center flex-shrink-0">
            <span className="text-bg-primary font-bold text-sm">P</span>
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-text-primary text-sm tracking-wide">
              Partner IELTS
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!sidebarCollapsed && (
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[1px] px-3 mb-2">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.to || 
                  (item.to === '/dashboard' && location.pathname === '/')
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm transition-all duration-200',
                      isActive
                        ? 'bg-accent-green/10 text-accent-green font-medium'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <span className="flex-shrink-0 w-[18px] h-[18px] flex items-center justify-center">
                      {iconMap[item.icon]}
                    </span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Partner Status Box */}
      {!sidebarCollapsed && (
        <div className="flex-shrink-0 p-3 border-t border-border-subtle">
          <div className="rounded-[10px] bg-bg-elevated p-3">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[1px] mb-2">
              PARTNER
            </p>
            {partner?.isBound ? (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent-gold/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent-gold font-semibold text-xs">
                    {partner.partnerNickname?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">
                    {partner.partnerNickname || 'Partner'}
                  </p>
                  <p className="text-[10px] text-accent-gold">Active</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 8C9.933 8 11.5 6.433 11.5 4.5C11.5 2.567 9.933 1 8 1C6.067 1 4.5 2.567 4.5 4.5C4.5 6.433 6.067 8 8 8Z" stroke="#7a9170" strokeWidth="1.5"/>
                    <path d="M1 15C1 11.6863 3.68629 9 7 9H9C12.3137 9 15 11.6863 15 15" stroke="#7a9170" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-muted">No Partner</p>
                  <p className="text-[10px] text-text-muted/60">Bind to start</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
