import Link from 'next/link'
import { Icon } from '@/components/site/Icon'
import { fmt, getDictionary, type Locale } from '@/i18n'
import { localizedPath } from '@/lib/locale'

export function RequestSentPage({ locale, number, email }: { locale: Locale; number: string; email: string }) {
  const t = getDictionary(locale).sent
  const landing = process.env.NEXT_PUBLIC_LANDING_URL ?? 'https://sobremesasecompanhia.pt'
  return (
    <section className="mx-auto max-w-xl py-6 text-center">
      <span className="scallop-badge mx-auto grid h-20 w-20 place-items-center bg-po text-cacau">
        <Icon name="cupcake" className="h-9 w-9" />
      </span>
      <h1 className="mt-6 font-display text-3xl tracking-tight text-cacau">{t.title}</h1>
      <p className="mt-4 text-cacau">{fmt(t.intro, { number })}</p>
      <p className="mt-2 text-cacau-suave">{fmt(t.email, { email })}</p>
      <p className="mt-2 text-sm text-cacau/50">{t.spam}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href={localizedPath(locale, '/request')} className="rounded-full border border-linha px-5 py-2 text-sm text-cacau hover:bg-creme">{t.another}</Link>
        <a href={landing} className="rounded-full bg-cacau px-5 py-2 text-sm font-medium text-acucar hover:bg-cacau-suave">{t.landing}</a>
      </div>
    </section>
  )
}
