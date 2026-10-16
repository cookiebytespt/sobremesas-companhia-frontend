import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Stat tile: one headline number, a label, an optional hint line. The value is
 * always ink-coloured; only the small icon carries an accent so tiles read as a
 * set rather than a traffic light.
 */
export default function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  accent = false,
  loading = false,
}: {
  label: string
  value: number | string | undefined
  hint?: string
  icon: LucideIcon
  href?: string
  /** Highlights tiles that mean "someone needs to act". */
  accent?: boolean
  loading?: boolean
}) {
  const body = (
    <Card className={cn('flex h-full items-start justify-between gap-3 p-5 transition-shadow', href && 'hover:shadow-md')}>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-cacau/50">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-8 w-16" />
        ) : (
          <p className="mt-1 text-3xl font-black tabular-nums text-cacau">{value ?? '—'}</p>
        )}
        {hint && <p className="mt-1 truncate text-xs text-cacau/50">{hint}</p>}
      </div>
      <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg', accent ? 'bg-po text-po-fundo' : 'bg-creme text-cacau/50')}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>
    </Card>
  )
  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  )
}
