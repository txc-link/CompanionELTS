import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

// ─── Mock Reading Passage Data ────────────────────────────────────────────────
const PASSAGES = [
  {
    id: 'p1',
    title: 'The Impact of Artificial Intelligence on Employment',
    source: 'IELTS Academic Reading - Cambridge 18',
    type: 'academic',
    difficulty: '7.0',
    time: 20,
    questions: 13,
    tags: ['科技', '社会'],
  },
  {
    id: 'p2',
    title: 'Urban Agriculture and Food Security',
    source: 'IELTS General Training',
    type: 'general',
    difficulty: '6.5',
    time: 20,
    questions: 13,
    tags: ['环境', '农业'],
  },
  {
    id: 'p3',
    title: 'The Psychology of Color in Marketing',
    source: 'IELTS Academic Reading',
    type: 'academic',
    difficulty: '7.5',
    time: 20,
    questions: 13,
    tags: ['心理学', '商业'],
  },
]

const QUESTION_TYPES = [
  { label: 'True/False/Not Given', count: 4 },
  { label: 'Multiple Choice', count: 3 },
  { label: 'Matching Headings', count: 2 },
  { label: 'Summary Completion', count: 4 },
]

const LOREM_PARAGRAPHS = [
  'The passage discusses the multifaceted effects of technological change on labor markets across both developed and developing economies. Research suggests that while automation displaces certain routine occupations, it simultaneously generates new categories of employment that were previously unimaginable.',
  'Historical precedent from previous industrial revolutions indicates that technological progress, despite initial disruptions, ultimately creates more jobs than it eliminates. However, the scale and speed of the current digital transformation raise unprecedented questions about transition periods and the adequacy of workforce reskilling programs.',
  'Policymakers face the delicate challenge of balancing innovation incentives against social protection imperatives. Countries that have invested heavily in education and lifelong learning frameworks demonstrate greater resilience in absorbing technological shocks into their labor markets.',
  'The emergence of the gig economy and platform-based work represents a particularly contested terrain. While proponents celebrate the flexibility and autonomy these arrangements afford workers, critics point to the erosion of employment protections, benefits, and bargaining power.',
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function Reading() {
  const [activePassage, setActivePassage] = useState('p1')
  const [mode, setMode] = useState<'list' | 'practice'>('list')
  const [readingTime, setReadingTime] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const passage = PASSAGES.find((p) => p.id === activePassage)

  // Timer
  useState(() => {
    if (mode === 'practice' && readingTime === 0) {
      const id = setInterval(() => setReadingTime((t) => t + 1), 1000)
      return () => clearInterval(id)
    }
  })

  function formatTime(sec: number) {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  if (mode === 'list') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{'📖'} 阅读精讲</h1>
          <p className="text-sm text-text-muted mt-1">
            长难句分析 · 同义替换集训 · 真题精讲
          </p>
        </div>

        {/* Passage Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PASSAGES.map((p) => (
            <div
              key={p.id}
              onClick={() => { setActivePassage(p.id); setMode('practice'); setReadingTime(0); setAnswers({}); setSubmitted(false) }}
              className={cn(
                'rounded-[16px] border p-5 cursor-pointer transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(110,197,110,0.15)] hover:border-accent-green/50',
                activePassage === p.id ? 'border-accent-green/50 bg-accent-green/5' : 'border-border-subtle bg-bg-card'
              )}
            >
              {/* Cover gradient */}
              <div className="h-24 rounded-[10px] bg-gradient-to-br from-bg-elevated to-accent-green/10 mb-4 flex items-center justify-center">
                <span className="text-3xl">{'📰'}</span>
              </div>

              <h3 className="text-sm font-bold text-text-primary mb-1 leading-snug">{p.title}</h3>
              <p className="text-[11px] text-text-muted mb-3">{p.source}</p>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                <Badge variant={p.type === 'academic' ? 'info' : 'new'} size="sm">
                  {p.type === 'academic' ? '学术类' : '培训类'}
                </Badge>
                <Badge variant="warning" size="sm">难度 {p.difficulty}</Badge>
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span>{p.questions}题 · {p.time}分钟</span>
                <span>{p.tags.join(' · ')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <Card className="bg-accent-green/5 border-accent-green/20">
          <CardTitle>阅读技巧提示</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {[
              { icon: '🎯', tip: '先看题目再读文章，带着问题找答案' },
              { icon: '📝', tip: '同义替换是雅思阅读的核心考点' },
              { icon: '⏱', tip: '严格控制每篇20分钟，训练速度' },
              { icon: '🔍', tip: 'Heading题先做，帮助理解文章结构' },
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

        <div className="flex items-center gap-4">
          <Badge variant="new" size="sm">{passage?.tags.join(' · ')}</Badge>
          <span className="text-accent-gold font-mono font-bold text-sm">
            ⏱ {formatTime(readingTime)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Passage Content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardTitle>{passage?.title}</CardTitle>
            <div className="space-y-4 mt-3">
              {LOREM_PARAGRAPHS.map((para, idx) => (
                <p key={idx} className="text-sm text-text-secondary leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border-subtle">
              <p className="text-xs text-text-muted">
                来源：{passage?.source} · {passage?.questions}题 · 建议时间 {passage?.time} 分钟
              </p>
            </div>
          </Card>

          {/* Questions */}
          <Card>
            <CardTitle>Questions 1-4 (True / False / Not Given)</CardTitle>
            <div className="space-y-4 mt-3">
              <div className="text-sm text-text-primary">
                <p className="mb-3 text-text-secondary">
                  Choose TRUE if the statement agrees with the claims of the writer. Choose FALSE if the statement contradicts the claims of the writer. Choose NOT GIVEN if it is impossible to know from the passage what the writer thinks.
                </p>
                {[1, 2, 3, 4].map((q) => (
                  <div key={q} className="mb-4 p-3 rounded-[10px] bg-bg-elevated">
                    <p className="text-text-primary font-medium mb-2">
                      {q}. The writer suggests that artificial intelligence will create more jobs than it destroys.
                    </p>
                    <div className="flex gap-3">
                      {['TRUE', 'FALSE', 'NOT GIVEN'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setAnswers((a) => ({ ...a, [`q${q}`]: opt }))}
                          className={cn(
                            'px-4 py-1.5 rounded-[8px] text-xs font-semibold transition-all duration-200 cursor-pointer',
                            answers[`q${q}`] === opt
                              ? 'bg-accent-green text-bg-primary'
                              : 'bg-bg-secondary text-text-secondary border border-border-subtle hover:border-accent-green/50'
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setAnswers({}); setSubmitted(false) }}>
              重置
            </Button>
            <Button variant="primary" onClick={() => setSubmitted(true)}>
              提交答案
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardTitle>题型分布</CardTitle>
            <div className="space-y-2 mt-2">
              {QUESTION_TYPES.map((type) => (
                <div key={type.label} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary">{type.label}</span>
                  <Badge variant="default" size="sm">{type.count}题</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>答题进度</CardTitle>
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-border-subtle overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-green/70 transition-all duration-500"
                  style={{ width: `${(Object.keys(answers).length / 4) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-text-muted text-center">
                {Object.keys(answers).length} / 4 已答
              </p>
            </div>
          </Card>

          {submitted && (
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