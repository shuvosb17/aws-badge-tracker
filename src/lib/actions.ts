import type { ActivityMetric, AppState, DailyMetric, WeeklyMetric } from '../types'
import { addDays, weekKey } from './date'

export type Update = (fn: (s: AppState) => AppState) => void

export function setActivity(s: AppState, date: string, metric: ActivityMetric, value: boolean): AppState {
  const day = { ...s.daily[date], [metric]: value }
  const daily = { ...s.daily, [date]: day }
  if (!Object.values(day).some(Boolean)) delete daily[date]
  const startDate = value && (!s.startDate || date < s.startDate) ? date : s.startDate
  return { ...s, daily, startDate }
}

export function setQuick(s: AppState, badgeId: string, value: boolean, today: string): AppState {
  const quickOn = { ...s.quickOn }
  if (value) quickOn[badgeId] = today
  else delete quickOn[badgeId]
  return { ...s, quick: { ...s.quick, [badgeId]: value }, quickOn }
}

/** Mark the last `days` days as active for a metric, ending today or yesterday. */
export function backfillDaily(s: AppState, metric: DailyMetric, days: number, today: string, includesToday: boolean): AppState {
  const end = includesToday ? today : addDays(today, -1)
  let next = s
  for (let i = 0; i < days; i++) next = setActivity(next, addDays(end, -i), metric, true)
  return next
}

/** Mark the last `weeks` weeks as active for a weekly metric, using each week's Monday (or today for this week). */
export function backfillWeekly(s: AppState, metric: WeeklyMetric, weeks: number, today: string, includesThisWeek: boolean): AppState {
  const thisWeek = weekKey(today)
  let next = s
  for (let i = 0; i < weeks; i++) {
    const offset = includesThisWeek ? i : i + 1
    const day = offset === 0 ? today : addDays(thisWeek, -7 * offset)
    next = setActivity(next, day, metric, true)
  }
  return next
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}
