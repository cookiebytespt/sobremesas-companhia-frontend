'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Input, Label, Textarea } from '@/components/ui/input'
import type { LocalizedString } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const langs = ['pt', 'en', 'es', 'fr'] as const
type Lang = (typeof langs)[number]
const short: Record<Lang, string> = { pt: 'PT', en: 'EN', es: 'ES', fr: 'FR' }
const names: Record<Lang, string> = { pt: 'Português', en: 'English', es: 'Español', fr: 'Français' }

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
 * One field in four languages: Portuguese shown by default (required), the others behind a
 * compact language dropdown. A dot on the trigger flags missing translations; the menu shows
 * which ones are filled.
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
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const isFilled = (l: Lang) => (l === 'pt' ? Boolean(value.pt.trim()) : Boolean(value[l]?.trim()))
  const missing = langs.filter((l) => !isFilled(l)).length

  // Close on outside click or Escape. Escape is swallowed so it closes only the menu,
  // not the surrounding <dialog>.
  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey, true)
    }
  }, [open])
  const Field = multiline ? Textarea : Input
  const current = lang === 'pt' ? value.pt : (value[lang] ?? '')

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Label className="mb-0">
          {label}
          {required && <span className="text-cacau/40"> *</span>}
        </Label>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-label={`Idioma: ${names[lang]}`}
            onClick={() => setOpen((o) => !o)}
            className="relative flex items-center gap-1 rounded-md bg-creme px-2 py-0.5 text-[11px] font-semibold text-cacau hover:bg-linha"
          >
            {short[lang]}
            <ChevronDown className={cn('h-3 w-3 text-cacau/50 transition-transform', open && 'rotate-180')} aria-hidden />
            {missing > 0 && (
              <span
                className={cn('absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full', isFilled('pt') ? 'bg-po-fundo/70' : 'bg-[#b4534b]')}
                title={`${missing} ${missing === 1 ? 'tradução em falta' : 'traduções em falta'}`}
                aria-hidden
              />
            )}
          </button>
          {open && (
            <ul
              id={listId}
              role="listbox"
              aria-label="Idioma"
              className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-linha bg-white p-1 shadow-lg animate-fade-in"
            >
              {langs.map((l) => (
                <li key={l}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={lang === l}
                    onClick={() => {
                      setLang(l)
                      setOpen(false)
                    }}
                    className={cn('flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm', lang === l ? 'bg-creme text-cacau' : 'text-cacau/80 hover:bg-creme/60')}
                  >
                    <span className="w-6 text-[11px] font-semibold text-cacau/50">{short[l]}</span>
                    <span className="flex-1">{names[l]}</span>
                    {isFilled(l) ? (
                      <Check className="h-3.5 w-3.5 text-cacau/40" aria-label="preenchido" />
                    ) : (
                      <span className={cn('text-[11px]', l === 'pt' ? 'text-[#b4534b]' : 'text-cacau/40')}>em falta</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
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
