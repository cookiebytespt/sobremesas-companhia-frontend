import { defaultLocale, isLocale as isKnownLocale, localeInfo, locales, type Locale } from '@/i18n/config'

export type { Locale }
export { locales, defaultLocale }

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && isKnownLocale(value)
}

/** The page's language from `<html lang>` (pt-PT → pt). Portuguese outside a document (SSR, backoffice). */
export function documentLocale(): Locale {
  if (typeof document === 'undefined') return defaultLocale
  const tag = document.documentElement.lang.split('-')[0]
  return isLocale(tag) ? tag : defaultLocale
}

/** Prefix a site path for a locale: `/conta` → `/en/conta` (Portuguese is unprefixed). */
export function localizedPath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return locale === defaultLocale ? clean : `/${locale}${clean === '/' ? '' : clean}`
}

/** Auth0 login link that returns to `returnTo` and shows Universal Login in the page's language. */
export function loginHref(locale: Locale, returnTo = '/conta', options: { signup?: boolean; loginHint?: string } = {}): string {
  const params = new URLSearchParams({ returnTo: localizedPath(locale, returnTo), ui_locales: localeInfo[locale].htmlLang })
  if (options.signup) params.set('screen_hint', 'signup')
  if (options.loginHint) params.set('login_hint', options.loginHint)
  return `/auth/login?${params.toString()}`
}

/** Strips a locale prefix: `/en/conta` → `{ locale: 'en', path: '/conta' }`. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split('/')
  if (isLocale(first)) return { locale: first, path: `/${rest.join('/')}` }
  return { locale: defaultLocale, path: pathname || '/' }
}
