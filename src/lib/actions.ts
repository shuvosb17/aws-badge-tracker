import type { ActivityMetric, AppState } from '../types'

export type Update = (fn: (s: AppState) => AppState) => void

export function setActivity(s: AppState, date: string, metric: ActivityMetric, value: boolean): AppState {
  const day = { ...s.daily[date], [metric]: value }
  const daily = { ...s.daily, [date]: day }
  if (!Object.values(day).some(Boolean)) delete daily[date]
  const startDate = value && (!s.startDate || date < s.startDate) ? date : s.startDate
  return { ...s, daily, startDate }
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}
