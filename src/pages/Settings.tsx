export default function Settings() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="3" stroke="#7a9170" strokeWidth="2"/>
            <path d="M12 1.5V5" stroke="#7a9170" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 19V22.5" stroke="#7a9170" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4.5 4.5L7 7" stroke="#7a9170" strokeWidth="2" strokeLinecap="round"/>
            <path d="M17 17L19.5 19.5" stroke="#7a9170" strokeWidth="2" strokeLinecap="round"/>
            <path d="M1.5 12H5" stroke="#7a9170" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19 12H22.5" stroke="#7a9170" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4.5 19.5L7 17" stroke="#7a9170" strokeWidth="2" strokeLinecap="round"/>
            <path d="M17 7L19.5 4.5" stroke="#7a9170" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Settings</h2>
        <p className="text-sm text-text-muted">Manage your preferences</p>
      </div>
    </div>
  )
}
