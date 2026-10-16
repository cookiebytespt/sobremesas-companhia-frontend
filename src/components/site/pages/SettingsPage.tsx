'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getDictionary, localeInfo, locales, type Locale } from '@/i18n'
import { api } from '@/lib/api/client'
import { apiErrorMessage } from '@/lib/api/errors'
import { localizedPath } from '@/lib/locale'
import { sessionKey, useSession } from '@/lib/session'
import { RequireAuth } from '../RequireAuth'

export function SettingsPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  return (
    <RequireAuth locale={locale} returnTo="/conta/definicoes">
      <SettingsForm locale={locale} t={t} />
    </RequireAuth>
  )
}

const field = 'mt-1 w-full rounded-xl border border-linha bg-white px-3.5 py-2.5 text-cacau outline-none focus:border-cacau focus:ring-2 focus:ring-cacau/15'

function SettingsForm({ locale, t }: { locale: Locale; t: ReturnType<typeof getDictionary> }) {
  const session = useSession()
  const qc = useQueryClient()
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [preferred, setPreferred] = useState<Locale>(locale)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const user = session.status === 'authenticated' ? session.me.user : null
  useEffect(() => {
    if (!user) return
    setName(user.name ?? '')
    setPhone(user.phone ?? '')
    setPreferred(user.locale ?? locale)
  }, [user, locale])

  if (!user) return null

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await api.me.update({ name: name.trim(), phone: phone.trim(), locale: preferred })
      await qc.invalidateQueries({ queryKey: sessionKey })
      setMessage({ tone: 'ok', text: t.account.saved })
      // The preferred language changed: continue in it.
      if (preferred !== locale) router.push(localizedPath(preferred, '/conta/definicoes'))
    } catch (err) {
      setMessage({ tone: 'error', text: apiErrorMessage(err, t.common.error, locale) })
    } finally {
      setSaving(false)
    }
  }

  const destroy = async () => {
    setDeleting(true)
    try {
      await api.me.remove()
      window.location.assign('/auth/logout')
    } catch (err) {
      setMessage({ tone: 'error', text: apiErrorMessage(err, t.common.error, locale) })
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link href={localizedPath(locale, '/conta')} className="inline-flex items-center gap-1 text-sm text-cacau/60 hover:text-cacau">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {t.account.title}
      </Link>
      <h1 className="mt-3 font-display text-3xl text-cacau">{t.account.settings}</h1>

      <form onSubmit={save} className="mt-8 space-y-5">
        <h2 className="font-display text-lg text-cacau">{t.account.profile}</h2>
        <label className="block text-sm font-medium">
          {t.account.name}
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={field} />
        </label>
        <label className="block text-sm font-medium">
          {t.account.email}
          <input value={user.email ?? ''} readOnly disabled className={`${field} bg-creme text-cacau/60`} />
        </label>
        <label className="block text-sm font-medium">
          {t.account.phone}
          <input value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" className={field} />
          <span className="mt-1 block text-xs font-normal text-cacau/50">{t.account.phoneHint}</span>
        </label>
        <label className="block text-sm font-medium">
          {t.account.language}
          <select value={preferred} onChange={(e) => setPreferred(e.target.value as Locale)} className={`${field} select-chevron appearance-none pr-10`}>
            {locales.map((l) => (
              <option key={l} value={l}>{localeInfo[l].name}</option>
            ))}
          </select>
          <span className="mt-1 block text-xs font-normal text-cacau/50">{t.account.languageHint}</span>
        </label>
        {message && (
          <p className={`rounded-xl px-4 py-2.5 text-sm ${message.tone === 'ok' ? 'bg-po/50 text-cacau' : 'bg-merengue text-cacau'}`} role="status">{message.text}</p>
        )}
        <button type="submit" disabled={saving} className="rounded-full bg-cacau px-5 py-2.5 text-sm font-medium text-acucar hover:bg-cacau-suave disabled:opacity-50">
          {t.common.save}
        </button>
      </form>

      <section className="mt-14 rounded-2xl border border-merengue bg-merengue/30 p-5">
        <h2 className="font-display text-lg text-cacau">{t.account.danger}</h2>
        <p className="mt-1 text-sm text-cacau-suave">{t.account.dangerHint}</p>
        {confirmDelete ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={destroy} disabled={deleting} className="rounded-full bg-[#b4534b] px-4 py-2 text-sm font-medium text-acucar disabled:opacity-50">{t.account.dangerConfirm}</button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full border border-linha px-4 py-2 text-sm text-cacau">{t.common.cancel}</button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmDelete(true)} className="mt-4 rounded-full border border-cacau/30 px-4 py-2 text-sm text-cacau hover:bg-white">{t.account.danger}</button>
        )}
      </section>
    </div>
  )
}
