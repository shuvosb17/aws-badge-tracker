import { ArrowUpRight, Check, Clock, PartyPopper, Zap } from 'lucide-react'
import type { Update } from '../lib/actions'
import { cx } from '../lib/cx'
import { formatDuration, msUntilDayEnd } from '../lib/date'
import type { Mission, MissionGroup } from '../lib/missions'
import type { AppState } from '../types'
import { BadgeIcon } from './icons'
import { Card, Ring } from './ui'

const GROUPS: Record<MissionGroup, { title: string; hint: string }> = {
  start: { title: 'Quick wins', hint: 'One-time. Each one is a badge.' },
  daily: { title: 'Every day', hint: 'Miss a day and the streak resets.' },
  weekly: { title: 'This week', hint: 'Once per week, Mon–Sun.' },
}

interface Props {
  missions: Mission[]
  state: AppState
  update: Update
}

export function MissionList({ missions, state, update }: Props) {
  const done = missions.filter((m) => m.done).length
  const next = missions.find((m) => !m.done)
  const msLeft = msUntilDayEnd(state.dayBoundary)
  const dailyLeft = missions.filter((m) => m.group === 'daily' && !m.done).length
  const urgent = dailyLeft > 0 && msLeft < 4 * 3_600_000

  return (
    <Card className="p-0 sm:p-0">
      <div className="flex items-center gap-4 border-b border-white/[0.06] p-5 sm:p-6">
        <Ring value={done} max={missions.length} size={60} stroke={6}>
          <span className="text-sm font-extrabold tabular-nums">
            {done}/{missions.length}
          </span>
        </Ring>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold tracking-tight">Today's missions</h2>
          <p className={cx('flex items-center gap-1.5 text-sm', urgent ? 'font-semibold text-rose-300' : 'text-slate-400')}>
            <Clock size={14} />
            {formatDuration(msLeft)} left today
            {urgent && ' · your streaks are at risk!'}
          </p>
        </div>
        <a
          href="https://builder.aws.com"
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1.5 rounded-xl bg-aws px-4 py-2.5 text-sm font-bold text-ink shadow-lg shadow-aws/25 transition hover:brightness-110 sm:inline-flex"
        >
          Open Builder Center <ArrowUpRight size={16} />
        </a>
      </div>

      {!next ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <span className="animate-pop flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-400/15 text-emerald-300">
            <PartyPopper size={32} />
          </span>
          <h3 className="text-xl font-bold">All done for today!</h3>
          <p className="max-w-sm text-sm text-slate-400">
            Every streak is safe. Come back tomorrow to keep them going. You can also grow your community badges from the Toolkit.
          </p>
        </div>
      ) : (
        <div className="space-y-6 p-4 sm:p-6">
          {[...new Set(missions.map((m) => m.group))].map((group) => {
            const items = missions.filter((m) => m.group === group)
            if (items.length === 0) return null
            return (
              <div key={group}>
                <div className="mb-2 flex items-baseline gap-2 px-1">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">{GROUPS[group].title}</h3>
                  <span className="text-xs text-slate-500">{GROUPS[group].hint}</span>
                </div>
                <ul className="space-y-2">
                  {items.map((m) => (
                    <MissionRow key={m.id} m={m} isNext={m.id === next.id} onToggle={() => update((s) => m.apply(s, !m.done))} />
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      )}

      <a
        href="https://builder.aws.com"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-1.5 border-t border-white/[0.06] py-3.5 text-sm font-bold text-aws sm:hidden"
      >
        Open Builder Center <ArrowUpRight size={16} />
      </a>
    </Card>
  )
}

function MissionRow({ m, isNext, onToggle }: { m: Mission; isNext: boolean; onToggle: () => void }) {
  const shown = m.feeds.slice(0, 3)
  const extra = m.feeds.length - shown.length

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        disabled={m.locked}
        className={cx(
          'group flex w-full items-start gap-3 rounded-2xl p-3.5 text-left ring-1 transition sm:gap-4 sm:p-4',
          m.done
            ? 'bg-emerald-400/[0.06] ring-emerald-400/20'
            : isNext
              ? 'animate-glow bg-aws/[0.08] ring-aws/50'
              : 'bg-white/[0.03] ring-white/[0.08] hover:bg-white/[0.06] hover:ring-white/20',
          m.locked && 'cursor-default',
        )}
      >
        <span
          className={cx(
            'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition',
            m.done ? 'border-emerald-400 bg-emerald-400 text-ink' : isNext ? 'border-aws' : 'border-white/25 group-hover:border-white/50',
          )}
        >
          {m.done && <Check size={16} strokeWidth={3.5} className="animate-pop" />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <BadgeIcon name={m.icon} size={16} className={m.done ? 'text-emerald-300' : isNext ? 'text-aws' : 'text-slate-400'} />
            <span className={cx('font-semibold', m.done && 'text-slate-400 line-through decoration-slate-600')}>{m.title}</span>
            {isNext && (
              <span className="inline-flex items-center gap-1 rounded-full bg-aws px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink">
                <Zap size={10} strokeWidth={3} /> Do this next
              </span>
            )}
          </div>
          {!m.done && <p className="mt-1 text-sm text-slate-400">{m.how}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {m.note && (
              <span
                className={cx(
                  'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  m.done ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/[0.06] text-slate-300',
                )}
              >
                {m.note}
              </span>
            )}
            {shown.length > 0 && <span className="text-[11px] text-slate-500">Counts toward</span>}
            {shown.map((f) => (
              <span key={f} className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] text-slate-400 ring-1 ring-white/[0.06]">
                {f}
              </span>
            ))}
            {extra > 0 && <span className="text-[11px] text-slate-500">+{extra} more</span>}
          </div>
        </div>
      </button>
    </li>
  )
}
