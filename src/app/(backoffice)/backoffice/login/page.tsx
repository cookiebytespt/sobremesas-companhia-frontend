import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import LoginForm from '@/components/backoffice/LoginForm'
import { Icon } from '@/components/site/Icon'
import { getBackofficeSession } from '@/lib/backoffice/session'
import { AFTER_LOGIN_PATH } from '@/lib/auth/paths'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Entrar · Backoffice Sobremesas & Companhia',
  robots: { index: false, follow: false },
}

/** The only unguarded backoffice page. Someone already signed in goes straight to the dashboard. */
export default async function LoginPage() {
  const session = await getBackofficeSession()
  if (session.status === 'admin') redirect(AFTER_LOGIN_PATH)

  return (
    <main className="grid min-h-screen place-items-center bg-cacau px-4 py-10 text-acucar">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-acucar/10">
            <Icon name="whisk" className="h-6 w-6" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg">Sobremesas &amp; Companhia</p>
            <p className="text-[11px] uppercase tracking-wider text-acucar/50">Backoffice</p>
          </div>
        </div>
        <div className="rounded-2xl bg-acucar p-6 text-cacau shadow-xl sm:p-8">
          <Suspense>
            <LoginForm googleClientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? null} />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-acucar/40">Acesso reservado à equipa. Sem palavras-passe: entra com a conta Google do seu e-mail ou com um código enviado por e-mail.</p>
      </div>
    </main>
  )
}
