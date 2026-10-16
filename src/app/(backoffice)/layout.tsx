import '@fontsource/young-serif/400.css'
import '@fontsource-variable/figtree/index.css'
import '@/app/globals.css'

/** Document shell for the backoffice, which stays in Portuguese. */
export default function BackofficeRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  )
}
