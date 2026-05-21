import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/utils/cn'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

// ─── Types ───────────────────────────────────────────────────────────────
interface VocabWord {
  id: string
  word: string
  phonetic: string
  pos: string
  meaning: string
  example: string
  savedAt: string
  sourceParagraph?: string
}

interface SelectedTextState {
  text: string
  x: number
  y: number
  visible: boolean
}

// ─── Mock Dictionary ─────────────────────────────────────────────────────
const DICTIONARY: Record<string, { phonetic: string; pos: string; meaning: string; example: string }> = {
  artificial: { phonetic: '/ˌɑːrtɪˈfɪʃl/', pos: 'adj.', meaning: '人造的；虚假的；矫揉造作的', example: 'The artificial intelligence system can process millions of data points per second.' },
  intelligence: { phonetic: '/ɪnˈtelɪdʒəns/', pos: 'n.', meaning: '智力；情报；智能', example: 'Her intelligence and dedication made her an invaluable member of the team.' },
  employment: { phonetic: '/ɪmˈplɔɪmənt/', pos: 'n.', meaning: '就业；雇用；职业', example: 'The government introduced new policies to boost employment rates.' },
  multifaceted: { phonetic: '/ˌmʌltiˈfæsɪtɪd/', pos: 'adj.', meaning: '多方面的；多才多艺的', example: 'The problem requires a multifaceted approach to solve.' },
  automation: { phonetic: '/ˌɔːtəˈmeɪʃn/', pos: 'n.', meaning: '自动化；自动操作', example: 'Factory automation has significantly increased production efficiency.' },
  displacement: { phonetic: '/dɪsˈpleɪsmənt/', pos: 'n.', meaning: '取代；置换；被迫迁移', example: 'Technological displacement of workers is a growing concern in many industries.' },
  occupations: { phonetic: '/ˌɑːkjuˈpeɪʃnz/', pos: 'n.', meaning: '职业；占有（复数）', example: 'Many traditional occupations are being transformed by digital technology.' },
  unprecedented: { phonetic: '/ʌnˈpresɪdentɪd/', pos: 'adj.', meaning: '空前的；史无前例的', example: 'The pandemic caused unprecedented disruption to global supply chains.' },
  productivity: { phonetic: '/ˌprɑːdʌkˈtɪvəti/', pos: 'n.', meaning: '生产力；生产率', example: 'Remote work has had mixed effects on employee productivity.' },
  resilience: { phonetic: '/rɪˈzɪliəns/', pos: 'n.', meaning: '韧性；恢复力；弹力', example: 'The community showed remarkable resilience in the face of adversity.' },
  emerging: { phonetic: '/ɪˈmɜːrdʒɪŋ/', pos: 'adj.', meaning: '新兴的；出现的', example: 'Emerging markets are driving global economic growth.' },
  profound: { phonetic: '/prəˈfaʊnd/', pos: 'adj.', meaning: '深刻的；意义深远的', example: 'The discovery had a profound impact on medical science.' },
  transition: { phonetic: '/trænˈzɪʃn/', pos: 'n.', meaning: '过渡；转变；转换', example: 'The transition to renewable energy will take decades.' },
  delicate: { phonetic: '/ˈdelɪkət/', pos: 'adj.', meaning: '微妙的；精致的；脆弱的', example: 'Negotiations require a delicate balance of competing interests.' },
  innovation: { phonetic: '/ˌɪnəˈveɪʃn/', pos: 'n.', meaning: '创新；革新；新事物', example: 'Innovation is the key to staying competitive in the modern economy.' },
  imperative: { phonetic: '/ɪmˈperətɪv/', pos: 'adj.', meaning: '必要的；紧急的；命令的', example: 'It is imperative that we address climate change without delay.' },
  contemporary: { phonetic: '/kənˈtempəreri/', pos: 'adj.', meaning: '当代的；同时代的', example: 'Contemporary art often challenges traditional notions of beauty.' },
  contested: { phonetic: '/kənˈtestɪd/', pos: 'adj.', meaning: '有争议的；争夺的', example: 'The election results were highly contested by both parties.' },
  terrain: { phonetic: '/təˈreɪn/', pos: 'n.', meaning: '地形；领域；地势', example: 'Navigating the political terrain requires skill and diplomacy.' },
  proponents: { phonetic: '/prəˈpoʊnənts/', pos: 'n.', meaning: '支持者；倡导者', example: 'Proponents of the new policy argue it will boost economic growth.' },
  autonomy: { phonetic: '/ɔːˈtɑːnəmi/', pos: 'n.', meaning: '自主权；自治；自主', example: 'Employees value autonomy in how they manage their work.' },
  arrangements: { phonetic: '/əˈreɪndʒmənts/', pos: 'n.', meaning: '安排；布置；协议', example: 'Flexible working arrangements have become more common post-pandemic.' },
  erosion: { phonetic: '/ɪˈroʊʒn/', pos: 'n.', meaning: '侵蚀；削弱；腐蚀', example: 'There has been a gradual erosion of trust in traditional institutions.' },
  bargaining: { phonetic: '/ˈbɑːrɡənɪŋ/', pos: 'n.', meaning: '谈判；讨价还价', example: 'Collective bargaining is a fundamental right of workers.' },
}

