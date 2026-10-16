'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

/**
 * Minimal accessible modal on the native `<dialog>` element: focus trap, Escape and
 * backdrop click close it, body scroll is locked while open. No Radix dependency.
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      // React bubbles `close` through the component tree even though the DOM event does not:
      // a nested dialog closing must not close this one.
      onClose={(e) => {
        if (e.target === ref.current) onClose()
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      className={cn(
        'w-full rounded-2xl bg-white p-0 shadow-xl open:animate-fade-in',
        sizes[size]
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-linha px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-cacau">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-cacau/60">{description}</p>}
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-cacau/50 hover:bg-creme hover:text-cacau" aria-label="Fechar">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-linha px-5 py-3">{footer}</div>}
    </dialog>
  )
}
