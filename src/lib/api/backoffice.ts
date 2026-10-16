'use client'

import { apiFetch, qs } from './client'
import type {
  AdminCreateUserInput,
  AdminUserDeleteResult,
  AdminUserDetail,
  AdminUserListItem,
  AdminUserListQuery,
  AdminUserState,
  AdminUserUpdateInput,
  DashboardSummary,
  InviteResult,
  Page,
  User,
} from './types'

/** Typed wrappers over `/admin/*`, one per route. */
export const backofficeApi = {
  dashboard: () => apiFetch<DashboardSummary>('/admin/dashboard'),
  users: {
    list: (query: AdminUserListQuery = {}) => apiFetch<Page<AdminUserListItem>>(`/admin/users${qs(query)}`),
    get: (id: string) => apiFetch<AdminUserDetail>(`/admin/users/${id}`),
    create: (input: AdminCreateUserInput) => apiFetch<InviteResult>('/admin/users', { method: 'POST', body: input }),
    invite: (id: string, sendEmail = true) => apiFetch<InviteResult>(`/admin/users/${id}/invite${qs({ sendEmail })}`, { method: 'POST' }),
    update: (id: string, input: AdminUserUpdateInput) => apiFetch<User>(`/admin/users/${id}`, { method: 'PATCH', body: input }),
    disable: (id: string) => apiFetch<AdminUserState>(`/admin/users/${id}/disable`, { method: 'POST' }),
    enable: (id: string) => apiFetch<AdminUserState>(`/admin/users/${id}/enable`, { method: 'POST' }),
    remove: (id: string) => apiFetch<AdminUserDeleteResult>(`/admin/users/${id}`, { method: 'DELETE' }),
  },
}
