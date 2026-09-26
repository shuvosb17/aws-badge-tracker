import { useEffect, useMemo, useState } from 'react'
import { BadgeBoard } from './components/BadgeBoard'
import { ContentPanel } from './components/ContentPanel'
import { Heatmap } from './components/Heatmap'
import { Hero } from './components/Hero'
import { SettingsPanel } from './components/SettingsPanel'
import { TodayPanel } from './components/TodayPanel'
import { UpNext } from './components/UpNext'
import { Button, Card, CardTitle } from './components/ui'
import { cx } from './lib/cx'
import { todayKey } from './lib/date'
import { computeProgress, dailyStreak, milestoneStatus } from './lib/progress'
import { usePersistentState } from './lib/storage'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'badges', label: 'All 21 badges' },
  { id: 'content', label: 'Content' },
  { id: 'settings', label: 'Settings' },
] as const

type Tab = (typeof TABS)[number]['id']

const ROUTINE = [
  'Open builder.aws.com and read one article',
  'Like it (or another post you found useful)',
  'Leave one comment that ends with a real question',
  'Mondays: vote on a Wish and publish your weekly article',
  'Check in here so your streak map stays accurate',
]

export default function App() {
  const [state, setState] = usePersistentState()
  const [, setNow] = useState(() => Date.now())
  const [tab, setTab] = useState<Tab>('dashboard')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const today = todayKey(state.dayBoundary)
  const [picked, setPicked] = useState<string | null>(null)
  const selected = picked ?? today
  const setSelected = (d: string) => setPicked(d === today ? null : d)

  const progress = useMemo(() => computeProgress(state, today), [state, today])
  const milestones = useMemo(() => milestoneStatus(progress), [progress])
  const earned = progress.filter((p) => p.earned).length

  const share = async () => {
    const streak = Math.min(...(['visit', 'like', 'comment'] as const).map((m) => dailyStreak(state, m, today).current))
    const next = milestones.find((m) => !m.achieved)
    const text = [
      `🏅 ${earned}/21 AWS Builder Center badges earned`,
      `🔥 ${streak}-day streak`,
      next ? `🎯 Next reward: ${next.reward}` : '🏆 All 21 badges done. $100 AWS certification voucher unlocked!',
      `Tracking my progress with ${window.location.origin}`,
    ].join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            <div className="leading-tight">
              <div className="font-bold">AWS Badge Tracker</div>
              <div className="text-[11px] text-slate-400">21 badges → $100 exam voucher</div>
            </div>
          </div>
          <nav className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-none sm:ml-6 sm:w-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cx(
                  'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition',
                  tab === t.id ? 'bg-white/10 font-semibold text-white' : 'text-slate-400 hover:text-white',
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-aws/15 px-2.5 py-1 text-xs font-semibold text-aws sm:inline">{earned}/21</span>
            <Button onClick={share} className="text-xs">
              {copied ? '✓ Copied' : 'Share progress'}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {tab === 'dashboard' && (
          <>
            <Hero state={state} update={setState} today={today} earned={earned} milestones={milestones} />
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <TodayPanel state={state} update={setState} today={today} selected={selected} setSelected={setSelected} />
              <div className="space-y-6">
                <UpNext progress={progress} today={today} />
                <Card>
                  <CardTitle>Your 10-minute daily routine</CardTitle>
                  <ol className="space-y-2 text-sm text-slate-300">
                    {ROUTINE.map((r, i) => (
                      <li key={r} className="flex gap-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-aws/15 text-[11px] font-bold text-aws">
                          {i + 1}
                        </span>
                        {r}
                      </li>
                    ))}
                  </ol>
                </Card>
              </div>
            </div>
            <Heatmap state={state} today={today} selected={selected} onSelect={setSelected} />
          </>
        )}
        {tab === 'badges' && <BadgeBoard state={state} update={setState} progress={progress} today={today} />}
        {tab === 'content' && <ContentPanel state={state} update={setState} today={today} />}
        {tab === 'settings' && <SettingsPanel state={state} update={setState} today={today} />}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs text-slate-500">
        <p>
          Rewards: 7 badges = $10 AWS Credits · 14 badges = +$20 AWS Credits · 21 badges = $100 AWS Foundational Certification exam
          voucher (not cash). Based on the{' '}
          <a
            className="text-slate-400 underline hover:text-aws"
            href="https://builder.aws.com/content/3JJRhS6Hfh0Sf2ssvZLpQKai0xY/the-complete-roadmap-to-all-21-aws-builder-center-badges"
            target="_blank"
            rel="noreferrer"
          >
            AWS Builder Center 21-badge roadmap
          </a>{' '}
          and{' '}
          <a
            className="text-slate-400 underline hover:text-aws"
            href="https://builder.aws.com/content/3I1qkUtKhwU6K1VaGkfYRwtbz3o"
            target="_blank"
            rel="noreferrer"
          >
            Student Rewards announcement
          </a>
          . Unofficial tool, not affiliated with AWS. Always confirm badge status on your Builder Center profile.
        </p>
      </footer>
    </div>
  )
}
