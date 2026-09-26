import { ArrowUpRight, CalendarClock, Lightbulb } from 'lucide-react'
import { COMMUNITY_LABELS, PHASES } from '../data/badges'
import { PHASE_THEME } from '../data/theme'
import { setQuick, type Update } from '../lib/actions'
import { cx } from '../lib/cx'
import { diffDays, formatKey } from '../lib/date'
import { articlesWithTenLikes } from '../lib/progress'
import type { AppState, BadgeProgress } from '../types'
import { BadgeMedallion } from './BadgeMedallion'
import { Button, Modal, ProgressBar, Stepper } from './ui'

const HOW_TRACKED: Record<string, string> = {
  quick: 'Tick it once you have done it on Builder Center.',
  streak: 'Tracked automatically from your daily missions on the Today tab.',
  weekly: 'Tracked automatically from your weekly missions on the Today tab.',
  community: 'Update the counter when you see new engagement on Builder Center.',
}

interface Props {
  p: BadgeProgress | null
  state: AppState
  update: Update
  today: string
  onClose: () => void
}

export function BadgeDrawer({ p, state, update, today, onClose }: Props) {
  if (!p) return null
  const { badge } = p
  const theme = PHASE_THEME[badge.phase]
  const manual = !!state.manualEarned[badge.id]
  const days = p.eta ? diffDays(today, p.eta) : null
  const unit = badge.kind === 'weekly' ? 'weeks' : badge.kind === 'streak' ? 'days' : ''

  return (
    <Modal open onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <BadgeMedallion p={p} size="lg" />
        <span className={cx('mt-4 text-xs font-bold uppercase tracking-widest', theme.text)}>
          Phase {badge.phase} · {PHASES[badge.phase].title}
        </span>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{badge.name}</h2>
        <p className="mt-1 text-slate-300">{badge.requirement}</p>
        {p.earned && <span className="mt-3 rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-300">✓ Earned</span>}
      </div>

      {badge.kind !== 'quick' && (
        <div className="mt-6 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/[0.06]">
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="font-semibold">Progress</span>
            <span className="tabular-nums text-slate-300">
              {p.current}/{p.target} {unit}
            </span>
          </div>
          <ProgressBar value={p.current} max={p.target} tone={p.earned ? 'emerald' : 'aws'} />
          {!p.earned && (
            <p className="mt-3 flex items-center gap-2 text-sm text-slate-400">
              <CalendarClock size={15} />
              {days === null
                ? 'Depends on how other builders engage with your content.'
                : days <= 0
                  ? 'You can earn this today!'
                  : `Earliest: ${formatKey(p.eta!, { weekday: 'short', month: 'short', day: 'numeric' })} (${days} days) if you don't miss one.`}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex gap-3 rounded-2xl bg-aws/[0.07] p-4 text-sm ring-1 ring-aws/20">
        <Lightbulb size={18} className="mt-0.5 shrink-0 text-aws" />
        <p className="text-slate-200">{badge.tip}</p>
      </div>

      <p className="mt-4 text-center text-xs text-slate-500">{HOW_TRACKED[badge.kind]}</p>

      <div className="mt-4 space-y-3">
        {badge.kind === 'quick' && (
          <Button
            variant={p.earned ? 'secondary' : 'primary'}
            className="w-full"
            disabled={p.earned && !state.quick[badge.id]}
            onClick={() => update((s) => setQuick(s, badge.id, !s.quick[badge.id], today))}
          >
            {state.quick[badge.id] ? 'Undo: mark as not done' : p.earned ? 'Earned automatically' : "I've done this"}
          </Button>
        )}
        {badge.kind === 'community' && (
          <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/[0.06]">
            <span className="text-sm text-slate-300">{COMMUNITY_LABELS[badge.metric]}</span>
            <Stepper
              value={state.community[badge.metric]}
              onChange={(v) => update((s) => ({ ...s, community: { ...s.community, [badge.metric]: v } }))}
            />
          </div>
        )}
        {badge.kind === 'community' && badge.metric === 'articlesWith10Likes' && articlesWithTenLikes(state) > 0 && (
          <p className="text-center text-xs text-slate-500">{articlesWithTenLikes(state)} counted from your article planner.</p>
        )}
        <div className="flex gap-2">
          <a
            href="https://builder.aws.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-white/[0.07] px-4 py-2.5 text-sm font-medium ring-1 ring-white/10 hover:bg-white/[0.12]"
          >
            Builder Center <ArrowUpRight size={15} />
          </a>
          {badge.kind !== 'quick' && (
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => update((s) => ({ ...s, manualEarned: { ...s.manualEarned, [badge.id]: !manual } }))}
            >
              {manual ? 'Undo "already earned"' : 'I already have this'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
