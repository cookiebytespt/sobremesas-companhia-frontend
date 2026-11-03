import type { NextRequest } from 'next/server'
import { authApi } from '@/lib/auth/server'
import { jsonBody, respondWithTokens } from '@/lib/auth/handlers'

export const dynamic = 'force-dynamic'

/** POST /api/auth/google { idToken } — Google Identity Services credential → API session cookies. */
export async function POST(req: NextRequest) {
  const { idToken } = await jsonBody<{ idToken?: string }>(req)
  return respondWithTokens(req, () => authApi.google(req, idToken ?? ''))
}
