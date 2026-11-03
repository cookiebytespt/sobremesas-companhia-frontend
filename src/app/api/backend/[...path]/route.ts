import { randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { accessTokenFrom } from '@/lib/auth/cookies'
import { API_PREFIX, UPLOAD_TOKEN_COOKIE, UPLOAD_TOKEN_HEADER, UPLOAD_TOKEN_MAX_AGE, backendBaseUrl } from '@/lib/api/config'

/**
 * BFF proxy: /api/backend/<path> → {BACKEND_URL}/api/v1/<path>
 *
 * - Attaches `Authorization: Bearer <access token>` from the httpOnly session cookie (or the token
 *   `src/proxy.ts` just refreshed) so the browser never handles the token.
 * - For visitors without a session, mints a guest form-session token on their first upload,
 *   keeps it in an httpOnly cookie and sends it to the API as `X-Upload-Token`, so the request
 *   they submit afterwards can claim those photos.
 * - Streams the upstream body (JSON or multipart) through untouched.
 *
 * Authorization decisions stay on the Vapor side: this only forwards the caller's own token,
 * so admin routes still require an admin user.
 */

export const dynamic = 'force-dynamic'

const DROP_REQUEST_HEADERS = new Set([
  'host', 'connection', 'cookie', 'authorization', 'content-length',
  'accept-encoding', 'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto',
  'x-real-ip', 'x-vercel-id', 'x-vercel-forwarded-for', 'x-upload-token', 'x-sc-access',
])

const DROP_RESPONSE_HEADERS = new Set([
  'connection', 'content-length', 'content-encoding', 'transfer-encoding',
  'set-cookie', 'access-control-allow-origin', 'access-control-allow-credentials',
])

async function handler(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params
  const upstream = new URL(`${backendBaseUrl()}${API_PREFIX}/${path.map(encodeURIComponent).join('/')}`)
  upstream.search = req.nextUrl.search

  const headers = new Headers()
  req.headers.forEach((value, key) => {
    if (!DROP_REQUEST_HEADERS.has(key.toLowerCase())) headers.set(key, value)
  })
  headers.set('accept', req.headers.get('accept') ?? 'application/json')
  // The API rate-limits public routes per client address; tell it who is really calling.
  const clientIp = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip')
  if (clientIp) headers.set('x-forwarded-for', clientIp)

  const accessToken = accessTokenFrom(req)
  if (accessToken) headers.set('authorization', `Bearer ${accessToken}`)
  const session = Boolean(accessToken)

  // Guest form session: the token travels on uploads and on the request submission that claims them.
  let uploadToken = req.cookies.get(UPLOAD_TOKEN_COOKIE)?.value
  let mintedToken = false
  const isGuestUploadFlow = path[0] === 'uploads' || path[0] === 'orders'
  if (!session && isGuestUploadFlow && req.method === 'POST') {
    if (!uploadToken) {
      uploadToken = randomBytes(24).toString('base64url')
      mintedToken = true
    }
  }
  if (uploadToken && isGuestUploadFlow) headers.set(UPLOAD_TOKEN_HEADER, uploadToken)

  const hasBody = !['GET', 'HEAD'].includes(req.method)
  let upstreamRes: Response
  try {
    upstreamRes = await fetch(upstream, {
      method: req.method,
      headers,
      body: hasBody ? req.body : undefined,
      ...(hasBody ? { duplex: 'half' } : {}),
      redirect: 'manual',
      cache: 'no-store',
    } as RequestInit)
  } catch (err) {
    console.error('[api/backend] upstream unreachable:', upstream.origin, err instanceof Error ? err.message : err)
    return NextResponse.json(
      { error: true, code: 'upstream.unreachable', reason: 'Não foi possível contactar o servidor.' },
      { status: 502 }
    )
  }

  const resHeaders = new Headers()
  upstreamRes.headers.forEach((value, key) => {
    if (!DROP_RESPONSE_HEADERS.has(key.toLowerCase())) resHeaders.set(key, value)
  })
  resHeaders.set('cache-control', 'no-store')

  const res = new NextResponse(upstreamRes.body, { status: upstreamRes.status, headers: resHeaders })

  if (mintedToken && uploadToken && upstreamRes.ok) {
    res.cookies.set(UPLOAD_TOKEN_COOKIE, uploadToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: (req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '')) === 'https',
      path: '/',
      maxAge: UPLOAD_TOKEN_MAX_AGE,
    })
  }

  return res
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE }
