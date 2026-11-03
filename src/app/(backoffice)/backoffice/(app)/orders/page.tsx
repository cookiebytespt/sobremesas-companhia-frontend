'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { Mail, Plus } from 'lucide-react'
import DataTable from '@/components/backoffice/DataTable'
import NewOrderDialog from '@/components/backoffice/NewOrderDialog'
import PageHeader from '@/components/backoffice/PageHeader'
import SearchInput from '@/components/backoffice/SearchInput'
import Tabs from '@/components/backoffice/Tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/input'
import { apiErrorMessage } from '@/lib/api/errors'
import type { OrderListItem, PaymentStatus } from '@/lib/api/types'
import { useDashboard, useOrders } from '@/lib/backoffice/queries'
import { useListParams } from '@/lib/backoffice/useListParams'
import { formatDate, formatMoney, orderSourceLabel, orderStatusClass, orderStatusLabel, paymentStatusLabel } from '@/lib/labels'

export const dynamic = 'force-dynamic'

const LIMIT = 20
type Tab = 'open' | 'new' | 'reviewing' | 'proposal_sent' | 'confirmed' | 'completed' | 'archive' | 'unread'
const tabStatus: Record<Tab, string | undefined> = {
  open: 'new,reviewing,proposal_sent,confirmed', new: 'new', reviewing: 'reviewing', proposal_sent: 'proposal_sent',
  confirmed: 'confirmed', completed: 'completed', archive: 'declined,cancelled', unread: undefined,
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge className={orderStatusClass[status] ?? 'bg-creme text-cacau'}>{orderStatusLabel[status] ?? status}</Badge>
}

function eventLabel(o: OrderListItem) {
  if (!o.eventDate) return '—'
  return `${formatDate(o.eventDate)}${o.eventTime ? ` · ${o.eventTime}` : ''}`
}

const columns: ColumnDef<OrderListItem, unknown>[] = [
  {
    id: 'number', header: 'Encomenda', size: 150,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-po-fundo" title="Mensagem por ler" />}
        <span className="font-mono text-sm text-cacau">{row.original.number}</span>
      </div>
    ),
  },
  {
    id: 'client', header: 'Cliente',
    cell: ({ row }) => (
      <div className="min-w-0">
        <p className="truncate font-medium text-cacau">{row.original.clientName}</p>
        <p className="truncate text-xs text-cacau/50">{row.original.clientEmail}</p>
      </div>
    ),
  },
  { id: 'occasion', header: 'Ocasião', cell: ({ row }) => <span className="text-cacau/80">{row.original.occasionName ?? '—'}</span> },
  { id: 'event', header: 'Evento', size: 150, cell: ({ row }) => <span className="text-cacau/80">{eventLabel(row.original)}</span> },
  { id: 'guests', header: 'Conv.', size: 70, cell: ({ row }) => <span className="tabular-nums text-cacau/80">{row.original.guests ?? '—'}</span> },
  {
    id: 'status', header: 'Estado', size: 170,
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <StatusBadge status={row.original.status} />
        {row.original.paymentStatus !== 'pending' && <Badge className="bg-creme text-cacau/70">{paymentStatusLabel[row.original.paymentStatus]}</Badge>}
      </div>
    ),
  },
  { id: 'amount', header: 'Proposta', size: 100, cell: ({ row }) => <span className="tabular-nums text-cacau/80">{row.original.proposalAmount != null ? formatMoney(row.original.proposalAmount) : '—'}</span> },
  { id: 'source', header: 'Origem', size: 90, cell: ({ row }) => <span className="text-xs text-cacau/50">{orderSourceLabel[row.original.source]}</span> },
  { id: 'created', header: 'Recebida', size: 110, cell: ({ row }) => <span className="text-cacau/60">{formatDate(row.original.createdAt)}</span> },
]

function OrdersList() {
  const { get, set, page } = useListParams()
  const router = useRouter()
  const tab = ((get('tab') as Tab | undefined) ?? 'open') as Tab
  const q = get('q')
  const payment = get('payment') as PaymentStatus | undefined
  const query = useMemo(() => ({ status: tabStatus[tab], unread: tab === 'unread' ? true : undefined, q, payment, page, limit: LIMIT }), [tab, q, payment, page])
  const { data, isLoading, isFetching, error } = useOrders(query)
  const { data: dash } = useDashboard()
  const [creating, setCreating] = useState(false)

  return (
    <>
      <PageHeader
        title="Encomendas"
        description="Pedidos do site e encomendas registadas por vós. Cada alteração que o cliente deve saber segue por e-mail; as respostas aparecem na conversa."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" aria-hidden /> Registar encomenda
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs<Tab>
          items={[
            { key: 'open', label: 'Em curso' },
            { key: 'new', label: 'Novas', count: dash?.orders.byStatus.new },
            { key: 'reviewing', label: 'Em análise', count: dash?.orders.byStatus.reviewing },
            { key: 'proposal_sent', label: 'Proposta enviada', count: dash?.orders.byStatus.proposal_sent },
            { key: 'confirmed', label: 'Confirmadas', count: dash?.orders.byStatus.confirmed },
            { key: 'unread', label: 'Por ler', count: dash?.orders.unreadMessages },
            { key: 'completed', label: 'Concluídas' },
            { key: 'archive', label: 'Arquivo' },
          ]}
          value={tab}
          onChange={(t) => set({ tab: t === 'open' ? undefined : t, page: undefined })}
        />
        <div className="flex items-center gap-2">
          <Select value={payment ?? ''} onChange={(e) => set({ payment: e.target.value || undefined })} aria-label="Pagamento" className="w-40">
            <option value="">Pagamento: todos</option>
            <option value="pending">Por pagar</option>
            <option value="deposit_paid">Sinal pago</option>
            <option value="paid">Pago</option>
          </Select>
          <SearchInput value={q} onChange={(v) => set({ q: v })} placeholder="Nº, nome, e-mail, telemóvel…" className="w-full sm:w-64" />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data?.items}
        loading={isLoading}
        refreshing={isFetching && !isLoading}
        error={error ? apiErrorMessage(error) : null}
        pagination={data ? { page: data.page, limit: data.limit, total: data.total, onPageChange: (p) => set({ page: p }) } : undefined}
        emptyTitle="Sem encomendas"
        emptyDescription={q ? 'Nenhuma encomenda corresponde à pesquisa.' : tab === 'unread' ? 'Nenhuma mensagem por ler.' : 'Quando chegar um pedido pelo site aparece aqui — e recebem um e-mail.'}
        onRowClick={(o) => router.push(`/backoffice/orders/${o.id}`)}
        rowClassName={(o) => (o.unread ? 'bg-po/10' : undefined)}
      />
      {dash && !dash.email.googleConnected && dash.email.pending > 0 && (
        <p className="mt-4 flex items-center gap-2 rounded-xl bg-merengue px-4 py-3 text-sm text-cacau">
          <Mail className="h-4 w-4" aria-hidden /> {dash.email.pending} e-mail(s) à espera: ligue a conta Google em <a href="/backoffice/settings/google" className="underline">Definições → Google</a> para começarem a sair.
        </p>
      )}
      <NewOrderDialog open={creating} onClose={() => setCreating(false)} onCreated={(o) => router.push(`/backoffice/orders/${o.id}`)} />
    </>
  )
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersList />
    </Suspense>
  )
}
