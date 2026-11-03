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
import { Avatar, DisabledBadge, GoogleBadge, InviteBadge } from '@/components/backoffice/UserBits'
import { Button } from '@/components/ui/button'
import { apiErrorMessage } from '@/lib/api/errors'
import type { AdminUserListItem, AdminUserListQuery } from '@/lib/api/types'
import { useUsers } from '@/lib/backoffice/queries'
import { useListParams } from '@/lib/backoffice/useListParams'
import { formatDate } from '@/lib/labels'

export const dynamic = 'force-dynamic'

const LIMIT = 20
type Filter = 'all' | 'active' | 'invited' | 'disabled'
const filterToState: Record<Filter, AdminUserListQuery['state']> = { all: undefined, active: 'active', invited: 'invited', disabled: 'disabled' }

const columns: ColumnDef<AdminUserListItem, unknown>[] = [
  {
    id: 'user',
    header: 'Pessoa',
    cell: ({ row }) => {
      const u = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar name={u.name} email={u.email} picture={u.picture} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-cacau">{u.name ?? u.email}</p>
            {u.name && <p className="truncate text-xs text-cacau/50">{u.email}</p>}
          </div>
        </div>
      )
    },
  },
  { id: 'phone', header: 'Telemóvel', cell: ({ row }) => <span className="text-cacau/80">{row.original.phone ?? '—'}</span> },
  {
    id: 'state',
    header: 'Acesso',
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.googleLinked && <GoogleBadge />}
        {row.original.invitedAt && !row.original.inviteAcceptedAt && <InviteBadge />}
        {row.original.disabledAt && <DisabledBadge />}
      </div>
    ),
  },
  { id: 'seen', header: 'Última sessão', size: 130, cell: ({ row }) => <span className="text-cacau/60">{row.original.lastSeenAt ? formatDate(row.original.lastSeenAt) : '—'}</span> },
  { id: 'created', header: 'Desde', size: 110, cell: ({ row }) => <span className="text-cacau/60">{formatDate(row.original.createdAt)}</span> },
]

function TeamList() {
  const { get, set, page } = useListParams()
  const router = useRouter()
  const filter = ((get('state') as Filter | undefined) ?? 'all') as Filter
  const q = get('q')
  const query = useMemo(() => ({ q, state: filterToState[filter], page, limit: LIMIT }), [q, filter, page])
  const { data, isLoading, isFetching, error } = useUsers(query)
  const [inviting, setInviting] = useState(false)

  return (
    <>
      <PageHeader
        title="Equipa"
        description="Quem entra no backoffice. Cada pessoa entra com a conta Google do seu e-mail ou com um código enviado por e-mail."
        actions={
          <Button onClick={() => setInviting(true)}>
            <UserPlus className="h-4 w-4" aria-hidden /> Convidar
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs<Filter>
          items={[
            { key: 'all', label: 'Todos' },
            { key: 'active', label: 'Ativos' },
            { key: 'invited', label: 'Convite pendente' },
            { key: 'disabled', label: 'Desativados' },
          ]}
          value={filter}
          onChange={(f) => set({ state: f === 'all' ? undefined : f })}
        />
        <SearchInput value={q} onChange={(v) => set({ q: v })} placeholder="Nome, e-mail ou telemóvel…" className="w-full sm:w-72" />
      </div>
      <DataTable
        columns={columns}
        data={data?.items}
        loading={isLoading}
        refreshing={isFetching && !isLoading}
        error={error ? apiErrorMessage(error) : null}
        pagination={data ? { page: data.page, limit: data.limit, total: data.total, onPageChange: (p) => set({ page: p }) } : undefined}
        emptyTitle="Sem resultados"
        emptyDescription={q ? 'Ninguém corresponde à pesquisa.' : 'Convide a primeira pessoa da equipa.'}
        onRowClick={(u) => router.push(`/backoffice/team/${u.id}`)}
        rowClassName={(u) => (u.disabledAt ? 'opacity-60' : undefined)}
      />
      <InviteUserDialog open={inviting} onClose={() => setInviting(false)} />
    </>
  )
}

export default function TeamPage() {
  return (
    <Suspense>
      <TeamList />
    </Suspense>
  )
}
