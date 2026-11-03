import { getDictionary, type Locale } from '@/i18n'
import { publicApi } from '@/lib/api/public'
import { localizedPath } from '@/lib/locale'
import { Area } from '../home/Area'
import { Creations } from '../home/Creations'
import { Hero } from '../home/Hero'
import { MobileActionBar } from '../home/MobileActionBar'
import { QuoteCta } from '../home/QuoteCta'
import { Services } from '../home/Services'
import { Steps } from '../home/Steps'

/**
 * The website's home page (it replaces the old presentation site at sobremesasecompanhia.pt).
 * Fixed text comes from the dictionaries; occasions, services, menu items and photos from the API,
 * so the backoffice edits what visitors see.
 */
export async function HomePage({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).home
  const [occasions, services, gallery, hero] = await Promise.all([
    publicApi.occasions(locale),
    publicApi.services(locale),
    publicApi.gallery(locale, 'gallery'),
    publicApi.gallery(locale, 'hero'),
  ])
  // No hero photos chosen yet: borrow the featured (or first) gallery photos.
  const heroPhotos = hero.length >= 3 ? hero : [...gallery.filter((p) => p.featured), ...gallery.filter((p) => !p.featured)].slice(0, 3)

  return (
    <>
      <Hero t={t.hero} photos={heroPhotos} requestHref={localizedPath(locale, '/request')} workHref="#work" />
      <Creations t={t.creations} lightbox={t.lightbox} occasions={occasions} photos={gallery} />
      <Services t={t.services} services={services} locale={locale} />
      <Steps t={t.steps} />
      <Area t={t.area} />
      <QuoteCta t={t.quote} locale={locale} />
      <MobileActionBar quote={t.sticky.quote} whatsapp={t.sticky.whatsapp} requestHref={localizedPath(locale, '/request')} />
    </>
  )
}
