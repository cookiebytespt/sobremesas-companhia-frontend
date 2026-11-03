import 'server-only'
import { NextResponse, type NextRequest } from 'next/server'
import { clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies'
import { UpstreamAuthError } from '@/lib/auth/server'
import type { AuthTokens } from '@/lib/api/types'

/** Shared shape of the `/api/auth/*` route handlers: run the exchange, store the cookies, answer with the user. */
export async function respondWithTokens(req: NextRequest, exchange: () => Promise<AuthTokens>) {
  try {
    const tokens = await exchange()
    const res = NextResponse.json({ user: tokens.user }, { headers: { 'cache-control': 'no-store' } })
    setAuthCookies(req, res.cookies, tokens)
    return res
  } catch (err) {
    return errorResponse(err)
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof UpstreamAuthError) {
    const res = NextResponse.json(err.body, { status: err.status })
    if (err.status === 401) clearAuthCookies(res.cookies)
    return res
  }
  console.error('[api/auth] upstream failure:', err instanceof Error ? err.message : err)
  return NextResponse.json({ error: true, code: 'upstream.unreachable', reason: 'Não foi possível contactar o servidor.' }, { status: 502 })
}

export async function jsonBody<T extends object>(req: NextRequest): Promise<T> {
  return ((await req.json().catch(() => ({}))) ?? {}) as T
}
