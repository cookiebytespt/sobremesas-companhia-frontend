import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getBackofficeSession } from '@/lib/backoffice/session'
import BackofficeProviders from '@/components/backoffice/BackofficeProviders'
import BackofficeShell from '@/components/backoffice/BackofficeShell'
import { LOGIN_PATH } from '@/lib/auth/paths'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Backoffice', template: '%s · Backoffice Sobremesas & Companhia' },
  robots: { index: false, follow: false },
}

/**
 * Guards every `/backoffice/**` page except `/backoffice/login`: anonymous → login page, disabled
 * account → login page with the reason. UX only — the API enforces the admin role on every `/admin/*` call.
 */
export default async function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const session = await getBackofficeSession()
  if (session.status === 'anonymous') redirect(LOGIN_PATH)
  if (session.status === 'disabled') redirect(`${LOGIN_PATH}?erro=${encodeURIComponent(session.reason)}`)

  return (
    <BackofficeProviders user={session.user}>
      <BackofficeShell user={session.user}>{children}</BackofficeShell>
    </BackofficeProviders>
  )
}
