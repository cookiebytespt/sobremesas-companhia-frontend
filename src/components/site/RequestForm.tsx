'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, X } from 'lucide-react'
import PhotoDropzone from '@/components/backoffice/PhotoDropzone'
import { serviceIcons, whatsappUrl } from '@/content/site'
import { fmt, getDictionary, type Locale } from '@/i18n'
import { api } from '@/lib/api/client'
import { isApiError } from '@/lib/api/errors'
import { ALLERGENS, type DeliveryMode, type Occasion, type OrderItemInput, type Service, type Upload } from '@/lib/api/types'
import { localizedPath } from '@/lib/locale'
import { isEmail, isPhone } from '@/lib/site/contact'
import { cn } from '@/lib/utils'
import { Chip, SiteField, SiteInput, SiteTextarea, Tile } from './fields'
import { Icon } from './Icon'

const MAX_PHOTOS = 10
const STEPS = 4
const DRAFT_KEY = 'sc:request-draft'
const OTHER = '__other'

type Line = { key: string; serviceId: string; offerItemId?: string; label?: string; quantity: string; notes: string }
type Draft = {
  occasionId: string; occasionOther: string; eventDate: string; eventTime: string; guests: string; lines: Line[]
  deliveryMode: DeliveryMode | ''; address: { line1: string; line2: string; postalCode: string; city: string; notes: string }
  allergies: string[]; dietaryNotes: string; message: string; photos: Upload[]; name: string; email: string; phone: string
}
const emptyDraft: Draft = {
  occasionId: '', occasionOther: '', eventDate: '', eventTime: '', guests: '', lines: [], deliveryMode: '',
  address: { line1: '', line2: '', postalCode: '', city: '', notes: '' }, allergies: [], dietaryNotes: '', message: '', photos: [],
  name: '', email: '', phone: '',
}

function readDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    return raw ? { ...emptyDraft, ...(JSON.parse(raw) as Partial<Draft>) } : null
  } catch {
    return null
  }
}

/**
 * The public request, one question at a time — most visitors are on a phone. Four steps (event,
 * what, details, contact) with a sticky Back/Continue bar, the phone's back button stepping back,
 * and the draft kept in this tab (sessionStorage) so a reload or a detour to WhatsApp loses nothing.
 * Visitors stay anonymous: a mobile number or an e-mail (at least one) is how we reach them; every
 * request becomes an order in the backoffice either way.
 */
