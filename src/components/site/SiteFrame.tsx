import type { Locale } from '@/i18n'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

/** Header + footer around every public/client page. */
export function SiteFrame({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={locale} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">{children}</main>
      <SiteFooter locale={locale} />
    </div>
  )
}
