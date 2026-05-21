import { useState, useRef } from 'react'
import { cn } from '@/utils/cn'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_TESTS = [
  {
    id: 'l1',
    title: 'Cambridge 18 Test 1 - Section 1',
    type: 'conversation',
    difficulty: '6.0',
    duration: 10,
    questions: 10,
    completed: false,
    thumbnail: '☎',
    color: 'from-accent-green/20',
  },
  {
    id: 'l2',
    title: 'Cambridge 18 Test 1 - Section 2',
    type: 'talk',
    difficulty: '6.5',
    duration: 10,
    questions: 10,
    completed: true,
    thumbnail: '🎙',
    color: 'from-accent-gold/20',
  },
  {
    id: 'l3',
    title: 'Cambridge 18 Test 1 - Section 3',
    type: 'academic',
    difficulty: '7.0',
    duration: 10,
    questions: 10,
    completed: false,
    thumbnail: '🎓',
    color: 'from-info/20',
  },
  {
    id: 'l4',
    title: 'Cambridge 18 Test 1 - Section 4',
    type: 'lecture',
    difficulty: '7.5',
    duration: 10,
    questions: 10,
    completed: false,
    thumbnail: '📊',
    color: 'from-accent-amber/20',
  },
]

const PLAYBACK_SPEEDS = [0.75, 1.0, 1.25, 1.5]
const SECTION_LABELS: Record<string, string> = {
  conversation: '日常对话',
  talk: '独白演讲',
  academic: '学术讨论',
  lecture: '学术讲座',
}

