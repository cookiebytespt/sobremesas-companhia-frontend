'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EyeOff, FilePlus2, Link2, Paperclip, RefreshCw, RotateCcw } from 'lucide-react'
import PageHeader from '@/components/backoffice/PageHeader'
import SearchInput from '@/components/backoffice/SearchInput'
import Tabs from '@/components/backoffice/Tabs'
import { useToast } from '@/components/backoffice/Toaster'
import AssignInboxDialog from '@/components/backoffice/inbox/AssignInboxDialog'
import ConvertInboxDialog from '@/components/backoffice/inbox/ConvertInboxDialog'
import InboxMessageBody from '@/components/backoffice/inbox/InboxMessageBody'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiErrorMessage } from '@/lib/api/errors'
import type { InboxItem, InboxListQuery } from '@/lib/api/types'
import { useGoogleStatus, useInbox, useInboxMutations } from '@/lib/backoffice/queries'
import { useListParams } from '@/lib/backoffice/useListParams'
import { formatDate } from '@/lib/labels'

export const dynamic = 'force-dynamic'

type Tab = NonNullable<InboxListQuery['status']>
const tabs: { key: Tab; label: string }[] = [{ key: 'open', label: 'Por tratar' }, { key: 'handled', label: 'Tratados' }, { key: 'ignored', label: 'Ignorados' }]
const statusLabel: Record<InboxItem['status'], string> = { open: 'Por tratar', assigned: 'Juntado a encomenda', converted: 'Virou encomenda', ignored: 'Ignorado' }

function InboxList() {
  const { get, set, page } = useListParams()
  const router = useRouter()
  const toast = useToast()
  const tab = ((get('status') as Tab | undefined) ?? 'open') as Tab
  const q = get('q')
  const { data, isLoading, error } = useInbox({ status: tab, q, page })
  const { data: google } = useGoogleStatus()
  const { ignore, reopen, syncGmail } = useInboxMutations()
  const [assigning, setAssigning] = useState<InboxItem | null>(null)
  const [converting, setConverting] = useState<InboxItem | null>(null)

  const run = async (p: Promise<unknown>, ok: string) => { try { await p; toast.success(ok) } catch (err) { toast.error(apiErrorMessage(err)) } }
  const sync = async () => {
    try {
      const r = await syncGmail.mutateAsync()
      toast.success(r.onOrders + r.inbox === 0 ? 'Nada de novo na caixa de correio.' : `${r.onOrders} mensagem(ns) em encomendas, ${r.inbox} na caixa de entrada.`)
    } catch (err) { toast.error(apiErrorMessage(err)) }
  }

  return (
    <>
      <PageHeader
        title="Caixa de entrada"
        description={<>E-mails recebidos na conta Google que não pertencem a nenhuma encomenda. Respostas a encomendas vão direitas à conversa de cada uma. {google?.connected ? <>Última leitura: {google.gmailLastSyncAt ? formatDate(google.gmailLastSyncAt, true) : 'ainda nenhuma'}.</> : <>Ligue a conta Google em <Link href="/backoffice/settings/google" className="underline">Definições → Google</Link> para ler o correio.</>}</>}
        actions={<Button variant="secondary" onClick={sync} loading={syncGmail.isPending} disabled={!google?.connected}><RefreshCw className="h-4 w-4" aria-hidden /> Ler correio agora</Button>}
      />
      {google?.lastError?.startsWith('Gmail:') && <p className="mb-3 rounded-lg border border-[#e6b8b3] bg-[#fbeeec] px-3 py-2 text-sm text-[#8d3b34]">{google.lastError}</p>}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs<Tab> items={tabs} value={tab} onChange={(t) => set({ status: t === 'open' ? undefined : t, page: undefined })} />
        <SearchInput value={q} onChange={(v) => set({ q: v, page: undefined })} placeholder="Remetente ou assunto…" className="sm:ml-auto sm:w-72" />
      </div>
      {error && <p className="text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>}
      {isLoading && <Skeleton className="h-32 w-full" />}
      {data && data.items.length === 0 && <p className="text-sm text-cacau/50">{tab === 'open' ? 'Nada por tratar.' : tab === 'ignored' ? 'Nada ignorado.' : 'Ainda nada tratado.'}</p>}
      <div className="space-y-3">
        {data?.items.map((m) => (
          <Card key={m.id}>
            <CardBody className="flex flex-wrap gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-cacau">
                  {m.fromName ?? m.fromEmail}
                  <span className="font-normal text-cacau/50"> · {formatDate(m.receivedAt, true)}</span>
                  {m.status !== 'open' && <Badge className="ml-2 align-middle">{statusLabel[m.status]}</Badge>}
                </p>
                <p className="text-sm text-cacau/70"><a href={`mailto:${m.fromEmail}`} className="hover:underline">{m.fromEmail}</a>{m.attachments.length > 0 && <span className="ml-2 inline-flex items-center gap-1 text-cacau/50"><Paperclip className="h-3 w-3" aria-hidden /> {m.attachments.length}</span>}</p>
                {m.subject && <p className="mt-2 text-sm font-medium text-cacau">{m.subject}</p>}
                <InboxMessageBody item={m} />
                {m.orderId && <Link href={`/backoffice/orders/${m.orderId}`} className="mt-2 inline-block text-xs text-cacau/60 underline-offset-2 hover:underline">Ver a encomenda {m.orderNumber}</Link>}
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                {m.status === 'open' && (
                  <>
                    <Button size="sm" onClick={() => setConverting(m)}><FilePlus2 className="h-3.5 w-3.5" aria-hidden /> Nova encomenda</Button>
                    <Button size="sm" variant="secondary" onClick={() => setAssigning(m)}><Link2 className="h-3.5 w-3.5" aria-hidden /> Juntar a encomenda</Button>
                    <Button size="sm" variant="ghost" onClick={() => run(ignore.mutateAsync(m.id), 'Ignorado.')}><EyeOff className="h-3.5 w-3.5" aria-hidden /> Ignorar</Button>
                  </>
                )}
                {m.status === 'ignored' && <Button size="sm" variant="ghost" onClick={() => run(reopen.mutateAsync(m.id), 'De volta à caixa de entrada.')}><RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reabrir</Button>}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      {data && data.total > data.limit && (
        <div className="mt-4 flex justify-end gap-2 text-sm">
          <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => set({ page: page - 1 })}>Anterior</Button>
          <Button size="sm" variant="secondary" disabled={page * data.limit >= data.total} onClick={() => set({ page: page + 1 })}>Seguinte</Button>
        </div>
      )}
      <AssignInboxDialog item={assigning} onClose={() => setAssigning(null)} onDone={(orderId) => { setAssigning(null); router.push(`/backoffice/orders/${orderId}`) }} />
      <ConvertInboxDialog item={converting} onClose={() => setConverting(null)} onCreated={(order) => { setConverting(null); router.push(`/backoffice/orders/${order.id}`) }} />
    </>
  )
}

export default function InboxPage() {
  return <Suspense><InboxList /></Suspense>
}
