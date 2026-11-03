import Link from 'next/link'
import { getDictionary, type Locale } from '@/i18n'
import { localizedPath } from '@/lib/locale'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileMenu } from './MobileMenu'
import { Wordmark } from './Wordmark'

/**
 * Public header — this is the website now (it replaces the old presentation site), so every link
 * stays inside the platform: home sections, the contact page and the request form. Staff sign in
 * at /backoffice/login, never from here.
 */
export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const n = t.home.nav
  const home = localizedPath(locale, '/')
  const links = [
    { href: `${home}#work`, label: n.work },
    { href: `${home}#services`, label: n.services },
    { href: `${home}#how-it-works`, label: n.how },
    { href: `${home}#where`, label: n.where },
    { href: localizedPath(locale, '/contact'), label: n.contact },
  ]
  const request = localizedPath(locale, '/request')

  return (
    <header className="sticky top-0 z-40 bg-po">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 md:gap-6 md:px-8 md:py-4">
        <Link href={home} aria-label={n.home} className="min-w-0">
          <Wordmark tagline={t.common.tagline} compact />
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3 xl:gap-6">
          <nav aria-label={n.label} className="hidden items-center gap-7 xl:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-[0.95rem] underline-offset-4 hover:underline">
                {l.label}
              </Link>
            ))}
          </nav>
          <LanguageSwitcher locale={locale} label={t.common.language} className="hidden xl:flex" />
          <Link href={request} className="hidden rounded-full bg-cacau px-5 py-2.5 text-[0.95rem] font-medium whitespace-nowrap text-acucar hover:bg-[#3a2219] md:inline-block">
            {t.home.request}
          </Link>
          <Link href={request} className="hidden rounded-full bg-cacau px-4 py-2.5 text-sm font-medium whitespace-nowrap text-acucar sm:inline-block md:hidden">
            {t.home.requestShort}
          </Link>
          <MobileMenu
            links={links}
            locale={locale}
            requestHref={request}
            labels={{ menu: t.common.menu, close: t.common.closeMenu, nav: n.label, language: t.common.language, request: t.home.request, whatsapp: t.home.sticky.whatsapp, call: t.home.sticky.call }}
          />
        </div>
      </div>
    </header>
  )
}
