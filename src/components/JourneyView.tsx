import { useState } from 'react'
import { PHASES } from '../data/badges'
import { PHASE_THEME } from '../data/theme'
import type { Update } from '../lib/actions'
import { cx } from '../lib/cx'
import { diffDays, formatKey } from '../lib/date'
import type { MilestoneStatus } from '../lib/progress'
import type { AppState, Badge, BadgeProgress } from '../types'
import { BadgeDrawer } from './BadgeDrawer'
import { BadgeMedallion } from './BadgeMedallion'
import { Heatmap } from './Heatmap'
import { RewardTrack } from './RewardTrack'
import { Card, SectionTitle } from './ui'

interface Props {
  state: AppState
  update: Update
  today: string
  progress: BadgeProgress[]
  milestones: MilestoneStatus[]
}

function statusLine(p: BadgeProgress, today: string): { text: string; tone: string } {
  if (p.earned) return { text: 'Earned', tone: 'text-emerald-300' }
  if (p.badge.kind === 'quick') return { text: 'Do it today', tone: 'text-aws' }
  if (p.badge.kind === 'community') return { text: `${p.current}/${p.target}`, tone: 'text-slate-400' }
  const unit = p.badge.kind === 'weekly' ? 'wk' : 'd'
  const days = p.eta ? Math.max(0, diffDays(today, p.eta)) : null
  return { text: `${p.current}/${p.target}${unit}${days !== null ? ` · ${formatKey(p.eta!)}` : ''}`, tone: 'text-slate-400' }
}

export function JourneyView({ state, update, today, progress, milestones }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = progress.find((p) => p.badge.id === openId) ?? null
  const earned = progress.filter((p) => p.earned).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl">Your badge journey</h1>
        <p className="mt-1 text-sm text-slate-400">
          21 badges in 6 phases. Start phases 1, 2, 3, 4 and 6 on day one; they run in parallel. Tap any badge for details.
        </p>
      </div>

      <Card>
        <RewardTrack earned={earned} milestones={milestones} today={today} />
      </Card>

      <div className="relative">
        <div className="absolute bottom-6 left-[19px] top-6 w-px bg-linear-to-b from-emerald-400/40 via-sky-400/30 to-violet-400/40 sm:left-[23px]" />
        <div className="space-y-6">
          {(Object.keys(PHASES) as unknown as Badge['phase'][]).map((key) => {
            const phase = Number(key) as Badge['phase']
            const info = PHASES[phase]
            const theme = PHASE_THEME[phase]
            const items = progress.filter((p) => p.badge.phase === phase)
            const done = items.filter((p) => p.earned).length
            const complete = done === items.length
            return (
              <div key={phase} className="relative pl-12 sm:pl-16">
                <span
                  className={cx(
                    'absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-extrabold ring-4 ring-ink sm:h-12 sm:w-12 sm:text-base',
                    complete ? cx('bg-linear-to-br text-ink', theme.gradient) : cx(theme.soft, theme.text),
                  )}
                >
                  {complete ? '✓' : phase}
                </span>
                <Card className="p-4 sm:p-5">
                  <SectionTitle
                    hint={info.subtitle}
                    right={
                      <span className={cx('rounded-full px-2.5 py-1 text-xs font-bold', complete ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/[0.06] text-slate-300')}>
                        {done}/{items.length}
                      </span>
                    }
                  >
                    <span className={theme.text}>Phase {phase}</span> · {info.title}
                  </SectionTitle>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    {items.map((p) => {
                      const s = statusLine(p, today)
                      return (
                        <button
                          key={p.badge.id}
                          type="button"
                          onClick={() => setOpenId(p.badge.id)}
                          className={cx(
                            'flex flex-col items-center gap-2 rounded-2xl p-3 pb-3.5 text-center ring-1 transition hover:-translate-y-0.5',
                            p.earned ? cx(theme.soft, theme.ring) : 'bg-white/[0.02] ring-white/[0.06] hover:bg-white/[0.05] hover:ring-white/15',
                          )}
                        >
                          <BadgeMedallion p={p} />
                          <span className={cx('text-[13px] font-semibold leading-tight', !p.earned && 'text-slate-300')}>{p.badge.name}</span>
                          <span className={cx('text-[11px] font-medium', s.tone)}>{s.text}</span>
                          {!p.earned && p.badge.kind !== 'quick' && (
                            <div className="h-1 w-full max-w-24 overflow-hidden rounded-full bg-white/[0.07]">
                              <div className="h-full rounded-full bg-aws transition-[width] duration-700" style={{ width: `${(p.current / p.target) * 100}%` }} />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      </div>

      <Heatmap state={state} update={update} today={today} />

      <BadgeDrawer p={open} state={state} update={update} today={today} onClose={() => setOpenId(null)} />
    </div>
  )
}
