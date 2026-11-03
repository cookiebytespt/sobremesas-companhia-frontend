import { Badge } from '@/components/ui/badge'
import type { UserRole } from '@/lib/api/types'
import { roleLabel } from '@/lib/labels'

export function Avatar({ name, email, picture, size = 'md' }: { name: string | null; email: string | null; picture: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const label = name ?? email ?? '?'
  const dim = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' }[size]
  return picture ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={picture} alt="" className={`${dim} shrink-0 rounded-full object-cover`} referrerPolicy="no-referrer" />
  ) : (
    <span className={`${dim} grid shrink-0 place-items-center rounded-full bg-po font-semibold text-cacau`}>{label[0]?.toUpperCase()}</span>
  )
}

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge className="bg-cacau text-acucar">{roleLabel[role]}</Badge>
}

export function InviteBadge() {
  return <Badge className="bg-merengue text-cacau">Convite pendente</Badge>
}

export function DisabledBadge() {
  return <Badge className="bg-[#f3dcd9] text-[#7a2e27]">Desativada</Badge>
}

export function GoogleBadge() {
  return <Badge className="bg-creme text-cacau/80">Google</Badge>
}
