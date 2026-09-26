import { useState } from 'react'
import { diffDays, formatKey } from '../lib/date'
import type { MilestoneStatus } from '../lib/progress'
import type { Update } from '../lib/actions'
import type { AppState } from '../types'
import { cx } from '../lib/cx'
import { Button, Card, Ring } from './ui'

interface Props {
  state: AppState
  update: Update
  today: string
  earned: number
  milestones: MilestoneStatus[]
}

export function Hero({ state, update, today, earned, milestones }: Props) {
  const [start, setStart] = useState(today)
  const next = milestones.find((m) => !m.achieved)
  const day = state.startDate ? diffDays(state.startDate, today) + 1 : null

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-aws/20 blur-3xl" />
      <div className="relative grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
        <div className="flex justify-center">
          <Ring value={earned} max={21}>
            <span className="text-5xl font-bold tabular-nums">{earned}</span>
            <span className="text-xs uppercase tracking-widest text-slate-400">of 21 badges</span>
          </Ring>
        </div>

        <div className="space-y-4">
          <div>
            {day !== null ? (
              <p className="text-sm text-slate-400">
                Day <span className="font-semibold text-white">{day}</span> of your challenge · started{' '}
                {formatKey(state.startDate!, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            ) : (
              <p className="text-sm text-slate-400">You haven't started yet. The 90-day streaks are the bottleneck, so start today.</p>
            )}
            <h1 className="mt-1 text-2xl font-bold leading-tight md:text-3xl">
              {next ? (
                <>
                  {next.badges - earned} more badge{next.badges - earned === 1 ? '' : 's'} to{' '}
                  <span className="text-aws">{next.reward}</span>
                </>
              ) : (
                <>
                  All 21 badges earned. <span className="text-aws">Claim your $100 exam voucher!</span>
                </>
              )}
            </h1>
          </div>

          {!state.startDate && (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={start}
                max={today}
                onChange={(e) => setStart(e.target.value)}
                className="rounded-lg border border-white/10 bg-ink-3 px-3 py-2 text-sm"
              />
              <Button variant="primary" onClick={() => update((s) => ({ ...s, startDate: start }))}>
                Start my 90-day challenge
              </Button>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            {milestones.map((m) => (
              <div
                key={m.badges}
                className={cx(
                  'rounded-xl border p-3',
                  m.achieved ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-white/10 bg-white/5',
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className={cx('text-2xl font-bold', m.achieved ? 'text-emerald-300' : 'text-aws')}>{m.short}</span>
                  <span className="text-xs text-slate-400">{m.badges} badges</span>
                </div>
                <p className="mt-1 text-xs text-slate-300">{m.reward}</p>
                <p className="mt-2 text-xs font-medium">
                  {m.achieved ? (
                    <span className="text-emerald-300">✓ Unlocked</span>
                  ) : m.eta ? (
                    <span className="text-slate-200">
                      Earliest: {formatKey(m.eta)} <span className="text-slate-500">({diffDays(today, m.eta)}d)</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">Needs community badges + 90-day streaks</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
