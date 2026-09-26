import type { Badge } from '../types'

export interface PhaseTheme {
  /** Gradient for earned medallions. */
  gradient: string
  text: string
  soft: string
  ring: string
  dot: string
}

export const PHASE_THEME: Record<Badge['phase'], PhaseTheme> = {
  1: { gradient: 'from-emerald-300 to-teal-500', text: 'text-emerald-300', soft: 'bg-emerald-400/10', ring: 'ring-emerald-400/40', dot: 'bg-emerald-400' },
  2: { gradient: 'from-amber-200 to-amber-500', text: 'text-amber-300', soft: 'bg-amber-400/10', ring: 'ring-amber-400/40', dot: 'bg-amber-400' },
  3: { gradient: 'from-orange-300 to-orange-600', text: 'text-orange-300', soft: 'bg-orange-400/10', ring: 'ring-orange-400/40', dot: 'bg-orange-400' },
  4: { gradient: 'from-sky-300 to-blue-600', text: 'text-sky-300', soft: 'bg-sky-400/10', ring: 'ring-sky-400/40', dot: 'bg-sky-400' },
  5: { gradient: 'from-pink-300 to-rose-600', text: 'text-rose-300', soft: 'bg-rose-400/10', ring: 'ring-rose-400/40', dot: 'bg-rose-400' },
  6: { gradient: 'from-violet-300 to-purple-700', text: 'text-violet-300', soft: 'bg-violet-400/10', ring: 'ring-violet-400/40', dot: 'bg-violet-400' },
}
