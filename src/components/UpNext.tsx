import { diffDays, formatKey } from '../lib/date'
import type { BadgeProgress } from '../types'
import { Card, CardTitle, ProgressBar } from './ui'

export function UpNext({ progress, today }: { progress: BadgeProgress[]; today: string }) {
  const upcoming = progress
    .filter((p) => !p.earned)
    .sort((a, b) => (a.eta ?? '9999').localeCompare(b.eta ?? '9999') || a.badge.num - b.badge.num)
    .slice(0, 6)

  return (
    <Card>
      <CardTitle>Up next</CardTitle>
      {upcoming.length === 0 ? (
        <p className="text-sm text-emerald-300">Every badge earned. Go claim your voucher! 🎉</p>
      ) : (
        <ul className="space-y-3">
          {upcoming.map((p) => {
            const days = p.eta ? diffDays(today, p.eta) : null
            return (
              <li key={p.badge.id}>
                <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                  <span className="truncate">
                    <span className="mr-1.5 text-xs text-slate-500">#{p.badge.num}</span>
                    {p.badge.name}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {days === null ? 'community' : days <= 0 ? 'today' : `${formatKey(p.eta!)} · ${days}d`}
                  </span>
                </div>
                <ProgressBar value={p.current} max={p.target} />
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
