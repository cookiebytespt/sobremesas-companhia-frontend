'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { Field, Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/backoffice/Toaster'
import { apiErrorMessage } from '@/lib/api/errors'
import type { InviteResult } from '@/lib/api/types'
import { useCreateUser } from '@/lib/backoffice/queries'

/** "Convidar": creates the staff account and e-mails the login link (Google or e-mail code — no password). */
export default function InviteUserDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: (result: InviteResult) => void }) {
  const toast = useToast()
  const create = useCreateUser()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sendEmail, setSendEmail] = useState(true)
  const [result, setResult] = useState<InviteResult | null>(null)
  const [copied, setCopied] = useState(false)

  const reset = () => {
    setEmail(''); setName(''); setPhone(''); setSendEmail(true); setResult(null); setCopied(false)
  }
  const close = () => { reset(); onClose() }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const r = await create.mutateAsync({ email: email.trim(), name: name.trim() || undefined, phone: phone.trim() || undefined, sendEmail })
      setResult(r)
      onCreated?.(r)
      toast.success(r.emailSent ? 'Convite enviado.' : 'Conta criada.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const copy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.loginUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={result ? 'Convite criado' : 'Convidar para a equipa'}
      description={result ? undefined : 'Cria o acesso e envia um e-mail com a ligação para entrar — com a conta Google desse e-mail ou com um código. Não há palavras-passe.'}
      footer={
        result ? (
          <Button onClick={close}>Fechar</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={close} disabled={create.isPending}>Cancelar</Button>
            <Button type="submit" form="invite-user-form" loading={create.isPending} disabled={!email.trim()}>Convidar</Button>
          </>
        )
      }
    >
      {result ? (
        <div className="space-y-3 text-sm">
          <p className="text-cacau/80">
            {result.emailSent
              ? `Enviámos o convite para ${result.user.email}. Se não chegar, partilhe a ligação abaixo.`
              : `O acesso de ${result.user.email} foi criado. Partilhe a ligação abaixo: basta entrar com a conta Google desse e-mail ou pedir um código.`}
          </p>
          {result.emailError && <p className="rounded-lg bg-merengue px-3 py-2 text-cacau">O email não foi enviado: {result.emailError}</p>}
          <div className="flex items-center gap-2">
            <Input readOnly value={result.loginUrl} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" />
            <Button variant="secondary" size="icon" onClick={copy} aria-label="Copiar ligação">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      ) : (
        <form id="invite-user-form" onSubmit={submit} className="space-y-4">
          <Field label="Email" htmlFor="invite-email">
            <Input id="invite-email" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Nome" htmlFor="invite-name">
            <Input id="invite-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Telemóvel" htmlFor="invite-phone">
            <Input id="invite-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Switch checked={sendEmail} onChange={setSendEmail} label="Enviar e-mail de convite" description="Desligue para criar o acesso e copiar a ligação manualmente." />
        </form>
      )}
    </Modal>
  )
}
