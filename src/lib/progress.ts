import { BADGES, MILESTONES } from '../data/badges'
import type { ActivityMetric, AppState, BadgeProgress, CommunityMetric, DailyMetric, WeeklyMetric } from '../types'
import { addDays, diffDays, weekKey } from './date'

export interface StreakStats {
  current: number
  longest: number
  doneNow: boolean
}

function activeKeys(state: AppState, metric: ActivityMetric): string[] {
  return Object.keys(state.daily)
    .filter((k) => state.daily[k]?.[metric])
    .sort()
}

function runs(sortedKeys: string[], step: number): number {
  let longest = 0
  let run = 0
  let prev: string | null = null
  for (const k of sortedKeys) {
    run = prev !== null && diffDays(prev, k) === step ? run + 1 : 1
    longest = Math.max(longest, run)
    prev = k
  }
  return longest
}

/** A streak stays alive through today even if today's activity isn't logged yet. */
function currentRun(done: Set<string>, now: string, step: number): { current: number; doneNow: boolean } {
  const doneNow = done.has(now)
  let cursor = doneNow ? now : addDays(now, -step)
  let current = 0
  while (done.has(cursor)) {
    current++
    cursor = addDays(cursor, -step)
  }
  return { current, doneNow }
}

export function dailyStreak(state: AppState, metric: DailyMetric, today: string): StreakStats {
  const keys = activeKeys(state, metric)
  return { ...currentRun(new Set(keys), today, 1), longest: runs(keys, 1) }
}

export function weeklyStreak(state: AppState, metric: WeeklyMetric, today: string): StreakStats {
  const weeks = [...new Set(activeKeys(state, metric).map(weekKey))].sort()
  return { ...currentRun(new Set(weeks), weekKey(today), 7), longest: runs(weeks, 7) }
}

export function articlesWithTenLikes(state: AppState): number {
  return state.articles.filter((a) => a.status === 'published' && a.likes >= 10).length
}

export function communityValue(state: AppState, metric: CommunityMetric): number {
  const manual = state.community[metric] ?? 0
  return metric === 'articlesWith10Likes' ? Math.max(manual, articlesWithTenLikes(state)) : manual
}

function hasAny(state: AppState, metric: ActivityMetric): boolean {
  return Object.values(state.daily).some((d) => d?.[metric])
}

export function computeProgress(state: AppState, today: string): BadgeProgress[] {
  return BADGES.map((badge): BadgeProgress => {
    const manual = !!state.manualEarned[badge.id]

    switch (badge.kind) {
      case 'quick': {
        const earned = manual || !!state.quick[badge.id] || (!!badge.autoFrom && hasAny(state, badge.autoFrom))
        return { badge, current: earned ? 1 : 0, target: 1, earned, eta: earned ? null : today }
      }
      case 'streak': {
        const s = dailyStreak(state, badge.metric, today)
        const earned = manual || s.longest >= badge.target
        const remaining = badge.target - s.current - (s.doneNow ? 0 : 1)
        return {
          badge,
          current: earned ? badge.target : s.current,
          target: badge.target,
          earned,
          eta: earned ? null : addDays(today, remaining),
        }
      }
      case 'weekly': {
        const s = weeklyStreak(state, badge.metric, today)
        const earned = manual || s.longest >= badge.target
        const remaining = badge.target - s.current - (s.doneNow ? 0 : 1)
        return {
          badge,
          current: earned ? badge.target : s.current,
          target: badge.target,
          earned,
          eta: earned ? null : addDays(weekKey(today), remaining * 7),
        }
      }
      case 'community': {
        const value = communityValue(state, badge.metric)
        const earned = manual || value >= badge.target
        return { badge, current: Math.min(value, badge.target), target: badge.target, earned, eta: null }
      }
    }
  })
}

export interface MilestoneStatus {
  badges: number
  reward: string
  short: string
  achieved: boolean
  /** Earliest possible date, or null when it depends on community badges. */
  eta: string | null
  needsCommunity: boolean
}

export function milestoneStatus(progress: BadgeProgress[]): MilestoneStatus[] {
  const earnedCount = progress.filter((p) => p.earned).length
  const etas = progress
    .filter((p) => !p.earned && p.eta)
    .map((p) => p.eta as string)
    .sort()

  return MILESTONES.map((m) => {
    const achieved = earnedCount >= m.badges
    const needed = m.badges - earnedCount
    const eta = achieved ? null : needed <= etas.length ? etas[needed - 1] : null
    return { ...m, achieved, eta, needsCommunity: !achieved && eta === null }
  })
}
