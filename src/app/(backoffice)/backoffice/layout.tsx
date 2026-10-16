import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getBackofficeSession } from '@/lib/backoffice/session'
import BackofficeProviders from '@/components/backoffice/BackofficeProviders'
import BackofficeShell from '@/components/backoffice/BackofficeShell'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Backoffice', template: '%s · Backoffice Sobremesas & Companhia' },
  robots: { index: false, follow: false },
}

/**
 * Guards every `/backoffice/**` page: anonymous → Auth0 login (back here afterwards), signed-in
 * non-admin → the client area. UX only — the API enforces the admin role on every `/admin/*` call.
 */
export default async function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const session = await getBackofficeSession()
  if (session.status === 'anonymous') redirect('/auth/login?returnTo=/backoffice&ui_locales=pt-PT')
  if (session.status === 'forbidden') redirect('/conta')

  return (
    <BackofficeProviders user={session.user}>
      <BackofficeShell user={session.user}>{children}</BackofficeShell>
    </BackofficeProviders>
  )
}
