import { useState } from 'react'
import { cn } from '@/utils/cn'
import { Card, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useAuthStore } from '@/store/authStore'

// ─── Mock Data ────────────────────────────────────────────────────────────────
const WEAK_AREAS = [
  { subject: 'Reading - True/False/Not Given', score: 5.5, trend: -0.5, focus: true },
  { subject: 'Writing - Task Achievement', score: 5.0, trend: -1.0, focus: true },
  { subject: 'Listening - Section 4', score: 6.5, trend: 0.5, focus: false },
  { subject: 'Speaking - Lexical Resource', score: 6.0, trend: 0, focus: false },
]

const WEEKLY_DATA = [
  { day: 'Mon', reading: 7.0, listening: 6.5, writing: 6.0, speaking: 6.5 },
  { day: 'Tue', reading: 6.5, listening: 7.0, writing: 6.5, speaking: 6.0 },
  { day: 'Wed', reading: 7.5, listening: 6.5, writing: 7.0, speaking: 6.5 },
  { day: 'Thu', reading: 6.0, listening: 7.5, writing: 6.0, speaking: 7.0 },
  { day: 'Fri', reading: 7.0, listening: 6.0, writing: 6.5, speaking: 6.5 },
  { day: 'Sat', reading: 7.5, listening: 7.0, writing: 7.5, speaking: 7.0 },
  { day: 'Sun', reading: 6.5, listening: 6.5, writing: 6.0, speaking: 6.0 },
]

const SKILL_LEVELS = [
  { label: 'Listening', value: 6.5, color: '#6ec56e' },
  { label: 'Reading', value: 6.8, color: '#e8b84b' },
  { label: 'Writing', value: 5.8, color: '#e85b4b' },
  { label: 'Speaking', value: 6.3, color: '#5b9bd5' },
  { label: 'Overall', value: 6.3, color: '#c4893a' },
]

function MiniBarChart({ data }: { data: number[] }) {
  const max = 10
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((val, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-[3px] bg-accent-green/60 transition-all duration-500"
          style={{ height: `${(val / max) * 100}%` }}
        />
      ))}
    </div>
  )
}

