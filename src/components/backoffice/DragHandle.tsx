import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Grip used with `useDragReorder().handleProps(id)`. */
export default function DragHandle({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex h-7 w-7 cursor-grab items-center justify-center rounded-md text-cacau/30 hover:bg-creme hover:text-cacau/60 active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cacau/30',
        className
      )}
      {...props}
    >
      <GripVertical className="h-4 w-4" aria-hidden />
    </span>
  )
}

/** Visual cue for the drop position: a 2px brand line on the edge of the item being hovered. */
export function dropEdgeClass(over: { id: string; after: boolean } | null, id: string, axis: 'row' | 'grid') {
  if (!over || over.id !== id) return ''
  if (axis === 'row') return over.after ? 'shadow-[inset_0_-2px_0_0_#4b2e22]' : 'shadow-[inset_0_2px_0_0_#4b2e22]'
  return over.after ? 'shadow-[inset_-2px_0_0_0_#4b2e22]' : 'shadow-[inset_2px_0_0_0_#4b2e22]'
}
