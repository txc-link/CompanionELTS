export default function Upload() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15V3" stroke="#7a9170" strokeWidth="2" strokeLinecap="round"/>
            <path d="M7 8L12 3L17 8" stroke="#7a9170" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 16V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V16" stroke="#7a9170" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Upload Materials</h2>
        <p className="text-sm text-text-muted">Upload your IELTS practice materials</p>
      </div>
    </div>
  )
}
