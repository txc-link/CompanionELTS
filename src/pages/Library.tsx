import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { cn } from '@/utils/cn'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

// ─── Types ───────────────────────────────────────────────────────────────
interface Book {
  id: string
  title: string
  author: string
  format: 'txt' | 'epub' | 'md'
  cover: string
  pages: number
  progress: number
  importedAt: string
  content: string[]
  highlights: Highlight[]
  notes: Note[]
}

interface Highlight {
  id: string
  text: string
  color: 'yellow' | 'green' | 'blue' | 'pink'
  note?: string
  bookId: string
  paragraphIdx: number
  createdAt: string
}

interface Note {
  id: string
  text: string
  bookId: string
  paragraphIdx: number
  createdAt: string
}

interface VocabWord {
  id: string
  word: string
  phonetic: string
  pos: string
  meaning: string
  example: string
  savedAt: string
  sourceBook?: string
}

interface SelectedTextState {
  text: string
  x: number
  y: number
  visible: boolean
}

// ─── Dictionary ──────────────────────────────────────────────────────────
const DICTIONARY: Record<string, { phonetic: string; pos: string; meaning: string; example: string }> = {
  artificial: { phonetic: '/ˌɑːrtɪˈfɪʃl/', pos: 'adj.', meaning: '人造的；虚假的；矫揉造作的', example: 'The artificial intelligence system can process millions of data points per second.' },
  intelligence: { phonetic: '/ɪnˈtelɪdʒəns/', pos: 'n.', meaning: '智力；情报；智能', example: 'Her intelligence and dedication made her an invaluable member of the team.' },
  employment: { phonetic: '/ɪmˈplɔɪmənt/', pos: 'n.', meaning: '就业；雇用；职业', example: 'The government introduced new policies to boost employment rates.' },
  unprecedented: { phonetic: '/ʌnˈpresɪdentɪd/', pos: 'adj.', meaning: '空前的；史无前例的', example: 'The pandemic caused unprecedented disruption.' },
  profound: { phonetic: '/prəˈfaʊnd/', pos: 'adj.', meaning: '深刻的；意义深远的', example: 'The discovery had a profound impact.' },
  innovation: { phonetic: '/ˌɪnəˈveɪʃn/', pos: 'n.', meaning: '创新；革新；新事物', example: 'Innovation is key to staying competitive.' },
  resilience: { phonetic: '/rɪˈzɪliəns/', pos: 'n.', meaning: '韧性；恢复力；弹力', example: 'The community showed remarkable resilience.' },
  autonomy: { phonetic: '/ɔːˈtɑːnəmi/', pos: 'n.', meaning: '自主权；自治；自主', example: 'Employees value autonomy in their work.' },
  significant: { phonetic: '/sɪɡˈnɪfɪkənt/', pos: 'adj.', meaning: '显著的；重要的；有意义的', example: 'There was a significant increase in enrollment.' },
  contemporary: { phonetic: '/kənˈtempəreri/', pos: 'adj.', meaning: '当代的；同时代的', example: 'Contemporary art challenges traditional notions.' },
}

function lookupWord(word: string) {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '')
  if (DICTIONARY[clean]) return DICTIONARY[clean]
  const keys = Object.keys(DICTIONARY)
  for (const key of keys) {
    if (key.startsWith(clean) || clean.startsWith(key) || key.includes(clean)) return DICTIONARY[key]
  }
  return null
}

