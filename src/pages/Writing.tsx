import { useState } from 'react'
import { cn } from '@/utils/cn'

type TaskType = 'task1' | 'task2'
type CorrectionTag = 'grammar' | 'optimization' | 'replacement'

interface CorrectionItem {
  id: string
  tag: CorrectionTag
  original: string
  suggestion: string
  explanation: string
}

const correctionsData: CorrectionItem[] = [
  {
    id: 'c1',
    tag: 'grammar',
    original: 'The graph show the number of visitors',
    suggestion: 'The graph shows the number of visitors',
    explanation: '\u4E3B\u8BED\u201CThe graph\u201D\u4E3A\u7B2C\u4E09\u4EBA\u79F0\u5355\u6570\uFF0C\u5A01\u8BCD\u5E94\u52A0 -s\u3002',
  },
  {
    id: 'c2',
    tag: 'optimization',
    original: 'There was a significant increased',
    suggestion: 'There was a significant increase',
    explanation: '\u201Csignificant\u201D\u4FEE\u9970\u540D\u8BCD\uFF0C\u5E94\u4F7F\u7528\u540D\u8BCD\u5F62\u5F0F \u201Cincrease\u201D \u800C\u975E\u8FC7\u53BB\u5206\u8BCD\u3002',
  },
  {
    id: 'c3',
    tag: 'replacement',
    original: 'good development',
    suggestion: 'remarkable progress',
    explanation: '\u201Cgood\u201D\u8FC7\u4E8E\u5E38\u89C4\uFF0C\u66FF\u6362\u4E3A\u66F4\u5B66\u672F\u5316\u7684\u8868\u8FBE\u53EF\u63D0\u5347\u521B\u4F5C\u5F97\u5206\u3002',
  },
]

const tagConfig: Record<CorrectionTag, { label: string; color: string }> = {
  grammar: { label: '\u8BED\u6CD5', color: 'bg-danger/15 text-danger border border-danger/25' },
  optimization: { label: '\u4F18\u5316', color: 'bg-accent-gold/15 text-accent-gold border border-accent-gold/25' },
  replacement: { label: '\u66FF\u6362', color: 'bg-info/15 text-info border border-info/25' },
}

