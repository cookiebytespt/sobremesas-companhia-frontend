import Link from 'next/link'
import { serviceIcons } from '@/content/site'
import type { Dictionary, Locale } from '@/i18n'
import type { Service } from '@/lib/api/types'
import { localizedPath } from '@/lib/locale'
import { Icon } from '../Icon'

const MAX_ITEMS = 8

/** The services offered in the request form, with a taste of each menu and a shortcut into the form. */
export function Services({ t, services, locale }: { t: Dictionary['home']['services']; services: Service[]; locale: Locale }) {
  if (services.length === 0) return null
  return (
    <section id="services" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 pb-16 md:px-8 md:pb-28">
        <div className="max-w-xl">
          <h2 className="font-display text-4xl leading-tight tracking-tight md:text-5xl">{t.title}</h2>
          <p className="mt-4 text-lg leading-relaxed text-cacau-suave">{t.intro}</p>
        </div>
        <ul className="mt-10 grid gap-5 md:mt-12 md:grid-cols-2">
          {services.map((s) => {
            const items = s.items.slice(0, MAX_ITEMS)
            return (
              <li key={s.id} className="flex flex-col rounded-3xl border border-cacau/10 bg-[#fbf6f1] p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <span className="scallop-badge grid h-14 w-14 shrink-0 place-items-center bg-po text-cacau">
                    <Icon name={s.icon ?? serviceIcons[s.slug] ?? 'whisk'} className="h-6 w-6" />
                  </span>
                  <h3 className="font-display text-2xl leading-snug">{s.name}</h3>
                </div>
                {s.description && <p className="mt-4 leading-relaxed text-cacau-suave">{s.description}</p>}
                {items.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {items.map((i) => (
                      <li key={i.id} className="rounded-full border border-cacau/15 bg-acucar px-3 py-1.5 text-sm">{i.name}</li>
                    ))}
                    {s.items.length > MAX_ITEMS && <li className="px-1 py-1.5 text-sm text-cacau-suave">{t.andMore}</li>}
                  </ul>
                )}
                <div className="mt-auto pt-6">
                  <Link href={`${localizedPath(locale, '/request')}?service=${encodeURIComponent(s.slug)}`} className="inline-flex min-h-11 items-center gap-1.5 text-[0.95rem] font-medium underline underline-offset-4">
                    {t.ask} <span aria-hidden>→</span>
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
