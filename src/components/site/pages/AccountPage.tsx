'use client'

import Link from 'next/link'
import { Settings } from 'lucide-react'
import { fmt, getDictionary, type Locale } from '@/i18n'
import { localizedPath } from '@/lib/locale'
import { useSession } from '@/lib/session'
import { RequireAuth } from '../RequireAuth'

export function AccountPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  return (
    <RequireAuth locale={locale} returnTo="/conta">
      <AccountBody locale={locale} t={t} />
    </RequireAuth>
  )
}

function AccountBody({ locale, t }: { locale: Locale; t: ReturnType<typeof getDictionary> }) {
  const session = useSession()
  if (session.status !== 'authenticated') return null
  const { user } = session.me
  const name = user.name?.split(' ')[0] ?? user.email ?? ''

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-po-fundo">{t.account.title}</p>
          <h1 className="mt-1 font-display text-3xl text-cacau">{fmt(t.account.welcome, { name })}</h1>
        </div>
        <Link href={localizedPath(locale, '/conta/definicoes')} className="inline-flex items-center gap-2 rounded-full border border-linha px-4 py-2 text-sm text-cacau hover:bg-creme">
          <Settings className="h-4 w-4" aria-hidden /> {t.account.settings}
        </Link>
      </div>

      {!user.emailVerified && (
        <div className="mt-6 rounded-2xl bg-merengue px-5 py-4 text-sm text-cacau">
          <p className="font-medium">{t.account.emailUnverified}</p>
          <p className="mt-1 text-cacau-suave">{t.account.emailUnverifiedHint}</p>
        </div>
      )}

      <section className="mt-8">
        <h2 className="font-display text-xl text-cacau">{t.account.requests}</h2>
        <div className="scallop-bottom mt-4 bg-po/40 px-6 pt-8 pb-10 text-center text-sm text-cacau-suave">{t.account.requestsEmpty}</div>
      </section>
    </div>
  )
}
