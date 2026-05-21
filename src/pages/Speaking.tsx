import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const TOPICS = [
  { id: 't1', label: 'Part 1 - Hometown & Work/Study', emoji: '🏠' },
  { id: 't2', label: 'Part 2 - Describe a book you read', emoji: '📚' },
  { id: 't3', label: 'Part 3 - Education & Learning', emoji: '🎓' },
  { id: 't4', label: 'Part 1 - Hobbies & Free time', emoji: '⚽' },
]

const SCORE_BANDS = [
  { label: 'Fluency', score: 6.5, max: 9 },
  { label: 'Lexical', score: 6.0, max: 9 },
  { label: 'Grammar', score: 5.5, max: 9 },
  { label: 'Pronunciation', score: 6.5, max: 9 },
]

const CARD_TYPES = [
  { label: '日常对话', desc: 'Part 1 话题练习', icon: '💬', count: 20 },
  { label: '卡片描述', desc: 'Part 2 独立陈述', icon: '📝', count: 30 },
  { label: '深度讨论', desc: 'Part 3 双向讨论', icon: '🧠', count: 25 },
  { label: 'AI 陪练', desc: '实时对话互动', icon: '🤖', count: 15 },
]

const RECORDING_STATES = ['idle', 'recording', 'processing'] as const

