'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, Contact, ExternalLink, Images, LayoutDashboard, LogOut, Mail, Menu, Settings, Tags, Users, UtensilsCrossed, X } from 'lucide-react'
import { useState } from 'react'
import { Icon } from '@/components/site/Icon'
import type { User } from '@/lib/api/types'
import { cn } from '@/lib/utils'

/** Sections grow with the phases: Encomendas, Caixa de entrada, Agenda, Clientes, Contactos, Definições. */
export const backofficeNav = [
  { href: '/backoffice', label: 'Painel', icon: LayoutDashboard, exact: true },
  { href: '/backoffice/orders', label: 'Encomendas', icon: ClipboardList },
  { href: '/backoffice/clients', label: 'Clientes', icon: Contact },
  { href: '/backoffice/contacts', label: 'Contactos', icon: Mail },
  { href: '/backoffice/gallery', label: 'Galeria', icon: Images },
  { href: '/backoffice/services', label: 'Serviços', icon: UtensilsCrossed },
  { href: '/backoffice/occasions', label: 'Ocasiões', icon: Tags },
  { href: '/backoffice/team', label: 'Equipa', icon: Users },
  { href: '/backoffice/settings/google', label: 'Google', icon: Settings },
] as const

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

/** Sidebar + top bar. `user` comes from the server layout (already verified as admin). */
export default function BackofficeShell({ user, children }: { user: User; children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const displayName = user.name ?? user.email ?? 'Admin'
  const initial = displayName[0]?.toUpperCase() ?? 'A'

  const nav = (
    <nav className="flex flex-col gap-0.5 px-3">
      {backofficeNav.map(({ href, label, icon: NavIcon, ...item }) => {
        const active = isActive(pathname, href, 'exact' in item ? item.exact : false)
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active ? 'bg-acucar/15 text-acucar' : 'text-acucar/70 hover:bg-acucar/5 hover:text-acucar'
            )}
          >
            <NavIcon className={cn('h-4 w-4', active ? 'text-po' : 'text-acucar/50')} aria-hidden />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  const brand = (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-acucar/10 text-acucar">
        <Icon name="whisk" className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-sm">Sobremesas &amp; Companhia</p>
        <p className="text-[11px] uppercase tracking-wider text-acucar/50">Backoffice</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-creme lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden bg-cacau text-acucar lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-acucar/10 px-5">{brand}</div>
        <div className="flex-1 overflow-y-auto py-4">{nav}</div>
        <div className="border-t border-acucar/10 p-3">
          <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-acucar/70 hover:bg-acucar/5 hover:text-acucar">
            <ExternalLink className="h-4 w-4" aria-hidden /> Ver site
          </a>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-cacau/60" aria-label="Fechar menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-cacau text-acucar shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-acucar/10 px-4">
              {brand}
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-acucar/10" aria-label="Fechar">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="py-4">{nav}</div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-linha bg-acucar/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-creme lg:hidden" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-cacau">{displayName}</p>
              <p className="text-xs text-cacau/50">{user.email}</p>
            </div>
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.picture} alt="" className="h-9 w-9 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span className="grid h-9 w-9 place-items-center rounded-full bg-po text-sm font-bold text-cacau">{initial}</span>
            )}
            <a href="/api/auth/logout" className="rounded-lg p-2 text-cacau/60 hover:bg-creme hover:text-cacau" title="Terminar sessão" aria-label="Terminar sessão">
              <LogOut className="h-4 w-4" />
            </a>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
