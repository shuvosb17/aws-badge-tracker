import { COMMUNITY_LABELS, PHASES } from '../data/badges'
import type { Update } from '../lib/actions'
import { diffDays, formatKey } from '../lib/date'
import { articlesWithTenLikes } from '../lib/progress'
import type { AppState, Badge, BadgeProgress } from '../types'
import { cx } from '../lib/cx'
import { Card, ProgressBar, Stepper } from './ui'

const ACCENTS: Record<string, string> = {
  emerald: 'text-emerald-300 bg-emerald-400/10 border-emerald-400/30',
  yellow: 'text-yellow-300 bg-yellow-400/10 border-yellow-400/30',
  orange: 'text-orange-300 bg-orange-400/10 border-orange-400/30',
  sky: 'text-sky-300 bg-sky-400/10 border-sky-400/30',
  rose: 'text-rose-300 bg-rose-400/10 border-rose-400/30',
  violet: 'text-violet-300 bg-violet-400/10 border-violet-400/30',
}

interface Props {
  state: AppState
  update: Update
  progress: BadgeProgress[]
  today: string
}

export function BadgeBoard({ state, update, progress, today }: Props) {
  const phases = Object.entries(PHASES).map(([phase, info]) => ({
    phase: Number(phase) as Badge['phase'],
    info,
    items: progress.filter((p) => p.badge.phase === Number(phase)),
  }))

  return (
    <div className="space-y-6">
      <Card className="text-sm text-slate-300">
        <p>
          Streak and weekly badges update automatically from your daily check-ins. Tick quick wins when you finish them, and
          update community counters when you see new replies, votes or likes on Builder Center. If AWS already awarded a badge
          that this tracker doesn't show, use <span className="font-semibold text-slate-100">"Mark earned"</span> to match your
          real profile.
        </p>
      </Card>

      {phases.map(({ phase, info, items }) => {
        const done = items.filter((p) => p.earned).length
        return (
          <div key={phase}>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className={cx('rounded-full border px-2.5 py-0.5 text-xs font-semibold', ACCENTS[info.accent])}>
                Phase {phase}
              </span>
              <h2 className="text-lg font-semibold">{info.title}</h2>
              <span className="text-sm text-slate-400">{info.subtitle}</span>
              <span className="ml-auto text-sm text-slate-400">
                {done}/{items.length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <BadgeCard key={p.badge.id} p={p} state={state} update={update} today={today} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BadgeCard({ p, state, update, today }: { p: BadgeProgress; state: AppState; update: Update; today: string }) {
  const { badge, earned } = p
  const manual = !!state.manualEarned[badge.id]
  const days = p.eta ? diffDays(today, p.eta) : null

  return (
    <div
      className={cx(
        'flex flex-col rounded-2xl border p-4 transition',
        earned ? 'border-aws/50 bg-linear-to-br from-aws/15 to-transparent' : 'border-white/10 bg-ink-2/80',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cx(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold',
            earned ? 'bg-aws text-ink shadow-lg shadow-aws/30' : 'bg-white/5 text-slate-500',
          )}
        >
          {earned ? '★' : badge.num}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{badge.name}</h3>
          </div>
          <p className="text-xs text-slate-400">{badge.requirement}</p>
        </div>
      </div>

      <div className="mt-3 flex-1">
        {badge.kind !== 'quick' && (
          <>
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>
                {p.current}/{p.target} {badge.kind === 'weekly' ? 'weeks' : badge.kind === 'streak' ? 'days' : ''}
              </span>
              {!earned && (
                <span>
                  {days === null ? 'depends on community' : `earliest ${formatKey(p.eta!)} (${Math.max(0, days)}d)`}
                </span>
              )}
            </div>
            <ProgressBar value={p.current} max={p.target} />
          </>
        )}
        <p className="mt-3 text-xs text-slate-300">
          <span className="text-aws">Tip:</span> {badge.tip}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
        {badge.kind === 'quick' && (
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!state.quick[badge.id] || earned}
              disabled={earned && !state.quick[badge.id]}
              onChange={(e) => update((s) => ({ ...s, quick: { ...s.quick, [badge.id]: e.target.checked } }))}
              className="h-4 w-4 accent-[#ff9900]"
            />
            Done
          </label>
        )}
        {badge.kind === 'community' && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Stepper
              value={state.community[badge.metric]}
              onChange={(v) => update((s) => ({ ...s, community: { ...s.community, [badge.metric]: v } }))}
            />
            <span>{COMMUNITY_LABELS[badge.metric]}</span>
          </div>
        )}
        {(badge.kind === 'streak' || badge.kind === 'weekly') && (
          <span className="text-xs text-slate-500">Auto-tracked from check-ins</span>
        )}
        <button
          type="button"
          onClick={() => update((s) => ({ ...s, manualEarned: { ...s.manualEarned, [badge.id]: !manual } }))}
          className={cx('text-xs', manual ? 'text-aws hover:underline' : 'text-slate-500 hover:text-slate-200')}
        >
          {manual ? '✓ Marked earned (undo)' : 'Mark earned'}
        </button>
      </div>
      {badge.kind === 'community' && badge.metric === 'articlesWith10Likes' && articlesWithTenLikes(state) > 0 && (
        <p className="mt-2 text-[11px] text-slate-500">
          {articlesWithTenLikes(state)} counted automatically from articles in your Content planner.
        </p>
      )}
    </div>
  )
}
