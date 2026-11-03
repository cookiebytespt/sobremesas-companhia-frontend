'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/input'
import { fmt, getDictionary, type Locale } from '@/i18n'
import { api } from '@/lib/api/client'
import { isApiError } from '@/lib/api/errors'

export function ContactForm({ locale }: { locale: Locale }) {
  const d = getDictionary(locale)
  const t = d.contact
  const r = d.request
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [website, setWebsite] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError(null)
    try {
      await api.contact.send({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, message: message.trim(), website })
      setSent(true)
    } catch (err) {
      setError(isApiError(err) && err.code === 'auth.too_many_requests' ? r.errorTooMany : r.errorGeneric)
    } finally {
      setBusy(false)
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-linha bg-acucar p-6 text-center">
        <h2 className="font-display text-xl text-cacau">{t.sentTitle}</h2>
        <p className="mt-2 text-cacau-suave">{fmt(t.sentIntro, { email: email.trim() })}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={r.name} htmlFor="c-name"><Input id="c-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label={r.phone} htmlFor="c-phone"><Input id="c-phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
      </div>
      <Field label={r.email} htmlFor="c-email"><Input id="c-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Field label={t.message} htmlFor="c-message"><Textarea id="c-message" rows={5} required value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden>
        <label>Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label>
      </div>
      {error && <p className="rounded-xl bg-[#f3dcd9] px-4 py-3 text-sm text-[#7a2e27]">{error}</p>}
      <Button type="submit" loading={busy} disabled={busy || !name.trim() || !email.trim() || !message.trim()}>{t.submit}</Button>
      <p className="text-xs text-cacau/50">{r.privacy}</p>
    </form>
  )
}
