'use client'

import { useState } from 'react'
import { AlertTriangle, Clock, Lock, Paperclip, Send, X } from 'lucide-react'
import PhotoDropzone from '@/components/backoffice/PhotoDropzone'
import { useToast } from '@/components/backoffice/Toaster'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { apiErrorMessage } from '@/lib/api/errors'
import type { Order, OrderMessage, Upload } from '@/lib/api/types'
import { useOrderMessages, useOrderMutations } from '@/lib/backoffice/queries'
import { formatDate } from '@/lib/labels'
import { cn } from '@/lib/utils'

const templateLabel: Record<string, string> = {
  order_received: 'Confirmação de receção', status_changed: 'Mudança de estado', proposal_sent: 'Proposta', deposit_recorded: 'Pagamento',
  order_updated: 'Atualização da encomenda', new_message: 'Mensagem', inbound: 'Resposta do cliente',
}

/**
 * The order's e-mail thread plus internal notes. Everything written here as "e-mail" goes to the
 * client through the outbox; "nota interna" stays in the backoffice. Replies (phase 4 sync) arrive
 * as inbound rows.
 */
export default function OrderConversation({ order }: { order: Order }) {
  const toast = useToast()
  const { data, isLoading, error } = useOrderMessages(order.id)
  const { sendMessage } = useOrderMutations(order.id)
  const [body, setBody] = useState('')
  const [internal, setInternal] = useState(false)
  const [photos, setPhotos] = useState<Upload[]>([])
  const [attaching, setAttaching] = useState(false)

  const send = async () => {
    try {
      await sendMessage.mutateAsync({ body: body.trim(), internal, uploadIds: internal ? undefined : photos.map((p) => p.id) })
      setBody(''); setPhotos([]); setAttaching(false)
      toast.success(internal ? 'Nota guardada.' : 'E-mail em envio.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>}
      {isLoading && <div className="space-y-3"><Skeleton className="h-16 w-3/4" /><Skeleton className="ml-auto h-16 w-3/4" /></div>}
      {data && data.length === 0 && <p className="text-sm text-cacau/50">Ainda não há mensagens.</p>}
      <ol className="space-y-3">
        {data?.map((m) => <MessageBubble key={m.id} m={m} />)}
      </ol>

      <div className={cn('rounded-2xl border p-3', internal ? 'border-merengue bg-merengue/40' : 'border-linha bg-acucar')}>
        <div className="mb-2 flex items-center gap-2 text-xs">
          <button type="button" onClick={() => setInternal(false)} className={cn('rounded-full px-3 py-1', !internal ? 'bg-cacau text-acucar' : 'text-cacau/60 hover:bg-creme')}>E-mail ao cliente</button>
          <button type="button" onClick={() => setInternal(true)} className={cn('rounded-full px-3 py-1', internal ? 'bg-cacau text-acucar' : 'text-cacau/60 hover:bg-creme')}><Lock className="mr-1 inline h-3 w-3" />Nota interna</button>
          <span className="ml-auto text-cacau/40">{internal ? 'Só a equipa vê.' : `Para ${order.contactEmail}`}</span>
        </div>
        <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder={internal ? 'Apontamento para a equipa…' : 'Escreva como num e-mail; a saudação e a assinatura são acrescentadas.'} />
        {!internal && attaching && (
          <div className="mt-2">
            <PhotoDropzone kind="message" compact label="Fotografias para anexar" onUploaded={(u) => setPhotos((p) => [...p, ...u])} />
          </div>
        )}
        {photos.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {photos.map((p) => (
              <li key={p.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <button type="button" onClick={() => setPhotos(photos.filter((x) => x.id !== p.id))} className="absolute -right-1 -top-1 rounded-full bg-cacau p-0.5 text-acucar" aria-label="Remover"><X className="h-3 w-3" /></button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex items-center justify-between">
          {!internal ? (
            <button type="button" onClick={() => setAttaching((a) => !a)} className="inline-flex items-center gap-1 text-xs text-cacau/60 hover:text-cacau"><Paperclip className="h-3.5 w-3.5" /> Anexar fotografias</button>
          ) : <span />}
          <Button size="sm" onClick={send} loading={sendMessage.isPending} disabled={!body.trim()}>
            <Send className="h-3.5 w-3.5" aria-hidden /> {internal ? 'Guardar nota' : 'Enviar e-mail'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ m }: { m: OrderMessage }) {
  const mine = m.direction === 'out'
  const when = formatDate(m.sentAt ?? m.receivedAt ?? m.createdAt, true)
  return (
    <li className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%] rounded-2xl px-4 py-3 text-sm', m.internal ? 'border border-merengue bg-merengue/40 text-cacau' : mine ? 'bg-cacau text-acucar' : 'border border-linha bg-acucar text-cacau')}>
        <div className={cn('mb-1 flex flex-wrap items-center gap-x-2 text-[11px]', m.internal ? 'text-cacau/60' : mine ? 'text-acucar/60' : 'text-cacau/50')}>
          {m.internal ? <><Lock className="h-3 w-3" /> Nota interna · {m.authorName ?? 'equipa'}</> : mine ? <>{m.authorName ?? (templateLabel[m.template ?? ''] ?? 'Sistema')}{m.authorName && m.template && m.template !== 'new_message' ? ` · ${templateLabel[m.template]}` : ''}</> : <>{m.fromEmail}</>}
          <span>· {when}</span>
          {m.pending && !m.sendError && <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> a enviar</span>}
          {m.sendError && <span className="inline-flex items-center gap-1 text-[#ffd5cf]" title={m.sendError}><AlertTriangle className="h-3 w-3" /> falhou</span>}
        </div>
        {m.subject && !m.internal && <p className={cn('mb-1 font-medium', mine ? 'text-acucar' : 'text-cacau')}>{m.subject}</p>}
        <p className="whitespace-pre-wrap">{m.bodyText}</p>
        {m.attachments.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {m.attachments.map((a) => (
              <li key={a.id}>
                <a href={a.url} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}
