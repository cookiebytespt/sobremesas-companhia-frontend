'use client'

import { Suspense, useMemo, useState } from 'react'
import { Eye, EyeOff, Star, Trash2, X } from 'lucide-react'
import ConfirmDialog from '@/components/backoffice/ConfirmDialog'
import DragHandle, { dropEdgeClass } from '@/components/backoffice/DragHandle'
import LocalizedTextInput, { cleanLocalized, emptyLocalized } from '@/components/backoffice/LocalizedTextInput'
import PageHeader from '@/components/backoffice/PageHeader'
import PhotoDropzone from '@/components/backoffice/PhotoDropzone'
import Tabs from '@/components/backoffice/Tabs'
import { useToast } from '@/components/backoffice/Toaster'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { Field, Input, Select } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { apiErrorMessage } from '@/lib/api/errors'
import type { AdminGalleryPhoto, GalleryPlacement, LocalizedString, Upload } from '@/lib/api/types'
import { useGallery, useGalleryMutations, useOccasions } from '@/lib/backoffice/queries'
import { useDragReorder } from '@/lib/backoffice/useDragReorder'
import { useListParams } from '@/lib/backoffice/useListParams'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type View = 'all' | 'gallery' | 'hero' | 'hidden'

/** A freshly uploaded photo waiting for its caption before it enters the gallery. */
interface Pending { upload: Upload; caption: LocalizedString; occasionId: string; placement: GalleryPlacement }

