'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Plus } from 'lucide-react'
import DragHandle, { dropEdgeClass } from '@/components/backoffice/DragHandle'
import LocalizedTextInput, { cleanLocalized, emptyLocalized } from '@/components/backoffice/LocalizedTextInput'
import PageHeader from '@/components/backoffice/PageHeader'
import { useToast } from '@/components/backoffice/Toaster'
import { Icon } from '@/components/site/Icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { apiErrorMessage } from '@/lib/api/errors'
import type { LocalizedString } from '@/lib/api/types'
import { useServiceMutations, useServices } from '@/lib/backoffice/queries'
import { useDragReorder } from '@/lib/backoffice/useDragReorder'
import { formatHours } from '@/lib/labels'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default function ServicesPage() {
  const toast = useToast()
  const { data, isLoading, error } = useServices()
  const m = useServiceMutations()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState<LocalizedString>(emptyLocalized)

  const rows = data ?? []
  const dnd = useDragReorder(rows.map((s) => s.id), (ids) => m.order.mutate(ids, { onError: (e) => toast.error(apiErrorMessage(e)) }))

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await m.create.mutateAsync({ name: cleanLocalized(name) })
      toast.success('Serviço criado. Agora adicione os itens.')
      setCreating(false)
      setName(emptyLocalized)
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  return (
    <>
      <PageHeader
        title="Serviços"
        description="O que a Sobremesas & Companhia faz — as opções de «O que procura» no pedido — e o menu de cada um, com os tempos de produção."
        actions={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" aria-hidden /> Novo serviço</Button>}
      />
      {error && <p className="mb-4 text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>}
      <div className="overflow-hidden rounded-2xl border border-linha bg-white shadow-sm">
        {isLoading && <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>}
        {!isLoading && rows.length === 0 && <p className="p-10 text-center text-sm text-cacau/60">Ainda não há serviços. Importe os do site ou crie o primeiro.</p>}
        <ul className="divide-y divide-linha">
          {rows.map((s) => (
            <li key={s.id} {...dnd.itemProps(s.id)} className={cn('flex items-center gap-3 px-3 py-3 sm:px-4', dnd.dragging === s.id && 'opacity-40', dropEdgeClass(dnd.over, s.id, 'row'), !s.active && 'opacity-60')}>
              <DragHandle {...dnd.handleProps(s.id)} />
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-po text-cacau">
                {s.icon ? <Icon name={s.icon} className="h-5 w-5" /> : <span className="text-xs">—</span>}
              </span>
              <Link href={`/backoffice/services/${s.id}`} className="min-w-0 flex-1 group">
                <p className="truncate font-medium text-cacau group-hover:underline">{s.name.pt}</p>
                <p className="truncate text-xs text-cacau/50">
                  {s.itemCount} ite{s.itemCount === 1 ? 'm' : 'ns'} · produção {formatHours(s.defaultProductionHours)} · aviso mínimo {formatHours(s.minNoticeHours)}
                </p>
              </Link>
              <div className="hidden gap-1 sm:flex">
                {!s.shownInForm && <Badge className="bg-creme text-cacau/70">Fora do pedido</Badge>}
                {!s.active && <Badge className="bg-creme text-cacau/70">Inativo</Badge>}
                {s.allowQuantities && <Badge className="bg-po/60 text-cacau">quantidades · {s.quantityUnit ?? 'unidades'}</Badge>}
              </div>
              <Link href={`/backoffice/services/${s.id}`} className="rounded-lg p-2 text-cacau/50 hover:bg-creme hover:text-cacau" aria-label="Abrir"><ChevronRight className="h-4 w-4" /></Link>
            </li>
          ))}
        </ul>
      </div>

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="Novo serviço"
        description="Só o nome por agora; os itens e as regras de produção definem-se na página do serviço."
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreating(false)}>Cancelar</Button>
            <Button type="submit" form="service-form" loading={m.create.isPending} disabled={!name.pt.trim()}>Criar</Button>
          </>
        }
      >
        <form id="service-form" onSubmit={create}>
          <LocalizedTextInput label="Nome" value={name} onChange={setName} required placeholder="Catering" />
        </form>
      </Modal>
    </>
  )
}
