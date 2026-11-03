import Link from 'next/link'
import { ContactForm } from '@/components/site/ContactForm'
import { getDictionary, type Locale } from '@/i18n'
import { localizedPath } from '@/lib/locale'

export function ContactPage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).contact
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-3xl tracking-tight text-cacau sm:text-4xl">{t.title}</h1>
      <p className="mt-3 text-cacau-suave">{t.intro}</p>
      <p className="mt-2 text-sm text-cacau/60">
        <Link href={localizedPath(locale, '/request')} className="underline-offset-2 hover:underline">{t.requestInstead}</Link>
      </p>
      <div className="mt-8"><ContactForm locale={locale} /></div>
    </div>
  )
}
