import Link from "next/link";
import "@fontsource/young-serif/400.css";
import "@fontsource-variable/figtree/index.css";
import "@/app/globals.css";

export default function NotFound() {
  return (
    <html lang="pt-PT">
      <body>
        <main className="grid min-h-screen place-items-center px-6 text-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-po-fundo">404</p>
            <h1 className="mt-2 font-display text-3xl text-cacau">Página não encontrada</h1>
            <Link href="/" className="mt-6 inline-block rounded-full bg-cacau px-5 py-2 text-sm font-medium text-acucar">Início</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
