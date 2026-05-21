import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const LEADERBOARD_DATA = [
  { rank: 1, name: '雅思小王子', avatar: '王', score: 4850, flowers: 128, streak: 42, trend: 'up', level: 15, color: 'from-accent-amber to-accent-gold' },
  { rank: 2, name: '上岸烤鸭', avatar: '烤', score: 4620, flowers: 95, streak: 28, trend: 'up', level: 14, color: 'from-gray-300 to-gray-400' },
  { rank: 3, name: '剑桥精英', avatar: '剑', score: 4390, flowers: 82, streak: 21, trend: 'up', level: 13, color: 'from-amber-700 to-amber-800' },
  { rank: 4, name: '学习搭子', avatar: '学', score: 4100, flowers: 76, streak: 35, trend: 'down', level: 12, color: 'from-accent-green/30 to-accent-green/50' },
  { rank: 5, name: '阅读达人', avatar: '阅', score: 3950, flowers: 68, streak: 14, trend: 'same', level: 11, color: 'from-accent-green/20 to-accent-green/30' },
  { rank: 6, name: '听力高手', avatar: '听', score: 3800, flowers: 61, streak: 19, trend: 'up', level: 10, color: 'from-accent-green/20 to-accent-green/30' },
  { rank: 7, name: '写作专家', avatar: '写', score: 3650, flowers: 54, streak: 8, trend: 'down', level: 9, color: 'from-accent-green/20 to-accent-green/30' },
  { rank: 8, name: '口语女王', avatar: '口', score: 3500, flowers: 49, streak: 12, trend: 'same', level: 8, color: 'from-accent-green/20 to-accent-green/30' },
  { rank: 9, name: '单词狂人', avatar: '单', score: 3350, flowers: 43, streak: 5, trend: 'up', level: 7, color: 'from-accent-green/20 to-accent-green/30' },
  { rank: 10, name: '备考小白', avatar: '备', score: 3200, flowers: 38, streak: 3, trend: 'up', level: 6, color: 'from-accent-green/20 to-accent-green/30' },
]

// ─── Rank Badge ───────────────────────────────────────────────────────────────
function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-amber to-accent-gold flex items-center justify-center shadow-[0_0_10px_rgba(232,184,75,0.4)]">
        <span className="text-sm">🥇</span>
      </div>
    )
  }
  if (rank === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
        <span className="text-sm">🥈</span>
      </div>
    )
  }
  if (rank === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center">
        <span className="text-sm">🥉</span>
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-full bg-bg-elevated flex items-center justify-center">
      <span className="text-sm font-bold text-text-muted">{rank}</span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Leaderboard() {
  const { user, partner } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'score' | 'streak' | 'flowers'>('score')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')

  const sortedData = [...LEADERBOARD_DATA].sort((a, b) => {
    if (activeTab === 'score') return b.score - a.score
    if (activeTab === 'streak') return b.streak - a.streak
    if (activeTab === 'flowers') return b.flowers - a.flowers
    return 0
  })

  const MY_RANK = 4 // mock current user rank

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{'🏆'} 排行榜</h1>
        <p className="text-sm text-text-muted mt-1">
          和搭子 PK · 争夺榜首 · 每周重置
        </p>
      </div>

      {/* Top 3 Highlight */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 0, 2].map((idx) => {
          const item = sortedData[idx]
          if (!item) return null
          return (
            <div
              key={item.rank}
              className={cn(
                'rounded-[16px] border p-4 text-center transition-all duration-300',
                idx === 0
                  ? 'border-accent-amber/50 bg-accent-amber/5 -mt-3 order-2'
                  : 'border-border-subtle bg-bg-card order-1'
              )}
            >
              <div className={cn(
                'w-14 h-14 rounded-full bg-gradient-to-br mx-auto mb-3 flex items-center justify-center',
                item.color
              )}>
                <span className="text-xl font-bold text-bg-primary">{item.avatar}</span>
              </div>
              <p className="text-sm font-bold text-text-primary">{item.name}</p>
              <p className={cn('text-lg font-bold mt-1', idx === 0 ? 'text-accent-amber' : 'text-text-primary')}>
                {activeTab === 'score' ? item.score.toLocaleString()
                  : activeTab === 'streak' ? `${item.streak}天`
                  : `${item.flowers}朵`}
              </p>
              <p className="text-[10px] text-text-muted mt-0.5">
                {idx === 0 ? 'TOP 1' : `#${item.rank}`}
              </p>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-[10px] bg-bg-elevated p-1 gap-1 flex-1">
          {(['score', 'streak', 'flowers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-all duration-200',
                activeTab === tab
                  ? 'bg-accent-green text-bg-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {tab === 'score' ? '📊 总分' : tab === 'streak' ? '🔥 连续' : '🌸 红花'}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-[10px] bg-bg-elevated p-1 gap-1">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-[8px] transition-all duration-200',
                timeRange === range
                  ? 'bg-accent-gold text-bg-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {range === 'week' ? '本周' : range === 'month' ? '本月' : '全部'}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <Card>
        <CardTitle>排名列表</CardTitle>
        <div className="space-y-2 mt-2">
          {sortedData.map((item) => (
            <div
              key={item.rank}
              className={cn(
                'flex items-center gap-3 rounded-[10px] p-3 transition-all duration-200',
                item.rank === MY_RANK
                  ? 'bg-accent-green/10 border border-accent-green/40'
                  : 'hover:bg-bg-elevated'
              )}
            >
              <RankBadge rank={item.rank} />

              <div className={cn(
                'w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0',
                item.color
              )}>
                <span className="text-sm font-bold text-bg-primary">{item.avatar}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm font-semibold',
                    item.rank === MY_RANK ? 'text-accent-green' : 'text-text-primary'
                  )}>
                    {item.name}
                    {item.rank === MY_RANK && <span className="text-[10px] ml-1">(我)</span>}
                  </span>
                  <span className="text-[10px] text-text-muted">Lv.{item.level}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-text-muted">
                  <span>🔥 {item.streak}天</span>
                  <span>🌸 {item.flowers}朵</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-text-primary">
                  {activeTab === 'score' ? item.score.toLocaleString()
                    : activeTab === 'streak' ? `${item.streak}`
                    : `${item.flowers}`}
                </p>
                {item.trend === 'up' && <span className="text-accent-green text-[10px]">↑ 2</span>}
                {item.trend === 'down' && <span className="text-danger text-[10px]">↓ 1</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}