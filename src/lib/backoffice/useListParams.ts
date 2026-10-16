'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/**
 * List-page state (filters, search, page) kept in the URL so links from the
 * dashboard, reloads and the back button all land on the same view.
 * Setting a filter resets `page` unless the change is the page itself.
 */
export function useListParams() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const get = useCallback((key: string) => params.get(key) ?? undefined, [params])
  const page = Math.max(1, Number(params.get('page') ?? '1') || 1)

  const set = useCallback(
    (changes: Record<string, string | number | undefined | null>) => {
      const next = new URLSearchParams(params.toString())
      for (const [key, value] of Object.entries(changes)) {
        if (value === undefined || value === null || value === '') next.delete(key)
        else next.set(key, String(value))
      }
      if (!('page' in changes)) next.delete('page')
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [params, pathname, router]
  )

  return useMemo(() => ({ get, set, page }), [get, set, page])
}
