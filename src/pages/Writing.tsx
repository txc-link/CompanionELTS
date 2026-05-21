import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// ─── Types ───────────────────────────────────────────────────────────────
type TaskType = 'task1' | 'task2'
type StudyMode = 'writing' | 'teaching'
type SubmitState = 'idle' | 'loading' | 'done'
type CorrectionTag = 'grammar' | 'word-choice' | 'article' | 'preposition' | 'spelling' | 'punctuation'

interface GrammarIssue {
  id: string
  start: number
  end: number
  tag: CorrectionTag
  type: string
  original: string
  suggestion: string
  explanation: string
  severity: 'error' | 'warning' | 'suggestion'
}

interface CorrectionItem {
  id: string
  tag: CorrectionTag
  original: string
  suggestion: string
  explanation: string
}

// ─── US-Style Grammar Rules Engine ─────────────────────────────────────────
type Rule = {
  pattern: RegExp
  tag: CorrectionTag
  type: string
  severity: 'error' | 'warning' | 'suggestion'
  getSuggestion: (match: RegExpMatchArray) => string
  getExplanation: ((match: RegExpMatchArray) => string) | string
}

const GRAMMAR_RULES: Rule[] = [
  // Subject-verb agreement
  {
    pattern: /\b(He|She|It)\s+(\w+ed|have\s+\w+|has\s+\w+)\b/gi,
    tag: 'grammar',
    type: 'Subject-Verb Agreement',
    severity: 'error',
    getSuggestion: (m) => m[2].replace(/^(have|has)\s+/, (v: string) => v === 'have' ? 'has ' : 'have '),
    getExplanation: (m) => `"${m[1]}" is singular — use "has" (not "have"). In American English, singular subjects take "has," plural subjects take "have."`,
  },
  {
    pattern: /\b(They|We|You)\s+(has\s+\w+)\b/gi,
    tag: 'grammar',
    type: 'Subject-Verb Agreement',
    severity: 'error',
    getSuggestion: (m) => m[2].replace(/^has/, 'have'),
    getExplanation: (m) => `"${m[1]}" is plural — use "have" (not "has"). Plural subjects take "have" in present tense.`,
  },
  // Articles
  {
    pattern: /\b(a\s+effective|a efficient|a useful|a university|a European|a honest)\b/gi,
    tag: 'article',
    type: 'Article Usage',
    severity: 'error',
    getSuggestion: (m) => `an ${m[2]}`,
    getExplanation: (m) => `Use "an" before words that start with a vowel sound. "${m[1]}" starts with a vowel sound, so it needs "an" instead of "a."`,
  },
  {
    pattern: /\b(an)\s+(book|student|test|problem|solution|major|approach|system|effect|issue|challenge|method|process|example|theory|model|issue)\b/gi,
    tag: 'article',
    type: 'Article Usage',
    severity: 'warning',
    getSuggestion: (m) => `a ${m[2]}`,
    getExplanation: (m) => `Use "a" before words that start with a consonant sound. "${m[2]}" starts with a consonant sound.`,
  },
  // Word choice - common ESL confusion
  {
    pattern: /\b(affect\s+is|effect\s+is)\b/gi,
    tag: 'word-choice',
    type: 'Affect vs Effect',
    severity: 'error',
    getSuggestion: (m) => m[1].replace('affect', 'effect').replace('effect', 'affect'),
    getExplanation: `"Affect" is usually a verb ("influence"). "Effect" is usually a noun ("result"). Choose based on whether you need a verb or noun.`,
  },
  {
    pattern: /\b(than\s+more|more\s+than\s+\w+er)\b/gi,
    tag: 'grammar',
    type: 'Comparative Form',
    severity: 'error',
    getSuggestion: (m) => m[0].replace(/\s+more/gi, '').replace(/er\b/, 'er than'),
    getExplanation: `When comparing, use "-er" or "more" — not both. For example: "better than" or "more effective than" (not "more better than").`,
  },
  {
    pattern: /\b(lead\s+to\s+that|lead\s+to\s+the\s+reason)\b/gi,
    tag: 'grammar',
    type: 'Redundancy',
    severity: 'warning',
    getSuggestion: (m) => m[0].replace(/\s+that|\s+the\s+reason/, ''),
    getExplanation: `"Lead to" already implies cause-and-effect. Don't add "that" or "the reason" — it's redundant.`,
  },
  {
    pattern: /\b(because\s+of\s+the\s+reason|because\s+the\s+reason)\b/gi,
    tag: 'word-choice',
    type: 'Redundancy',
    severity: 'warning',
    getSuggestion: () => 'because',
    getExplanation: `"Because" already conveys reason. "Because of the reason" or "because the reason" is redundant — just say "because."`,
  },
  // Prepositions - common errors
  {
    pattern: /\b(concern\s+about|concern\s+with)\b/gi,
    tag: 'preposition',
    type: 'Preposition Choice',
    severity: 'warning',
    getSuggestion: (m) => m[0].replace(/\s+about|\s+with/, ' about'),
    getExplanation: `"Concern about" is the standard collocation in American academic English. "Concern with" can imply something different (a different concern).`,
  },
  // Punctuation
  {
    pattern: /\b(its\s+\w+ed)\b(?!\s+its)/gi,
    tag: 'spelling',
    type: "It's vs Its",
    severity: 'error',
    getSuggestion: (m) => `it's ${m[1]}`,
    getExplanation: `"Its" = possessive (no apostrophe). "It's" = "it is" or "it has." If you mean "it is," use "it's."`,
  },
  // Run-on / comma splice
  {
    pattern: /\b(\w+),\s+(however|therefore|moreover|furthermore|nevertheless|thus|hence)\b/gi,
    tag: 'punctuation',
    type: 'Comma Before Transition',
    severity: 'warning',
    getSuggestion: (m) => `${m[1]}, ${m[2]}`,
    getExplanation: `Transitional words like "however," "therefore," etc. need a semicolon or period before them, not just a comma. Use: "X; however, Y" or "X. However, Y."`,
  },
  // Passive voice (teaching mode only)
  {
    pattern: /\b(can\s+be\s+seen|was\s+shown|were\s+found|has\s+been\s+proven)\b/gi,
    tag: 'grammar',
    type: 'Passive Voice',
    severity: 'suggestion',
    getSuggestion: (m) => m[0],
    getExplanation: `Passive voice isn't wrong, but active voice ("shows," "demonstrates," "reveals") is often clearer and more direct in American academic writing.`,
  },
  // "In order to" redundancy
  {
    pattern: /\b(in\s+order\s+to)\b/gi,
    tag: 'word-choice',
    type: 'Redundancy',
    severity: 'suggestion',
    getSuggestion: () => 'to',
    getExplanation: `"In order to" is redundant — "to" alone is cleaner and more direct. American style guides prefer concise language.`,
  },
]

