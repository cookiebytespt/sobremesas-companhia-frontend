import 'server-only'
import type { NextRequest, NextResponse } from 'next/server'
import type { AuthTokens } from '@/lib/api/types'

/**
 * Where the API session lives in the browser: two httpOnly cookies the browser never reads.
 * `sc_at` is the short-lived access JWT the BFF forwards as `Authorization: Bearer`; `sc_rt` is
 * the rotating refresh token, exchanged by `src/proxy.ts` when `sc_at` is gone.
 */
export const ACCESS_COOKIE = 'sc_at'
export const REFRESH_COOKIE = 'sc_rt'
/** Request header `src/proxy.ts` sets after refreshing, so the same request can use the new token. */
export const ACCESS_HEADER = 'x-sc-access'

/** The access cookie dies a little before the token, so a request never carries an expired one. */
const ACCESS_SKEW_SECONDS = 30

type CookieJar = Pick<NextResponse['cookies'], 'set' | 'delete'>

function isSecure(req: NextRequest): boolean {
  return (req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '')) === 'https'
}

export function setAuthCookies(req: NextRequest, cookies: CookieJar, tokens: AuthTokens) {
  const base = { httpOnly: true, sameSite: 'lax' as const, secure: isSecure(req), path: '/' }
  cookies.set(ACCESS_COOKIE, tokens.accessToken, { ...base, maxAge: Math.max(tokens.expiresIn - ACCESS_SKEW_SECONDS, 30) })
  const refreshMaxAge = Math.floor((new Date(tokens.refreshExpiresAt).getTime() - Date.now()) / 1000)
  cookies.set(REFRESH_COOKIE, tokens.refreshToken, { ...base, maxAge: Math.max(refreshMaxAge, 60) })
}

export function clearAuthCookies(cookies: CookieJar) {
  cookies.delete(ACCESS_COOKIE)
  cookies.delete(REFRESH_COOKIE)
}

/** Access token for the current request: the one the proxy just minted, or the cookie. */
export function accessTokenFrom(req: NextRequest): string | undefined {
  return req.headers.get(ACCESS_HEADER) ?? req.cookies.get(ACCESS_COOKIE)?.value
}
