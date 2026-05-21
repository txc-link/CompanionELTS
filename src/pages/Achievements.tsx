import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useStudyStore } from '@/store/studyStore'

// ─── Mock Achievements ────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  {
    id: 'a1',
    emoji: '🔥',
    title: '连续7天',
    desc: '坚持学习一周，滴水穿石',
    category: 'streak',
    unlocked: true,
    progress: 7,
    total: 7,
    reward: 50,
  },
  {
    id: 'a2',
    emoji: '📝',
    title: '写作新手',
    desc: '完成10篇写作练习',
    category: 'writing',
    unlocked: true,
    progress: 10,
    total: 10,
    reward: 30,
  },
  {
    id: 'a3',
    emoji: '💬',
    title: '话痨达人',
    desc: '口语练习累计60分钟',
    category: 'speaking',
    unlocked: true,
    progress: 60,
    total: 60,
    reward: 40,
  },
  {
    id: 'a4',
    emoji: '🌟',
    title: '首次满分',
    desc: '任一科目获得9分',
    category: 'score',
    unlocked: false,
    progress: 6,
    total: 9,
    reward: 100,
  },
  {
    id: 'a5',
    emoji: '📚',
    title: '词汇狂人',
    desc: '背完雅思核心3000词',
    category: 'vocab',
    unlocked: false,
    progress: 1240,
    total: 3000,
    reward: 80,
  },
  {
    id: 'a6',
    emoji: '🎧',
    title: '听力满贯',
    desc: '连续10篇听力8分以上',
    category: 'listening',
    unlocked: false,
    progress: 6,
    total: 10,
    reward: 60,
  },
  {
    id: 'a7',
    emoji: '🏆',
    title: '雅思通关',
    desc: '四科全部达到7分',
    category: 'overall',
    unlocked: false,
    progress: 3,
    total: 4,
    reward: 200,
  },
  {
    id: 'a8',
    emoji: '⚡',
    title: '闪电战',
    desc: '1分钟内完成一篇阅读',
    category: 'speed',
    unlocked: false,
    progress: 0,
    total: 1,
    reward: 50,
  },
  {
    id: 'a9',
    emoji: '🌸',
    title: '小红花收集者',
    desc: '累计收集100朵小红花',
    category: 'reward',
    unlocked: true,
    progress: 100,
    total: 100,
    reward: 20,
  },
]

const CATEGORIES = [
  { label: '全部', key: 'all', emoji: '🎯' },
  { label: '已解锁', key: 'unlocked', emoji: '✅' },
  { label: '进行中', key: 'in_progress', emoji: '⏳' },
  { label: '挑战', key: 'locked', emoji: '🔒' },
]

const FLOWER_CONFIG = [
  { name: '🌸 樱花', count: 120, emoji: '🌸' },
  { name: '🌻 向日葵', count: 80, emoji: '🌻' },
  { name: '🌹 玫瑰', count: 50, emoji: '🌹' },
]

// ─── Component ────────────────────────────────────────────────────────────────
export default function Achievements() {
  const [activeCategory, setActiveCategory] = useState('all')
  const { stats } = useStudyStore()

  const filteredAchievements = ACHIEVEMENTS.filter((a) => {
    if (activeCategory === 'all') return true
    if (activeCategory === 'unlocked') return a.unlocked
    if (activeCategory === 'in_progress')
      return !a.unlocked && a.progress > 0
    if (activeCategory === 'locked') return a.progress === 0
    return true
  })

  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length
  const totalCount = ACHIEVEMENTS.length
  const completionPct = Math.round((unlockedCount / totalCount) * 100)
  const totalRewards = ACHIEVEMENTS.reduce((sum, a) => sum + (a.unlocked ? a.reward : 0), 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{'🏅'} 成就中心</h1>
        <p className="text-sm text-text-muted mt-1">
          收集小红花 · 解锁成就徽章 · 兑换奖励
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: '已解锁', value: `${unlockedCount}/${totalCount}`, sub: '成就', icon: '🏆', color: 'text-accent-gold' },
          { label: '完成率', value: `${completionPct}%`, sub: '', icon: '📈', color: 'text-accent-green' },
          { label: '已获奖励', value: totalRewards.toString(), sub: '红花', icon: '🌸', color: 'text-accent-amber' },
        ].map((stat) => (
          <Card key={stat.label} variant="stats">
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{stat.label} {stat.sub}</p>
          </Card>
        ))}
      </div>

      {/* Flower Collection */}
      <Card className="bg-gradient-to-r from-accent-green/5 to-accent-amber/5 border-accent-green/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-accent-green mb-1">🌸 我的小红花</p>
            <p className="text-3xl font-bold text-text-primary">{stats.flowersCollected}</p>
            <p className="text-xs text-text-muted">累计收集</p>
          </div>
          <div className="flex gap-3">
            {FLOWER_CONFIG.map((flower) => (
              <div key={flower.name} className="text-center">
                <span className="text-2xl">{flower.emoji}</span>
                <p className="text-[10px] text-text-muted">{flower.count}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all duration-200',
              activeCategory === cat.key
                ? 'bg-accent-green text-bg-primary'
                : 'text-text-secondary hover:text-text-primary border border-border-subtle'
            )}
          >
            <span>{cat.emoji}</span>
            {cat.label}
            {cat.key === 'all' && <span className="opacity-60">({totalCount})</span>}
            {cat.key === 'unlocked' && <span className="opacity-60">({unlockedCount})</span>}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => {
          const pct = Math.round((achievement.progress / achievement.total) * 100)
          return (
            <div
              key={achievement.id}
              className={cn(
                'rounded-[16px] border p-5 transition-all duration-300',
                'hover:-translate-y-1',
                achievement.unlocked
                  ? 'border-accent-gold/40 bg-accent-gold/5 hover:shadow-[0_0_20px_rgba(232,184,75,0.15)]'
                  : 'border-border-subtle bg-bg-card hover:border-border-accent'
              )}
            >
              {/* Top: Emoji + Lock Badge */}
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  'w-12 h-12 rounded-[12px] flex items-center justify-center',
                  achievement.unlocked ? 'bg-accent-gold/20' : 'bg-bg-elevated'
                )}>
                  <span className="text-2xl">{achievement.emoji}</span>
                </div>
                {!achievement.unlocked && achievement.progress === 0 && (
                  <span className="text-sm">🔒</span>
                )}
                {achievement.unlocked && (
                  <span className="text-sm">✅</span>
                )}
              </div>

              {/* Title + Desc */}
              <h3 className={cn(
                'text-base font-bold mb-1',
                achievement.unlocked ? 'text-accent-gold' : 'text-text-primary'
              )}>
                {achievement.title}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed mb-3">{achievement.desc}</p>

              {/* Progress */}
              {achievement.progress > 0 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
                    <span>进度</span>
                    <span>{achievement.progress}/{achievement.total}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border-subtle overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        achievement.unlocked ? 'bg-accent-gold' : 'bg-accent-green'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Reward */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle">
                <span className="text-xs text-text-muted">奖励</span>
                <Badge variant={achievement.unlocked ? 'success' : 'warning'} size="sm">
                  🌸 {achievement.reward}
                </Badge>
              </div>
            </div>
          )
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl mb-3 block">🔍</span>
          <p className="text-sm text-text-muted">该分类下暂无成就</p>
        </div>
      )}
    </div>
  )
}