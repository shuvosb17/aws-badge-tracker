import { Gift, GraduationCap, Lock } from 'lucide-react'
import { cx } from '../lib/cx'
import { diffDays, formatKey } from '../lib/date'
import type { MilestoneStatus } from '../lib/progress'

const LABELS = ['$10 credits', '+$20 credits', '$100 exam voucher']

interface Props {
  earned: number
  milestones: MilestoneStatus[]
  today: string
  /** Stack rewards as rows, for narrow columns. */
  compact?: boolean
}

export function RewardTrack({ earned, milestones, today, compact }: Props) {
  return (
    <div>
      <div className="relative px-1 pt-2">
        <div className="grid grid-cols-21 gap-[3px]">
          {Array.from({ length: 21 }, (_, i) => (
            <div
              key={i}
              className={cx(
                'h-2.5 transition-colors duration-500 first:rounded-l-full last:rounded-r-full',
                i < earned ? 'bg-linear-to-r from-aws to-amber-300' : 'bg-white/[0.08]',
              )}
            />
          ))}
        </div>
        <div className="relative mt-1.5 h-4 text-[10px] font-semibold text-slate-500">
          <span className="absolute left-1">0</span>
          {[7, 14, 21].map((n) => (
            <span
              key={n}
              className={cx('absolute -translate-x-full pr-0.5', earned >= n && 'text-aws')}
              style={{ left: `${(n / 21) * 100}%` }}
            >
              {n}
            </span>
          ))}
        </div>
      </div>

      <div className={cx('mt-4 grid gap-2 sm:gap-3', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3')}>
        {milestones.map((m, i) => {
          const Icon = i === 2 ? GraduationCap : m.achieved ? Gift : Lock
          const isNext = !m.achieved && milestones.findIndex((x) => !x.achieved) === i
          return (
            <div
              key={m.badges}
              className={cx(
                'rounded-2xl p-3 ring-1 transition',
                m.achieved
                  ? 'bg-emerald-400/10 ring-emerald-400/30'
                  : isNext
                    ? 'bg-aws/10 ring-aws/40'
                    : 'bg-white/[0.03] ring-white/10',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cx(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                    m.achieved ? 'bg-emerald-400 text-ink' : isNext ? 'bg-aws text-ink' : 'bg-white/10 text-slate-400',
                  )}
                >
                  <Icon size={16} strokeWidth={2.4} />
                </span>
                <div className="min-w-0">
                  <div className={cx('text-sm font-bold leading-tight sm:text-base', m.achieved ? 'text-emerald-300' : isNext ? 'text-aws' : 'text-slate-200')}>
                    {LABELS[i]}
                  </div>
                  <div className="text-[11px] text-slate-400">{m.badges} badges</div>
                </div>
              </div>
              <div className="mt-2 text-[11px] leading-snug sm:text-xs">
                {m.achieved ? (
                  <span className="font-semibold text-emerald-300">Unlocked! Claim it in your rewards dashboard</span>
                ) : m.eta ? (
                  <span className="text-slate-300">
                    Earliest <span className="font-semibold text-white">{formatKey(m.eta)}</span>
                    <span className="text-slate-500"> · {Math.max(0, diffDays(today, m.eta))} days</span>
                  </span>
                ) : (
                  <span className="text-slate-400">After day 90 + community badges</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
