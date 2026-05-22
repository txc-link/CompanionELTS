import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useVocabTaskStore } from '@/store'
import type { SimpleRating } from '@/lib/dictionary'
import { IELTS_LEXICON, getChapterList, type LexiconWord } from '@/data/ieltsLexicon'
import { speakWord, speakSentence } from '@/lib/speech'

// ─── Types ───────────────────────────────────────────────────────────────
type ViewMode = 'chapters' | 'chapter' | 'flashcard' | 'practice'
type StudyMode = 'browse' | 'flashcard' | 'practice'

// SRS 状态 → UI 标签映射
const SRS_STATE_CONFIG = {
  new: { label: '新词', color: 'text-danger', bg: 'bg-danger/15', dot: 'bg-danger' },
  learning: { label: '学习中', color: 'text-accent-gold', bg: 'bg-accent-gold/15', dot: 'bg-accent-gold' },
  review: { label: '待复习', color: 'text-info', bg: 'bg-info/15', dot: 'bg-info' },
  relearning: { label: '重学', color: 'text-danger', bg: 'bg-danger/15', dot: 'bg-danger' },
} as const

type SRSState = keyof typeof SRS_STATE_CONFIG

// 词性标签
const POS_LABELS: Record<string, string> = {
  'adj.': '形', 'v.': '动', 'n.': '名', 'adv.': '副',
  'n./v.': '名/动', 'adj./n.': '形/名', 'v./n.': '动/名',
  'adj./v.': '形/动', 'n./adj.': '名/形', 'adv./n.': '副/名',
}

// ─── Flatten lexicon to all words ────────────────────────────────────────
function flattenChapter(chapterId: string): Array<{ word: LexiconWord; chapterId: string; groupIndex: number }> {
  const chapter = IELTS_LEXICON[chapterId]
  if (!chapter) return []
  const result: Array<{ word: LexiconWord; chapterId: string; groupIndex: number }> = []
  chapter.groups.forEach((group, gi) => {
    group.forEach((word) => {
      result.push({ word, chapterId, groupIndex: gi })
    })
  })
  return result
}

export function flattenAllWords() {
  const result: Array<{ word: LexiconWord; chapterId: string; groupIndex: number }> = []
  Object.keys(IELTS_LEXICON).forEach((cid) => {
    result.push(...flattenChapter(cid))
  })
  return result
}

