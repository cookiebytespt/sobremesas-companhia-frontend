'use client'

/**
 * Browser-side API client. Every call goes to the Next.js BFF proxy at `/api/backend/<path>`,
 * which forwards it to the Vapor API and attaches the Auth0 access token (from the server
 * session) or the guest upload token (httpOnly cookie). The browser never sees either.
 */

import { ApiError } from './errors'
import { PROXY_PREFIX } from './config'
import { documentLocale } from '@/lib/locale'
import type { MeResponse, UpdateProfileInput, Upload, UploadKind, User } from './types'

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
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

/** Same-origin route handlers that are not proxied (session bridge). */
async function localFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { Accept: 'application/json', 'Accept-Language': documentLocale(), ...(init.headers ?? {}) },
    credentials: 'same-origin',
    cache: 'no-store',
  })
  if (!res.ok) throw await ApiError.fromResponse(res)
  return (await res.json()) as T
}

export const api = {
  auth: {
    /** Session ↔ API bridge; 401 when anonymous. */
    me: () => localFetch<MeResponse>('/api/auth/me'),
  },
  me: {
    get: () => apiFetch<User>('/me'),
    update: (input: UpdateProfileInput) => apiFetch<User>('/me', { method: 'PATCH', body: input }),
    remove: () => apiFetch<void>('/me', { method: 'DELETE' }),
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
