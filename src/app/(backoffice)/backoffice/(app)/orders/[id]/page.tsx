'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CalendarDays, Users } from 'lucide-react'
import ConfirmDialog from '@/components/backoffice/ConfirmDialog'
import PageHeader from '@/components/backoffice/PageHeader'
import Tabs from '@/components/backoffice/Tabs'
import { useToast } from '@/components/backoffice/Toaster'
import OrderConversation from '@/components/backoffice/orders/OrderConversation'
import OrderItemsEditor from '@/components/backoffice/orders/OrderItemsEditor'
import { ClientCard, DetailsCard, PaymentCard, ProposalCard, RequestCard } from '@/components/backoffice/orders/OrderCards'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { apiErrorMessage } from '@/lib/api/errors'
import type { Order, OrderStatus } from '@/lib/api/types'
import { useOrder, useOrderMutations } from '@/lib/backoffice/queries'
import { eventStatusLabel, formatDate, orderStatusClass, orderStatusLabel, transitionLabel } from '@/lib/labels'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type Tab = 'details' | 'conversation' | 'history'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: order, isLoading, error } = useOrder(id)
  const [tab, setTab] = useState<Tab>('details')

  if (error) return <p className="text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>
  if (isLoading || !order) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></div>

  return (
    <>
      <Link href="/backoffice/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-cacau/60 hover:text-cacau"><ArrowLeft className="h-4 w-4" aria-hidden /> Encomendas</Link>
      <PageHeader
        title={<span className="flex flex-wrap items-center gap-3"><span className="font-mono">{order.number}</span><Badge className={orderStatusClass[order.status]}>{orderStatusLabel[order.status]}</Badge></span>}
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>{order.contactName}</span>
            {order.occasionName && <span>{order.occasionName}</span>}
            {order.eventDate && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(order.eventDate)}{order.eventTime && ` · ${order.eventTime}`}</span>}
            {order.guests && <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {order.guests}</span>}
          </span>
        }
        actions={<TransitionButtons order={order} />}
      />

      <Tabs<Tab>
        items={[{ key: 'details', label: 'Detalhes' }, { key: 'conversation', label: 'Conversa' }, { key: 'history', label: 'Histórico', count: order.events.length }]}
        value={tab}
        onChange={setTab}
      />

      <div className="mt-4">
        {tab === 'details' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <RequestCard order={order} />
              <OrderItemsEditor order={order} />
              <DetailsCard order={order} />
            </div>
            <div className="space-y-6">
              <ClientCard order={order} />
              <ProposalCard order={order} />
              <PaymentCard order={order} />
            </div>
          </div>
        )}
        {tab === 'conversation' && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card><CardBody><OrderConversation order={order} /></CardBody></Card>
            <div className="space-y-6"><ClientCard order={order} /><ProposalCard order={order} /></div>
          </div>
        )}
        {tab === 'history' && (
          <Card>
            <CardHeader><CardTitle>Histórico</CardTitle></CardHeader>
            <CardBody>
              <ol className="space-y-3 text-sm">
                {order.events.map((e) => (
                  <li key={e.id} className="flex gap-3">
                    <span className="w-36 shrink-0 text-cacau/50">{formatDate(e.createdAt, true)}</span>
                    <span className="text-cacau">
                      Encomenda {eventStatusLabel[e.to]}{e.actorName ? ` por ${e.actorName}` : e.to === 'new' ? ' pelo cliente' : ''}
                      {e.note && <span className="block text-cacau/60">“{e.note}”</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        )}
      </div>
    </>
  )
}

/** Status buttons from the API's allowed transitions; declining/cancelling asks for a note first. */
function TransitionButtons({ order }: { order: Order }) {
  const toast = useToast()
  const { transition } = useOrderMutations(order.id)
  const [pending, setPending] = useState<OrderStatus | null>(null)
  const [note, setNote] = useState('')
  const [notify, setNotify] = useState(true)
  const needsNote = pending === 'declined' || pending === 'cancelled'

  const run = async (to: OrderStatus, withNote?: string) => {
    try {
      await transition.mutateAsync({ to, note: withNote?.trim() || undefined, notifyClient: notify })
      toast.success(`Encomenda ${eventStatusLabel[to]}.`)
      setPending(null); setNote(''); setNotify(true)
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const primary: OrderStatus[] = ['reviewing', 'confirmed', 'completed']
  const visible = order.allowedTransitions.filter((t) => t !== 'proposal_sent') // the proposal card sends proposals
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {visible.map((t) => (
          <Button key={t} size="sm" variant={primary.includes(t) ? 'primary' : t === 'declined' || t === 'cancelled' ? 'ghost' : 'secondary'} onClick={() => setPending(t)} className={cn(t === 'declined' || t === 'cancelled' ? 'text-[#b4534b]' : undefined)}>
            {transitionLabel[t] ?? orderStatusLabel[t]}
          </Button>
        ))}
      </div>
      <ConfirmDialog
        open={pending !== null}
        onClose={() => setPending(null)}
        onConfirm={() => pending && run(pending, note)}
        title={pending ? `${transitionLabel[pending] ?? orderStatusLabel[pending]}?` : ''}
        description={pending === 'confirmed' ? 'A encomenda passa a confirmada e o cliente recebe a confirmação por e-mail.' : pending === 'completed' ? 'Marca a encomenda como entregue e agradece ao cliente por e-mail.' : needsNote ? 'Diga ao cliente porquê (vai no e-mail).' : 'O cliente é avisado por e-mail.'}
        confirmLabel={pending ? transitionLabel[pending] ?? 'Confirmar' : 'Confirmar'}
        variant={needsNote ? 'danger' : 'primary'}
        loading={transition.isPending}
      >
        <div className="space-y-3">
          {(needsNote || pending === 'reviewing') && <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={needsNote ? 'Motivo (opcional, mas ajuda)…' : 'Nota para o cliente (opcional)…'} />}
          <Switch checked={notify} onChange={setNotify} label="Avisar o cliente por e-mail" />
        </div>
      </ConfirmDialog>
    </>
  )
}
