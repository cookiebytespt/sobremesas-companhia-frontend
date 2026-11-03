'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { Field, Input, Select, Textarea } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/backoffice/Toaster'
import { apiErrorMessage } from '@/lib/api/errors'
import type { Order, OrderSource } from '@/lib/api/types'
import { useCreateOrder, useOccasions } from '@/lib/backoffice/queries'
import { orderSourceLabel } from '@/lib/labels'

/** "Registar encomenda": an order that arrived by phone, WhatsApp or in person. Items are added on the detail page. */
export default function NewOrderDialog({ open, onClose, onCreated, clientId, clientName, clientEmail }: {
  open: boolean
  onClose: () => void
  onCreated?: (order: Order) => void
  clientId?: string
  clientName?: string
  clientEmail?: string
}) {
  const toast = useToast()
  const create = useCreateOrder()
  const { data: occasions } = useOccasions()
  const [name, setName] = useState(clientName ?? '')
  const [email, setEmail] = useState(clientEmail ?? '')
  const [phone, setPhone] = useState('')
  const [source, setSource] = useState<OrderSource>('whatsapp')
  const [occasionId, setOccasionId] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [guests, setGuests] = useState('')
  const [message, setMessage] = useState('')
  const [notify, setNotify] = useState(true)

  const close = () => { onClose() }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const order = await create.mutateAsync({
        clientId, name: name.trim() || undefined, email: email.trim() || undefined, phone: phone.trim() || undefined, source,
        occasionId: occasionId || undefined, eventDate: eventDate || undefined, eventTime: eventTime || undefined,
        guests: guests ? Number(guests) : undefined, message: message.trim() || undefined, notifyClient: notify,
      })
      toast.success(`Encomenda ${order.number} registada.`)
      onCreated?.(order)
      close()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Registar encomenda"
      description="Para pedidos que chegam por telefone, WhatsApp ou ao balcão. Os itens acrescentam-se a seguir, na encomenda."
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={create.isPending}>Cancelar</Button>
          <Button type="submit" form="new-order-form" loading={create.isPending} disabled={!clientId && (!name.trim() || (!email.trim() && !phone.trim()))}>Registar</Button>
        </>
      }
    >
      <form id="new-order-form" onSubmit={submit} className="space-y-4">
        {!clientId && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" htmlFor="no-name"><Input id="no-name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="E-mail" htmlFor="no-email" hint="Para as confirmações por e-mail. Sem e-mail, basta o telemóvel."><Input id="no-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Telemóvel" htmlFor="no-phone"><Input id="no-phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            <Field label="Origem" htmlFor="no-source">
              <Select id="no-source" value={source} onChange={(e) => setSource(e.target.value as OrderSource)}>
                {(['whatsapp', 'phone', 'instagram', 'in_person', 'web'] as OrderSource[]).map((s) => <option key={s} value={s}>{orderSourceLabel[s]}</option>)}
              </Select>
            </Field>
          </div>
        )}
        {clientId && (
          <p className="rounded-lg bg-creme px-3 py-2 text-sm text-cacau/80">Cliente: <strong>{clientName}</strong> · {clientEmail}</p>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Ocasião" htmlFor="no-occasion">
            <Select id="no-occasion" value={occasionId} onChange={(e) => setOccasionId(e.target.value)}>
              <option value="">—</option>
              {occasions?.map((o) => <option key={o.id} value={o.id}>{o.name.pt}</option>)}
            </Select>
          </Field>
          <Field label="Data" htmlFor="no-date"><Input id="no-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Hora" htmlFor="no-time"><Input id="no-time" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} /></Field>
            <Field label="Conv." htmlFor="no-guests"><Input id="no-guests" type="number" min={1} value={guests} onChange={(e) => setGuests(e.target.value)} /></Field>
          </div>
        </div>
        <Field label="O que pediu" htmlFor="no-message"><Textarea id="no-message" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Resumo do pedido, tal como o cliente o descreveu." /></Field>
        <Switch checked={notify} onChange={setNotify} label="Enviar e-mail “recebemos o seu pedido” ao cliente" description="Desligue se já combinaram tudo por outra via." />
      </form>
    </Modal>
  )
}
