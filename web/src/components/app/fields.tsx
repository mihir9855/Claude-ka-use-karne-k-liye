import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function Field({ label, hint, children, className }: { label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn('mt-4 grid gap-1.5', className)}>
      <Label className="text-[13px] font-semibold text-muted-foreground">{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

type TextProps = Omit<React.ComponentProps<'input'>, 'onChange'> & { value: string; onChange: (v: string) => void }
export function TextInput({ value, onChange, className, ...rest }: TextProps) {
  return <Input value={value ?? ''} onChange={(e) => onChange(e.target.value)} autoComplete="off" className={cn('h-11 rounded-xl bg-background', className)} {...rest} />
}

export function MoneyInput({ value, onChange, placeholder = '0', autoFocus }: { value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean }) {
  const n = String(value ?? '').replace(/[^0-9]/g, '')
  const shown = n ? Number(n).toLocaleString('en-IN') : ''
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground">₹</span>
      <Input
        autoFocus={autoFocus}
        inputMode="numeric"
        value={shown}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
        autoComplete="off"
        className="tn h-14 rounded-xl bg-background pl-9 text-2xl font-extrabold tracking-tight"
      />
    </div>
  )
}

export function Chips<T extends string>({ options, value, onChange, className }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="group">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            'rounded-full border px-3.5 py-2 text-sm font-semibold transition active:scale-95',
            value === o.value ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'bg-background text-foreground hover:bg-muted',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function FormError({ msg }: { msg: string }) {
  return <p role="alert" className={cn('mt-3 min-h-5 text-sm font-semibold text-expense', !msg && 'invisible')}>{msg || '.'}</p>
}
