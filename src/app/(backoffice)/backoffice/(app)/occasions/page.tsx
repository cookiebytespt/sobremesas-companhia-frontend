'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import ConfirmDialog from '@/components/backoffice/ConfirmDialog'
import DragHandle, { dropEdgeClass } from '@/components/backoffice/DragHandle'
import LocalizedTextInput, { cleanLocalized, emptyLocalized } from '@/components/backoffice/LocalizedTextInput'
import PageHeader from '@/components/backoffice/PageHeader'
import { useToast } from '@/components/backoffice/Toaster'
import { Icon } from '@/components/site/Icon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { Field, Input, Select } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { apiErrorMessage } from '@/lib/api/errors'
import type { AdminOccasion, LocalizedString } from '@/lib/api/types'
import { useOccasionMutations, useOccasions } from '@/lib/backoffice/queries'
import { useDragReorder } from '@/lib/backoffice/useDragReorder'
import { iconOptions } from '@/lib/labels'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Draft { name: LocalizedString; description: LocalizedString; icon: string; slug: string; active: boolean; shownInForm: boolean }
const blank: Draft = { name: emptyLocalized, description: emptyLocalized, icon: '', slug: '', active: true, shownInForm: true }

export default function OccasionsPage() {
  const toast = useToast()
  const { data, isLoading, error } = useOccasions()
  const m = useOccasionMutations()
  const [editing, setEditing] = useState<AdminOccasion | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(blank)
  const [removing, setRemoving] = useState<AdminOccasion | null>(null)

  const rows = data ?? []
  const dnd = useDragReorder(rows.map((o) => o.id), (ids) => m.order.mutate(ids, { onError: (e) => toast.error(apiErrorMessage(e)) }))

  const open = (o: AdminOccasion | 'new') => {
    setEditing(o)
    setDraft(o === 'new' ? blank : { name: o.name, description: o.description ?? emptyLocalized, icon: o.icon ?? '', slug: o.slug, active: o.active, shownInForm: o.shownInForm })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const input = {
      name: cleanLocalized(draft.name),
      description: draft.description.pt.trim() ? cleanLocalized(draft.description) : null,
      icon: draft.icon || null,
      active: draft.active,
      shownInForm: draft.shownInForm,
      ...(editing !== 'new' && draft.slug !== editing?.slug ? { slug: draft.slug } : {}),
    }
    try {
      if (editing === 'new') await m.create.mutateAsync(input)
      else if (editing) await m.update.mutateAsync({ id: editing.id, input })
      toast.success('Ocasião guardada.')
      setEditing(null)
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const toggle = (o: AdminOccasion, patch: { active?: boolean; shownInForm?: boolean }) =>
    m.update.mutate({ id: o.id, input: patch }, { onError: (e) => toast.error(apiErrorMessage(e)) })

  const remove = async () => {
    if (!removing) return
    try {
      await m.remove.mutateAsync(removing.id)
      toast.success('Ocasião apagada.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setRemoving(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Ocasiões"
        description="Os filtros da galeria e a lista «Ocasião» do pedido: tipos de evento e famílias de produto. Arraste para ordenar."
        actions={<Button onClick={() => open('new')}><Plus className="h-4 w-4" aria-hidden /> Nova ocasião</Button>}
      />
      {error && <p className="mb-4 text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>}
      <div className="overflow-hidden rounded-2xl border border-linha bg-white shadow-sm">
        {isLoading && <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>}
        {!isLoading && rows.length === 0 && <p className="p-10 text-center text-sm text-cacau/60">Ainda não há ocasiões. Importe as do site ou crie a primeira.</p>}
        <ul className="divide-y divide-linha">
          {rows.map((o) => (
            <li
              key={o.id}
              {...dnd.itemProps(o.id)}
              className={cn('flex items-center gap-3 px-3 py-2.5 sm:px-4', dnd.dragging === o.id && 'opacity-40', dropEdgeClass(dnd.over, o.id, 'row'), !o.active && 'opacity-60')}
            >
              <DragHandle {...dnd.handleProps(o.id)} />
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-po text-cacau">
                {o.icon ? <Icon name={o.icon} className="h-5 w-5" /> : <span className="text-xs">—</span>}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-cacau">{o.name.pt}</p>
                <p className="truncate text-xs text-cacau/50">
                  /{o.slug} · {o.photoCount} foto{o.photoCount === 1 ? '' : 's'}
                  {[o.name.en, o.name.es, o.name.fr].some((t) => !t) && <span className="ml-2 text-po-fundo">traduções em falta</span>}
                </p>
              </div>
              <div className="hidden items-center gap-4 sm:flex">
                <Switch checked={o.shownInForm} onChange={(v) => toggle(o, { shownInForm: v })} label="No pedido" />
                <Switch checked={o.active} onChange={(v) => toggle(o, { active: v })} label="Ativa" />
              </div>
              {!o.active && <Badge className="bg-creme text-cacau/70 sm:hidden">Inativa</Badge>}
              <Button variant="ghost" size="icon" onClick={() => open(o)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setRemoving(o)} aria-label="Apagar" disabled={o.photoCount > 0} title={o.photoCount > 0 ? 'Tem fotografias associadas — desative em vez de apagar' : undefined}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Nova ocasião' : 'Editar ocasião'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button type="submit" form="occasion-form" loading={m.create.isPending || m.update.isPending} disabled={!draft.name.pt.trim()}>Guardar</Button>
          </>
        }
      >
        <form id="occasion-form" onSubmit={save} className="space-y-4">
          <LocalizedTextInput label="Nome" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} required placeholder="Casamentos" />
          <LocalizedTextInput label="Descrição" value={draft.description} onChange={(description) => setDraft({ ...draft, description })} multiline />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ícone" htmlFor="occasion-icon">
              <Select id="occasion-icon" value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })}>
                <option value="">Sem ícone</option>
                {iconOptions.map((i) => <option key={i} value={i}>{i}</option>)}
              </Select>
            </Field>
            {editing !== 'new' && (
              <Field label="Identificador (URL)" htmlFor="occasion-slug" hint="Muda os links do site; evite alterar depois de publicado.">
                <Input id="occasion-slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
              </Field>
            )}
          </div>
          <Switch checked={draft.shownInForm} onChange={(v) => setDraft({ ...draft, shownInForm: v })} label="Aparece no formulário de pedido" description="Desligue para uma categoria que só serve de filtro na galeria." />
          <Switch checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} label="Ativa" description="Inativa desaparece do site e da galeria pública, mas mantém as fotografias." />
        </form>
      </Modal>

      <ConfirmDialog open={removing !== null} onClose={() => setRemoving(null)} onConfirm={remove} title="Apagar ocasião?" description={`«${removing?.name.pt}» será removida.`} confirmLabel="Apagar" variant="danger" loading={m.remove.isPending} />
    </>
  )
}
