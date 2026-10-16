import { cn } from '@/lib/utils'

export default function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-6 flex flex-wrap items-end justify-between gap-4', className)}>
      <div>
        <h1 className="text-2xl font-black text-cacau">{title}</h1>
        {description && <p className="mt-1 text-sm text-cacau/60">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
