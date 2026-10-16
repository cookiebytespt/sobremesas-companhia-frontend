'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isApiError } from '@/lib/api/errors'

/** TanStack Query for the site and the client area (session, requests, threads). */
export default function SiteProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            retry: (count, err) => !(isApiError(err) && (err.status === 401 || err.status === 403)) && count < 1,
          },
        },
      })
  )
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
