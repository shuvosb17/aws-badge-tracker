import type { DayBoundary } from '../types'

const pad = (n: number) => String(n).padStart(2, '0')

function fromUtcParts(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

export function toKey(date: Date, boundary: DayBoundary): string {
  if (boundary === 'utc') return fromUtcParts(date)
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function todayKey(boundary: DayBoundary): string {
  return toKey(new Date(), boundary)
}

/** Keys are calendar dates; arithmetic is done in UTC so DST never shifts a day. */
export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function addDays(key: string, days: number): string {
  const d = parseKey(key)
  d.setUTCDate(d.getUTCDate() + days)
  return fromUtcParts(d)
}

export function diffDays(from: string, to: string): number {
  return Math.round((parseKey(to).getTime() - parseKey(from).getTime()) / 86_400_000)
}

/** Monday of the ISO week containing the given day. */
export function weekKey(key: string): string {
  const dow = (parseKey(key).getUTCDay() + 6) % 7
  return addDays(key, -dow)
}

export function formatKey(key: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }): string {
  return parseKey(key).toLocaleDateString(undefined, { ...opts, timeZone: 'UTC' })
}

export function msUntilDayEnd(boundary: DayBoundary): number {
  const now = new Date()
  const end = new Date(now)
  if (boundary === 'utc') end.setUTCHours(24, 0, 0, 0)
  else end.setHours(24, 0, 0, 0)
  return end.getTime() - now.getTime()
}

export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60_000))
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
