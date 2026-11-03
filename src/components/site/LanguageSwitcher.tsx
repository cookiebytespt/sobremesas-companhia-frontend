'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { localeInfo, locales, type Locale } from '@/i18n'
import { localizedPath, splitLocale } from '@/lib/locale'

/** PT · EN · ES · FR, keeping the current page. */
export function LanguageSwitcher({ locale, label, className = 'flex' }: { locale: Locale; label: string; className?: string }) {
  const pathname = usePathname()
  const { path } = splitLocale(pathname)
  return (
    <nav aria-label={label} className={`${className} items-center gap-1 text-[0.85rem] font-medium`}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="px-1 text-cacau/30" aria-hidden>·</span>}
          <Link
            href={localizedPath(l, path)}
            hrefLang={localeInfo[l].htmlLang}
            aria-current={l === locale ? 'true' : undefined}
            className={l === locale ? 'text-cacau' : 'text-cacau/50 hover:text-cacau'}
          >
            {localeInfo[l].short}
          </Link>
        </span>
      ))}
    </nav>
  )
}
