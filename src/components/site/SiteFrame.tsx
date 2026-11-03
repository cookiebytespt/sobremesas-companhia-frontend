import type { Locale } from '@/i18n'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

/** Header + footer around every public page. The home page is full-bleed; the others use `PageContainer`. */
export function SiteFrame({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale} />
    </div>
  )
}

/** Centred column for the form, contact, privacy and confirmation pages. */
export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-14">{children}</div>
}