function formatDate(date: string) {
  return date.replace(/-/g, '/')
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// ─── Highlight Colors ────────────────────────────────────────────────────
const HIGHLIGHT_COLORS = [
  { key: 'yellow', color: '#fbbf24', bg: 'rgba(251,191,36,0.25)' },
  { key: 'green', color: '#6ec56e', bg: 'rgba(110,197,110,0.25)' },
  { key: 'blue', color: '#5b9bd5', bg: 'rgba(91,155,213,0.25)' },
  { key: 'pink', color: '#f472b6', bg: 'rgba(244,114,182,0.25)' },
] as const

const HIGHLIGHT_COLOR_MAP: Record<string, string> = {
  yellow: 'rgba(251,191,36,0.25)',
  green: 'rgba(110,197,110,0.25)',
  blue: 'rgba(91,155,213,0.25)',
  pink: 'rgba(244,114,182,0.25)',
}

// ─── Mock Books ─────────────────────────────────────────────────────────
const DEFAULT_BOOKS: Book[] = [
  {
    id: 'lib-1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', format: 'txt',
    cover: '📗', pages: 180, progress: 35, importedAt: '2026-05-15',
    content: [
      'In my younger and more vulnerable years my father gave me some advice that I have been turning over in my mind ever since.',
      '"Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven\'t had the advantages that you\'ve had."',
      'He didn\'t say any more, but we have always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that.',
      'In consequence, I\'m inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.',
      'The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men.',
      'Most of the confidences were unsought—frequently I have feigned sleep, preoccupation, or a hostile levity when I realized by some unmistakable sign that an intimate revelation was quivering on the horizon.',
      'Reserving judgments is a matter of infinite hope. I am still a little afraid of missing something if I forget that, as my father snobbishly suggested, and I snobbishly repeat, a sense of the fundamental decencies is parcelled out unequally at birth.',
      'And, after boasting this way of my tolerance, I come to the admission that it has a limit. Conduct may be founded on the hard rock or the wet marshes, but after a certain point I don\'t care what it\'s founded on.',
      'When I came back from the East last autumn I felt that I wanted the world to be in uniform and at a sort of moral attention forever. I wanted no more riotous excursions with privileged glimpses into the human heart.',
      'Only Gatsby, the man who gives his name to this book, was exempt from my reaction—Gatsby, who represented everything for which I have an unaffected scorn.',
      'If personality is an unbroken series of successful gestures, then there was something gorgeous about him, some heightened sensitivity to the promises of life, as if he were related to one of those intricate machines that register earthquakes ten thousand miles away.',
      'This responsiveness had nothing to do with that flabby impressionability which is dignified under the name of the "creative temperament"—it was an extraordinary gift for hope, a romantic readiness such as I have never found in any other person and which it is not likely I shall ever find again.',
      'No—Gatsby turned out all right at the end; it is what preyed on Gatsby, what foul dust floated in the wake of his dreams that temporarily closed out my interest in the abortive sorrows and short-winded elations of men.',
      'My family have been prominent, well-to-do people in this middle-western city for three generations. The Carraways are something of a clan, and we have a tradition that we\'re descended from the Dukes of Buccleuch, but the actual founder of my line was my grandfather\'s brother, who came here in fifty-one, and sent a substitute to the Civil War, and started the wholesale hardware business that my father carries on today.',
      'I never saw this great-uncle, but I\'m supposed to look like him—with special reference to the rather hard-boiled painting that hangs in father\'s office. I graduated from New Haven in 1915, just a quarter of a century after my father, and a little later I participated in that delayed Teutonic migration known as the Great War.',
    ],
    highlights: [], notes: [],
  },
  {
    id: 'lib-2', title: 'Pride and Prejudice', author: 'Jane Austen', format: 'txt',
    cover: '📘', pages: 432, progress: 12, importedAt: '2026-05-10',
    content: [
      'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
      'However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.',
      '"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"',
      'Mr. Bennet replied that he had not.',
      '"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."',
      'Mr. Bennet made no answer.',
      '"Do you not want to know who has taken it?" cried his wife impatiently.',
      '"You want to tell me, and I have no objection to hearing it."',
      'This was invitation enough.',
      '"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England."',
    ],
    highlights: [], notes: [],
  },
  {
    id: 'lib-3', title: 'IELTS Reading Sample: Climate Change', author: 'IELTS Academic', format: 'md',
    cover: '📋', pages: 8, progress: 0, importedAt: '2026-05-20',
    content: [
      '# Climate Change and Its Global Impact',
      'Climate change represents one of the most significant challenges facing humanity in the twenty-first century. The scientific consensus is clear: global temperatures are rising at an unprecedented rate due to human activities.',
      '## Evidence of Climate Change',
      'Multiple lines of evidence support the reality of climate change. Global average temperatures have risen by approximately 1.1°C since pre-industrial times. Sea levels are rising at an accelerating rate due to thermal expansion and melting ice sheets.',
      'The frequency and intensity of extreme weather events have also increased significantly. Heatwaves, droughts, and floods are becoming more common and more severe across all continents.',
      '## Impact on Ecosystems',
      'Ecosystems worldwide are experiencing profound disruptions. Coral reefs are undergoing mass bleaching events at alarming rates. Many species are shifting their ranges toward the poles in response to warming temperatures.',
      'The resilience of natural systems is being tested in ways that have no historical precedent. Some scientists argue that we are entering the sixth mass extinction event in Earth\'s history.',
      '## Policy Responses',
      'Governments around the world have implemented various policy responses to address climate change. The Paris Agreement, signed by 196 parties, represents a unprecedented international commitment to limit global warming.',
      'However, the gap between current policy trajectories and what is needed to avoid catastrophic warming remains significant. Innovation in clean energy technologies will be essential to bridge this gap.',
      '## Conclusion',
      'The profound challenges posed by climate change require equally profound changes in how we produce and consume energy. The autonomy of future generations depends on the decisions we make today.',
    ],
    highlights: [], notes: [],
  },
]

// ─── Selection Toolbar ──────────────────────────────────────────────────
function SelectionToolbar({
  text, position, onTranslate, onAddToVocab, onHighlight, onNote, onClose,
}: {
  text: string; position: { x: number; y: number }
  onTranslate: (text: string) => void; onAddToVocab: (text: string) => void
  onHighlight: (text: string, color: 'yellow' | 'green' | 'blue' | 'pink') => void
  onNote: (text: string) => void; onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isSingle = text.trim().split(/\s+/).length === 1
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    setTimeout(() => document.addEventListener('click', h), 0)
    return () => document.removeEventListener('click', h)
  }, [onClose])
  const top = position.y - 50 < 0 ? position.y + 20 : position.y - 50

  return (
    <div ref={ref} className="fixed z-50 animate-fade-in" style={{ left: Math.min(position.x - 100, window.innerWidth - 280), top }}>
      <div className="flex items-center gap-1 rounded-[12px] bg-bg-card border border-border-subtle shadow-[0_4px_20px_rgba(0,0,0,0.25)] p-1.5">
        <button onClick={() => onTranslate(text)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-semibold text-text-secondary hover:bg-accent-green/10 hover:text-accent-green transition-all duration-200 cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>
          翻译
        </button>
        <div className="w-px h-4 bg-border-subtle" />
        {/* Highlight colors */}
        <div className="flex items-center gap-0.5 px-1">
          {HIGHLIGHT_COLORS.map((hc) => (
            <button key={hc.key} onClick={() => onHighlight(text, hc.key as any)} className="w-5 h-5 rounded-[4px] transition-transform hover:scale-125 cursor-pointer" style={{ backgroundColor: hc.color }} title={hc.key} />
          ))}
        </div>
        <div className="w-px h-4 bg-border-subtle" />
        <button onClick={() => onNote(text)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-semibold text-text-secondary hover:bg-accent-gold/10 hover:text-accent-gold transition-all duration-200 cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          笔记
        </button>
        <button onClick={() => onAddToVocab(text)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-semibold text-text-secondary hover:bg-accent-gold/10 hover:text-accent-gold transition-all duration-200 cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          {isSingle ? '收藏' : '收藏短语'}
        </button>
      </div>
    </div>
  )
}

// ─── Translation Popover ────────────────────────────────────────────────
function TranslationPopover({ text, onClose, onAddToVocab }: { text: string; onClose: () => void; onAddToVocab: (text: string) => void }) {
  const words = text.trim().split(/\s+/)
  const firstWord = lookupWord(words[0])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-sm" />
      <div className="relative max-w-md w-full mx-4 rounded-[16px] bg-bg-card border border-border-subtle shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 pb-3 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-bold text-text-primary">{text}</p>
              {firstWord && <p className="text-xs text-text-muted mt-0.5">{firstWord.phonetic} · {firstWord.pos}</p>}
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-bg-elevated flex items-center justify-center hover:bg-border-subtle cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
        <div className="p-5 space-y-4 max-h-[50vh] overflow-y-auto">
          {words.length === 1 && firstWord ? (
            <>
              <div className="rounded-[10px] bg-accent-green/8 border border-accent-green/20 p-3">
                <p className="text-xs font-semibold text-text-muted mb-1">中文释义</p>
                <p className="text-sm font-medium text-text-primary">{firstWord.meaning}</p>
              </div>
              <div className="rounded-[10px] bg-bg-elevated p-3">
                <p className="text-xs font-semibold text-text-muted mb-1">例句</p>
                <p className="text-sm text-text-secondary italic">"{firstWord.example}"</p>
              </div>
            </>
          ) : (
            <div className="rounded-[10px] bg-accent-green/8 border border-accent-green/20 p-3">
              <p className="text-xs font-semibold text-text-muted mb-1">单词拆解</p>
              <div className="space-y-2 mt-2">
                {words.map((w, i) => {
                  const info = lookupWord(w)
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="font-bold text-accent-green min-w-[60px]">{w}</span>
                      {info ? <span className="text-text-secondary">{info.meaning}</span> : <span className="text-text-muted italic">查无此词</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 pt-3 border-t border-border-subtle flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>关闭</Button>
          <Button variant="primary" size="sm" onClick={() => { onAddToVocab(text); onClose() }}>收藏</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Note Modal ─────────────────────────────────────────────────────────
function NoteModal({ text, onSave, onClose }: { text: string; onSave: (note: string) => void; onClose: () => void }) {
  const [noteText, setNoteText] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-bg-primary/60 backdrop-blur-sm" />
      <div className="relative max-w-sm w-full mx-4 rounded-[16px] bg-bg-card border border-border-subtle shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary mb-1">添加笔记</h3>
            <p className="text-xs text-text-muted italic line-clamp-2">"{text}"</p>
          </div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="写下你的想法、翻译、理解…"
            className="w-full h-24 rounded-[10px] border border-border-subtle bg-bg-elevated p-3 text-sm text-text-primary resize-none focus:outline-none focus:border-accent-green/50"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>取消</Button>
            <Button variant="primary" size="sm" onClick={() => { onSave(noteText); onClose() }} disabled={!noteText.trim()}>保存</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function Library() {
  const [books, setBooks] = useState<Book[]>(DEFAULT_BOOKS)
  const [activeView, setActiveView] = useState<'shelf' | 'reader' | 'notes'>('shelf')
  const [activeBookId, setActiveBookId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reading state
  const [readingTime, setReadingTime] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [vocabList, setVocabList] = useState<VocabWord[]>([])
  const [vocabSidebarOpen, setVocabSidebarOpen] = useState(false)
  const [selection, setSelection] = useState<SelectedTextState>({ text: '', x: 0, y: 0, visible: false })
  const [translateText, setTranslateText] = useState<string | null>(null)
  const [noteTarget, setNoteTarget] = useState<string | null>(null)

  const activeBook = books.find((b) => b.id === activeBookId) || null
  const contentLines = activeBook?.content || []
  const maxPages = contentLines.length

  // ─── File Import ─────────────────────────────────────────────────────
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase() as 'txt' | 'md' | 'epub' | undefined
    if (!ext || !['txt', 'md', 'epub'].includes(ext)) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const raw = ev.target?.result as string || ''
      const lines = ext === 'epub'
        ? raw.replace(/\r\n/g, '\n').split(/\n\n+/).filter(Boolean)
        : raw.replace(/\r\n/g, '\n').split('\n').filter(Boolean)

      const newBook: Book = {
        id: `lib-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        author: 'Imported',
        format: ext,
        cover: ext === 'md' ? '📋' : ext === 'epub' ? '📖' : '📄',
        pages: lines.length,
        progress: 0,
        importedAt: new Date().toISOString().slice(0, 10),
        content: lines,
        highlights: [],
        notes: [],
      }
      setBooks((prev) => [newBook, ...prev])
    }
    if (ext === 'epub') reader.readAsText(file, 'utf-8')
    else reader.readAsText(file, 'utf-8')
    e.target.value = ''
  }

  // ─── Timer ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeView === 'reader' && !timerRef.current) {
      timerRef.current = setInterval(() => setReadingTime((t) => t + 1), 1000)
    }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null } }
  }, [activeView])

  // ─── Text Selection ─────────────────────────────────────────────────
  const handleTextSelect = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) { setSelection((s) => ({ ...s, visible: false })); return }
    const text = sel.toString().trim().substring(0, 200)
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    setSelection({ text, x: rect.left + rect.width / 2, y: rect.top, visible: true })
  }, [])

  // ─── Vocab ───────────────────────────────────────────────────────────
  const addToVocab = useCallback((text: string) => {
    const clean = text.trim().toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)[0]
    const info = lookupWord(clean)
    if (!info) return
    setVocabList((prev) => {
      if (prev.some((v) => v.word.toLowerCase() === clean)) return prev
      return [{ id: `v-${Date.now()}`, word: clean, phonetic: info.phonetic, pos: info.pos, meaning: info.meaning, example: info.example, savedAt: new Date().toISOString().slice(0, 10), sourceBook: activeBook?.title }, ...prev]
    })
    setVocabSidebarOpen(true)
  }, [activeBook])

  // ─── Reader-Scoped State for Instant Feedback ─────────────────────────
  const [readerHighlights, setReaderHighlights] = useState<Highlight[]>([])
  const [readerNotes, setReaderNotes] = useState<Note[]>([])

  // Sync from activeBook when entering reader
  useEffect(() => {
    if (activeBook && activeView === 'reader') {
      setReaderHighlights(activeBook.highlights)
      setReaderNotes(activeBook.notes)
    }
  }, [activeBookId, activeView]) // eslint-disable-line react-hooks/exhaustive-deps

  // Merge reader highlights/notes back into books when exiting
  const flushToBooks = useCallback(() => {
    if (!activeBookId) return
    setBooks((prev) => prev.map((b) => {
      if (b.id !== activeBookId) return b
      return { ...b, highlights: readerHighlights, notes: readerNotes, progress: Math.round((currentPage / Math.max(1, b.content.length)) * 100) }
    }))
  }, [activeBookId, readerHighlights, readerNotes, currentPage])

  // ─── Highlight ───────────────────────────────────────────────────────
  const addHighlight = useCallback((text: string, color: 'yellow' | 'green' | 'blue' | 'pink') => {
    const id = `hl-${Date.now()}`
    const paraIdx = currentPage
    setReaderHighlights((prev) => {
      const existing = prev.find((h) => h.text === text && h.paragraphIdx === paraIdx)
      if (existing) return prev.map((h) => h.id === existing.id ? { ...h, color } : h)
      return [...prev, { id, text, color, bookId: activeBookId || '', paragraphIdx: paraIdx, createdAt: new Date().toISOString() }]
    })
    setSelection((s) => ({ ...s, visible: false }))
  }, [activeBookId, currentPage])

  const removeHighlight = useCallback((id: string) => {
    setReaderHighlights((prev) => prev.filter((h) => h.id !== id))
  }, [])

  // ─── Notes ───────────────────────────────────────────────────────────
  const addNote = useCallback((noteText: string) => {
    if (!activeBookId || !noteTarget) return
    setReaderNotes((prev) => [...prev, { id: `n-${Date.now()}`, text: noteText, bookId: activeBookId, paragraphIdx: currentPage, createdAt: new Date().toISOString() }])
    setNoteTarget(null)
  }, [activeBookId, currentPage, noteTarget])

  // Exit reader and persist
  const exitReader = useCallback(() => {
    flushToBooks()
    setActiveView('shelf')
  }, [flushToBooks])

  // Navigation
  const openReader = useCallback((bookId: string) => {
    setActiveBookId(bookId)
    setActiveView('reader')
    setCurrentPage(0)
    setReadingTime(0)
  }, [])

  const nextPage = () => { if (currentPage < maxPages - 1) setCurrentPage((p) => p + 1) }
  const prevPage = () => { if (currentPage > 0) setCurrentPage((p) => p - 1) }

  // Compute page-level data from reader-scoped state
  const pageHighlights = readerHighlights.filter((h) => h.paragraphIdx === currentPage)
  const pageNotes = readerNotes.filter((n) => n.paragraphIdx === currentPage)

  // ─── SHELF VIEW ─────────────────────────────────────────────────────
  if (activeView === 'shelf') {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">📚 图书馆</h1>
            <p className="text-sm text-text-muted mt-1">导入文档 · 划线笔记 · 单词收藏</p>
          </div>
          <div className="flex items-center gap-2">
            <input ref={fileInputRef} type="file" accept=".txt,.md,.epub" className="hidden" onChange={handleImport} />
            <Button variant="primary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              导入文档
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setActiveView('notes')}>📝 笔记 ({books.reduce((s, b) => s + b.notes.length, 0)})</Button>
          </div>
        </div>

        {/* Import tip */}
        <Card className="bg-info/5 border-info/20 p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div className="text-xs text-text-secondary leading-relaxed">
              <p className="font-semibold text-text-primary mb-1">支持格式</p>
              <p><strong>.txt</strong> — 纯文本文件，每行为一段</p>
              <p><strong>.md</strong> — Markdown 文件，保留标题格式</p>
              <p><strong>.epub</strong> — 电子书标准格式</p>
            </div>
          </div>
        </Card>

        {/* Book Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => openReader(book.id)}
              className="rounded-[16px] border border-border-subtle bg-bg-card overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(110,197,110,0.12)] hover:border-accent-green/40 group"
            >
              {/* Cover area */}
              <div className="h-32 bg-gradient-to-br from-bg-elevated to-accent-green/10 flex items-center justify-center relative">
                <span className="text-5xl">{book.cover}</span>
                <Badge variant="default" size="sm" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-bg-card">{book.format.toUpperCase()}</Badge>
              </div>
              {/* Info */}
              <div className="p-3">
                <h3 className="text-xs font-bold text-text-primary line-clamp-1 mb-0.5">{book.title}</h3>
                <p className="text-[10px] text-text-muted mb-2">{book.author}</p>
                {/* Progress bar */}
                <div className="h-1 rounded-full bg-border-subtle overflow-hidden mb-1">
                  <div className="h-full rounded-full bg-accent-green transition-all" style={{ width: `${book.progress}%` }} />
                </div>
                <div className="flex items-center justify-between text-[9px] text-text-muted">
                  <span>{book.pages} 段</span>
                  <span>{book.progress}%</span>
                </div>
                {/* Highlights & notes */}
                {(book.highlights.length > 0 || book.notes.length > 0) && (
                  <div className="flex items-center gap-2 mt-1.5 text-[9px] text-text-muted">
                    {book.highlights.length > 0 && <span>🖍 {book.highlights.length}</span>}
                    {book.notes.length > 0 && <span>📝 {book.notes.length}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── NOTES VIEW ─────────────────────────────────────────────────────
  if (activeView === 'notes') {
    const allNotes = books.flatMap((b) => b.notes.map((n) => ({ ...n, book: b.title })))
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">📝 所有笔记</h1>
          <Button variant="ghost" size="sm" onClick={() => setActiveView('shelf')}>← 返回书架</Button>
        </div>
        {allNotes.length === 0 ? (
          <Card className="text-center py-10">
            <span className="text-4xl mb-3 block">📝</span>
            <p className="text-sm text-text-muted">阅读时选中文字，点击"笔记"按钮添加</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {allNotes.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((n) => (
              <Card key={n.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-[8px] bg-accent-gold/15 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">📝</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{n.text}</p>
                    <p className="text-[10px] text-text-muted mt-2">
                      《{n.book}》 · {n.createdAt.slice(0, 10)}
                    </p>
                  </div>
                  <button
                    onClick={() => { setActiveBookId(n.bookId); setCurrentPage(n.paragraphIdx); setActiveView('reader') }}
                    className="text-xs text-accent-green hover:underline flex-shrink-0"
                  >
                    查看
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── READER VIEW ────────────────────────────────────────────────────
  if (!activeBook) return null

  return (
    <div className="max-w-6xl mx-auto" onMouseUp={handleTextSelect}>
      {/* Reader Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={exitReader} className="flex items-center gap-1 text-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            书架
          </button>
          <span className="text-sm font-semibold text-text-primary">{activeBook.title}</span>
          <Badge variant="default" size="sm">{activeBook.format.toUpperCase()}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVocabSidebarOpen(!vocabSidebarOpen)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all duration-200 cursor-pointer', vocabSidebarOpen ? 'bg-accent-gold/15 text-accent-gold' : 'bg-bg-elevated text-text-muted hover:text-text-secondary')}
          >
            📚 {vocabList.length}
          </button>
          <span className="text-accent-gold font-mono text-xs">⏱ {formatTime(readingTime)}</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-3 text-xs text-text-muted">
        <button onClick={prevPage} disabled={currentPage === 0} className={cn('px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer', currentPage === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-bg-elevated')}>
          ← 上一段
        </button>
        <span className="font-semibold text-text-primary">{currentPage + 1} / {maxPages}</span>
        <button onClick={nextPage} disabled={currentPage >= maxPages - 1} className={cn('px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer', currentPage >= maxPages - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-bg-elevated')}>
          下一段 →
        </button>
        <div className="flex-1" />
        <span>{pageHighlights.length} 划线 · {pageNotes.length} 笔记</span>
      </div>

      <div className={cn('grid gap-6', vocabSidebarOpen ? 'grid-cols-3' : 'grid-cols-1')}>
        {/* Reading Content */}
        <div className={vocabSidebarOpen ? 'col-span-2' : 'col-span-1'}>
          <Card className="p-6 min-h-[300px]">
            <div className="space-y-4">
              {contentLines.slice(currentPage, currentPage + 3).map((line, idx) => {
                const paraIdx = currentPage + idx
                const hl = readerHighlights.filter((h) => h.paragraphIdx === paraIdx)
                const note = readerNotes.find((n) => n.paragraphIdx === paraIdx)
                const isMDTitle = line.startsWith('#')

                return (
                  <div key={paraIdx} className="group relative">
                    {/* Highlighted text rendering */}
                    {hl.length > 0 ? (
                      <div
                        className={cn('text-sm leading-relaxed rounded px-0.5 py-0.5', isMDTitle && 'text-lg font-bold')}
                        style={{ backgroundColor: HIGHLIGHT_COLOR_MAP[hl[0].color] || 'transparent' }}
                      >
                        {line}
                      </div>
                    ) : (
                      <p className={cn('text-sm leading-relaxed text-text-primary', isMDTitle && 'text-lg font-bold')}>{line}</p>
                    )}

                    {/* Note indicator */}
                    {note && (
                      <div className="mt-1 pl-3 border-l-2 border-accent-gold">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] text-accent-gold font-semibold">📝 笔记</span>
                        </div>
                        <p className="text-xs text-text-secondary">{note.text}</p>
                      </div>
                    )}

                    {/* Hover actions */}
                    <div className="absolute -right-1 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                      <button
                        onClick={() => addHighlight(line, 'yellow')}
                        className="w-6 h-6 rounded-full bg-yellow-200/30 hover:bg-yellow-200/60 flex items-center justify-center cursor-pointer"
                        title="划线"
                      >
                        <div className="w-3 h-0.5 rounded bg-yellow-400" />
                      </button>
                      <button
                        onClick={() => setNoteTarget(line)}
                        className="w-6 h-6 rounded-full bg-bg-elevated hover:bg-border-subtle flex items-center justify-center cursor-pointer"
                        title="添加笔记"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Page highlights summary */}
          {pageHighlights.length > 0 && (
            <Card className="p-4 mt-4">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-[0.7px] mb-2">本页划线</h4>
              <div className="space-y-2">
                {pageHighlights.map((h) => (
                  <div key={h.id} className="flex items-start gap-2 text-xs">
                    <div className="w-3 h-3 rounded mt-0.5 flex-shrink-0" style={{ backgroundColor: HIGHLIGHT_COLOR_MAP[h.color] || '#fbbf24' }} />
                    <span className="text-text-secondary">{h.text}</span>
                    <button
                      onClick={() => removeHighlight(h.id)}
                      className="text-text-muted hover:text-danger cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Vocab Sidebar */}
        {vocabSidebarOpen && (
          <div className="col-span-1 space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-[0.7px]">📚 单词本</h3>
                <span className="text-xs text-text-muted">{vocabList.length} 词</span>
              </div>
              {vocabList.length === 0 ? (
                <div className="text-center py-6">
                  <span className="text-3xl mb-2 block">🔖</span>
                  <p className="text-xs text-text-muted">选中单词收藏</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {vocabList.map((w) => (
                    <div key={w.id} className="rounded-[10px] border border-accent-gold/25 bg-accent-gold/5 overflow-hidden">
                      <div className="flex items-center gap-2 p-2.5">
                        <div className="w-6 h-6 rounded-[6px] bg-accent-gold/15 flex items-center justify-center text-xs flex-shrink-0">{w.word[0].toUpperCase()}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">{w.word}</p>
                          <p className="text-[9px] text-text-muted truncate">{w.meaning.split('；')[0]}</p>
                        </div>
                        <button onClick={() => setVocabList((prev) => prev.filter((v) => v.id !== w.id))} className="text-text-muted hover:text-danger cursor-pointer">
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
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
          onHighlight={addHighlight}
          onNote={(text) => { setNoteTarget(text); setSelection((s) => ({ ...s, visible: false })) }}
          onClose={() => setSelection((s) => ({ ...s, visible: false }))}
        />
      )}

      {/* Translate popover */}
      {translateText && (
        <TranslationPopover
          text={translateText}
          onClose={() => setTranslateText(null)}
          onAddToVocab={(text) => { addToVocab(text); setTranslateText(null) }}
        />
      )}

      {/* Note modal */}
      {noteTarget && (
        <NoteModal
          text={noteTarget}
          onSave={(text) => addNote(text)}
          onClose={() => setNoteTarget(null)}
        />
      )}
    </div>
  )
}
