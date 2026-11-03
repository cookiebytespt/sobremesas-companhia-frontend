import { NextResponse, type NextRequest } from 'next/server'
import { REFRESH_COOKIE, clearAuthCookies } from '@/lib/auth/cookies'
import { authApi } from '@/lib/auth/server'
import { LOGIN_PATH } from '@/lib/auth/paths'

export const dynamic = 'force-dynamic'

/** POST /api/auth/logout — revokes the API session and clears the cookies. GET does the same and redirects to the login page. */
export async function POST(req: NextRequest) {
  await revoke(req)
  const res = new NextResponse(null, { status: 204 })
  clearAuthCookies(res.cookies)
  return res
}

export async function GET(req: NextRequest) {
  await revoke(req)
  const url = req.nextUrl.clone()
  url.pathname = LOGIN_PATH
  url.search = ''
  const res = NextResponse.redirect(url)
  clearAuthCookies(res.cookies)
  return res
}

async function revoke(req: NextRequest) {
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value
  if (refresh) await authApi.logout(refresh)
}
