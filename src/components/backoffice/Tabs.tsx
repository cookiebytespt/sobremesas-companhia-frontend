'use client'

import { cn } from '@/lib/utils'

export interface TabItem<K extends string> {
  key: K
  label: string
  count?: number
}

/** Segmented tabs used for the quick filters at the top of list pages. */
export default function Tabs<K extends string>({ items, value, onChange }: { items: TabItem<K>[]; value: K; onChange: (key: K) => void }) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1 rounded-xl bg-creme p-1">
      {items.map((item) => {
        const active = item.key === value
        return (
          <button
            key={item.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              active ? 'bg-white text-cacau shadow-sm' : 'text-cacau/60 hover:text-cacau'
            )}
          >
            {item.label}
            {item.count !== undefined && <span className="ml-1.5 text-xs tabular-nums text-cacau/50">{item.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
