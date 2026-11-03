'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, X } from 'lucide-react'
import PhotoDropzone from '@/components/backoffice/PhotoDropzone'
import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/input'
import { getDictionary, type Locale } from '@/i18n'
import { api } from '@/lib/api/client'
import { isApiError } from '@/lib/api/errors'
import { ALLERGENS, type DeliveryMode, type Occasion, type OrderItemInput, type Service, type Upload } from '@/lib/api/types'
import { localizedPath } from '@/lib/locale'
import { cn } from '@/lib/utils'

const MAX_PHOTOS = 10

type Line = { key: string; serviceId: string; offerItemId?: string; label?: string; quantity: string; notes: string }

/**
 * The public request form. Visitors stay anonymous: the e-mail they give is where the whole
 * conversation happens afterwards. Photos upload immediately (guest token minted by the BFF)
 * and are claimed by the order on submit.
 */
export function RequestForm({ locale, occasions, services, presetOccasion }: { locale: Locale; occasions: Occasion[]; services: Service[]; presetOccasion?: string }) {
  const t = getDictionary(locale).request
  const router = useRouter()
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_URL

  const [occasionId, setOccasionId] = useState(occasions.find((o) => o.slug === presetOccasion)?.id ?? '')
  const [occasionOther, setOccasionOther] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [guests, setGuests] = useState('')
  const [lines, setLines] = useState<Line[]>([])
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode | ''>('')
  const [address, setAddress] = useState({ line1: '', line2: '', postalCode: '', city: '', notes: '' })
  const [allergies, setAllergies] = useState<string[]>([])
  const [dietaryNotes, setDietaryNotes] = useState('')
  const [message, setMessage] = useState('')
  const [photos, setPhotos] = useState<Upload[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedServices = useMemo(() => new Set(lines.map((l) => l.serviceId)), [lines])
  const today = new Date().toISOString().slice(0, 10)

  const toggleService = (service: Service) => {
    if (selectedServices.has(service.id)) {
      setLines((ls) => ls.filter((l) => l.serviceId !== service.id))
    } else {
      // A service with no menu becomes one free-text line; one with a menu starts empty and shows its items.
      setLines((ls) => [...ls, ...(service.items.length === 0 ? [{ key: `${service.id}:other`, serviceId: service.id, quantity: '', notes: '' }] : [{ key: `${service.id}:__pick`, serviceId: service.id, quantity: '', notes: '' }])])
    }
  }
  const hasLine = (serviceId: string, offerItemId?: string, other = false) =>
    lines.some((l) => l.serviceId === serviceId && (other ? l.key.endsWith(':other') : l.offerItemId === offerItemId))
  const toggleItem = (service: Service, offerItemId?: string) => {
    const key = `${service.id}:${offerItemId ?? 'other'}`
    setLines((ls) => {
      const without = ls.filter((l) => l.key !== key && l.key !== `${service.id}:__pick`)
      if (ls.some((l) => l.key === key)) return without.length === ls.length - 1 && !without.some((l) => l.serviceId === service.id) ? [...without, { key: `${service.id}:__pick`, serviceId: service.id, quantity: '', notes: '' }] : without
      return [...without, { key, serviceId: service.id, offerItemId, quantity: '', notes: '' }]
    })
  }
  const updateLine = (key: string, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError(null)
    const items: OrderItemInput[] = lines
      .filter((l) => !l.key.endsWith(':__pick'))
      .map((l) => ({
        serviceId: l.serviceId,
        offerItemId: l.offerItemId,
        label: l.offerItemId ? undefined : l.label?.trim() || undefined,
        quantity: l.quantity ? Number(l.quantity) : undefined,
        notes: l.notes.trim() || undefined,
      }))
    try {
      const created = await api.orders.create({
        name: name.trim(), email: email.trim(), phone: phone.trim() || undefined,
        occasionId: occasionId || undefined, occasionOther: occasionId ? undefined : occasionOther.trim() || undefined,
        eventDate: eventDate || undefined, eventTime: eventTime || undefined, guests: guests ? Number(guests) : undefined,
        message: message.trim() || undefined, items,
        deliveryMode: deliveryMode || undefined,
        addressLine1: address.line1.trim() || undefined, addressLine2: address.line2.trim() || undefined,
        postalCode: address.postalCode.trim() || undefined, city: address.city.trim() || undefined, addressNotes: address.notes.trim() || undefined,
        allergies, dietaryNotes: dietaryNotes.trim() || undefined,
        uploadIds: photos.map((p) => p.id), website,
      })
      router.push(`${localizedPath(locale, '/request/sent')}?number=${encodeURIComponent(created.number)}&email=${encodeURIComponent(created.email)}`)
    } catch (err) {
      setError(isApiError(err) && err.code === 'auth.too_many_requests' ? t.errorTooMany : t.errorGeneric)
      setBusy(false)
    }
  }

  const needsAddress = deliveryMode === 'delivery' || deliveryMode === 'on_site'

  return (
    <form onSubmit={submit} className="space-y-10">
      {/* Event */}
      <Section title={t.sectionEvent}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.occasion} htmlFor="occasion">
            <Select id="occasion" value={occasionId} onChange={(e) => setOccasionId(e.target.value)}>
              <option value="">{t.occasionPlaceholder}</option>
              {occasions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              <option value="">— {t.occasionOther} —</option>
            </Select>
          </Field>
          {!occasionId && (
            <Field label={t.occasionOther} htmlFor="occasion-other">
              <Input id="occasion-other" value={occasionOther} onChange={(e) => setOccasionOther(e.target.value)} placeholder={t.occasionOtherPlaceholder} />
            </Field>
          )}
          <Field label={t.date} htmlFor="date">
            <Input id="date" type="date" min={today} value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t.time} htmlFor="time">
              <Input id="time" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
            </Field>
            <Field label={t.guests} htmlFor="guests">
              <Input id="guests" type="number" min={1} max={5000} inputMode="numeric" value={guests} onChange={(e) => setGuests(e.target.value)} />
            </Field>
          </div>
        </div>
      </Section>

      {/* Services & items */}
      <Section title={t.sectionWhat} hint={t.whatHint}>
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <button key={s.id} type="button" onClick={() => toggleService(s)} aria-pressed={selectedServices.has(s.id)}
              className={cn('rounded-full border px-4 py-2 text-sm transition-colors', selectedServices.has(s.id) ? 'border-cacau bg-cacau text-acucar' : 'border-linha bg-acucar text-cacau hover:border-cacau/40')}>
              {s.name}
            </button>
          ))}
        </div>
        {services.filter((s) => selectedServices.has(s.id) && s.items.length > 0).map((s) => (
          <div key={s.id} className="rounded-2xl border border-linha bg-acucar p-4">
            <p className="mb-3 font-medium text-cacau">{s.name}</p>
            <ul className="space-y-2">
              {[...s.items.map((i) => ({ id: i.id as string | undefined, name: i.name, description: i.description })), { id: undefined, name: t.other, description: null }].map((item) => {
                const line = lines.find((l) => l.serviceId === s.id && (item.id ? l.offerItemId === item.id : l.key.endsWith(':other')))
                const on = Boolean(line)
                return (
                  <li key={item.id ?? 'other'} className={cn('rounded-xl border px-3 py-2', on ? 'border-po bg-po/20' : 'border-transparent')}>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input type="checkbox" checked={on} onChange={() => toggleItem(s, item.id)} className="mt-1 h-4 w-4 accent-cacau" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-cacau">{item.name}</span>
                        {item.description && <span className="block text-xs text-cacau/60">{item.description}</span>}
                      </span>
                    </label>
                    {on && line && (
                      <div className="mt-2 grid gap-2 pl-7 sm:grid-cols-[1fr_auto]">
                        {!item.id && <Input value={line.label ?? ''} onChange={(e) => updateLine(line.key, { label: e.target.value })} placeholder={t.otherPlaceholder} className="sm:col-span-2" />}
                        <Input value={line.notes} onChange={(e) => updateLine(line.key, { notes: e.target.value })} placeholder={t.itemNotes} />
                        {s.allowQuantities && (
                          <div className="flex items-center gap-1">
                            <button type="button" aria-label="-" onClick={() => updateLine(line.key, { quantity: String(Math.max(0, Number(line.quantity || 0) - (s.quantityUnit === 'pessoas' ? 1 : 5))) || '' })} className="rounded-lg border border-linha p-2 hover:bg-creme"><Minus className="h-3.5 w-3.5" /></button>
                            <Input type="number" min={0} inputMode="numeric" value={line.quantity} onChange={(e) => updateLine(line.key, { quantity: e.target.value })} placeholder={t.quantity} className="w-20 text-center" />
                            <button type="button" aria-label="+" onClick={() => updateLine(line.key, { quantity: String(Number(line.quantity || 0) + (s.quantityUnit === 'pessoas' ? 1 : 5)) })} className="rounded-lg border border-linha p-2 hover:bg-creme"><Plus className="h-3.5 w-3.5" /></button>
                            {s.quantityUnit && <span className="text-xs text-cacau/50">{s.quantityUnit}</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </Section>

      {/* Delivery */}
      <Section title={t.sectionDelivery}>
        <div className="flex flex-wrap gap-2">
          {(['delivery', 'pickup', 'on_site'] as DeliveryMode[]).map((m) => (
            <button key={m} type="button" onClick={() => setDeliveryMode(deliveryMode === m ? '' : m)} aria-pressed={deliveryMode === m}
              className={cn('rounded-full border px-4 py-2 text-sm', deliveryMode === m ? 'border-cacau bg-cacau text-acucar' : 'border-linha bg-acucar text-cacau hover:border-cacau/40')}>
              {t[`delivery_${m}` as const]}
            </button>
          ))}
        </div>
        {needsAddress && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.address} htmlFor="addr1"><Input id="addr1" autoComplete="address-line1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} /></Field>
            <Field label={t.address2} htmlFor="addr2"><Input id="addr2" autoComplete="address-line2" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} /></Field>
            <Field label={t.postalCode} htmlFor="postal"><Input id="postal" autoComplete="postal-code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} /></Field>
            <Field label={t.city} htmlFor="city"><Input id="city" autoComplete="address-level2" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label={t.addressNotes} htmlFor="addr-notes"><Input id="addr-notes" value={address.notes} onChange={(e) => setAddress({ ...address, notes: e.target.value })} /></Field></div>
          </div>
        )}
      </Section>

      {/* Dietary */}
      <Section title={t.sectionDietary} hint={t.allergiesHint}>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map((a) => {
            const on = allergies.includes(a)
            return (
              <button key={a} type="button" aria-pressed={on} onClick={() => setAllergies(on ? allergies.filter((x) => x !== a) : [...allergies, a])}
                className={cn('rounded-full border px-3 py-1.5 text-sm capitalize', on ? 'border-cacau bg-cacau text-acucar' : 'border-linha bg-acucar text-cacau hover:border-cacau/40')}>
                {a}
              </button>
            )
          })}
        </div>
        <Field label={t.dietaryNotes} htmlFor="dietary"><Input id="dietary" value={dietaryNotes} onChange={(e) => setDietaryNotes(e.target.value)} placeholder={t.dietaryPlaceholder} /></Field>
      </Section>

      {/* Details & photos */}
      <Section title={t.sectionDetails}>
        <Field label={t.message} htmlFor="message"><Textarea id="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t.messagePlaceholder} /></Field>
        <Field label={t.photos} hint={t.photosHint}>
          {photos.length < MAX_PHOTOS && <PhotoDropzone kind="request" label={t.photosDrop} onUploaded={(u) => setPhotos((p) => [...p, ...u].slice(0, MAX_PHOTOS))} compact />}
          {photos.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {photos.map((p) => (
                <li key={p.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  <button type="button" onClick={() => setPhotos(photos.filter((x) => x.id !== p.id))} aria-label={t.removePhoto} className="absolute -right-1.5 -top-1.5 rounded-full bg-cacau p-1 text-acucar shadow"><X className="h-3 w-3" /></button>
                </li>
              ))}
            </ul>
          )}
        </Field>
      </Section>

      {/* Contact */}
      <Section title={t.sectionContact}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.name} htmlFor="name"><Input id="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label={t.phone} htmlFor="phone" hint={t.phoneHint}><Input id="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <div className="sm:col-span-2"><Field label={t.email} htmlFor="email" hint={t.emailHint}><Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field></div>
        </div>
        {/* Honeypot */}
        <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden>
          <label>Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
        </div>
      </Section>

      {error && <p className="rounded-xl bg-[#f3dcd9] px-4 py-3 text-sm text-[#7a2e27]">{error}</p>}

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button type="submit" loading={busy} disabled={busy || !name.trim() || !email.trim()} className="px-6">{busy ? t.submitting : t.submit}</Button>
          <p className="mt-2 text-xs text-cacau/50">{t.privacy}</p>
        </div>
        {whatsapp && <a href={whatsapp} className="text-sm text-cacau/70 underline-offset-2 hover:text-cacau hover:underline" target="_blank" rel="noreferrer">{t.whatsapp}</a>}
      </div>
    </form>
  )
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="relative space-y-4">
      <div>
        <h2 className="font-display text-xl text-cacau">{title}</h2>
        {hint && <p className="mt-1 text-sm text-cacau/60">{hint}</p>}
      </div>
      {children}
    </section>
  )
}
