import { useState, useMemo, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LISTENING_179, getAudioPath, type Listening179Word } from '@/data/listening179'

// ─── Types ─────────────────────────────────────────────────────────────
interface PracticeItem extends Listening179Word {
  form: { word: string; replaceStr: string }
  result: { checked: boolean; errorWords: string[] }
}

// ─── Helper ─────────────────────────────────────────────────────────────
function playAudio(word: string) {
  const path = getAudioPath(word)
  const audio = new Audio(path)
  audio.play().catch(() => {
    // Fallback: try with space replaced by underscore
    const fallback = new Audio(path.replace(/ /g, '_'))
    fallback.play().catch(() => {})
  })
}

function checkItem(item: PracticeItem): string[] {
  const userWord = item.form.word.trim().toLowerCase()
  const userReplaces = item.form.replaceStr
    .split(/[,，]/)
    .map((v) => v.trim().toLowerCase().replace(/\s+/g, ' '))
    .filter(Boolean)

  const errors: string[] = []
  if (userWord && userWord !== item.word.toLowerCase()) {
    errors.push(item.word)
  }
  const missed = item.replace.filter((r) => !userReplaces.includes(r.toLowerCase()))
  errors.push(...missed)
  return [...new Set(errors)]
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function Listening179() {
  const [items, setItems] = useState<PracticeItem[]>(
    LISTENING_179.map((w) => ({
      ...w,
      form: { word: '', replaceStr: '' },
      result: { checked: false, errorWords: [] },
    }))
  )
  const [search, setSearch] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [started, setStarted] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      (i) =>
        i.word.toLowerCase().includes(q) ||
        i.meaning.includes(q) ||
        i.replace.some((r) => r.toLowerCase().includes(q))
    )
  }, [items, search])

  const stats = useMemo(() => {
    const done = items.filter((i) => i.result.checked).length
    const correct = items.filter((i) => i.result.checked && i.result.errorWords.length === 0).length
    return { total: items.length, done, correct }
  }, [items])

  const handleNext = useCallback((idx: number) => {
    const list = items
    const cur = list[idx]
    const errors = checkItem(cur)
    list[idx] = { ...cur, result: { checked: true, errorWords: errors } }
    setItems([...list])

    // Auto play next word
    if (idx + 1 < list.length) {
      setTimeout(() => playAudio(list[idx + 1].word), 300)
    }
  }, [items])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleNext(idx)
      // Focus next word input
      setTimeout(() => {
        const next = document.getElementById(`word-input-${idx + 1}`)
        if (next) (next as HTMLInputElement).focus()
      }, 50)
    }
    // Backtick = play audio
    if (e.key === '`' || (e.key === '`' && e.shiftKey === false)) {
      e.preventDefault()
      playAudio(items[idx].word)
    }
  }, [handleNext, items])

  const handleReset = useCallback(() => {
    setItems(
      LISTENING_179.map((w) => ({
        ...w,
        form: { word: '', replaceStr: '' },
        result: { checked: false, errorWords: [] },
      }))
    )
  }, [])

  const handleCopyErrors = useCallback(() => {
    const errors = items
      .filter((i) => i.result.checked && i.result.errorWords.length > 0)
      .map((i) => `${i.word} → ${i.result.errorWords.join(', ')}`)
    navigator.clipboard.writeText(errors.join('\n'))
  }, [items])

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">🎧 听力 179 考点词</h1>
          <p className="text-sm text-text-muted mt-1">
            考点词 · 同义替换 · 179 个高频词 · 按 Tab 跳到同义词，Enter 检查
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{stats.done}/{stats.total} 已做</span>
          <span className="text-xs text-accent-green">{stats.correct} 正确</span>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索考点词或释义…"
          className="w-64"
        />
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-text-secondary">
          <input
            type="checkbox"
            checked={showAnswer}
            onChange={(e) => setShowAnswer(e.target.checked)}
            className="accent-accent-green"
          />
          显示答案
        </label>
        <div className="flex gap-2 ml-auto">
          <Button variant="secondary" size="sm" onClick={handleReset}>🔄 重置</Button>
          <Button variant="secondary" size="sm" onClick={handleCopyErrors}>📋 拷贝错词</Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setStarted(true)
              playAudio(items[0].word)
            }}
          >
            ▶ 开始练习
          </Button>
        </div>
      </div>

      {/* Tips */}
      <Card className="bg-info/5 border-info/20">
        <ul className="text-xs text-text-secondary space-y-1">
          <li>• 同义替换多个词使用英文逗号 <kbd className="rounded bg-bg-elevated px-1.5 py-0.5 text-[10px] font-mono">`,`</kbd> 分割</li>
          <li>• 按 <kbd className="rounded bg-bg-elevated px-1.5 py-0.5 text-[10px] font-mono">`</kbd>（Tab 上方）播放音频</li>
          <li>• 输入完考点词按 Tab 跳到同义词框，Enter 自动检查并切换下一个</li>
        </ul>
      </Card>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-bg-elevated">
              <th className="px-4 py-3 text-xs text-text-muted font-medium">#</th>
              <th className="px-4 py-3 text-xs text-text-muted font-medium">词性</th>
              <th className="px-4 py-3 text-xs text-text-muted font-medium w-20">🔊</th>
              <th className="px-4 py-3 text-xs text-text-muted font-medium">考点词 / 同义替换</th>
              {showAnswer && <th className="px-4 py-3 text-xs text-text-muted font-medium">答案</th>}
              <th className="px-4 py-3 text-xs text-text-muted font-medium">结果</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, displayIdx) => {
              const idx = items.indexOf(item)
              const done = item.result.checked
              const allCorrect = done && item.result.errorWords.length === 0
              return (
                <tr
                  key={item.index}
                  className={cn(
                    'border-t border-border-subtle transition-all duration-200',
                    displayIdx % 2 === 0 ? 'bg-bg-elevated/30' : ''
                  )}
                >
                  <td className="px-4 py-3 text-xs text-text-muted">{item.index}</td>
                  <td className="px-4 py-3 text-xs italic" style={{ fontFamily: 'Times' }}>
                    {item.type || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => playAudio(item.word)}
                      className="text-text-muted hover:text-accent-green transition-colors cursor-pointer text-sm"
                      title="播放发音"
                    >
                      🔊
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        id={`word-input-${idx}`}
                        type="text"
                        spellCheck={false}
                        autoComplete="off"
                        value={item.form.word}
                        onChange={(e) => {
                          const list = [...items]
                          list[idx] = { ...item, form: { ...item.form, word: e.target.value } }
                          setItems(list)
                        }}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        placeholder="考点词…"
                        className={cn(
                          'w-36 px-2 py-1.5 rounded-lg border text-sm transition-colors',
                          'bg-transparent border-border-subtle',
                          'focus:border-accent-green focus:outline-none',
                          'placeholder:text-text-muted'
                        )}
                      />
                      <span className="text-xs text-text-muted">{item.meaning}</span>
                      <input
                        type="text"
                        spellCheck={false}
                        autoComplete="off"
                        value={item.form.replaceStr}
                        onChange={(e) => {
                          const list = [...items]
                          list[idx] = { ...item, form: { ...item.form, replaceStr: e.target.value } }
                          setItems(list)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') { e.preventDefault(); handleNext(idx) }
                          if (e.key === '`') { e.preventDefault(); playAudio(item.word) }
                        }}
                        placeholder="同义替换（逗号分隔）…"
                        className={cn(
                          'w-64 px-2 py-1.5 rounded-lg border text-sm transition-colors',
                          'bg-transparent border-border-subtle',
                          'focus:border-accent-green focus:outline-none',
                          'placeholder:text-text-muted'
                        )}
                      />
                    </div>
                  </td>
                  {showAnswer && (
                    <td className="px-4 py-3 text-xs text-info">
                      <div>{item.word}</div>
                      <div className="text-text-muted">{item.replace.join(', ')}</div>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {done ? (
                      allCorrect ? (
                        <span className="text-accent-green text-lg" title="全对">✅</span>
                      ) : (
                        <span className="text-danger text-xs" title={item.result.errorWords.join(', ')}>
                          ❌ {item.result.errorWords.join(', ')}
                        </span>
                      )
                    ) : (
                      <button
                        onClick={() => handleNext(idx)}
                        className="text-xs text-accent-green hover:underline cursor-pointer"
                      >
                        检查
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-sm text-text-muted">没有找到匹配的考点词</p>
        </Card>
      )}
    </div>
  )
}