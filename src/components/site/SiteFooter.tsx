import { getDictionary, type Locale } from '@/i18n'

export function SiteFooter({ locale }: { locale: Locale }) {
  const t = getDictionary(locale)
  return (
    <footer className="mt-auto border-t border-linha py-6 text-center text-xs text-cacau/60">
      <p>
        © {new Date().getFullYear()} Sobremesas &amp; Companhia. {t.footer.rights}{' '}
        <span className="text-cacau/40">·</span> {t.common.siteBy}{' '}
        <a href="https://cookiebytes.pt" className="underline-offset-2 hover:underline">CookieBytes</a>
      </p>
    </footer>
  )
}
