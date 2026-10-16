import Link from 'next/link'
import { getDictionary, type Locale } from '@/i18n'
import { localizedPath, loginHref } from '@/lib/locale'
import { Icon } from '../Icon'

/** Placeholder home for the platform until the request form lands (phase 3). */
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
        <span className="rounded-full border border-dashed border-po-fundo/60 px-4 py-2 text-sm text-cacau/60">{t.home.requestSoon}</span>
        <a href={landing} className="rounded-full bg-cacau px-5 py-2 text-sm font-medium text-acucar hover:bg-cacau-suave">{t.home.landing}</a>
      </div>
      <p className="mt-10 text-sm text-cacau/60">
        {t.home.haveAccount}{' '}
        <a href={loginHref(locale, '/conta')} className="font-medium text-cacau underline-offset-2 hover:underline">{t.common.signIn}</a>
        <span className="px-2 text-cacau/30">·</span>
        <a href={loginHref(locale, '/conta', { signup: true })} className="font-medium text-cacau underline-offset-2 hover:underline">{t.common.signUp}</a>
        <span className="px-2 text-cacau/30">·</span>
        <Link href={localizedPath(locale, '/conta')} className="text-cacau/60 hover:text-cacau">{t.common.account}</Link>
      </p>
    </section>
  )
}
