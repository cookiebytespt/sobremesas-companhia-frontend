/**
 * TypeScript mirrors of the API DTOs (`backend/Sources/App/DTOs`). Keep in sync.
 * Dates are ISO-8601 strings, ids UUIDs, money euros as numbers.
 */

export type Locale = 'pt' | 'en' | 'es' | 'fr'
export type UserRole = 'admin'

export interface ApiErrorBody {
  error: true
  code: string
  reason: string
}

export interface Page<T> {
  items: T[]
  page: number
  limit: number
  total: number
}

export interface MessageResponse {
  message: string
}

// MARK: Users & auth

export interface User {
  id: string
  email: string
  name: string | null
  picture: string | null
  role: UserRole
  phone: string | null
  locale: Locale | null
  /** A Google account is bound to this user (set on the first Google sign-in). */
  googleLinked: boolean
  invitedAt: string | null
  inviteAcceptedAt: string | null
  disabledAt: string | null
  lastSeenAt: string | null
  createdAt: string | null
}

/** What the API returns on sign-in and refresh; the BFF keeps the tokens in httpOnly cookies and only hands `user` to the browser. */
export interface AuthTokens {
  accessToken: string
  expiresIn: number
  refreshToken: string
  refreshExpiresAt: string
  user: User
}

/** What `/api/auth/google` and `/api/auth/email/verify` answer the browser with. */
export interface SignInResponse {
  user: User
}

export interface SessionInfo {
  id: string
  userAgent: string | null
  ip: string | null
  createdAt: string | null
  lastUsedAt: string | null
  expiresAt: string
  current: boolean
}

export interface UpdateProfileInput {
  name?: string
  phone?: string
  locale?: Locale
}

// MARK: Uploads

export type UploadKind = 'request' | 'message' | 'gallery' | 'item'

export interface Upload {
  id: string
  kind: UploadKind
  url: string
  filename: string
  contentType: string
  size: number
  width: number | null
  height: number | null
  createdAt: string | null
}

// MARK: Backoffice

export interface DashboardSummary {
  orders: { byStatus: Record<string, number>; new: number; unreadMessages: number; upcomingEvents7Days: number; depositsDue: number }
  clients: { total: number }
  contacts: { unhandled: number }
  email: { pending: number; googleConnected: boolean }
  team: { active: number; invitedPending: number }
  uploads: { unattached: number }
  gallery: { published: number; unpublished: number }
  offering: { services: number; items: number }
  generatedAt: string
}

export interface AdminUserListQuery {
  q?: string
  role?: UserRole
  state?: 'active' | 'disabled' | 'invited'
  page?: number
  limit?: number
}

export interface AdminUserListItem {
  id: string
  email: string
  name: string | null
  picture: string | null
  role: UserRole
  phone: string | null
  googleLinked: boolean
  invitedAt: string | null
  inviteAcceptedAt: string | null
  disabledAt: string | null
  lastSeenAt: string | null
  createdAt: string | null
}

export interface AdminUserDetail {
  user: User
  /** Live sessions (devices) of this account. */
  sessions: SessionInfo[]
}

export interface AdminCreateUserInput {
  email: string
  name?: string
  role?: UserRole
  phone?: string
  sendEmail?: boolean
}

export interface InviteResult {
  user: User
  /** The login page with the e-mail pre-filled; share it directly if the e-mail did not arrive. */
  loginUrl: string
  emailSent: boolean
  emailError: string | null
}

export interface AdminUserUpdateInput {
  name?: string
  phone?: string
  role?: UserRole
}

// MARK: Offering & gallery

/** Text in every platform language; Portuguese required, others fall back to it. */
export interface LocalizedString {
  pt: string
  en?: string | null
  es?: string | null
  fr?: string | null
}

export type GalleryPlacement = 'gallery' | 'hero'
export type ItemTag = 'sem_gluten' | 'sem_lactose' | 'sem_acucar' | 'vegetariano' | 'vegan' | 'contem_frutos_secos' | 'contem_alcool'
export const itemTags: ItemTag[] = ['sem_gluten', 'sem_lactose', 'sem_acucar', 'vegetariano', 'vegan', 'contem_frutos_secos', 'contem_alcool']

// Public shapes (one language)
export interface Occasion { id: string; slug: string; name: string; description: string | null; icon: string | null; shownInForm: boolean; photoCount: number }
export interface OfferItem { id: string; name: string; description: string | null; photoUrl: string | null; tags: ItemTag[] }
export interface Service { id: string; slug: string; name: string; description: string | null; icon: string | null; allowQuantities: boolean; quantityUnit: string | null; minNoticeHours: number | null; items: OfferItem[] }
export interface GalleryPhoto { id: string; url: string; width: number | null; height: number | null; caption: string; occasion: string; placement: GalleryPlacement; tall: boolean; featured: boolean }

