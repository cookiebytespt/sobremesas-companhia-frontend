import { LogoMark } from "./LogoMark";

// The logo badge + the name set in the site's type (the logo's own lettering is too fine to read at header size).
/** `compact`: in the header, hide the tagline once the full nav is shown (xl+), where it has no room. */
export function Wordmark({ tagline, onDark = false, compact = false }: { tagline: string; onDark?: boolean; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <LogoMark size={48} className={onDark ? "ring-2 ring-acucar/15" : "shadow-[0_2px_8px_-2px_rgba(75,46,34,0.25)]"} />
      <span className="leading-none">
        <span className="block font-display text-[1.15rem] tracking-tight">Sobremesas &amp; Companhia</span>
        <span className={`mt-1 block text-[0.78rem] ${compact ? "xl:hidden" : ""} ${onDark ? "text-acucar/70" : "text-cacau-suave"}`}>{tagline}</span>
      </span>
    </span>
  );
}
