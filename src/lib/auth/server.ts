import 'server-only'
import { API_PREFIX, backendBaseUrl } from '@/lib/api/config'
import type { ApiErrorBody, AuthTokens, User } from '@/lib/api/types'

/** Server-side calls to the API's `/auth/*` routes (never from the browser; it goes through `/api/auth/*`). */

export class UpstreamAuthError extends Error {
  constructor(public readonly status: number, public readonly body: ApiErrorBody) {
    super(body.reason)
  }
}

async function post<T>(path: string, body: object, extraHeaders: Record<string, string> = {}): Promise<T> {
  const res = await fetch(`${backendBaseUrl()}${API_PREFIX}/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...extraHeaders },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) {
    const parsed = (await res.json().catch(() => null)) as ApiErrorBody | null
    throw new UpstreamAuthError(res.status, parsed ?? { error: true, code: `http.${res.status}`, reason: 'Erro ao contactar o servidor.' })
  }
  if (res.status === 204 || res.status === 202) return undefined as T
  return (await res.json()) as T
}

/** Forwards the browser's address so the API's rate limits count the real client, not Vercel. */
function clientHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {}
  const forwarded = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip')
  if (forwarded) headers['X-Forwarded-For'] = forwarded
  const ua = req.headers.get('user-agent')
  if (ua) headers['User-Agent'] = ua
  return headers
}

export const authApi = {
  google: (req: Request, idToken: string) => post<AuthTokens>('google', { idToken }, clientHeaders(req)),
  emailStart: (req: Request, email: string) => post<void>('email/start', { email }, clientHeaders(req)),
  emailVerify: (req: Request, email: string, code: string) => post<AuthTokens>('email/verify', { email, code }, clientHeaders(req)),
  refresh: (req: Request, refreshToken: string) => post<AuthTokens>('refresh', { refreshToken }, clientHeaders(req)),
  logout: (refreshToken: string) => post<void>('logout', { refreshToken }).catch(() => undefined),
}

/** `GET /auth/me` with an access token; `null` when the token is not accepted. */
export async function fetchMe(accessToken: string): Promise<{ user: User } | { error: ApiErrorBody } | null> {
  const res = await fetch(`${backendBaseUrl()}${API_PREFIX}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    cache: 'no-store',
  })
  if (res.status === 401) return null
  if (res.status === 403) return { error: (await res.json()) as ApiErrorBody }
  if (!res.ok) throw new Error(`API /auth/me failed: ${res.status}`)
  return { user: (await res.json()) as User }
}
