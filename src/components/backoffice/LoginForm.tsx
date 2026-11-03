'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/input'
import { api } from '@/lib/api/client'
import { apiErrorMessage, isApiError } from '@/lib/api/errors'
import { AFTER_LOGIN_PATH } from '@/lib/auth/paths'

/**
 * Google Identity Services button + e-mail code fallback. Both end in `/api/auth/*` route
 * handlers that set the session cookies; the browser never sees a token.
 */
export default function LoginForm({ googleClientId }: { googleClientId: string | null }) {
  const router = useRouter()
  const params = useSearchParams()
  const next = safeNext(params.get('next'))
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [step, setStep] = useState<'start' | 'code'>('start')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState<'google' | 'start' | 'verify' | null>(null)
  const [error, setError] = useState<string | null>(params.get('error'))
  const [info, setInfo] = useState<string | null>(null)

  const finish = useCallback(() => {
    router.replace(next)
    router.refresh()
  }, [router, next])

  const onGoogle = useCallback(async (credential: string) => {
    setBusy('google'); setError(null)
    try {
      await api.auth.google(credential)
      finish()
    } catch (err) {
      setError(friendlyError(err))
      setBusy(null)
    }
  }, [finish])

  const startCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy('start'); setError(null)
    try {
      await api.auth.emailStart(email.trim())
      setStep('code')
      setInfo('Se este e-mail tiver acesso, recebe um código de 6 dígitos nos próximos instantes.')
    } catch (err) {
      setError(friendlyError(err))
    } finally {
      setBusy(null)
    }
  }

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy('verify'); setError(null)
    try {
      await api.auth.emailVerify(email.trim(), code)
      finish()
    } catch (err) {
      setError(friendlyError(err))
      setBusy(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl">Entrar</h1>
        <p className="mt-1 text-sm text-cacau/60">{step === 'start' ? 'Use a conta Google do seu e-mail de trabalho ou peça um código.' : `Introduza o código que enviámos para ${email.trim()}.`}</p>
      </div>

      {error && <p className="rounded-lg bg-[#f3dcd9] px-3 py-2 text-sm text-[#7a2e27]">{error}</p>}

      {step === 'start' ? (
        <>
          {googleClientId ? (
            <GoogleButton clientId={googleClientId} onCredential={onGoogle} disabled={busy !== null} />
          ) : (
            <p className="rounded-lg bg-creme px-3 py-2 text-xs text-cacau/60">Entrada com Google não configurada neste ambiente — use o código por e-mail.</p>
          )}
          <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-cacau/40">
            <span className="h-px flex-1 bg-linha" /> ou <span className="h-px flex-1 bg-linha" />
          </div>
          <form onSubmit={startCode} className="space-y-4">
            <Field label="E-mail" htmlFor="login-email">
              <Input id="login-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@sobremesasecompanhia.pt" />
            </Field>
            <Button type="submit" variant="secondary" className="w-full" loading={busy === 'start'} disabled={!email.trim() || busy !== null}>
              Receber código por e-mail
            </Button>
          </form>
        </>
      ) : (
        <form onSubmit={verifyCode} className="space-y-4">
          {info && (
            <p className="flex items-start gap-2 rounded-lg bg-creme px-3 py-2 text-sm text-cacau/80">
              <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-po-fundo" aria-hidden /> {info}
            </p>
          )}
          <Field label="Código" htmlFor="login-code">
            <Input
              id="login-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onPaste={(e) => { e.preventDefault(); setCode(e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)) }}
              className="text-center font-mono text-xl tracking-[0.4em]"
            />
          </Field>
          <Button type="submit" className="w-full" loading={busy === 'verify'} disabled={code.length < 6 || busy !== null}>
            Entrar
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => { setStep('start'); setCode(''); setInfo(null); setError(null) }} className="inline-flex items-center gap-1 text-cacau/60 hover:text-cacau">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
            </button>
            <button type="button" onClick={startCode} disabled={busy !== null} className="text-cacau/60 underline-offset-2 hover:text-cacau hover:underline disabled:opacity-50">
              Reenviar código
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

/** Only same-origin paths inside the backoffice are followed after sign-in. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith('/backoffice') || value.startsWith('//')) return AFTER_LOGIN_PATH
  return value
}

function friendlyError(err: unknown): string {
  if (isApiError(err)) {
    switch (err.code) {
      case 'auth.not_invited': return 'Este e-mail não tem acesso ao backoffice. Peça a um administrador para o convidar.'
      case 'auth.invalid_code': return 'Código inválido ou expirado. Peça um novo código.'
      case 'auth.too_many_requests': return 'Demasiadas tentativas. Aguarde alguns minutos e tente de novo.'
      case 'auth.google_not_configured': return 'A entrada com Google não está disponível; use o código por e-mail.'
      case 'upstream.unreachable': return 'Não foi possível contactar o servidor. Tente de novo dentro de momentos.'
    }
  }
  return apiErrorMessage(err)
}

// MARK: Google Identity Services

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; ux_mode?: 'popup'; auto_select?: boolean; itp_support?: boolean }) => void
          renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void
          prompt?: () => void
        }
      }
    }
  }
}

const GSI_SRC = 'https://accounts.google.com/gsi/client'

function GoogleButton({ clientId, onCredential, disabled }: { clientId: string; onCredential: (credential: string) => void; disabled: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    const render = () => {
      if (cancelled || !host.current || !window.google) return
      window.google.accounts.id.initialize({ client_id: clientId, callback: ({ credential }) => onCredential(credential), ux_mode: 'popup', itp_support: true })
      host.current.innerHTML = ''
      window.google.accounts.id.renderButton(host.current, { theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill', locale: 'pt-PT', width: Math.min(host.current.clientWidth || 320, 400) })
      setReady(true)
    }
    if (window.google) {
      render()
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`)
      if (!script) {
        script = document.createElement('script')
        script.src = GSI_SRC
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', render)
      script.addEventListener('error', () => setFailed(true))
    }
    return () => { cancelled = true }
  }, [clientId, onCredential])

  if (failed) return <p className="rounded-lg bg-creme px-3 py-2 text-xs text-cacau/60">Não foi possível carregar a entrada com Google. Use o código por e-mail.</p>
  return (
    <div className={disabled ? 'pointer-events-none opacity-60' : undefined}>
      <div ref={host} className="flex min-h-[44px] justify-center" />
      {!ready && <p className="text-center text-xs text-cacau/40">A carregar o botão Google…</p>}
    </div>
  )
}