// ─── Audio Waveform ───────────────────────────────────────────────────────────
function AudioWaveform({ progress }: { progress: number }) {
  const bars = Array.from({ length: 60 }, (_, i) => {
    const h = 20 + Math.sin(i * 0.4) * 15 + Math.random() * 10
    const filled = i / 60 <= progress
    return h
  })

  return (
    <div className="flex items-center gap-0.5 h-14">
      {bars.map((h, i) => {
        const filled = i / 60 <= progress
        return (
          <div
            key={i}
            className={cn(
              'w-1 rounded-full transition-all duration-100',
              filled ? 'bg-accent-green' : 'bg-border-subtle'
            )}
            style={{ height: `${h}px` }}
          />
        )
      })}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Listening() {
  const [mode, setMode] = useState<'list' | 'practice'>('list')
  const [activeTest, setActiveTest] = useState('l1')
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<Record<number, string>>({})
  const [testSubmitted, setTestSubmitted] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showTranscript, setShowTranscript] = useState(false)
  const audioRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const test = MOCK_TESTS.find((t) => t.id === activeTest)
  const totalTime = (test?.duration ?? 10) * 60

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  function togglePlay() {
    if (isPlaying) {
      if (audioRef.current) clearInterval(audioRef.current)
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
      audioRef.current = setInterval(() => {
        setCurrentTime((t) => {
          if (t >= totalTime) {
            clearInterval(audioRef.current!)
            setIsPlaying(false)
            return totalTime
          }
          setProgress(t / totalTime)
          return t + 1
        })
      }, 1000 / playbackSpeed)
    }
  }

  if (mode === 'list') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{'🎧'} 听力精讲</h1>
          <p className="text-sm text-text-muted mt-1">
            真题精讲 + 句型延异复读 · AI 同步转写
          </p>
        </div>

        {/* Test List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MOCK_TESTS.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveTest(item.id)
                setMode('practice')
                setProgress(0)
                setCurrentTime(0)
                setIsPlaying(false)
                setSelectedAnswer({})
                setTestSubmitted(false)
                setAnswers({})
                setShowTranscript(false)
              }}
              className={cn(
                'rounded-[16px] border p-5 cursor-pointer transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(110,197,110,0.15)] hover:border-accent-green/50',
                activeTest === item.id ? 'border-accent-green/50 bg-accent-green/5' : 'border-border-subtle bg-bg-card'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-12 h-12 rounded-[12px] bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                  item.color
                )}>
                  <span className="text-2xl">{item.thumbnail}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-text-primary leading-snug mb-1">{item.title}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default" size="sm">{SECTION_LABELS[item.type]}</Badge>
                    <Badge variant="warning" size="sm">难度 {item.difficulty}</Badge>
                  </div>
                </div>
                {item.completed && (
                  <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-accent-green" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 text-[11px] text-text-muted">
                <span>{item.questions}题 · {item.duration}分钟</span>
                <span>{item.completed ? '已练习' : '未练习'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <Card className="bg-accent-gold/5 border-accent-gold/20">
          <CardTitle>听力技巧提示</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {[
              { icon: '🎯', tip: '提前阅读题目，划关键词预测答案' },
              { icon: '📝', tip: 'Section 4 是讲座，注意拼写和单复数' },
              { icon: '⏱', tip: '每题约1分钟读题+答题，练习边听边记' },
              { icon: '🔁', tip: '反复精听听不懂的句子，建立语感' },
            ].map((item) => (
              <div key={item.tip} className="flex items-center gap-2 text-xs text-text-secondary">
                <span>{item.icon}</span>
                <span>{item.tip}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  // Practice Mode
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Practice Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setMode('list')}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回列表
        </button>

        <div className="flex items-center gap-3">
          <Badge variant="new" size="sm">{SECTION_LABELS[test?.type ?? '']}</Badge>
          <Badge variant="warning" size="sm">难度 {test?.difficulty}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Practice Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Audio Player Card */}
          <Card>
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
                  isPlaying
                    ? 'bg-accent-green shadow-[0_4px_14px_rgba(110,197,110,0.3)]'
                    : 'bg-accent-green/20 hover:bg-accent-green/30'
                )}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5 text-bg-primary" viewBox="0 0 24 24" fill="none">
                    <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/>
                    <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-accent-green" viewBox="0 0 24 24" fill="none">
                    <path d="M8 6L20 12L8 18V6Z" fill="currentColor"/>
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary mb-2">{test?.title}</p>
                <AudioWaveform progress={progress} />
                <div className="flex items-center justify-between text-[11px] text-text-muted mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(totalTime)}</span>
                </div>
              </div>
            </div>

            {/* Playback Speed */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-muted">语速：</span>
                {PLAYBACK_SPEEDS.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={cn(
                      'px-2 py-0.5 rounded-[6px] text-[11px] font-medium transition-all duration-200 cursor-pointer',
                      playbackSpeed === speed
                        ? 'bg-accent-green text-bg-primary'
                        : 'text-text-muted hover:text-text-primary'
                    )}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={cn(
                  'text-xs px-3 py-1 rounded-[6px] transition-all duration-200 cursor-pointer',
                  showTranscript
                    ? 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30'
                    : 'text-text-muted hover:text-text-primary border border-border-subtle'
                )}
              >
                {'📄'} 显示原文
              </button>
            </div>
          </Card>

          {/* Questions */}
          <Card>
            <CardTitle>Questions 1-10</CardTitle>
            <div className="space-y-4 mt-3">
              <div className="p-3 rounded-[10px] bg-bg-elevated">
                <p className="text-sm text-text-primary font-medium mb-3">
                  Questions 1-4: Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.
                </p>
                <div className="space-y-3">
                  {[
                    { num: 1, label: 'Name', hint: 'First name only' },
                    { num: 2, label: 'Phone', hint: 'including area code' },
                    { num: 3, label: 'Address', hint: 'Street name' },
                    { num: 4, label: 'Postcode', hint: '' },
                  ].map((q) => (
                    <div key={q.num} className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-text-muted w-6 text-right">{q.num}.</span>
                      <label className="text-xs text-text-secondary w-20">{q.label}</label>
                      <input
                        type="text"
                        value={selectedAnswer[q.num] ?? ''}
                        onChange={(e) => setSelectedAnswer((a) => ({ ...a, [q.num]: e.target.value }))}
                        className={cn(
                          'flex-1 rounded-[6px] border bg-bg-secondary px-3 py-1.5 text-sm text-text-primary',
                          'outline-none focus:border-accent-green transition-all duration-200'
                        )}
                        placeholder={q.hint}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setSelectedAnswer({}); setTestSubmitted(false) }}>
              重置
            </Button>
            <Button variant="primary" onClick={() => setTestSubmitted(true)}>
              提交答案
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardTitle>答题卡</CardTitle>
            <div className="grid grid-cols-5 gap-1.5 mt-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <div
                  key={num}
                  className={cn(
                    'aspect-square rounded-[6px] flex items-center justify-center text-xs font-semibold transition-all duration-200',
                    selectedAnswer[num]
                      ? 'bg-accent-green/20 text-accent-green border border-accent-green/30'
                      : 'bg-bg-elevated text-text-muted'
                  )}
                >
                  {num}
                </div>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-text-muted text-center">
              {Object.keys(selectedAnswer).length} / 10 已答
            </div>
          </Card>

          {testSubmitted && (
            <Card className="border-accent-gold/30">
              <CardTitle>提交成功</CardTitle>
              <p className="text-xs text-text-muted mt-1">AI 评分中，请稍候…</p>
              <div className="mt-3 flex justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}