import { CalendarCheck, Flame, Medal, Target } from 'lucide-react'
import type { ReactNode } from 'react'
import { BADGES, COMMUNITY_LABELS } from '../data/badges'
import type { Update } from '../lib/actions'
import { cx } from '../lib/cx'
import { addDays, diffDays, formatKey } from '../lib/date'
import type { Mission } from '../lib/missions'
import { communityValue, dailyStreak, type MilestoneStatus } from '../lib/progress'
import type { AppState, BadgeProgress, CommunityMetric } from '../types'
import { MissionList } from './MissionList'
import { RewardTrack } from './RewardTrack'
import { Card, SectionTitle, Stepper } from './ui'

interface Props {
  state: AppState
  update: Update
  today: string
  progress: BadgeProgress[]
  milestones: MilestoneStatus[]
  missions: Mission[]
  onOpenJourney: () => void
}

function greeting(): string {
  const h = new Date().getHours()
  return h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

export function TodayView({ state, update, today, progress, milestones, missions, onOpenJourney }: Props) {
  const earned = progress.filter((p) => p.earned).length
  const streak = Math.min(...(['visit', 'like', 'comment'] as const).map((m) => dailyStreak(state, m, today).current))
  const best = Math.max(...(['visit', 'like', 'comment'] as const).map((m) => dailyStreak(state, m, today).longest))
  const next = milestones.find((m) => !m.achieved)
  const end90 = state.startDate ? addDays(state.startDate, 89) : null
  const day = state.startDate ? diffDays(state.startDate, today) + 1 : null
  const nextMission = missions.find((m) => !m.done)

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-400">
          {greeting()} · {formatKey(today, { weekday: 'long', month: 'long', day: 'numeric' })}
          {day !== null && day > 0 && <span className="text-slate-500"> · Day {day} of 90</span>}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-4xl">
          {nextMission ? (
            <>
              Next up: <span className="bg-linear-to-r from-aws to-amber-300 bg-clip-text text-transparent">{nextMission.title}</span>
            </>
          ) : (
            <>
              You're done for today <span className="inline-block">🎉</span>
            </>
          )}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={<Medal size={18} />} tone="text-aws bg-aws/15" label="Badges earned" value={`${earned}/21`} sub={`${21 - earned} to the $100 voucher`} />
        <Stat
          icon={<Flame size={18} />}
          tone="text-orange-300 bg-orange-400/15"
          label="Daily streak"
          value={`${streak} day${streak === 1 ? '' : 's'}`}
          sub={`Best: ${best} days`}
        />
        <Stat
          icon={<Target size={18} />}
          tone="text-emerald-300 bg-emerald-400/15"
          label="Next reward"
          value={next ? `${next.badges - earned} badge${next.badges - earned === 1 ? '' : 's'}` : 'All done'}
          sub={next ? `to ${next.short === '$100' ? 'the $100 voucher' : `${next.short} credits`}` : 'Claim your voucher'}
        />
        <Stat
          icon={<CalendarCheck size={18} />}
          tone="text-violet-300 bg-violet-400/15"
          label="90-day finish"
          value={end90 ? formatKey(end90) : 'Not started'}
          sub={end90 ? `${Math.max(0, diffDays(today, end90))} days to go` : 'Complete a daily mission'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <MissionList missions={missions} state={state} update={update} />

        <div className="space-y-6">
          <Card>
            <SectionTitle
              hint="Rewards unlock as you collect badges"
              right={
                <button type="button" onClick={onOpenJourney} className="text-sm font-semibold text-aws hover:underline">
                  See all badges
                </button>
              }
            >
              Your rewards
            </SectionTitle>
            <RewardTrack earned={earned} milestones={milestones} today={today} compact />
          </Card>

          <WeekStrip state={state} today={today} />
          <CommunityCard state={state} update={update} progress={progress} />
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, tone, label, value, sub }: { icon: ReactNode; tone: string; label: string; value: string; sub: string }) {
  return (
    <div className="card rounded-3xl p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className={cx('flex h-8 w-8 items-center justify-center rounded-xl', tone)}>{icon}</span>
        <span className="text-xs font-semibold text-slate-400">{label}</span>
      </div>
      <div className="mt-3 text-xl font-extrabold tracking-tight tabular-nums sm:text-2xl">{value}</div>
      <div className="mt-0.5 text-xs text-slate-500">{sub}</div>
    </div>
  )
}

function WeekStrip({ state, today }: { state: AppState; today: string }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
  return (
    <Card>
      <SectionTitle hint="Visit, like and comment every day">Last 7 days</SectionTitle>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const log = state.daily[d] ?? {}
          const count = (log.visit ? 1 : 0) + (log.like ? 1 : 0) + (log.comment ? 1 : 0)
          return (
            <div key={d} className="flex flex-col items-center gap-1.5">
              <span className={cx('text-[11px] font-semibold', d === today ? 'text-aws' : 'text-slate-500')}>
                {formatKey(d, { weekday: 'narrow' })}
              </span>
              <div
                className={cx(
                  'flex aspect-square w-full max-w-11 items-center justify-center rounded-xl text-xs font-bold transition',
                  count === 3 ? 'bg-linear-to-br from-aws to-amber-400 text-ink' : count > 0 ? 'bg-aws/25 text-aws' : 'bg-white/[0.05] text-slate-600',
                  d === today && 'ring-2 ring-aws/60 ring-offset-2 ring-offset-ink',
                )}
                title={`${formatKey(d, { weekday: 'long', month: 'short', day: 'numeric' })}: ${count}/3`}
              >
                {count === 3 ? <Flame size={16} /> : `${count}/3`}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function CommunityCard({ state, update, progress }: { state: AppState; update: Update; progress: BadgeProgress[] }) {
  const community = BADGES.filter((b) => b.kind === 'community')
  return (
    <Card>
      <SectionTitle hint="Update these when you see new replies, votes or likes">Community badges</SectionTitle>
      <ul className="space-y-3">
        {community.map((b) => {
          if (b.kind !== 'community') return null
          const p = progress.find((x) => x.badge.id === b.id)!
          const metric = b.metric as CommunityMetric
          return (
            <li key={b.id} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={cx('truncate text-sm font-semibold', p.earned && 'text-emerald-300')}>
                    {p.earned && '✓ '}
                    {b.name}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-slate-400">
                    {communityValue(state, metric)}/{b.target}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">{COMMUNITY_LABELS[metric]}</div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-pink-400 to-rose-500 transition-[width] duration-700"
                    style={{ width: `${Math.min(100, (p.current / b.target) * 100)}%` }}
                  />
                </div>
              </div>
              <Stepper
                value={state.community[metric]}
                onChange={(v) => update((s) => ({ ...s, community: { ...s.community, [metric]: v } }))}
              />
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
