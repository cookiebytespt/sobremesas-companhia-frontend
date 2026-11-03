import Link from 'next/link'
import { whatsappUrl } from '@/content/site'
import type { Dictionary, Locale } from '@/i18n'
import { localizedPath } from '@/lib/locale'
import { Icon } from '../Icon'

/**
 * Closing call to action on the blush band (as on the old site), with no form: there is one way to
 * ask for a quote — the dedicated `/request` flow. Buttons: ask for a quote, talk on WhatsApp, or the
 * contact page (phone, e-mail form, WhatsApp).
 */
export function QuoteCta({ t, locale }: { t: Dictionary['home']['quote']; locale: Locale }) {
  return (
    <section id="quote" className="scallop-top scroll-mt-20 bg-merengue">
      <div className="mx-auto max-w-6xl px-5 py-16 text-center md:px-8 md:py-24">
        <h2 className="font-display text-4xl leading-tight tracking-tight md:text-5xl">{t.title}</h2>
        <p className="mx-auto mt-4 max-w-[46ch] text-lg leading-relaxed text-cacau-suave">{t.intro}</p>
        <div className="mx-auto mt-9 grid max-w-sm gap-3 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center">
          <Link href={localizedPath(locale, '/request')} className="flex min-h-14 items-center justify-center rounded-full bg-cacau px-8 font-medium whitespace-nowrap text-acucar hover:bg-[#3a2219]">
            {t.button}
          </Link>
          <a href={whatsappUrl()} target="_blank" rel="noreferrer" className="flex min-h-14 items-center justify-center gap-2 rounded-full border border-cacau/30 px-8 font-medium whitespace-nowrap hover:border-cacau">
            <Icon name="chat" className="h-5 w-5" /> {t.whatsapp}
          </a>
          <Link href={localizedPath(locale, '/contact')} className="flex min-h-14 items-center justify-center rounded-full border border-cacau/30 px-8 font-medium whitespace-nowrap hover:border-cacau">
            {t.contact}
          </Link>
        </div>
      </div>
    </section>
  )
}
