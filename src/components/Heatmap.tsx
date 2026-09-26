import { useState } from 'react'
import { setActivity, type Update } from '../lib/actions'
import { cx } from '../lib/cx'
import { addDays, diffDays, formatKey, weekKey } from '../lib/date'
import type { ActivityMetric, AppState } from '../types'
import { BadgeIcon } from './icons'
import { Card, SectionTitle } from './ui'

const WEEKS = 13
const LEVELS = ['bg-white/[0.05]', 'bg-aws/30', 'bg-aws/60', 'bg-linear-to-br from-aws to-amber-300']
const WEEKDAYS = ['M', '', 'W', '', 'F', '', 'S']
const EDITABLE: { metric: ActivityMetric; label: string }[] = [
  { metric: 'visit', label: 'Visit' },
  { metric: 'like', label: 'Like' },
  { metric: 'comment', label: 'Comment' },
  { metric: 'vote', label: 'Wish vote' },
  { metric: 'publish', label: 'Article' },
]

export function Heatmap({ state, update, today }: { state: AppState; update: Update; today: string }) {
  const [selected, setSelected] = useState<string | null>(null)
  const anchor =
    state.startDate && diffDays(state.startDate, today) < WEEKS * 7 - 7 ? state.startDate : addDays(today, -(WEEKS - 1) * 7)
  const first = weekKey(anchor)
  const end90 = state.startDate ? addDays(state.startDate, 89) : null
  const perfect = Object.values(state.daily).filter((d) => d?.visit && d?.like && d?.comment).length
  const log = selected ? (state.daily[selected] ?? {}) : {}

  return (
    <Card>
      <SectionTitle
        hint="Click a past day to fix a missed check-in"
        right={<span className="rounded-full bg-aws/10 px-2.5 py-1 text-xs font-bold text-aws">{perfect} perfect days</span>}
      >
        90-day streak map
      </SectionTitle>

      <div
        className="grid max-w-3xl gap-1 sm:gap-1.5"
        style={{ gridTemplateColumns: `auto repeat(${WEEKS}, minmax(0, 1fr))`, gridTemplateRows: 'repeat(7, auto)', gridAutoFlow: 'column' }}
      >
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="flex items-center pr-1 text-[10px] font-semibold text-slate-500">
            {d}
          </span>
        ))}
        {Array.from({ length: WEEKS * 7 }, (_, i) => {
          const key = addDays(first, i)
          const l = state.daily[key] ?? {}
          const count = (l.visit ? 1 : 0) + (l.like ? 1 : 0) + (l.comment ? 1 : 0)
          const future = key > today
          const inChallenge = !!(state.startDate && end90 && key >= state.startDate && key <= end90)
          return (
            <button
              key={key}
              type="button"
              disabled={future}
              onClick={() => setSelected(key === selected ? null : key)}
              title={`${formatKey(key, { weekday: 'short', month: 'short', day: 'numeric' })}: ${count}/3`}
              className={cx(
                'relative aspect-square w-full max-w-9 rounded-md transition',
                future ? (inChallenge ? 'border border-dashed border-white/15' : 'bg-white/[0.02]') : LEVELS[count],
                !future && 'hover:scale-110',
                key === selected && 'ring-2 ring-white',
                key === today && key !== selected && 'ring-2 ring-aws/70',
              )}
            >
              {(l.vote || l.publish) && <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-sky-300" />}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          Less {LEVELS.map((l) => <span key={l} className={cx('h-3 w-3 rounded-sm', l)} />)} More
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-300" /> Wish vote / article
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm border border-dashed border-white/25" /> Days left in your 90
        </span>
      </div>

      {selected && (
        <div className="animate-rise mt-4 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10">
          <div className="mb-3 text-sm font-semibold">
            {formatKey(selected, { weekday: 'long', month: 'long', day: 'numeric' })}
            <span className="ml-2 font-normal text-slate-400">What did you do on Builder Center?</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EDITABLE.map(({ metric, label }) => {
              const on = !!log[metric]
              return (
                <button
                  key={metric}
                  type="button"
                  onClick={() => update((s) => setActivity(s, selected, metric, !on))}
                  className={cx(
                    'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium ring-1 transition',
                    on ? 'bg-aws/15 text-aws ring-aws/40' : 'bg-white/[0.03] text-slate-300 ring-white/10 hover:ring-white/25',
                  )}
                >
                  <BadgeIcon name={metric} size={15} /> {label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}
