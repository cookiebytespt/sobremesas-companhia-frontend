import Link from 'next/link'
import { site, whatsappUrl } from '@/content/site'
import { getDictionary, type Locale } from '@/i18n'
import { localizedPath } from '@/lib/locale'
import { Icon } from './Icon'
import { Wordmark } from './Wordmark'

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  return (
    <footer className="mt-auto bg-cacau text-acucar">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8">
        <Wordmark onDark tagline={t.common.tagline} />
        <div className="flex flex-wrap gap-x-6 gap-y-4 text-[0.95rem]">
          <a href={site.instagram} className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
            <Icon name="instagram" className="h-5 w-5" /> Instagram
          </a>
          <a href={site.facebook} className="underline-offset-4 hover:underline">Facebook</a>
          <a href={whatsappUrl()} className="inline-flex items-center gap-2 underline-offset-4 hover:underline">
            <Icon name="chat" className="h-5 w-5" /> WhatsApp {site.whatsappDisplay}
          </a>
          <Link href={localizedPath(locale, '/contact')} className="underline-offset-4 hover:underline">{t.footer.contact}</Link>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-8 text-sm text-acucar/60 md:px-8">
        © {new Date().getFullYear()} {site.name}. {t.common.siteBy}{' '}
        <a href="https://cookiebytes.pt" className="underline underline-offset-4">CookieBytes</a>.{' '}
        <span className="text-acucar/40">·</span>{' '}
        <Link href={localizedPath(locale, '/privacy')} className="underline underline-offset-4">{t.footer.privacy}</Link>
      </div>
    </footer>
  )
}
