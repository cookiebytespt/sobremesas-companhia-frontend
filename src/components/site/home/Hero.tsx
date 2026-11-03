import Link from 'next/link'
import type { Dictionary } from '@/i18n'
import type { GalleryPhoto } from '@/lib/api/types'
import { Photo } from '../Photo'

/** Headline + the three hero photos (gallery placement `hero`, set in the backoffice). */
export function Hero({ t, photos, requestHref, workHref }: { t: Dictionary['home']['hero']; photos: GalleryPhoto[]; requestHref: string; workHref: string }) {
  const [a, b, c] = photos
  return (
    <section className="scallop-bottom bg-po">
      <div className="mx-auto grid max-w-6xl items-end gap-10 px-5 pt-6 pb-14 md:px-8 md:pt-14 md:pb-24 lg:grid-cols-[1.1fr_1fr]">
        <div className="max-w-xl pb-2">
          <h1 className="rise font-display text-[clamp(2.15rem,9.5vw,2.6rem)] leading-[1.05] tracking-tight md:text-[3.4rem] lg:text-[4.1rem]">{t.title}</h1>
          <p className="rise rise-1 mt-5 max-w-[46ch] text-[1.05rem] leading-relaxed text-cacau-suave md:mt-6 md:text-lg">{t.intro}</p>
          <div className="rise rise-2 mt-8 grid gap-3 min-[400px]:flex min-[400px]:flex-wrap md:mt-9">
            <Link href={requestHref} className="rounded-full bg-cacau px-7 py-3.5 text-center font-medium text-acucar hover:bg-[#3a2219]">{t.quote}</Link>
            <a href={workHref} className="rounded-full border border-cacau/30 px-7 py-3.5 text-center font-medium hover:border-cacau">{t.work}</a>
          </div>
        </div>

        <div className="rise rise-3 relative mx-auto flex w-full max-w-[22rem] items-end gap-3 sm:max-w-md sm:gap-4">
          <Photo src={a?.url} alt={a?.caption ?? ''} icon="rings" tint={1} eager className="arch aspect-[3/5] w-[58%] shadow-[0_24px_48px_-24px_rgba(75,46,34,0.45)]" />
          <div className="flex w-[42%] flex-col gap-3 sm:gap-4">
            <Photo src={b?.url} alt={b?.caption ?? ''} icon="cookie" tint={2} eager className="arch aspect-[3/4] w-full" />
            <Photo src={c?.url} alt={c?.caption ?? ''} icon="platter" tint={3} eager className="aspect-square w-full rounded-[18px]" />
          </div>
        </div>
      </div>
    </section>
  )
}
