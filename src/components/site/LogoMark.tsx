/**
 * The business's logo as a round badge (the watercolour ring with "Sobremesas & Companhia").
 * `/brand/logo-mark.png` is a 256 px round crop of the cleaned logo, so it stays sharp up to
 * ~128 CSS px on retina screens. The full-size masters live outside the repo (`../brand/`).
 */
export function LogoMark({ size = 44, className = '' }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/logo-mark.png" alt="" width={size} height={size} className={`shrink-0 rounded-full ${className}`} style={{ width: size, height: size }} />
  )
}
