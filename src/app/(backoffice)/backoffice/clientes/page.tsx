'use client'

import { Suspense, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ColumnDef } from '@tanstack/react-table'
import { UserPlus } from 'lucide-react'
import DataTable from '@/components/backoffice/DataTable'
import InviteUserDialog from '@/components/backoffice/InviteUserDialog'
import PageHeader from '@/components/backoffice/PageHeader'
import SearchInput from '@/components/backoffice/SearchInput'
import Tabs from '@/components/backoffice/Tabs'
import { Avatar, DisabledBadge, InviteBadge, RoleBadge } from '@/components/backoffice/UserBits'
import { Button } from '@/components/ui/button'
import { apiErrorMessage } from '@/lib/api/errors'
import type { AdminUserListItem, UserRole } from '@/lib/api/types'
import { useUsers } from '@/lib/backoffice/queries'
import { useListParams } from '@/lib/backoffice/useListParams'
import { formatDate } from '@/lib/labels'

export const dynamic = 'force-dynamic'

const LIMIT = 20
type Filter = 'todos' | UserRole | 'desativados'

const columns: ColumnDef<AdminUserListItem, unknown>[] = [
  {
    id: 'user',
    header: 'Cliente',
    cell: ({ row }) => {
      const u = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} email={u.email} picture={u.picture} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-cacau">{u.name ?? u.email ?? '—'}</p>
            {u.name && <p className="truncate text-xs text-cacau/50">{u.email}</p>}
          </div>
        </div>
      )
    },
  },
  { id: 'phone', header: 'Telemóvel', cell: ({ row }) => <span className="text-cacau/80">{row.original.phone ?? '—'}</span> },
  {
    id: 'state',
    header: 'Estado',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        <RoleBadge role={row.original.role} />
        {row.original.invitedAt && !row.original.inviteAcceptedAt && <InviteBadge />}
        {row.original.disabledAt && <DisabledBadge />}
      </div>
    ),
  },
  { id: 'requests', header: 'Pedidos', size: 90, cell: ({ row }) => <span className="tabular-nums">{row.original.requestCount}</span> },
  { id: 'created', header: 'Desde', size: 110, cell: ({ row }) => <span className="text-cacau/60">{formatDate(row.original.createdAt)}</span> },
]

function ClientsList() {
  const { get, set, page } = useListParams()
  const router = useRouter()
  const role = (get('role') as UserRole | undefined) ?? undefined
  const state = get('estado') === 'desativados' ? ('disabled' as const) : undefined
  const q = get('q')
  const query = useMemo(() => ({ q, role, state, page, limit: LIMIT }), [q, role, state, page])
  const { data, isLoading, isFetching, error } = useUsers(query)
  const [inviting, setInviting] = useState(false)

  const filter: Filter = state ? 'desativados' : (role ?? 'todos')
  const setFilter = (f: Filter) => {
    if (f === 'todos') set({ role: undefined, estado: undefined })
    else if (f === 'desativados') set({ role: undefined, estado: 'desativados' })
    else set({ role: f, estado: undefined })
  }

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Quem tem conta na plataforma. Convide quem pediu por WhatsApp para acompanhar os pedidos aqui."
        actions={
          <Button onClick={() => setInviting(true)}>
            <UserPlus className="h-4 w-4" aria-hidden /> Convidar cliente
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs<Filter>
          items={[
            { key: 'todos', label: 'Todos' },
            { key: 'customer', label: 'Clientes' },
            { key: 'admin', label: 'Equipa' },
            { key: 'desativados', label: 'Desativados' },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <SearchInput value={q} onChange={(v) => set({ q: v })} placeholder="Nome, email ou telemóvel…" className="w-full sm:w-72" />
      </div>
      <DataTable
        columns={columns}
        data={data?.items}
        loading={isLoading}
        refreshing={isFetching && !isLoading}
        error={error ? apiErrorMessage(error) : null}
        pagination={data ? { page: data.page, limit: data.limit, total: data.total, onPageChange: (p) => set({ page: p }) } : undefined}
        emptyTitle="Sem clientes"
        emptyDescription={q ? 'Nenhum cliente corresponde à pesquisa.' : 'Convide o primeiro cliente ou aguarde o primeiro registo.'}
        onRowClick={(u) => router.push(`/backoffice/clientes/${u.id}`)}
        rowClassName={(u) => (u.disabledAt ? 'opacity-60' : undefined)}
      />
      <InviteUserDialog open={inviting} onClose={() => setInviting(false)} />
    </>
  )
}

export default function ClientsPage() {
  return (
    <Suspense>
      <ClientsList />
    </Suspense>
  )
}
