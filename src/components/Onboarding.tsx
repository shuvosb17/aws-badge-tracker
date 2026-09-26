import { ArrowLeft, ArrowRight, Check, Flame, Gift, GraduationCap, ListChecks, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { BADGES, PHASES } from '../data/badges'
import { PHASE_THEME } from '../data/theme'
import { backfillDaily, backfillWeekly, setQuick } from '../lib/actions'
import { cx } from '../lib/cx'
import type { AppState, Badge, DailyMetric, WeeklyMetric } from '../types'
import { BadgeIcon } from './icons'
import { Button, Modal } from './ui'

interface Props {
  open: boolean
  state: AppState
  today: string
  onFinish: (next: AppState) => void
}

const STREAK_FIELDS: { metric: DailyMetric; label: string; max: number }[] = [
  { metric: 'visit', label: 'Visit streak', max: 90 },
  { metric: 'like', label: 'Like streak', max: 90 },
  { metric: 'comment', label: 'Comment streak', max: 90 },
]
const WEEK_FIELDS: { metric: WeeklyMetric; label: string }[] = [
  { metric: 'vote', label: 'Weeks voting on Wishes' },
  { metric: 'publish', label: 'Weeks publishing articles' },
]

export function Onboarding({ open, state, today, onFinish }: Props) {
  const [step, setStep] = useState(0)
  const [have, setHave] = useState<Set<string>>(new Set())
  const [days, setDays] = useState<Record<DailyMetric, number>>({ visit: 0, like: 0, comment: 0 })
  const [weeks, setWeeks] = useState<Record<WeeklyMetric, number>>({ vote: 0, publish: 0 })
  const [didToday, setDidToday] = useState(false)

  const toggle = (id: string) =>
    setHave((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const finish = (fresh: boolean) => {
    let next: AppState = { ...state, onboarded: true }
    if (!fresh) {
      for (const b of BADGES) {
        if (!have.has(b.id)) continue
        next = b.kind === 'quick' ? setQuick(next, b.id, true, '') : { ...next, manualEarned: { ...next.manualEarned, [b.id]: true } }
      }
      for (const f of STREAK_FIELDS) next = backfillDaily(next, f.metric, days[f.metric], today, didToday)
      for (const f of WEEK_FIELDS) next = backfillWeekly(next, f.metric, weeks[f.metric], today, didToday)
    }
    onFinish(next)
  }

  return (
    <Modal open={open} onClose={() => finish(step === 0)} wide>
      <div className="mb-6 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cx('h-1 flex-1 rounded-full transition', i <= step ? 'bg-aws' : 'bg-white/10')} />
        ))}
      </div>

      {step === 0 && (
        <div>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aws/15 text-aws">
            <Sparkles size={24} />
          </span>
          <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Earn a <span className="text-aws">$100 AWS exam voucher</span> in 90 days
          </h2>
          <p className="mt-2 text-slate-400">
            AWS Builder Center gives verified students rewards for collecting badges. This app tells you exactly what to do each
            day so you never break a streak.
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              { icon: Gift, n: 7, r: '$10 credits' },
              { icon: Gift, n: 14, r: '+$20 credits' },
              { icon: GraduationCap, n: 21, r: '$100 voucher' },
            ].map(({ icon: Icon, n, r }) => (
              <div key={n} className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/[0.08]">
                <Icon size={18} className="text-aws" />
                <div className="mt-2 font-bold">{r}</div>
                <div className="text-xs text-slate-400">at {n} badges</div>
              </div>
            ))}
          </div>

          <ol className="mt-5 space-y-3 text-sm">
            {[
              { icon: ListChecks, t: 'Do today\'s missions', d: 'A short checklist, around 10 minutes a day.' },
              { icon: Flame, t: 'Streaks count themselves', d: 'Tick a mission and every badge it feeds moves forward.' },
              { icon: Gift, t: 'Unlock rewards', d: 'See the earliest date for each reward and claim it on Builder Center.' },
            ].map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-slate-200">
                  <Icon size={16} />
                </span>
                <div>
                  <div className="font-semibold">{t}</div>
                  <div className="text-slate-400">{d}</div>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>
              I already have some badges
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => finish(true)}>
              I'm new, let's start <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Which badges do you already have?</h2>
          <p className="mt-1 text-sm text-slate-400">
            Check your Builder Center profile and tap every badge you've earned. <span className="text-slate-300">{have.size} selected</span>
          </p>
          <div className="mt-5 space-y-4">
            {(Object.keys(PHASES) as unknown as Badge['phase'][]).map((k) => {
              const phase = Number(k) as Badge['phase']
              const theme = PHASE_THEME[phase]
              return (
                <div key={phase}>
                  <div className={cx('mb-2 text-xs font-bold uppercase tracking-widest', theme.text)}>{PHASES[phase].title}</div>
                  <div className="flex flex-wrap gap-2">
                    {BADGES.filter((b) => b.phase === phase).map((b) => {
                      const on = have.has(b.id)
                      return (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => toggle(b.id)}
                          className={cx(
                            'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium ring-1 transition',
                            on ? 'bg-aws/15 text-white ring-aws/50' : 'bg-white/[0.03] text-slate-300 ring-white/10 hover:ring-white/25',
                          )}
                        >
                          {on ? <Check size={15} className="text-aws" strokeWidth={3} /> : <BadgeIcon name={b.id} size={15} className="text-slate-500" />}
                          {b.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-7 flex gap-2">
            <Button variant="ghost" onClick={() => setStep(0)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => setStep(2)}>
              Next: current streaks <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">What are your current streaks?</h2>
          <p className="mt-1 text-sm text-slate-400">
            Your profile shows streak progress under "Badges in progress". Enter 0 if you haven't started.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {STREAK_FIELDS.map((f) => (
              <NumberField
                key={f.metric}
                label={f.label}
                unit="days"
                value={days[f.metric]}
                max={f.max}
                onChange={(v) => setDays((d) => ({ ...d, [f.metric]: v }))}
              />
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {WEEK_FIELDS.map((f) => (
              <NumberField
                key={f.metric}
                label={f.label}
                unit="weeks"
                value={weeks[f.metric]}
                max={4}
                onChange={(v) => setWeeks((w) => ({ ...w, [f.metric]: v }))}
              />
            ))}
          </div>
          <label className="mt-4 flex cursor-pointer items-center gap-3 rounded-2xl bg-white/[0.04] p-4 text-sm ring-1 ring-white/[0.08]">
            <input type="checkbox" checked={didToday} onChange={(e) => setDidToday(e.target.checked)} className="h-4 w-4 accent-[#ff9900]" />
            These numbers already include today (and this week)
          </label>
          <div className="mt-7 flex gap-2">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => finish(false)}>
              Show my missions <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function NumberField({
  label,
  unit,
  value,
  max,
  onChange,
}: {
  label: string
  unit: string
  value: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <label className="rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/[0.08]">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <div className="mt-1 flex items-baseline gap-2">
        <input
          type="number"
          min={0}
          max={max}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
          className="w-full bg-transparent text-2xl font-extrabold tabular-nums outline-none"
        />
        <span className="text-sm text-slate-500">{unit}</span>
      </div>
    </label>
  )
}