// Real-time grammar analysis
function analyzeGrammar(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = []
  let idCounter = 0

  for (const rule of GRAMMAR_RULES) {
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags)
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      const start = match.index
      const end = start + match[0].length

      // Avoid overlapping with higher severity issues
      const overlaps = issues.some(
        (i) => i.severity === 'error' && start < i.end && end > i.start
      )
      const explanation = typeof rule.getExplanation === 'function'
        ? rule.getExplanation(match)
        : rule.getExplanation

      if (!overlaps) {
        issues.push({
          id: `gi-${idCounter++}`,
          start,
          end,
          tag: rule.tag,
          type: rule.type,
          original: match[0],
          suggestion: rule.getSuggestion(match),
          explanation,
          severity: rule.severity,
        })
      }

      if (!rule.pattern.global) break
    }
  }

  return issues.sort((a, b) => a.start - b.start)
}

// ─── Topics ───────────────────────────────────────────────────────────────
const TASK1_TOPICS = [
  { id: 't1-1', title: 'The chart below shows the number of students studying computer science at a UK university between 2010 and 2020.', type: 'Line Graph', minWords: 150, hint: 'Summarize the main trends and make comparisons where relevant.' },
  { id: 't1-2', title: 'The table below gives information about changes in the types of accommodation occupied by 25 to 34 year olds in the UK between 1991 and 2011.', type: 'Table', minWords: 150, hint: 'Select and report the main features, and make comparisons where relevant.' },
  { id: 't1-3', title: 'The pie charts illustrate the spending patterns of a UK university student in 2010 compared with 2020.', type: 'Pie Chart', minWords: 150, hint: 'Summarize the information by selecting and reporting the main features.' },
]

