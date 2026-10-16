/**
 * Server-side configuration for talking to the Vapor API. Only import this from Route Handlers /
 * Server Components — BACKEND_URL is not exposed to the browser (it always goes through /api/backend).
 */

/** Base URL of the Vapor API, without trailing slash. Adds https:// when the env var has no scheme. */
export function backendBaseUrl(): string {
  const raw = (process.env.BACKEND_URL ?? 'http://localhost:8080').trim()
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  return withScheme.replace(/\/+$/, '')
}

/** All API routes live under this prefix on the Vapor side. */
export const API_PREFIX = '/api/v1'

/** Path the browser client prefixes every call with. */
export const PROXY_PREFIX = '/api/backend'

/**
 * httpOnly cookie holding the guest form-session token. The BFF mints it on the first upload from
 * a visitor without a session and sends it to the API as `X-Upload-Token`, so a guest request can
 * claim the photos it uploaded. Lives one day — the API purges unattached uploads after 24 h.
 */
export const UPLOAD_TOKEN_COOKIE = 'sc_upload'
export const UPLOAD_TOKEN_HEADER = 'X-Upload-Token'
export const UPLOAD_TOKEN_MAX_AGE = 60 * 60 * 24
