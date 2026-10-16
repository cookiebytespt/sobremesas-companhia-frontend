'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tone = 'success' | 'error'
interface Toast { id: number; tone: Tone; message: string }

const ToastContext = createContext<{ push: (tone: Tone, message: string) => void } | null>(null)

/** Small toast stack, bottom-right. Mounted once by BackofficeProviders. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((tone: Tone, message: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, tone, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 6000 : 3500)
  }, [])

  const value = useMemo(() => ({ push }), [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg animate-slide-up',
              t.tone === 'success' ? 'border-po bg-white text-cacau' : 'border-merengue bg-white text-cacau'
            )}
          >
            {t.tone === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-po-fundo" aria-hidden />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#b4534b]" aria-hidden />
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return useMemo(
    () => ({
      success: (message: string) => ctx.push('success', message),
      error: (message: string) => ctx.push('error', message),
    }),
    [ctx]
  )
}
