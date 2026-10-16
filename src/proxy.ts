import type { NextRequest } from 'next/server'
import { auth0 } from './lib/auth0'

/**
 * Next.js 16 name for middleware. Auth0 mounts `/auth/login`, `/auth/callback`, `/auth/logout`,
 * `/auth/profile`, `/auth/access-token` and rolls the session cookie on every other request.
 * Languages are plain route segments here (`/en/conta`), so nothing else runs at the edge.
 */
export async function proxy(request: NextRequest) {
  return auth0.middleware(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
