'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { Field, Input, Select } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/backoffice/Toaster'
import { apiErrorMessage } from '@/lib/api/errors'
import type { InboxItem, Order } from '@/lib/api/types'
import { useInboxMutations, useOccasions } from '@/lib/backoffice/queries'

/** "Nova encomenda" from an inbox e-mail: the sender becomes the client, the e-mail the request text. */
export default function ConvertInboxDialog({ item, onClose, onCreated }: { item: InboxItem | null; onClose: () => void; onCreated: (order: Order) => void }) {
  const toast = useToast()
  const { convert } = useInboxMutations()
  const { data: occasions } = useOccasions()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [occasionId, setOccasionId] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [guests, setGuests] = useState('')
  const [notify, setNotify] = useState(true)

  useEffect(() => {
    setName(item?.fromName ?? item?.client?.name ?? '')
    setPhone(item?.client?.phone ?? '')
    setOccasionId(''); setEventDate(''); setEventTime(''); setGuests(''); setNotify(true)
  }, [item?.id, item?.fromName, item?.client])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return
    try {
      const order = await convert.mutateAsync({ id: item.id, input: {
        name: name.trim() || undefined, phone: phone.trim() || undefined, occasionId: occasionId || undefined,
        eventDate: eventDate || undefined, eventTime: eventTime || undefined, guests: guests ? Number(guests) : undefined, notifyClient: notify,
      } })
      toast.success(`Encomenda ${order.number} criada.`)
      onCreated(order)
    } catch (err) { toast.error(apiErrorMessage(err)) }
  }

  return (
    <Modal
      open={Boolean(item)}
      onClose={onClose}
      title="Nova encomenda a partir do e-mail"
      description={item ? <>Para <strong>{item.fromEmail}</strong>. O texto do e-mail fica como pedido e abre a conversa da encomenda; os itens acrescentam-se a seguir.</> : undefined}
      footer={<><Button variant="secondary" onClick={onClose} disabled={convert.isPending}>Cancelar</Button><Button type="submit" form="convert-inbox-form" loading={convert.isPending} disabled={!name.trim()}>Criar encomenda</Button></>}
    >
      <form id="convert-inbox-form" onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="ci-name"><Input id="ci-name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Telemóvel" htmlFor="ci-phone"><Input id="ci-phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Ocasião" htmlFor="ci-occasion">
            <Select id="ci-occasion" value={occasionId} onChange={(e) => setOccasionId(e.target.value)}>
              <option value="">—</option>
              {occasions?.map((o) => <option key={o.id} value={o.id}>{o.name.pt}</option>)}
            </Select>
          </Field>
          <Field label="Data" htmlFor="ci-date"><Input id="ci-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Hora" htmlFor="ci-time"><Input id="ci-time" type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} /></Field>
            <Field label="Conv." htmlFor="ci-guests"><Input id="ci-guests" type="number" min={1} value={guests} onChange={(e) => setGuests(e.target.value)} /></Field>
          </div>
        </div>
        <Switch checked={notify} onChange={setNotify} label="Enviar e-mail “recebemos o seu pedido” ao cliente" description="A confirmação vai na mesma conversa de e-mail." />
      </form>
    </Modal>
  )
}