const TASK2_TOPICS = [
  { id: 't2-1', title: 'Some people believe that universities should focus on providing academic knowledge rather than teaching practical skills. To what extent do you agree or disagree?', minWords: 250, hint: 'Give reasons for your answer and include any relevant examples.' },
  { id: 't2-2', title: 'In many countries, the amount of crime is increasing. What do you think are the main causes of crime? How can we reduce crime rates?', minWords: 250, hint: 'Discuss both views and give your own opinion.' },
  { id: 't2-3', title: 'Some experts believe that it is better for children to begin learning a foreign language at primary school rather than secondary school. Do the advantages outweigh the disadvantages?', minWords: 250, hint: 'Discuss the advantages and disadvantages and give your own opinion.' },
  { id: 't2-4', title: 'With the rapid development of communication technology, people can now work and study at home. Do you think this is a positive or negative development?', minWords: 250, hint: 'Give reasons for your answer and include relevant examples.' },
]

// ─── Tag Config ────────────────────────────────────────────────────────────
const TAG_CONFIG: Record<CorrectionTag, { label: string; color: string; bg: string; border: string; icon: string }> = {
  grammar: { label: 'Grammar', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20', icon: '✗' },
  'word-choice': { label: 'Word Choice', color: 'text-accent-gold', bg: 'bg-accent-gold/10', border: 'border-accent-gold/20', icon: '📝' },
  article: { label: 'Article', color: 'text-info', bg: 'bg-info/10', border: 'border-info/20', icon: '•' },
  preposition: { label: 'Preposition', color: 'text-accent-amber', bg: 'bg-accent-amber/10', border: 'border-accent-amber/20', icon: '→' },
  spelling: { label: 'Spelling', color: 'text-accent-purple', bg: 'bg-accent-purple/10', border: 'border-accent-purple/20', icon: '✎' },
  punctuation: { label: 'Punctuation', color: 'text-accent-cyan', bg: 'bg-accent-cyan/10', border: 'border-accent-cyan/20', icon: '⁒' },
}

const SEVERITY_CONFIG = {
  error: { label: 'Error', color: 'text-danger' },
  warning: { label: 'Warning', color: 'text-accent-gold' },
  suggestion: { label: 'Suggestion', color: 'text-text-secondary' },
}

// ─── Highlighted Textarea Component ─────────────────────────────────────────
function HighlightedTextarea({
  value,
  onChange,
  disabled,
  issues,
  onIssueClick,
  placeholder,
  minHeight,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  issues: GrammarIssue[]
  onIssueClick: (id: string) => void
  placeholder?: string
  minHeight?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const highlightRef = useRef<HTMLDivElement>(null)

  // Sync scroll
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft
    }
  }, [])

  // Build highlighted HTML
  const highlightedHtml = useMemo(() => {
    if (!value || issues.length === 0) {
      return `<span class="text-text-muted/40">${placeholder || ''}</span>`
    }
    let result = ''
    let lastEnd = 0

    for (const issue of issues) {
      if (issue.start > lastEnd) {
        result += escapeHtml(value.slice(lastEnd, issue.start))
      }
      const severityColor =
        issue.severity === 'error' ? '#ef4444' :
        issue.severity === 'warning' ? '#e8b84b' : '#64748b'
      result += `<mark data-id="${issue.id}" style="
        background:${severityColor}22;
        border-bottom:2px solid ${severityColor};
        border-radius:2px;
        cursor:pointer;
        padding:0 1px;
      ">${escapeHtml(issue.original)}</mark>`
      lastEnd = issue.end
    }
    if (lastEnd < value.length) {
      result += escapeHtml(value.slice(lastEnd))
    }
    return result
  }, [value, issues, placeholder])

  return (
    <div className="relative" style={{ minHeight: minHeight || '320px' }}>
      {/* Highlight layer */}
      <div
        ref={highlightRef}
        className="absolute inset-0 p-4 text-sm leading-[1.8] pointer-events-none overflow-hidden whitespace-pre-wrap break-words"
        style={{ color: 'transparent' }}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
      {/* Actual textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        disabled={disabled}
        className={cn(
          'w-full h-full rounded-[12px] border border-border-subtle bg-bg-card p-4',
          'text-sm text-text-primary leading-[1.8] resize-none',
          'focus:outline-none focus:border-accent-green/50 focus:shadow-[0_0_0_3px_rgba(110,197,110,0.08)]',
          'transition-all duration-200',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
        style={{ minHeight: minHeight || '320px', position: 'relative', zIndex: 1, background: 'transparent', color: 'var(--text-primary)' }}
        placeholder={placeholder}
      />
    </div>
  )
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')
}

// ─── Issue Detail Panel ─────────────────────────────────────────────────────
function IssuePanel({
  issue,
  onDismiss,
  onPrev,
  onNext,
  isFirst,
  isLast,
  total,
  index,
}: {
  issue: GrammarIssue
  onDismiss: () => void
  onPrev: () => void
  onNext: () => void
  isFirst: boolean
  isLast: boolean
  total: number
  index: number
}) {
  const tag = TAG_CONFIG[issue.tag]

  return (
    <div className={cn(
      'rounded-[12px] border p-4 space-y-3',
      tag.bg, `border-${tag.color}/20`
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-bold', tag.color)}>{tag.icon}</span>
          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', tag.bg, tag.color)}>{tag.label}</span>
          <span className={cn('text-[10px] font-medium', SEVERITY_CONFIG[issue.severity].color)}>
            {SEVERITY_CONFIG[issue.severity].label}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-text-muted">
          <span>{index + 1}/{total}</span>
          <button onClick={onDismiss} className="ml-2 hover:text-text-primary transition-colors cursor-pointer">✕</button>
        </div>
      </div>

      {/* Issue type */}
      <p className="text-xs font-semibold text-text-secondary">{issue.type}</p>

      {/* Original / Suggestion */}
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <span className="text-danger text-sm mt-0.5">✗</span>
          <span className="text-sm text-text-secondary line-through">{issue.original}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-accent-green text-sm mt-0.5">✓</span>
          <span className="text-sm font-semibold text-accent-green">{issue.suggestion}</span>
        </div>
      </div>

      {/* US-style explanation */}
      <div className="p-3 rounded-[8px] bg-bg-elevated border border-border-subtle">
        <p className="text-xs text-text-secondary leading-relaxed">{issue.explanation}</p>
      </div>

      {/* Nav buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={isFirst}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-[6px] border transition-all duration-200 cursor-pointer',
            isFirst ? 'opacity-30 cursor-not-allowed' : 'border-border-subtle text-text-secondary hover:border-border-accent hover:text-text-primary'
          )}
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={isLast}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-[6px] border transition-all duration-200 cursor-pointer',
            isLast ? 'opacity-30 cursor-not-allowed' : 'border-border-subtle text-text-secondary hover:border-border-accent hover:text-text-primary'
          )}
        >
          Next →
        </button>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function Writing() {
  const [activeTask, setActiveTask] = useState<TaskType>('task1')
  const [studyMode, setStudyMode] = useState<StudyMode>('writing')
  const [selectedTopicId, setSelectedTopicId] = useState<string>(TASK1_TOPICS[0].id)
  const [essay, setEssay] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [issues, setIssues] = useState<GrammarIssue[]>([])
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
  const [corrections, setCorrections] = useState<CorrectionItem[]>([])
  const [feedback, setFeedback] = useState<{ band: number; dimensions: { tr: number; cc: number; lr: number; gra: number }; summary: string; suggestion: string } | null>(null)

  // Real-time grammar analysis (teaching mode)
  useEffect(() => {
    if (studyMode === 'teaching' && essay.length > 10) {
      const detected = analyzeGrammar(essay)
      setIssues(detected)
      // Auto-select first issue
      if (detected.length > 0 && !selectedIssueId) {
        setSelectedIssueId(detected[0].id)
      }
    } else {
      setIssues([])
      setSelectedIssueId(null)
    }
  }, [essay, studyMode])

  const allTopics = activeTask === 'task1' ? TASK1_TOPICS : TASK2_TOPICS
  const currentTopic = allTopics.find((t) => t.id === selectedTopicId) || allTopics[0]
  const minWords = currentTopic.minWords

  const wordCount = essay.trim() === '' ? 0 : essay.trim().split(/\s+/).filter(Boolean).length
  const wordOk = wordCount >= minWords
  const progress = Math.min(100, (wordCount / minWords) * 100)

  const errorCount = issues.filter((i) => i.severity === 'error').length
  const warningCount = issues.filter((i) => i.severity === 'warning').length
  const suggestionCount = issues.filter((i) => i.severity === 'suggestion').length

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || null
  const issueIndex = issues.findIndex((i) => i.id === selectedIssueId)

  const handleSwitchTask = (task: TaskType) => {
    setActiveTask(task)
    setSelectedTopicId(task === 'task1' ? TASK1_TOPICS[0].id : TASK2_TOPICS[0].id)
    setEssay('')
    setSubmitState('idle')
    setIssues([])
    setSelectedIssueId(null)
    setCorrections([])
    setFeedback(null)
  }

  const handleSubmit = useCallback(() => {
    if (!wordOk) return
    setSubmitState('loading')

    const correctionsPool = currentTopic.id.startsWith('t2') ? [
      { id: 'c1', tag: 'grammar' as CorrectionTag, original: 'While i agree', suggestion: 'While I agree', explanation: 'Capitalize the first letter in a sentence. "While I agree" — "I" is always capitalized.' },
      { id: 'c2', tag: 'word-choice' as CorrectionTag, original: 'important skills', suggestion: 'transferable skills', explanation: '"Important" is vague. "Transferable skills" is more precise and fits academic tone in American ESL writing.' },
      { id: 'c3', tag: 'article' as CorrectionTag, original: 'a university', suggestion: 'a university', explanation: 'Use "a" before words that start with a consonant sound. "University" starts with a "y" consonant sound, so "a university" is correct (not "an university").' },
      { id: 'c4', tag: 'preposition' as CorrectionTag, original: 'depend of', suggestion: 'depend on', explanation: '"Depend on" is the correct collocation in American English. "Depend of" is not standard usage.' },
    ] : [
      { id: 'c5', tag: 'grammar' as CorrectionTag, original: 'The graph show', suggestion: 'The graph shows', explanation: 'Third person singular subject requires -s. "The graph shows" not "The graph show."' },
      { id: 'c6', tag: 'article' as CorrectionTag, original: 'a effective', suggestion: 'an effective', explanation: '"An" before vowel sounds. "Effective" starts with a vowel sound, so "an effective" is correct.' },
      { id: 'c7', tag: 'word-choice' as CorrectionTag, original: 'good development', suggestion: 'remarkable growth', explanation: '"Good" is vague. In American academic writing, use more precise vocabulary: "remarkable," "significant," "substantial."' },
      { id: 'c8', tag: 'punctuation' as CorrectionTag, original: 'There was, however', suggestion: 'There was; however,', explanation: 'Use a semicolon before transitional adverbs like "however," "therefore," and "moreover."' },
    ]

    const delay = currentTopic.id.startsWith('t2') ? 3000 : 2000

    setTimeout(() => {
      setCorrections(correctionsPool)

      const baseBand = currentTopic.id.startsWith('t2') ? 5.5 : 6.0
      const wordBonus = Math.min(1.5, (wordCount - minWords) / 150)
      const band = Math.min(9, baseBand + wordBonus)

      setFeedback({
        band: Math.round(band * 10) / 10,
        dimensions: {
          tr: Math.round((band + (Math.random() > 0.5 ? 0.3 : -0.3)) * 10) / 10,
          cc: Math.round((band + (Math.random() > 0.5 ? 0.2 : -0.3)) * 10) / 10,
          lr: Math.round((band + (Math.random() > 0.5 ? 0.5 : -0.5)) * 10) / 10,
          gra: Math.round((band + (Math.random() > 0.5 ? 0.5 : -0.5)) * 10) / 10,
        },
        summary: wordCount > 300
          ? 'Strong essay with clear structure. Your argument is well-developed with specific examples. Focus on varied sentence structure to boost your Grammar score.'
          : 'Good start. Aim for 280+ words for stronger Task Response. Your introduction and conclusion are solid — work on paragraph development in the body.',
        suggestion: 'Key improvements: 1) Use transitions like "however," "moreover," "consequently"; 2) Replace vague words ("good," "big," "many") with precise alternatives; 3) Vary sentence lengths for better flow.',
      })

      setSubmitState('done')
    }, delay)
  }, [wordOk, currentTopic.id, wordCount, minWords])

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">✍️ AI 写作批改</h1>
          <p className="text-sm text-text-muted mt-1">双模式 · 美式语法教学 · 多考官评分</p>
        </div>
        {submitState === 'done' && (
          <Button variant="ghost" size="sm" onClick={() => {
            setEssay(''); setSubmitState('idle'); setIssues([]); setSelectedIssueId(null); setCorrections([]); setFeedback(null)
          }}>
            ✏️ 重新写作
          </Button>
        )}
      </div>

      {/* Mode Toggle Banner */}
      <div className="flex rounded-[14px] overflow-hidden border border-border-subtle">
        <button
          onClick={() => { setStudyMode('writing'); setIssues([]); setSelectedIssueId(null) }}
          className={cn(
            'flex-1 py-3 px-6 text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2',
            studyMode === 'writing'
              ? 'bg-accent-green text-bg-primary'
              : 'bg-bg-card text-text-secondary hover:bg-bg-elevated'
          )}
        >
          <span>✍️</span>
          <span>正常写作</span>
          <span className="text-xs opacity-70">提交评分</span>
        </button>
        <button
          onClick={() => setStudyMode('teaching')}
          className={cn(
            'flex-1 py-3 px-6 text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2',
            studyMode === 'teaching'
              ? 'bg-accent-gold text-bg-primary'
              : 'bg-bg-card text-text-secondary hover:bg-bg-elevated'
          )}
        >
          <span>🎓</span>
          <span>语法教学</span>
          <span className="text-xs opacity-70">实时纠错</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Left: Editor */}
        <div className={cn('space-y-4', submitState === 'done' ? 'xl:col-span-3' : 'xl:col-span-5')}>

          {/* Topic Selection (idle only) */}
          {submitState === 'idle' && (
            <Card className="p-4 space-y-3">
              {/* Task tabs */}
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-[10px] bg-bg-elevated p-1 gap-1">
                  {(['task1', 'task2'] as const).map((task) => (
                    <button
                      key={task}
                      onClick={() => handleSwitchTask(task)}
                      className={cn(
                        'px-4 py-1.5 text-xs font-semibold rounded-[8px] transition-all duration-200 cursor-pointer',
                        activeTask === task
                          ? 'bg-accent-green text-bg-primary'
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                    >
                      {task === 'task1' ? '📊 Task 1' : '📝 Task 2'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic selector */}
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
                        {'type' in topic && (topic as { type: string }).type ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-info/15 text-info font-semibold">
                            {(topic as { type: string }).type}
                          </span>
                        ) : null}
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
          )}

          {/* Submitted topic display */}
          {submitState === 'done' && (
            <Card className="p-3 bg-bg-elevated">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 text-sm font-bold',
                  activeTask === 'task1' ? 'bg-info/15 text-info' : 'bg-accent-gold/15 text-accent-gold'
                )}>
                  {activeTask === 'task1' ? 'T1' : 'T2'}
                </div>
                <p className="text-sm text-text-primary flex-1">{currentTopic.title}</p>
                <Button variant="ghost" size="sm" onClick={() => {
                  setSubmitState('idle'); setCorrections([]); setFeedback(null)
                }}>
                  修改
                </Button>
              </div>
            </Card>
          )}

          {/* Textarea */}
          <div className="relative">
            {studyMode === 'teaching' && essay.length > 10 && issues.length > 0 && (
              <div className="mb-2 flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-danger" />
                  <span className="text-danger font-semibold">{errorCount} errors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent-gold" />
                  <span className="text-accent-gold font-semibold">{warningCount} warnings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-text-muted" />
                  <span className="text-text-secondary">{suggestionCount} suggestions</span>
                </div>
                <span className="text-text-muted ml-auto">
                  点击高亮区域查看详情
                </span>
              </div>
            )}

            {studyMode === 'teaching' ? (
              <div className="relative" style={{ minHeight: '380px' }}>
                <HighlightedTextarea
                  value={essay}
                  onChange={setEssay}
                  disabled={submitState === 'loading'}
                  issues={issues}
                  onIssueClick={(id) => setSelectedIssueId(id)}
                  placeholder={activeTask === 'task1'
                    ? `Write your Task 1 essay here...\n\nTips: overview the main features, select key data, use comparisons.\n\nMin: ${minWords} words`
                    : `Write your Task 2 essay here...\n\nTips: intro with clear position, body paragraphs with examples, strong conclusion.\n\nMin: ${minWords} words`}
                  minHeight="380px"
                />

                {/* Clickable overlay for issue navigation */}
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className="absolute cursor-pointer"
                    style={{
                      top: '16px',
                      left: `${issue.start * 0.5}px`,
                      zIndex: 2,
                    }}
                  />
                ))}

                {submitState === 'loading' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[12px] bg-bg-primary/80 backdrop-blur-sm z-10">
                    <div className="w-10 h-10 border-3 border-accent-green/30 border-t-accent-green rounded-full animate-spin mb-3" />
                    <p className="text-sm text-text-secondary font-medium">AI 批改中...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <textarea
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  disabled={submitState === 'loading'}
                  className={cn(
                    'w-full h-[320px] rounded-[12px] border border-border-subtle bg-bg-card p-4',
                    'text-sm text-text-primary leading-[1.8] resize-none',
                    'focus:outline-none focus:border-accent-green/50',
                    'transition-all duration-200',
                    submitState === 'loading' && 'opacity-60 cursor-not-allowed'
                  )}
                  placeholder={activeTask === 'task1'
                    ? `Write your Task 1 essay here...\n\nTips: overview the main features, select key data, use comparisons.\n\nMin: ${minWords} words`
                    : `Write your Task 2 essay here...\n\nTips: intro with clear position, body paragraphs with examples, strong conclusion.\n\nMin: ${minWords} words`}
                />
                {submitState === 'loading' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[12px] bg-bg-primary/80 backdrop-blur-sm">
                    <div className="w-10 h-10 border-3 border-accent-green/30 border-t-accent-green rounded-full animate-spin mb-3" />
                    <p className="text-sm text-text-secondary font-medium">AI 批改中...</p>
                    <p className="text-xs text-text-muted mt-1">预计 {activeTask === 'task1' ? '2' : '3'} 秒</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 rounded-full bg-border-subtle overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', wordOk ? 'bg-accent-green' : 'bg-danger')}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className={cn('text-xs font-semibold', wordOk ? 'text-accent-green' : 'text-danger')}>
                  {wordCount}/{minWords}
                </span>
              </div>
              {!wordOk && essay.length > 0 && (
                <span className="text-xs text-danger/80">还需 {minWords - wordCount} 词</span>
              )}
              {wordOk && (
                <span className="text-xs text-accent-green">✓ 达标</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setEssay(''); setIssues([]); setSelectedIssueId(null) }}
              >
                🗑️ 清空
              </Button>
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

        {/* Right: Issue Panel (teaching mode) */}
        {studyMode === 'teaching' && issues.length > 0 && selectedIssue && (
          <div className="xl:col-span-2 space-y-3">
            <IssuePanel
              issue={selectedIssue}
              onDismiss={() => {
                setIssues((prev) => prev.filter((i) => i.id !== selectedIssueId))
                setSelectedIssueId(null)
              }}
              onPrev={() => {
                const idx = issues.findIndex((i) => i.id === selectedIssueId)
                if (idx > 0) setSelectedIssueId(issues[idx - 1].id)
              }}
              onNext={() => {
                const idx = issues.findIndex((i) => i.id === selectedIssueId)
                if (idx < issues.length - 1) setSelectedIssueId(issues[idx + 1].id)
              }}
              isFirst={issueIndex === 0}
              isLast={issueIndex === issues.length - 1}
              total={issues.length}
              index={issueIndex}
            />

            {/* All issues list */}
            <Card className="p-4">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-[0.7px] mb-3">
                全部问题 ({issues.length})
              </h4>
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {issues.map((issue, idx) => {
                  const tag = TAG_CONFIG[issue.tag]
                  return (
                    <button
                      key={issue.id}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className={cn(
                        'w-full flex items-center gap-2 p-2 rounded-[8px] text-left transition-all duration-200 cursor-pointer',
                        selectedIssueId === issue.id
                          ? `${tag.bg} border border-${tag.color}/30`
                          : 'hover:bg-bg-elevated'
                      )}
                    >
                      <span className={cn('text-xs font-bold w-4 flex-shrink-0', tag.color)}>{idx + 1}</span>
                      <span className={cn('text-xs font-semibold px-1.5 py-0.5 rounded-full text-[9px]', tag.bg, tag.color)}>
                        {tag.label}
                      </span>
                      <span className="text-xs text-text-secondary truncate flex-1">{issue.original}</span>
                      <span className="text-xs text-accent-green truncate">→ {issue.suggestion}</span>
                    </button>
                  )
                })}
              </div>
            </Card>

            {/* Grammar tips */}
            <Card className="p-4 bg-accent-gold/5 border-accent-gold/20">
              <h4 className="text-xs font-semibold text-accent-gold mb-2">💡 美式语法提示</h4>
              <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
                <p>• Use active voice when possible — clearer and more direct</p>
                <p>• Transitions: <span className="font-semibold">however,</span> needs semicolon before it</p>
                <p>• Articles: "a" for consonant sounds, "an" for vowel sounds</p>
                <p>• "Affect" = verb, "Effect" = noun — don't confuse them</p>
              </div>
            </Card>
          </div>
        )}

        {/* Right: Feedback Panel (done) */}
        {submitState === 'done' && feedback && (
          <div className="xl:col-span-2 space-y-4 animate-fade-in">
            {/* Score */}
            <Card className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[11px] text-text-muted uppercase tracking-[0.7px] font-semibold">总体得分</p>
                  <div className={cn('text-5xl font-bold mt-1', feedback.band >= 7 ? 'text-accent-green' : feedback.band >= 5.5 ? 'text-accent-gold' : 'text-danger')}>
                    {feedback.band.toFixed(1)}
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">Band Score</p>
                </div>
                <Button variant="ghost" size="sm">💬 质疑评分</Button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { label: 'TR', score: feedback.dimensions.tr, desc: '任务回应' },
                  { label: 'CC', score: feedback.dimensions.cc, desc: '连贯衔接' },
                  { label: 'LR', score: feedback.dimensions.lr, desc: '词汇资源' },
                  { label: 'GRA', score: feedback.dimensions.gra, desc: '语法范围' },
                ] as const).map((dim) => (
                  <div key={dim.label} className="rounded-[10px] bg-bg-elevated p-3 text-center">
                    <p className="text-[10px] text-text-muted font-semibold">{dim.label}</p>
                    <p className={cn('text-lg font-bold mt-0.5', dim.score >= 7 ? 'text-accent-green' : dim.score >= 5.5 ? 'text-accent-gold' : 'text-danger')}>
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
                批改详情 ({corrections.length} 处)
              </h3>
              <div className="space-y-4">
                {corrections.map((item, idx) => {
                  const tag = TAG_CONFIG[item.tag]
                  return (
                    <div key={item.id} className="space-y-2 pb-4 border-b border-border-subtle last:border-0 last:pb-0">
                      <span className={cn('inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full', tag.bg, tag.color)}>
                        {idx + 1} {tag.label}
                      </span>
                      <div className="flex items-start gap-2">
                        <span className="text-danger text-xs mt-0.5">✗</span>
                        <p className="text-xs text-text-secondary line-through">{item.original}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-accent-green text-xs mt-0.5">✓</span>
                        <p className="text-xs text-accent-green font-medium">{item.suggestion}</p>
                      </div>
                      <p className="text-[11px] text-text-muted bg-bg-elevated rounded-[8px] p-2 leading-relaxed">
                        📖 {item.explanation}
                      </p>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )}

        {/* Empty state (idle, no submission) */}
        {submitState === 'idle' && studyMode === 'writing' && (
          <div className="xl:col-span-2 hidden xl:flex">
            <Card className="h-full flex flex-col items-center justify-center text-center p-8 min-h-[360px]">
              <span className="text-5xl mb-4">✍️</span>
              <h3 className="text-base font-bold text-text-primary mb-2">写作助手</h3>
              <p className="text-sm text-text-muted leading-relaxed mb-4">
                选择题目后在左侧撰写作文<br />
                完成后点击"提交批改"<br />
                AI 将给出详细分数和改进建议
              </p>
              <div className="space-y-2 text-left w-full max-w-[200px]">
                {[['📊', 'Task 1: 图表描述'], ['📝', 'Task 2: 议论文'], ['🎯', `最低 ${minWords} 词`], ['🤖', 'AI 四维评分']].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-text-muted">
                    <span>{icon}</span> {text}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}