'use client'

import { useCallback, useEffect, useRef } from 'react'
import { fmt, type Dictionary } from '@/i18n'
import type { GalleryPhoto } from '@/lib/api/types'

/**
 * Full-screen photo viewer for the gallery: swipe left/right on phones, arrow keys or the buttons
 * elsewhere, Esc / tap outside to close. Locks the page scroll while open.
 */
export function Lightbox({ photos, index, onIndex, onClose, t }: {
  photos: GalleryPhoto[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
  t: Dictionary['home']['lightbox']
}) {
  const photo = photos[index]
  const touch = useRef<{ x: number; y: number } | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const go = useCallback((delta: number) => onIndex((index + delta + photos.length) % photos.length), [index, onIndex, photos.length])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey) }
  }, [go, onClose])

  if (!photo) return null
  const next = photos[(index + 1) % photos.length]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption}
      className="fixed inset-0 z-50 flex flex-col bg-[#1f1410]/95 text-acucar"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }}
      onTouchEnd={(e) => {
        if (!touch.current) return
        const dx = e.changedTouches[0].clientX - touch.current.x
        const dy = e.changedTouches[0].clientY - touch.current.y
        touch.current = null
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onClose()
      }}
    >
      <div className="flex items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <span className="text-sm text-acucar/70">{fmt(t.position, { n: index + 1, total: photos.length })}</span>
        <button ref={closeRef} type="button" onClick={onClose} aria-label={t.close} className="grid h-12 w-12 place-items-center rounded-full bg-acucar/10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="h-5 w-5" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2" onClick={(e) => e.target === e.currentTarget && onClose()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={photo.id} src={photo.url} alt={photo.caption} className="max-h-full max-w-full rounded-lg object-contain" />
        {/* Warm the next photo so swiping feels instant. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {next && next.id !== photo.id && <img src={next.url} alt="" aria-hidden className="hidden" />}
        {photos.length > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label={t.prev} className="absolute left-3 hidden h-12 w-12 place-items-center rounded-full bg-acucar/10 hover:bg-acucar/20 md:grid">‹</button>
            <button type="button" onClick={() => go(1)} aria-label={t.next} className="absolute right-3 hidden h-12 w-12 place-items-center rounded-full bg-acucar/10 hover:bg-acucar/20 md:grid">›</button>
          </>
        )}
      </div>
      <p className="mx-auto max-w-2xl px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-[0.95rem] leading-snug text-acucar/85">{photo.caption}</p>
    </div>
  )
}
