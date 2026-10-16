import { Icon } from "./Icon";

// Text wordmark until the client provides the original logo file (vector preferred).
export function Wordmark({ tagline, onDark = false }: { tagline: string; onDark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`grid h-10 w-10 place-items-center rounded-full ${onDark ? "bg-acucar/10 text-acucar" : "bg-acucar text-cacau"}`}>
        <Icon name="whisk" className="h-5 w-5" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-[1.15rem] tracking-tight">Sobremesas &amp; Companhia</span>
        <span className={`mt-1 block text-[0.78rem] ${onDark ? "text-acucar/70" : "text-cacau-suave"}`}>{tagline}</span>
      </span>
    </span>
  );
}
