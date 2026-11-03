import { PageContainer } from '@/components/site/SiteFrame'
import { getPrivacy } from '@/i18n/privacy'
import type { Locale } from '@/i18n'

export function PrivacyPage({ locale }: { locale: Locale }) {
  const p = getPrivacy(locale)
  const updated = new Date(p.updated + 'T00:00:00Z').toLocaleDateString({ pt: 'pt-PT', en: 'en-GB', es: 'es-ES', fr: 'fr-FR' }[locale], { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
  return (
    <PageContainer>
    <article className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl tracking-tight text-cacau sm:text-4xl">{p.title}</h1>
      <p className="mt-2 text-sm text-cacau/50">{updated}</p>
      <p className="mt-6 text-cacau-suave">{p.intro}</p>
      {p.sections.map((s) => (
        <section key={s.title} className="mt-8">
          <h2 className="font-display text-xl text-cacau">{s.title}</h2>
          {s.paragraphs.map((para, i) => <p key={i} className="mt-3 text-cacau/90">{para}</p>)}
          {s.bullets && (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-cacau/90">
              {s.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
        </section>
      ))}
    </article>
    </PageContainer>
  )
}
