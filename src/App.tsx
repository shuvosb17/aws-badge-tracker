import confetti from 'canvas-confetti'
import { CheckSquare, Map as MapIcon, Settings, Share2, Wrench } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BadgeMedallion } from './components/BadgeMedallion'
import { ContentPanel } from './components/ContentPanel'
import { JourneyView } from './components/JourneyView'
import { Onboarding } from './components/Onboarding'
import { SettingsPanel } from './components/SettingsPanel'
import { TodayView } from './components/TodayView'
import type { Update } from './lib/actions'
import { cx } from './lib/cx'
import { todayKey } from './lib/date'
import { buildMissions } from './lib/missions'
import { computeProgress, dailyStreak, milestoneStatus } from './lib/progress'
import { usePersistentState } from './lib/storage'
import type { BadgeProgress } from './types'

const TABS = [
  { id: 'today', label: 'Today', icon: CheckSquare },
  { id: 'journey', label: 'Journey', icon: MapIcon },
  { id: 'toolkit', label: 'Toolkit', icon: Wrench },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

type Tab = (typeof TABS)[number]['id']

function tabFromHash(): Tab {
  const h = window.location.hash.slice(1)
  return TABS.some((t) => t.id === h) ? (h as Tab) : 'today'
}

export default function App() {
  const [state, setState] = usePersistentState()
  const [, setNow] = useState(() => Date.now())
  const [tab, setTab] = useState<Tab>(tabFromHash)
  const [copied, setCopied] = useState(false)
  const [setupOpen, setSetupOpen] = useState(false)
  const [unlocked, setUnlocked] = useState<BadgeProgress | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const onHash = () => setTab(tabFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const today = todayKey(state.dayBoundary)
  const progress = computeProgress(state, today)
  const milestones = milestoneStatus(progress)
  const missions = buildMissions(state, progress, today)
  const earned = progress.filter((p) => p.earned).length

  const update: Update = (fn) => {
    const next = fn(state)
    const before = new Set(progress.filter((p) => p.earned).map((p) => p.badge.id))
    const newly = computeProgress(next, todayKey(next.dayBoundary)).filter((p) => p.earned && !before.has(p.badge.id))
    setState(next)
    if (newly.length > 0 && next.onboarded && state.onboarded) {
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.7 }, colors: ['#ff9900', '#fcd34d', '#34d399', '#a78bfa'] })
      setUnlocked(newly[0])
      window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => setUnlocked(null), 4000)
    }
  }

  const go = (t: Tab) => {
    if (t !== 'today') window.location.hash = t
    else if (window.location.hash) history.pushState(null, '', window.location.pathname)
    setTab(t)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const share = async () => {
    const streak = Math.min(...(['visit', 'like', 'comment'] as const).map((m) => dailyStreak(state, m, today).current))
    const next = milestones.find((m) => !m.achieved)
    const text = [
      `🏅 ${earned}/21 AWS Builder Center badges earned`,
      `🔥 ${streak}-day streak`,
      next ? `🎯 Next reward: ${next.reward}` : '🏆 All 21 badges done. $100 AWS certification voucher unlocked!',
      `Tracking my journey with ${window.location.origin}`,
    ].join('\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-0">
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <button type="button" onClick={() => go('today')} className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="h-9 w-9" />
            <div className="text-left leading-tight">
              <div className="font-extrabold tracking-tight">AWS Badge Tracker</div>
              <div className="text-[11px] font-medium text-slate-400">AWS Builder Center tracker</div>
            </div>
          </button>

          <nav className="ml-6 hidden items-center gap-1 rounded-2xl bg-white/[0.04] p-1 ring-1 ring-white/[0.06] sm:flex">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => go(t.id)}
                className={cx(
                  'flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition',
                  tab === t.id ? 'bg-white/[0.1] text-white shadow' : 'text-slate-400 hover:text-white',
                )}
              >
                <t.icon size={16} /> {t.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-aws/15 px-3 py-1.5 text-xs font-extrabold text-aws tabular-nums">{earned}/21</span>
            <button
              type="button"
              onClick={share}
              className="flex items-center gap-1.5 rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-semibold ring-1 ring-white/10 transition hover:bg-white/[0.1]"
            >
              <Share2 size={14} /> <span className="hidden sm:inline">{copied ? 'Copied!' : 'Share'}</span>
              <span className="sm:hidden">{copied ? '✓' : ''}</span>
            </button>
          </div>
        </div>
      </header>

      <main key={tab} className="animate-fade mx-auto max-w-6xl px-4 py-6 sm:py-10">
        {tab === 'today' && (
          <TodayView
            state={state}
            update={update}
            today={today}
            progress={progress}
            milestones={milestones}
            missions={missions}
            onOpenJourney={() => go('journey')}
          />
        )}
        {tab === 'journey' && <JourneyView state={state} update={update} today={today} progress={progress} milestones={milestones} />}
        {tab === 'toolkit' && <ContentPanel state={state} update={update} today={today} />}
        {tab === 'settings' && <SettingsPanel state={state} update={update} today={today} onRerunSetup={() => setSetupOpen(true)} />}
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs leading-relaxed text-slate-500">
        Rewards for verified students: 7 badges = $10 AWS Credits · 14 badges = +$20 · 21 badges = $100 exam voucher for AWS Certified
        Cloud Practitioner or AI Practitioner (not cash; valid 6 months from claiming). Sources:{' '}
        <a className="underline hover:text-aws" href="https://builder.aws.com/faq" target="_blank" rel="noreferrer">
          Builder Center FAQ
        </a>
        ,{' '}
        <a
          className="underline hover:text-aws"
          href="https://builder.aws.com/content/3I1qkUtKhwU6K1VaGkfYRwtbz3o"
          target="_blank"
          rel="noreferrer"
        >
          Student Rewards announcement
        </a>
        ,{' '}
        <a
          className="underline hover:text-aws"
          href="https://builder.aws.com/content/3IXWU6hpqCLsaXPfPr97QndERO0/a-complete-breakdown-of-all-21-aws-builder-center-badges"
          target="_blank"
          rel="noreferrer"
        >
          21-badge breakdown
        </a>
        . Unofficial tool, not affiliated with AWS. Your Builder Center profile is the source of truth.
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.06] bg-ink/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden">
        <div className="grid grid-cols-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => go(t.id)}
              className={cx('flex flex-col items-center gap-1 py-3 text-[11px] font-semibold', tab === t.id ? 'text-aws' : 'text-slate-500')}
            >
              <t.icon size={20} />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {unlocked && (
        <div className="animate-rise fixed inset-x-4 bottom-24 z-40 mx-auto flex max-w-sm items-center gap-4 rounded-3xl bg-ink-3/95 p-4 shadow-2xl ring-1 ring-aws/40 backdrop-blur sm:bottom-8">
          <BadgeMedallion p={unlocked} size="sm" />
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-aws">Badge unlocked!</div>
            <div className="font-bold">{unlocked.badge.name}</div>
          </div>
        </div>
      )}

      <Onboarding
        key={setupOpen ? 'rerun' : 'first'}
        open={!state.onboarded || setupOpen}
        state={state}
        today={today}
        onFinish={(next) => {
          setState(next)
          setSetupOpen(false)
          go('today')
        }}
      />
    </div>
  )
}
