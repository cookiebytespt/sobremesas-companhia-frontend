import Link from 'next/link'
import { getDictionary, type Locale } from '@/i18n'
import { localizedPath } from '@/lib/locale'
import { Icon } from '../Icon'

/** Home of the platform: points at the request form and back to the presentation site. */
export function HomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  const landing = process.env.NEXT_PUBLIC_LANDING_URL ?? 'https://sobremesasecompanhia.pt'
  return (
    <section className="mx-auto max-w-2xl py-6 text-center">
      <span className="scallop-badge mx-auto grid h-20 w-20 place-items-center bg-po text-cacau">
        <Icon name="cupcake" className="h-9 w-9" />
      </span>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-po-fundo">{t.home.kicker}</p>
      <h1 className="mt-2 font-display text-3xl tracking-tight text-cacau sm:text-4xl">{t.home.title}</h1>
      <p className="mx-auto mt-4 max-w-xl text-cacau-suave">{t.home.intro}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href={localizedPath(locale, '/request')} className="rounded-full bg-po px-5 py-2 text-sm font-medium text-cacau hover:bg-po-fundo/40">{t.home.request}</Link>
        <a href={landing} className="rounded-full bg-cacau px-5 py-2 text-sm font-medium text-acucar hover:bg-cacau-suave">{t.home.landing}</a>
      </div>
    </section>
  )
}
