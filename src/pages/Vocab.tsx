import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const WORDS = [
  {
    id: 'w1',
    word: 'ubiquitous',
    phonetic: '/juːˈbɪkwɪtəs/',
    pos: 'adj.',
    meaning: '无处不在的',
    example: 'Smartphones have become ubiquitous in modern society.',
    translation: '智能手机在现代社会中已变得无处不在。',
    mastery: 0.3,
    category: 'academic',
    lastReview: '2026-05-18',
    nextReview: '2026-05-22',
    easeFactor: 2.5,
  },
  {
    id: 'w2',
    word: 'mitigate',
    phonetic: '/ˈmɪtɪɡeɪt/',
    pos: 'v.',
    meaning: '减轻，缓和',
    example: 'Planting trees can help mitigate the effects of climate change.',
    translation: '植树可以帮助减轻气候变化的影响。',
    mastery: 0.7,
    category: 'academic',
    lastReview: '2026-05-19',
    nextReview: '2026-05-25',
    easeFactor: 2.8,
  },
  {
    id: 'w3',
    word: 'disparity',
    phonetic: '/dɪˈspærəti/',
    pos: 'n.',
    meaning: '差异，不平等',
    example: 'There is a growing disparity between the rich and the poor.',
    translation: '富人与穷人之间的差距越来越大。',
    mastery: 0.5,
    category: 'academic',
    lastReview: '2026-05-15',
    nextReview: '2026-05-21',
    easeFactor: 2.3,
  },
  {
    id: 'w4',
    word: 'scrutinize',
    phonetic: '/ˈskruːtənaɪz/',
    pos: 'v.',
    meaning: '仔细检查，审查',
    example: 'The data was scrutinized for errors before publication.',
    translation: '数据在发表前经过仔细检查以确保无误。',
    mastery: 0.1,
    category: 'academic',
    lastReview: '2026-05-12',
    nextReview: '2026-05-20',
    easeFactor: 2.1,
  },
  {
    id: 'w5',
    word: 'proliferation',
    phonetic: '/prəˌlɪfəˈreɪʃn/',
    pos: 'n.',
    meaning: '扩散，增殖',
    example: 'The proliferation of social media has changed communication patterns.',
    translation: '社交媒体的普及改变了沟通模式。',
    mastery: 0.8,
    category: 'academic',
    lastReview: '2026-05-20',
    nextReview: '2026-05-28',
    easeFactor: 3.0,
  },
]

const CATEGORY_CONFIG = [
  { label: '全部', key: 'all', count: WORDS.length },
  { label: '核心词汇', key: 'core', count: 3 },
  { label: '学术词汇', key: 'academic', count: 5 },
  { label: '高难词汇', key: 'advanced', count: 2 },
]

// ─── Word Card ───────────────────────────────────────────────────────────────
function WordCard({
  word,
  expanded,
  onToggle,
}: {
  word: (typeof WORDS)[0]
  expanded: boolean
  onToggle: () => void
}) {
  const masteryColor =
    word.mastery >= 0.7
      ? 'text-accent-green'
      : word.mastery >= 0.4
      ? 'text-accent-gold'
      : 'text-danger'

  return (
    <div
      onClick={onToggle}
      className={cn(
        'rounded-[12px] border p-4 cursor-pointer transition-all duration-300',
        'hover:border-accent-green/50',
        expanded
          ? 'border-accent-green/50 bg-accent-green/5'
          : 'border-border-subtle bg-bg-card'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-text-primary">{word.word}</span>
          <span className="text-xs text-text-muted italic">{word.phonetic}</span>
          <Badge variant="default" size="sm">{word.pos}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-bold', masteryColor)}>
            {Math.round(word.mastery * 100)}%
          </span>
          <svg
            className={cn(
              'w-4 h-4 text-text-muted transition-transform duration-200',
              expanded && 'rotate-180'
            )}
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <p className="text-sm text-text-secondary mt-1">{word.meaning}</p>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-border-subtle pt-4">
          <div>
            <p className="text-[10px] text-text-muted mb-1">例句</p>
            <p className="text-xs text-text-primary italic leading-relaxed">
              "{word.example}"
            </p>
            <p className="text-xs text-text-muted mt-1">{word.translation}</p>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-text-muted">
            <span>下次复习：{word.nextReview}</span>
            <span>间隔：{word.easeFactor.toFixed(1)}天</span>
            <Badge variant="info" size="sm">Academic</Badge>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="ghost" size="sm">
              {'\u2615'} 标记模糊
            </Button>
            <Button variant="secondary" size="sm">
              {'\u2714'} 认识
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Vocab() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedWord, setExpandedWord] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')

  const filtered = WORDS.filter((w) => {
    const matchCategory =
      activeCategory === 'all' || w.category === activeCategory
    const matchSearch =
      !searchQuery ||
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.meaning.includes(searchQuery)
    return matchCategory && matchSearch
  })

  const masteredCount = WORDS.filter((w) => w.mastery >= 0.7).length
  const totalCount = WORDS.length
  const masteryPct = Math.round((masteredCount / totalCount) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{'📚'} 词汇工具</h1>
          <p className="text-sm text-text-muted mt-1">
            雅思词汇专项 · 历年真题高频词汇
          </p>
        </div>
        <Button variant="primary" size="sm">
          + 添加单词
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '已掌握', value: masteredCount, sub: `/ ${totalCount}`, color: 'text-accent-green' },
          { label: '掌握率', value: `${masteryPct}%`, sub: '', color: 'text-accent-gold' },
          { label: '今日复习', value: '8', sub: '词', color: 'text-info' },
        ].map((stat) => (
          <Card key={stat.label} variant="stats">
            <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{stat.label}{stat.sub}</p>
          </Card>
        ))}
      </div>

      {/* Search + Category + View Mode */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索单词或中文释义…"
          />
        </div>
        <div className="flex gap-2 items-center">
          {/* Category Pills */}
          <div className="flex gap-1.5">
            {CATEGORY_CONFIG.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'px-3 py-2 rounded-[8px] text-xs font-medium transition-all duration-200 cursor-pointer whitespace-nowrap',
                  activeCategory === cat.key
                    ? 'bg-accent-green text-bg-primary'
                    : 'text-text-secondary border border-border-subtle hover:border-accent-green/50'
                )}
              >
                {cat.label} {cat.count}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex rounded-[8px] border border-border-subtle overflow-hidden">
            {(['cards', 'list'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'p-2 transition-all duration-200',
                  viewMode === mode
                    ? 'bg-accent-green text-bg-primary'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {mode === 'cards' ? '🔲' : '📋'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Word Cards */}
      <div className={cn(
        'space-y-2',
        viewMode === 'cards' ? 'columns-1 sm:columns-2 lg:columns-2' : ''
      )}>
        {filtered.map((word) => (
          <WordCard
            key={word.id}
            word={word}
            expanded={expandedWord === word.id}
            onToggle={() =>
              setExpandedWord(expandedWord === word.id ? null : word.id)
            }
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-3 block">🔍</span>
          <p className="text-sm text-text-muted">没有找到匹配的单词</p>
        </div>
      )}
    </div>
  )
}