// Admin shapes (every language, every field)
export interface AdminOccasion {
  id: string; slug: string; name: LocalizedString; description: LocalizedString | null; icon: string | null
  sortOrder: number; active: boolean; shownInForm: boolean; photoCount: number; createdAt: string | null
}
export interface OccasionInput {
  slug?: string; name?: LocalizedString; description?: LocalizedString | null; icon?: string | null; active?: boolean; shownInForm?: boolean
}
export interface AdminService {
  id: string; slug: string; name: LocalizedString; description: LocalizedString | null; icon: string | null
  sortOrder: number; active: boolean; shownInForm: boolean
  minNoticeHours: number | null; defaultProductionHours: number | null; defaultStartOffsetHours: number
  allowQuantities: boolean; quantityUnit: 'pessoas' | 'unidades' | null
  itemCount: number; items?: AdminOfferItem[] | null; createdAt: string | null
}
export interface ServiceInput {
  slug?: string; name?: LocalizedString; description?: LocalizedString | null; icon?: string | null; active?: boolean; shownInForm?: boolean
  minNoticeHours?: number | null; defaultProductionHours?: number | null; defaultStartOffsetHours?: number
  allowQuantities?: boolean; quantityUnit?: 'pessoas' | 'unidades' | null
}
export interface AdminOfferItem {
  id: string; serviceId: string; name: LocalizedString; description: LocalizedString | null; photo: Upload | null
  sortOrder: number; active: boolean; shownInForm: boolean
  productionHours: number | null; startOffsetHours: number | null; referencePrice: number | null
  tags: ItemTag[]; suggestedPerPerson: number | null; createdAt: string | null
}
export interface OfferItemInput {
  name?: LocalizedString; description?: LocalizedString | null; photoUploadId?: string | null; active?: boolean; shownInForm?: boolean
  productionHours?: number | null; startOffsetHours?: number | null; referencePrice?: number | null; tags?: ItemTag[]; suggestedPerPerson?: number | null
}
export interface AdminGalleryPhoto {
  id: string; upload: Upload; occasionId: string; caption: LocalizedString; placement: GalleryPlacement
  tall: boolean; featured: boolean; sortOrder: number; published: boolean; takenAt: string | null; createdAt: string | null
}
export interface GalleryPhotoInput {
  uploadId?: string; occasionId?: string; caption?: LocalizedString; placement?: GalleryPlacement
  tall?: boolean; featured?: boolean; published?: boolean; takenAt?: string | null
}
export interface AdminGalleryQuery { occasion?: string; placement?: GalleryPlacement; published?: boolean }

// MARK: Orders (public form)

export type DeliveryMode = 'delivery' | 'pickup' | 'on_site'

export interface OrderItemInput {
  serviceId: string
  offerItemId?: string
  label?: string
  quantity?: number
  notes?: string
}

export interface PublicOrderInput {
  name: string
  /** At least one of email / phone. Phone-only orders are tracked the same, without automatic e-mails. */
  email?: string
  phone?: string
  occasionId?: string
  occasionOther?: string
  eventDate?: string
  eventTime?: string
  guests?: number
  message?: string
  items?: OrderItemInput[]
  deliveryMode?: DeliveryMode
  addressLine1?: string
  addressLine2?: string
  postalCode?: string
  city?: string
  addressNotes?: string
  allergies?: string[]
  dietaryNotes?: string
  uploadIds?: string[]
  /** Honeypot — left empty by people. */
  website?: string
}

export interface PublicOrderCreated {
  number: string
  email: string | null
  phone: string | null
}

export interface ContactInput {
  name: string
  email: string
  phone?: string
  message: string
  website?: string
}

/** The EU 14 allergens, as the API seeds `allergies.list` (phase 5 makes it editable). */
export const ALLERGENS = ['glúten', 'crustáceos', 'ovos', 'peixe', 'amendoins', 'soja', 'leite', 'frutos de casca rija', 'aipo', 'mostarda', 'sésamo', 'sulfitos', 'tremoço', 'moluscos'] as const

// MARK: Backoffice — orders, clients, contacts, Google

export type OrderStatus = 'new' | 'reviewing' | 'proposal_sent' | 'confirmed' | 'completed' | 'declined' | 'cancelled'
export type PaymentStatus = 'pending' | 'deposit_paid' | 'paid'
export type OrderSource = 'web' | 'whatsapp' | 'instagram' | 'phone' | 'in_person'
export type MessageDirection = 'in' | 'out'
export type MessageChannel = 'platform' | 'gmail' | 'system'

export interface Client {
  id: string
  name: string
  /** Null for phone-only clients. */
  email: string | null
  phone: string | null
  locale: Locale
  notes: string | null
  source: string
  googleLinked: boolean
  lastOrderAt: string | null
  orderCount: number | null
  createdAt: string | null
}

export interface ClientDetail { client: Client; orders: OrderListItem[] }
export interface ClientListQuery { q?: string; source?: string; page?: number; limit?: number }
export interface ClientInput { name?: string; email?: string; phone?: string; locale?: Locale; notes?: string }

export interface OrderItem {
  id: string
  serviceId: string
  serviceName: string
  offerItemId: string | null
  label: string
  quantity: number | null
  notes: string | null
  position: number
}