// ─── Flashcard Component ─────────────────────────────────────────────────
function FlashcardCard({
  word,
  chapterId,
  onRate,
  onNext,
  index,
  total,
}: {
  word: LexiconWord
  chapterId: string
  onRate: (r: SimpleRating) => void
  onNext: () => void
  index: number
  total: number
}) {
  const [flipped, setFlipped] = useState(false)
  const [showHint, setShowHint] = useState(false)

  useEffect(() => { setFlipped(false); setShowHint(false) }, [word])

  const chapter = IELTS_LEXICON[chapterId]

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-1.5 rounded-full bg-border-subtle overflow-hidden">
          <div className="h-full bg-accent-green rounded-full transition-all duration-500" style={{ width: `${(index / total) * 100}%` }} />
        </div>
        <span className="text-xs text-text-muted whitespace-nowrap">{index + 1}/{total}</span>
      </div>

      {/* 🔊 发音按钮（Web Speech API，无需下载音频） */}
      <div className="flex gap-2">
        <button
          onClick={() => speakWord(word.word[0])}
          className="text-xs text-accent-green hover:text-accent-green/80 flex items-center gap-1 cursor-pointer transition-colors"
        >
          🔊 发音
        </button>
        {word.example && word.example !== '-' && (
          <button
            onClick={() => speakSentence(word.example)}
            className="text-xs text-text-muted hover:text-info flex items-center gap-1 cursor-pointer transition-colors"
          >
            📝 例句
          </button>
        )}
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped(!flipped)}
        className={cn(
          'relative w-full min-h-[220px] rounded-[20px] border cursor-pointer transition-all duration-500 select-none',
          'shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]',
          flipped ? 'bg-accent-green/10 border-accent-green/40' : 'bg-bg-card border-border-subtle'
        )}
      >
        {/* Front */}
        <div className={cn(
          'p-8 flex flex-col items-center justify-center min-h-[220px] transition-all duration-500',
          flipped ? 'opacity-0' : 'opacity-100'
        )}>
          <Badge variant="default" size="sm" className="mb-4">
            {POS_LABELS[word.pos] || word.pos}
          </Badge>
          <h2 className="text-3xl font-bold text-text-primary mb-3 text-center">{word.word[0]}</h2>
          {word.word.length > 1 && (
            <div className="flex gap-2 mb-3">
              {word.word.slice(1).map((w, i) => (
                <span key={i} className="text-sm text-text-muted">/ {w}</span>
              ))}
            </div>
          )}
          <p className="text-xs text-text-muted italic mt-2">点击卡片查看中文释义</p>
        </div>

        {/* Back */}
        <div className={cn(
          'absolute inset-0 p-8 flex flex-col items-center justify-center min-h-[220px] transition-all duration-500',
          flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          <h3 className="text-xl font-bold text-text-primary mb-3 text-center">{word.meaning}</h3>
          <div className="w-full border-t border-border-subtle my-3" />
          {word.example && word.example !== '-' && (
            <p className="text-sm text-text-secondary italic text-center leading-relaxed mb-2">"{word.example}"</p>
          )}
          {word.extra && word.extra !== '-' && (
            <p className="text-xs text-info mt-1 text-center">📝 {word.extra}</p>
          )}
          <p className="text-xs text-text-muted mt-4">点击卡片返回</p>
        </div>
      </div>

      {/* Rating Buttons */}
      {flipped ? (
        <div className="flex gap-3 w-full max-w-md">
          {([
            { key: 'again' as const, label: '不认识', color: 'bg-danger/20 text-danger border border-danger/30', icon: '🔴', desc: '1 天后再复习' },
            { key: 'hard' as const, label: '模糊', color: 'bg-accent-gold/20 text-accent-gold border border-accent-gold/30', icon: '🟡', desc: '间隔略短' },
            { key: 'good' as const, label: '认识', color: 'bg-accent-green/20 text-accent-green border border-accent-green/30', icon: '🟢', desc: '正常间隔' },
          ] as const).map((btn) => (
            <button
              key={btn.key}
              onClick={() => { onRate(btn.key); onNext() }}
              className={cn('flex-1 flex flex-col items-center gap-0.5 py-3 rounded-[12px] border transition-all duration-200 cursor-pointer hover:brightness-110 active:scale-95', btn.color)}
            >
              <span className="text-lg">{btn.icon}</span>
              <span className="text-xs font-semibold">{btn.label}</span>
              <span className="text-[9px] opacity-70">{btn.desc}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-text-muted text-center">点击卡片翻转，然后选择记忆程度</p>
      )}
    </div>
  )
}

// ─── Practice Mode (打字练习) ────────────────────────────────────────────
function PracticeMode({ chapterId }: { chapterId: string }) {
  const chapter = IELTS_LEXICON[chapterId]
  const [inputValues, setInputValues] = useState<Record<number, string>>({})
  const [showAnswer, setShowAnswer] = useState(false)
  const [showMeaning, setShowMeaning] = useState(false)
  const [showSource, setShowSource] = useState(false)

  if (!chapter) return null

  // Flatten all words with their position index
  const allWords: Array<{ word: LexiconWord; globalIndex: number; groupLabel: string }> = []
  let globalIdx = 0
  chapter.groups.forEach((group, gi) => {
    const label = `第 ${gi + 1} 组词群`
    group.forEach((w) => {
      allWords.push({ word: w, globalIndex: globalIdx++, groupLabel: label })
    })
  })

  const handleInputChange = (idx: number, value: string) => {
    setInputValues((prev) => ({ ...prev, [idx]: value }))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Enter') {
      // Focus next input
      const next = document.getElementById(`practice-input-${idx + 1}`)
      if (next) (next as HTMLInputElement).focus()
    }
  }

  const getInputClass = (word: LexiconWord, value: string): string => {
    if (!showAnswer) return 'ml-4 inline-block border border-gray-300 rounded-lg bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 focus:border-blue-500 dark:bg-gray-700 dark:text-white focus:ring-blue-500'
    const trimmed = value.trim().toLowerCase()
    const matched = word.word.some((w) => w.toLowerCase().trim() === trimmed)
    if (!value.trim()) return 'ml-4 inline-block border border-gray-300 rounded-lg bg-gray-50 p-2.5 text-sm dark:border-gray-600 dark:bg-gray-700'
    return matched
      ? 'ml-4 inline-block border border-green-500 rounded-lg bg-green-50 p-2.5 text-sm text-green-900 dark:bg-gray-700 dark:border-green-500 dark:text-green-400'
      : 'ml-4 inline-block border border-red-500 rounded-lg bg-red-50 p-2.5 text-sm text-red-900 dark:bg-gray-700 dark:border-red-500 dark:text-red-400'
  }

  const stats = useMemo(() => {
    let done = 0, correct = 0, error = 0
    allWords.forEach(({ word }, idx) => {
      const v = inputValues[idx] || ''
      if (v.trim()) {
        done++
        const trimmed = v.trim().toLowerCase()
        if (word.word.some((w) => w.toLowerCase().trim() === trimmed)) correct++
        else error++
      }
    })
    return `${done} 个已做，${correct} 个正确，${error} 个错误`
  }, [inputValues, allWords])

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <label className="inline-flex cursor-pointer items-center text-xs">
          <input type="checkbox" checked={showMeaning} onChange={(e) => setShowMeaning(e.target.checked)} className="mr-1" />
          <span>释义</span>
        </label>
        <label className="inline-flex cursor-pointer items-center text-xs">
          <input type="checkbox" checked={showSource} onChange={(e) => setShowSource(e.target.checked)} className="mr-1" />
          <span>原词</span>
        </label>
        <label className="inline-flex cursor-pointer items-center text-xs">
          <input type="checkbox" checked={showAnswer} onChange={(e) => setShowAnswer(e.target.checked)} className="mr-1" />
          <span>显示答案</span>
        </label>
      </div>

      {/* Chapter audio */}
      <audio controls className="mb-4">
        <source src={`/vocabulary/audio/${chapterId}.mp3`} type="audio/mpeg" />
      </audio>

      {/* Stats */}
      <p className="text-xs text-text-muted mb-3">{stats}</p>

      {/* Words table */}
      <div className="overflow-x-auto rounded-lg border border-border-subtle">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-2 text-left text-xs text-gray-500">#</th>
              <th className="p-2 text-left text-xs text-gray-500">词</th>
              <th className="p-2 text-left text-xs text-gray-500">词性</th>
              <th className="p-2 text-left text-xs text-gray-500">词义</th>
              <th className="p-2 text-left text-xs text-gray-500">例句</th>
              <th className="p-2 text-left text-xs text-gray-500">拓展</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800">
            {allWords.map(({ word, globalIndex, groupLabel }, displayIndex) => (
              <tr
                key={globalIndex}
                className={displayIndex % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : ''}
              >
                <td className="p-2 text-xs text-gray-500">{displayIndex + 1}</td>
                <td className="p-2">
                  {showSource ? (
                    <div className="flex items-center gap-1">
                      {word.word.map((w, wi) => (
                        <a
                          key={wi}
                          href={`https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${w}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs hover:underline text-text-primary font-semibold"
                        >
                          {w}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <input
                      id={`practice-input-${globalIndex}`}
                      type="text"
                      autoComplete="off"
                      value={inputValues[globalIndex] || ''}
                      onChange={(e) => handleInputChange(globalIndex, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, globalIndex)}
                      className={cn('w-24 text-sm', getInputClass(word, inputValues[globalIndex] || ''))}
                    />
                  )}
                </td>
                <td className="p-2 text-xs italic" style={{ fontFamily: 'Times' }}>{word.pos}</td>
                <td className="p-2 text-xs">{showMeaning ? word.meaning : ''}</td>
                <td className="p-2 text-xs text-text-muted">{word.example !== '-' ? word.example : ''}</td>
                <td className="p-2 text-xs text-text-muted">{word.extra !== '-' ? word.extra : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Copy errors button */}
      {showAnswer && (
        <div className="mt-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const errors = allWords
                .filter(({ word, globalIndex }) => {
                  const v = (inputValues[globalIndex] || '').trim().toLowerCase()
                  return v && !word.word.some((w) => w.toLowerCase().trim() === v)
                })
                .map(({ word }) => `${word.word[0]} ${word.pos} ${word.meaning}`)
              navigator.clipboard.writeText(errors.join('\n'))
            }}
          >
            📋 拷贝错词
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function Vocab() {
  const { vocabList: savedWords, addToStudyPlan } = useVocabTaskStore()
  const [view, setView] = useState<ViewMode>('chapters')
  const [activeChapterId, setActiveChapterId] = useState<string>('')
  const [studyMode, setStudyMode] = useState<StudyMode>('browse')
  const [searchQuery, setSearchQuery] = useState('')
  const [flashcardIndex, setFlashcardIndex] = useState(0)

  const chapterList = getChapterList()
  const totalLexiconWords = chapterList.reduce((sum, c) => sum + c.wordCount, 0)

  // ─── Flatten words for flashcard ─────────────────────────────────────
  const flashcardWords = useMemo(() => {
    const all = flattenAllWords()
    // Add user's saved words as custom items
    savedWords.forEach((w) => {
      all.push({
        word: { word: [w.word], pos: w.pos, meaning: w.meaning, example: w.example, extra: '' },
        chapterId: '__saved__',
        groupIndex: -1,
      })
    })
    // Shuffle
    return all.sort(() => Math.random() - 0.5)
  }, [savedWords])

  // ─── Search across all words ─────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return flattenAllWords().filter(({ word }) =>
      word.word.some((w) => w.toLowerCase().includes(q)) ||
      word.meaning.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [searchQuery])

  // ─── Navigate to chapter ─────────────────────────────────────────────
  const openChapter = useCallback((id: string) => {
    setActiveChapterId(id)
    setView('chapter')
    setStudyMode('browse')
    setFlashcardIndex(0)
  }, [])

  // ─── Add all chapter words to study plan ─────────────────────────────
  const addChapterToStudy = useCallback((chapterId: string) => {
    const words = flattenChapter(chapterId).map(({ word: lw }) => ({
      id: `lex-${chapterId}-${lw.word[0]}-${Date.now()}`,
      word: lw.word[0],
      phonetic: '',
      pos: lw.pos,
      meaning: lw.meaning,
      example: lw.example,
      savedAt: new Date().toISOString().slice(0, 10),
      srs: { interval: 0, repetition: 0, efactor: 2.5, state: 'new' as const, dueDate: new Date().toISOString().slice(0, 10), lastReviewed: '', lapseCount: 0 },
    }))
    addToStudyPlan(words)
  }, [addToStudyPlan])

  // ─── Flashcard rating handler ────────────────────────────────────────
  const handleRate = useCallback((word: LexiconWord, rating: SimpleRating) => {
    console.log(`[Flashcard] rated ${rating} for "${word.word[0]}": ${word.meaning}`)
  }, [])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">📚 雅思词汇真经</h1>
          <p className="text-sm text-text-muted mt-1">
            22 个话题 · {totalLexiconWords.toLocaleString()} 个核心词汇 · 逻辑词群记忆法
          </p>
        </div>
        {view !== 'chapters' && (
          <button onClick={() => setView('chapters')} className="text-xs text-accent-green hover:underline cursor-pointer">
            ← 返回话题列表
          </button>
        )}
      </div>

      {/* ─── Search bar (always visible) ─── */}
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="搜索单词或中文释义…"
      />

      {/* Search results */}
      {searchQuery && searchResults.length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-3">搜索结果 ({searchResults.length})</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {searchResults.map(({ word, chapterId }, idx) => {
              const ch = IELTS_LEXICON[chapterId]
              return (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-[10px] bg-bg-elevated border border-border-subtle">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-text-primary">{word.word[0]}</span>
                      <span className="text-xs text-text-muted italic">{word.pos}</span>
                      <Badge variant="default" size="sm" className="text-[10px]">{ch?.topic || chapterId}</Badge>
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{word.meaning}</p>
                  </div>
                  <button
                    onClick={() => openChapter(chapterId)}
                    className="text-xs text-accent-green hover:underline cursor-pointer whitespace-nowrap"
                  >
                    查看章节
                  </button>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* ─── CHAPTERS LIST ─── */}
      {view === 'chapters' && !searchQuery && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: '话题总数', value: chapterList.length, color: 'text-text-primary' },
              { label: '词汇总量', value: totalLexiconWords, color: 'text-text-primary' },
              { label: '收藏生词', value: savedWords.length, color: 'text-accent-gold' },
              { label: '待复习', value: savedWords.filter((w) => w.srs.dueDate <= new Date().toISOString().slice(0, 10)).length, color: 'text-danger' },
            ].map((s) => (
              <Card key={s.label} variant="stats">
                <p className={cn('text-xl font-bold', s.color)}>{s.value}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{s.label}</p>
              </Card>
            ))}
          </div>

          {/* Saved words preview */}
          {savedWords.length > 0 && (
            <Card className="bg-accent-gold/5 border-accent-gold/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>📖</span>
                  <h3 className="text-sm font-semibold text-text-primary">收藏的生词（{savedWords.length}）</h3>
                </div>
                <span className="text-[10px] text-text-muted">来自阅读和图书馆</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {savedWords.slice(0, 15).map((w) => (
                  <span key={w.id} className="px-2.5 py-1 rounded-[6px] bg-bg-card border border-accent-gold/20 text-xs text-text-secondary">
                    {w.word}
                  </span>
                ))}
                {savedWords.length > 15 && (
                  <span className="px-2.5 py-1 text-xs text-text-muted">+{savedWords.length - 15} 更多</span>
                )}
              </div>
            </Card>
          )}

          {/* Chapter grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {chapterList.map((ch) => {
              const chapter = IELTS_LEXICON[ch.id]
              return (
                <Card
                  key={ch.id}
                  variant="interactive"
                  className="cursor-pointer"
                  onClick={() => openChapter(ch.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-text-primary">{ch.topic}</span>
                      </div>
                      <p className="text-[10px] text-text-muted">
                        {chapter?.groupCount || 0} 个词群 · {ch.wordCount} 个词
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <Badge variant="default" size="sm">{ch.wordCount}</Badge>
                      <button
                        onClick={(e) => { e.stopPropagation(); addChapterToStudy(ch.id) }}
                        className="text-[10px] text-accent-green hover:underline cursor-pointer"
                        title="加入今日学习计划"
                      >
                        + 计划
                      </button>
                    </div>
                  </div>
                  {/* Chapter audio */}
                  <audio
                    className="mt-3 w-full h-6"
                    controls
                    onClick={(e) => e.stopPropagation()}
                  >
                    <source src={`/vocabulary/audio/${ch.id}.mp3`} type="audio/mpeg" />
                  </audio>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* ─── CHAPTER DETAIL ─── */}
      {view === 'chapter' && activeChapterId && (
        <>
          {/* Chapter header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary">{IELTS_LEXICON[activeChapterId]?.topic}</h2>
              <p className="text-xs text-text-muted">
                {IELTS_LEXICON[activeChapterId]?.groupCount} 个词群 · {IELTS_LEXICON[activeChapterId]?.wordCount} 个词
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => addChapterToStudy(activeChapterId)}
                className="text-xs text-accent-green hover:underline cursor-pointer"
              >
                + 加入今日计划
              </button>
            </div>
          </div>

          {/* Mode switcher */}
          <div className="flex rounded-[10px] bg-bg-elevated p-1 gap-1 w-fit">
            {([
              { key: 'browse' as StudyMode, label: '词群浏览', icon: '📖' },
              { key: 'flashcard' as StudyMode, label: '闪卡记忆', icon: '🃏' },
              { key: 'practice' as StudyMode, label: '拼写练习', icon: '✏️' },
            ] as const).map((m) => (
              <button
                key={m.key}
                onClick={() => setStudyMode(m.key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all duration-200 cursor-pointer',
                  studyMode === m.key
                    ? 'bg-accent-green text-bg-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <span>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>

          {/* ─── BROWSE ─── */}
          {studyMode === 'browse' && (
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="p-3 text-left text-xs text-gray-500">#</th>
                    <th className="p-3 text-left text-xs text-gray-500">词</th>
                    <th className="p-3 text-left text-xs text-gray-500">词性</th>
                    <th className="p-3 text-left text-xs text-gray-500">词义</th>
                    <th className="p-3 text-left text-xs text-gray-500">例句</th>
                    <th className="p-3 text-left text-xs text-gray-500">拓展</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800">
                  {(() => {
                    const chapter = IELTS_LEXICON[activeChapterId]
                    if (!chapter) return null
                    const rows: React.ReactNode[] = []
                    let rowIdx = 0
                    chapter.groups.forEach((group, gi) => {
                      rows.push(
                        <tr key={`group-${gi}`} className="bg-gray-100 dark:bg-gray-700">
                          <td colSpan={6} className="px-4 py-2 text-xs font-bold text-text-muted">
                            第 {gi + 1} 组词群
                          </td>
                        </tr>
                      )
                      group.forEach((word, wi) => {
                        rowIdx++
                        rows.push(
                          <tr key={`word-${gi}-${wi}`} className={rowIdx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : ''}>
                            <td className="p-3 text-xs text-gray-400">{rowIdx}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => speakWord(word.word[0])}
                                  className="text-text-muted hover:text-accent-green cursor-pointer transition-colors"
                                  title="点击朗读发音（Web Speech API）"
                                >
                                  🔊
                                </button>
                                {word.word.map((w, wi2) => (
                                  <a
                                    key={wi2}
                                    href={`https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${w}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-bold text-text-primary hover:underline"
                                  >
                                    {w}
                                  </a>
                                ))}
                              </div>
                            </td>
                            <td className="p-3 text-xs italic" style={{ fontFamily: 'Times' }}>{word.pos}</td>
                            <td className="p-3 text-sm text-text-primary">{word.meaning}</td>
                            <td className="p-3 text-xs text-text-muted max-w-[200px]">{word.example !== '-' ? word.example : ''}</td>
                            <td className="p-3 text-xs text-info max-w-[150px]">{word.extra !== '-' ? word.extra : ''}</td>
                          </tr>
                        )
                      })
                    })
                    return rows
                  })()}
                </tbody>
              </table>
            </div>
          )}

          {/* ─── FLASHCARD ─── */}
          {studyMode === 'flashcard' && (
            <div className="space-y-6">
              {flashcardIndex < flashcardWords.length ? (
                <FlashcardCard
                  key={`${flashcardWords[flashcardIndex].chapterId}-${flashcardIndex}`}
                  word={flashcardWords[flashcardIndex].word}
                  chapterId={flashcardWords[flashcardIndex].chapterId}
                  onRate={(r) => handleRate(flashcardWords[flashcardIndex].word, r)}
                  onNext={() => setFlashcardIndex((i) => i + 1)}
                  index={flashcardIndex}
                  total={flashcardWords.length}
                />
              ) : (
                <Card className="text-center py-12 max-w-md mx-auto">
                  <span className="text-5xl mb-4 block">🎉</span>
                  <h3 className="text-xl font-bold text-text-primary mb-2">本轮学习完成！</h3>
                  <p className="text-sm text-text-muted mb-6">太棒了，已复习完所有词汇</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="secondary" onClick={() => setFlashcardIndex(0)}>🔄 再学一轮</Button>
                    <Button variant="primary" onClick={() => setStudyMode('browse')}>📖 回到浏览</Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* ─── PRACTICE ─── */}
          {studyMode === 'practice' && (
            <PracticeMode chapterId={activeChapterId} />
          )}
        </>
      )}
    </div>
  )
}