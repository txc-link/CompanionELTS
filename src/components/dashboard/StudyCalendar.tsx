import { useEffect, useState } from 'react'
import { useStudyStore } from '@/store/studyStore'
import { cn } from '@/utils/cn'
import type { CalendarDay } from '@/types'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function generateWeekDays(): CalendarDay[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon, ...
  // Find Monday of current week (if Sunday, go back 6; otherwise go back (dayOfWeek - 1))
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)

  const days: CalendarDay[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    const isToday = dateStr === today.toISOString().slice(0, 10)
    const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const dayOfWeekIndex = d.getDay() // 0=Sun
    // Convert to Mon=0 ... Sun=6
    const labelIndex = dayOfWeekIndex === 0 ? 6 : dayOfWeekIndex - 1

    days.push({
      date: dateStr,
      dayOfWeek: DAY_LABELS[labelIndex],
      dayNumber: d.getDate(),
      isToday,
      isCompleted: isPast,
      hasSession: isPast || isToday,
      intensity: isPast ? 0.6 : isToday ? 1 : 0.2,
    })
  }
  return days
}

function getStudyHours(date: string): { completed: number; planned: number } {
  // Use simple heuristic: past weekdays get 2h completed, weekends get 6h planned if future
  const d = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)

  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  const dayOfWeek = d.getDay() // 0=Sun, 6=Sat

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  if (diffDays < 0) {
    // Past days
    return { completed: isWeekend ? 6 : 2, planned: 0 }
  } else if (diffDays === 0) {
    // Today
    return { completed: 0.5, planned: 2 }
  } else {
    // Future days
    if (isWeekend) {
      return { completed: 0, planned: 6 }
    }
    return { completed: 0, planned: 2 }
  }
}

interface StudyCalendarProps {
  onDayClick?: (day: CalendarDay) => void
}

export default function StudyCalendar({ onDayClick }: StudyCalendarProps) {
  const { calendarDays, setCalendarDays } = useStudyStore()
  const [weekDays, setWeekDays] = useState<CalendarDay[]>(() =>
    calendarDays.length > 0 ? calendarDays : generateWeekDays()
  )

  useEffect(() => {
    if (calendarDays.length === 0) {
      const generated = generateWeekDays()
      setWeekDays(generated)
      setCalendarDays(generated)
    }
  }, [calendarDays.length, setCalendarDays])

  const handleDayClick = (day: CalendarDay) => {
    onDayClick?.(day)
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {weekDays.map((day) => {
        const { completed, planned } = getStudyHours(day.date)
        const hasHours = completed > 0 || planned > 0

        return (
          <button
            key={day.date}
            onClick={() => handleDayClick(day)}
            className={cn(
              'flex flex-col items-center gap-1 py-2.5 px-3 rounded-[12px] min-w-[56px] transition-all duration-200 flex-shrink-0 cursor-pointer relative',
              day.isToday
                ? 'border-2 border-accent-green bg-bg-card'
                : 'bg-bg-card border border-border-subtle hover:bg-bg-elevated'
            )}
          >
            {/* Day label */}
            <span className="text-[10px] font-medium uppercase tracking-[0.5px] text-text-muted">
              {day.dayOfWeek}
            </span>

            {/* Date number */}
            <span
              className={cn(
                'text-sm font-bold',
                day.isToday ? 'text-accent-green' : 'text-text-primary'
              )}
            >
              {day.dayNumber}
            </span>

            {/* Study info */}
            {hasHours && (
              <div className="flex items-center gap-1 mt-0.5">
                {completed > 0 && (
                  <>
                    <span className="text-[9px] font-semibold text-accent-green">
                      {completed}h
                    </span>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0"
                    >
                      <circle cx="5" cy="5" r="4.5" fill="#6ec56e" />
                      <path
                        d="M3 5L4.5 6.5L7 3.5"
                        stroke="#0f1a12"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
                {planned > 0 && completed === 0 && (
                  <span className="text-[9px] font-semibold text-text-muted">
                    {planned}h
                  </span>
                )}
              </div>
            )}

            {/* Today indicator dot */}
            {day.isToday && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-green" />
            )}
          </button>
        )
      })}
    </div>
  )
}
