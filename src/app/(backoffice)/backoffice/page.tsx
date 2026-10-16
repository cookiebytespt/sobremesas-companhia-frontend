'use client'

import { ImageUp, UserPlus, Users } from 'lucide-react'
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

  return (
    <>
      <PageHeader title={firstName ? `Olá, ${firstName}` : 'Painel'} description="O estado da Sobremesas & Companhia num relance." />
      {error && <p className="mb-4 text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Clientes" value={data?.clients.total} icon={Users} href="/backoffice/clientes" loading={isLoading} />
        <StatCard label="Novos (30 dias)" value={data?.clients.newLast30Days} icon={UserPlus} loading={isLoading} />
        <StatCard label="Fotos por associar" value={data?.uploads.unattached} hint="Apagadas automaticamente após 24 h" icon={ImageUp} loading={isLoading} />
      </div>
      <Card className="mt-6">
        <CardBody>
          <p className="font-display text-base text-cacau">Pedidos, agenda, galeria e contactos chegam nas próximas fases.</p>
          <p className="mt-1 text-sm text-cacau/60">Por agora o backoffice gere clientes e convites. O plano completo está em <code className="rounded bg-creme px-1">docs/PLATFORM-PLAN.md</code>.</p>
        </CardBody>
      </Card>
    </>
  )
}