export interface OrderAttachment { id: string; upload: Upload; addedBy: 'client' | 'admin'; caption: string | null; position: number }

export interface OrderEvent {
  id: string
  from: OrderStatus | null
  to: OrderStatus
  actorUserId: string | null
  actorName: string | null
  note: string | null
  createdAt: string | null
}

export interface OrderMessage {
  id: string
  direction: MessageDirection
  channel: MessageChannel
  internal: boolean
  template: string | null
  authorName: string | null
  subject: string | null
  bodyText: string
  fromEmail: string
  toEmails: string[]
  sentAt: string | null
  receivedAt: string | null
  sendError: string | null
  pending: boolean
  attachments: Upload[]
  createdAt: string | null
}

export interface OrderListItem {
  id: string
  number: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  clientId: string
  clientName: string
  clientEmail: string | null
  clientPhone: string | null
  occasionName: string | null
  eventDate: string | null
  eventTime: string | null
  guests: number | null
  itemCount: number
  proposalAmount: number | null
  unread: boolean
  lastMessageAt: string | null
  source: OrderSource
  createdAt: string | null
}

export interface Order {
  id: string
  number: string
  status: OrderStatus
  allowedTransitions: OrderStatus[]
  client: Client
  contactName: string
  contactEmail: string | null
  contactPhone: string | null
  occasionId: string | null
  occasionName: string | null
  occasionOther: string | null
  eventDate: string | null
  eventTime: string | null
  guests: number | null
  message: string
  locale: Locale
  source: OrderSource
  internalNotes: string | null
  deliveryMode: DeliveryMode | null
  addressLine1: string | null
  addressLine2: string | null
  postalCode: string | null
  city: string | null
  addressNotes: string | null
  allergies: string[]
  dietaryNotes: string | null
  proposalAmount: number | null
  proposalText: string | null
  proposalValidUntil: string | null
  proposalSentAt: string | null
  proposalAcceptedAt: string | null
  depositAmount: number | null
  depositDueOn: string | null
  depositPaidAt: string | null
  depositMethod: string | null
  paymentStatus: PaymentStatus
  paidAt: string | null
  availabilityFlags: string[]
  gmailThreadId: string | null
  unread: boolean
  lastClientMessageAt: string | null
  lastAdminMessageAt: string | null
  items: OrderItem[]
  attachments: OrderAttachment[]
  events: OrderEvent[]
  createdAt: string | null
  updatedAt: string | null
}

export interface AdminOrderListQuery {
  status?: string
  q?: string
  client?: string
  occasion?: string
  service?: string
  from?: string
  to?: string
  unread?: boolean
  payment?: PaymentStatus
  page?: number
  limit?: number
}

export interface AdminCreateOrderInput {
  clientId?: string
  name?: string
  email?: string
  phone?: string
  source?: OrderSource
  locale?: Locale
  occasionId?: string
  occasionOther?: string
  eventDate?: string
  eventTime?: string
  guests?: number
  message?: string
  items?: OrderItemInput[]
  deliveryMode?: DeliveryMode
  addressLine1?: string
  addressLine2?: string
  postalCode?: string
  city?: string
  addressNotes?: string
  allergies?: string[]
  dietaryNotes?: string
  internalNotes?: string
  notifyClient?: boolean
}

/** PATCH body: omitted = keep, null = clear. */
export interface AdminOrderUpdateInput {
  occasionId?: string | null
  occasionOther?: string | null
  eventDate?: string | null
  eventTime?: string | null
  guests?: number | null
  internalNotes?: string | null
  source?: OrderSource
  deliveryMode?: DeliveryMode | null
  addressLine1?: string | null
  addressLine2?: string | null
  postalCode?: string | null
  city?: string | null
  addressNotes?: string | null
  allergies?: string[]
  dietaryNotes?: string | null
  contactName?: string
  contactPhone?: string
  notifyClient?: boolean
}

export interface TransitionInput { to: OrderStatus; note?: string; notifyClient?: boolean }
export interface ProposalInput { amount?: number; text?: string; validUntil?: string; depositAmount?: number; depositDueOn?: string; send?: boolean }
export interface PaymentInput { depositAmount?: number | null; depositDueOn?: string | null; depositPaidAt?: string | null; depositMethod?: string | null; paymentStatus?: PaymentStatus; paidAt?: string | null; notifyClient?: boolean }
export interface NewMessageInput { body: string; internal?: boolean; uploadIds?: string[] }

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  locale: Locale
  handledAt: string | null
  handledBy: string | null
  convertedOrderId: string | null
  createdAt: string | null
}

export interface GoogleStatus {
  configured: boolean
  connected: boolean
  accountEmail: string | null
  scopes: string[]
  connectedAt: string | null
  connectedByName: string | null
  gmailLabelName: string | null
  calendarId: string | null
  pushContacts: boolean | null
  gmailLastSyncAt: string | null
  contactsLastSyncAt: string | null
  lastError: string | null
  pendingEmails: number
  failedEmails: number
}

export interface GoogleSettingsInput { calendarId?: string; pushContacts?: boolean; gmailLabelName?: string }
