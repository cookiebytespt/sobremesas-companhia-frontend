'use client'

import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

/** Debounced search box bound to a URL param value. */
export default function SearchInput({
  value,
  onChange,
  placeholder = 'Pesquisar…',
  delay = 350,
  className,
}: {
  value: string | undefined
  onChange: (value: string | undefined) => void
  placeholder?: string
  delay?: number
  className?: string
}) {
  const [text, setText] = useState(value ?? '')

  useEffect(() => setText(value ?? ''), [value])

  useEffect(() => {
    const trimmed = text.trim()
    if (trimmed === (value ?? '')) return
    const t = setTimeout(() => onChange(trimmed || undefined), delay)
    return () => clearTimeout(t)
  }, [text, value, onChange, delay])

  return (
    <div className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cacau/40" aria-hidden />
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="pl-9 pr-8" aria-label={placeholder} />
        {text && (
          <button
            type="button"
            onClick={() => {
              setText('')
              onChange(undefined)
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-cacau/40 hover:text-cacau"
            aria-label="Limpar pesquisa"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
