import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const NONE = '__none'

/** A select that allows "no choice" (empty string) with a custom label. */
export function Pick({ value, onChange, items, none, placeholder }: { value: string; onChange: (v: string) => void; items: [string, string][]; none?: string; placeholder?: string }) {
  return (
    <Select value={value || (none ? NONE : '')} onValueChange={(v) => onChange(v === NONE ? '' : v)}>
      <SelectTrigger className="h-11 w-full rounded-xl bg-background">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {none ? <SelectItem value={NONE}>{none}</SelectItem> : null}
        {items.map(([v, l]) => (
          <SelectItem key={v} value={v}>{l}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
