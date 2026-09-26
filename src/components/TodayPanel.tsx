import { setActivity, type Update } from '../lib/actions'
import { addDays, formatDuration, formatKey, msUntilDayEnd, weekKey } from '../lib/date'
import { dailyStreak, weeklyStreak } from '../lib/progress'
import type { ActivityMetric, AppState, DailyMetric, WeeklyMetric } from '../types'
import { cx } from '../lib/cx'
import { Button, Card, CardTitle } from './ui'

const DAILY: { metric: DailyMetric; label: string; hint: string; icon: string }[] = [
  { metric: 'visit', label: 'Visit', hint: 'Open Builder Center & read something', icon: '👀' },
  { metric: 'like', label: 'Like', hint: 'Like a post you found useful', icon: '👍' },
  { metric: 'comment', label: 'Comment', hint: 'Leave one thoughtful comment', icon: '💬' },
]

const WEEKLY: { metric: WeeklyMetric; label: string; icon: string }[] = [
  { metric: 'vote', label: 'Voted on a Wish', icon: '🗳️' },
  { metric: 'publish', label: 'Published an article', icon: '✍️' },
]

interface Props {
  state: AppState
  update: Update
  today: string
  selected: string
  setSelected: (d: string) => void
}

export function TodayPanel({ state, update, today, selected, setSelected }: Props) {
  const log = state.daily[selected] ?? {}
  const isToday = selected === today
  const dailyDone = DAILY.filter((d) => log[d.metric]).length
  const atRisk = isToday && dailyDone < 3

  const toggle = (metric: ActivityMetric) => update((s) => setActivity(s, selected, metric, !s.daily[selected]?.[metric]))
  const logAll = () =>
    update((s) => DAILY.reduce((acc, d) => setActivity(acc, selected, d.metric, true), s))

  const weekDone = (metric: WeeklyMetric) => {
    const wk = weekKey(selected)
    return Object.keys(state.daily).some((k) => weekKey(k) === wk && state.daily[k]?.[metric])
  }

  return (
    <Card>
      <CardTitle
        right={
          <a
            href="https://builder.aws.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-aws/15 px-3 py-1.5 text-xs font-semibold text-aws hover:bg-aws/25"
          >
            Open Builder Center ↗
          </a>
        }
      >
        Daily check-in
      </CardTitle>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button variant="ghost" onClick={() => setSelected(addDays(selected, -1))} title="Previous day">
            ‹
          </Button>
          <div className="min-w-40 text-center">
            <div className="font-semibold">{isToday ? 'Today' : formatKey(selected, { weekday: 'long' })}</div>
            <div className="text-xs text-slate-400">{formatKey(selected, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>
          <Button variant="ghost" onClick={() => setSelected(addDays(selected, 1))} disabled={isToday} title="Next day">
            ›
          </Button>
          {!isToday && (
            <Button variant="ghost" className="text-xs" onClick={() => setSelected(today)}>
              Back to today
            </Button>
          )}
        </div>
        {isToday && (
          <div className="text-right text-xs text-slate-400">
            <span className="font-semibold text-slate-200">{formatDuration(msUntilDayEnd(state.dayBoundary))}</span> left today
            <span className="ml-1 text-slate-500">({state.dayBoundary === 'utc' ? 'UTC' : 'local time'})</span>
          </div>
        )}
      </div>

      {atRisk && (
        <div className="mb-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          {dailyDone === 0
            ? "Nothing logged today yet. Do today's visit, like and comment so your streaks don't reset."
            : `${3 - dailyDone} activit${3 - dailyDone === 1 ? 'y' : 'ies'} left today. Finish them to keep every streak alive.`}
        </div>
      )}
      {!isToday && (
        <div className="mb-4 rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm text-sky-200">
          Editing a past day. Only log what you actually did on Builder Center, because this tracker can't see your real AWS streak.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {DAILY.map(({ metric, label, hint, icon }) => {
          const done = !!log[metric]
          const streak = dailyStreak(state, metric, today)
          return (
            <button
              key={metric}
              type="button"
              onClick={() => toggle(metric)}
              className={cx(
                'group rounded-xl border p-4 text-left transition',
                done ? 'border-aws/60 bg-aws/15' : 'border-white/10 bg-white/5 hover:border-white/25',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{icon}</span>
                <span
                  className={cx(
                    'flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold',
                    done ? 'border-aws bg-aws text-ink' : 'border-white/30 text-transparent group-hover:text-white/40',
                  )}
                >
                  ✓
                </span>
              </div>
              <div className="mt-3 font-semibold">{label}</div>
              <div className="text-xs text-slate-400">{hint}</div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-aws">🔥 {streak.current} day{streak.current === 1 ? '' : 's'}</span>
                <span className="text-slate-500">best {streak.longest}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={logAll} disabled={dailyDone === 3}>
          {dailyDone === 3 ? '✓ All daily activities logged' : 'Log all 3 daily activities'}
        </Button>
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Weekly tasks (Mon–Sun)</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {WEEKLY.map(({ metric, label, icon }) => {
            const done = !!log[metric]
            const thisWeek = weekDone(metric)
            const streak = weeklyStreak(state, metric, today)
            return (
              <button
                key={metric}
                type="button"
                onClick={() => toggle(metric)}
                className={cx(
                  'flex items-center gap-3 rounded-xl border p-3 text-left transition',
                  done ? 'border-aws/60 bg-aws/15' : 'border-white/10 bg-white/5 hover:border-white/25',
                )}
              >
                <span className="text-xl">{icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold">
                    {label} {isToday ? 'today' : 'this day'}
                  </div>
                  <div className={cx('text-xs', thisWeek ? 'text-emerald-300' : 'text-amber-300')}>
                    {thisWeek ? '✓ Done for this week' : 'Not done this week yet'} · {streak.current}/4 weeks
                  </div>
                </div>
                <span
                  className={cx(
                    'flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold',
                    done ? 'border-aws bg-aws text-ink' : 'border-white/30 text-transparent',
                  )}
                >
                  ✓
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
