import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

const tabs = [
  {
    to: '/dashboard',
    label: 'Home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 7.5L10 1.66667L17.5 7.5V16.6667C17.5 17.1269 17.3264 17.5682 17.017 17.8776C16.7076 18.187 16.2663 18.3607 15.806 18.3607H4.19403C3.73379 18.3607 3.29244 18.187 2.98305 17.8776C2.67367 17.5682 2.5 17.1269 2.5 16.6667V7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.22223 18.3333V10H12.7778V18.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/study',
    label: 'Study',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.33333 15.8333V4.16667C3.33333 3.70643 3.50694 3.26508 3.81633 2.95569C4.12572 2.6463 4.56707 2.47269 5.02731 2.47269H15.5556C16.0158 2.47269 16.4572 2.6463 16.7666 2.95569C17.076 3.26508 17.2496 3.70643 17.2496 4.16667V13.3333H3.33333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.33333 13.3333C2.8731 13.3333 2.43175 13.507 2.12236 13.8163C1.81297 14.1257 1.63937 14.5671 1.63937 15.0273C1.63937 15.4876 1.81297 15.9289 2.12236 16.2383C2.43175 16.5477 2.8731 16.7213 3.33333 16.7213H16.6667V15.0273" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/timer',
    label: 'Timer',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="11.5" r="5.83333" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 2.5V4.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5.83333 3.33333L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M14.1667 3.33333L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 9.16667V11.6667L11.6667 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    to: '/analytics',
    label: 'Stats',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.66667" y="11.6667" width="4.16667" height="6.66667" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="8.33333" y="6.66667" width="4.16667" height="11.6667" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="15" y="1.66667" width="4.16667" height="16.6667" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="7.5" r="3.33333" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M4.16667 17.5C4.16667 14.2783 6.77834 11.6667 10 11.6667C13.2217 11.6667 15.8333 14.2783 15.8333 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export function MobileNav() {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary border-t border-border-subtle safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.to ||
            (tab.to === '/dashboard' && location.pathname === '/')
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 px-3 rounded-[8px] transition-all duration-200 min-w-[56px]',
                isActive
                  ? 'text-accent-green'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <span className={cn(
                'transition-all duration-200',
                isActive && 'drop-shadow-[0_0_6px_rgba(110,197,110,0.4)]'
              )}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-medium leading-none">
                {tab.label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
