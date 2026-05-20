import { useUIStore } from '@/store/uiStore'
import { cn } from '@/utils/cn'

const toastStyles = {
  success: 'border-accent-green/30 bg-accent-green/10',
  error: 'border-danger/30 bg-danger/10',
  warning: 'border-accent-gold/30 bg-accent-gold/10',
  info: 'border-info/30 bg-info/10',
}

const toastIcons = {
  success: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 4.5L6.75 12.75L3 9" stroke="#6ec56e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="6" stroke="#e85b4b" strokeWidth="1.5"/>
      <path d="M6.75 6.75L11.25 11.25" stroke="#e85b4b" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M11.25 6.75L6.75 11.25" stroke="#e85b4b" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 6.75V9.75" stroke="#e8b84b" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 11.625V11.6325" stroke="#e8b84b" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3.825 14.25H14.175C14.8125 14.25 15.2175 13.5975 14.9175 13.05L10.3425 4.725C10.035 4.185 9.315 4.185 9.0075 4.725L4.4325 13.05C4.1325 13.5975 4.5375 14.25 5.175 14.25H3.825Z" stroke="#e8b84b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="6" stroke="#5b9bd5" strokeWidth="1.5"/>
      <path d="M9 8.25V11.25" stroke="#5b9bd5" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 6.375V6.3825" stroke="#5b9bd5" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-[10px] border px-4 py-3 min-w-[300px] max-w-[420px] shadow-lg animate-in slide-in-from-right-4 fade-in duration-200',
            toastStyles[toast.type]
          )}
        >
          <span className="flex-shrink-0 mt-0.5">
            {toastIcons[toast.type]}
          </span>
          <p className="flex-1 text-sm text-text-primary leading-snug">
            {toast.message}
          </p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 p-0.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
