import { BADGES } from '../data/badges'
import type { ActivityMetric, AppState, BadgeProgress, WeeklyMetric } from '../types'
import { setActivity, setQuick } from './actions'
import { diffDays, weekKey } from './date'
import { dailyStreak } from './progress'

export type MissionGroup = 'start' | 'daily' | 'weekly'

export interface Mission {
  id: string
  group: MissionGroup
  icon: string
  title: string
  how: string
  done: boolean
  /** Done earlier this week, so it can't be toggled from today. */
  locked?: boolean
  note?: string
  feeds: string[]
  apply: (s: AppState, done: boolean) => AppState
}

const QUICK_MISSIONS: Record<string, { title: string; how: string }> = {
  'photo-finisher': { title: 'Upload a profile photo', how: 'Profile → Edit → add a clear photo → Save.' },
  'hello-world': { title: 'Fill in your About section', how: 'Profile → Edit → write 2–3 lines about what you\'re learning.' },
  'knowledge-seeker': { title: 'Read 10 different articles', how: 'Browse Builder Center and open 10 articles that interest you.' },
  'first-wish': { title: 'Post your first Wish', how: 'Open the Wishlist → + → describe something AWS should build. Ideas in the Toolkit.' },
}

const DAILY_MISSIONS: { metric: 'visit' | 'like' | 'comment'; icon: string; title: string; how: string }[] = [
  { metric: 'visit', icon: 'visit', title: 'Visit Builder Center', how: 'Sign in at builder.aws.com and read something.' },
  { metric: 'like', icon: 'like', title: 'Like a post', how: 'Like an article or comment you found useful.' },
  { metric: 'comment', icon: 'comment', title: 'Leave a thoughtful comment', how: 'End it with a question so the author replies. Prompts are in the Toolkit.' },
]

const WEEKLY_MISSIONS: { metric: WeeklyMetric; icon: string; title: string; how: string }[] = [
  { metric: 'vote', icon: 'vote', title: 'Vote on a Wish', how: 'Open the Wishlist and upvote an idea you agree with.' },
  { metric: 'publish', icon: 'publish', title: 'Publish this week\'s article', how: 'Short and useful beats long. Plan titles in the Toolkit.' },
]

function unearnedFeeding(progress: BadgeProgress[], match: (id: string) => boolean): string[] {
  return progress.filter((p) => !p.earned && match(p.badge.id)).map((p) => p.badge.name)
}

function metricBadges(metric: ActivityMetric): Set<string> {
  const ids = BADGES.filter((b) => (b.kind === 'streak' || b.kind === 'weekly') && b.metric === metric).map((b) => b.id)
  if (metric === 'comment') ids.push('discussion-debut')
  if (metric === 'publish') ids.push('first-article')
  return new Set(ids)
}

export function buildMissions(state: AppState, progress: BadgeProgress[], today: string): Mission[] {
  const earned = new Set(progress.filter((p) => p.earned).map((p) => p.badge.id))
  const log = state.daily[today] ?? {}
  const missions: Mission[] = []

  for (const [id, m] of Object.entries(QUICK_MISSIONS)) {
    const doneToday = state.quickOn[id] === today
    if (earned.has(id) && !doneToday) continue
    missions.push({
      id: `quick-${id}`,
      group: 'start',
      icon: id,
      title: m.title,
      how: m.how,
      done: earned.has(id),
      feeds: [BADGES.find((b) => b.id === id)!.name],
      apply: (s, done) => setQuick(s, id, done, today),
    })
  }

  for (const m of DAILY_MISSIONS) {
    const feeds = unearnedFeeding(progress, (id) => metricBadges(m.metric).has(id))
    if (feeds.length === 0 && !log[m.metric]) continue
    const streak = dailyStreak(state, m.metric, today)
    missions.push({
      id: `daily-${m.metric}`,
      group: 'daily',
      icon: m.icon,
      title: m.title,
      how: m.how,
      done: !!log[m.metric],
      note: streak.doneNow ? `🔥 ${streak.current}-day streak` : streak.current > 0 ? `🔥 ${streak.current} → ${streak.current + 1} days` : 'Starts your streak',
      feeds,
      apply: (s, done) => setActivity(s, today, m.metric, done),
    })
  }

  const wk = weekKey(today)
  const daysLeft = 6 - diffDays(wk, today)
  for (const m of WEEKLY_MISSIONS) {
    const feeds = unearnedFeeding(progress, (id) => metricBadges(m.metric).has(id))
    const doneOn = Object.keys(state.daily)
      .filter((k) => weekKey(k) === wk && state.daily[k]?.[m.metric])
      .sort()[0]
    if (feeds.length === 0 && !doneOn) continue
    missions.push({
      id: `weekly-${m.metric}`,
      group: 'weekly',
      icon: m.icon,
      title: m.title,
      how: m.how,
      done: !!doneOn,
      locked: !!doneOn && doneOn !== today,
      note: doneOn ? 'Done for this week' : daysLeft === 0 ? 'Last day this week!' : `${daysLeft + 1} days left this week`,
      feeds,
      apply: (s, done) => setActivity(s, today, m.metric, done),
    })
  }

  const rank = (m: Mission) => (m.group === 'daily' ? 0 : m.group === 'weekly' && daysLeft === 0 ? 1 : m.group === 'start' ? 2 : 3)
  return missions.sort((a, b) => rank(a) - rank(b))
}