function lookupWord(word: string): { phonetic: string; pos: string; meaning: string; example: string } | null {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '')
  const exact = DICTIONARY[clean]
  if (exact) return exact
  // Fuzzy match
  const keys = Object.keys(DICTIONARY)
  for (const key of keys) {
    if (key.startsWith(clean) || clean.startsWith(key) || key.includes(clean)) {
      return DICTIONARY[key]
    }
    // Levenshtein within 2 edits
    if (levenshtein(key, clean) <= 2) return DICTIONARY[key]
  }
  return null
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1
  return dp[m][n]
}

// ─── Paragraph Translations (mock) ───────────────────────────────────────
const PARA_TRANSLATIONS = [
  '本文讨论了技术变革对发达经济体和发展中经济体劳动力市场的多方面影响。研究表明，虽然自动化取代了某些常规性职业，但同时它也创造了以前无法想象的新型就业类别。',
  '以往工业革命的历史先例表明，尽管最初会造成混乱，但技术进步最终创造的就业岗位多于其淘汰的岗位。然而，当前数字变革的规模和速度对转型期以及劳动力再培训计划的充分性提出了前所未有的问题。',
  '政策制定者面临着平衡创新激励与社会保护要求的微妙挑战。那些大力投资教育和终身学习框架的国家在吸收技术冲击方面表现出了更强的韧性。',
  '零工经济和平台型工作的出现代表了一个特别有争议的领域。虽然支持者称赞这些安排为工人提供的灵活性和自主性，但批评者指出这会削弱就业保护、福利和议价能力。',
]

// ─── Passages ───────────────────────────────────────────────────────────
const PASSAGES = [
  { id: 'p1', title: 'The Impact of Artificial Intelligence on Employment', source: 'IELTS Academic Reading - Cambridge 18', type: 'academic', difficulty: '7.0', time: 20, questions: 13, tags: ['科技', '社会'] },
  { id: 'p2', title: 'Urban Agriculture and Food Security', source: 'IELTS General Training', type: 'general', difficulty: '6.5', time: 20, questions: 13, tags: ['环境', '农业'] },
  { id: 'p3', title: 'The Psychology of Color in Marketing', source: 'IELTS Academic Reading', type: 'academic', difficulty: '7.5', time: 20, questions: 13, tags: ['心理学', '商业'] },
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

// ─── Helpers ────────────────────────────────────────────────────────────
function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// ─── Floating Selection Toolbar ──────────────────────────────────────────
function SelectionToolbar({
  text,
  position,
  onTranslate,
  onAddToVocab,
  onClose,
}: {
  text: string
  position: { x: number; y: number }
  onTranslate: (text: string) => void
  onAddToVocab: (text: string) => void
  onClose: () => void
}) {
  const toolbarRef = useRef<HTMLDivElement>(null)
  const isSingleWord = text.trim().split(/\s+/).length === 1

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    setTimeout(() => document.addEventListener('click', handleClickOutside), 0)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])

  // Adjust position to stay in viewport
  const adjustedY = position.y - 50 < 0 ? position.y + 20 : position.y - 50

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 animate-fade-in"
      style={{ left: Math.min(position.x - 80, window.innerWidth - 220), top: adjustedY }}
    >
      <div className="flex items-center gap-1 rounded-[12px] bg-bg-card border border-border-subtle shadow-[0_4px_20px_rgba(0,0,0,0.25)] p-1.5">
        <button
          onClick={() => onTranslate(text)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold text-text-secondary hover:bg-accent-green/10 hover:text-accent-green transition-all duration-200 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="M22 22l-5-10-5 10" /><path d="M14 18h6" />
          </svg>
          翻译
        </button>
        <div className="w-px h-5 bg-border-subtle" />
        <button
          onClick={() => onAddToVocab(text)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold text-text-secondary hover:bg-accent-gold/10 hover:text-accent-gold transition-all duration-200 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          {isSingleWord ? '加入单词本' : '收藏短语'}
        </button>
      </div>
    </div>
  )
}

