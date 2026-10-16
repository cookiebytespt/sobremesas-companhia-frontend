import { NextRequest, NextResponse } from 'next/server'
import { auth0 } from '@/lib/auth0'
import { isLocale } from '@/lib/locale'
import { API_PREFIX, backendBaseUrl } from '@/lib/api/config'
import type { LoginResponse, MeResponse } from '@/lib/api/types'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/me
 *
 * Bridges the Auth0 session (cookie, server-side) and the Vapor user record: calls
 * `POST /api/v1/auth/login` with the access token, which upserts the user, applies the admin
 * role and links guest requests by verified e-mail. Returns the API's user enriched with the
 * Auth0 profile as a fallback for name/email/picture. 401 when there is no session.
 */
export async function GET(req: NextRequest) {
  const session = await auth0.getSession(req)
  if (!session) {
    return NextResponse.json({ error: true, code: 'auth.unauthorized', reason: 'Não autenticado' }, { status: 401 })
  }

  const tokenRes = new NextResponse()
  let accessToken: string
  try {
    accessToken = (await auth0.getAccessToken(req, tokenRes)).token
  } catch (err) {
    console.warn('[api/auth/me] token refresh failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: true, code: 'auth.session_expired', reason: 'Sessão expirada' }, { status: 401 })
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  // The client sends the page's language; the API seeds the user's preference from it on the
  // first sign-in. A browser's own header is not forwarded, so it cannot overwrite the choice.
  const language = req.headers.get('accept-language')
  if (isLocale(language)) headers['Accept-Language'] = language

  let upstream: Response
  try {
    upstream = await fetch(`${backendBaseUrl()}${API_PREFIX}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
        picture: session.user.picture ?? undefined,
      }),
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[api/auth/me] upstream unreachable:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: true, code: 'upstream.unreachable', reason: 'Não foi possível contactar o servidor.' }, { status: 502 })
  }

  if (upstream.status === 403) {
    // Disabled account: pass the API's answer through so the client can say why.
    const body = await upstream.json().catch(() => ({ error: true, code: 'user.disabled', reason: 'Conta desativada' }))
    return NextResponse.json(body, { status: 403 })
  }
  if (!upstream.ok) {
    const text = await upstream.text()
    console.error('[api/auth/me] login failed', upstream.status, text)
    return NextResponse.json({ error: true, code: 'auth.sync_failed', reason: 'Erro ao sincronizar a sessão com o servidor' }, { status: 502 })
  }

  const login = (await upstream.json()) as LoginResponse
  const payload: MeResponse = {
    user: {
      ...login.user,
      name: login.user.name ?? session.user.name ?? null,
      email: login.user.email ?? session.user.email ?? null,
      picture: login.user.picture ?? session.user.picture ?? null,
    },
    isNewUser: login.isNewUser,
    linkedRequests: login.linkedRequests,
  }

  const res = NextResponse.json(payload, { headers: { 'cache-control': 'no-store' } })
  for (const cookie of tokenRes.headers.getSetCookie()) res.headers.append('set-cookie', cookie)
  return res
}
