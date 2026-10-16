'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import { isApiError } from '@/lib/api/errors'
import type { MeResponse } from '@/lib/api/types'

export const sessionKey = ['session'] as const

export type Session =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'disabled'; reason: string }
  | { status: 'authenticated'; me: MeResponse }

/** The signed-in API user, or anonymous. 401 from the bridge is not an error, it is the answer. */
export function useSession(): Session {
  const query = useQuery({
    queryKey: sessionKey,
    queryFn: async (): Promise<MeResponse | null> => {
      try {
        return await api.auth.me()
      } catch (err) {
        if (isApiError(err) && err.status === 401) return null
        throw err
      }
    },
    staleTime: 60_000,
  })
  if (query.isPending) return { status: 'loading' }
  if (query.error) {
    if (isApiError(query.error) && query.error.code === 'user.disabled') return { status: 'disabled', reason: query.error.reason }
    return { status: 'anonymous' }
  }
  return query.data ? { status: 'authenticated', me: query.data } : { status: 'anonymous' }
}
