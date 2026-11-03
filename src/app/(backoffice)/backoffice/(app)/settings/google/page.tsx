'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Link2, Link2Off, Mail, RefreshCw } from 'lucide-react'
import ConfirmDialog from '@/components/backoffice/ConfirmDialog'
import PageHeader from '@/components/backoffice/PageHeader'
import { useToast } from '@/components/backoffice/Toaster'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { backofficeApi } from '@/lib/api/backoffice'
import { apiErrorMessage } from '@/lib/api/errors'
import { useGoogleMutations, useGoogleStatus } from '@/lib/backoffice/queries'
import { formatDate } from '@/lib/labels'

export const dynamic = 'force-dynamic'

const scopeLabel: Record<string, string> = {
  'https://www.googleapis.com/auth/gmail.modify': 'Gmail (enviar e ler as conversas)',
  'https://www.googleapis.com/auth/contacts': 'Contactos (importar e criar)',
  'https://www.googleapis.com/auth/calendar.events': 'Calendário (eventos das encomendas)',
  'https://www.googleapis.com/auth/calendar.readonly': 'Calendário (escolher a agenda)',
}

function GoogleSettings() {
  const toast = useToast()
  const params = useSearchParams()
  const { data, isLoading, error } = useGoogleStatus()
  const { disconnect, settings, retryEmails } = useGoogleMutations()
  const [confirm, setConfirm] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [label, setLabel] = useState('')
  useEffect(() => { if (data?.gmailLabelName) setLabel(data.gmailLabelName) }, [data?.gmailLabelName])
  useEffect(() => {
    if (params.get('connected')) toast.success('Conta Google ligada.')
    const err = params.get('error')
    if (err) toast.error(`A ligação falhou (${err}). Tente de novo.`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const connect = async () => {
    setConnecting(true)
    try {
      const { url } = await backofficeApi.google.connectUrl()
      window.location.href = url
    } catch (err) {
      toast.error(apiErrorMessage(err)); setConnecting(false)
    }
  }

  if (error) return <p className="text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>
  if (isLoading || !data) return <Skeleton className="h-40 w-full" />

  return (
    <>
      <PageHeader title="Google" description="Uma conta Google da loja liga o Gmail (as conversas com os clientes), os Contactos e o Calendário. Os e-mails aos clientes saem desta conta, por isso as respostas chegam a ela — e à encomenda." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ligação</CardTitle>
              {data.connected ? <span className="inline-flex items-center gap-1 text-sm text-[#245524]"><CheckCircle2 className="h-4 w-4" /> ligada</span> : <span className="text-sm text-cacau/50">não ligada</span>}
            </CardHeader>
            <CardBody className="space-y-4">
              {!data.configured && <p className="rounded-lg bg-merengue px-3 py-2 text-sm text-cacau">A API ainda não tem as credenciais OAuth (GOOGLE_OAUTH_CLIENT_ID / SECRET). Sem isso não é possível ligar.</p>}
              {data.connected ? (
                <>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-cacau/80">
                    <dt className="text-cacau/50">Conta</dt><dd className="font-medium text-cacau">{data.accountEmail}</dd>
                    <dt className="text-cacau/50">Ligada</dt><dd>{formatDate(data.connectedAt, true)}{data.connectedByName && ` por ${data.connectedByName}`}</dd>
                    <dt className="text-cacau/50">Permissões</dt><dd><ul className="space-y-0.5">{data.scopes.filter((s) => scopeLabel[s]).map((s) => <li key={s}>{scopeLabel[s]}</li>)}</ul></dd>
                    {data.lastError && (<><dt className="text-cacau/50">Último erro</dt><dd className="text-[#b4534b]">{data.lastError}</dd></>)}
                  </dl>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={connect} loading={connecting}><RefreshCw className="h-4 w-4" aria-hidden /> Voltar a ligar</Button>
                    <Button variant="ghost" className="text-[#b4534b]" onClick={() => setConfirm(true)}><Link2Off className="h-4 w-4" aria-hidden /> Desligar</Button>
                  </div>
                </>
              ) : (
                <Button onClick={connect} loading={connecting} disabled={!data.configured}><Link2 className="h-4 w-4" aria-hidden /> Ligar conta Google</Button>
              )}
            </CardBody>
          </Card>

          {data.connected && (
            <Card>
              <CardHeader><CardTitle>Opções</CardTitle></CardHeader>
              <CardBody className="space-y-4">
                <Field label="Etiqueta no Gmail" htmlFor="g-label" hint="Aplicada aos tópicos das encomendas, para os encontrar na caixa de correio.">
                  <div className="flex gap-2">
                    <Input id="g-label" value={label} onChange={(e) => setLabel(e.target.value)} />
                    <Button size="sm" variant="secondary" disabled={label === data.gmailLabelName} loading={settings.isPending} onClick={() => settings.mutateAsync({ gmailLabelName: label }).then(() => toast.success('Guardado.')).catch((e) => toast.error(apiErrorMessage(e)))}>Guardar</Button>
                  </div>
                </Field>
                <Switch checked={data.pushContacts ?? true} onChange={(v) => settings.mutateAsync({ pushContacts: v }).catch((e) => toast.error(apiErrorMessage(e)))} label="Criar novos clientes nos Google Contacts" description="Quando chega uma encomenda de alguém novo (fase 4)." />
                <p className="text-xs text-cacau/50">Importação de contactos, leitura das respostas e calendário chegam nas próximas fases; a ligação já fica pronta para isso.</p>
              </CardBody>
            </Card>
          )}
        </div>

        <Card className="self-start">
          <CardHeader><CardTitle>E-mails aos clientes</CardTitle></CardHeader>
          <CardBody className="space-y-3 text-sm">
            <p className="flex items-center gap-2 text-cacau/80"><Mail className="h-4 w-4 text-cacau/50" /> {data.pendingEmails} em espera · {data.failedEmails} com falha</p>
            {!data.connected && data.pendingEmails > 0 && <p className="rounded-lg bg-merengue px-3 py-2 text-cacau">Os e-mails ficam guardados e saem assim que a conta estiver ligada.</p>}
            {data.failedEmails > 0 && <Button size="sm" variant="secondary" onClick={() => retryEmails.mutateAsync().then(() => toast.success('A tentar de novo.')).catch((e) => toast.error(apiErrorMessage(e)))} loading={retryEmails.isPending}>Tentar enviar de novo</Button>}
            <p className="text-xs text-cacau/50">Cada encomenda é um tópico no Gmail: o assunto leva o número (ex. [SC-2026-0001]) e as respostas do cliente juntam-se à conversa.</p>
          </CardBody>
        </Card>
      </div>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} onConfirm={() => disconnect.mutateAsync().then(() => { toast.success('Conta desligada.'); setConfirm(false) }).catch((e) => toast.error(apiErrorMessage(e)))} title="Desligar a conta Google?" description="Os e-mails aos clientes deixam de sair até ligar outra conta. O histórico das conversas fica." confirmLabel="Desligar" variant="danger" loading={disconnect.isPending} />
    </>
  )
}

export default function GoogleSettingsPage() {
  return <Suspense><GoogleSettings /></Suspense>
}
