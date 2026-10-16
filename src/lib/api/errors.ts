import type { ApiErrorBody } from './types'
import { documentLocale, type Locale } from '@/lib/locale'

/**
 * Thrown by both the server and browser API helpers when the Vapor API answers
 * with a non-2xx status. `code` is the stable machine-readable code from the API
 * (e.g. `auth.unauthorized`, `cart.item_not_found`, `validation.failed`).
 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly reason: string

  constructor(status: number, code: string, reason: string) {
    super(`${status} ${code}: ${reason}`)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.reason = reason
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    let body: Partial<ApiErrorBody> | undefined
    try {
      body = (await res.json()) as Partial<ApiErrorBody>
    } catch {
      // non-JSON body (e.g. HTML from a proxy) — fall through to defaults
    }
    return new ApiError(
      res.status,
      body?.code ?? defaultCode(res.status),
      body?.reason ?? res.statusText ?? ''
    )
  }

  get isUnauthorized() {
    return this.status === 401
  }
  get isNotFound() {
    return this.status === 404
  }
  get isValidation() {
    return this.status === 400 || this.status === 422
  }
}

function defaultCode(status: number): string {
  switch (status) {
    case 400: return 'validation.failed'
    case 401: return 'auth.unauthorized'
    case 403: return 'auth.forbidden'
    case 404: return 'not_found'
    case 409: return 'conflict'
    case 502:
    case 503:
    case 504: return 'upstream.unavailable'
    default: return status >= 500 ? 'internal.error' : 'request.failed'
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}

type ErrorCopy = {
  fallback: string
  offline: string
  unavailable: string
  unauthorized: string
  disabled: string
  forbidden: string
  notFound: string
  validation: string
}

/**
 * Generic wording for failures the API did not (or could not) explain. Kept here
 * rather than in `messages/` because this runs outside React — in the Zustand
 * stores and the backoffice — and picks the language from `<html lang>`.
 */
const copy: Record<Locale, ErrorCopy> = {
  pt: {
    fallback: 'Ocorreu um erro. Tente novamente.',
    offline: 'Sem ligação ao servidor. Verifique a sua internet e tente novamente.',
    unavailable: 'O servidor está temporariamente indisponível. Tente novamente dentro de momentos.',
    unauthorized: 'Precisa de iniciar sessão para continuar.',
    disabled: 'Esta conta foi desativada. Contacte a Sobremesas & Companhia.',
    forbidden: 'Não tem permissão para realizar esta ação.',
    notFound: 'O recurso pedido não foi encontrado.',
    validation: 'Verifique os dados introduzidos.',
  },
  en: {
    fallback: 'Something went wrong. Please try again.',
    offline: 'Could not reach the server. Check your connection and try again.',
    unavailable: 'The server is temporarily unavailable. Please try again in a moment.',
    unauthorized: 'Please sign in to continue.',
    disabled: 'This account has been disabled. Please contact Sobremesas & Companhia.',
    forbidden: 'You are not allowed to do this.',
    notFound: 'We could not find what you were looking for.',
    validation: 'Please check the details you entered.',
  },
  fr: {
    fallback: 'Une erreur est survenue. Veuillez réessayer.',
    offline: 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.',
    unavailable: 'Le serveur est momentanément indisponible. Réessayez dans quelques instants.',
    unauthorized: 'Veuillez vous connecter pour continuer.',
    disabled: 'Ce compte a été désactivé. Veuillez contacter Sobremesas & Companhia.',
    forbidden: "Vous n'êtes pas autorisé à effectuer cette action.",
    notFound: "L'élément demandé est introuvable.",
    validation: 'Veuillez vérifier les informations saisies.',
  },
  es: {
    fallback: 'Se ha producido un error. Inténtelo de nuevo.',
    offline: 'No se ha podido conectar con el servidor. Compruebe su conexión e inténtelo de nuevo.',
    unavailable: 'El servidor no está disponible en este momento. Inténtelo de nuevo en unos instantes.',
    unauthorized: 'Inicie sesión para continuar.',
    disabled: 'Esta cuenta ha sido desactivada. Póngase en contacto con Sobremesas & Companhia.',
    forbidden: 'No tiene permiso para realizar esta acción.',
    notFound: 'No se ha encontrado el elemento solicitado.',
    validation: 'Revise los datos introducidos.',
  },
}

/**
 * User-facing message for an error thrown by the API helpers, in the page's
 * language. The API already answers in that language (the client sends
 * `Accept-Language`), so its `reason` wins whenever there is one; the generic
 * copy above covers failures that never reached it.
 */
export function apiErrorMessage(err: unknown, fallback?: string, locale: Locale = documentLocale()): string {
  const c = copy[locale]
  const otherwise = fallback ?? c.fallback
  if (!isApiError(err)) {
    if (err instanceof TypeError) return c.offline
    return otherwise
  }
  if (err.code === 'upstream.unreachable' || err.code === 'upstream.unavailable') return c.unavailable
  if (err.isUnauthorized) return c.unauthorized
  // A closed account gets 403 on every route, including login — say why, not "no permission".
  if (err.code === 'user.disabled') return err.reason || c.disabled
  if (err.status === 403) return c.forbidden
  if (err.isNotFound) return c.notFound
  if (err.code.startsWith('validation.')) return err.reason || c.validation
  return err.reason || otherwise
}
