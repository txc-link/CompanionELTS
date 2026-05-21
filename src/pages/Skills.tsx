import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'

const skillsData = [
  {
    id: 'writing',
    icon: '\u270D\uFE0F',
    name: '\u5199\u4F5C\u6279\u6539',
    desc: '\u591A\u8003\u5B98AI\u6279\u6539\uff0c\u652F\u6301\u8D28\u7591\u8BC4\u5206',
    badge: 'HOT' as const,
    route: '/writing',
  },
  {
    id: 'speaking',
    icon: '\uD83C\uDFA4',
    name: '\u53E3\u8BED\u5BF9\u7EC3',
    desc: '\u6D41\u5229\u5EA6\u3001\u53D1\u97F3\u3001\u8BCD\u6C47\u5168\u9762\u8BC4\u4F30',
    badge: 'NEW' as const,
    route: '/speaking',
  },
  {
    id: 'listening',
    icon: '\uD83C\uDFA7',
    name: '\u542C\u529B\u7CBE\u8BB2',
    desc: '\u771F\u9898\u7CBE\u8BB2 + \u8FC7\u53E5\u5EF6\u8FDF\u590D\u8BFB',
    badge: null,
    route: '/listening',
  },
  {
    id: 'reading',
    icon: '\uD83D\uDCD6',
    name: '\u9605\u8BFB\u7CBE\u8BB2',
    desc: '\u957F\u96BE\u53E5\u5206\u6790 + \u540C\u4E49\u66FF\u6362\u96C6\u9526',
    badge: null,
    route: '/reading',
  },
  {
    id: 'vocabulary',
    icon: '\uD83D\uDCDA',
    name: '\u8BCD\u6C47\u5DE5\u5177',
    desc: '\u8D3B\u65AF\u8BED\u4E13\u9879 + \u5386\u5E74\u771F\u9898\u9AD8\u9891\u8BCD',
    badge: null,
    route: '/vocab',
  },
  {
    id: 'mistakes',
    icon: '\uD83D\uDCDD',
    name: '\u9519\u9898\u590D\u76D8',
    desc: 'AI\u81EA\u52A8\u5F52\u7EB3\u9519\u9898\uff0c\u5B9A\u5411\u5F3A\u5316',
    badge: null,
    route: '/mistakes',
  },
  {
    id: 'pronunciation',
    icon: '\uD83C\uDFAF',
    name: 'AI\u7EA0\u97F3\u5E08',
    desc: '\u5B9E\u65F6\u53D1\u97F3\u68C0\u6D4B + IPA\u6B63\u97F3\u6307\u5BFC',
    badge: 'NEW' as const,
    route: '/speaking?mode=pronunciation',
  },
  {
    id: 'plan',
    icon: '\uD83E\uDDE0',
    name: 'AI\u5B66\u4E60\u89C4\u5212',
    desc: '\u667A\u80FD\u6392\u8BFE\u8868\uff0c\u52A9\u529B\u9AD8\u5206\u7834\u5C40',
    badge: null,
    route: '/study',
  },
] as const

function SkillCard({
  icon,
  name,
  desc,
  badge,
  route,
}: {
  icon: string
  name: string
  desc: string
  badge: 'NEW' | 'HOT' | null
  route: string
}) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(route)}
      className={cn(
        'group relative rounded-[16px] border border-border-subtle bg-bg-card p-5',
        'transition-all duration-300 cursor-pointer',
        'hover:-translate-y-1 hover:shadow-[0_0_24px_rgba(110,197,110,0.2)] hover:border-accent-green/50'
      )}
    >
      {badge && (
        <span
          className={cn(
            'absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded-full',
            badge === 'NEW'
              ? 'bg-accent-green/20 text-accent-green border border-accent-green/30'
              : 'bg-accent-amber/20 text-accent-amber border border-accent-amber/30'
          )}
        >
          {badge}
        </span>
      )}

      <div className="text-3xl mb-3">{icon}</div>

      <h3 className="text-base font-bold text-text-primary mb-1">{name}</h3>

      <p className="text-xs text-text-muted leading-relaxed">{desc}</p>

      {/* bottom arrow indicator */}
      <div
        className={cn(
          'mt-4 flex items-center gap-1 text-[11px] font-medium text-accent-green/60',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
        )}
      >
        <span>\u8FDB\u5165\u5B66\u4E60</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}

export default function Skills() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">AI \u5B66\u4E60\u4E2D\u5FC3</h1>
        <p className="text-sm text-text-muted mt-1">
          \u7CBE\u51C6\u6279\u6539 \u00B7 \u667A\u80FD\u8BC4\u4F30 \u00B7 \u5168\u79D1\u76EE\u8986\u76D6
        </p>
      </div>

      {/* Skill Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {skillsData.map((skill) => (
          <SkillCard
            key={skill.id}
            icon={skill.icon}
            name={skill.name}
            desc={skill.desc}
            badge={skill.badge}
            route={skill.route}
          />
        ))}
      </div>

      {/* Learning Path Progress */}
      <div className="rounded-[16px] border border-border-subtle bg-bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-text-primary">\u5B66\u4E60\u8DEF\u7EBF</h3>
            <p className="text-xs text-text-muted mt-0.5">
              \u57FA\u7840\u9636\u6BB5 \u2192 \u5F3A\u5316\u9636\u6BB5 \u2192 \u51B2\u523A\u9636\u6BB5
            </p>
          </div>
          <span className="text-xs font-semibold text-accent-green">
            \u5F3A\u5316\u9636\u6BB5 68%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 rounded-full bg-bg-elevated overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-green to-accent-green/70"
            style={{ width: '68%' }}
          />
        </div>

        {/* Milestones */}
        <div className="flex justify-between mt-3 text-[11px] text-text-muted">
          <span>Lv.1 \u57FA\u7840</span>
          <span className="text-accent-green font-medium">Lv.2 \u5F3A\u5316</span>
          <span>Lv.3 \u51B2\u523A</span>
        </div>
      </div>
    </div>
  )
}