function GalleryPage() {
  const toast = useToast()
  const { get, set } = useListParams()
  const view = (get('view') as View | undefined) ?? 'all'
  const occasionFilter = get('occasion')
  const query = useMemo(() => ({
    occasion: occasionFilter,
    placement: view === 'gallery' ? ('gallery' as const) : view === 'hero' ? ('hero' as const) : undefined,
    published: view === 'hidden' ? false : undefined,
  }), [view, occasionFilter])

  const { data: occasions } = useOccasions()
  const { data, isLoading, isFetching, error } = useGallery(query)
  const m = useGalleryMutations()
  const photos = data ?? []
  const occasionName = (id: string) => occasions?.find((o) => o.id === id)?.name.pt ?? '—'

  const [pending, setPending] = useState<Pending[]>([])
  const [editing, setEditing] = useState<AdminGalleryPhoto | null>(null)
  const [draft, setDraft] = useState<{ caption: LocalizedString; occasionId: string; placement: GalleryPlacement; tall: boolean; featured: boolean; published: boolean } | null>(null)
  const [removing, setRemoving] = useState<AdminGalleryPhoto | null>(null)

  const canReorder = view === 'all' && !occasionFilter
  const dnd = useDragReorder(photos.map((p) => p.id), (ids) => m.order.mutate(ids, { onError: (e) => toast.error(apiErrorMessage(e)) }))

  const defaultOccasion = occasionFilter ?? occasions?.[0]?.id ?? ''

  const onUploaded = (uploads: Upload[]) =>
    setPending((p) => [...p, ...uploads.map((upload) => ({ upload, caption: emptyLocalized, occasionId: defaultOccasion, placement: 'gallery' as const }))])

  const publishPending = async () => {
    const ready = pending.filter((p) => p.caption.pt.trim() && p.occasionId)
    if (ready.length === 0) return toast.error('Cada fotografia precisa de legenda em português e ocasião.')
    try {
      await m.createBulk.mutateAsync(ready.map((p) => ({ uploadId: p.upload.id, occasionId: p.occasionId, caption: cleanLocalized(p.caption), placement: p.placement })))
      setPending((p) => p.filter((x) => !ready.includes(x)))
      toast.success(`${ready.length} fotografia${ready.length === 1 ? '' : 's'} adicionada${ready.length === 1 ? '' : 's'} à galeria.`)
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const openEdit = (p: AdminGalleryPhoto) => {
    setEditing(p)
    setDraft({ caption: p.caption, occasionId: p.occasionId, placement: p.placement, tall: p.tall, featured: p.featured, published: p.published })
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing || !draft) return
    try {
      await m.update.mutateAsync({ id: editing.id, input: { ...draft, caption: cleanLocalized(draft.caption) } })
      toast.success('Fotografia guardada.')
      setEditing(null)
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const quick = (p: AdminGalleryPhoto, patch: { published?: boolean; featured?: boolean; placement?: GalleryPlacement }) =>
    m.update.mutate({ id: p.id, input: patch }, { onError: (e) => toast.error(apiErrorMessage(e)) })

  const remove = async () => {
    if (!removing) return
    try {
      await m.remove.mutateAsync(removing.id)
      toast.success('Fotografia apagada.')
      setEditing(null)
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setRemoving(null)
    }
  }

  const pendingReady = pending.filter((p) => p.caption.pt.trim() && p.occasionId).length

  return (
    <>
      <PageHeader title="Galeria" description="As fotografias do site e da plataforma. Arraste para ordenar (na vista «Todas», sem filtro)." />

      <PhotoDropzone kind="gallery" onUploaded={onUploaded} />

      {pending.length > 0 && (
        <section className="mt-4 rounded-2xl border border-po bg-po/20 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-cacau">{pending.length} fotografia{pending.length === 1 ? '' : 's'} por legendar</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setPending([])}>Descartar</Button>
              <Button size="sm" onClick={publishPending} loading={m.createBulk.isPending} disabled={pendingReady === 0}>Adicionar à galeria{pendingReady > 0 && pendingReady < pending.length ? ` (${pendingReady})` : ''}</Button>
            </div>
          </div>
          <ul className="grid gap-3 md:grid-cols-2">
            {pending.map((p, i) => (
              <li key={p.upload.id} className="flex gap-3 rounded-xl bg-white p-3 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.upload.url} alt="" className="h-28 w-24 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1 space-y-2">
                  <LocalizedTextInput label="Legenda" value={p.caption} onChange={(caption) => setPending((all) => all.map((x, j) => (j === i ? { ...x, caption } : x)))} required placeholder="Bolo de casamento com flores do campo" />
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={p.occasionId} onChange={(e) => setPending((all) => all.map((x, j) => (j === i ? { ...x, occasionId: e.target.value } : x)))} aria-label="Ocasião">
                      <option value="">Ocasião…</option>
                      {occasions?.map((o) => <option key={o.id} value={o.id}>{o.name.pt}</option>)}
                    </Select>
                    <Select value={p.placement} onChange={(e) => setPending((all) => all.map((x, j) => (j === i ? { ...x, placement: e.target.value as GalleryPlacement } : x)))} aria-label="Onde">
                      <option value="gallery">Galeria</option>
                      <option value="hero">Capa (hero)</option>
                    </Select>
                  </div>
                </div>
                <button type="button" onClick={() => setPending((all) => all.filter((_, j) => j !== i))} className="self-start rounded-lg p-1 text-cacau/40 hover:bg-creme hover:text-cacau" aria-label="Remover da lista"><X className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs<View>
          items={[{ key: 'all', label: 'Todas' }, { key: 'gallery', label: 'Galeria' }, { key: 'hero', label: 'Capa' }, { key: 'hidden', label: 'Ocultas' }]}
          value={view}
          onChange={(v) => set({ view: v === 'all' ? undefined : v })}
        />
        <Select value={occasionFilter ?? ''} onChange={(e) => set({ occasion: e.target.value || undefined })} className="w-56" aria-label="Filtrar por ocasião">
          <option value="">Todas as ocasiões</option>
          {occasions?.map((o) => <option key={o.id} value={o.id}>{o.name.pt} ({o.photoCount})</option>)}
        </Select>
      </div>

      {error && <p className="mb-4 text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-xl" />)}</div>
      ) : photos.length === 0 ? (
        <p className="rounded-2xl border border-linha bg-white p-12 text-center text-sm text-cacau/60">Nenhuma fotografia nesta vista.</p>
      ) : (
        <ul className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5', isFetching && 'opacity-70')}>
          {photos.map((p) => (
            <li
              key={p.id}
              {...(canReorder ? dnd.itemProps(p.id) : {})}
              className={cn('group relative overflow-hidden rounded-xl border border-linha bg-white shadow-sm', dnd.dragging === p.id && 'opacity-40', canReorder && dropEdgeClass(dnd.over, p.id, 'grid'), !p.published && 'opacity-60')}
            >
              <button type="button" onClick={() => openEdit(p)} className="block w-full text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.upload.url} alt={p.caption.pt} className={cn('w-full object-cover', p.tall ? 'aspect-[4/5]' : 'aspect-square')} loading="lazy" />
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-cacau">{p.caption.pt}</p>
                  <p className="truncate text-[11px] text-cacau/50">{occasionName(p.occasionId)}</p>
                </div>
              </button>
              <div className="absolute left-1.5 top-1.5 flex gap-1">
                {p.placement === 'hero' && <Badge className="bg-cacau/85 text-acucar">Capa</Badge>}
                {p.featured && <Badge className="bg-merengue text-cacau">Destaque</Badge>}
                {!p.published && <Badge className="bg-white/90 text-cacau">Oculta</Badge>}
              </div>
              <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                {canReorder && <DragHandle {...dnd.handleProps(p.id)} className="bg-white/90 text-cacau/60 shadow" />}
                <button type="button" onClick={() => quick(p, { featured: !p.featured })} className="rounded-md bg-white/90 p-1.5 text-cacau/70 shadow hover:text-cacau" aria-label={p.featured ? 'Tirar destaque' : 'Destacar'}><Star className={cn('h-3.5 w-3.5', p.featured && 'fill-current')} /></button>
                <button type="button" onClick={() => quick(p, { published: !p.published })} className="rounded-md bg-white/90 p-1.5 text-cacau/70 shadow hover:text-cacau" aria-label={p.published ? 'Ocultar' : 'Publicar'}>{p.published ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="Fotografia"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => editing && setRemoving(editing)} className="mr-auto text-[#b4534b]"><Trash2 className="h-4 w-4" aria-hidden /> Apagar</Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button type="submit" form="photo-form" loading={m.update.isPending} disabled={!draft?.caption.pt.trim()}>Guardar</Button>
          </>
        }
      >
        {editing && draft && (
          <form id="photo-form" onSubmit={saveEdit} className="grid gap-4 sm:grid-cols-[220px_1fr]">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={editing.upload.url} alt="" className="w-full rounded-xl object-cover" />
              <p className="mt-2 text-xs text-cacau/50">{editing.upload.width && editing.upload.height ? `${editing.upload.width} × ${editing.upload.height}` : ''} · {editing.upload.filename}</p>
            </div>
            <div className="space-y-4">
              <LocalizedTextInput label="Legenda (também o texto alternativo)" value={draft.caption} onChange={(caption) => setDraft({ ...draft, caption })} required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ocasião" htmlFor="photo-occasion">
                  <Select id="photo-occasion" value={draft.occasionId} onChange={(e) => setDraft({ ...draft, occasionId: e.target.value })}>
                    {occasions?.map((o) => <option key={o.id} value={o.id}>{o.name.pt}</option>)}
                  </Select>
                </Field>
                <Field label="Onde aparece" htmlFor="photo-placement">
                  <Select id="photo-placement" value={draft.placement} onChange={(e) => setDraft({ ...draft, placement: e.target.value as GalleryPlacement })}>
                    <option value="gallery">Galeria</option>
                    <option value="hero">Capa (hero)</option>
                  </Select>
                </Field>
              </div>
              <div className="flex flex-wrap gap-6">
                <Switch checked={draft.published} onChange={(v) => setDraft({ ...draft, published: v })} label="Publicada" />
                <Switch checked={draft.featured} onChange={(v) => setDraft({ ...draft, featured: v })} label="Destaque" />
                <Switch checked={draft.tall} onChange={(v) => setDraft({ ...draft, tall: v })} label="Alta (ao alto na grelha)" />
              </div>
              <Input readOnly value={editing.upload.url} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" aria-label="URL" />
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog open={removing !== null} onClose={() => setRemoving(null)} onConfirm={remove} title="Apagar fotografia?" description="Sai da galeria e os ficheiros são eliminados. Para a esconder sem apagar, use «Ocultar»." confirmLabel="Apagar" variant="danger" loading={m.remove.isPending} />
    </>
  )
}

export default function Page() {
  return (
    <Suspense>
      <GalleryPage />
    </Suspense>
  )
}
