'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ImageOff, Pencil, Plus, Trash2, X } from 'lucide-react'
import ConfirmDialog from '@/components/backoffice/ConfirmDialog'
import DragHandle, { dropEdgeClass } from '@/components/backoffice/DragHandle'
import DurationInput from '@/components/backoffice/DurationInput'
import LocalizedTextInput, { cleanLocalized, emptyLocalized } from '@/components/backoffice/LocalizedTextInput'
import PageHeader from '@/components/backoffice/PageHeader'
import PhotoDropzone from '@/components/backoffice/PhotoDropzone'
import { useToast } from '@/components/backoffice/Toaster'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/dialog'
import { Field, Input, Select } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { apiErrorMessage } from '@/lib/api/errors'
import { itemTags, type AdminOfferItem, type AdminService, type ItemTag, type LocalizedString, type Upload } from '@/lib/api/types'
import { useService, useServiceMutations } from '@/lib/backoffice/queries'
import { useDragReorder } from '@/lib/backoffice/useDragReorder'
import { formatHours, formatMoney, iconOptions, itemTagLabel } from '@/lib/labels'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface ServiceDraft {
  name: LocalizedString; description: LocalizedString; icon: string; slug: string; active: boolean; shownInForm: boolean
  minNoticeHours: number | null; defaultProductionHours: number | null; defaultStartOffsetHours: number
  allowQuantities: boolean; quantityUnit: 'pessoas' | 'unidades'
}
const toDraft = (s: AdminService): ServiceDraft => ({
  name: s.name, description: s.description ?? emptyLocalized, icon: s.icon ?? '', slug: s.slug, active: s.active, shownInForm: s.shownInForm,
  minNoticeHours: s.minNoticeHours, defaultProductionHours: s.defaultProductionHours, defaultStartOffsetHours: s.defaultStartOffsetHours,
  allowQuantities: s.allowQuantities, quantityUnit: s.quantityUnit ?? 'unidades',
})

