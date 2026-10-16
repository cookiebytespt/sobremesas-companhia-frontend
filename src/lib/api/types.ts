/**
 * TypeScript mirrors of the API DTOs (`backend/Sources/App/DTOs`). Keep in sync.
 * Dates are ISO-8601 strings, ids UUIDs, money euros as numbers.
 */

export type Locale = 'pt' | 'en' | 'es' | 'fr'
export type UserRole = 'customer' | 'admin'

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

// MARK: Users

export interface User {
  id: string
  auth0Id: string
  email: string | null
  emailVerified: boolean
  name: string | null
  picture: string | null
  role: UserRole
  phone: string | null
  locale: Locale | null
  invitedAt: string | null
  inviteAcceptedAt: string | null
  disabledAt: string | null
  createdAt: string | null
}

export interface LoginResponse {
  user: User
  isNewUser: boolean
  linkedRequests: number
}

/** What `/api/auth/me` returns: the API user, with the Auth0 profile as fallback for name/email/picture. */
export interface MeResponse {
  user: User
  isNewUser: boolean
  linkedRequests: number
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
  clients: { total: number; newLast30Days: number }
  uploads: { unattached: number }
  generatedAt: string
}

export interface AdminUserListQuery {
  q?: string
  role?: UserRole
  state?: 'active' | 'disabled'
  page?: number
  limit?: number
}

export interface AdminUserListItem {
  id: string
  email: string | null
  name: string | null
  picture: string | null
  role: UserRole
  phone: string | null
  requestCount: number
  invitedAt: string | null
  inviteAcceptedAt: string | null
  disabledAt: string | null
  locale: Locale | null
  createdAt: string | null
}

export interface UserIdentity {
  id: string
  auth0Id: string
  provider: string
  label: string
  isPrimary: boolean
  createdAt: string | null
}

export interface AdminUserStats {
  requests: number
  contacts: number
  lastRequestAt: string | null
}

export interface AdminUserDetail {
  user: User
  stats: AdminUserStats
  identities: UserIdentity[]
  canDelete: boolean
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
  inviteUrl: string
  expiresInSeconds: number
  emailSent: boolean
  emailError: string | null
}

export interface AdminUserUpdateInput {
  name?: string
  phone?: string
  role?: UserRole
}

export interface AdminUserState {
  user: User
  auth0Error: string | null
}

export interface AdminUserDeleteResult {
  deleted: boolean
  auth0Deleted: boolean
  auth0Error: string | null
}