export function RequestForm({ locale, occasions, services, presetOccasion, presetService }: { locale: Locale; occasions: Occasion[]; services: Service[]; presetOccasion?: string; presetService?: string }) {
  const t = getDictionary(locale).request
  const router = useRouter()
  const top = useRef<HTMLDivElement>(null)

  const initial = useMemo<Draft>(() => {
    const preset = services.find((s) => s.slug === presetService)
    return {
      ...emptyDraft,
      occasionId: occasions.find((o) => o.slug === presetOccasion)?.id ?? '',
      lines: preset ? [{ key: `${preset.id}:${preset.items.length === 0 ? 'other' : '__pick'}`, serviceId: preset.id, quantity: '', notes: '' }] : [],
    }
  }, [occasions, services, presetOccasion, presetService])

  const [d, setD] = useState<Draft>(initial)
  const [step, setStep] = useState(0)
  const [restored, setRestored] = useState(false)
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touchedContact, setTouchedContact] = useState(false)
  const set = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => setD((x) => ({ ...x, [key]: value })), [])

  // Restore a draft from this tab (unless the link asked for something specific).
  useEffect(() => {
    if (presetOccasion || presetService) return
    const saved = readDraft()
    if (saved && JSON.stringify(saved) !== JSON.stringify(emptyDraft)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-off hydration from sessionStorage
      setD(saved)
      setRestored(true)
    }
  }, [presetOccasion, presetService])
  useEffect(() => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)) } catch { /* private mode: no draft */ }
  }, [d])

  // The phone's back button goes to the previous step instead of leaving the form.
  useEffect(() => {
    history.replaceState({ ...history.state, rfStep: 0 }, '')
    const onPop = (e: PopStateEvent) => setStep(typeof e.state?.rfStep === 'number' ? e.state.rfStep : 0)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const goTo = (next: number) => {
    if (next > step) history.pushState({ ...history.state, rfStep: next }, '')
    else if (next < step && history.state?.rfStep === step) { history.back(); return }
    setStep(next)
  }
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  // --- services & items
  const selectedServices = useMemo(() => new Set(d.lines.map((l) => l.serviceId)), [d.lines])
  const toggleService = (s: Service) =>
    set('lines', selectedServices.has(s.id)
      ? d.lines.filter((l) => l.serviceId !== s.id)
      : [...d.lines, { key: `${s.id}:${s.items.length === 0 ? 'other' : '__pick'}`, serviceId: s.id, quantity: '', notes: '' }])
  const toggleItem = (s: Service, offerItemId?: string) => {
    const key = `${s.id}:${offerItemId ?? 'other'}`
    const exists = d.lines.some((l) => l.key === key)
    let next = d.lines.filter((l) => l.key !== key && l.key !== `${s.id}:__pick`)
    if (!exists) next = [...next, { key, serviceId: s.id, offerItemId, quantity: '', notes: '' }]
    else if (!next.some((l) => l.serviceId === s.id)) next = [...next, { key: `${s.id}:__pick`, serviceId: s.id, quantity: '', notes: '' }]
    set('lines', next)
  }
  const updateLine = (key: string, patch: Partial<Line>) => set('lines', d.lines.map((l) => (l.key === key ? { ...l, ...patch } : l)))

  // --- contact
  const email = d.email.trim()
  const phone = d.phone.trim()
  const emailOk = !email || isEmail(email)
  const phoneOk = !phone || isPhone(phone)
  const contactOk = (email || phone) && emailOk && phoneOk
  const canSubmit = d.name.trim().length > 0 && Boolean(contactOk)

  const submit = async () => {
    setTouchedContact(true)
    if (!canSubmit) return
    setBusy(true); setError(null)
    const items: OrderItemInput[] = d.lines
      .filter((l) => !l.key.endsWith(':__pick'))
      .map((l) => ({
        serviceId: l.serviceId,
        offerItemId: l.offerItemId,
        label: l.offerItemId ? undefined : l.label?.trim() || undefined,
        quantity: l.quantity ? Number(l.quantity) : undefined,
        notes: l.notes.trim() || undefined,
      }))
    // A service picked without choosing an item still says what they want.
    for (const sid of selectedServices) if (!items.some((i) => i.serviceId === sid)) items.push({ serviceId: sid })
    const otherOccasion = d.occasionId === OTHER || !d.occasionId
    try {
      const created = await api.orders.create({
        name: d.name.trim(), email: email || undefined, phone: phone || undefined,
        occasionId: otherOccasion ? undefined : d.occasionId, occasionOther: otherOccasion ? d.occasionOther.trim() || undefined : undefined,
        eventDate: d.eventDate || undefined, eventTime: d.eventTime || undefined, guests: d.guests ? Number(d.guests) : undefined,
        message: d.message.trim() || undefined, items,
        deliveryMode: d.deliveryMode || undefined,
        addressLine1: d.address.line1.trim() || undefined, addressLine2: d.address.line2.trim() || undefined,
        postalCode: d.address.postalCode.trim() || undefined, city: d.address.city.trim() || undefined, addressNotes: d.address.notes.trim() || undefined,
        allergies: d.allergies, dietaryNotes: d.dietaryNotes.trim() || undefined,
        uploadIds: d.photos.map((p) => p.id), website,
      })
      try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* ignore */ }
      const qs = new URLSearchParams({ number: created.number })
      if (created.email) qs.set('email', created.email)
      if (created.phone) qs.set('phone', created.phone)
      router.push(`${localizedPath(locale, '/request/sent')}?${qs}`)
    } catch (err) {
      setError(isApiError(err) && err.code === 'auth.too_many_requests' ? t.errorTooMany : isApiError(err) && err.status < 500 && err.reason ? err.reason : t.errorGeneric)
      setBusy(false)
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const needsAddress = d.deliveryMode === 'delivery' || d.deliveryMode === 'on_site'
  const occasionName = d.occasionId && d.occasionId !== OTHER ? occasions.find((o) => o.id === d.occasionId)?.name : d.occasionOther.trim() || null
  const chosen = services.filter((s) => selectedServices.has(s.id)).map((s) => {
    const names = d.lines.filter((l) => l.serviceId === s.id && !l.key.endsWith(':__pick')).map((l) => {
      const n = l.offerItemId ? s.items.find((i) => i.id === l.offerItemId)?.name : l.label?.trim() || t.other
      return l.quantity ? `${n} ×${l.quantity}` : n
    })
    return names.length ? `${s.name}: ${names.join(', ')}` : s.name
  })

  return (
    <div ref={top} className="scroll-mt-4">
      {/* Progress */}
      <div className="mb-8">
        <p className="text-sm text-cacau-suave">{fmt(t.stepOf, { n: step + 1, total: STEPS })} · <span className="font-medium text-cacau">{t.steps[step]}</span></p>
        <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden>
          {t.steps.map((label, i) => (
            <button key={label} type="button" tabIndex={-1} onClick={() => i < step && goTo(i)} className={cn('h-1.5 rounded-full transition-colors', i <= step ? 'bg-cacau' : 'bg-cacau/15', i < step && 'cursor-pointer')} />
          ))}
        </div>
      </div>

      {restored && step === 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-po/50 px-4 py-3 text-sm">
          <span>{t.draftRestored}</span>
          <button type="button" onClick={() => { setD(initial); setRestored(false) }} className="font-medium underline underline-offset-4">{t.startOver}</button>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); if (step < STEPS - 1) goTo(step + 1); else void submit() }} className="md:pb-4">
        {step === 0 && (
          <div className="space-y-8">
            <Question title={t.occasionQuestion}>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
                {occasions.map((o) => (
                  <Tile key={o.id} on={d.occasionId === o.id} onClick={() => set('occasionId', d.occasionId === o.id ? '' : o.id)} icon={o.icon ?? 'whisk'} label={o.name} />
                ))}
                <Tile on={d.occasionId === OTHER} onClick={() => set('occasionId', d.occasionId === OTHER ? '' : OTHER)} icon="whisk" label={t.occasionOther} />
              </div>
              {d.occasionId === OTHER && (
                <SiteField label={t.occasionOther} htmlFor="occasion-other" className="mt-4">
                  <SiteInput id="occasion-other" autoFocus value={d.occasionOther} onChange={(e) => set('occasionOther', e.target.value)} placeholder={t.occasionOtherPlaceholder} />
                </SiteField>
              )}
            </Question>
            <Question title={t.whenQuestion}>
              <div className="grid gap-4 sm:grid-cols-3">
                <SiteField label={t.date} htmlFor="date"><SiteInput id="date" type="date" min={today} value={d.eventDate} onChange={(e) => set('eventDate', e.target.value)} /></SiteField>
                <SiteField label={t.time} htmlFor="time"><SiteInput id="time" type="time" value={d.eventTime} onChange={(e) => set('eventTime', e.target.value)} /></SiteField>
                <SiteField label={t.guests} htmlFor="guests"><SiteInput id="guests" type="number" min={1} max={5000} inputMode="numeric" enterKeyHint="next" value={d.guests} onChange={(e) => set('guests', e.target.value)} /></SiteField>
              </div>
            </Question>
          </div>
        )}

        {step === 1 && (
          <Question title={t.servicesQuestion} hint={t.whatHint}>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {services.map((s) => (
                <Tile key={s.id} on={selectedServices.has(s.id)} onClick={() => toggleService(s)} icon={s.icon ?? serviceIcons[s.slug] ?? 'whisk'} label={s.name} />
              ))}
            </div>
            {selectedServices.size === 0 && <p className="mt-4 text-sm text-cacau-suave">{t.servicesSkip}</p>}
            <div className="mt-6 space-y-4">
              {services.filter((s) => selectedServices.has(s.id) && s.items.length > 0).map((s) => (
                <fieldset key={s.id} className="rounded-2xl border border-cacau/15 bg-acucar p-2 sm:p-3">
                  <legend className="px-2 font-display text-lg">{s.name}</legend>
                  <ul className="divide-y divide-cacau/10">
                    {[...s.items.map((i) => ({ id: i.id as string | undefined, name: i.name, description: i.description })), { id: undefined, name: t.other, description: null }].map((item) => {
                      const line = d.lines.find((l) => l.serviceId === s.id && (item.id ? l.offerItemId === item.id : l.key.endsWith(':other')))
                      return (
                        <li key={item.id ?? 'other'} className={cn('rounded-xl', line && 'bg-po/25')}>
                          <label className="flex min-h-12 cursor-pointer items-center gap-3 px-2 py-2.5">
                            <input type="checkbox" checked={Boolean(line)} onChange={() => toggleItem(s, item.id)} className="h-5 w-5 shrink-0 accent-cacau" />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[0.98rem]">{item.name}</span>
                              {item.description && <span className="block text-sm text-cacau-suave">{item.description}</span>}
                            </span>
                          </label>
                          {line && (
                            <div className="grid gap-2 px-2 pb-3 pl-10 sm:grid-cols-[1fr_auto]">
                              {!item.id && <SiteInput value={line.label ?? ''} onChange={(e) => updateLine(line.key, { label: e.target.value })} placeholder={t.otherPlaceholder} className="sm:col-span-2" />}
                              <SiteInput value={line.notes} onChange={(e) => updateLine(line.key, { notes: e.target.value })} placeholder={t.itemNotes} />
                              {s.allowQuantities && (
                                <Stepper value={line.quantity} step={s.quantityUnit === 'pessoas' ? 1 : 5} unit={s.quantityUnit} label={t.quantity} onChange={(q) => updateLine(line.key, { quantity: q })} />
                              )}
                            </div>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </fieldset>
              ))}
            </div>
          </Question>
        )}

        {step === 2 && (
          <div className="space-y-10">
            <Question title={t.sectionDelivery}>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {(['delivery', 'pickup', 'on_site'] as DeliveryMode[]).map((m) => (
                  <Chip key={m} on={d.deliveryMode === m} onClick={() => set('deliveryMode', d.deliveryMode === m ? '' : m)} className="justify-center rounded-2xl py-3">
                    {t[`delivery_${m}` as const]}
                  </Chip>
                ))}
              </div>
              {needsAddress && (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <SiteField label={t.address} htmlFor="addr1" className="sm:col-span-2"><SiteInput id="addr1" autoComplete="address-line1" value={d.address.line1} onChange={(e) => set('address', { ...d.address, line1: e.target.value })} /></SiteField>
                  <SiteField label={t.postalCode} htmlFor="postal"><SiteInput id="postal" autoComplete="postal-code" inputMode="numeric" placeholder="4780-000" value={d.address.postalCode} onChange={(e) => set('address', { ...d.address, postalCode: e.target.value })} /></SiteField>
                  <SiteField label={t.city} htmlFor="city"><SiteInput id="city" autoComplete="address-level2" value={d.address.city} onChange={(e) => set('address', { ...d.address, city: e.target.value })} /></SiteField>
                  <SiteField label={t.address2} htmlFor="addr2"><SiteInput id="addr2" autoComplete="address-line2" value={d.address.line2} onChange={(e) => set('address', { ...d.address, line2: e.target.value })} /></SiteField>
                  <SiteField label={t.addressNotes} htmlFor="addr-notes"><SiteInput id="addr-notes" value={d.address.notes} onChange={(e) => set('address', { ...d.address, notes: e.target.value })} /></SiteField>
                </div>
              )}
            </Question>

            <Question title={t.sectionDietary} hint={t.allergiesHint}>
              <div className="flex flex-wrap gap-2">
                {ALLERGENS.map((a) => {
                  const on = d.allergies.includes(a)
                  return <Chip key={a} on={on} onClick={() => set('allergies', on ? d.allergies.filter((x) => x !== a) : [...d.allergies, a])} className="capitalize">{a}</Chip>
                })}
              </div>
              <SiteField label={t.dietaryNotes} htmlFor="dietary" className="mt-5"><SiteInput id="dietary" value={d.dietaryNotes} onChange={(e) => set('dietaryNotes', e.target.value)} placeholder={t.dietaryPlaceholder} /></SiteField>
            </Question>

            <Question title={t.sectionDetails}>
              <SiteField label={t.message} htmlFor="message"><SiteTextarea id="message" rows={5} value={d.message} onChange={(e) => set('message', e.target.value)} placeholder={t.messagePlaceholder} /></SiteField>
              <SiteField label={t.photos} hint={t.photosHint} className="mt-6">
                {d.photos.length < MAX_PHOTOS && <PhotoDropzone kind="request" label={t.photosDrop} onUploaded={(u) => setD((x) => ({ ...x, photos: [...x.photos, ...u].slice(0, MAX_PHOTOS) }))} compact />}
                {d.photos.length > 0 && (
                  <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {d.photos.map((p) => (
                      <li key={p.id} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt="" className="aspect-square w-full rounded-xl object-cover" />
                        <button type="button" onClick={() => set('photos', d.photos.filter((x) => x.id !== p.id))} aria-label={t.removePhoto} className="absolute -top-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-cacau text-acucar shadow"><X className="h-4 w-4" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </SiteField>
            </Question>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-10">
            <Question title={t.sectionContact} hint={t.contactHint}>
              <div className="grid gap-4 sm:grid-cols-2">
                <SiteField label={t.name} htmlFor="name" className="sm:col-span-2" error={touchedContact && !d.name.trim() ? t.required : null}>
                  <SiteInput id="name" autoComplete="name" enterKeyHint="next" value={d.name} onChange={(e) => set('name', e.target.value)} aria-invalid={touchedContact && !d.name.trim()} />
                </SiteField>
                <SiteField label={t.phone} htmlFor="phone" hint={t.phoneHint} error={touchedContact && !phoneOk ? t.errorContact : null}>
                  <SiteInput id="phone" type="tel" inputMode="tel" autoComplete="tel" enterKeyHint="next" placeholder="912 345 678" value={d.phone} onChange={(e) => set('phone', e.target.value)} onBlur={() => phone && setTouchedContact(true)} aria-invalid={touchedContact && !phoneOk} />
                </SiteField>
                <SiteField label={t.email} htmlFor="email" hint={t.emailHintOptional} error={touchedContact && !emailOk ? t.errorContact : null}>
                  <SiteInput id="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} enterKeyHint="send" value={d.email} onChange={(e) => set('email', e.target.value)} onBlur={() => email && setTouchedContact(true)} aria-invalid={touchedContact && !emailOk} />
                </SiteField>
              </div>
              {touchedContact && !email && !phone && <p className="mt-3 text-sm text-[#9a3d35]">{t.errorContact}</p>}
              {/* Honeypot */}
              <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
                <label>Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
              </div>
            </Question>

            <section className="rounded-3xl bg-[#fbf6f1] p-5 sm:p-6">
              <h2 className="font-display text-xl">{t.summary}</h2>
              <dl className="mt-4 divide-y divide-cacau/10 text-[0.95rem]">
                <SummaryRow label={t.steps[0]} onEdit={() => goTo(0)} edit={t.edit}>
                  {[occasionName, d.eventDate && new Date(`${d.eventDate}T12:00:00`).toLocaleDateString(locale === 'pt' ? 'pt-PT' : locale, { day: 'numeric', month: 'long', year: 'numeric' }), d.eventTime, d.guests && `${d.guests} ${t.guests.toLowerCase()}`].filter(Boolean).join(' · ') || t.none}
                </SummaryRow>
                <SummaryRow label={t.steps[1]} onEdit={() => goTo(1)} edit={t.edit}>{chosen.length ? chosen.map((c) => <span key={c} className="block">{c}</span>) : t.none}</SummaryRow>
                <SummaryRow label={t.steps[2]} onEdit={() => goTo(2)} edit={t.edit}>
                  {[d.deliveryMode && t[`delivery_${d.deliveryMode}` as const], d.allergies.length > 0 && d.allergies.join(', '), d.photos.length > 0 && fmt(t.photosCount, { count: d.photos.length }), d.message.trim() && `“${d.message.trim().slice(0, 80)}${d.message.trim().length > 80 ? '…' : ''}”`].filter(Boolean).join(' · ') || t.none}
                </SummaryRow>
              </dl>
            </section>
            {error && <p role="alert" className="rounded-xl bg-[#f3dcd9] px-4 py-3 text-sm text-[#7a2e27]">{error}</p>}
            <p className="text-sm text-cacau-suave">{t.privacy}</p>
          </div>
        )}

        {/* Action bar: sticks to the bottom of the screen on phones while the form is in view, inline on desktop. */}
        <div className="sticky bottom-0 z-30 -mx-4 mt-10 border-t border-cacau/10 bg-acucar/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:px-6 md:static md:mx-0 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <div className="mx-auto flex max-w-2xl items-center gap-3 lg:max-w-3xl">
            {step > 0 ? (
              <button type="button" onClick={() => goTo(step - 1)} className="min-h-12 rounded-full border border-cacau/25 px-5 font-medium">{t.back}</button>
            ) : (
              <a href={whatsappUrl()} target="_blank" rel="noreferrer" aria-label={t.whatsapp} className="grid min-h-12 min-w-12 place-items-center rounded-full border border-cacau/25"><Icon name="chat" className="h-5 w-5" /></a>
            )}
            <button type="submit" disabled={busy} className="min-h-12 flex-1 rounded-full bg-cacau px-6 font-medium text-acucar hover:bg-[#3a2219] disabled:opacity-60 md:flex-none md:px-10">
              {step < STEPS - 1 ? t.next : busy ? t.submitting : t.submit}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function Question({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="relative">
      <h2 className="font-display text-2xl leading-snug">{title}</h2>
      {hint && <p className="mt-1.5 text-[0.95rem] text-cacau-suave">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Stepper({ value, step, unit, label, onChange }: { value: string; step: number; unit: string | null; label: string; onChange: (v: string) => void }) {
  const n = Number(value || 0)
  return (
    <div className="flex items-center gap-2">
      <button type="button" aria-label="−" onClick={() => onChange(n - step > 0 ? String(n - step) : '')} className="grid h-12 w-12 place-items-center rounded-full border border-cacau/20 active:bg-po/40"><Minus className="h-4 w-4" /></button>
      <SiteInput type="number" min={0} inputMode="numeric" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} className="w-20 px-2 text-center" />
      <button type="button" aria-label="+" onClick={() => onChange(String(n + step))} className="grid h-12 w-12 place-items-center rounded-full border border-cacau/20 active:bg-po/40"><Plus className="h-4 w-4" /></button>
      {unit && <span className="text-sm text-cacau-suave">{unit}</span>}
    </div>
  )
}

function SummaryRow({ label, edit, onEdit, children }: { label: string; edit: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <dt className="w-28 shrink-0 text-cacau-suave sm:w-36">{label}</dt>
      <dd className="min-w-0 flex-1">{children}</dd>
      <button type="button" onClick={onEdit} className="shrink-0 text-sm underline underline-offset-4">{edit}</button>
    </div>
  )
}
