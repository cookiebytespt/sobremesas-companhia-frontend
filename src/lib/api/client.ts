'use client'

/**
 * Browser-side API client. Every call goes to the Next.js BFF proxy at `/api/backend/<path>`,
 * which forwards it to the Vapor API and attaches the access token (httpOnly session cookie) or
 * the guest upload token (httpOnly cookie). The browser never sees either.
 */

import { ApiError } from './errors'
import { PROXY_PREFIX } from './config'
import { documentLocale } from '@/lib/locale'
import type { ContactInput, PublicOrderCreated, PublicOrderInput, SessionInfo, SignInResponse, UpdateProfileInput, Upload, UploadKind, User } from './types'

type Json = object

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: Json | FormData
  signal?: AbortSignal
}

export function qs(query: object): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue
    params.set(key, String(value))
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}

export async function apiFetch<T>(path: string, { method = 'GET', body, signal }: RequestOptions = {}): Promise<T> {
  // Error messages come back in the page's language (`<html lang>`: pt/en/es/fr on the site, pt in the backoffice).
  const headers: Record<string, string> = { Accept: 'application/json', 'Accept-Language': documentLocale() }
  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body // the browser sets the multipart boundary
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(`${PROXY_PREFIX}${path}`, {
    method,
    headers,
    body: payload,
    signal,
    credentials: 'same-origin',
    cache: 'no-store',
  })

  if (!res.ok) throw await ApiError.fromResponse(res)
  if (res.status === 204 || res.status === 202 || res.headers.get('content-length') === '0') return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

/** Same-origin route handlers that are not proxied: the sign-in flow, which sets the session cookies. */
async function localPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Accept-Language': documentLocale() },
    body: JSON.stringify(body),
    credentials: 'same-origin',
    cache: 'no-store',
  })
  if (!res.ok) throw await ApiError.fromResponse(res)
  if (res.status === 202 || res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  auth: {
    /** Google Identity Services credential → session cookies. */
    google: (idToken: string) => localPost<SignInResponse>('/api/auth/google', { idToken }),
    /** Ask for a one-time code; resolves whatever the address is. */
    emailStart: (email: string) => localPost<void>('/api/auth/email/start', { email }),
    emailVerify: (email: string, code: string) => localPost<SignInResponse>('/api/auth/email/verify', { email, code }),
    logout: () => localPost<void>('/api/auth/logout', {}),
    /** Own profile and devices, through the proxy like everything else. */
    me: () => apiFetch<User>('/auth/me'),
    update: (input: UpdateProfileInput) => apiFetch<User>('/auth/me', { method: 'PATCH', body: input }),
    sessions: () => apiFetch<SessionInfo[]>('/auth/sessions'),
    revokeSession: (id: string) => apiFetch<void>(`/auth/sessions/${id}`, { method: 'DELETE' }),
  },
  orders: {
    /** The public form. The BFF attaches the guest upload token so photos uploaded before are claimed. */
    create: (input: PublicOrderInput) => apiFetch<PublicOrderCreated>('/orders', { method: 'POST', body: input }),
  },
  contact: {
    send: (input: ContactInput) => apiFetch<void>('/contact', { method: 'POST', body: input }),
  },
  uploads: {
    upload: (file: File, kind: UploadKind = 'request', signal?: AbortSignal) => {
      const form = new FormData()
      form.append('kind', kind)
      form.append('file', file, file.name)
      return apiFetch<Upload>('/uploads', { method: 'POST', body: form, signal })
    },
  },
}