interface ItemDraft {
  name: LocalizedString; description: LocalizedString; photo: Upload | null; photoChanged: boolean
  productionHours: number | null; startOffsetHours: number | null; referencePrice: string; tags: ItemTag[]; shownInForm: boolean; active: boolean
}
const blankItem: ItemDraft = { name: emptyLocalized, description: emptyLocalized, photo: null, photoChanged: false, productionHours: null, startOffsetHours: null, referencePrice: '', tags: [], shownInForm: true, active: true }
const itemToDraft = (i: AdminOfferItem): ItemDraft => ({
  name: i.name, description: i.description ?? emptyLocalized, photo: i.photo, photoChanged: false, productionHours: i.productionHours, startOffsetHours: i.startOffsetHours,
  referencePrice: i.referencePrice === null ? '' : String(i.referencePrice), tags: i.tags, shownInForm: i.shownInForm, active: i.active,
})

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const toast = useToast()
  const { data: service, isLoading, error } = useService(id)
  const m = useServiceMutations(id)
  const [draft, setDraft] = useState<ServiceDraft | null>(null)
  const [editingItem, setEditingItem] = useState<AdminOfferItem | 'new' | null>(null)
  const [item, setItem] = useState<ItemDraft>(blankItem)
  const [removingItem, setRemovingItem] = useState<AdminOfferItem | null>(null)
  const [removingService, setRemovingService] = useState(false)

  useEffect(() => { if (service) setDraft(toDraft(service)) }, [service])

  const items = service?.items ?? []
  const dnd = useDragReorder(items.map((i) => i.id), (ids) => m.orderItems.mutate({ serviceId: id, ids }, { onError: (e) => toast.error(apiErrorMessage(e)) }))

  if (error) return <p className="text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>
  if (isLoading || !service || !draft) return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-64 w-full" /></div>

  const dirty = JSON.stringify(draft) !== JSON.stringify(toDraft(service))

  const saveService = async () => {
    try {
      await m.update.mutateAsync({
        id,
        input: {
          name: cleanLocalized(draft.name),
          description: draft.description.pt.trim() ? cleanLocalized(draft.description) : null,
          icon: draft.icon || null,
          ...(draft.slug !== service.slug ? { slug: draft.slug } : {}),
          active: draft.active,
          shownInForm: draft.shownInForm,
          minNoticeHours: draft.minNoticeHours,
          defaultProductionHours: draft.defaultProductionHours,
          defaultStartOffsetHours: draft.defaultStartOffsetHours,
          allowQuantities: draft.allowQuantities,
          quantityUnit: draft.allowQuantities ? draft.quantityUnit : null,
        },
      })
      toast.success('Serviço guardado.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const openItem = (i: AdminOfferItem | 'new') => {
    setEditingItem(i)
    setItem(i === 'new' ? blankItem : itemToDraft(i))
  }

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const price = item.referencePrice.trim() === '' ? null : Number(item.referencePrice.replace(',', '.'))
    if (price !== null && Number.isNaN(price)) return toast.error('Preço de referência inválido.')
    const input = {
      name: cleanLocalized(item.name),
      description: item.description.pt.trim() ? cleanLocalized(item.description) : null,
      productionHours: item.productionHours,
      startOffsetHours: item.startOffsetHours,
      referencePrice: price,
      tags: item.tags,
      shownInForm: item.shownInForm,
      active: item.active,
      ...(item.photoChanged ? { photoUploadId: item.photo?.id ?? null } : {}),
    }
    try {
      if (editingItem === 'new') await m.createItem.mutateAsync({ serviceId: id, input })
      else if (editingItem) await m.updateItem.mutateAsync({ id: editingItem.id, input })
      toast.success('Item guardado.')
      setEditingItem(null)
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }

  const removeItem = async () => {
    if (!removingItem) return
    try {
      await m.removeItem.mutateAsync(removingItem.id)
      toast.success('Item apagado.')
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setRemovingItem(null)
    }
  }

  const removeService = async () => {
    try {
      await m.remove.mutateAsync(id)
      toast.success('Serviço apagado.')
      router.replace('/backoffice/services')
    } catch (err) {
      toast.error(apiErrorMessage(err))
      setRemovingService(false)
    }
  }

  const toggleTag = (t: ItemTag) => setItem({ ...item, tags: item.tags.includes(t) ? item.tags.filter((x) => x !== t) : [...item.tags, t] })

  return (
    <>
      <Link href="/backoffice/services" className="mb-4 inline-flex items-center gap-1 text-sm text-cacau/60 hover:text-cacau"><ArrowLeft className="h-4 w-4" aria-hidden /> Serviços</Link>
      <PageHeader
        title={service.name.pt}
        description={`/${service.slug} · ${items.length} ite${items.length === 1 ? 'm' : 'ns'}`}
        actions={
          <>
            <Button variant="ghost" onClick={() => setRemovingService(true)}><Trash2 className="h-4 w-4" aria-hidden /> Apagar serviço</Button>
            <Button onClick={saveService} disabled={!dirty} loading={m.update.isPending}>Guardar</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Menu</CardTitle><Button size="sm" onClick={() => openItem('new')}><Plus className="h-4 w-4" aria-hidden /> Adicionar item</Button></CardHeader>
            {items.length === 0 ? (
              <CardBody><p className="text-sm text-cacau/60">Ainda sem itens. Para catering, por exemplo: rissóis, mini quiches, tábua de enchidos… Cada item pode ter o seu tempo de produção.</p></CardBody>
            ) : (
              <ul className="divide-y divide-linha">
                {items.map((i) => (
                  <li key={i.id} {...dnd.itemProps(i.id)} className={cn('flex items-center gap-3 px-4 py-2.5', dnd.dragging === i.id && 'opacity-40', dropEdgeClass(dnd.over, i.id, 'row'), !i.active && 'opacity-60')}>
                    <DragHandle {...dnd.handleProps(i.id)} />
                    {i.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.photo.url} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-creme text-cacau/30"><ImageOff className="h-4 w-4" /></span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-cacau">{i.name.pt}</p>
                      <p className="truncate text-xs text-cacau/50">
                        produção {i.productionHours === null ? `${formatHours(service.defaultProductionHours)} (predef.)` : formatHours(i.productionHours)}
                        {i.startOffsetHours !== null && i.startOffsetHours > 0 && ` · termina ${formatHours(i.startOffsetHours)} antes`}
                        {i.referencePrice !== null && ` · ref. ${formatMoney(i.referencePrice)}`}
                      </p>
                      {i.tags.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{i.tags.map((t) => <Badge key={t} className="bg-creme text-cacau/70">{itemTagLabel[t] ?? t}</Badge>)}</div>}
                    </div>
                    {!i.shownInForm && <Badge className="hidden bg-creme text-cacau/70 sm:inline-flex">Fora do pedido</Badge>}
                    <Button variant="ghost" size="icon" onClick={() => openItem(i)} aria-label="Editar"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setRemovingItem(i)} aria-label="Apagar"><Trash2 className="h-4 w-4" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Serviço</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <LocalizedTextInput label="Nome" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} required />
              <LocalizedTextInput label="Descrição" value={draft.description} onChange={(description) => setDraft({ ...draft, description })} multiline />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ícone" htmlFor="svc-icon">
                  <Select id="svc-icon" value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })}>
                    <option value="">Sem ícone</option>
                    {iconOptions.map((i) => <option key={i} value={i}>{i}</option>)}
                  </Select>
                </Field>
                <Field label="Identificador" htmlFor="svc-slug">
                  <Input id="svc-slug" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
                </Field>
              </div>
              <Switch checked={draft.shownInForm} onChange={(v) => setDraft({ ...draft, shownInForm: v })} label="Aparece no formulário de pedido" />
              <Switch checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} label="Ativo" />
            </CardBody>
          </Card>
          <Card>
            <CardHeader><CardTitle>Quantidades</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <Switch checked={draft.allowQuantities} onChange={(v) => setDraft({ ...draft, allowQuantities: v })} label="Pedir quantidades por item" description="Opcional para quem pede; a empresa recomenda a partir do número de convidados." />
              {draft.allowQuantities && (
                <Field label="Unidade" htmlFor="svc-unit">
                  <Select id="svc-unit" value={draft.quantityUnit} onChange={(e) => setDraft({ ...draft, quantityUnit: e.target.value as 'pessoas' | 'unidades' })}>
                    <option value="unidades">unidades</option>
                    <option value="pessoas">pessoas</option>
                  </Select>
                </Field>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader><CardTitle>Produção e calendário</CardTitle></CardHeader>
            <CardBody className="space-y-4">
              <DurationInput id="svc-prod" label="Tempo de produção (predefinição)" value={draft.defaultProductionHours} onChange={(v) => setDraft({ ...draft, defaultProductionHours: v })} hint="Usado pelos itens sem tempo próprio. Vazio = predefinição global das Definições." placeholder="Global" />
              <DurationInput id="svc-offset" label="Terminar antes do evento" value={draft.defaultStartOffsetHours || null} onChange={(v) => setDraft({ ...draft, defaultStartOffsetHours: v ?? 0 })} hint="Ex.: um bolo que tem de estar pronto meio dia antes." placeholder="0" />
              <DurationInput id="svc-notice" label="Aviso mínimo" value={draft.minNoticeHours} onChange={(v) => setDraft({ ...draft, minNoticeHours: v })} hint="Datas mais próximas que isto mostram um aviso no pedido (nunca o bloqueiam)." placeholder="Global" />
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal
        open={editingItem !== null}
        onClose={() => setEditingItem(null)}
        title={editingItem === 'new' ? 'Novo item' : 'Editar item'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingItem(null)}>Cancelar</Button>
            <Button type="submit" form="item-form" loading={m.createItem.isPending || m.updateItem.isPending} disabled={!item.name.pt.trim()}>Guardar</Button>
          </>
        }
      >
        <form id="item-form" onSubmit={saveItem} className="grid gap-4 sm:grid-cols-[1fr_180px]">
          <div className="space-y-4">
            <LocalizedTextInput label="Nome" value={item.name} onChange={(name) => setItem({ ...item, name })} required placeholder="Rissóis de camarão" />
            <LocalizedTextInput label="Descrição" value={item.description} onChange={(description) => setItem({ ...item, description })} multiline />
            <div className="grid gap-3 sm:grid-cols-2">
              <DurationInput id="item-prod" label="Tempo de produção" value={item.productionHours} onChange={(v) => setItem({ ...item, productionHours: v })} placeholder={service.defaultProductionHours === null ? 'Predef.' : formatHours(service.defaultProductionHours)} />
              <DurationInput id="item-offset" label="Terminar antes do evento" value={item.startOffsetHours} onChange={(v) => setItem({ ...item, startOffsetHours: v })} placeholder={formatHours(service.defaultStartOffsetHours)} />
            </div>
            <Field label="Preço de referência (interno, €)" htmlFor="item-price" hint="Nunca é mostrado ao cliente; só pré-preenche a proposta.">
              <Input id="item-price" inputMode="decimal" value={item.referencePrice} onChange={(e) => setItem({ ...item, referencePrice: e.target.value })} className="w-40" placeholder="0,90" />
            </Field>
            <div>
              <p className="mb-1.5 text-sm font-medium text-cacau/80">Etiquetas</p>
              <div className="flex flex-wrap gap-1.5">
                {itemTags.map((t) => (
                  <button key={t} type="button" onClick={() => toggleTag(t)} className={cn('rounded-full border px-3 py-1 text-xs', item.tags.includes(t) ? 'border-cacau bg-cacau text-acucar' : 'border-linha text-cacau/70 hover:bg-creme')}>
                    {itemTagLabel[t]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <Switch checked={item.shownInForm} onChange={(v) => setItem({ ...item, shownInForm: v })} label="Aparece no pedido" />
              <Switch checked={item.active} onChange={(v) => setItem({ ...item, active: v })} label="Ativo" />
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-cacau/80">Fotografia</p>
            {item.photo ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.photo.url} alt="" className="aspect-square w-full rounded-xl object-cover" />
                <button type="button" onClick={() => setItem({ ...item, photo: null, photoChanged: true })} className="absolute right-2 top-2 rounded-full bg-cacau/80 p-1 text-acucar" aria-label="Remover fotografia"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <PhotoDropzone kind="item" multiple={false} compact label="Escolher fotografia" onUploaded={(u) => setItem({ ...item, photo: u[0], photoChanged: true })} />
            )}
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={removingItem !== null} onClose={() => setRemovingItem(null)} onConfirm={removeItem} title="Apagar item?" description={`«${removingItem?.name.pt}» sai do menu.`} confirmLabel="Apagar" variant="danger" loading={m.removeItem.isPending} />
      <ConfirmDialog open={removingService} onClose={() => setRemovingService(false)} onConfirm={removeService} title="Apagar serviço?" description="O serviço e todos os seus itens são removidos. Se já houver pedidos associados, desative-o em vez disso." confirmLabel="Apagar" variant="danger" loading={m.remove.isPending} />
    </>
  )
}
