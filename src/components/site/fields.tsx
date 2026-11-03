import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Icon } from './Icon'

// Public-site form controls, sized for thumbs: 48px+ targets, 16px text (no iOS zoom), the landing's look.

const control =
  'block min-h-12 w-full min-w-0 appearance-none rounded-xl border border-cacau/20 bg-acucar px-4 py-3 text-base text-cacau placeholder:text-cacau/40 focus:border-cacau focus:outline-none aria-[invalid=true]:border-[#b4534b]'

export const SiteInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function SiteInput({ className, ...props }, ref) {
  return <input ref={ref} className={cn(control, className)} {...props} />
})

export const SiteTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function SiteTextarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(control, 'min-h-28', className)} {...props} />
})

export const SiteSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function SiteSelect({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(control, 'select-chevron pr-10', className)} {...props}>
      {children}
    </select>
  )
})

export function SiteField({ label, htmlFor, hint, optional, error, children, className }: {
  label: string
  htmlFor?: string
  hint?: string
  optional?: string
  error?: string | null
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-2 block text-[0.95rem] font-medium text-cacau">
        {label} {optional && <span className="font-normal text-cacau-suave">{optional}</span>}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-sm text-[#9a3d35]">{error}</p> : hint && <p className="mt-1.5 text-sm text-cacau-suave">{hint}</p>}
    </div>
  )
}

/** A pill that toggles (services, allergens, delivery). */
export function Chip({ on, onClick, children, className }: { on: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-[0.95rem] transition-colors',
        on ? 'border-cacau bg-cacau text-acucar' : 'border-cacau/20 bg-acucar text-cacau active:bg-po/40 hover:border-cacau/50',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** A big square-ish choice with a scalloped icon badge (occasions, services). */
export function Tile({ on, onClick, icon, label, sub }: { on: boolean; onClick: () => void; icon: string; label: string; sub?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        'flex min-h-[5.5rem] w-full flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-center transition-colors',
        on ? 'border-cacau bg-cacau text-acucar' : 'border-cacau/15 bg-acucar text-cacau active:bg-po/40 hover:border-cacau/40',
      )}
    >
      <span className={cn('scallop-badge grid h-11 w-11 place-items-center', on ? 'bg-acucar/15' : 'bg-po')}>
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span className="text-[0.95rem] leading-tight font-medium">{label}</span>
      {sub && <span className={cn('text-xs leading-tight', on ? 'text-acucar/75' : 'text-cacau-suave')}>{sub}</span>}
    </button>
  )
}
