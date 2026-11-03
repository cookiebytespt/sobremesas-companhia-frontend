import type { NextRequest } from 'next/server'
import { authApi } from '@/lib/auth/server'
import { jsonBody, respondWithTokens } from '@/lib/auth/handlers'

export const dynamic = 'force-dynamic'

/** POST /api/auth/email/verify { email, code } → API session cookies. */
export async function POST(req: NextRequest) {
  const { email, code } = await jsonBody<{ email?: string; code?: string }>(req)
  return respondWithTokens(req, () => authApi.emailVerify(req, email ?? '', code ?? ''))
}
