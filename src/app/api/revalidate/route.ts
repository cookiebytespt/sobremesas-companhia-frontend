import { timingSafeEqual } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

/**
 * Called by the API (`ContentChanges.swift`) after every backoffice edit of occasions, services,
 * menu items or photos: `POST {secret, tags}`. Purges the cached public pages (home, request form)
 * in every language so the website shows the change right away instead of within 5 minutes.
 */
export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET
  if (!expected) return NextResponse.json({ error: true, reason: 'revalidation not configured' }, { status: 503 })
  const body = (await request.json().catch(() => null)) as { secret?: unknown } | null
  const given = typeof body?.secret === 'string' ? Buffer.from(body.secret) : Buffer.alloc(0)
  const want = Buffer.from(expected)
  if (given.length !== want.length || !timingSafeEqual(given, want)) {
    return NextResponse.json({ error: true, reason: 'forbidden' }, { status: 403 })
  }
  revalidatePath('/', 'layout')
  return NextResponse.json({ revalidated: true })
}
