'use client'

/**
 * TanStack Query keys and hooks for the backoffice. Keys are hierarchical so a mutation can
 * invalidate a whole area (`keys.users.all`) or one record.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { backofficeApi } from '@/lib/api/backoffice'
import type { AgendaQuery, AdminCreateOrderInput, AdminCreateUserInput, AdminGalleryQuery, AdminOrderListQuery, AdminOrderUpdateInput, AdminUserListQuery, AdminUserUpdateInput, ClientInput, ClientListQuery, GalleryPhotoInput, GoogleSettingsInput, NewMessageInput, OccasionInput, OfferItemInput, OrderItemInput, PaymentInput, ProposalInput, ServiceInput, TransitionInput } from '@/lib/api/types'

export const keys = {
  dashboard: ['backoffice', 'dashboard'] as const,
  occasions: ['backoffice', 'occasions'] as const,
  services: {
    all: ['backoffice', 'services'] as const,
    detail: (id: string) => ['backoffice', 'services', 'detail', id] as const,
  },
  gallery: {
    all: ['backoffice', 'gallery'] as const,
    list: (query: AdminGalleryQuery) => ['backoffice', 'gallery', 'list', query] as const,
  },
  users: {
    all: ['backoffice', 'users'] as const,
    list: (query: AdminUserListQuery) => ['backoffice', 'users', 'list', query] as const,
    detail: (id: string) => ['backoffice', 'users', 'detail', id] as const,
  },
  orders: {
    all: ['backoffice', 'orders'] as const,
    list: (query: AdminOrderListQuery) => ['backoffice', 'orders', 'list', query] as const,
    detail: (id: string) => ['backoffice', 'orders', 'detail', id] as const,
    messages: (id: string) => ['backoffice', 'orders', 'messages', id] as const,
  },
  clients: {
    all: ['backoffice', 'clients'] as const,
    list: (query: ClientListQuery) => ['backoffice', 'clients', 'list', query] as const,
    detail: (id: string) => ['backoffice', 'clients', 'detail', id] as const,
  },
  contacts: {
    all: ['backoffice', 'contacts'] as const,
    list: (query: { handled?: boolean; page?: number }) => ['backoffice', 'contacts', 'list', query] as const,
  },
  google: ['backoffice', 'google'] as const,
  googleCalendars: ['backoffice', 'google', 'calendars'] as const,
  agenda: (query: AgendaQuery) => ['backoffice', 'agenda', query] as const,
}

export function useAgenda(query: AgendaQuery) {
  return useQuery({ queryKey: keys.agenda(query), queryFn: () => backofficeApi.agenda(query), placeholderData: (prev) => prev, refetchInterval: 120_000 })
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

// MARK: Offering

function useInvalidate(...queryKeys: readonly (readonly unknown[])[]) {
  const qc = useQueryClient()
  return () => {
    for (const key of queryKeys) void qc.invalidateQueries({ queryKey: key })
    void qc.invalidateQueries({ queryKey: keys.dashboard })
  }
}

export function useOccasions() {
  return useQuery({ queryKey: keys.occasions, queryFn: backofficeApi.occasions.list })
}
export function useOccasionMutations() {
  const invalidate = useInvalidate(keys.occasions, keys.gallery.all)
  return {
    create: useMutation({ mutationFn: (input: OccasionInput) => backofficeApi.occasions.create(input), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, input }: { id: string; input: OccasionInput }) => backofficeApi.occasions.update(id, input), onSuccess: invalidate }),
    order: useMutation({ mutationFn: (ids: string[]) => backofficeApi.occasions.order(ids), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => backofficeApi.occasions.remove(id), onSuccess: invalidate }),
  }
}

export function useServices() {
  return useQuery({ queryKey: keys.services.all, queryFn: backofficeApi.services.list })
}
export function useService(id: string) {
  return useQuery({ queryKey: keys.services.detail(id), queryFn: () => backofficeApi.services.get(id) })
}
export function useServiceMutations(id?: string) {
  const invalidate = useInvalidate(keys.services.all, ...(id ? [keys.services.detail(id)] : []))
  return {
    create: useMutation({ mutationFn: (input: ServiceInput) => backofficeApi.services.create(input), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, input }: { id: string; input: ServiceInput }) => backofficeApi.services.update(id, input), onSuccess: invalidate }),
    order: useMutation({ mutationFn: (ids: string[]) => backofficeApi.services.order(ids), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => backofficeApi.services.remove(id), onSuccess: invalidate }),
    createItem: useMutation({ mutationFn: ({ serviceId, input }: { serviceId: string; input: OfferItemInput }) => backofficeApi.services.createItem(serviceId, input), onSuccess: invalidate }),
    updateItem: useMutation({ mutationFn: ({ id, input }: { id: string; input: OfferItemInput }) => backofficeApi.items.update(id, input), onSuccess: invalidate }),
    orderItems: useMutation({ mutationFn: ({ serviceId, ids }: { serviceId: string; ids: string[] }) => backofficeApi.services.orderItems(serviceId, ids), onSuccess: invalidate }),
    removeItem: useMutation({ mutationFn: (id: string) => backofficeApi.items.remove(id), onSuccess: invalidate }),
  }
}

export function useGallery(query: AdminGalleryQuery) {
  return useQuery({ queryKey: keys.gallery.list(query), queryFn: () => backofficeApi.gallery.list(query), placeholderData: (prev) => prev })
}
export function useGalleryMutations() {
  const invalidate = useInvalidate(keys.gallery.all, keys.occasions)
  return {
    createBulk: useMutation({ mutationFn: (photos: GalleryPhotoInput[]) => backofficeApi.gallery.createBulk(photos), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, input }: { id: string; input: GalleryPhotoInput }) => backofficeApi.gallery.update(id, input), onSuccess: invalidate }),
    order: useMutation({ mutationFn: (ids: string[]) => backofficeApi.gallery.order(ids), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: (id: string) => backofficeApi.gallery.remove(id), onSuccess: invalidate }),
  }
}

// MARK: Orders

export function useOrders(query: AdminOrderListQuery) {
  return useQuery({ queryKey: keys.orders.list(query), queryFn: () => backofficeApi.orders.list(query), placeholderData: (prev) => prev, refetchInterval: 60_000 })
}

export function useOrder(id: string) {
  return useQuery({ queryKey: keys.orders.detail(id), queryFn: () => backofficeApi.orders.get(id) })
}

/** The conversation; polls while the tab is open so replies synced from Gmail show up. */
export function useOrderMessages(id: string, enabled = true) {
  return useQuery({ queryKey: keys.orders.messages(id), queryFn: () => backofficeApi.orders.messages(id), enabled, refetchInterval: 15_000 })
}

