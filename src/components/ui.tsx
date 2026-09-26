import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { cx } from '../lib/cx'

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx('card rounded-3xl p-5 sm:p-6', className)}>{children}</section>
}

export function SectionTitle({ children, hint, right }: { children: ReactNode; hint?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold tracking-tight">{children}</h2>
        {hint && <p className="mt-0.5 text-sm text-slate-400">{hint}</p>}
      </div>
      {right}
    </div>
  )
}

export function ProgressBar({ value, max, className, tone = 'aws' }: { value: number; max: number; className?: string; tone?: 'aws' | 'emerald' }) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100)
  return (
    <div className={cx('h-2 w-full overflow-hidden rounded-full bg-white/[0.07]', className)}>
      <div
        className={cx(
          'h-full rounded-full transition-[width] duration-700 ease-out',
          tone === 'aws' ? 'bg-linear-to-r from-aws to-amber-300' : 'bg-linear-to-r from-emerald-400 to-teal-300',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function Ring({
  value,
  max,
  size = 64,
  stroke = 7,
  children,
  color = '#ff9900',
}: {
  value: number
  max: number
  size?: number
  stroke?: number
  children?: ReactNode
  color?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = max === 0 ? 0 : Math.min(1, value / max)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgb(255 255 255 / 0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

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
  variant?: ButtonVariant
  className?: string
  disabled?: boolean
  title?: string
  type?: 'button' | 'submit'
}) {
  const styles: Record<ButtonVariant, string> = {
    primary: 'bg-linear-to-r from-aws to-amber-400 text-ink font-semibold shadow-lg shadow-aws/25 hover:brightness-110',
    secondary: 'bg-white/[0.07] text-slate-100 ring-1 ring-white/10 hover:bg-white/[0.12]',
    ghost: 'text-slate-300 hover:bg-white/[0.07] hover:text-white',
    danger: 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20 hover:bg-rose-500/20',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40',
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
    <div className="inline-flex items-center rounded-xl bg-white/[0.06] ring-1 ring-white/10">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="h-8 w-8 rounded-l-xl text-lg leading-none text-slate-300 hover:bg-white/10 disabled:opacity-30"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="min-w-8 text-center text-sm font-bold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="h-8 w-8 rounded-r-xl text-lg leading-none text-slate-300 hover:bg-white/10"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  )
}

export function Modal({ open, onClose, children, wide }: { open: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="animate-fade absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cx(
          'animate-rise card relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl p-6 sm:rounded-3xl',
          wide ? 'sm:max-w-2xl' : 'sm:max-w-md',
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}
