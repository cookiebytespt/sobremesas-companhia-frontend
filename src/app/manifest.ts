import type { MetadataRoute } from 'next'

/** "Add to home screen": the round logo as the app icon, the site's powder blue and sugar white. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sobremesas & Companhia',
    short_name: 'Sobremesas',
    description: 'Bolos, doces e catering de pequena produção, com dedicação. Santo Tirso.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFDFB',
    theme_color: '#D6E5F0',
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
