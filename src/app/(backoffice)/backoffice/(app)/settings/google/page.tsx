'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays, CheckCircle2, Link2, Link2Off, Mail, RefreshCw } from 'lucide-react'
import ConfirmDialog from '@/components/backoffice/ConfirmDialog'
import PageHeader from '@/components/backoffice/PageHeader'
import { useToast } from '@/components/backoffice/Toaster'
import { Button } from '@/components/ui/button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, Input, Select } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { backofficeApi } from '@/lib/api/backoffice'
import { apiErrorMessage } from '@/lib/api/errors'
import { useGoogleCalendars, useGoogleMutations, useGoogleStatus } from '@/lib/backoffice/queries'
import { formatDate } from '@/lib/labels'

export const dynamic = 'force-dynamic'

const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'

const scopeLabel: Record<string, string> = {
  'https://www.googleapis.com/auth/gmail.modify': 'Gmail (enviar e ler as conversas)',
  'https://www.googleapis.com/auth/contacts': 'Contactos (adicionar clientes)',
  'https://www.googleapis.com/auth/calendar.events': 'Calendário (eventos das encomendas)',
  'https://www.googleapis.com/auth/calendar.readonly': 'Calendário (escolher a agenda)',
}

function GoogleSettings() {
  const toast = useToast()
  const params = useSearchParams()
  const { data, isLoading, error } = useGoogleStatus()
  const { disconnect, settings, retryEmails, resyncCalendar } = useGoogleMutations()
  const calendarAccess = !!data?.connected && data.scopes.includes(CALENDAR_SCOPE)
  const calendars = useGoogleCalendars(calendarAccess)
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
                <p className="text-sm text-cacau/70">Os clientes vão para os Google Contacts quando quiser: na ficha de cada cliente, <strong className="font-medium text-cacau">Adicionar aos Google Contacts</strong>. Ficam com a etiqueta “Sobremesas — clientes” e, a partir daí, o que mudar na ficha (nome, e-mail, telemóvel) passa também para o contacto.</p>
                <p className="text-xs text-cacau/50">Leitura das respostas por e-mail chega na próxima fase; a ligação já fica pronta para isso.</p>
              </CardBody>
            </Card>
          )}

          {data.connected && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-cacau/50" aria-hidden /> Calendário</CardTitle>
                <Link href="/backoffice/agenda" className="text-sm text-cacau/70 underline hover:text-cacau">Ver agenda</Link>
              </CardHeader>
              <CardBody className="space-y-4">
                {!calendarAccess ? (
                  <p className="rounded-lg bg-merengue px-3 py-2 text-sm text-cacau">Esta ligação não tem acesso ao Calendário. Use “Voltar a ligar” e aceite a permissão do calendário.</p>
                ) : (
                  <>
                    <Field label="Calendário das encomendas" htmlFor="g-calendar" hint="Cada encomenda com data (exceto recusadas e canceladas) tem um evento neste calendário, atualizado sempre que a encomenda muda. A Agenda mostra também os outros eventos deste calendário.">
                      <Select
                        id="g-calendar"
                        value={data.calendarId ?? ''}
                        disabled={calendars.isLoading || settings.isPending}
                        onChange={(e) => settings.mutateAsync({ calendarId: e.target.value }).then(() => toast.success('Calendário alterado. Os eventos passam para lá dentro de momentos.')).catch((err) => toast.error(apiErrorMessage(err)))}
                      >
                        {calendars.isLoading && <option value={data.calendarId ?? ''}>A carregar…</option>}
                        {(calendars.data ?? []).filter((c) => c.writable).map((c) => (
                          <option key={c.id} value={c.primary ? '' : c.id}>{c.name}{c.primary ? ' (principal)' : ''}</option>
                        ))}
                        {data.calendarId && calendars.data && !calendars.data.some((c) => c.id === data.calendarId) && <option value={data.calendarId}>{data.calendarId}</option>}
                      </Select>
                    </Field>
                    {calendars.error && <p className="text-sm text-[#b4534b]">{apiErrorMessage(calendars.error)}</p>}
                    <p className="text-sm text-cacau/80">{data.calendarEvents} encomenda(s) no calendário{data.calendarFailed > 0 && <span className="text-[#b4534b]"> · {data.calendarFailed} com erro</span>}</p>
                    {data.calendarLastError && <p className="text-sm text-[#b4534b]">Último erro: {data.calendarLastError}</p>}
                    <Button size="sm" variant="secondary" loading={resyncCalendar.isPending} onClick={() => resyncCalendar.mutateAsync().then((r) => toast.success(r.failed > 0 ? `${r.written} evento(s) atualizados, ${r.failed} com erro.` : `${r.written} evento(s) atualizados.`)).catch((e) => toast.error(apiErrorMessage(e)))}>
                      <RefreshCw className="h-4 w-4" aria-hidden /> Sincronizar agora
                    </Button>
                  </>
                )}
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
