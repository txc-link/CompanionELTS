import { useState, useEffect, useRef, useCallback } from 'react'
import { useStudyStore } from '@/store/studyStore'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { Card, CardTitle } from '@/components/ui/Card'

// ─── Timer Presets ────────────────────────────────────────────────────────────
const PRESETS = [
  { label: '15\u5206\u949F', minutes: 15, emoji: '\u26A1' },
  { label: '25\u5206\u949F', minutes: 25, emoji: '\u{1F4A1}' },
  { label: '45\u5206\u949F', minutes: 45, emoji: '\u{1F3C0}' },
  { label: '60\u5206\u949F', minutes: 60, emoji: '\u{1F3AE}' },
]

const BREAK_PRESETS = [
  { label: '5\u5206\u949F', minutes: 5 },
  { label: '10\u5206\u949F', minutes: 10 },
  { label: '15\u5206\u949F', minutes: 15 },
]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── Session Ring ────────────────────────────────────────────────────────────
function SessionRing({ progress, size = 220 }: { progress: number; size?: number }) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#2a3d2c"
        strokeWidth="8"
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#6ec56e"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FocusTimer() {
  const { timer, startTimer, stopTimer, tickTimer, stats, setStats } = useStudyStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<number | null>(25)
  const [sessionCount, setSessionCount] = useState(0)
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0)
  const [activeTab, setActiveTab] = useState<'focus' | 'break'>('focus')
  const [breakPreset, setBreakPreset] = useState(5)
  const [isBreakCountdown, setIsBreakCountdown] = useState(false)
  const [breakSeconds, setBreakSeconds] = useState(0)

  // Timer tick
  useEffect(() => {
    if (timer.isRunning) {
      intervalRef.current = setInterval(() => {
        tickTimer()
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timer.isRunning, tickTimer])

  // Auto-complete notification
  useEffect(() => {
    if (timer.remaining === 0 && timer.mode === 'break') {
      setIsBreakCountdown(false)
      setActiveTab('focus')
    }
  }, [timer.remaining, timer.mode])

  const progress = timer.duration > 0
    ? (timer.duration - timer.remaining) / timer.duration
    : 0

  const handleStart = () => {
    if (selectedPreset) {
      startTimer(selectedPreset)
    }
  }

  const handleStop = () => {
    stopTimer()
    setSelectedPreset(null)
    setIsBreakCountdown(false)
    setActiveTab('focus')
  }

  const handleBreakStart = () => {
    const breakSec = breakPreset * 60
    setBreakSeconds(breakSec)
    setIsBreakCountdown(true)
    setActiveTab('break')
  }

  const handleCompleteSession = () => {
    setSessionCount((c) => c + 1)
    setTotalFocusSeconds((s) => s + (selectedPreset ?? 25) * 60)
    stopTimer()
    setSelectedPreset(null)
    handleBreakStart()
  }

  const startBreakCountdown = useCallback(() => {
    if (breakSeconds > 0) {
      setBreakSeconds((s) => s - 1)
    }
  }, [breakSeconds])

  useEffect(() => {
    if (isBreakCountdown && breakSeconds > 0) {
      const id = setInterval(startBreakCountdown, 1000)
      return () => clearInterval(id)
    }
    if (isBreakCountdown && breakSeconds === 0) {
      setIsBreakCountdown(false)
      setActiveTab('focus')
    }
  }, [isBreakCountdown, breakSeconds, startBreakCountdown])

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">{'⏱'} Focus Timer</h1>
        <p className="text-sm text-text-muted mt-1">
          专注番茄钟 · 告别拖延症
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-[10px] bg-bg-elevated p-1 gap-1">
          {(['focus', 'break'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-1.5 text-xs font-semibold rounded-[8px] transition-all duration-200',
                activeTab === tab
                  ? 'bg-accent-green text-bg-primary shadow-[0_2px_8px_rgba(110,197,110,0.25)]'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {tab === 'focus' ? '\u25C9 \u5B58\u7329' : '\u2615 \u4F11\u606F'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Timer Ring */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <SessionRing
            progress={activeTab === 'focus' ? progress : 1 - (isBreakCountdown ? breakSeconds / (breakPreset * 60) : 0)}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center -mt-2">
            {activeTab === 'focus' ? (
              <>
                <span className="text-5xl font-mono font-bold text-text-primary tracking-wider">
                  {formatTime(timer.remaining)}
                </span>
                <span className="text-xs text-text-muted mt-2">
                  {timer.isRunning ? '\u5B58\u7329\u4E2D\u2026' : '\u9009\u62E9\u65F6\u957F\u5F00\u59CB'}
                </span>
              </>
            ) : (
              <>
                <span className="text-5xl font-mono font-bold text-accent-gold tracking-wider">
                  {formatTime(breakSeconds)}
                </span>
                <span className="text-xs text-text-muted mt-2">
                  {'\u2615'} \u4F11\u606F\u4E2D
                </span>
              </>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3 mt-6">
          {!timer.isRunning && !isBreakCountdown && (
            <button
              onClick={handleStart}
              disabled={!selectedPreset}
              className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300',
                selectedPreset
                  ? 'bg-accent-green hover:brightness-110 shadow-[0_4px_20px_rgba(110,197,110,0.4)] active:scale-95'
                  : 'bg-bg-elevated opacity-50 cursor-not-allowed'
              )}
            >
              <svg className="w-6 h-6 text-bg-primary ml-0.5" viewBox="0 0 24 24" fill="none">
                <path d="M8 6L20 12L8 18V6Z" fill="currentColor"/>
              </svg>
            </button>
          )}

          {timer.isRunning && (
            <button
              onClick={handleStop}
              className="w-14 h-14 rounded-full bg-danger/20 hover:bg-danger/30 text-danger flex items-center justify-center transition-all duration-200 shadow-[0_4px_14px_rgba(232,91,75,0.2)] active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>
              </svg>
            </button>
          )}

          {timer.isRunning && timer.remaining <= 3 && (
            <button
              onClick={handleCompleteSession}
              className="w-14 h-14 rounded-full bg-accent-gold text-bg-primary flex items-center justify-center transition-all duration-200 shadow-[0_4px_14px_rgba(232,184,75,0.3)] active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M5 12L10 17L19 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Presets */}
      {!timer.isRunning && !isBreakCountdown && (
        <div className="grid grid-cols-2 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.minutes}
              onClick={() => setSelectedPreset(preset.minutes)}
              className={cn(
                'rounded-[16px] border p-4 text-center transition-all duration-200',
                selectedPreset === preset.minutes
                  ? 'border-accent-green bg-accent-green/10 shadow-[0_0_16px_rgba(110,197,110,0.15)]'
                  : 'border-border-subtle bg-bg-card hover:border-accent-green/50'
              )}
            >
              <span className="text-2xl">{preset.emoji}</span>
              <p className={cn(
                'text-sm font-semibold mt-1',
                selectedPreset === preset.minutes ? 'text-accent-green' : 'text-text-primary'
              )}>
                {preset.label}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Break Presets */}
      {isBreakCountdown && (
        <div className="text-center">
          <p className="text-sm text-text-muted mb-3">休息一下，继续加油！</p>
          <div className="flex justify-center gap-2">
            {BREAK_PRESETS.map((p) => (
              <button
                key={p.minutes}
                onClick={() => {
                  setBreakPreset(p.minutes)
                  setBreakSeconds(p.minutes * 60)
                }}
                className={cn(
                  'px-4 py-2 rounded-[8px] text-xs font-medium transition-all duration-200 cursor-pointer',
                  breakPreset === p.minutes
                    ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30'
                    : 'bg-bg-elevated text-text-muted border border-border-subtle'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '\u672C\u6B21\u5B8C\u6210', value: `${sessionCount}`, unit: '\u7BC7' },
          { label: '\u7D2F\u8BA1\u5B58\u7329', value: `${Math.floor(totalFocusSeconds / 60)}`, unit: '\u5206\u949F' },
          { label: '\u672C\u5468\u65F6\u957F', value: `${Math.floor(stats.weekDuration / 3600)}`, unit: '\u5C0F\u65F6' },
        ].map((stat) => (
          <Card key={stat.label} variant="stats">
            <p className="text-2xl font-bold text-accent-green">{stat.value}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{stat.label}</p>
            <p className="text-[9px] text-text-muted">{stat.unit}</p>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Card className="bg-accent-green/5 border-accent-green/20">
        <div className="flex items-start gap-3">
          <span className="text-lg flex-shrink-0">{'\uD83D\uDCA1'}</span>
          <div>
            <p className="text-xs font-semibold text-accent-green">高效学习技巧</p>
            <p className="text-xs text-text-secondary mt-1 leading-relaxed">
              建议采用 25+5 番茄工作法：专注 25 分钟，休息 5 分钟，每完成 4 个番茄钟后长休息 15-30 分钟。保持规律节奏，学习效率翻倍！
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}