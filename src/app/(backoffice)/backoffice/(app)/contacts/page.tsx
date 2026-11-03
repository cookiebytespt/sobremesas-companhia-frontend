'use client'

import { Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Check, FilePlus2, RotateCcw, Trash2 } from 'lucide-react'
import PageHeader from '@/components/backoffice/PageHeader'
import Tabs from '@/components/backoffice/Tabs'
import { useToast } from '@/components/backoffice/Toaster'
import { Button } from '@/components/ui/button'
import { Card, CardBody } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { apiErrorMessage } from '@/lib/api/errors'
import { useContactMutations, useContacts } from '@/lib/backoffice/queries'
import { useListParams } from '@/lib/backoffice/useListParams'
import { formatDate, localeLabel } from '@/lib/labels'

export const dynamic = 'force-dynamic'

type Tab = 'open' | 'handled'

function ContactsList() {
  const { get, set, page } = useListParams()
  const router = useRouter()
  const toast = useToast()
  const tab = ((get('state') as Tab | undefined) ?? 'open') as Tab
  const { data, isLoading, error } = useContacts({ handled: tab === 'handled', page })
  const { setHandled, convert, remove } = useContactMutations()

  const run = async (p: Promise<unknown>, ok: string) => { try { await p; toast.success(ok) } catch (err) { toast.error(apiErrorMessage(err)) } }

  return (
    <>
      <PageHeader title="Contactos" description="Mensagens do formulário de contacto do site. Responda por e-mail; se virar encomenda, converta — o texto vai junto." />
      <div className="mb-4"><Tabs<Tab> items={[{ key: 'open', label: 'Por tratar' }, { key: 'handled', label: 'Tratados' }]} value={tab} onChange={(t) => set({ state: t === 'open' ? undefined : t, page: undefined })} /></div>
      {error && <p className="text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>}
      {isLoading && <Skeleton className="h-32 w-full" />}
      {data && data.items.length === 0 && <p className="text-sm text-cacau/50">{tab === 'open' ? 'Nada por tratar.' : 'Ainda nada tratado.'}</p>}
      <div className="space-y-3">
        {data?.items.map((c) => (
          <Card key={c.id}>
            <CardBody className="flex flex-wrap gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-cacau">{c.name} <span className="font-normal text-cacau/50">· {formatDate(c.createdAt, true)} · {localeLabel[c.locale]}</span></p>
                <p className="text-sm text-cacau/70"><a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a>{c.phone && ` · ${c.phone}`}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-cacau/90">{c.message}</p>
                {c.convertedOrderId && <button type="button" onClick={() => router.push(`/backoffice/orders/${c.convertedOrderId}`)} className="mt-2 text-xs text-cacau/60 underline-offset-2 hover:underline">Ver a encomenda criada</button>}
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                {!c.convertedOrderId && <Button size="sm" onClick={() => run(convert.mutateAsync(c.id).then((o) => router.push(`/backoffice/orders/${o.id}`)), 'Encomenda criada.')}><FilePlus2 className="h-3.5 w-3.5" aria-hidden /> Converter em encomenda</Button>}
                {c.handledAt ? (
                  <Button size="sm" variant="ghost" onClick={() => run(setHandled.mutateAsync({ id: c.id, handled: false }), 'Reaberto.')}><RotateCcw className="h-3.5 w-3.5" aria-hidden /> Reabrir</Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => run(setHandled.mutateAsync({ id: c.id, handled: true }), 'Marcado como tratado.')}><Check className="h-3.5 w-3.5" aria-hidden /> Tratado</Button>
                )}
                <Button size="sm" variant="ghost" className="text-[#b4534b]" onClick={() => run(remove.mutateAsync(c.id), 'Apagado.')}><Trash2 className="h-3.5 w-3.5" aria-hidden /> Apagar</Button>
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
    </>
  )
}

export default function ContactsPage() {
  return <Suspense><ContactsList /></Suspense>
}
