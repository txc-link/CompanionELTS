import { useState, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// ─── Types ───────────────────────────────────────────────────────────────
type TaskType = 'task1' | 'task2'
type CorrectionTag = 'grammar' | 'optimization' | 'replacement'
type SubmitState = 'idle' | 'loading' | 'done'

interface CorrectionItem {
  id: string
  tag: CorrectionTag
  original: string
  suggestion: string
  explanation: string
  position?: number
}

// ─── Task 1 Topics ─────────────────────────────────────────────────────────
const TASK1_TOPICS = [
  {
    id: 't1-1',
    title: 'The chart below shows the number of students studying computer science at a UK university between 2010 and 2020.',
    type: 'Line Graph',
    minWords: 150,
    hint: 'Summarize the main trends and make comparisons where relevant.',
  },
  {
    id: 't1-2',
    title: 'The table below gives information about changes in the types of accommodation occupied by 25 to 34 year olds in the UK between 1991 and 2011.',
    type: 'Table',
    minWords: 150,
    hint: 'Select and report the main features, and make comparisons where relevant.',
  },
  {
    id: 't1-3',
    title: 'The pie charts illustrate the spending patterns of a UK university student in 2010 compared with 2020.',
    type: 'Pie Chart',
    minWords: 150,
    hint: 'Summarize the information by selecting and reporting the main features.',
  },
]

// ─── Task 2 Topics ─────────────────────────────────────────────────────────
const TASK2_TOPICS = [
  {
    id: 't2-1',
    title: 'Some people believe that universities should focus on providing academic knowledge rather than teaching practical skills. To what extent do you agree or disagree?',
    minWords: 250,
    hint: 'Give reasons for your answer and include any relevant examples from your own knowledge or experience.',
  },
  {
    id: 't2-2',
    title: 'In many countries, the amount of crime is increasing. What do you think are the main causes of crime? How can we reduce crime rates?',
    minWords: 250,
    hint: 'Discuss both views and give your own opinion.',
  },
  {
    id: 't2-3',
    title: 'Some experts believe that it is better for children to begin learning a foreign language at primary school rather than secondary school. Do the advantages of this outweigh the disadvantages?',
    minWords: 250,
    hint: 'Discuss the advantages and disadvantages and give your own opinion.',
  },
  {
    id: 't2-4',
    title: 'With the rapid development of communication technology and the internet, people can now work and study at home instead of going to office or school. Do you think this is a positive or negative development?',
    minWords: 250,
    hint: 'Give reasons for your answer and include relevant examples.',
  },
]

// ─── AI Corrections (simulated) ────────────────────────────────────────────
const CORRECTION_POOL: Record<string, CorrectionItem[]> = {
  't1-1': [
    { id: 'c1', tag: 'grammar', original: 'The graph show the number of visitors', suggestion: 'The graph shows the number of visitors', explanation: '主语"The graph"为第三人称单数，动词应加 -s。' },
    { id: 'c2', tag: 'optimization', original: 'There was a significant increased', suggestion: 'There was a significant increase', explanation: '"significant"修饰名词应使用名词形式 "increase" 而非过去分词。' },
    { id: 'c3', tag: 'replacement', original: 'good development', suggestion: 'remarkable progress', explanation: '"good"过于常规，替换为更学术化的表达可提升写作得分。' },
    { id: 'c4', tag: 'grammar', original: 'In the year 2012, the number reached', suggestion: 'In 2012, the number reached', explanation: '年份前不需要加"the year"，直接用数字即可。' },
  ],
  't2-1': [
    { id: 'c5', tag: 'grammar', original: 'While i agree that universities should focus on academic knowledge', suggestion: 'While I agree that universities should focus on academic knowledge', explanation: '句首字母需大写。' },
    { id: 'c6', tag: 'replacement', original: 'important skills', suggestion: 'transferable skills', explanation: '"important"表达不够精准，使用"transferable"更符合学术写作风格。' },
    { id: 'c7', tag: 'optimization', original: 'Many people think that', suggestion: 'It is often argued that', explanation: '使用更高级的句式开头，避免过于口语化的表达。' },
    { id: 'c8', tag: 'replacement', original: 'In my opinion, i think', suggestion: 'In my view', explanation: '"I think"与"my opinion"重复，直接使用"In my view"更简洁有力。' },
    { id: 'c9', tag: 'grammar', original: 'Students who studied practical skills have better job prospects', suggestion: 'Students who study practical skills have better job prospects', explanation: '该句描述普遍真理应使用一般现在时。' },
  ],
}

// ─── Tag Config ────────────────────────────────────────────────────────────
const TAG_CONFIG: Record<CorrectionTag, { label: string; color: string; bg: string }> = {
  grammar: { label: '语法', color: 'text-danger', bg: 'bg-danger/15' },
  optimization: { label: '优化', color: 'text-accent-gold', bg: 'bg-accent-gold/15' },
  replacement: { label: '替换', color: 'text-info', bg: 'bg-info/15' },
}

// ─── Essay Feedback ───────────────────────────────────────────────────────
const ESSAY_FEEDBACK: Record<string, {
  band: number
  dimensions: { tr: number; cc: number; lr: number; gra: number }
  summary: string
  suggestion: string
}> = {
  default: {
    band: 6.0,
    dimensions: { tr: 6.0, cc: 5.5, lr: 5.5, gra: 6.0 },
    summary: '文章结构基本清晰，采用四段式写作：开头段描述图表主要内容，第二段详细描述数据趋势，第三段分析原因，结尾段总结观点。',
    suggestion: '建议加强连接词使用（如however, furthermore, in contrast），丰富词汇多样性，减少语法错误。',
  },
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function Writing() {
  const [activeTask, setActiveTask] = useState<TaskType>('task1')
  const [selectedTopicId, setSelectedTopicId] = useState<string>(TASK1_TOPICS[0].id)
  const [essay, setEssay] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [corrections, setCorrections] = useState<CorrectionItem[]>([])
  const [feedback, setFeedback] = useState<typeof ESSAY_FEEDBACK['default'] | null>(null)

  // Get current topic
  const allTopics = activeTask === 'task1' ? TASK1_TOPICS : TASK2_TOPICS
  const currentTopic = allTopics.find((t) => t.id === selectedTopicId) || allTopics[0]
  const minWords = currentTopic.minWords

  // Word count
  const wordCount = essay.trim() === '' ? 0 : essay.trim().split(/\s+/).filter(Boolean).length
  const wordOk = wordCount >= minWords
  const progress = Math.min(100, (wordCount / minWords) * 100)

  // Switch task: reset topic and essay
  const handleSwitchTask = (task: TaskType) => {
    setActiveTask(task)
    setSelectedTopicId(task === 'task1' ? TASK1_TOPICS[0].id : TASK2_TOPICS[0].id)
    setEssay('')
    setSubmitState('idle')
    setCorrections([])
    setFeedback(null)
  }

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (!wordOk) return
    setSubmitState('loading')

    // Simulate AI processing
    const delay = currentTopic.id.startsWith('t2') ? 3000 : 2000
    const correctionsKey = currentTopic.id in CORRECTION_POOL ? currentTopic.id : 't1-1'
    const pool = CORRECTION_POOL[correctionsKey] || CORRECTION_POOL['t1-1']
    const numCorrections = Math.min(pool.length, Math.floor(wordCount / 30) + 1)

    setTimeout(() => {
      setCorrections(pool.slice(0, numCorrections))

      // Simulate band score based on word count
      const baseBand = currentTopic.id.startsWith('t2') ? 5.5 : 6.0
      const wordBonus = Math.min(1.5, (wordCount - minWords) / 150)
      const band = Math.min(9, baseBand + wordBonus)
      const lr = Math.min(9, band + (Math.random() > 0.5 ? 0.5 : -0.5))
      const gra = Math.min(9, band + (Math.random() > 0.5 ? 0.5 : -0.5))

      setFeedback({
        band: Math.round(band * 10) / 10,
        dimensions: {
          tr: Math.round((band + (Math.random() > 0.5 ? 0.3 : -0.3)) * 10) / 10,
          cc: Math.round((band + (Math.random() > 0.5 ? 0.2 : -0.3)) * 10) / 10,
          lr: Math.round(lr * 10) / 10,
          gra: Math.round(gra * 10) / 10,
        },
        summary: wordCount > 300
          ? '文章内容充实，观点论述充分，论证逻辑清晰。建议丰富句式多样性，适当使用复合句提升语法复杂度。'
          : '文章结构合理，论点清晰。建议适当增加字数至250词以上，以获得更高的Task Response得分。',
        suggestion: '重点关注：1) 使用更多高级连接词（moreover, consequently, nevertheless）；2) 避免重复使用相同词汇；3) 注意主谓一致和时态准确性。',
      })

      setSubmitState('done')
    }, delay)
  }, [wordOk, currentTopic.id, wordCount, minWords])

  const handleReset = () => {
    setEssay('')
    setSubmitState('idle')
    setCorrections([])
    setFeedback(null)
  }

  const handleRevise = () => {
    setSubmitState('idle')
    setCorrections([])
    setFeedback(null)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">✍️ AI 写作批改</h1>
          <p className="text-sm text-text-muted mt-1">多考官模式 · 支持质疑评分</p>
        </div>
        {submitState === 'done' && (
          <Button variant="ghost" size="sm" onClick={handleReset}>✏️ 重新写作</Button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left: Editor Area */}
        <div className={cn('space-y-4', submitState === 'done' ? 'xl:col-span-3' : 'xl:col-span-5')}>
          {/* Task Type Tabs + Topic Selector */}
          {!submitState || submitState === 'idle' ? (
            <Card className="p-5 space-y-4">
              {/* Task type tabs */}
              <div className="flex items-center justify-between">
                <div className="inline-flex rounded-[10px] bg-bg-elevated p-1 gap-1">
                  {(['task1', 'task2'] as const).map((task) => (
                    <button
                      key={task}
                      onClick={() => handleSwitchTask(task)}
                      className={cn(
                        'px-4 py-1.5 text-xs font-semibold rounded-[8px] transition-all duration-200 cursor-pointer',
                        activeTask === task
                          ? 'bg-accent-green text-bg-primary shadow-[0_2px_8px_rgba(110,197,110,0.25)]'
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                    >
                      {task === 'task1' ? '📊 Task 1 图表' : '📝 Task 2 议论文'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Selection */}
              <div>
                <p className="text-xs text-text-muted mb-2 font-semibold">选择题目</p>
                <div className="space-y-2">
                  {allTopics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopicId(topic.id)}
                      className={cn(
                        'w-full text-left p-3 rounded-[10px] border transition-all duration-200 cursor-pointer',
                        selectedTopicId === topic.id
                          ? 'border-accent-green/40 bg-accent-green/5'
                          : 'border-border-subtle hover:border-border-accent bg-bg-elevated'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {'type' in topic && (topic as { type: string }).type && (
                          <span className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full bg-info/15 text-info font-semibold'
                          )}>
                            {(topic as { type: string }).type}
                          </span>
                        )}
                        <span className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full',
                          selectedTopicId === topic.id
                            ? 'bg-accent-green/20 text-accent-green font-semibold'
                            : 'bg-bg-card text-text-muted'
                        )}>
                          {selectedTopicId === topic.id ? '✓ 已选择' : '点击选择'}
                        </span>
                      </div>
                      <p className="text-sm text-text-primary leading-relaxed">{topic.title}</p>
                      <p className="text-xs text-text-muted mt-1 italic">{topic.hint}</p>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ) : null}

          {/* Topic Display (after submit) */}
          {submitState === 'done' && (
            <Card className="p-4 bg-bg-elevated">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 text-sm font-bold',
                  activeTask === 'task1' ? 'bg-info/15 text-info' : 'bg-accent-gold/15 text-accent-gold'
                )}>
                  {activeTask === 'task1' ? 'T1' : 'T2'}
                </div>
                <div>
                  <p className="text-sm text-text-primary leading-relaxed">{currentTopic.title}</p>
                  <p className="text-xs text-text-muted mt-1 italic">{currentTopic.hint}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRevise} className="ml-auto flex-shrink-0">
                  修改
                </Button>
              </div>
            </Card>
          )}

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              disabled={submitState === 'loading'}
              className={cn(
                'w-full h-[320px] rounded-[12px] border border-border-subtle bg-bg-card p-4',
                'text-sm text-text-primary leading-[1.8] resize-none',
                'placeholder:text-text-muted/50',
                'focus:outline-none focus:border-accent-green/50 focus:shadow-[0_0_0_3px_rgba(110,197,110,0.08)]',
                'transition-all duration-200',
                submitState === 'loading' && 'opacity-60 cursor-not-allowed'
              )}
              placeholder={
                activeTask === 'task1'
                  ? `请根据下方题目要求撰写Task 1作文。\n\n写作要点：\n• 概述主要趋势和显著特征\n• 不要描述所有数据，选择关键信息\n• 使用清晰的对比和比较表达\n\n字数要求：不少于 ${minWords} 词`
                  : `请根据下方题目要求撰写Task 2议论文。\n\n写作要点：\n• 开头段：引入话题并表明立场\n• 主体段：提出论点并用例子支持\n• 结尾段：总结观点\n\n字数要求：不少于 ${minWords} 词`
              }
            />

            {/* Loading overlay */}
            {submitState === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[12px] bg-bg-primary/80 backdrop-blur-sm">
                <div className="w-10 h-10 border-3 border-accent-green/30 border-t-accent-green rounded-full animate-spin mb-3" />
                <p className="text-sm text-text-secondary font-medium">AI 正在批改中...</p>
                <p className="text-xs text-text-muted mt-1">预计 {activeTask === 'task1' ? '2' : '3'} 秒完成</p>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between">
            {/* Word count progress */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 rounded-full bg-border-subtle overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      wordOk ? 'bg-accent-green' : 'bg-danger'
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span
                  className={cn('text-xs font-semibold', wordOk ? 'text-accent-green' : 'text-danger')}
                >
                  {wordCount} / {minWords} 词
                </span>
              </div>
              {!wordOk && (
                <span className="text-xs text-danger/80">
                  还需要 {minWords - wordCount} 词
                </span>
              )}
              {wordOk && (
                <span className="text-xs text-accent-green">✓ 达到要求</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleReset}>🗑️ 清空</Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!wordOk || submitState === 'loading'}
                onClick={handleSubmit}
              >
                {submitState === 'loading' ? '批改中...' : '🚀 提交批改'}
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Feedback Panel */}
        {submitState === 'done' && feedback && (
          <div className="xl:col-span-2 space-y-4 animate-fade-in">
            {/* Overall Score */}
            <Card className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[11px] text-text-muted uppercase tracking-[0.7px] font-semibold">总体得分</p>
                  <div className={cn(
                    'text-5xl font-bold mt-1',
                    feedback.band >= 7 ? 'text-accent-green' :
                    feedback.band >= 5.5 ? 'text-accent-gold' : 'text-danger'
                  )}>
                    {feedback.band.toFixed(1)}
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">Band Score</p>
                </div>
                <Button variant="ghost" size="sm">💬 质疑评分</Button>
              </div>

              {/* Dimension scores */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'TR', score: feedback.dimensions.tr, desc: '任务回应' },
                  { label: 'CC', score: feedback.dimensions.cc, desc: '连贯衔接' },
                  { label: 'LR', score: feedback.dimensions.lr, desc: '词汇资源' },
                  { label: 'GRA', score: feedback.dimensions.gra, desc: '语法范围' },
                ].map((dim) => (
                  <div key={dim.label} className="rounded-[10px] bg-bg-elevated p-3 text-center">
                    <p className="text-[10px] text-text-muted font-semibold">{dim.label}</p>
                    <p className={cn(
                      'text-lg font-bold mt-0.5',
                      dim.score >= 7 ? 'text-accent-green' :
                      dim.score >= 5.5 ? 'text-accent-gold' : 'text-danger'
                    )}>
                      {dim.score.toFixed(1)}
                    </p>
                    <p className="text-[9px] text-text-muted/60">{dim.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Summary */}
            <Card className="p-5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-[0.7px] mb-3">AI 综合评语</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-[10px] bg-accent-green/8 border border-accent-green/20">
                  <p className="text-xs font-semibold text-accent-green mb-1">✅ 优点</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{feedback.summary}</p>
                </div>
                <div className="p-3 rounded-[10px] bg-accent-gold/8 border border-accent-gold/20">
                  <p className="text-xs font-semibold text-accent-gold mb-1">💡 改进建议</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{feedback.suggestion}</p>
                </div>
              </div>
            </Card>

            {/* Corrections */}
            <Card className="p-5">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-[0.7px] mb-4">
                销错批改详情 ({corrections.length} 处)
              </h3>
              <div className="space-y-4">
                {corrections.map((item, idx) => {
                  const tag = TAG_CONFIG[item.tag]
                  return (
                    <div key={item.id} className="space-y-2 pb-4 border-b border-border-subtle last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full',
                          tag.bg, tag.color
                        )}>
                          <span className="text-xs">{idx + 1}</span>
                          {tag.label}
                        </span>
                      </div>

                      {/* Original */}
                      <div className="flex items-start gap-2">
                        <span className="text-danger text-xs mt-0.5">✗</span>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          <span className="line-through text-danger/70 mr-1">{item.original}</span>
                        </p>
                      </div>

                      {/* Suggestion */}
                      <div className="flex items-start gap-2">
                        <span className="text-accent-green text-xs mt-0.5">✓</span>
                        <p className="text-xs text-accent-green font-medium leading-relaxed">{item.suggestion}</p>
                      </div>

                      {/* Explanation */}
                      <div className="pl-5">
                        <p className="text-[11px] text-text-muted leading-relaxed bg-bg-elevated rounded-[8px] p-2">
                          📖 {item.explanation}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Encouragement */}
              {corrections.length > 0 && (
                <div className="mt-4 p-3 rounded-[10px] bg-info/8 border border-info/20 text-center">
                  <p className="text-xs text-info">
                    💪 每一次批改都是进步！继续练习，注意避免相同错误。
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Empty placeholder when not submitted */}
        {submitState === 'idle' && (
          <div className="xl:col-span-2 hidden xl:block">
            <Card className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
              <span className="text-5xl mb-4">✍️</span>
              <h3 className="text-base font-bold text-text-primary mb-2">写作助手</h3>
              <p className="text-sm text-text-muted leading-relaxed mb-4">
                选择题目后在左侧撰写作文<br />
                完成后点击"提交批改"<br />
                AI 将给出详细分数和改进建议
              </p>
              <div className="space-y-2 text-left w-full max-w-[200px]">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>📊</span> Task 1: 图表描述
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>📝</span> Task 2: 议论文写作
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>🎯</span> 最低 {minWords} 词要求
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>🤖</span> 多维度 AI 评分
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}