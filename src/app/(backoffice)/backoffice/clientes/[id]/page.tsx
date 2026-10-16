'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Ban, Check, CheckCircle2, Copy, Mail, Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/backoffice/ConfirmDialog'
import PageHeader from '@/components/backoffice/PageHeader'
import { useCurrentUser } from '@/components/backoffice/CurrentUser'
import { useToast } from '@/components/backoffice/Toaster'
import { Avatar, DisabledBadge, InviteBadge, RoleBadge, UnverifiedBadge } from '@/components/backoffice/UserBits'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, Input, Select } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { apiErrorMessage } from '@/lib/api/errors'
import type { InviteResult, UserRole } from '@/lib/api/types'
import { useDeleteUser, useInviteUser, useSetUserEnabled, useUpdateUser, useUser } from '@/lib/backoffice/queries'
import { formatDate, localeLabel } from '@/lib/labels'

export const dynamic = 'force-dynamic'

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
  const [role, setRole] = useState<UserRole>('customer')
  const [confirm, setConfirm] = useState<'disable' | 'delete' | null>(null)
  const [lastInvite, setLastInvite] = useState<InviteResult | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!data) return
    setName(data.user.name ?? '')
    setPhone(data.user.phone ?? '')
    setRole(data.user.role)
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

  const { user, stats, identities, canDelete } = data
  const isSelf = user.id === me.id
  const dirty = name !== (user.name ?? '') || phone !== (user.phone ?? '') || role !== user.role

  const save = async () => {
    try {
      await update.mutateAsync({ name: name.trim(), phone: phone.trim(), role })
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
      const r = await setEnabled.mutateAsync(Boolean(user.disabledAt))
      if (r.auth0Error) toast.error(`Conta ${user.disabledAt ? 'reativada' : 'desativada'}, mas o Auth0 não respondeu: ${r.auth0Error}`)
      else toast.success(user.disabledAt ? 'Conta reativada.' : 'Conta desativada.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setConfirm(null)
    }
  }

  const destroy = async () => {
    try {
      const r = await remove.mutateAsync()
      if (r.auth0Error) toast.error(`Conta apagada aqui, mas não no Auth0: ${r.auth0Error}`)
      else toast.success('Conta apagada.')
      router.replace('/backoffice/clientes')
    } catch (err) {
      toast.error(apiErrorMessage(err))
      setConfirm(null)
    }
  }

  const copyInvite = async () => {
    if (!lastInvite) return
    await navigator.clipboard.writeText(lastInvite.inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Link href="/backoffice/clientes" className="mb-4 inline-flex items-center gap-1 text-sm text-cacau/60 hover:text-cacau">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Clientes
      </Link>
      <PageHeader
        title={user.name ?? user.email ?? 'Cliente'}
        description={user.email ?? undefined}
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
            {!isSelf && canDelete && (
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
              {lastInvite.emailSent ? 'Convite enviado.' : 'Ligação de convite:'} {lastInvite.emailError && `O email falhou (${lastInvite.emailError}).`}
            </span>
            <Input readOnly value={lastInvite.inviteUrl} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 font-mono text-xs" />
            <Button variant="secondary" size="icon" onClick={copyInvite} aria-label="Copiar ligação">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Dados</CardTitle>
            <Button size="sm" onClick={save} disabled={!dirty} loading={update.isPending}>Guardar</Button>
          </CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" htmlFor="name">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Email">
              <Input value={user.email ?? ''} readOnly disabled />
            </Field>
            <Field label="Telemóvel" htmlFor="phone">
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label="Perfil" htmlFor="role" hint={isSelf ? 'Não pode remover o seu próprio acesso.' : undefined}>
              <Select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} disabled={isSelf}>
                <option value="customer">Cliente</option>
                <option value="admin">Administrador</option>
              </Select>
            </Field>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conta</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} email={user.email} picture={user.picture} />
                <div className="flex flex-wrap gap-1">
                  <RoleBadge role={user.role} />
                  {user.invitedAt && !user.inviteAcceptedAt && <InviteBadge />}
                  {user.disabledAt && <DisabledBadge />}
                  {!user.emailVerified && <UnverifiedBadge />}
                </div>
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-cacau/80">
                <dt className="text-cacau/50">Desde</dt><dd>{formatDate(user.createdAt)}</dd>
                <dt className="text-cacau/50">Idioma</dt><dd>{user.locale ? localeLabel[user.locale] : '—'}</dd>
                <dt className="text-cacau/50">Pedidos</dt><dd>{stats.requests}</dd>
                <dt className="text-cacau/50">Contactos</dt><dd>{stats.contacts}</dd>
                {stats.lastRequestAt && (<><dt className="text-cacau/50">Último pedido</dt><dd>{formatDate(stats.lastRequestAt)}</dd></>)}
                {user.invitedAt && (<><dt className="text-cacau/50">Convidado</dt><dd>{formatDate(user.invitedAt)}</dd></>)}
                {user.disabledAt && (<><dt className="text-cacau/50">Desativada</dt><dd>{formatDate(user.disabledAt)}</dd></>)}
              </dl>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Formas de entrar</CardTitle>
            </CardHeader>
            <CardBody>
              <ul className="space-y-1 text-sm text-cacau/80">
                {identities.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-2">
                    <span>{i.label}</span>
                    {i.isPrimary && <span className="text-xs text-cacau/50">principal</span>}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirm === 'disable'}
        onClose={() => setConfirm(null)}
        onConfirm={toggleEnabled}
        title="Desativar conta?"
        description="A pessoa deixa de conseguir entrar; o histórico fica. Pode reativar quando quiser."
        confirmLabel="Desativar"
        variant="danger"
        loading={setEnabled.isPending}
      />
      <ConfirmDialog
        open={confirm === 'delete'}
        onClose={() => setConfirm(null)}
        onConfirm={destroy}
        title="Apagar conta?"
        description="A conta não tem histórico e será removida daqui e do Auth0. Esta ação não pode ser anulada."
        confirmLabel="Apagar"
        variant="danger"
        loading={remove.isPending}
      />
    </>
  )
}
