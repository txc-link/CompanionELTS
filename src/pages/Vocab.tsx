import { useState, useMemo, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// ─── Types ───────────────────────────────────────────────────────────────
type MasteryLevel = 'new' | 'learning' | 'review' | 'mastered'
type StudyMode = 'browse' | 'flashcard' | 'quiz'

interface Word {
  id: string
  word: string
  phonetic: string
  pos: string
  meaning: string
  example: string
  translation: string
  mastery: number // 0-1
  level: MasteryLevel
  lastReview: string
  nextReview: string
  easeFactor: number
  wrongCount: number
}

// ─── Mock Data ───────────────────────────────────────────────────────────
const INITIAL_WORDS: Word[] = [
  { id: 'w1', word: 'ubiquitous', phonetic: '/juːˈbɪkwɪtəs/', pos: 'adj.', meaning: '无处不在的，普遍存在的', example: 'Smartphones have become ubiquitous in modern society.', translation: '智能手机在现代社会中已变得无处不在。', mastery: 0.9, level: 'mastered', lastReview: '2026-05-18', nextReview: '2026-05-28', easeFactor: 2.8, wrongCount: 0 },
  { id: 'w2', word: 'mitigate', phonetic: '/ˈmɪtɪɡeɪt/', pos: 'v.', meaning: '减轻，缓和，使降低', example: 'Planting trees can help mitigate the effects of climate change.', translation: '植树可以帮助减轻气候变化的影响。', mastery: 0.7, level: 'review', lastReview: '2026-05-19', nextReview: '2026-05-22', easeFactor: 2.5, wrongCount: 1 },
  { id: 'w3', word: 'disparity', phonetic: '/dɪˈspærəti/', pos: 'n.', meaning: '差异，不一致，差距', example: 'There is a growing disparity between the rich and the poor.', translation: '富人与穷人之间的差距越来越大。', mastery: 0.4, level: 'learning', lastReview: '2026-05-15', nextReview: '2026-05-21', easeFactor: 2.3, wrongCount: 3 },
  { id: 'w4', word: 'scrutinize', phonetic: '/ˈskruːtənaɪz/', pos: 'v.', meaning: '仔细检查，细致审查', example: 'The data was scrutinized for errors before publication.', translation: '数据在发表前经过仔细检查以确保无误。', mastery: 0.15, level: 'new', lastReview: '从未复习', nextReview: '立即复习', easeFactor: 2.1, wrongCount: 5 },
  { id: 'w5', word: 'proliferation', phonetic: '/prəˌlɪfəˈreɪʃn/', pos: 'n.', meaning: '扩散，增殖，激增', example: 'The proliferation of social media has changed communication patterns.', translation: '社交媒体的普及改变了沟通模式。', mastery: 0.85, level: 'mastered', lastReview: '2026-05-20', nextReview: '2026-06-01', easeFactor: 3.0, wrongCount: 0 },
  { id: 'w6', word: 'ameliorate', phonetic: '/əˈmiːliəreɪt/', pos: 'v.', meaning: '改善，改进，使变好', example: 'New policies were introduced to ameliorate living conditions.', translation: '新政策被引入以改善生活条件。', mastery: 0.1, level: 'new', lastReview: '从未复习', nextReview: '立即复习', easeFactor: 2.0, wrongCount: 4 },
  { id: 'w7', word: 'ubiquitous', phonetic: '/juːˈbɪkwɪtəs/', pos: 'adj.', meaning: '普遍存在的，无处不在的', example: 'Coffee shops have become ubiquitous in urban areas.', translation: '咖啡店在城区已变得无处不在。', mastery: 0.6, level: 'review', lastReview: '2026-05-17', nextReview: '2026-05-23', easeFactor: 2.4, wrongCount: 2 },
  { id: 'w8', word: 'phenomenon', phonetic: '/fɪˈnɒmɪnən/', pos: 'n.', meaning: '现象，杰出的人/事', example: 'The phenomenon of climate change affects everyone on Earth.', translation: '气候变化这一现象影响着地球上的每一个人。', mastery: 0.75, level: 'review', lastReview: '2026-05-16', nextReview: '2026-05-24', easeFactor: 2.6, wrongCount: 1 },
  { id: 'w9', word: 'substantiate', phonetic: '/səbˈstænʃieɪt/', pos: 'v.', meaning: '证实，使具体化', example: 'The scientist could not substantiate her claims without more data.', translation: '没有更多数据，这位科学家无法证实她的主张。', mastery: 0.2, level: 'new', lastReview: '从未复习', nextReview: '立即复习', easeFactor: 2.0, wrongCount: 6 },
  { id: 'w10', word: 'comprehensive', phonetic: '/ˌkɒmprɪˈhensɪv/', pos: 'adj.', meaning: '全面的，综合的，详尽的', example: 'The report provides a comprehensive analysis of market trends.', translation: '该报告对市场趋势提供了全面的分析。', mastery: 0.55, level: 'learning', lastReview: '2026-05-14', nextReview: '2026-05-22', easeFactor: 2.4, wrongCount: 2 },
  { id: 'w11', word: 'articulate', phonetic: '/ɑːˈtɪkjuleɪt/', pos: 'v.', meaning: '清晰地表达，发音', example: 'She was able to articulate her vision clearly to the team.', translation: '她能够清晰地团队表达她的愿景。', mastery: 0.8, level: 'mastered', lastReview: '2026-05-19', nextReview: '2026-06-02', easeFactor: 2.9, wrongCount: 0 },
  { id: 'w12', word: 'empirical', phonetic: '/ɪmˈpɪrɪkl/', pos: 'adj.', meaning: '以经验为依据的，实证的', example: 'The study is based on empirical research conducted over five years.', translation: '该研究基于五年间进行的实证研究。', mastery: 0.35, level: 'learning', lastReview: '2026-05-13', nextReview: '2026-05-21', easeFactor: 2.2, wrongCount: 4 },
]

// ─── Level Config ──────────────────────────────────────────────────────────
const LEVEL_CONFIG: Record<MasteryLevel, { label: string; color: string; bg: string; dot: string }> = {
  new: { label: '新词', color: 'text-danger', bg: 'bg-danger/15', dot: 'bg-danger' },
  learning: { label: '学习中', color: 'text-accent-gold', bg: 'bg-accent-gold/15', dot: 'bg-accent-gold' },
  review: { label: '待复习', color: 'text-info', bg: 'bg-info/15', dot: 'bg-info' },
  mastered: { label: '已掌握', color: 'text-accent-green', bg: 'bg-accent-green/15', dot: 'bg-accent-green' },
}

const POS_LABELS: Record<string, string> = {
  'adj.': '形容词', 'v.': '动词', 'n.': '名词', 'adv.': '副词',
}

// ─── Flashcard Component ─────────────────────────────────────────────────
function Flashcard({
  word,
  onRate,
}: {
  word: Word
  onRate: (id: string, rating: 'again' | 'hard' | 'good' | 'easy') => void
}) {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className={cn(
          'relative w-full min-h-[220px] rounded-[20px] border cursor-pointer transition-all duration-500',
          'shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]',
          'select-none',
          flipped
            ? 'bg-accent-green/10 border-accent-green/40'
            : 'bg-bg-card border-border-subtle'
        )}
        style={{ perspective: '1000px' }}
      >
        <div className={cn(
          'p-8 flex flex-col items-center justify-center min-h-[220px] transition-all duration-500',
          flipped ? 'opacity-0' : 'opacity-100'
        )}>
          <Badge variant="default" size="sm" className="mb-4">{POS_LABELS[word.pos] || word.pos}</Badge>
          <h2 className="text-3xl font-bold text-text-primary mb-2 text-center">{word.word}</h2>
          <p className="text-sm text-text-muted italic mb-4">{word.phonetic}</p>
          <div className={cn('text-sm font-semibold', LEVEL_CONFIG[word.level].color)}>
            {LEVEL_CONFIG[word.level].label}
          </div>
          <p className="text-xs text-text-muted mt-6">点击卡片查看中文释义</p>
        </div>

        <div className={cn(
          'absolute inset-0 p-8 flex flex-col items-center justify-center min-h-[220px] transition-all duration-500',
          flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          <h3 className="text-xl font-bold text-text-primary mb-3 text-center">{word.meaning}</h3>
          <div className="w-full border-t border-border-subtle my-3" />
          <p className="text-sm text-text-secondary italic text-center leading-relaxed mb-2">
            "{word.example}"
          </p>
          <p className="text-xs text-text-muted text-center">{word.translation}</p>
          <p className="text-xs text-text-muted mt-4">点击卡片返回</p>
        </div>
      </div>

      {/* Rating Buttons */}
      {flipped && (
        <div className="flex gap-3 w-full max-w-md">
          {([
            { key: 'again' as const, label: '不认识', color: 'bg-danger/20 text-danger border-danger/30', icon: '🔴', desc: '稍后再复习' },
            { key: 'hard' as const, label: '模糊', color: 'bg-accent-gold/20 text-accent-gold border-accent-gold/30', icon: '🟡', desc: '降低间隔' },
            { key: 'good' as const, label: '认识', color: 'bg-accent-green/20 text-accent-green border-accent-green/30', icon: '🟢', desc: '正常复习' },
            { key: 'easy' as const, label: '太简单', color: 'bg-info/20 text-info border-info/30', icon: '🔵', desc: '延长间隔' },
          ] as const).map((btn) => (
            <button
              key={btn.key}
              onClick={() => { onRate(word.id, btn.key); setFlipped(false) }}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-3 rounded-[12px] border transition-all duration-200 cursor-pointer',
                'hover:brightness-110 active:scale-95',
                btn.color
              )}
            >
              <span className="text-lg">{btn.icon}</span>
              <span className="text-xs font-semibold">{btn.label}</span>
              <span className="text-[9px] opacity-70">{btn.desc}</span>
            </button>
          ))}
        </div>
      )}

      {!flipped && (
        <p className="text-xs text-text-muted text-center">点击卡片查看答案 · 根据记忆情况选择下方按钮</p>
      )}
    </div>
  )
}

