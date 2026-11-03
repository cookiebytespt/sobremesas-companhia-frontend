'use client'

import { CalendarDays, ClipboardList, Contact, Images, Inbox, Mail, MessageSquare, PiggyBank, Users, UtensilsCrossed } from 'lucide-react'
import PageHeader from '@/components/backoffice/PageHeader'
import StatCard from '@/components/backoffice/StatCard'
import { useCurrentUser } from '@/components/backoffice/CurrentUser'
import { Card, CardBody } from '@/components/ui/card'
import { apiErrorMessage } from '@/lib/api/errors'
import { useDashboard } from '@/lib/backoffice/queries'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const user = useCurrentUser()
  const { data, isLoading, error } = useDashboard()
  const firstName = user.name?.split(' ')[0]
  const open = data ? (data.orders.byStatus.new ?? 0) + (data.orders.byStatus.reviewing ?? 0) + (data.orders.byStatus.proposal_sent ?? 0) + (data.orders.byStatus.confirmed ?? 0) : undefined

  return (
    <>
      <PageHeader title={firstName ? `Olá, ${firstName}` : 'Painel'} description="O estado da Sobremesas & Companhia num relance." />
      {error && <p className="mb-4 text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Novas encomendas" value={data?.orders.new} hint={open != null ? `${open} em curso` : undefined} icon={ClipboardList} href="/backoffice/orders?tab=new" accent loading={isLoading} />
        <StatCard label="Mensagens por ler" value={data?.orders.unreadMessages} icon={MessageSquare} href="/backoffice/orders?tab=unread" loading={isLoading} />
        <StatCard label="Eventos nos próximos 7 dias" value={data?.orders.upcomingEvents7Days} icon={CalendarDays} href="/backoffice/orders?tab=confirmed" loading={isLoading} />
        <StatCard label="Sinais por receber" value={data?.orders.depositsDue} icon={PiggyBank} href="/backoffice/orders?tab=confirmed&payment=pending" loading={isLoading} />
        <StatCard label="Caixa de entrada" value={data?.inbox.open} hint="e-mails sem encomenda" icon={Inbox} href="/backoffice/inbox" loading={isLoading} />
        <StatCard label="Contactos por tratar" value={data?.contacts.unhandled} icon={Mail} href="/backoffice/contacts" loading={isLoading} />
        <StatCard label="Clientes" value={data?.clients.total} icon={Contact} href="/backoffice/clients" loading={isLoading} />
        <StatCard label="Galeria" value={data?.gallery.published} hint={data && data.gallery.unpublished > 0 ? `${data.gallery.unpublished} oculta${data.gallery.unpublished === 1 ? '' : 's'}` : 'fotografias publicadas'} icon={Images} href="/backoffice/gallery" loading={isLoading} />
        <StatCard label="Serviços" value={data?.offering.services} hint={data ? `${data.offering.items} itens no menu` : undefined} icon={UtensilsCrossed} href="/backoffice/services" loading={isLoading} />
      </div>
      {data && !data.email.googleConnected && (
        <Card className="mt-6 border-merengue bg-merengue/40">
          <CardBody className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-base text-cacau">Conta Google por ligar</p>
              <p className="mt-1 text-sm text-cacau/70">Os e-mails aos clientes ({data.email.pending} em espera) só saem depois de ligar a conta Google da loja.</p>
            </div>
            <a href="/backoffice/settings/google" className="rounded-full bg-cacau px-4 py-2 text-sm font-medium text-acucar hover:bg-cacau-suave">Ligar agora</a>
          </CardBody>
        </Card>
      )}
      <p className="mt-6 flex items-center gap-2 text-xs text-cacau/40"><Users className="h-3.5 w-3.5" /> {data?.team.active ?? '–'} na equipa{data && data.team.invitedPending > 0 ? ` · ${data.team.invitedPending} convite(s) pendente(s)` : ''}</p>
    </>
  )
}
