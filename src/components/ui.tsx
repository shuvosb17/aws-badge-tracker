import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-2xl border border-white/10 bg-ink-2/80 p-5 shadow-xl shadow-black/20 backdrop-blur', className)}>
      {children}
    </section>
  )
}

export function CardTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">{children}</h2>
      {right}
    </div>
  )
}

export function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100)
  return (
    <div className={cx('h-2 w-full overflow-hidden rounded-full bg-white/10', className)}>
      <div
        className="h-full rounded-full bg-linear-to-r from-aws to-amber-300 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function Ring({ value, max, size = 168, children }: { value: number; max: number; size?: number; children?: ReactNode }) {
  const stroke = 12
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = max === 0 ? 0 : Math.min(1, value / max)
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-white/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff9900" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

export function Button({
  children,
  onClick,
  variant = 'secondary',
  className,
  disabled,
  title,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  className?: string
  disabled?: boolean
  title?: string
  type?: 'button' | 'submit'
}) {
  const styles = {
    primary: 'bg-aws text-ink font-semibold hover:bg-amber-400',
    secondary: 'bg-white/10 text-slate-100 hover:bg-white/15',
    ghost: 'text-slate-300 hover:bg-white/10 hover:text-white',
    danger: 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-40',
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-white/10">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="px-2.5 py-1 text-slate-300 hover:bg-white/10 disabled:opacity-30"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="min-w-8 px-1 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="px-2.5 py-1 text-slate-300 hover:bg-white/10"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}
