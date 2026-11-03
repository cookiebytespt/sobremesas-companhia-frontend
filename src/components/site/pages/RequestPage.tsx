import { RequestForm } from '@/components/site/RequestForm'
import { PageContainer } from '@/components/site/SiteFrame'
import { getDictionary, type Locale } from '@/i18n'
import { publicApi } from '@/lib/api/public'

/** Server page: loads the offering in the page's language and hands it to the form. */
export async function RequestPage({ locale, occasion, service }: { locale: Locale; occasion?: string; service?: string }) {
  const t = getDictionary(locale).request
  const [occasions, services] = await Promise.all([publicApi.occasions(locale), publicApi.services(locale)])
  return (
    <PageContainer>
    <div className="mx-auto max-w-2xl lg:max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-po-fundo">{t.kicker}</p>
      <h1 className="mt-2 font-display text-3xl tracking-tight text-cacau sm:text-4xl">{t.title}</h1>
      <p className="mt-3 text-cacau-suave">{t.intro}</p>
      <div className="mt-10">
        <RequestForm locale={locale} occasions={occasions.filter((o) => o.shownInForm)} services={services} presetOccasion={occasion} presetService={service} />
      </div>
    </div>
    </PageContainer>
  )
}
