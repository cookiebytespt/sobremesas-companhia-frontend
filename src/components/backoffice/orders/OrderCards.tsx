'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Trash2 } from 'lucide-react'
import PhotoDropzone from '@/components/backoffice/PhotoDropzone'
import { useToast } from '@/components/backoffice/Toaster'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, Input, Select, Textarea } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { apiErrorMessage } from '@/lib/api/errors'
import { ALLERGENS, type DeliveryMode, type Order, type OrderSource, type PaymentStatus } from '@/lib/api/types'
import { useOccasions, useOrderMutations } from '@/lib/backoffice/queries'
import { deliveryModeLabel, formatDate, formatMoney, localeLabel, orderSourceLabel, paymentStatusLabel } from '@/lib/labels'
import { cn } from '@/lib/utils'

// MARK: Client

/** wa.me link for a Portuguese number written any way (9 digits → +351). */
function whatsappFor(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits.length === 9 ? `351${digits}` : digits.replace(/^00/, '')}`
}

export function ClientCard({ order }: { order: Order }) {
  const c = order.client
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cliente</CardTitle>
        <Link href={`/backoffice/clients/${c.id}`} className="inline-flex items-center gap-1 text-xs text-cacau/60 hover:text-cacau">Ficha <ExternalLink className="h-3 w-3" /></Link>
      </CardHeader>
      <CardBody className="space-y-1 text-sm">
        <p className="font-medium text-cacau">{order.contactName}</p>
        {order.contactEmail
          ? <p><a href={`mailto:${order.contactEmail}`} className="text-cacau/80 hover:underline">{order.contactEmail}</a></p>
          : <p className="rounded-lg bg-merengue/50 px-2 py-1 text-xs text-cacau/80">Sem e-mail — o cliente não recebe e-mails automáticos. Contacte por telefone ou WhatsApp.</p>}
        {order.contactPhone && (
          <p className="flex flex-wrap gap-x-3">
            <a href={`tel:${order.contactPhone.replace(/\s/g, '')}`} className="text-cacau/80 hover:underline">{order.contactPhone}</a>
            <a href={whatsappFor(order.contactPhone)} target="_blank" rel="noreferrer" className="text-cacau/60 hover:underline">WhatsApp</a>
          </p>
        )}
        <p className="pt-1 text-xs text-cacau/50">
          {c.orderCount != null && c.orderCount > 1 ? `${c.orderCount} encomendas` : 'Primeira encomenda'} · e-mails em {localeLabel[order.locale]} · origem {orderSourceLabel[order.source]}
          {c.googleLinked && ' · Google Contacts'}
        </p>
      </CardBody>
    </Card>
  )
}

// MARK: Details (event, delivery, dietary, notes)

export function DetailsCard({ order }: { order: Order }) {
  const toast = useToast()
  const { update } = useOrderMutations(order.id)
  const { data: occasions } = useOccasions()
  const [f, setF] = useState(fromOrder(order))
  const [notify, setNotify] = useState(true)
  useEffect(() => setF(fromOrder(order)), [order])
  const base = fromOrder(order)
  const dirty = JSON.stringify(f) !== JSON.stringify(base)
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF({ ...f, [k]: v })

  const save = async () => {
    const body: Record<string, unknown> = { notifyClient: notify }
    const str = (k: keyof typeof f) => { if (f[k] !== base[k]) body[k] = (f[k] as string).trim() || null }
    if (f.occasionId !== base.occasionId) body.occasionId = f.occasionId || null
    str('occasionOther'); str('eventDate'); str('eventTime'); str('internalNotes'); str('addressLine1'); str('addressLine2'); str('postalCode'); str('city'); str('addressNotes'); str('dietaryNotes')
    if (f.guests !== base.guests) body.guests = f.guests ? Number(f.guests) : null
    if (f.deliveryMode !== base.deliveryMode) body.deliveryMode = f.deliveryMode || null
    if (JSON.stringify(f.allergies) !== JSON.stringify(base.allergies)) body.allergies = f.allergies
    if (f.source !== base.source) body.source = f.source
    if (f.contactName !== base.contactName) body.contactName = f.contactName
    if (f.contactPhone !== base.contactPhone) body.contactPhone = f.contactPhone
    try {
      await update.mutateAsync(body)
      toast.success('Guardado.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const needsAddress = f.deliveryMode === 'delivery' || f.deliveryMode === 'on_site'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evento e entrega</CardTitle>
        <Button size="sm" onClick={save} disabled={!dirty} loading={update.isPending}>Guardar</Button>
      </CardHeader>
      <CardBody className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <Field label="Ocasião" htmlFor="d-occasion">
              <Select id="d-occasion" value={f.occasionId} onChange={(e) => set('occasionId', e.target.value)}>
                <option value="">— outra —</option>
                {occasions?.map((o) => <option key={o.id} value={o.id}>{o.name.pt}</option>)}
              </Select>
            </Field>
            {!f.occasionId && <Input className="mt-1" value={f.occasionOther} onChange={(e) => set('occasionOther', e.target.value)} placeholder="Qual?" />}
          </div>
          <Field label="Data" htmlFor="d-date"><Input id="d-date" type="date" value={f.eventDate} onChange={(e) => set('eventDate', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Hora" htmlFor="d-time"><Input id="d-time" type="time" value={f.eventTime} onChange={(e) => set('eventTime', e.target.value)} /></Field>
            <Field label="Conv." htmlFor="d-guests"><Input id="d-guests" type="number" min={1} value={f.guests} onChange={(e) => set('guests', e.target.value)} /></Field>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-cacau">Entrega</p>
          <div className="flex flex-wrap gap-2">
            {(['delivery', 'pickup', 'on_site'] as DeliveryMode[]).map((m) => (
              <button key={m} type="button" onClick={() => set('deliveryMode', f.deliveryMode === m ? '' : m)} className={cn('rounded-full border px-3 py-1.5 text-sm', f.deliveryMode === m ? 'border-cacau bg-cacau text-acucar' : 'border-linha hover:border-cacau/40')}>{deliveryModeLabel[m]}</button>
            ))}
          </div>
          {needsAddress && (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Input value={f.addressLine1} onChange={(e) => set('addressLine1', e.target.value)} placeholder="Morada" />
              <Input value={f.addressLine2} onChange={(e) => set('addressLine2', e.target.value)} placeholder="Complemento" />
              <Input value={f.postalCode} onChange={(e) => set('postalCode', e.target.value)} placeholder="Código postal" />
              <Input value={f.city} onChange={(e) => set('city', e.target.value)} placeholder="Localidade" />
              <Input value={f.addressNotes} onChange={(e) => set('addressNotes', e.target.value)} placeholder="Indicações" className="sm:col-span-2" />
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-cacau">Alergias e restrições</p>
          <div className="flex flex-wrap gap-1.5">
            {ALLERGENS.map((a) => {
              const on = f.allergies.includes(a)
              return <button key={a} type="button" onClick={() => set('allergies', on ? f.allergies.filter((x) => x !== a) : [...f.allergies, a])} className={cn('rounded-full border px-2.5 py-1 text-xs capitalize', on ? 'border-[#b4534b] bg-[#f3dcd9] text-[#7a2e27]' : 'border-linha hover:border-cacau/40')}>{a}</button>
            })}
          </div>
          <Input className="mt-2" value={f.dietaryNotes} onChange={(e) => set('dietaryNotes', e.target.value)} placeholder="Outras notas alimentares" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Nome no pedido" htmlFor="d-name"><Input id="d-name" value={f.contactName} onChange={(e) => set('contactName', e.target.value)} /></Field>
          <Field label="Telemóvel" htmlFor="d-phone"><Input id="d-phone" value={f.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} /></Field>
          <Field label="Origem" htmlFor="d-source">
            <Select id="d-source" value={f.source} onChange={(e) => set('source', e.target.value as OrderSource)}>
              {(['web', 'whatsapp', 'instagram', 'phone', 'in_person'] as OrderSource[]).map((s) => <option key={s} value={s}>{orderSourceLabel[s]}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="Notas internas" htmlFor="d-notes" hint="Só a equipa vê."><Textarea id="d-notes" rows={2} value={f.internalNotes} onChange={(e) => set('internalNotes', e.target.value)} /></Field>

        {dirty && <Switch checked={notify} onChange={setNotify} label="Avisar o cliente por e-mail" description="Envia um resumo do que mudou (data, convidados, entrega, alergias…). Notas internas nunca seguem." />}
      </CardBody>
    </Card>
  )
}

function fromOrder(o: Order) {
  return {
    occasionId: o.occasionId ?? '', occasionOther: o.occasionOther ?? '', eventDate: o.eventDate ?? '', eventTime: o.eventTime ?? '', guests: o.guests?.toString() ?? '',
    deliveryMode: (o.deliveryMode ?? '') as DeliveryMode | '', addressLine1: o.addressLine1 ?? '', addressLine2: o.addressLine2 ?? '', postalCode: o.postalCode ?? '', city: o.city ?? '', addressNotes: o.addressNotes ?? '',
    allergies: o.allergies, dietaryNotes: o.dietaryNotes ?? '', internalNotes: o.internalNotes ?? '', contactName: o.contactName, contactPhone: o.contactPhone ?? '', source: o.source,
  }
}

// MARK: Request text & photos

export function RequestCard({ order }: { order: Order }) {
  const toast = useToast()
  const { addAttachments, removeAttachment } = useOrderMutations(order.id)
  return (
    <Card>
      <CardHeader><CardTitle>O pedido</CardTitle></CardHeader>
      <CardBody className="space-y-4">
        {order.message ? <p className="whitespace-pre-wrap text-sm text-cacau/90">{order.message}</p> : <p className="text-sm text-cacau/50">Sem texto.</p>}
        {order.attachments.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {order.attachments.map((a) => (
              <li key={a.id} className="group relative">
                <a href={a.upload.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.upload.url} alt={a.caption ?? ''} className="h-24 w-24 rounded-xl object-cover" />
                </a>
                <span className="absolute bottom-1 left-1 rounded bg-cacau/70 px-1 text-[10px] text-acucar">{a.addedBy === 'client' ? 'cliente' : 'equipa'}</span>
                <button type="button" onClick={() => removeAttachment.mutateAsync(a.id).catch((e) => toast.error(apiErrorMessage(e)))} className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-cacau p-1 text-acucar group-hover:block" aria-label="Remover"><Trash2 className="h-3 w-3" /></button>
              </li>
            ))}
          </ul>
        )}
        <PhotoDropzone kind="request" compact label="Juntar fotografias (referências, esboços…)" onUploaded={(u) => addAttachments.mutateAsync(u.map((x) => x.id)).catch((e) => toast.error(apiErrorMessage(e)))} />
      </CardBody>
    </Card>
  )
}

// MARK: Proposal

export function ProposalCard({ order }: { order: Order }) {
  const toast = useToast()
  const { proposal } = useOrderMutations(order.id)
  const [amount, setAmount] = useState(order.proposalAmount?.toString() ?? '')
  const [text, setText] = useState(order.proposalText ?? '')
  const [validUntil, setValidUntil] = useState(order.proposalValidUntil ?? '')
  const [deposit, setDeposit] = useState(order.depositAmount?.toString() ?? '')
  useEffect(() => { setAmount(order.proposalAmount?.toString() ?? ''); setText(order.proposalText ?? ''); setValidUntil(order.proposalValidUntil ?? ''); setDeposit(order.depositAmount?.toString() ?? '') }, [order])
  const canSend = ['new', 'reviewing', 'proposal_sent'].includes(order.status)

  const submit = async (send: boolean) => {
    try {
      await proposal.mutateAsync({ amount: amount ? Number(amount) : undefined, text: text.trim() || undefined, validUntil: validUntil || undefined, depositAmount: deposit ? Number(deposit) : undefined, send })
      toast.success(send ? 'Proposta enviada ao cliente.' : 'Rascunho guardado.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposta</CardTitle>
        {order.proposalSentAt && <Badge className="bg-[#e8dcf5] text-[#4b2a73]">enviada {formatDate(order.proposalSentAt)}</Badge>}
      </CardHeader>
      <CardBody className="space-y-3">
        <Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="O que propõem, em texto corrido. Vai tal e qual no e-mail." />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Valor (€)" htmlFor="p-amount"><Input id="p-amount" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Field label="Sinal (€)" htmlFor="p-deposit"><Input id="p-deposit" type="number" min={0} step="0.01" value={deposit} onChange={(e) => setDeposit(e.target.value)} /></Field>
          <Field label="Válida até" htmlFor="p-valid"><Input id="p-valid" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></Field>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => submit(false)} loading={proposal.isPending}>Guardar rascunho</Button>
          <Button size="sm" onClick={() => submit(true)} loading={proposal.isPending} disabled={!canSend || (!text.trim() && !amount)} title={canSend ? undefined : 'Só numa encomenda nova, em análise ou com proposta enviada'}>
            {order.proposalSentAt ? 'Reenviar proposta' : 'Enviar proposta'}
          </Button>
        </div>
        {order.proposalAcceptedAt && <p className="text-xs text-cacau/50">Aceite a {formatDate(order.proposalAcceptedAt)}.</p>}
      </CardBody>
    </Card>
  )
}

// MARK: Payment

export function PaymentCard({ order }: { order: Order }) {
  const toast = useToast()
  const { payment } = useOrderMutations(order.id)
  const [status, setStatus] = useState<PaymentStatus>(order.paymentStatus)
  const [deposit, setDeposit] = useState(order.depositAmount?.toString() ?? '')
  const [dueOn, setDueOn] = useState(order.depositDueOn ?? '')
  const [method, setMethod] = useState(order.depositMethod ?? '')
  const [notify, setNotify] = useState(true)
  useEffect(() => { setStatus(order.paymentStatus); setDeposit(order.depositAmount?.toString() ?? ''); setDueOn(order.depositDueOn ?? ''); setMethod(order.depositMethod ?? '') }, [order])
  const dirty = status !== order.paymentStatus || deposit !== (order.depositAmount?.toString() ?? '') || dueOn !== (order.depositDueOn ?? '') || method !== (order.depositMethod ?? '')

  const save = async () => {
    try {
      await payment.mutateAsync({ paymentStatus: status, depositAmount: deposit ? Number(deposit) : null, depositDueOn: dueOn || null, depositMethod: method.trim() || null, notifyClient: notify })
      toast.success('Pagamento atualizado.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagamento</CardTitle>
        <Badge className={order.paymentStatus === 'paid' ? 'bg-[#dcebdc] text-[#245524]' : order.paymentStatus === 'deposit_paid' ? 'bg-po text-cacau' : 'bg-creme text-cacau/70'}>{paymentStatusLabel[order.paymentStatus]}</Badge>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Estado" htmlFor="pay-status">
            <Select id="pay-status" value={status} onChange={(e) => setStatus(e.target.value as PaymentStatus)}>
              <option value="pending">Por pagar</option>
              <option value="deposit_paid">Sinal pago</option>
              <option value="paid">Pago na totalidade</option>
            </Select>
          </Field>
          <Field label="Sinal (€)" htmlFor="pay-deposit"><Input id="pay-deposit" type="number" min={0} step="0.01" value={deposit} onChange={(e) => setDeposit(e.target.value)} /></Field>
          <Field label="Sinal até" htmlFor="pay-due"><Input id="pay-due" type="date" value={dueOn} onChange={(e) => setDueOn(e.target.value)} /></Field>
          <Field label="Meio" htmlFor="pay-method"><Input id="pay-method" value={method} onChange={(e) => setMethod(e.target.value)} placeholder="MB WAY, transferência, numerário…" /></Field>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs text-cacau/60">
          {order.proposalAmount != null && (<><dt>Valor da proposta</dt><dd className="tabular-nums">{formatMoney(order.proposalAmount)}</dd></>)}
          {order.depositPaidAt && (<><dt>Sinal recebido</dt><dd>{formatDate(order.depositPaidAt)}</dd></>)}
          {order.paidAt && (<><dt>Pago</dt><dd>{formatDate(order.paidAt)}</dd></>)}
        </dl>
        {dirty && status !== order.paymentStatus && <Switch checked={notify} onChange={setNotify} label="Avisar o cliente por e-mail" />}
        <div className="flex justify-end"><Button size="sm" onClick={save} disabled={!dirty} loading={payment.isPending}>Guardar</Button></div>
      </CardBody>
    </Card>
  )
}
