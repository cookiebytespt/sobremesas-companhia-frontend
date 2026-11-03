'use client'

import { useState } from 'react'
import { Input, Label, Textarea } from '@/components/ui/input'
import type { LocalizedString } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const langs = ['pt', 'en', 'es', 'fr'] as const
type Lang = (typeof langs)[number]
const short: Record<Lang, string> = { pt: 'PT', en: 'EN', es: 'ES', fr: 'FR' }

export const emptyLocalized: LocalizedString = { pt: '' }

/** Drops empty translations so the API stores nulls, not blanks. */
export function cleanLocalized(value: LocalizedString): LocalizedString {
  const out: LocalizedString = { pt: value.pt.trim() }
  for (const l of ['en', 'es', 'fr'] as const) {
    const v = value[l]?.trim()
    if (v) out[l] = v
  }
  return out
}

/**
 * One field in four languages: Portuguese always visible (required), the others behind
 * PT · EN · ES · FR tabs with a dot on the ones still empty.
 */
export default function LocalizedTextInput({
  label,
  value,
  onChange,
  multiline = false,
  required = false,
  placeholder,
}: {
  label: string
  value: LocalizedString
  onChange: (value: LocalizedString) => void
  multiline?: boolean
  required?: boolean
  placeholder?: string
}) {
  const [lang, setLang] = useState<Lang>('pt')
  const Field = multiline ? Textarea : Input
  const current = lang === 'pt' ? value.pt : (value[lang] ?? '')

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Label className="mb-0">
          {label}
          {required && <span className="text-cacau/40"> *</span>}
        </Label>
        <div role="tablist" className="flex gap-0.5 rounded-lg bg-creme p-0.5">
          {langs.map((l) => {
            const filled = l === 'pt' ? Boolean(value.pt.trim()) : Boolean(value[l]?.trim())
            return (
              <button
                key={l}
                type="button"
                role="tab"
                aria-selected={lang === l}
                onClick={() => setLang(l)}
                className={cn('relative rounded-md px-2 py-0.5 text-[11px] font-semibold', lang === l ? 'bg-white text-cacau shadow-sm' : 'text-cacau/50 hover:text-cacau')}
              >
                {short[l]}
                {!filled && <span className={cn('absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full', l === 'pt' ? 'bg-[#b4534b]' : 'bg-po-fundo/70')} aria-hidden />}
              </button>
            )
          })}
        </div>
      </div>
      <Field
        value={current}
        placeholder={lang === 'pt' ? placeholder : value.pt || placeholder}
        required={required && lang === 'pt'}
        lang={lang}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [lang]: e.target.value })}
      />
    </div>
  )
}
