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

export const roleLabel: Record<'admin', string> = { admin: 'Administrador' }

export const localeLabel: Record<string, string> = { pt: 'Português', en: 'English', es: 'Español', fr: 'Français' }

export const itemTagLabel: Record<string, string> = {
  sem_gluten: 'Sem glúten', sem_lactose: 'Sem lactose', sem_acucar: 'Sem açúcar', vegetariano: 'Vegetariano',
  vegan: 'Vegan', contem_frutos_secos: 'Contém frutos secos', contem_alcool: 'Contém álcool',
}

/** Hours → "2 dias", "1 dia e meio", "6 h" — how production rules read in the UI. */
export function formatHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined) return '—'
  if (hours < 24) return `${hours} h`
  const days = Math.floor(hours / 24)
  const rest = hours % 24
  const dayLabel = days === 1 ? 'dia' : 'dias'
  if (rest === 0) return `${days} ${dayLabel}`
  if (rest === 12) return `${days} ${dayLabel} e meio`
  return `${days} ${dayLabel} e ${rest} h`
}

/** Icons the landing knows for occasions/services. */
export const iconOptions = ['platter', 'rings', 'dove', 'cross', 'candle', 'cupcake', 'cookie', 'vase', 'whisk', 'chat'] as const

export const orderStatusLabel: Record<string, string> = {
  new: 'Nova', reviewing: 'Em análise', proposal_sent: 'Proposta enviada', confirmed: 'Confirmada', completed: 'Concluída', declined: 'Recusada', cancelled: 'Cancelada',
}
export const orderStatusClass: Record<string, string> = {
  new: 'bg-po text-cacau', reviewing: 'bg-merengue text-cacau', proposal_sent: 'bg-[#e8dcf5] text-[#4b2a73]', confirmed: 'bg-[#dcebdc] text-[#245524]',
  completed: 'bg-creme text-cacau/70', declined: 'bg-[#f3dcd9] text-[#7a2e27]', cancelled: 'bg-creme text-cacau/50',
}
export const paymentStatusLabel: Record<string, string> = { pending: 'Por pagar', deposit_paid: 'Sinal pago', paid: 'Pago' }
export const deliveryModeLabel: Record<string, string> = { delivery: 'Entrega na morada', pickup: 'Levantamento', on_site: 'Serviço no local' }
export const orderSourceLabel: Record<string, string> = { web: 'Site', whatsapp: 'WhatsApp', instagram: 'Instagram', phone: 'Telefone', in_person: 'Presencial' }
export const transitionLabel: Record<string, string> = {
  reviewing: 'Em análise', proposal_sent: 'Marcar proposta enviada', confirmed: 'Confirmar', completed: 'Concluir', declined: 'Recusar', cancelled: 'Cancelar',
}
export const eventStatusLabel: Record<string, string> = {
  new: 'criada', reviewing: 'passou a em análise', proposal_sent: 'proposta enviada', confirmed: 'confirmada', completed: 'concluída', declined: 'recusada', cancelled: 'cancelada',
}
