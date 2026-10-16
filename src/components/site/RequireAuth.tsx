'use client'

import { useEffect } from 'react'
import { getDictionary, type Locale } from '@/i18n'
import { loginHref } from '@/lib/locale'
import { useSession } from '@/lib/session'

/** Wraps client-area pages: spinner while loading, Auth0 login when anonymous, message when disabled. */
export function RequireAuth({ locale, returnTo, children }: { locale: Locale; returnTo: string; children: React.ReactNode }) {
  const t = getDictionary(locale)
  const session = useSession()

  useEffect(() => {
    if (session.status === 'anonymous') window.location.assign(loginHref(locale, returnTo))
  }, [session.status, locale, returnTo])

  if (session.status === 'disabled') {
    return <p className="rounded-2xl bg-merengue px-5 py-4 text-sm text-cacau">{session.reason}</p>
  }
  if (session.status !== 'authenticated') {
    return <p className="py-16 text-center text-sm text-cacau/60">{session.status === 'loading' ? t.common.loading : t.account.signInRequired}</p>
  }
  return <>{children}</>
}
