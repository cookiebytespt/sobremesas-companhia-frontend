'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useToast } from '@/components/backoffice/Toaster'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Input, Select } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { apiErrorMessage } from '@/lib/api/errors'
import type { Order, OrderItemInput } from '@/lib/api/types'
import { useOrderMutations, useService, useServices } from '@/lib/backoffice/queries'

type Row = { key: string; serviceId: string; offerItemId: string; label: string; quantity: string; notes: string }

/** What was asked becomes what was agreed: the staff edit the lines; the client gets one "updated" e-mail. */
export default function OrderItemsEditor({ order }: { order: Order }) {
  const toast = useToast()
  const { items: save } = useOrderMutations(order.id)
  const { data: services } = useServices()
  const [rows, setRows] = useState<Row[]>([])
  const [notify, setNotify] = useState(true)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setRows(order.items.map((i) => ({ key: i.id, serviceId: i.serviceId, offerItemId: i.offerItemId ?? '', label: i.offerItemId ? '' : i.label, quantity: i.quantity?.toString() ?? '', notes: i.notes ?? '' })))
    setDirty(false)
  }, [order.items])

  const update = (key: string, patch: Partial<Row>) => { setRows((r) => r.map((x) => (x.key === key ? { ...x, ...patch } : x))); setDirty(true) }
  const add = () => { setRows((r) => [...r, { key: `new-${Date.now()}`, serviceId: services?.[0]?.id ?? '', offerItemId: '', label: '', quantity: '', notes: '' }]); setDirty(true) }
  const remove = (key: string) => { setRows((r) => r.filter((x) => x.key !== key)); setDirty(true) }

  const submit = async () => {
    const items: OrderItemInput[] = rows.filter((r) => r.serviceId).map((r) => ({
      serviceId: r.serviceId, offerItemId: r.offerItemId || undefined, label: r.offerItemId ? undefined : r.label.trim() || undefined,
      quantity: r.quantity ? Number(r.quantity) : undefined, notes: r.notes.trim() || undefined,
    }))
    try {
      await save.mutateAsync({ items, notifyClient: notify })
      toast.success(notify ? 'Itens guardados; o cliente recebe um e-mail.' : 'Itens guardados.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Itens</CardTitle>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={add}><Plus className="h-3.5 w-3.5" aria-hidden /> Linha</Button>
          <Button size="sm" onClick={submit} disabled={!dirty} loading={save.isPending}>Guardar</Button>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        {rows.length === 0 && <p className="text-sm text-cacau/50">Sem itens. O pedido em texto livre está nos detalhes.</p>}
        {rows.map((r) => (
          <ItemRow key={r.key} row={r} services={services ?? []} onChange={(p) => update(r.key, p)} onRemove={() => remove(r.key)} />
        ))}
        {dirty && <Switch checked={notify} onChange={setNotify} label="Avisar o cliente por e-mail" description="Envia um resumo dos itens atualizados (junta-se a outras alterações dos últimos 2 min)." />}
      </CardBody>
    </Card>
  )
}

function ItemRow({ row, services, onChange, onRemove }: { row: Row; services: { id: string; name: { pt: string }; allowQuantities: boolean; quantityUnit: string | null }[]; onChange: (p: Partial<Row>) => void; onRemove: () => void }) {
  const { data: service } = useService(row.serviceId)
  const items = service?.items ?? []
  const svc = services.find((s) => s.id === row.serviceId)
  return (
    <div className="grid gap-2 rounded-xl border border-linha p-3 sm:grid-cols-[1fr_1fr_90px_1fr_auto]">
      <Select value={row.serviceId} onChange={(e) => onChange({ serviceId: e.target.value, offerItemId: '' })} aria-label="Serviço">
        {services.map((s) => <option key={s.id} value={s.id}>{s.name.pt}</option>)}
      </Select>
      <Select value={row.offerItemId} onChange={(e) => onChange({ offerItemId: e.target.value })} aria-label="Item">
        <option value="">Outro (texto livre)</option>
        {items.map((i) => <option key={i.id} value={i.id}>{i.name.pt}</option>)}
      </Select>
      <Input type="number" min={0} value={row.quantity} onChange={(e) => onChange({ quantity: e.target.value })} placeholder={svc?.allowQuantities ? (svc.quantityUnit ?? 'qtd') : 'qtd'} aria-label="Quantidade" />
      {row.offerItemId ? (
        <Input value={row.notes} onChange={(e) => onChange({ notes: e.target.value })} placeholder="Nota" />
      ) : (
        <div className="grid gap-1">
          <Input value={row.label} onChange={(e) => onChange({ label: e.target.value })} placeholder="Descrição" />
          <Input value={row.notes} onChange={(e) => onChange({ notes: e.target.value })} placeholder="Nota" className="text-xs" />
        </div>
      )}
      <button type="button" onClick={onRemove} className="self-center rounded-lg p-2 text-cacau/50 hover:bg-creme hover:text-[#b4534b]" aria-label="Remover linha"><Trash2 className="h-4 w-4" /></button>
    </div>
  )
}
