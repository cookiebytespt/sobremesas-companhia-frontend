import { NextResponse, type NextRequest } from 'next/server'
import { authApi } from '@/lib/auth/server'
import { errorResponse, jsonBody } from '@/lib/auth/handlers'

export const dynamic = 'force-dynamic'

/** POST /api/auth/email/start { email } — asks the API to e-mail a one-time code. Always 202 for known or unknown addresses. */
export async function POST(req: NextRequest) {
  const { email } = await jsonBody<{ email?: string }>(req)
  try {
    await authApi.emailStart(req, email ?? '')
    return new NextResponse(null, { status: 202 })
  } catch (err) {
    return errorResponse(err)
  }
}
