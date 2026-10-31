import type { ReactNode } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onClose: () => void
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

/** Bottom sheet on phones, centred dialog on larger screens. */
export function Sheet({ open, onClose, title, subtitle, children, footer, wide }: Props) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'fixed z-50 flex flex-col bg-card text-card-foreground shadow-2xl outline-none',
            'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-3xl animate-[sheet-up_.3s_cubic-bezier(.2,.8,.2,1)]',
            'md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:max-h-[90dvh] md:animate-[sheet-pop_.2s_ease-out]',
            wide ? 'md:w-[min(94vw,46rem)]' : 'md:w-[min(94vw,34rem)]',
          )}
        >
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border md:hidden" />
          <div className="flex shrink-0 items-start justify-between gap-3 px-5 pb-2 pt-3">
            <div className="min-w-0">
              <DialogPrimitive.Title className="font-display text-xl font-extrabold leading-tight">{title}</DialogPrimitive.Title>
              {subtitle ? <div className="mt-0.5 text-sm text-muted-foreground">{subtitle}</div> : null}
            </div>
            <DialogPrimitive.Close className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Close">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>
          {footer ? <div className="shrink-0 border-t bg-card px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">{footer}</div> : <div className="h-[env(safe-area-inset-bottom)]" />}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
