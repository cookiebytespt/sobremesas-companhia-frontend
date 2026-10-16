'use client'

/**
 * TanStack Query keys and hooks for the backoffice. Keys are hierarchical so a mutation can
 * invalidate a whole area (`keys.users.all`) or one record.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { backofficeApi } from '@/lib/api/backoffice'
import type { AdminCreateUserInput, AdminUserListQuery, AdminUserUpdateInput } from '@/lib/api/types'

export const keys = {
  dashboard: ['backoffice', 'dashboard'] as const,
  users: {
    all: ['backoffice', 'users'] as const,
    list: (query: AdminUserListQuery) => ['backoffice', 'users', 'list', query] as const,
    detail: (id: string) => ['backoffice', 'users', 'detail', id] as const,
  },
}

export function useDashboard() {
  return useQuery({ queryKey: keys.dashboard, queryFn: backofficeApi.dashboard, refetchInterval: 60_000 })
}

export function useUsers(query: AdminUserListQuery) {
  return useQuery({ queryKey: keys.users.list(query), queryFn: () => backofficeApi.users.list(query), placeholderData: (prev) => prev })
}

export function useUser(id: string) {
  return useQuery({ queryKey: keys.users.detail(id), queryFn: () => backofficeApi.users.get(id) })
}

function useInvalidateUsers() {
  const qc = useQueryClient()
  return (id?: string) => {
    void qc.invalidateQueries({ queryKey: keys.users.all })
    void qc.invalidateQueries({ queryKey: keys.dashboard })
    if (id) void qc.invalidateQueries({ queryKey: keys.users.detail(id) })
  }
}

export function useCreateUser() {
  const invalidate = useInvalidateUsers()
  return useMutation({ mutationFn: (input: AdminCreateUserInput) => backofficeApi.users.create(input), onSuccess: () => invalidate() })
}

export function useInviteUser(id: string) {
  const invalidate = useInvalidateUsers()
  return useMutation({ mutationFn: (sendEmail: boolean) => backofficeApi.users.invite(id, sendEmail), onSuccess: () => invalidate(id) })
}

export function useUpdateUser(id: string) {
  const invalidate = useInvalidateUsers()
  return useMutation({ mutationFn: (input: AdminUserUpdateInput) => backofficeApi.users.update(id, input), onSuccess: () => invalidate(id) })
}

export function useSetUserEnabled(id: string) {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: (enabled: boolean) => (enabled ? backofficeApi.users.enable(id) : backofficeApi.users.disable(id)),
    onSuccess: () => invalidate(id),
  })
}

export function useDeleteUser(id: string) {
  const invalidate = useInvalidateUsers()
  return useMutation({ mutationFn: () => backofficeApi.users.remove(id), onSuccess: () => invalidate() })
}
