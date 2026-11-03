import 'server-only'
import { API_PREFIX, backendBaseUrl } from '@/lib/api/config'
import type { Locale, Occasion, Service } from '@/lib/api/types'

/**
 * Server-side reads of the public offering, in the page's language. Cached for five minutes
 * (the backoffice edits these rarely; `POST /api/revalidate` will shorten that in phase 6).
 */
async function get<T>(path: string, locale: Locale, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${backendBaseUrl()}${API_PREFIX}${path}?lang=${locale}`, {
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
}
