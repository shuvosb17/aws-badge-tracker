import { Check } from 'lucide-react'
import { PHASE_THEME } from '../data/theme'
import { cx } from '../lib/cx'
import type { BadgeProgress } from '../types'
import { BadgeIcon } from './icons'

const SIZES = {
  sm: { box: 'h-11 w-11', icon: 18, tier: 'text-[9px]' },
  md: { box: 'h-16 w-16', icon: 26, tier: 'text-[10px]' },
  lg: { box: 'h-24 w-24', icon: 40, tier: 'text-xs' },
}

function tierLabel(p: BadgeProgress): string | null {
  const b = p.badge
  if (b.kind === 'streak') return `${b.target}D`
  if (b.kind === 'weekly') return '4W'
  return null
}

export function BadgeMedallion({ p, size = 'md' }: { p: BadgeProgress; size?: keyof typeof SIZES }) {
  const theme = PHASE_THEME[p.badge.phase]
  const s = SIZES[size]
  const inProgress = !p.earned && p.current > 0
  const tier = tierLabel(p)

  return (
    <div className={cx('relative shrink-0', s.box)}>
      <div
        className={cx(
          'hex flex h-full w-full items-center justify-center transition',
          p.earned ? cx('bg-linear-to-br shadow-inner', theme.gradient) : 'bg-white/[0.06]',
        )}
      >
        <div
          className={cx(
            'hex flex h-[84%] w-[84%] items-center justify-center',
            p.earned ? 'bg-black/15' : inProgress ? 'bg-ink-3' : 'bg-ink-2',
          )}
        >
          <BadgeIcon name={p.badge.id} size={s.icon} strokeWidth={2.2} className={p.earned ? 'text-white drop-shadow' : inProgress ? theme.text : 'text-slate-600'} />
        </div>
      </div>
      {tier && (
        <span
          className={cx(
            'absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full px-1.5 py-px font-extrabold tracking-wide ring-2 ring-ink',
            s.tier,
            p.earned ? 'bg-white text-ink' : 'bg-ink-3 text-slate-400',
          )}
        >
          {tier}
        </span>
      )}
      {p.earned && (
        <span className="animate-pop absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-ink ring-2 ring-ink">
          <Check size={12} strokeWidth={3.5} />
        </span>
      )}
    </div>
  )
}
