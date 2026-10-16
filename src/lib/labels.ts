/** pt-PT formatting for the backoffice (the site uses the page's locale instead). */

const dateFormat = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Lisbon' })
const dateTimeFormat = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Lisbon' })
const moneyFormat = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' })

export function formatDate(value: string | Date | null | undefined, withTime = false): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return '—'
  return (withTime ? dateTimeFormat : dateFormat).format(date)
}

export function formatMoney(euros: number | null | undefined): string {
  return euros === null || euros === undefined ? '—' : moneyFormat.format(euros)
}

export const roleLabel: Record<'customer' | 'admin', string> = { customer: 'Cliente', admin: 'Administrador' }

export const localeLabel: Record<string, string> = { pt: 'Português', en: 'English', es: 'Español', fr: 'Français' }