function useInvalidateOrders() {
  const qc = useQueryClient()
  return (id?: string) => {
    void qc.invalidateQueries({ queryKey: keys.orders.all })
    void qc.invalidateQueries({ queryKey: keys.dashboard })
    void qc.invalidateQueries({ queryKey: keys.clients.all })
    if (id) void qc.invalidateQueries({ queryKey: keys.orders.detail(id) })
  }
}

export function useOrderMutations(id: string) {
  const invalidate = useInvalidateOrders()
  const qc = useQueryClient()
  const done = () => invalidate(id)
  return {
    update: useMutation({ mutationFn: (input: AdminOrderUpdateInput) => backofficeApi.orders.update(id, input), onSuccess: done }),
    transition: useMutation({ mutationFn: (input: TransitionInput) => backofficeApi.orders.transition(id, input), onSuccess: () => { done(); void qc.invalidateQueries({ queryKey: keys.orders.messages(id) }) } }),
    proposal: useMutation({ mutationFn: (input: ProposalInput) => backofficeApi.orders.proposal(id, input), onSuccess: () => { done(); void qc.invalidateQueries({ queryKey: keys.orders.messages(id) }) } }),
    items: useMutation({ mutationFn: (v: { items: OrderItemInput[]; notifyClient?: boolean }) => backofficeApi.orders.items(id, v.items, v.notifyClient), onSuccess: done }),
    payment: useMutation({ mutationFn: (input: PaymentInput) => backofficeApi.orders.payment(id, input), onSuccess: () => { done(); void qc.invalidateQueries({ queryKey: keys.orders.messages(id) }) } }),
    sendMessage: useMutation({ mutationFn: (input: NewMessageInput) => backofficeApi.orders.sendMessage(id, input), onSuccess: () => { void qc.invalidateQueries({ queryKey: keys.orders.messages(id) }); done() } }),
    addAttachments: useMutation({ mutationFn: (uploadIds: string[]) => backofficeApi.orders.addAttachments(id, uploadIds), onSuccess: done }),
    removeAttachment: useMutation({ mutationFn: (attachmentId: string) => backofficeApi.orders.removeAttachment(id, attachmentId), onSuccess: done }),
  }
}

