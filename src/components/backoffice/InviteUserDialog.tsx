'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { Field, Input, Select } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/backoffice/Toaster'
import { apiErrorMessage } from '@/lib/api/errors'
import type { InviteResult, UserRole } from '@/lib/api/types'
import { useCreateUser } from '@/lib/backoffice/queries'

/** "Convidar cliente": creates the Auth0 + API user and shows the set-password link. */
export default function InviteUserDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: (result: InviteResult) => void }) {
  const toast = useToast()
  const create = useCreateUser()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole>('customer')
  const [sendEmail, setSendEmail] = useState(true)
  const [result, setResult] = useState<InviteResult | null>(null)
  const [copied, setCopied] = useState(false)

  const reset = () => {
    setEmail(''); setName(''); setPhone(''); setRole('customer'); setSendEmail(true); setResult(null); setCopied(false)
  }
  const close = () => { reset(); onClose() }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const r = await create.mutateAsync({ email: email.trim(), name: name.trim() || undefined, phone: phone.trim() || undefined, role, sendEmail })
      setResult(r)
      onCreated?.(r)
      toast.success(r.emailSent ? 'Convite enviado.' : 'Conta criada.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const copy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={result ? 'Convite criado' : 'Convidar cliente'}
      description={result ? undefined : 'Cria a conta e envia um email para definir a palavra-passe.'}
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
              ? `Enviámos o convite para ${result.user.email}. Se não chegar, partilhe a ligação abaixo (válida ${Math.round(result.expiresInSeconds / 86400)} dias).`
              : `A conta de ${result.user.email} foi criada. Partilhe a ligação abaixo para definir a palavra-passe (válida ${Math.round(result.expiresInSeconds / 86400)} dias).`}
          </p>
          {result.emailError && <p className="rounded-lg bg-merengue px-3 py-2 text-cacau">O email não foi enviado: {result.emailError}</p>}
          <div className="flex items-center gap-2">
            <Input readOnly value={result.inviteUrl} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" />
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telemóvel" htmlFor="invite-phone">
              <Input id="invite-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label="Perfil" htmlFor="invite-role">
              <Select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                <option value="customer">Cliente</option>
                <option value="admin">Administrador</option>
              </Select>
            </Field>
          </div>
          <Switch checked={sendEmail} onChange={setSendEmail} label="Enviar email de convite" description="Desligue para criar a conta e copiar a ligação manualmente." />
        </form>
      )}
    </Modal>
  )
}
