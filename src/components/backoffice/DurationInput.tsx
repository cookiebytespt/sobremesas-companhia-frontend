'use client'

import { useState } from 'react'
import { Input, Label, Select } from '@/components/ui/input'

/**
 * Production time stored in hours, edited in days (half-day steps) or hours — the rule the plan
 * settled on: hours in the backend, days/half-days in the UI. Empty = "use the default".
 */
export default function DurationInput({
  label,
  value,
  onChange,
  hint,
  placeholder = 'Predefinição',
  id,
}: {
  label: string
  value: number | null
  onChange: (hours: number | null) => void
  hint?: string
  placeholder?: string
  id: string
}) {
  const [unit, setUnit] = useState<'d' | 'h'>(value !== null && value % 24 !== 0 && value % 12 !== 0 ? 'h' : 'd')
  const shown = value === null ? '' : unit === 'd' ? String(value / 24) : String(value)

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={unit === 'd' ? 0.5 : 1}
          value={shown}
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value
            if (raw === '') return onChange(null)
            const n = Number(raw)
            if (Number.isNaN(n) || n < 0) return
            onChange(Math.round(unit === 'd' ? n * 24 : n))
          }}
          className="w-28"
        />
        <Select value={unit} onChange={(e) => setUnit(e.target.value as 'd' | 'h')} className="w-28" aria-label="Unidade">
          <option value="d">dias</option>
          <option value="h">horas</option>
        </Select>
      </div>
      {hint && <p className="mt-1 text-xs text-cacau/50">{hint}</p>}
    </div>
  )
}