// ─── Translation Popover ────────────────────────────────────────────────
function TranslationPopover({
  text,
  onClose,
  onAddToVocab,
}: {
  text: string
  onClose: () => void
  onAddToVocab: (text: string) => void
}) {
  const words = text.trim().split(/\s+/)
  const firstWord = lookupWord(words[0])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-sm" />
      <div
        className="relative max-w-md w-full mx-4 rounded-[16px] bg-bg-card border border-border-subtle shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-text-primary">{text}</p>
              {firstWord && (
                <p className="text-xs text-text-muted mt-0.5">
                  {firstWord.phonetic} · {firstWord.pos}
                </p>
              )}
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-bg-elevated flex items-center justify-center hover:bg-border-subtle transition-colors cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Translation content */}
        <div className="p-5 space-y-4 max-h-[50vh] overflow-y-auto">
          {words.length === 1 && firstWord ? (
            <>
              <div className="rounded-[10px] bg-accent-green/8 border border-accent-green/20 p-3">
                <p className="text-xs font-semibold text-text-muted mb-1">中文释义</p>
                <p className="text-sm font-medium text-text-primary">{firstWord.meaning}</p>
              </div>
              <div className="rounded-[10px] bg-bg-elevated p-3">
                <p className="text-xs font-semibold text-text-muted mb-1">例句</p>
                <p className="text-sm text-text-secondary italic leading-relaxed">"{firstWord.example}"</p>
              </div>
            </>
          ) : (
            <div className="rounded-[10px] bg-accent-green/8 border border-accent-green/20 p-3">
              <p className="text-xs font-semibold text-text-muted mb-1">中文翻译</p>
              <p className="text-sm text-text-primary leading-relaxed">
                {/* Multi-word: use machine-translation-style rendering */}
                {text}：该短语/句子在当前语境下的翻译会根据上下文有所不同。建议逐个单词查询以获得更准确的理解。
              </p>
            </div>
          )}

          {/* Word breakdown for multi-word selections */}
          {words.length > 1 && (
            <div>
              <p className="text-xs font-semibold text-text-muted mb-2">单词拆解</p>
              <div className="space-y-2">
                {words.map((w, i) => {
                  const info = lookupWord(w)
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="font-bold text-accent-green min-w-[60px]">{w}</span>
                      {info ? (
                        <span className="text-text-secondary">{info.meaning}</span>
                      ) : (
                        <span className="text-text-muted italic">查无此词</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 pt-3 border-t border-border-subtle flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>关闭</Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => { onAddToVocab(text); onClose() }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            收藏
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Word Card in Sidebar ───────────────────────────────────────────────
function VocabCard({ word, onRemove }: { word: VocabWord; onRemove: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-[10px] border border-accent-gold/25 bg-accent-gold/5 overflow-hidden transition-all duration-200">
      <div className="flex items-center gap-2 p-2.5 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="w-6 h-6 rounded-[6px] bg-accent-gold/15 flex items-center justify-center text-xs flex-shrink-0">
          {word.word[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-primary truncate">{word.word}</p>
          <p className="text-[9px] text-text-muted truncate">{word.meaning.split('；')[0]}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(word.id) }}
          className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-danger/10 text-text-muted hover:text-danger transition-colors flex-shrink-0 cursor-pointer"
        >
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
            <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      {expanded && (
        <div className="px-2.5 pb-2.5 space-y-1.5 border-t border-accent-gold/15 pt-2">
          <p className="text-[10px] text-text-muted">{word.phonetic} · {word.pos}</p>
          <p className="text-[11px] text-text-primary">{word.meaning}</p>
          <p className="text-[10px] text-text-secondary italic leading-relaxed">"{word.example}"</p>
          {word.sourceParagraph && (
            <p className="text-[9px] text-text-muted/60 mt-0.5 line-clamp-2">
              来源：{word.sourceParagraph.substring(0, 60)}...
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function Reading() {
  const [activePassage, setActivePassage] = useState('p1')
  const [mode, setMode] = useState<'list' | 'practice'>('list')
  const [readingTime, setReadingTime] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Selection toolbar
  const [selection, setSelection] = useState<SelectedTextState>({ text: '', x: 0, y: 0, visible: false })

  // Translation popover
  const [translateText, setTranslateText] = useState<string | null>(null)

  // Vocab collection
  const [vocabList, setVocabList] = useState<VocabWord[]>([])
  const [vocabSidebarOpen, setVocabSidebarOpen] = useState(false)

  // Paragraph translations toggle
  const [showParaTrans, setShowParaTrans] = useState<Set<number>>(new Set())

  const passage = PASSAGES.find((p) => p.id === activePassage)

  // Timer
  useEffect(() => {
    if (mode === 'practice' && readingTime === 0) {
      timerRef.current = setInterval(() => setReadingTime((t) => t + 1), 1000)
      return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }
  }, [mode, readingTime])

  // Handle text selection
  const handleTextSelect = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelection((s) => ({ ...s, visible: false }))
      return
    }
    const text = sel.toString().trim().substring(0, 200)
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    setSelection({ text, x: rect.left + rect.width / 2, y: rect.top, visible: true })
  }, [])

  // Add to vocab
  const addToVocab = useCallback((text: string) => {
    const clean = text.trim().toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)[0]
    const info = lookupWord(clean)
    if (!info) return

    setVocabList((prev) => {
      if (prev.some((v) => v.word.toLowerCase() === clean)) return prev
      const newWord: VocabWord = {
        id: `v-${Date.now()}`,
        word: clean,
        phonetic: info.phonetic,
        pos: info.pos,
        meaning: info.meaning,
        example: info.example,
        savedAt: new Date().toISOString().slice(0, 10),
        sourceParagraph: text.substring(0, 80),
      }
      return [newWord, ...prev]
    })
    setSelection((s) => ({ ...s, visible: false }))
    setVocabSidebarOpen(true)
  }, [])

  const removeVocab = useCallback((id: string) => {
    setVocabList((prev) => prev.filter((v) => v.id !== id))
  }, [])

  const toggleParaTrans = (idx: number) => {
    setShowParaTrans((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  // List mode
  if (mode === 'list') {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">📖 阅读精讲</h1>
            <p className="text-sm text-text-muted mt-1">长难句分析 · 同义替换集训 · 真题精讲</p>
          </div>
          {vocabList.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setVocabSidebarOpen(!vocabSidebarOpen)}>
              📚 单词本 ({vocabList.length})
            </Button>
          )}
        </div>

        {/* Passage Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PASSAGES.map((p) => (
            <div
              key={p.id}
              onClick={() => { setActivePassage(p.id); setMode('practice'); setReadingTime(0); setAnswers({}); setSubmitted(false); setShowParaTrans(new Set()) }}
              className={cn(
                'rounded-[16px] border p-5 cursor-pointer transition-all duration-300',
                'hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(110,197,110,0.12)] hover:border-accent-green/50',
                activePassage === p.id ? 'border-accent-green/50 bg-accent-green/5' : 'border-border-subtle bg-bg-card'
              )}
            >
              <div className="h-24 rounded-[10px] bg-gradient-to-br from-bg-elevated to-accent-green/10 mb-4 flex items-center justify-center">
                <span className="text-3xl">📰</span>
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
              { icon: '📝', tip: '选中单词可加入单词本强化记忆' },
              { icon: '🌐', tip: '点击段落翻译按钮查看中文对照' },
              { icon: '🔍', tip: '长按选择文本后翻译或收藏' },
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

  // ─── Practice Mode ───────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto space-y-6" onMouseUp={handleTextSelect}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode('list')}
            className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            返回
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="new" size="sm">{passage?.tags.join(' · ')}</Badge>
          <button
            onClick={() => setVocabSidebarOpen(!vocabSidebarOpen)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all duration-200 cursor-pointer',
              vocabSidebarOpen ? 'bg-accent-gold/15 text-accent-gold' : 'bg-bg-elevated text-text-muted hover:text-text-secondary'
            )}
          >
            📚 {vocabList.length}
          </button>
          <span className="text-accent-gold font-mono font-bold text-sm">⏱ {formatTime(readingTime)}</span>
        </div>
      </div>

      <div className={cn('grid gap-6', vocabSidebarOpen ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1')}>
        {/* Main Content */}
        <div className={cn('space-y-4', vocabSidebarOpen ? 'lg:col-span-2' : 'lg:col-span-1')}>
          {/* Passage */}
          <Card>
            <div className="flex items-center justify-between mb-1">
              <CardTitle>{passage?.title}</CardTitle>
            </div>
            <div className="space-y-5 mt-4">
              {LOREM_PARAGRAPHS.map((para, idx) => (
                <div key={idx} className="group">
                  <div className="relative">
                    <p className={cn(
                      'text-sm leading-[1.9] transition-all duration-200',
                      translateText ? 'text-text-secondary' : 'text-text-primary'
                    )}>
                      {para}
                    </p>
                    {/* Paragraph translate button */}
                    <button
                      onClick={() => toggleParaTrans(idx)}
                      className={cn(
                        'absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-all duration-200',
                        'w-7 h-7 rounded-full flex items-center justify-center cursor-pointer',
                        showParaTrans.has(idx) ? 'bg-accent-green/20 text-accent-green opacity-100' : 'bg-bg-elevated text-text-muted hover:text-accent-green'
                      )}
                      title="翻译该段"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="M22 22l-5-10-5 10" /><path d="M14 18h6" />
                      </svg>
                    </button>
                  </div>
                  {/* Paragraph translation */}
                  {showParaTrans.has(idx) && (
                    <div className="mt-2 p-3 rounded-[10px] bg-info/8 border border-info/20 animate-fade-in">
                      <div className="flex items-center gap-2 mb-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-info">
                          <path d="M5 8l6 6" /><path d="M4 14l6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" />
                        </svg>
                        <span className="text-[10px] font-semibold text-info">中文翻译</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{PARA_TRANSLATIONS[idx]}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between">
              <p className="text-xs text-text-muted">
                来源：{passage?.source} · {passage?.questions}题 · 建议 {passage?.time} 分钟
              </p>
              <button
                onClick={() => { const all = new Set<number>(LOREM_PARAGRAPHS.map((_, i) => i)); setShowParaTrans(showParaTrans.size > 0 ? new Set() : all) }}
                className="text-xs font-semibold text-accent-green hover:underline cursor-pointer"
              >
                {showParaTrans.size > 0 ? '收起翻译' : '全部翻译'}
              </button>
            </div>
          </Card>

          {/* Questions */}
          <Card>
            <CardTitle>Questions 1-4 (True / False / Not Given)</CardTitle>
            <div className="space-y-4 mt-3">
              <p className="text-sm text-text-secondary mb-3">
                Choose TRUE if the statement agrees with the claims of the writer. Choose FALSE if the statement contradicts the claims of the writer. Choose NOT GIVEN if it is impossible to know from the passage what the writer thinks.
              </p>
              {[1, 2, 3, 4].map((q) => (
                <div key={q} className="mb-4 p-3 rounded-[10px] bg-bg-elevated">
                  <p className="text-text-primary font-medium mb-2 text-sm">
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
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border-subtle">
              <Button variant="secondary" size="sm" onClick={() => { setAnswers({}); setSubmitted(false) }}>
                重置
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSubmitted(true)}>
                提交答案
              </Button>
            </div>
          </Card>
        </div>

        {/* Vocab Sidebar */}
        {vocabSidebarOpen && (
          <div className="space-y-4 lg:col-span-1">
            {/* Vocab Collection */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-[0.7px]">📚 单词本</h3>
                {vocabList.length > 0 && (
                  <span className="text-xs text-text-muted">{vocabList.length} 词</span>
                )}
              </div>

              {vocabList.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-3xl mb-3 block">🔖</span>
                  <p className="text-xs text-text-muted">选中文章中的单词<br/>点击"加入单词本"收藏</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {vocabList.map((word) => (
                    <VocabCard key={word.id} word={word} onRemove={removeVocab} />
                  ))}
                </div>
              )}
            </Card>

            {/* Question Types */}
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
        )}
      </div>

      {/* Selection toolbar */}
      {selection.visible && (
        <SelectionToolbar
          text={selection.text}
          position={{ x: selection.x, y: selection.y }}
          onTranslate={(text) => { setTranslateText(text); setSelection((s) => ({ ...s, visible: false })) }}
          onAddToVocab={addToVocab}
          onClose={() => setSelection((s) => ({ ...s, visible: false }))}
        />
      )}

      {/* Translation popover */}
      {translateText && (
        <TranslationPopover
          text={translateText}
          onClose={() => setTranslateText(null)}
          onAddToVocab={(text) => { addToVocab(text); setTranslateText(null) }}
        />
      )}
    </div>
  )
}