function RecordButton({ state, onClick }: { state: typeof RECORDING_STATES[number]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300',
        state === 'idle' && 'bg-accent-green hover:brightness-110 shadow-[0_4px_20px_rgba(110,197,110,0.4)]',
        state === 'recording' && 'bg-danger animate-pulse shadow-[0_4px_20px_rgba(232,91,75,0.4)]',
        state === 'processing' && 'bg-accent-gold shadow-[0_4px_20px_rgba(232,184,75,0.4)]'
      )}
    >
      {state === 'idle' && (
        <svg className="w-8 h-8 text-bg-primary" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="12" r="8" fill="currentColor"/>
          <path d="M10 18C10 22.418 12.686 26 16 26C19.314 26 22 22.418 22 18V20H10V18Z" fill="currentColor"/>
          <rect x="13" y="26" width="6" height="3" rx="1.5" fill="currentColor"/>
          <rect x="9" y="29" width="14" height="2" rx="1" fill="currentColor"/>
        </svg>
      )}
      {state === 'recording' && (
        <div className="w-6 h-6 rounded-[4px] bg-white" />
      )}
      {state === 'processing' && (
        <div className="w-7 h-7 rounded-full border-2 border-bg-primary border-t-transparent animate-spin" />
      )}
    </button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Speaking() {
  const [activeTab, setActiveTab] = useState<'practice' | 'history'>('practice')
  const [activeTopic, setActiveTopic] = useState('t1')
  const [recordingState, setRecordingState] = useState<typeof RECORDING_STATES[number]>('idle')
  const [responseText, setResponseText] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const timerRef = useState<ReturnType<typeof setInterval>>()[1]

  function startRecording() {
    setRecordingState('recording')
    setRecordingTime(0)
    // Mock recording timer
    const id = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    timerRef(id)
  }

  function stopRecording() {
    setRecordingState('processing')
    // Mock transcription
    setTimeout(() => {
      setRecordingState('idle')
      setResponseText(
        'I come from a small coastal city in Fujian province. The city is famous for its beautiful beaches and fresh seafood. I have been living there for most of my life, and I really enjoy the relaxed lifestyle there. The people are very friendly and the cost of living is quite reasonable compared to big cities like Shanghai or Beijing.'
      )
    }, 2500)
  }

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{'🎤'} 口语练习</h1>
        <p className="text-sm text-text-muted mt-1">
          流利度 · 发音 · 词汇全面评估
        </p>
      </div>

      {/* Practice / History Tabs */}
      <div className="flex gap-2">
        {(['practice', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-[10px] text-sm font-semibold transition-all duration-200',
              activeTab === tab
                ? 'bg-accent-green text-bg-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            {tab === 'practice' ? '\u5B9E\u9645\u7EC3\u4E60' : '\u7EC3\u4E60\u538C\u5F55'}
          </button>
        ))}
      </div>

      {activeTab === 'practice' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Topic Selection */}
          <div className="space-y-4">
            <Card>
              <CardTitle>\u9009\u62E9\u8BDD\u9898</CardTitle>
              <div className="space-y-2 mt-2">
                {TOPICS.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => { setActiveTopic(topic.id); setResponseText(''); setSubmitted(false); setShowFeedback(false) }}
                    className={cn(
                      'flex items-center gap-3 rounded-[10px] p-3 cursor-pointer transition-all duration-200',
                      activeTopic === topic.id
                        ? 'bg-accent-green/10 border border-accent-green/40'
                        : 'hover:bg-bg-elevated'
                    )}
                  >
                    <span className="text-lg">{topic.emoji}</span>
                    <span className="text-xs text-text-primary">{topic.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardTitle>\u7EC3\u4E60\u6A21\u5F0F</CardTitle>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {CARD_TYPES.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[10px] bg-bg-elevated p-3 text-center"
                  >
                    <span className="text-2xl">{card.icon}</span>
                    <p className="text-xs font-semibold text-text-primary mt-1">{card.label}</p>
                    <p className="text-[10px] text-text-muted">{card.desc}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Center: Practice Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Recording Card */}
            <Card>
              <div className="flex flex-col items-center py-6">
                <div className="text-center mb-6">
                  <p className="text-sm font-semibold text-text-primary mb-1">
                    {TOPICS.find((t) => t.id === activeTopic)?.label}
                  </p>
                  <p className="text-xs text-text-muted">
                    点击下方按钮开始录音，建议回答 1-2 分钟
                  </p>
                </div>

                {/* Timer */}
                <div className="text-3xl font-mono font-bold text-text-primary mb-8">
                  {formatTime(recordingTime)}
                </div>

                {/* Record Button */}
                <RecordButton
                  state={recordingState}
                  onClick={
                    recordingState === 'idle'
                      ? startRecording
                      : recordingState === 'recording'
                      ? stopRecording
                      : () => {}
                  }
                />

                <p className="text-xs text-text-muted mt-4">
                  {recordingState === 'idle' && '点击开始录音'}
                  {recordingState === 'recording' && '点击停止'}
                  {recordingState === 'processing' && 'AI 转写中…'}
                </p>
              </div>
            </Card>

            {/* Transcription */}
            {responseText && (
              <Card>
                <CardTitle>AI 转写</CardTitle>
                <p className="text-sm text-text-secondary leading-relaxed mt-2">{responseText}</p>
              </Card>
            )}

            {/* Feedback */}
            {submitted && (
              <Card className="border-accent-gold/30">
                <div className="flex items-start gap-4">
                  {/* Overall Score */}
                  <div className="text-center">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">Overall</p>
                    <div className="text-5xl font-bold text-accent-green mt-1">6.0</div>
                    <div className="text-[10px] text-text-muted mt-0.5">Band Score</div>
                  </div>

                  {/* Dimensions */}
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    {SCORE_BANDS.map((band) => {
                      const pct = (band.score / band.max) * 100
                      return (
                        <div key={band.label}>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="text-text-muted">{band.label}</span>
                            <span className="font-bold text-text-primary">{band.score}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-border-subtle overflow-hidden">
                            <div
                              className="h-full rounded-full bg-accent-green transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle">
                  <p className="text-xs font-semibold text-accent-gold mb-2">AI 建议</p>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    您的流利度表现良好，但词汇多样性有待提升。建议多积累学术类词汇，尝试使用更高级的连接词来增强连贯性。
                  </p>
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              {responseText && !submitted && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => setResponseText('')}>
                    重置
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => { setSubmitted(true); setShowFeedback(true) }}>
                    获取评分
                  </Button>
                </>
              )}
              {submitted && (
                <Button variant="secondary" size="sm" onClick={() => {
                  setSubmitted(false)
                  setShowFeedback(false)
                  setResponseText('')
                  setRecordingState('idle')
                  setRecordingTime(0)
                }}>
                  继续练习
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <p className="text-sm text-text-muted text-center py-8">
            {'📋'} 暂无练习记录，开始你的第一次练习吧！
          </p>
        </div>
      )}
    </div>
  )
}