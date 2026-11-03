import 'server-only'
import { cookies, headers } from 'next/headers'
import { ACCESS_COOKIE, ACCESS_HEADER } from '@/lib/auth/cookies'
import { fetchMe } from '@/lib/auth/server'
import type { User } from '@/lib/api/types'

export type BackofficeSession =
  | { status: 'anonymous' }
  | { status: 'disabled'; reason: string }
  | { status: 'admin'; user: User }

/**
 * Resolves the API user for the current request from a Server Component. `src/proxy.ts` has
 * already refreshed the access token if it had expired (and passes it in `x-sc-access`), so this
 * only reads it and asks the API who it belongs to. Called by the backoffice layout on every request.
 */
export async function getBackofficeSession(): Promise<BackofficeSession> {
  const token = (await headers()).get(ACCESS_HEADER) ?? (await cookies()).get(ACCESS_COOKIE)?.value
  if (!token) return { status: 'anonymous' }
  const me = await fetchMe(token)
  if (!me) return { status: 'anonymous' }
  if ('error' in me) return { status: 'disabled', reason: me.error.reason }
  return me.user.role === 'admin' ? { status: 'admin', user: me.user } : { status: 'anonymous' }
}