// ─── Browse Word Card ────────────────────────────────────────────────────
function BrowseWordCard({
  word,
  onLevelChange,
}: {
  word: Word
  onLevelChange: (id: string, level: MasteryLevel) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const lc = LEVEL_CONFIG[word.level]

  return (
    <div
      className={cn(
        'rounded-[14px] border transition-all duration-300 overflow-hidden',
        expanded ? `${lc.bg} border-accent-green/30` : 'border-border-subtle bg-bg-card hover:border-border-accent'
      )}
    >
      {/* Main row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 p-4 cursor-pointer"
      >
        {/* Level dot */}
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', lc.dot)} />

        {/* Word info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-text-primary">{word.word}</span>
            <span className="text-xs text-text-muted italic">{word.phonetic}</span>
            <Badge variant="default" size="sm">{word.pos}</Badge>
          </div>
          <p className="text-xs text-text-secondary mt-0.5 truncate">{word.meaning}</p>
        </div>

        {/* Mastery bar */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <div className="w-16 h-1.5 rounded-full bg-border-subtle overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', lc.dot)}
              style={{ width: `${word.mastery * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-text-muted">{Math.round(word.mastery * 100)}%</span>
        </div>

        {/* Expand icon */}
        <svg
          className={cn('w-4 h-4 text-text-muted flex-shrink-0 transition-transform duration-200', expanded && 'rotate-180')}
          viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border-subtle pt-4">
          {/* Example */}
          <div>
            <p className="text-[10px] text-text-muted mb-1 font-semibold">例句</p>
            <p className="text-sm text-text-primary italic leading-relaxed">"{word.example}"</p>
            <p className="text-xs text-text-muted mt-1">{word.translation}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-[10px] text-text-muted">
            <span>上次复习：{word.lastReview}</span>
            <span>下次复习：{word.nextReview}</span>
            <span>错误次数：{word.wrongCount}</span>
          </div>

          {/* Level selector */}
          <div>
            <p className="text-[10px] text-text-muted mb-2 font-semibold">调整掌握程度</p>
            <div className="flex gap-2">
              {(Object.entries(LEVEL_CONFIG) as [MasteryLevel, typeof LEVEL_CONFIG[MasteryLevel]][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={(e) => { e.stopPropagation(); onLevelChange(word.id, key) }}
                  className={cn(
                    'px-3 py-1.5 rounded-[8px] text-xs font-medium border transition-all duration-200 cursor-pointer',
                    word.level === key
                      ? `${cfg.bg} ${cfg.color} border-current`
                      : 'bg-bg-elevated text-text-muted border-border-subtle hover:border-border-accent'
                  )}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Quiz Question ───────────────────────────────────────────────────────
function QuizQuestion({
  word,
  onAnswer,
  questionIndex,
  total,
}: {
  word: Word
  onAnswer: (id: string, correct: boolean) => void
  questionIndex: number
  total: number
}) {
  const options = useMemo(() => {
    const correct = word.meaning
    const pool = INITIAL_WORDS.filter((w) => w.id !== word.id && w.meaning !== correct)
    const wrong = pool.sort(() => Math.random() - 0.5).slice(0, 3).map((w) => w.meaning)
    const all = [...wrong, correct].sort(() => Math.random() - 0.5)
    return all
  }, [word])

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-border-subtle overflow-hidden">
          <div
            className="h-full bg-accent-green rounded-full transition-all duration-500"
            style={{ width: `${((questionIndex) / total) * 100}%` }}
          />
        </div>
        <span className="text-xs text-text-muted">{questionIndex}/{total}</span>
      </div>

      {/* Question */}
      <Card>
        <div className="text-center py-4">
          <Badge variant="default" size="sm" className="mb-3">{word.pos}</Badge>
          <h2 className="text-3xl font-bold text-text-primary mb-1">{word.word}</h2>
          <p className="text-sm text-text-muted italic">{word.phonetic}</p>
        </div>
        <p className="text-sm text-text-muted text-center mb-4">选择正确的中文释义</p>

        <div className="space-y-2">
          {options.map((opt, i) => (
            <button
              key={i}
              onClick={() => onAnswer(word.id, opt === word.meaning)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-[10px] border text-sm transition-all duration-200 cursor-pointer',
                'hover:bg-bg-elevated hover:border-accent-green/50'
              )}
            >
              <span className="text-text-secondary">{opt}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function Vocab() {
  const [words, setWords] = useState<Word[]>(INITIAL_WORDS)
  const [mode, setMode] = useState<StudyMode>('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<MasteryLevel | 'all'>('all')
  const [flashcardIndex, setFlashcardIndex] = useState(0)
  const [quizIndex, setQuizIndex] = useState(0)
  const [quizDone, setQuizDone] = useState(false)
  const [quizCorrect, setQuizCorrect] = useState(0)

  // Filter words for browse mode
  const filtered = useMemo(() => {
    return words.filter((w) => {
      const matchLevel = levelFilter === 'all' || w.level === levelFilter
      const matchSearch =
        !searchQuery ||
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.meaning.includes(searchQuery)
      return matchLevel && matchSearch
    })
  }, [words, levelFilter, searchQuery])

  // Filter for flashcard (prioritize new and learning)
  const flashcardWords = useMemo(() => {
    const priority = words.filter((w) => w.level === 'new' || w.level === 'learning')
    const others = words.filter((w) => w.level !== 'new' && w.level !== 'learning')
    return [...priority, ...others]
  }, [words])

  // Stats
  const stats = useMemo(() => {
    const total = words.length
    const mastered = words.filter((w) => w.level === 'mastered').length
    const dueCount = words.filter((w) => w.level === 'new' || w.level === 'learning').length
    const avgMastery = words.reduce((s, w) => s + w.mastery, 0) / total
    return { total, mastered, dueCount, avgMastery, pct: Math.round((mastered / total) * 100) }
  }, [words])

  // Handlers
  const handleRate = useCallback((id: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    setWords((prev) => prev.map((w) => {
      if (w.id !== id) return w
      const masteryDelta = rating === 'again' ? -0.2 : rating === 'hard' ? 0.05 : rating === 'good' ? 0.15 : 0.2
      const newMastery = Math.max(0, Math.min(1, w.mastery + masteryDelta))
      const newLevel: MasteryLevel =
        newMastery >= 0.8 ? 'mastered' :
        newMastery >= 0.5 ? 'review' :
        newMastery >= 0.2 ? 'learning' : 'new'
      return { ...w, mastery: newMastery, level: newLevel }
    }))
    setFlashcardIndex((i) => Math.min(i + 1, flashcardWords.length - 1))
  }, [flashcardWords.length])

  const handleLevelChange = useCallback((id: string, level: MasteryLevel) => {
    setWords((prev) => prev.map((w) => {
      if (w.id !== id) return w
      const masteryMap: Record<MasteryLevel, number> = { new: 0.1, learning: 0.35, review: 0.6, mastered: 0.9 }
      return { ...w, level, mastery: masteryMap[level] }
    }))
  }, [])

  const handleQuizAnswer = useCallback((id: string, correct: boolean) => {
    if (correct) setQuizCorrect((c) => c + 1)
    if (quizIndex + 1 >= Math.min(5, filtered.length)) {
      setQuizDone(true)
    } else {
      setQuizIndex((i) => i + 1)
    }
  }, [quizIndex, filtered.length])

  const restartQuiz = () => {
    setQuizIndex(0)
    setQuizDone(false)
    setQuizCorrect(0)
  }

  const restartFlashcard = () => {
    setFlashcardIndex(0)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">📚 词汇学习</h1>
          <p className="text-sm text-text-muted mt-1">
            专注记忆 · 间隔重复 · 智能复习
          </p>
        </div>
        {/* Mode Tabs */}
        <div className="flex rounded-[10px] bg-bg-elevated p-1 gap-1">
          {([
            { key: 'browse' as StudyMode, label: '浏览', icon: '📖' },
            { key: 'flashcard' as StudyMode, label: '闪卡', icon: '🃏' },
            { key: 'quiz' as StudyMode, label: '测验', icon: '✏️' },
          ] as const).map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all duration-200 cursor-pointer',
                mode === m.key
                  ? 'bg-accent-green text-bg-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <span>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '词汇总量', value: stats.total, unit: '词', color: 'text-text-primary' },
          { label: '已掌握', value: stats.mastered, unit: '词', color: 'text-accent-green' },
          { label: '今日待学', value: stats.dueCount, unit: '词', color: 'text-accent-gold' },
          { label: '掌握率', value: `${stats.pct}%`, unit: '', color: 'text-info' },
        ].map((s) => (
          <Card key={s.label} variant="stats">
            <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* ─── BROWSE MODE ─── */}
      {mode === 'browse' && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索单词或中文释义…"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <button
                onClick={() => setLevelFilter('all')}
                className={cn(
                  'px-3 py-2 rounded-[8px] text-xs font-medium transition-all duration-200 cursor-pointer',
                  levelFilter === 'all'
                    ? 'bg-accent-green text-bg-primary'
                    : 'text-text-secondary border border-border-subtle hover:border-accent-green/50'
                )}
              >
                全部 {words.length}
              </button>
              {(Object.entries(LEVEL_CONFIG) as [MasteryLevel, typeof LEVEL_CONFIG[MasteryLevel]][]).map(([key, cfg]) => {
                const count = words.filter((w) => w.level === key).length
                return (
                  <button
                    key={key}
                    onClick={() => setLevelFilter(key)}
                    className={cn(
                      'px-3 py-2 rounded-[8px] text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5',
                      levelFilter === key
                        ? `${cfg.bg} ${cfg.color} border-current border`
                        : 'text-text-secondary border border-border-subtle hover:border-border-accent'
                    )}
                  >
                    <div className={cn('w-1.5 h-1.5 rounded-full', cfg.dot)} />
                    {cfg.label} {count}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Word List */}
          <div className="space-y-2">
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl mb-3 block">🔍</span>
                <p className="text-sm text-text-muted">没有找到匹配的单词</p>
              </div>
            )}
            {filtered.map((word) => (
              <BrowseWordCard key={word.id} word={word} onLevelChange={handleLevelChange} />
            ))}
          </div>
        </>
      )}

      {/* ─── FLASHCARD MODE ─── */}
      {mode === 'flashcard' && (
        <>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-border-subtle overflow-hidden">
              <div
                className="h-full bg-accent-green rounded-full transition-all duration-500"
                style={{ width: `${((flashcardIndex) / flashcardWords.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-text-muted whitespace-nowrap">
              {flashcardIndex + 1} / {flashcardWords.length}
            </span>
            <Button variant="ghost" size="sm" onClick={restartFlashcard}>
              🔄 重置
            </Button>
          </div>

          {/* Level tabs */}
          <div className="flex gap-2 flex-wrap">
            {([
              { label: '新词优先', key: 'new' as MasteryLevel },
              { label: '学习中', key: 'learning' as MasteryLevel },
              { label: '待复习', key: 'review' as MasteryLevel },
              { label: '已掌握', key: 'mastered' as MasteryLevel },
            ] as const).map((tab) => {
              const count = flashcardWords.filter((w) => w.level === tab.key).length
              return (
                <div key={tab.key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-bg-elevated text-xs">
                  <div className={cn('w-1.5 h-1.5 rounded-full', LEVEL_CONFIG[tab.key].dot)} />
                  <span className="text-text-muted">{tab.label}</span>
                  <Badge variant="default" size="sm">{count}</Badge>
                </div>
              )
            })}
          </div>

          {/* Flashcard */}
          {flashcardIndex < flashcardWords.length ? (
            <Flashcard
              word={flashcardWords[flashcardIndex]}
              onRate={handleRate}
            />
          ) : (
            <Card className="text-center py-10">
              <span className="text-5xl mb-4 block">🎉</span>
              <h3 className="text-xl font-bold text-text-primary mb-2">本轮学习完成！</h3>
              <p className="text-sm text-text-muted mb-6">太棒了，已复习完所有词汇</p>
              <Button variant="primary" onClick={restartFlashcard}>再学一轮</Button>
            </Card>
          )}
        </>
      )}

      {/* ─── QUIZ MODE ─── */}
      {mode === 'quiz' && (
        <>
          {!quizDone ? (
            <>
              {/* Level filter for quiz */}
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs text-text-muted py-1.5">出题范围：</span>
                <button
                  onClick={() => { setLevelFilter('all'); restartQuiz() }}
                  className={cn(
                    'px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all duration-200 cursor-pointer',
                    levelFilter === 'all'
                      ? 'bg-accent-green text-bg-primary'
                      : 'text-text-secondary border border-border-subtle'
                  )}
                >
                  全部
                </button>
                {(Object.keys(LEVEL_CONFIG) as MasteryLevel[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setLevelFilter(key); restartQuiz() }}
                    className={cn(
                      'px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5',
                      levelFilter === key
                        ? `${LEVEL_CONFIG[key].bg} ${LEVEL_CONFIG[key].color} border-current border`
                        : 'text-text-secondary border border-border-subtle'
                    )}
                  >
                    <div className={cn('w-1.5 h-1.5 rounded-full', LEVEL_CONFIG[key].dot)} />
                    {LEVEL_CONFIG[key].label}
                  </button>
                ))}
              </div>

              <QuizQuestion
                key={`quiz-${quizIndex}`}
                word={filtered[quizIndex]}
                onAnswer={handleQuizAnswer}
                questionIndex={quizIndex + 1}
                total={Math.min(5, filtered.length)}
              />
            </>
          ) : (
            <Card className="text-center py-10 max-w-md mx-auto">
              <span className="text-5xl mb-4 block">🏆</span>
              <h3 className="text-xl font-bold text-text-primary mb-2">测验完成！</h3>
              <div className="my-6">
                <p className="text-5xl font-bold text-accent-green mb-1">
                  {quizCorrect}/{Math.min(5, filtered.length)}
                </p>
                <p className="text-sm text-text-muted">
                  正确率 {Math.round((quizCorrect / Math.min(5, filtered.length)) * 100)}%
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" onClick={restartQuiz}>再来一轮</Button>
                <Button variant="primary" onClick={() => setMode('browse')}>去复习单词</Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
