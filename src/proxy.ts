import { NextResponse, type NextRequest } from 'next/server'
import { ACCESS_COOKIE, ACCESS_HEADER, REFRESH_COOKIE, clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies'
import { authApi } from '@/lib/auth/server'

import { LOGIN_PATH } from '@/lib/auth/paths'

/**
 * Next.js 16 name for middleware. Keeps the API session alive for the backoffice and the BFF:
 * when the short-lived access cookie is gone but the refresh cookie is there, it exchanges the
 * refresh token *before* the page or proxy call runs, stores the new pair and hands the fresh
 * access token to this same request through `x-sc-access`. Anonymous visitors to `/backoffice/**`
 * are sent to the login page. The API remains the security boundary — this is UX.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isLogin = pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`)
  const isBackofficePage = pathname.startsWith('/backoffice') && !isLogin

  const access = request.cookies.get(ACCESS_COOKIE)?.value
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value

  if (access) return NextResponse.next()

  if (refresh) {
    try {
      const tokens = await authApi.refresh(request, refresh)
      const headers = new Headers(request.headers)
      headers.set(ACCESS_HEADER, tokens.accessToken)
      const response = NextResponse.next({ request: { headers } })
      setAuthCookies(request, response.cookies, tokens)
      return response
    } catch {
      // Expired, revoked or replayed: the session is over. Fall through as anonymous.
      const response = isBackofficePage ? redirectToLogin(request, pathname + search) : NextResponse.next()
      clearAuthCookies(response.cookies)
      return response
    }
  }

  if (isBackofficePage) return redirectToLogin(request, pathname + search)
  return NextResponse.next()
}

function redirectToLogin(request: NextRequest, next: string) {
  const url = request.nextUrl.clone()
  url.pathname = LOGIN_PATH
  url.search = next && next !== '/backoffice' ? `?next=${encodeURIComponent(next)}` : ''
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/backoffice/:path*', '/api/backend/:path*'],
}
