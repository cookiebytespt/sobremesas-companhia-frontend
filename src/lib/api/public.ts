import 'server-only'
import { API_PREFIX, backendBaseUrl } from '@/lib/api/config'
import type { GalleryPhoto, GalleryPlacement, Locale, Occasion, Service } from '@/lib/api/types'

/**
 * Server-side reads of the public offering, in the page's language. Cached for five minutes
 * (`POST /api/revalidate`, called by the API after every backoffice edit, purges them at once).
 */
async function get<T>(path: string, locale: Locale, fallback: T, query: Record<string, string> = {}): Promise<T> {
  try {
    const qs = new URLSearchParams({ ...query, lang: locale })
    const res = await fetch(`${backendBaseUrl()}${API_PREFIX}${path}?${qs}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300, tags: ['offering'] },
    })
    if (!res.ok) return fallback
    return (await res.json()) as T
  } catch {
    return fallback
  }
}

export const publicApi = {
  occasions: (locale: Locale) => get<Occasion[]>('/occasions', locale, []),
  services: (locale: Locale) => get<Service[]>('/services', locale, []),
  /** Published photos in the backoffice's order; `placement: 'hero'` = the three photos beside the home headline. */
  gallery: (locale: Locale, placement: GalleryPlacement = 'gallery') => get<GalleryPhoto[]>('/gallery', locale, [], { placement }),
}