export function useCreateOrder() {
  const invalidate = useInvalidateOrders()
  return useMutation({ mutationFn: (input: AdminCreateOrderInput) => backofficeApi.orders.create(input), onSuccess: () => invalidate() })
}

// MARK: Clients

export function useClients(query: ClientListQuery) {
  return useQuery({ queryKey: keys.clients.list(query), queryFn: () => backofficeApi.clients.list(query), placeholderData: (prev) => prev })
}

export function useClient(id: string) {
  return useQuery({ queryKey: keys.clients.detail(id), queryFn: () => backofficeApi.clients.get(id) })
}

export function useClientMutations(id?: string) {
  const qc = useQueryClient()
  const done = () => {
    void qc.invalidateQueries({ queryKey: keys.clients.all })
    void qc.invalidateQueries({ queryKey: keys.orders.all })
    if (id) void qc.invalidateQueries({ queryKey: keys.clients.detail(id) })
  }
  return {
    create: useMutation({ mutationFn: (input: ClientInput) => backofficeApi.clients.create(input), onSuccess: done }),
    update: useMutation({ mutationFn: (input: ClientInput) => backofficeApi.clients.update(id!, input), onSuccess: done }),
    merge: useMutation({ mutationFn: (v: { keepId: string; mergeId: string }) => backofficeApi.clients.merge(v.keepId, v.mergeId), onSuccess: done }),
    remove: useMutation({ mutationFn: () => backofficeApi.clients.remove(id!), onSuccess: done }),
    pushToGoogle: useMutation({ mutationFn: () => backofficeApi.clients.pushToGoogle(id!), onSuccess: done }),
    unlinkGoogle: useMutation({ mutationFn: () => backofficeApi.clients.unlinkGoogle(id!), onSuccess: done }),
  }
}

// MARK: Contacts

export function useContacts(query: { handled?: boolean; page?: number }) {
  return useQuery({ queryKey: keys.contacts.list(query), queryFn: () => backofficeApi.contacts.list({ ...query, limit: 20 }), placeholderData: (prev) => prev })
}

export function useContactMutations() {
  const qc = useQueryClient()
  const done = () => { void qc.invalidateQueries({ queryKey: keys.contacts.all }); void qc.invalidateQueries({ queryKey: keys.dashboard }); void qc.invalidateQueries({ queryKey: keys.orders.all }) }
  return {
    setHandled: useMutation({ mutationFn: (v: { id: string; handled: boolean }) => backofficeApi.contacts.setHandled(v.id, v.handled), onSuccess: done }),
    convert: useMutation({ mutationFn: (id: string) => backofficeApi.contacts.convert(id), onSuccess: done }),
    remove: useMutation({ mutationFn: (id: string) => backofficeApi.contacts.remove(id), onSuccess: done }),
  }
}

// MARK: Google

export function useGoogleStatus() {
  return useQuery({ queryKey: keys.google, queryFn: backofficeApi.google.status, refetchInterval: 30_000 })
}

export function useGoogleMutations() {
  const qc = useQueryClient()
  const done = () => { void qc.invalidateQueries({ queryKey: keys.google }); void qc.invalidateQueries({ queryKey: keys.dashboard }) }
  return {
    disconnect: useMutation({ mutationFn: backofficeApi.google.disconnect, onSuccess: done }),
    settings: useMutation({ mutationFn: (input: GoogleSettingsInput) => backofficeApi.google.settings(input), onSuccess: done }),
    retryEmails: useMutation({ mutationFn: backofficeApi.google.retryEmails, onSuccess: done }),
    resyncCalendar: useMutation({ mutationFn: backofficeApi.google.resyncCalendar, onSuccess: () => { done(); void qc.invalidateQueries({ queryKey: ['backoffice', 'agenda'] }) } }),
  }
}

export function useGoogleCalendars(enabled: boolean) {
  return useQuery({ queryKey: keys.googleCalendars, queryFn: backofficeApi.google.calendars, enabled, staleTime: 5 * 60_000 })
}
