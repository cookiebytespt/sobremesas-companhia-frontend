'use client'

import { useState } from 'react'
import { site } from '@/content/site'
import { fmt, type Dictionary } from '@/i18n'
import type { GalleryPhoto, Occasion } from '@/lib/api/types'
import { Icon } from '../Icon'
import { Photo } from '../Photo'
import { Lightbox } from './Lightbox'

const PAGE = 12

/** The gallery with the occasion filter (scalloped badges), 12 photos at a time. */
export function Creations({ t, lightbox, occasions, photos }: { t: Dictionary['home']['creations']; lightbox: Dictionary['home']['lightbox']; occasions: Occasion[]; photos: GalleryPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const [visible, setVisible] = useState(PAGE)
  // Only occasions with photos are worth a filter.
  const filters = occasions.filter((o) => photos.some((p) => p.occasion === o.slug))
  const items = active ? photos.filter((p) => p.occasion === active) : photos
  const shown = items.slice(0, visible)
  const select = (slug: string | null) => {
    setOpen(null)
    setActive(slug)
    setVisible(PAGE)
  }
  const iconFor = (slug: string) => occasions.find((o) => o.slug === slug)?.icon ?? 'whisk'

  return (
    <section id="work" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 md:px-8 md:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <h2 className="font-display text-4xl leading-tight tracking-tight md:text-5xl">{t.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-cacau-suave">{t.intro}</p>
        </div>
        <a href={site.instagram} className="inline-flex items-center gap-2 text-[0.95rem] underline underline-offset-4">
          <Icon name="instagram" className="h-5 w-5" />
          {t.instagram}
        </a>
      </div>

      {filters.length > 1 && (
        <div role="group" aria-label={t.filter} className="no-scrollbar fade-edge -mx-5 mt-10 flex snap-x scroll-px-5 gap-4 overflow-x-auto px-5 pb-3 md:mx-0 md:mt-12 md:justify-between md:px-0">
          {filters.map((o) => {
            const selected = active === o.slug
            return (
              <button key={o.id} type="button" aria-pressed={selected} onClick={() => select(selected ? null : o.slug)} className="group flex shrink-0 snap-start flex-col items-center gap-2.5 rounded-lg">
                <span className={`scallop-badge grid h-[72px] w-[72px] place-items-center transition-colors md:h-24 md:w-24 ${selected ? 'bg-cacau text-acucar' : 'bg-po text-cacau group-hover:bg-[#c3d8e8]'}`}>
                  <Icon name={o.icon ?? 'whisk'} className="h-7 w-7 md:h-8 md:w-8" />
                </span>
                <span className={`text-[0.9rem] md:text-[0.95rem] ${selected ? 'font-semibold' : ''}`}>{o.name}</span>
              </button>
            )
          })}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {active ? fmt(t.showingOccasion, { count: items.length, occasion: occasions.find((o) => o.slug === active)?.name ?? '' }) : t.showingAll}
      </p>

      <div className="mt-8 columns-2 gap-3 md:mt-12 md:columns-3 md:gap-5 lg:columns-4">
        {shown.map((p, i) => (
          <figure key={p.id} className="mb-3 break-inside-avoid md:mb-5">
            <button type="button" onClick={() => setOpen(i)} aria-label={`${lightbox.open}: ${p.caption}`} className="block w-full overflow-hidden rounded-xl md:rounded-2xl">
              <Photo src={p.url} alt={p.caption} width={p.width} height={p.height} icon={iconFor(p.occasion)} tint={i % 3} className={`w-full transition-transform duration-500 hover:scale-[1.03] ${p.tall ? 'aspect-[4/5]' : 'aspect-square'}`} />
            </button>
          </figure>
        ))}
      </div>

      {shown.length < items.length && (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={() => setVisible((v) => v + PAGE)} className="min-h-12 w-full rounded-full border border-cacau/30 px-7 py-3.5 sm:w-auto font-medium hover:border-cacau">
            {fmt(t.more, { count: items.length - shown.length })}
          </button>
        </div>
      )}
      {active && (
        <button type="button" onClick={() => select(null)} className="mt-4 min-h-11 text-[0.95rem] underline underline-offset-4">{t.showAll}</button>
      )}
      {open !== null && <Lightbox photos={items} index={open} onIndex={setOpen} onClose={() => setOpen(null)} t={lightbox} />}
    </section>
  )
}
