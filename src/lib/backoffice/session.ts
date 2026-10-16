import 'server-only'
import { auth0 } from '@/lib/auth0'
import { API_PREFIX, backendBaseUrl } from '@/lib/api/config'
import type { LoginResponse, User } from '@/lib/api/types'

export type BackofficeSession =
  | { status: 'anonymous' }
  | { status: 'forbidden'; user: User }
  | { status: 'admin'; user: User }

/**
 * Resolves the API user for the current Auth0 session from a Server Component. Same contract as
 * `/api/auth/me`. Called from the backoffice layout on every request — the role lives in the API's
 * database, not in the Auth0 token, so this is the only place that can decide it.
 */
export async function getBackofficeSession(): Promise<BackofficeSession> {
  const session = await auth0.getSession()
  if (!session) return { status: 'anonymous' }

  let accessToken: string
  try {
    accessToken = (await auth0.getAccessToken()).token
  } catch {
    return { status: 'anonymous' }
  }

  const res = await fetch(`${backendBaseUrl()}${API_PREFIX}/auth/login`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      email: session.user.email ?? undefined,
      name: session.user.name ?? undefined,
      picture: session.user.picture ?? undefined,
    }),
    cache: 'no-store',
  })
  if (res.status === 401 || res.status === 403) return { status: 'anonymous' }
  if (!res.ok) throw new Error(`API login failed: ${res.status}`)

  const { user } = (await res.json()) as LoginResponse
  return user.role === 'admin' ? { status: 'admin', user } : { status: 'forbidden', user }
}
