import Link from 'next/link'
import { ContactForm } from '@/components/site/ContactForm'
import { Icon } from '@/components/site/Icon'
import { PageContainer } from '@/components/site/SiteFrame'
import { site, whatsappUrl } from '@/content/site'
import { getDictionary, type Locale } from '@/i18n'
import { localizedPath } from '@/lib/locale'

export function ContactPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const t = dict.contact
  return (
    <PageContainer>
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl tracking-tight text-cacau sm:text-4xl">{t.title}</h1>
      <p className="mt-3 text-cacau-suave">{t.intro}</p>
      <p className="mt-2 text-sm text-cacau/60">
        <Link href={localizedPath(locale, '/request')} className="underline-offset-2 hover:underline">{t.requestInstead}</Link>
      </p>
      {/* Phone first: most visitors would rather message or call than fill in a form. */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <a href={whatsappUrl()} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-cacau px-4 font-medium text-acucar"><Icon name="chat" className="h-5 w-5" /> {dict.home.sticky.whatsapp}</a>
        <a href={`tel:+${site.whatsapp}`} className="flex min-h-12 items-center justify-center rounded-full border border-cacau/25 px-4 font-medium">{dict.home.sticky.call} {site.whatsappDisplay}</a>
      </div>
      <div className="mt-8"><ContactForm locale={locale} /></div>
    </div>
    </PageContainer>
  )
}
