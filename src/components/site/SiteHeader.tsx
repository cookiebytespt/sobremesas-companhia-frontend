import Link from 'next/link'
import { getDictionary, type Locale } from '@/i18n'
import { localizedPath } from '@/lib/locale'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Wordmark } from './Wordmark'

/** Public header: wordmark, link to the presentation site, language. Nobody signs in here — staff use /backoffice/login. */
export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const landing = process.env.NEXT_PUBLIC_LANDING_URL ?? 'https://sobremesasecompanhia.pt'

  return (
    <header className="border-b border-linha bg-acucar/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={localizedPath(locale, '/')} className="shrink-0">
          <Wordmark tagline={t.common.tagline} />
        </Link>
        <div className="flex items-center gap-3 sm:gap-5">
          <a href={landing} className="hidden text-sm text-cacau/70 hover:text-cacau sm:inline">{t.common.site}</a>
          <Link href={localizedPath(locale, '/request')} className="rounded-full bg-cacau px-4 py-1.5 text-sm font-medium text-acucar hover:bg-cacau-suave">{t.home.request}</Link>
          <LanguageSwitcher locale={locale} label={t.common.language} />
        </div>
      </div>
    </header>
  )
}
