import type { Dictionary } from '@/i18n'

export function Steps({ t }: { t: Dictionary['home']['steps'] }) {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-cacau/10 bg-[#fbf6f1]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[0.8fr_1.2fr] md:px-8 md:py-24">
        <div>
          <h2 className="font-display text-4xl leading-tight tracking-tight md:text-5xl">{t.title}</h2>
          <p className="mt-4 max-w-[38ch] text-lg leading-relaxed text-cacau-suave">{t.intro}</p>
        </div>
        <ol className="grid gap-8 md:gap-10">
          {t.items.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[2.25rem_1fr] gap-4 md:grid-cols-[3.25rem_1fr] md:gap-5">
              <span className="font-display text-[2.2rem] leading-none text-po-fundo md:text-[2.6rem]">{i + 1}</span>
              <div>
                <h3 className="font-display text-[1.35rem] leading-snug md:text-2xl">{s.title}</h3>
                <p className="mt-2 max-w-[52ch] leading-relaxed text-cacau-suave">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
