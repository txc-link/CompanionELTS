import { useState, useMemo, useCallback } from 'react'
import { cn } from '@/utils/cn'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { READING_538, searchReading538, type Reading538Word } from '@/data/reading538'
import { speakWord, speakSentence } from '@/lib/speech'

// ─── Types ─────────────────────────────────────────────────────────────
interface PracticeItem extends Reading538Word {
  form: { word: string; replaceStr: string }
  result: { checked: boolean; errorWords: string[] }
}

// ─── Main Component ─────────────────────────────────────────────────────
export default function Reading538() {
  const [items] = useState<PracticeItem[]>(() =>
    READING_538.map((w) => ({
      ...w,
      form: { word: '', replaceStr: '' },
      result: { checked: false, errorWords: [] },
    }))
  )
  const [search, setSearch] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [mode, setMode] = useState<'browse' | 'practice'>('browse')

  const query = search.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!query) return items
    return items.filter(
      (i) =>
        i.word.toLowerCase().includes(query) ||
        i.meanings.some((m) => m.includes(query)) ||
        i.replaces.some((r) => r.toLowerCase().includes(query))
    )
  }, [items, query])

  const stats = useMemo(() => {
    const done = items.filter((i) => i.result.checked).length
    const correct = items.filter((i) => i.result.checked && i.result.errorWords.length === 0).length
    return { total: items.length, done, correct }
  }, [items])

  const handleNext = useCallback((idx: number) => {
    const cur = items[idx]
    const userWord = cur.form.word.trim().toLowerCase()
    const userReplaces = cur.form.replaceStr
      .split(/[,，]/)
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)

    const errors: string[] = []
    // Check if user input is close to any word variant
    const inputMatches = cur.word.toLowerCase().includes(userWord) || userWord.includes(cur.word.toLowerCase().replace('*', ''))
    if (userWord && !inputMatches) errors.push(cur.word)

    const missed = cur.replaces.filter(
      (r) => !userReplaces.includes(r.toLowerCase())
    )
    errors.push(...missed)
    items[idx] = { ...cur, result: { checked: true, errorWords: [...new Set(errors)] } }
  }, [items])

  const handleReset = useCallback(() => {
    // Force remount by creating new array
    window.location.reload()
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
          <h1 className="text-2xl font-bold text-text-primary">📖 阅读 538 考点词</h1>
          <p className="text-sm text-text-muted mt-1">
            雅思阅读核心同义替换词表 · 538 个高频考点词 · 涵盖指代、并列、转折、因果等结构
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">{stats.done}/{stats.total} 已做</span>
          <span className="text-xs text-accent-green">{stats.correct} 正确</span>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex rounded-[10px] bg-bg-elevated p-1 gap-1 w-fit">
        {([
          { key: 'browse' as const, label: '词表浏览', icon: '📖' },
          { key: 'practice' as const, label: '同义替换练习', icon: '✏️' },
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
            <span>{m.icon}</span>{m.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索考点词或中文释义…"
          className="w-64"
        />
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-text-secondary">
          <input type="checkbox" checked={showAnswer} onChange={(e) => setShowAnswer(e.target.checked)} className="accent-accent-green" />
          显示答案
        </label>
        <div className="flex gap-2 ml-auto">
          <Button variant="secondary" size="sm" onClick={handleReset}>🔄 重置</Button>
          <Button variant="secondary" size="sm" onClick={handleCopyErrors}>📋 拷贝错词</Button>
        </div>
      </div>

      {/* Key points card */}
      <Card className="bg-info/5 border-info/20">
        <div className="text-xs text-text-secondary space-y-1">
          <p className="font-semibold text-text-primary">⚠️ 雅思阅读重要结构：</p>
          <p>• <code className="bg-bg-elevated px-1 rounded">that*</code> 指代是重要考点（同 this, it, they, those 等）</p>
          <p>• <code className="bg-bg-elevated px-1 rounded">and*</code> 并列结构（= or, as well as, both…and…）</p>
          <p>• <code className="bg-bg-elevated px-1 rounded">rather than*</code> 转折结构（= but, however, although…）</p>
          <p>• <code className="bg-bg-elevated px-1 rounded">thanks to*</code> 因果结构（= because of, due to, owing to…）</p>
          <p>• <code className="bg-bg-elevated px-1 rounded">in terms of*</code> 替换 about, regarding</p>
        </div>
      </Card>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border-subtle">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-bg-elevated">
              <th className="px-4 py-3 text-xs text-text-muted font-medium">#</th>
              <th className="px-4 py-3 text-xs text-text-muted font-medium">词性</th>
              <th className="px-4 py-3 text-xs text-text-muted font-medium">考点词</th>
              <th className="px-4 py-3 text-xs text-text-muted font-medium">中文释义</th>
              <th className="px-4 py-3 text-xs text-text-muted font-medium">同义替换</th>
              {showAnswer && <th className="px-4 py-3 text-xs text-text-muted font-medium">答案</th>}
              {mode === 'practice' && <th className="px-4 py-3 text-xs text-text-muted font-medium">结果</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 250).map((item, displayIdx) => {
              const idx = items.indexOf(item)
              return (
                <tr
                  key={item.index}
                  className={cn(
                    'border-t border-border-subtle',
                    displayIdx % 2 === 0 ? 'bg-bg-elevated/30' : ''
                  )}
                >
                  <td className="px-4 py-3 text-xs text-text-muted">{item.index}</td>
                  <td className="px-4 py-3 text-xs italic" style={{ fontFamily: 'Times' }}>
                    {item.pos.join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    {item.word.endsWith('*') ? (
                      <span className="text-text-primary font-semibold">
                        {item.word.replace('*', '')}
                        <span className="text-danger text-xs ml-1">*</span>
                      </span>
                    ) : (
                      <a
                        href={`https://dictionary.cambridge.org/dictionary/english-chinese-simplified/${item.word.replace('*', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-primary font-semibold hover:underline"
                      >
                        {item.word}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-text-secondary">
                    {item.meanings.join('; ')}
                  </td>
                  <td className="px-4 py-3">
                    {mode === 'browse' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakWord(item.word.replace('*', ''))}
                          className="text-text-muted hover:text-accent-green cursor-pointer transition-colors text-sm"
                          title="点击朗读"
                        >
                          🔊
                        </button>
                        {item.replaces.slice(0, 2).map((r, ri) => (
                          <button
                            key={ri}
                            onClick={() => speakWord(r)}
                            className="px-2 py-0.5 rounded-full bg-info/10 text-info text-xs hover:bg-info/20 transition-colors cursor-pointer"
                            title={`朗读: ${r}`}
                          >
                            {r}
                          </button>
                        ))}
                        {item.replaces.length > 2 && (
                          <span className="text-xs text-text-muted">+{item.replaces.length - 2}</span>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        spellCheck={false}
                        value={item.form.replaceStr}
                        onChange={(e) => {
                          const list = [...items]
                          list[idx] = { ...item, form: { ...item.form, replaceStr: e.target.value } }
                        }}
                        placeholder="输入同义替换（逗号分隔）…"
                        className={cn(
                          'w-48 px-2 py-1 rounded border text-xs',
                          'bg-transparent border-border-subtle',
                          'focus:border-accent-green focus:outline-none'
                        )}
                      />
                    )}
                  </td>
                  {showAnswer && (
                    <td className="px-4 py-3">
                      <div className="text-xs text-info">{item.replaces.join(', ')}</div>
                    </td>
                  )}
                  {mode === 'practice' && (
                    <td className="px-4 py-3">
                      {item.result.checked ? (
                        item.result.errorWords.length === 0 ? (
                          <span className="text-accent-green text-sm">✅</span>
                        ) : (
                          <span className="text-danger text-xs">❌ {item.result.errorWords.join(', ')}</span>
                        )
                      ) : (
                        <button onClick={() => handleNext(idx)} className="text-xs text-accent-green hover:underline cursor-pointer">
                          检查
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filtered.length > 250 && (
        <Card className="text-center py-6">
          <p className="text-sm text-text-muted">已显示前 250 个词，搜索完整词表使用上方搜索框</p>
          <p className="text-xs text-text-muted mt-1">完整词表共 {filtered.length} 个考点词</p>
        </Card>
      )}

      {filtered.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-sm text-text-muted">没有找到匹配的考点词</p>
        </Card>
      )}
    </div>
  )
}