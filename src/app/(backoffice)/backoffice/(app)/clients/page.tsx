'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { UserPlus } from 'lucide-react'
import DataTable from '@/components/backoffice/DataTable'
import PageHeader from '@/components/backoffice/PageHeader'
import SearchInput from '@/components/backoffice/SearchInput'
import Tabs from '@/components/backoffice/Tabs'
import { useToast } from '@/components/backoffice/Toaster'
import { Avatar } from '@/components/backoffice/UserBits'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { Field, Input } from '@/components/ui/input'
import { apiErrorMessage } from '@/lib/api/errors'
import type { Client } from '@/lib/api/types'
import { useClientMutations, useClients } from '@/lib/backoffice/queries'
import { useListParams } from '@/lib/backoffice/useListParams'
import { formatDate } from '@/lib/labels'

export const dynamic = 'force-dynamic'

type Filter = 'all' | 'order' | 'google' | 'manual'
const sourceLabel: Record<string, string> = { order: 'Encomenda', google: 'Google', manual: 'Manual' }

const columns: ColumnDef<Client, unknown>[] = [
  {
    id: 'client', header: 'Cliente',
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.original.name} email={row.original.email} picture={null} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-medium text-cacau">{row.original.name}</p>
          <p className="truncate text-xs text-cacau/50">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  { id: 'phone', header: 'Telemóvel', cell: ({ row }) => <span className="text-cacau/80">{row.original.phone ?? '—'}</span> },
  { id: 'orders', header: 'Encomendas', size: 110, cell: ({ row }) => <span className="tabular-nums">{row.original.orderCount ?? 0}</span> },
  { id: 'last', header: 'Última', size: 110, cell: ({ row }) => <span className="text-cacau/60">{row.original.lastOrderAt ? formatDate(row.original.lastOrderAt) : '—'}</span> },
  {
    id: 'source', header: 'Origem', size: 130,
    cell: ({ row }) => <div className="flex gap-1"><Badge className="bg-creme text-cacau/70">{sourceLabel[row.original.source] ?? row.original.source}</Badge>{row.original.googleLinked && <Badge className="bg-creme text-cacau/70">Contacts</Badge>}</div>,
  },
]

function ClientsList() {
  const { get, set, page } = useListParams()
  const router = useRouter()
  const filter = ((get('source') as Filter | undefined) ?? 'all') as Filter
  const q = get('q')
  const query = useMemo(() => ({ q, source: filter === 'all' ? undefined : filter, page, limit: 20 }), [q, filter, page])
  const { data, isLoading, isFetching, error } = useClients(query)
  const [creating, setCreating] = useState(false)

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Toda a gente que encomendou ou que importaram dos Google Contacts. Um cliente por e-mail — as respostas e as encomendas juntam-se pela morada de e-mail."
        actions={<Button onClick={() => setCreating(true)}><UserPlus className="h-4 w-4" aria-hidden /> Novo cliente</Button>}
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs<Filter> items={[{ key: 'all', label: 'Todos' }, { key: 'order', label: 'Com encomenda' }, { key: 'google', label: 'Do Google' }, { key: 'manual', label: 'Manuais' }]} value={filter} onChange={(f) => set({ source: f === 'all' ? undefined : f, page: undefined })} />
        <SearchInput value={q} onChange={(v) => set({ q: v })} placeholder="Nome, e-mail ou telemóvel…" className="w-full sm:w-72" />
      </div>
      <DataTable
        columns={columns}
        data={data?.items}
        loading={isLoading}
        refreshing={isFetching && !isLoading}
        error={error ? apiErrorMessage(error) : null}
        pagination={data ? { page: data.page, limit: data.limit, total: data.total, onPageChange: (p) => set({ page: p }) } : undefined}
        emptyTitle="Sem clientes"
        emptyDescription={q ? 'Ninguém corresponde à pesquisa.' : 'O primeiro cliente aparece com a primeira encomenda.'}
        onRowClick={(c) => router.push(`/backoffice/clients/${c.id}`)}
      />
      <NewClientDialog open={creating} onClose={() => setCreating(false)} onCreated={(c) => router.push(`/backoffice/clients/${c.id}`)} />
    </>
  )
}

function NewClientDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (c: Client) => void }) {
  const toast = useToast()
  const { create } = useClientMutations()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const c = await create.mutateAsync({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined })
      toast.success('Cliente criado.')
      onCreated(c)
      onClose()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
  }
  return (
    <Modal open={open} onClose={onClose} title="Novo cliente" footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" form="new-client" loading={create.isPending} disabled={!name.trim() || !email.trim()}>Criar</Button></>}>
      <form id="new-client" onSubmit={submit} className="space-y-4">
        <Field label="Nome" htmlFor="nc-name"><Input id="nc-name" required autoFocus value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="E-mail" htmlFor="nc-email"><Input id="nc-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Telemóvel" htmlFor="nc-phone"><Input id="nc-phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
      </form>
    </Modal>
  )
}

export default function ClientsPage() {
  return <Suspense><ClientsList /></Suspense>
}
