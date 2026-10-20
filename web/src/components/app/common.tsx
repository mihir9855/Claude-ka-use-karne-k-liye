import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { LH } from '@/engine/engine.js'

export function Logo({ height = 40, className }: { height?: number; className?: string }) {
  return <img src={LH.l} alt="Brihad Temple logo" style={{ height, width: 'auto' }} className={cn('select-none', className)} draggable={false} />
}

export function Avatar({ name, tone = 'primary', className }: { name: string; tone?: 'primary' | 'income' | 'expense' | 'saffron' | 'info'; className?: string }) {
  const t = {
    primary: 'bg-primary/10 text-primary',
    income: 'bg-income-soft text-income',
    expense: 'bg-expense-soft text-expense',
    saffron: 'bg-saffron-soft text-saffron',
    info: 'bg-info-soft text-info',
  }[tone]
  return <div className={cn('grid size-10 shrink-0 place-items-center rounded-full text-sm font-extrabold', t, className)}>{(name || '?').trim().charAt(0).toUpperCase()}</div>
}

export function EmptyState({ title, text, action }: { title?: string; text: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-4 py-10 text-center">
      <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 14 }}>
        <Logo height={72} />
      </motion.div>
      {title ? <h3 className="font-display mt-4 text-lg font-extrabold">{title}</h3> : null}
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-display text-lg font-extrabold">{children}</h2>
      {right}
    </div>
  )
}

/** Scales the engine's fixed-width paper HTML to fit its container. */
export function Paper({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const fit = () => {
      root.querySelectorAll<HTMLElement>('.vfit').forEach((w) => {
        const inn = w.firstElementChild as HTMLElement | null
        if (!inn) return
        const s = Math.min(1, w.clientWidth / (Number(inn.getAttribute('data-w')) || 720))
        inn.style.transformOrigin = 'top left'
        inn.style.transform = `scale(${s})`
        w.style.height = `${inn.offsetHeight * s}px`
      })
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(root)
    return () => ro.disconnect()
  }, [html])
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
