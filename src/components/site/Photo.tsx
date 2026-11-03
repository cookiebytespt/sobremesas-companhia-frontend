import { Icon } from './Icon'

const tints = ['bg-po', 'bg-merengue', 'bg-[#ece4da]', 'bg-acucar']

/** A gallery photo from the API (already a resized, metadata-free JPEG), or a soft placeholder carrying the caption. */
export function Photo({
  src,
  alt,
  width,
  height,
  className = '',
  tint = 0,
  icon = 'whisk',
  eager = false,
}: {
  src?: string | null
  alt: string
  width?: number | null
  height?: number | null
  className?: string
  tint?: number
  icon?: string
  eager?: boolean
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width ?? undefined}
        height={height ?? undefined}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={`bg-[#ece4da] object-cover ${className}`}
      />
    )
  }
  return (
    <div role="img" aria-label={alt} className={`flex flex-col items-center justify-center gap-3 p-6 text-center text-cacau/70 ${tints[tint % tints.length]} ${className}`}>
      <Icon name={icon} className="h-9 w-9 text-po-fundo" />
      <span className="max-w-[18ch] text-sm leading-snug">{alt}</span>
    </div>
  )
}