function RadarChart({ scores }: { scores: number[] }) {
  const size = 120
  const cx = size / 2
  const cy = size / 2
  const r = 50
  const labels = ['TR', 'CC', 'LR', 'GRA']
  const angles = labels.map((_, i) => (i * 2 * Math.PI) / labels.length - Math.PI / 2)

  function polarToXY(angle: number, radius: number) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  }

  const points = angles.map((angle, i) => {
    const radius = (scores[i] / 9) * r
    return polarToXY(angle, radius)
  })

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {[0.25, 0.5, 0.75, 1].map((level) => (
        <polygon
          key={level}
          points={angles.map((angle) => {
            const p = polarToXY(angle, r * level)
            return `${p.x},${p.y}`
          }).join(' ')}
          fill="none"
          stroke="#2a3d2c"
          strokeWidth="1"
        />
      ))}
      {/* Axis lines */}
      {angles.map((angle, i) => {
        const p = polarToXY(angle, r)
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#2a3d2c"
            strokeWidth="1"
          />
        )
      })}
      {/* Labels */}
      {angles.map((angle, i) => {
        const p = polarToXY(angle, r + 12)
        return (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="#7a9170"
            fontWeight="600"
          >
            {labels[i]}
          </text>
        )
      })}
      {/* Score polygon */}
      <polygon
        points={polylinePoints}
        fill="rgba(110,197,110,0.2)"
        stroke="#6ec56e"
        strokeWidth="2"
      />
      {/* Score dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#6ec56e" />
      ))}
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Analytics() {
  const { user, partner } = useAuthStore()
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')

  const avgScore = (SKILL_LEVELS[4].value).toFixed(1)
  const targetScore = 7.0
  const gap = targetScore - parseFloat(avgScore)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{'📊'} AI 分析</h1>
          <p className="text-sm text-text-muted mt-1">
            能力雷达图 · 薄弱点定位 · 搭子对比
          </p>
        </div>

        {/* Time Range Tabs */}
        <div className="inline-flex rounded-[10px] bg-bg-elevated p-1 gap-1">
          {(['week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-4 py-1.5 text-xs font-semibold rounded-[8px] transition-all duration-200',
                timeRange === range
                  ? 'bg-accent-green text-bg-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {range === 'week' ? '本周' : '本月'}
            </button>
          ))}
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: '当前均分', value: avgScore, sub: `目标 ${targetScore}`, color: 'text-accent-green' },
          { label: '距目标差', value: gap.toFixed(1), sub: '还需提升', color: 'text-accent-amber' },
          { label: '本周练习', value: '14', sub: '任务数', color: 'text-info' },
          { label: '总分趋势', value: '↑2.4%', sub: '较上周', color: 'text-accent-green' },
        ].map((stat) => (
          <Card key={stat.label} variant="stats">
            <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
            <p className="text-[10px] text-text-muted mt-0.5">{stat.label}</p>
            <p className="text-[9px] text-text-muted">{stat.sub}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardTitle>能力雷达图</CardTitle>
          <div className="flex flex-col items-center mt-4">
            <RadarChart scores={[6.0, 6.5, 6.0, 6.5]} />
            <p className="text-xs text-text-muted mt-3">Writing 能力分布</p>
          </div>
        </Card>

        {/* Skill Levels */}
        <Card>
          <CardTitle>各科目得分</CardTitle>
          <div className="space-y-4 mt-2">
            {SKILL_LEVELS.map((skill) => (
              <div key={skill.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-text-primary font-medium">{skill.label}</span>
                  <span className="text-sm font-bold" style={{ color: skill.color }}>
                    {skill.value.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-border-subtle overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${(skill.value / 9) * 100}%`,
                      backgroundColor: skill.color,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-text-muted mt-0.5">
                  <span>0</span>
                  <span>9</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weak Areas */}
        <Card>
          <CardTitle>薄弱点定位</CardTitle>
          <div className="space-y-3 mt-2">
            {WEAK_AREAS.map((area) => (
              <div
                key={area.subject}
                className={cn(
                  'flex items-center justify-between p-3 rounded-[10px] transition-all duration-200',
                  area.focus ? 'bg-danger/5 border border-danger/20' : 'bg-bg-elevated'
                )}
              >
                <div className="flex items-center gap-3">
                  {area.focus && (
                    <span className="text-sm">{'\u26A0\uFE0F'}</span>
                  )}
                  <div>
                    <p className="text-xs font-medium text-text-primary">{area.subject}</p>
                    <p className={cn(
                      'text-[10px] font-semibold mt-0.5',
                      area.trend > 0 ? 'text-accent-green' : area.trend < 0 ? 'text-danger' : 'text-text-muted'
                    )}>
                      {area.trend > 0 ? '↑' : area.trend < 0 ? '↓' : '→'} {Math.abs(area.trend)} 分
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-text-primary">{area.score}</p>
                  {area.focus && (
                    <Badge variant="danger" size="sm">重点提升</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardTitle>每日练习趋势</CardTitle>
          <div className="mt-3">
            <div className="flex items-end gap-2 h-28">
              {WEEKLY_DATA.map((day, i) => {
                const avg = ((day.reading + day.listening + day.writing + day.speaking) / 4)
                const normalized = avg / 10
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-[4px] bg-accent-green/70 transition-all duration-500"
                      style={{ height: `${normalized * 100}%` }}
                    />
                    <span className="text-[10px] text-text-muted">{day.day}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3">
              {[
                { label: 'Reading', color: 'bg-accent-green' },
                { label: 'Listening', color: 'bg-accent-gold' },
                { label: 'Writing', color: 'bg-danger' },
                { label: 'Speaking', color: 'bg-info' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={cn('w-2 h-2 rounded-full', item.color)} />
                  <span className="text-[10px] text-text-muted">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}