'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/backoffice/Toaster'
import { apiErrorMessage } from '@/lib/api/errors'
import type { InboxItem, OrderListItem } from '@/lib/api/types'
import { useInboxItem, useInboxMutations, useOrders } from '@/lib/backoffice/queries'
import { formatDate, orderStatusClass, orderStatusLabel } from '@/lib/labels'
import { cn } from '@/lib/utils'

/** "Juntar a encomenda": the sender's open orders first, then a search over every order. */
export default function AssignInboxDialog({ item, onClose, onDone }: { item: InboxItem | null; onClose: () => void; onDone: (orderId: string) => void }) {
  const toast = useToast()
  const { data: detail } = useInboxItem(item?.id ?? null)
  const { assign } = useInboxMutations()
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const search = useOrders({ q: q.trim() || undefined, limit: 8 })

  useEffect(() => { setQ(''); setSelected(null) }, [item?.id])

  const suggestions = detail?.openOrders ?? []
  const results = (search.data?.items ?? []).filter((o) => !suggestions.some((s) => s.id === o.id))

  const submit = async () => {
    if (!item || !selected) return
    try {
      await assign.mutateAsync({ id: item.id, orderId: selected })
      toast.success('Mensagem juntada à encomenda.')
      onDone(selected)
    } catch (err) { toast.error(apiErrorMessage(err)) }
  }

  const Row = ({ o }: { o: OrderListItem }) => (
    <li>
      <button type="button" onClick={() => setSelected(o.id)} className={cn('flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm', selected === o.id ? 'border-cacau bg-creme' : 'border-linha hover:bg-creme/60')}>
        <span className="font-medium text-cacau">{o.number}</span>
        <span className="min-w-0 flex-1 truncate text-cacau/70">{o.clientName}{o.eventDate && ` · ${formatDate(o.eventDate)}`}</span>
        <Badge className={orderStatusClass[o.status]}>{orderStatusLabel[o.status]}</Badge>
      </button>
    </li>
  )

  return (
    <Modal
      open={Boolean(item)}
      onClose={onClose}
      title="Juntar a uma encomenda"
      description={item ? <>O e-mail de <strong>{item.fromName ?? item.fromEmail}</strong> passa a fazer parte da conversa da encomenda escolhida.</> : undefined}
      footer={<><Button variant="secondary" onClick={onClose} disabled={assign.isPending}>Cancelar</Button><Button onClick={submit} loading={assign.isPending} disabled={!selected}>Juntar</Button></>}
    >
      <div className="space-y-4">
        {suggestions.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-cacau/50">Encomendas abertas deste cliente</p>
            <ul className="space-y-1.5">{suggestions.map((o) => <Row key={o.id} o={o} />)}</ul>
          </div>
        )}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-cacau/50">Outra encomenda</p>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Número, nome, e-mail ou telemóvel…" autoFocus={suggestions.length === 0} />
          {results.length > 0 && <ul className="mt-2 space-y-1.5">{results.map((o) => <Row key={o.id} o={o} />)}</ul>}
          {q.trim() && search.data && results.length === 0 && <p className="mt-2 text-sm text-cacau/50">Sem resultados.</p>}
        </div>
      </div>
    </Modal>
  )
}
