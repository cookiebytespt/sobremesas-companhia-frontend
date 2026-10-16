'use client'

import Link from 'next/link'
import { LogOut, UserRound } from 'lucide-react'
import { getDictionary, type Locale } from '@/i18n'
import { localizedPath, loginHref } from '@/lib/locale'
import { useSession } from '@/lib/session'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Wordmark } from './Wordmark'

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const session = useSession()
  const landing = process.env.NEXT_PUBLIC_LANDING_URL ?? 'https://sobremesasecompanhia.pt'

  return (
    <header className="border-b border-linha bg-acucar/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={localizedPath(locale, '/')} className="shrink-0">
          <Wordmark tagline={t.common.tagline} />
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <a href={landing} className="hidden text-sm text-cacau/70 hover:text-cacau sm:inline">{t.common.site}</a>
          <LanguageSwitcher locale={locale} label={t.common.language} />
          {session.status === 'authenticated' ? (
            <div className="flex items-center gap-1">
              {session.me.user.role === 'admin' && (
                <a href="/backoffice" className="hidden rounded-full border border-linha px-3 py-1.5 text-sm text-cacau hover:bg-creme sm:inline">{t.common.backoffice}</a>
              )}
              <Link href={localizedPath(locale, '/conta')} className="inline-flex items-center gap-1.5 rounded-full bg-po px-3 py-1.5 text-sm font-medium text-cacau hover:bg-po-fundo/40">
                <UserRound className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">{t.common.account}</span>
              </Link>
              <a href="/auth/logout" className="rounded-full p-2 text-cacau/60 hover:bg-creme hover:text-cacau" aria-label={t.common.signOut} title={t.common.signOut}>
                <LogOut className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <a href={loginHref(locale, '/conta')} className="rounded-full bg-cacau px-4 py-1.5 text-sm font-medium text-acucar hover:bg-cacau-suave">
              {t.common.signIn}
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