export default function Writing() {
  const [activeTask, setActiveTask] = useState<TaskType>('task1')
  const [essay, setEssay] = useState(
    'The graph show the number of visitors who attended a museum between 2010 and 2020. There was a significant increased in attendance from 2012 to 2015. This good development can be attributed to the opening of a new exhibition hall.'
  )
  const [submitted, setSubmitted] = useState(false)

  const wordCount = essay.replace(/\s+/g, ' ').trim().split(/\s/).filter(Boolean).length
  const minWords = activeTask === 'task1' ? 150 : 250
  const wordOk = wordCount >= minWords

  // Character count for display (works for both Chinese and English)
  const charCount = essay.trim().length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          ✍️ AI 写作批改
        </h1>
        <p className="text-sm text-text-muted mt-1">
          多考官模式 · 支持质疑评分
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left / Top: Editor */}
        <div className={cn('space-y-4', submitted ? 'lg:col-span-3' : 'lg:col-span-5')}>
          {/* Task tabs + Timer */}
          <div className="flex items-center justify-between">
            {/* Pill tabs */}
            <div className="inline-flex rounded-[10px] bg-bg-elevated p-1 gap-1">
              {(['task1', 'task2'] as const).map((task) => (
                <button
                  key={task}
                  onClick={() => { setActiveTask(task); setSubmitted(false) }}
                  className={cn(
                    'px-4 py-1.5 text-xs font-semibold rounded-[8px] transition-all duration-200',
                    activeTask === task
                      ? 'bg-accent-green text-bg-primary shadow-[0_2px_8px_rgba(110,197,110,0.25)]'
                      : 'text-text-secondary hover:text-text-primary'
                  )}
                >
                  {task === 'task1' ? 'Task 1 图表' : 'Task 2 议论文'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-accent-gold font-mono font-bold text-sm">
              <span>{'\u23F1\uFE0F'}</span>
              <span>58:32</span>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            className={cn(
              'w-full h-[300px] rounded-[12px] border border-border-subtle bg-bg-card p-4',
              'text-sm text-text-primary leading-relaxed resize-none',
              'placeholder:text-text-muted/50',
              'focus:outline-none focus:border-accent-green/50 focus:shadow-[0_0_12px_rgba(110,197,110,0.1)]',
              'transition-all duration-200'
            )}
            placeholder={'\u8BF7\u5728\u6B64\u5904\u5199\u4F5C\u2026'}
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between">
            <span
              className={cn(
                'text-xs font-semibold',
                wordOk ? 'text-accent-green' : 'text-danger'
              )}
            >
              {wordCount} / {minWords} 字
              {!wordOk && (
                <span className="text-danger/80 ml-1">
                  （未达到最低字数要求）
                </span>
              )}
            </span>

            <div className="flex items-center gap-3">
              <button
                className={cn(
                  'px-4 py-2 text-xs font-semibold rounded-[6px]',
                  'border border-border-subtle text-text-secondary',
                  'hover:bg-bg-elevated hover:text-text-primary transition-all duration-200'
                )}
              >
                {'\u4FDD\u5B58\u8349\u7A3F'}
              </button>

              <button
                onClick={() => setSubmitted(true)}
                className={cn(
                  'px-5 py-2 text-xs font-semibold rounded-[6px]',
                  'bg-accent-green text-bg-primary',
                  'hover:brightness-110 shadow-[0_4px_14px_rgba(110,197,110,0.25)]',
                  'active:scale-[0.98] transition-all duration-200'
                )}
              >
                {'\u63D0\u4EA4\u6279\u6539'}
              </button>
            </div>
          </div>
        </div>

        {/* Right / Bottom: Feedback Panel */}
        {submitted && (
          <div className="lg:col-span-2 space-y-4 animate-fade-in">
            {/* Score overview */}
            <div className="rounded-[16px] border border-border-subtle bg-bg-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-[0.7px] font-semibold">
                    {'\u603B\u4F53\u5F97\u5206'}
                  </p>
                  <div className="text-5xl font-bold text-accent-green mt-1">6.0</div>
                </div>
                <button
                  className={cn(
                    'px-3 py-1.5 text-[11px] font-semibold rounded-[6px]',
                    'border border-accent-gold/30 text-accent-gold bg-accent-gold/10',
                    'hover:bg-accent-gold/20 transition-all duration-200'
                  )}
                >
                  {'\u8D28\u7591\u8BC4\u5206'}
                </button>
              </div>

              {/* Dimension scores */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'TR', score: 6.0 },
                  { label: 'CC', score: 6.0 },
                  { label: 'LR', score: 5.5 },
                  { label: 'GRA', score: 6.5 },
                ].map((dim) => (
                  <div
                    key={dim.label}
                    className="rounded-[10px] bg-bg-elevated p-3 text-center"
                  >
                    <p className="text-[11px] text-text-muted font-semibold">{dim.label}</p>
                    <p className="text-lg font-bold text-text-primary mt-0.5">{dim.score.toFixed(1)}</p>
                  </div>
                ))}
              </div>

              <div className="flex text-[10px] text-text-muted justify-center gap-4 mt-3">
                <span>TR: Task Response</span>
                <span>CC: Coherence</span>
                <span>LR: Lexical</span>
                <span>GRA: Grammar</span>
              </div>
            </div>

            {/* Correction items */}
            <div className="rounded-[16px] border border-border-subtle bg-bg-card p-5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-[0.7px] mb-4">
                {'\u9500\u9519\u6279\u6539\u8BE6\u60C5'}
              </h3>

              <div className="space-y-4">
                {correctionsData.map((item) => {
                  const tag = tagConfig[item.tag]
                  return (
                    <div key={item.id} className="space-y-2">
                      {/* Tag */}
                      <span
                        className={cn(
                          'inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full',
                          tag.color
                        )}
                      >
                        {tag.label}
                      </span>

                      {/* Original (crossed out) */}
                      <div className="text-xs text-text-secondary">
                        <span className="line-through text-danger/80">{item.original}</span>
                      </div>

                      {/* Suggestion (green) */}
                      <div className="text-xs text-accent-green font-medium">{'\u2192'} {item.suggestion}</div>

                      {/* Explanation */}
                      <p className="text-[11px] text-text-muted leading-relaxed">{item.explanation}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
