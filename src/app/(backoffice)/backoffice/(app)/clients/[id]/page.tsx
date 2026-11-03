'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Link2Off, Merge, Plus, RefreshCw, Trash2, UserPlus } from 'lucide-react'
import ConfirmDialog from '@/components/backoffice/ConfirmDialog'
import NewOrderDialog from '@/components/backoffice/NewOrderDialog'
import PageHeader from '@/components/backoffice/PageHeader'
import { useToast } from '@/components/backoffice/Toaster'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/dialog'
import { Field, Input, Select, Textarea } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { apiErrorMessage } from '@/lib/api/errors'
import type { Client, Locale } from '@/lib/api/types'
import { useClient, useClientMutations, useClients } from '@/lib/backoffice/queries'
import { formatDate, formatMoney, localeLabel, orderStatusClass, orderStatusLabel } from '@/lib/labels'

export const dynamic = 'force-dynamic'

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const toast = useToast()
  const { data, isLoading, error } = useClient(id)
  const { update, remove, merge, pushToGoogle, unlinkGoogle } = useClientMutations(id)
  const [f, setF] = useState({ name: '', email: '', phone: '', locale: 'pt' as Locale, notes: '' })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [merging, setMerging] = useState(false)
  const [ordering, setOrdering] = useState(false)
  const [confirmUnlink, setConfirmUnlink] = useState(false)

  useEffect(() => {
    if (!data) return
    const c = data.client
    setF({ name: c.name, email: c.email ?? '', phone: c.phone ?? '', locale: c.locale, notes: c.notes ?? '' })
  }, [data])

  if (error) return <p className="text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>
  if (isLoading || !data) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-40 w-full" /></div>
  const { client, orders } = data
  const dirty = f.name !== client.name || f.email !== (client.email ?? '') || f.phone !== (client.phone ?? '') || f.locale !== client.locale || f.notes !== (client.notes ?? '')

  const save = async () => {
    try {
      await update.mutateAsync({ name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim(), locale: f.locale, notes: f.notes })
      toast.success('Guardado.')
    } catch (err) { toast.error(apiErrorMessage(err)) }
  }
  const sendToGoogle = async () => {
    try {
      const { outcome } = await pushToGoogle.mutateAsync()
      toast.success(outcome === 'created' ? 'Adicionado aos Google Contacts.' : outcome === 'linked' ? 'Já existia nos Google Contacts — ficou ligado e atualizado.' : 'Contacto atualizado no Google.')
    } catch (err) { toast.error(apiErrorMessage(err)) }
  }
  const unlink = async () => {
    try { await unlinkGoogle.mutateAsync(); toast.success('Ligação removida. O contacto continua no Google.'); setConfirmUnlink(false) } catch (err) { toast.error(apiErrorMessage(err)); setConfirmUnlink(false) }
  }
  const destroy = async () => {
    try { await remove.mutateAsync(); toast.success('Cliente apagado.'); router.replace('/backoffice/clients') } catch (err) { toast.error(apiErrorMessage(err)); setConfirmDelete(false) }
  }

  return (
    <>
      <Link href="/backoffice/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-cacau/60 hover:text-cacau"><ArrowLeft className="h-4 w-4" aria-hidden /> Clientes</Link>
      <PageHeader
        title={client.name}
        description={[client.email, client.phone].filter(Boolean).join(' · ') || undefined}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setOrdering(true)}><Plus className="h-4 w-4" aria-hidden /> Registar encomenda</Button>
            <Button variant="secondary" onClick={() => setMerging(true)}><Merge className="h-4 w-4" aria-hidden /> Juntar a outro</Button>
            {orders.length === 0 && <Button variant="danger" onClick={() => setConfirmDelete(true)}><Trash2 className="h-4 w-4" aria-hidden /> Apagar</Button>}
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader><CardTitle>Encomendas</CardTitle></CardHeader>
          <CardBody>
            {orders.length === 0 ? <p className="text-sm text-cacau/50">Ainda sem encomendas.</p> : (
              <ul className="divide-y divide-linha text-sm">
                {orders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/backoffice/orders/${o.id}`} className="flex flex-wrap items-center gap-3 py-2 hover:bg-creme/60">
                      <span className="font-mono text-cacau">{o.number}</span>
                      <Badge className={orderStatusClass[o.status]}>{orderStatusLabel[o.status]}</Badge>
                      <span className="text-cacau/70">{o.occasionName ?? '—'}</span>
                      <span className="text-cacau/50">{o.eventDate ? formatDate(o.eventDate) : 'sem data'}</span>
                      <span className="ml-auto tabular-nums text-cacau/70">{o.proposalAmount != null ? formatMoney(o.proposalAmount) : ''}</span>
                      {o.unread && <span className="h-2 w-2 rounded-full bg-po-fundo" title="Mensagem por ler" />}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
        <div className="space-y-6 self-start">
        <Card>
          <CardHeader>
            <CardTitle>Ficha</CardTitle>
            <Button size="sm" onClick={save} disabled={!dirty} loading={update.isPending}>Guardar</Button>
          </CardHeader>
          <CardBody className="space-y-3">
            <Field label="Nome" htmlFor="c-name"><Input id="c-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="E-mail" htmlFor="c-email" hint="Mudar o e-mail muda para onde vão os próximos e-mails; as encomendas existentes continuam no mesmo tópico."><Input id="c-email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Telemóvel" htmlFor="c-phone"><Input id="c-phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
            <Field label="Idioma dos e-mails" htmlFor="c-locale">
              <Select id="c-locale" value={f.locale} onChange={(e) => setF({ ...f, locale: e.target.value as Locale })}>
                {(['pt', 'en', 'es', 'fr'] as Locale[]).map((l) => <option key={l} value={l}>{localeLabel[l]}</option>)}
              </Select>
            </Field>
            <Field label="Notas" htmlFor="c-notes" hint="Só a equipa vê."><Textarea id="c-notes" rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
            <p className="text-xs text-cacau/50">Desde {formatDate(client.createdAt)}</p>
          </CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Google Contacts</CardTitle></CardHeader>
          <CardBody className="space-y-3 text-sm">
            {client.googleLinked ? (
              <>
                <p className="text-cacau/70">Está nos contactos da loja, com a etiqueta “Sobremesas — clientes”. O que mudar nesta ficha passa também para o contacto.{client.googleSyncedAt ? ` Atualizado ${formatDate(client.googleSyncedAt, true)}.` : ''}</p>
                {client.googleSyncError && <p className="rounded-md bg-[#fbeceb] px-3 py-2 text-xs text-[#b4534b]">A última atualização falhou: {client.googleSyncError}</p>}
                <div className="flex flex-wrap gap-2">
                  {client.googleContactUrl && <a href={client.googleContactUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-md border border-linha px-3 text-cacau hover:bg-creme"><ExternalLink className="h-4 w-4" aria-hidden /> Abrir</a>}
                  <Button size="sm" variant="secondary" onClick={sendToGoogle} loading={pushToGoogle.isPending}><RefreshCw className="h-4 w-4" aria-hidden /> {client.googleSyncError ? 'Tentar de novo' : 'Atualizar'}</Button>
                  <Button size="sm" variant="secondary" onClick={() => setConfirmUnlink(true)}><Link2Off className="h-4 w-4" aria-hidden /> Desligar</Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-cacau/70">Ainda só existe na plataforma. Adicione-o para o ter no telemóvel da loja (chamadas, WhatsApp, Gmail). Se já houver um contacto com o mesmo e-mail{client.email ? '' : ' ou telemóvel'}, esse é ligado em vez de se criar um duplicado.</p>
                {client.googleSyncError && <p className="rounded-md bg-[#fbeceb] px-3 py-2 text-xs text-[#b4534b]">Não foi possível: {client.googleSyncError}</p>}
                <Button size="sm" onClick={sendToGoogle} loading={pushToGoogle.isPending}><UserPlus className="h-4 w-4" aria-hidden /> Adicionar aos Google Contacts</Button>
              </>
            )}
          </CardBody>
        </Card>
        </div>
      </div>

      <NewOrderDialog open={ordering} onClose={() => setOrdering(false)} clientId={client.id} clientName={client.name} clientEmail={client.email ?? client.phone ?? undefined} onCreated={(o) => router.push(`/backoffice/orders/${o.id}`)} />
      <MergeDialog open={merging} onClose={() => setMerging(false)} keep={client} onMerge={async (mergeId) => { try { await merge.mutateAsync({ keepId: client.id, mergeId }); toast.success('Clientes juntos.'); setMerging(false) } catch (err) { toast.error(apiErrorMessage(err)) } }} />
      <ConfirmDialog open={confirmUnlink} onClose={() => setConfirmUnlink(false)} onConfirm={unlink} title="Desligar dos Google Contacts?" description="O contacto não é apagado no Google; só deixa de ser atualizado a partir desta ficha." confirmLabel="Desligar" loading={unlinkGoogle.isPending} />
      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} onConfirm={destroy} title="Apagar cliente?" description="Só é possível sem encomendas. Esta ação não pode ser anulada." confirmLabel="Apagar" variant="danger" loading={remove.isPending} />
    </>
  )
}

function MergeDialog({ open, onClose, keep, onMerge }: { open: boolean; onClose: () => void; keep: Client; onMerge: (mergeId: string) => void }) {
  const [q, setQ] = useState('')
  const { data } = useClients({ q, limit: 8 })
  const candidates = (data?.items ?? []).filter((c) => c.id !== keep.id)
  return (
    <Modal open={open} onClose={onClose} title="Juntar a este cliente" description={`As encomendas do cliente escolhido passam para ${keep.name} (${keep.email}) e o duplicado é apagado.`} footer={<Button variant="secondary" onClick={onClose}>Fechar</Button>}>
      <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Procurar o duplicado…" />
      <ul className="mt-3 divide-y divide-linha text-sm">
        {candidates.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2">
            <span className="min-w-0"><span className="block truncate text-cacau">{c.name}</span><span className="block truncate text-xs text-cacau/50">{c.email} · {c.orderCount ?? 0} enc.</span></span>
            <Button size="sm" variant="secondary" onClick={() => onMerge(c.id)}>Juntar</Button>
          </li>
        ))}
        {q && candidates.length === 0 && <li className="py-2 text-cacau/50">Sem resultados.</li>}
      </ul>
    </Modal>
  )
}
