'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { whatsappUrl } from '@/content/site'
import { Icon } from '../Icon'

/**
 * Phones only: once the visitor scrolls past the hero, a bar with "Pedir orçamento" (to the request
 * page) and WhatsApp stays under their thumb. It steps aside over the closing call to action (`#quote`).
 */
export function MobileActionBar({ quote, whatsapp, requestHref }: { quote: string; whatsapp: string; requestHref: string }) {
  const [pastHero, setPastHero] = useState(false)
  const [atQuote, setAtQuote] = useState(false)

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const target = document.getElementById('quote')
    const io = target ? new IntersectionObserver(([e]) => setAtQuote(e.isIntersecting), { threshold: 0.05 }) : null
    if (target) io?.observe(target)
    return () => { window.removeEventListener('scroll', onScroll); io?.disconnect() }
  }, [])

  const shown = pastHero && !atQuote
  return (
    <div
      aria-hidden={!shown}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-cacau/10 bg-acucar/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 md:hidden ${shown ? 'translate-y-0' : 'pointer-events-none translate-y-full'}`}
    >
      <div className="flex items-center gap-3">
        <a href={whatsappUrl()} tabIndex={shown ? 0 : -1} aria-label={whatsapp} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-cacau/25">
          <Icon name="chat" className="h-5 w-5" />
        </a>
        <Link href={requestHref} tabIndex={shown ? 0 : -1} className="flex min-h-12 flex-1 items-center justify-center rounded-full bg-cacau px-6 font-medium text-acucar">
          {quote}
        </Link>
      </div>
    </div>
  )
}
