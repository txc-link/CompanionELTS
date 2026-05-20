export default function Skills() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C14.4853 15 16.5 12.9853 16.5 10.5C16.5 8.01472 14.4853 6 12 6C9.51472 6 7.5 8.01472 7.5 10.5C7.5 12.9853 9.51472 15 12 15Z" stroke="#7a9170" strokeWidth="2"/>
            <path d="M8.0625 13.75L6 21L12 18L18 21L15.9375 13.75" stroke="#7a9170" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Skills</h2>
        <p className="text-sm text-text-muted">Track your IELTS skills progress</p>
      </div>
    </div>
  )
}
