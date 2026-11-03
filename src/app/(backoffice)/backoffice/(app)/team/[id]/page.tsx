'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Ban, Check, CheckCircle2, Copy, Mail, Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/backoffice/ConfirmDialog'
import PageHeader from '@/components/backoffice/PageHeader'
import { useCurrentUser } from '@/components/backoffice/CurrentUser'
import { useToast } from '@/components/backoffice/Toaster'
import { Avatar, DisabledBadge, GoogleBadge, InviteBadge, RoleBadge } from '@/components/backoffice/UserBits'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { apiErrorMessage } from '@/lib/api/errors'
import type { InviteResult } from '@/lib/api/types'
import { useDeleteUser, useInviteUser, useSetUserEnabled, useUpdateUser, useUser } from '@/lib/backoffice/queries'
import { formatDate, localeLabel } from '@/lib/labels'

const formatDateTime = (v: string | null | undefined) => formatDate(v, true)

export const dynamic = 'force-dynamic'

export default function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const toast = useToast()
  const me = useCurrentUser()
  const { data, isLoading, error } = useUser(id)
  const update = useUpdateUser(id)
  const invite = useInviteUser(id)
  const setEnabled = useSetUserEnabled(id)
  const remove = useDeleteUser(id)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [confirm, setConfirm] = useState<'disable' | 'delete' | null>(null)
  const [lastInvite, setLastInvite] = useState<InviteResult | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!data) return
    setName(data.user.name ?? '')
    setPhone(data.user.phone ?? '')
  }, [data])

  if (error) return <p className="text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>
  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  const { user, sessions } = data
  const isSelf = user.id === me.id
  const dirty = name !== (user.name ?? '') || phone !== (user.phone ?? '')

  const save = async () => {
    try {
      await update.mutateAsync({ name: name.trim(), phone: phone.trim() })
      toast.success('Dados guardados.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const resend = async (sendEmail: boolean) => {
    try {
      const r = await invite.mutateAsync(sendEmail)
      setLastInvite(r)
      toast.success(r.emailSent ? 'Convite reenviado.' : 'Ligação gerada.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const toggleEnabled = async () => {
    try {
      await setEnabled.mutateAsync(Boolean(user.disabledAt))
      toast.success(user.disabledAt ? 'Acesso reativado.' : 'Acesso desativado; as sessões abertas terminaram.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setConfirm(null)
    }
  }

  const destroy = async () => {
    try {
      await remove.mutateAsync()
      toast.success('Acesso apagado.')
      router.replace('/backoffice/team')
    } catch (err) {
      toast.error(apiErrorMessage(err))
      setConfirm(null)
    }
  }

  const copyInvite = async () => {
    if (!lastInvite) return
    await navigator.clipboard.writeText(lastInvite.loginUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Link href="/backoffice/team" className="mb-4 inline-flex items-center gap-1 text-sm text-cacau/60 hover:text-cacau">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Equipa
      </Link>
      <PageHeader
        title={user.name ?? user.email}
        description={user.email}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {user.invitedAt && !user.inviteAcceptedAt && (
              <Button variant="secondary" onClick={() => resend(true)} loading={invite.isPending}>
                <Mail className="h-4 w-4" aria-hidden /> Reenviar convite
              </Button>
            )}
            {!isSelf && (
              <Button variant={user.disabledAt ? 'secondary' : 'ghost'} onClick={() => (user.disabledAt ? toggleEnabled() : setConfirm('disable'))} loading={setEnabled.isPending}>
                {user.disabledAt ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Ban className="h-4 w-4" aria-hidden />}
                {user.disabledAt ? 'Reativar' : 'Desativar'}
              </Button>
            )}
            {!isSelf && (
              <Button variant="danger" onClick={() => setConfirm('delete')}>
                <Trash2 className="h-4 w-4" aria-hidden /> Apagar
              </Button>
            )}
          </div>
        }
      />

      {lastInvite && (
        <Card className="mb-6 border-po bg-po/30">
          <CardBody className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-cacau/80">
              {lastInvite.emailSent ? 'Convite enviado.' : 'Ligação para entrar:'} {lastInvite.emailError && `O e-mail falhou (${lastInvite.emailError}).`}
            </span>
            <Input readOnly value={lastInvite.loginUrl} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 font-mono text-xs" />
            <Button variant="secondary" size="icon" onClick={copyInvite} aria-label="Copiar ligação">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados</CardTitle>
              <Button size="sm" onClick={save} disabled={!dirty} loading={update.isPending}>Guardar</Button>
            </CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome" htmlFor="name">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="E-mail" hint="É a identidade do acesso: muda-se apagando e convidando de novo.">
                <Input value={user.email} readOnly disabled />
              </Field>
              <Field label="Telemóvel" htmlFor="phone">
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </Field>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessões abertas</CardTitle>
            </CardHeader>
            <CardBody>
              {sessions.length === 0 ? (
                <p className="text-sm text-cacau/60">Nenhuma sessão aberta.</p>
              ) : (
                <ul className="divide-y divide-linha text-sm">
                  {sessions.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <span className="min-w-0 truncate text-cacau/80" title={s.userAgent ?? undefined}>{describeAgent(s.userAgent)}{s.ip ? ` · ${s.ip}` : ''}</span>
                      <span className="text-xs text-cacau/50">última atividade {formatDateTime(s.lastUsedAt ?? s.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {!isSelf && sessions.length > 0 && (
                <p className="mt-3 text-xs text-cacau/50">Para terminar todas as sessões desta pessoa, desative o acesso e volte a ativá-lo.</p>
              )}
            </CardBody>
          </Card>
        </div>

        <Card className="self-start">
          <CardHeader>
            <CardTitle>Acesso</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} email={user.email} picture={user.picture} />
              <div className="flex flex-wrap gap-1">
                <RoleBadge role={user.role} />
                {user.googleLinked && <GoogleBadge />}
                {user.invitedAt && !user.inviteAcceptedAt && <InviteBadge />}
                {user.disabledAt && <DisabledBadge />}
              </div>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-cacau/80">
              <dt className="text-cacau/50">Desde</dt><dd>{formatDate(user.createdAt)}</dd>
              <dt className="text-cacau/50">Idioma</dt><dd>{user.locale ? localeLabel[user.locale] : '—'}</dd>
              <dt className="text-cacau/50">Entra com</dt><dd>{user.googleLinked ? 'Google ou código por e-mail' : 'Código por e-mail (Google ainda não usado)'}</dd>
              {user.lastSeenAt && (<><dt className="text-cacau/50">Última sessão</dt><dd>{formatDateTime(user.lastSeenAt)}</dd></>)}
              {user.invitedAt && (<><dt className="text-cacau/50">Convidado</dt><dd>{formatDate(user.invitedAt)}</dd></>)}
              {user.disabledAt && (<><dt className="text-cacau/50">Desativado</dt><dd>{formatDate(user.disabledAt)}</dd></>)}
            </dl>
          </CardBody>
        </Card>
      </div>

      <ConfirmDialog
        open={confirm === 'disable'}
        onClose={() => setConfirm(null)}
        onConfirm={toggleEnabled}
        title="Desativar acesso?"
        description="A pessoa deixa de conseguir entrar e as sessões abertas terminam já. Pode reativar quando quiser."
        confirmLabel="Desativar"
        variant="danger"
        loading={setEnabled.isPending}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        onConfirm={destroy}
        title="Apagar acesso?"
        description="O acesso e as suas sessões são removidos. Esta ação não pode ser anulada; para suspender temporariamente, desative."
        confirmLabel="Apagar"
        variant="danger"
        loading={remove.isPending}
      />
    </>
  )
}

/** "Safari · Mac" from a user-agent string — enough to recognise a device. */
function describeAgent(ua: string | null): string {
  if (!ua) return 'Dispositivo desconhecido'
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Navegador'
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : ''
  return os ? `${browser} · ${os}` : browser
}
