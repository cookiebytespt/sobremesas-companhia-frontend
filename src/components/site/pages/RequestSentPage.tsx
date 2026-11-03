import Link from 'next/link'
import { Icon } from '@/components/site/Icon'
import { PageContainer } from '@/components/site/SiteFrame'
import { whatsappUrl } from '@/content/site'
import { fmt, getDictionary, type Locale } from '@/i18n'
import { localizedPath } from '@/lib/locale'

/**
 * After any request (quick form or full). The order is already in the platform; WhatsApp is offered
 * as an extra nudge with the order number (what the old site did instead of storing anything).
 */
export function RequestSentPage({ locale, number, email, phone }: { locale: Locale; number: string; email: string; phone: string }) {
  const t = getDictionary(locale).sent
  return (
    <PageContainer>
      <section className="mx-auto max-w-xl py-6 text-center">
        <span className="scallop-badge mx-auto grid h-20 w-20 place-items-center bg-po text-cacau">
          <Icon name="cupcake" className="h-9 w-9" />
        </span>
        <h1 className="mt-6 font-display text-3xl tracking-tight text-cacau sm:text-4xl">{t.title}</h1>
        <p className="mt-4 text-lg text-cacau">{fmt(t.intro, { number })}</p>
        {email ? (
          <>
            <p className="mt-2 text-cacau-suave">{fmt(t.email, { email })}</p>
            <p className="mt-2 text-sm text-cacau/50">{t.spam}</p>
          </>
        ) : (
          phone && <p className="mt-2 text-cacau-suave">{fmt(t.phoneOnly, { phone })}</p>
        )}
        <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center">
          <a href={whatsappUrl(fmt(t.whatsappText, { number }))} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cacau px-6 font-medium text-acucar hover:bg-[#3a2219]">
            <Icon name="chat" className="h-5 w-5" /> {t.whatsapp}
          </a>
          <Link href={localizedPath(locale, '/')} className="inline-flex min-h-12 items-center justify-center rounded-full border border-cacau/25 px-6 font-medium">{t.home}</Link>
        </div>
        <p className="mt-6"><Link href={localizedPath(locale, '/request')} className="text-sm text-cacau-suave underline underline-offset-4">{t.another}</Link></p>
      </section>
    </PageContainer>
  )
}
