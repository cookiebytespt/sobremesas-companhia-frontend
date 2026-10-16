'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isApiError } from '@/lib/api/errors'
import { ToastProvider } from '@/components/backoffice/Toaster'
import { CurrentUserProvider } from '@/components/backoffice/CurrentUser'
import type { User } from '@/lib/api/types'

/** TanStack Query for the backoffice only — the storefront keeps its server-fetch pattern. */
export default function BackofficeProviders({ user, children }: { user: User; children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            refetchOnWindowFocus: true,
            // Auth/permission errors will not fix themselves; everything else gets one retry.
            retry: (count, err) => !(isApiError(err) && (err.status === 401 || err.status === 403)) && count < 1,
          },
        },
      })
  )
  return (
    <QueryClientProvider client={client}>
      <CurrentUserProvider user={user}>
        <ToastProvider>{children}</ToastProvider>
      </CurrentUserProvider>
    </QueryClientProvider>
  )
}
