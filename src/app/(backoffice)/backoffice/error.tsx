'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { apiErrorMessage, isApiError } from '@/lib/api/errors'

/** A 401/403 from the API means the session or role changed mid-visit — leave instead of a dead page. */
export default function BackofficeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter()
  const forbidden = isApiError(error) && (error.status === 401 || error.status === 403)

  useEffect(() => {
    if (forbidden) router.replace('/conta')
  }, [forbidden, router])

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-display text-lg text-cacau">Algo correu mal</p>
      <p className="mt-2 text-sm text-cacau/60">{apiErrorMessage(error)}</p>
      <Button className="mt-6" onClick={reset}>Tentar novamente</Button>
    </div>
  )
}
