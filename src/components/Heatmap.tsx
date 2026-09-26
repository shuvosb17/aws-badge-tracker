import { cx } from '../lib/cx'
import { addDays, diffDays, formatKey, weekKey } from '../lib/date'
import { dailyStreak } from '../lib/progress'
import type { AppState, DailyMetric } from '../types'
import { Card, CardTitle, ProgressBar } from './ui'

const WEEKS = 13
const LEVELS = ['bg-white/5', 'bg-aws/30', 'bg-aws/60', 'bg-aws']
const WEEKDAYS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun']
const METRICS: { metric: DailyMetric; label: string }[] = [
  { metric: 'visit', label: 'Visit' },
  { metric: 'like', label: 'Like' },
  { metric: 'comment', label: 'Comment' },
]

interface Props {
  state: AppState
  today: string
  selected: string
  onSelect: (d: string) => void
}

export function Heatmap({ state, today, selected, onSelect }: Props) {
  const anchor =
    state.startDate && diffDays(state.startDate, today) < WEEKS * 7 - 7 ? state.startDate : addDays(today, -(WEEKS - 1) * 7)
  const first = weekKey(anchor)
  const end90 = state.startDate ? addDays(state.startDate, 89) : null
  const daysLeft = end90 ? Math.max(0, diffDays(today, end90)) : null

  const perfectDays = Object.values(state.daily).filter((d) => d?.visit && d?.like && d?.comment).length

  return (
    <Card>
      <CardTitle right={<span className="text-xs text-slate-400">{perfectDays} perfect days</span>}>90-day streak map</CardTitle>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div>
          <div
            className="grid gap-1 sm:gap-1.5"
            style={{ gridTemplateColumns: `auto repeat(${WEEKS}, minmax(0, 1fr))`, gridTemplateRows: 'repeat(7, auto)', gridAutoFlow: 'column' }}
          >
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="flex items-center pr-1 text-[10px] text-slate-500">
                {d}
              </span>
            ))}
            {Array.from({ length: WEEKS * 7 }, (_, i) => {
              const key = addDays(first, i)
              const log = state.daily[key] ?? {}
              const count = (log.visit ? 1 : 0) + (log.like ? 1 : 0) + (log.comment ? 1 : 0)
              const future = key > today
              const inChallenge = !!(state.startDate && end90 && key >= state.startDate && key <= end90)
              return (
                <button
                  key={key}
                  type="button"
                  disabled={future}
                  onClick={() => onSelect(key)}
                  title={`${formatKey(key, { weekday: 'short', month: 'short', day: 'numeric' })}: ${count}/3${log.vote ? ' · voted' : ''}${log.publish ? ' · published' : ''}`}
                  className={cx(
                    'relative aspect-square w-full max-w-10 rounded-[5px] transition',
                    future ? (inChallenge ? 'border border-dashed border-white/15' : 'bg-white/[0.02]') : LEVELS[count],
                    !future && 'hover:ring-2 hover:ring-white/40',
                    key === selected && 'ring-2 ring-white',
                    key === today && key !== selected && 'ring-1 ring-aws',
                  )}
                >
                  {(log.vote || log.publish) && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-sky-300" />}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              Less {LEVELS.map((l) => <span key={l} className={cx('h-3 w-3 rounded-sm', l)} />)} More
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-300" /> Wish vote / article
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm border border-dashed border-white/25" /> Remaining challenge days
            </span>
            <span>Click a day to edit it</span>
          </div>
        </div>

        <div className="space-y-4">
          {METRICS.map(({ metric, label }) => {
            const s = dailyStreak(state, metric, today)
            return (
              <div key={metric}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-medium">{label} streak</span>
                  <span className="text-xs text-slate-400">
                    <span className="font-semibold text-aws">{s.current}</span>/90 · best {s.longest}
                  </span>
                </div>
                <ProgressBar value={s.current} max={90} />
              </div>
            )
          })}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
            {end90 ? (
              <>
                <div className="text-slate-400">90-day finish line</div>
                <div className="text-lg font-semibold">{formatKey(end90, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                <div className="text-xs text-slate-400">
                  {daysLeft === 0 ? "You're there!" : `${daysLeft} days to go if you don't miss a day`}
                </div>
              </>
            ) : (
              <div className="text-slate-400">Set a start date to see your 90-day finish line.</div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
