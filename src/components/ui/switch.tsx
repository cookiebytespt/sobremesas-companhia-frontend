'use client'

import { cn } from '@/lib/utils'

/** Accessible toggle (role=switch) with an inline label. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  id,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  id?: string
}) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', disabled && 'cursor-not-allowed opacity-60')}>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cacau/30',
          checked ? 'bg-cacau' : 'bg-linha'
        )}
      >
        {/* `left-0.5` matters: with left/right auto the knob falls back to its static
            position, which a button centres (UA `text-align: center`), so it sat mid-track
            when off and overflowed the right edge when on. Anchored at a 2px inset, the
            16px travel lands it flush against the opposite edge: 36 − 2 − 16 − 2 = 16. */}
        <span
          className={cn(
            'pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
      <span>
        <span className="block text-sm font-medium text-cacau">{label}</span>
        {description && <span className="block text-xs text-cacau/50">{description}</span>}
      </span>
    </label>
  )
}
