'use client'

import { Suspense, useMemo } from 'react'
import Link from 'next/link'
import { AlertTriangle, CalendarCheck, CalendarDays, ChevronLeft, ChevronRight, ExternalLink, LayoutGrid, List, MapPin, Users } from 'lucide-react'
import PageHeader from '@/components/backoffice/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { apiErrorMessage } from '@/lib/api/errors'
import type { Agenda, AgendaEvent, AgendaOrder } from '@/lib/api/types'
import { useAgenda } from '@/lib/backoffice/queries'
import { useListParams } from '@/lib/backoffice/useListParams'
import { orderStatusClass, orderStatusLabel } from '@/lib/labels'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// Day math on plain `YYYY-MM-DD` strings (UTC dates, so no time-zone drift).
const toDay = (d: Date) => d.toISOString().slice(0, 10)
const parseDay = (s: string) => new Date(`${s}T00:00:00Z`)
const addDays = (s: string, n: number) => { const d = parseDay(s); d.setUTCDate(d.getUTCDate() + n); return toDay(d) }
const lisbonToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Lisbon' }).format(new Date())

const monthTitle = new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric', timeZone: 'UTC' })
const dayTitle = new Intl.DateTimeFormat('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

/** Month `YYYY-MM` → the Monday-to-Sunday grid that contains it. */
function monthGrid(month: string) {
  const first = `${month}-01`
  const firstDate = parseDay(first)
  const last = toDay(new Date(Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth() + 1, 0)))
  const start = addDays(first, -((firstDate.getUTCDay() + 6) % 7))
  const end = addDays(last, 6 - ((parseDay(last).getUTCDay() + 6) % 7))
  const days: string[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d)
  return { first, last, start, end, days }
}

function shiftMonth(month: string, n: number) {
  const d = parseDay(`${month}-01`)
  return toDay(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1))).slice(0, 7)
}

type DayEntries = { orders: AgendaOrder[]; events: AgendaEvent[] }

function byDay(agenda: Agenda | undefined, days: string[]) {
  const map = new Map<string, DayEntries>(days.map((d) => [d, { orders: [], events: [] }]))
  for (const o of agenda?.orders ?? []) if (o.order.eventDate) map.get(o.order.eventDate)?.orders.push(o)
  for (const e of agenda?.events ?? []) {
    for (let d = e.date; d <= e.endDate; d = addDays(d, 1)) map.get(d)?.events.push(e)
  }
  for (const entries of map.values()) {
    entries.events.sort((a, b) => Number(b.allDay) - Number(a.allDay) || (a.startTime ?? '').localeCompare(b.startTime ?? ''))
  }
  return map
}

const isConfirmed = (o: AgendaOrder) => o.order.status === 'confirmed' || o.order.status === 'completed'

function SyncIcon({ entry }: { entry: AgendaOrder }) {
  if (entry.calendarError) return <span title={`Google Calendar: ${entry.calendarError}`}><AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#b4534b]" aria-label="Erro ao sincronizar" /></span>
  if (entry.calendarSynced) return <span title="No Google Calendar"><CalendarCheck className="h-3.5 w-3.5 shrink-0 text-[#245524]/70" aria-label="No Google Calendar" /></span>
  return null
}

// MARK: Month view

function OrderChip({ entry }: { entry: AgendaOrder }) {
  const o = entry.order
  return (
    <Link
      href={`/backoffice/orders/${o.id}`}
      title={`${o.number} · ${o.clientName}${o.occasionName ? ` · ${o.occasionName}` : ''} — ${orderStatusLabel[o.status]}`}
      className={cn('flex items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-tight hover:ring-1 hover:ring-cacau/30', orderStatusClass[o.status])}
    >
      {o.eventTime && <span className="tabular-nums opacity-70">{o.eventTime}</span>}
      <span className="truncate">{o.clientName}</span>
    </Link>
  )
}

function EventChip({ event }: { event: AgendaEvent }) {
  const body = (
    <>
      {!event.allDay && event.startTime && <span className="tabular-nums opacity-70">{event.startTime}</span>}
      <span className="truncate">{event.title}</span>
    </>
  )
  const className = cn('flex items-center gap-1 truncate rounded-md border px-1.5 py-0.5 text-[11px] leading-tight', event.allDay ? 'border-po-fundo/30 bg-po/40 text-cacau/80' : 'border-linha bg-white text-cacau/70')
  return event.htmlLink
    ? <a href={event.htmlLink} target="_blank" rel="noreferrer" title={event.title} className={cn(className, 'hover:border-cacau/30')}>{body}</a>
    : <span title={event.title} className={className}>{body}</span>
}

function MonthView({ days, month, today, entries }: { days: string[]; month: string; today: string; entries: Map<string, DayEntries> }) {
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7 border-b border-linha bg-creme text-center text-[11px] font-semibold uppercase tracking-wider text-cacau/50">
        {weekdays.map((w) => <div key={w} className="py-2">{w}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const e = entries.get(day) ?? { orders: [], events: [] }
          const inMonth = day.startsWith(month)
          const items = e.orders.length + e.events.length
          const shown = 4
          return (
            <div key={day} className={cn('min-h-28 border-linha p-1.5', i % 7 !== 6 && 'border-r', i < days.length - 7 && 'border-b', !inMonth && 'bg-creme/50')}>
              <div className="mb-1 flex items-center justify-between">
                <span className={cn('grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs tabular-nums', day === today ? 'bg-cacau font-bold text-acucar' : inMonth ? 'text-cacau' : 'text-cacau/35')}>
                  {Number(day.slice(8))}
                </span>
                {e.orders.length > 0 && <span className="text-[10px] font-semibold text-cacau/50">{e.orders.length} enc.</span>}
              </div>
              <div className="flex flex-col gap-0.5">
                {e.orders.slice(0, shown).map((o) => <OrderChip key={o.order.id} entry={o} />)}
                {e.events.slice(0, Math.max(0, shown - e.orders.length)).map((ev) => <EventChip key={`${ev.id}-${day}`} event={ev} />)}
                {items > shown && <span className="px-1 text-[10px] text-cacau/50">+{items - shown} mais</span>}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// MARK: List view (default on phones)

function OrderRow({ entry }: { entry: AgendaOrder }) {
  const o = entry.order
  return (
    <Link href={`/backoffice/orders/${o.id}`} className="flex items-start gap-3 rounded-xl border border-linha bg-white px-3 py-2.5 hover:border-cacau/30">
      <div className="w-12 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-cacau">{o.eventTime ?? 'Dia'}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate font-medium text-cacau">{o.clientName}</span>
          <Badge className={orderStatusClass[o.status]}>{orderStatusLabel[o.status]}</Badge>
          <SyncIcon entry={entry} />
        </div>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-cacau/60">
          <span className="font-mono">{o.number}</span>
          {o.occasionName && <span>{o.occasionName}</span>}
          {o.guests != null && <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" aria-hidden />{o.guests}</span>}
          {o.itemCount > 0 && <span>{o.itemCount} {o.itemCount === 1 ? 'artigo' : 'artigos'}</span>}
        </p>
      </div>
    </Link>
  )
}

function EventRow({ event }: { event: AgendaEvent }) {
  const time = event.allDay ? 'Dia' : event.startTime
  const content = (
    <>
      <div className="w-12 shrink-0 pt-0.5 text-sm tabular-nums text-cacau/60">{time}</div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm text-cacau/80"><span className="truncate">{event.title}</span>{event.htmlLink && <ExternalLink className="h-3 w-3 shrink-0 text-cacau/40" aria-hidden />}</p>
        {(event.location || (!event.allDay && event.endTime)) && (
          <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-cacau/50">
            {!event.allDay && event.endTime && <span>até {event.endTime}</span>}
            {event.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden />{event.location}</span>}
          </p>
        )}
      </div>
    </>
  )
  const className = 'flex items-start gap-3 rounded-xl border border-dashed border-linha bg-creme/40 px-3 py-2'
  return event.htmlLink ? <a href={event.htmlLink} target="_blank" rel="noreferrer" className={cn(className, 'hover:border-cacau/30')}>{content}</a> : <div className={className}>{content}</div>
}

function ListView({ days, today, entries }: { days: string[]; today: string; entries: Map<string, DayEntries> }) {
  const withItems = days.filter((d) => { const e = entries.get(d); return e && e.orders.length + e.events.length > 0 })
  if (withItems.length === 0) {
    return (
      <Card className="px-6 py-12 text-center">
        <CalendarDays className="mx-auto h-8 w-8 text-cacau/30" aria-hidden />
        <p className="mt-3 font-medium text-cacau">Nada marcado neste mês</p>
        <p className="mt-1 text-sm text-cacau/50">As encomendas com data aparecem aqui, junto com os eventos do Google Calendar.</p>
      </Card>
    )
  }
  return (
    <div className="space-y-5">
      {withItems.map((day) => {
        const e = entries.get(day)!
        return (
          <section key={day}>
            <h2 className={cn('mb-2 flex items-center gap-2 text-sm font-semibold capitalize', day === today ? 'text-cacau' : day < today ? 'text-cacau/40' : 'text-cacau/70')}>
              {dayTitle.format(parseDay(day))}
              {day === today && <Badge className="bg-cacau text-acucar normal-case">hoje</Badge>}
            </h2>
            <div className="space-y-2">
              {e.orders.map((o) => <OrderRow key={o.order.id} entry={o} />)}
              {e.events.map((ev) => <EventRow key={`${ev.id}-${day}`} event={ev} />)}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// MARK: Page

function GoogleNotice({ agenda }: { agenda: Agenda }) {
  const g = agenda.google
  let text: React.ReactNode = null
  if (!g.connected) text = <>Ligue a conta Google em <Link href="/backoffice/settings/google" className="underline">Definições → Google</Link> para ver aqui o calendário da loja e criar automaticamente um evento por encomenda.</>
  else if (!g.calendarAccess) text = <>A ligação Google não tem acesso ao Calendário. Use “Voltar a ligar” em <Link href="/backoffice/settings/google" className="underline">Definições → Google</Link> e aceite a permissão do calendário.</>
  else if (g.error) text = <>Não foi possível ler o Google Calendar: {g.error}. As encomendas continuam listadas.</>
  else if (g.failedSyncs > 0) text = <>{g.failedSyncs} encomenda(s) não conseguiram ser escritas no Google Calendar. Veja os detalhes em <Link href="/backoffice/settings/google" className="underline">Definições → Google</Link>.</>
  if (!text) return null
  return <p className="mb-4 flex items-start gap-2 rounded-xl bg-merengue px-4 py-3 text-sm text-cacau"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /><span>{text}</span></p>
}

function AgendaPage() {
  const { get, set } = useListParams()
  const today = lisbonToday()
  const month = /^\d{4}-\d{2}$/.test(get('m') ?? '') ? get('m')! : today.slice(0, 7)
  const view = get('view') === 'month' || get('view') === 'list' ? get('view')! : undefined
  const includeClosed = get('closed') === '1'
  const showGoogle = get('google') !== '0'
  const grid = useMemo(() => monthGrid(month), [month])
  const query = useMemo(() => ({ from: grid.start, to: grid.end, includeClosed: includeClosed || undefined }), [grid, includeClosed])
  const { data, isLoading, isFetching, error } = useAgenda(query)
  const entries = useMemo(() => {
    const filtered = data && !showGoogle ? { ...data, events: [] } : data
    return byDay(filtered, grid.days)
  }, [data, showGoogle, grid.days])

  const monthOrders = (data?.orders ?? []).filter((o) => o.order.eventDate?.startsWith(month))
  const confirmed = monthOrders.filter(isConfirmed).length
  const pending = monthOrders.length - confirmed
  const upcoming = monthOrders.filter((o) => (o.order.eventDate ?? '') >= today && o.order.status !== 'completed').length
  const calendarUrl = data?.google.connected ? `https://calendar.google.com/calendar/r/month/${month.replace('-', '/')}/1` : null

  const viewToggle = (v: 'month' | 'list', label: string, Icon: typeof List, className?: string) => (
    <button
      onClick={() => set({ view: v })}
      className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold', (view ?? '') === v ? 'bg-cacau text-acucar' : 'text-cacau/70 hover:bg-creme', className)}
      aria-pressed={view === v}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
    </button>
  )

  return (
    <>
      <PageHeader
        title="Agenda"
        description="O trabalho marcado: cada encomenda no dia do evento, junto com o que está no Google Calendar da loja."
        actions={calendarUrl && (
          <a href={calendarUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-lg border border-linha bg-white px-4 text-sm font-semibold text-cacau hover:bg-creme">
            <ExternalLink className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">Abrir no</span> Google Calendar
          </a>
        )}
      />

      {data && <GoogleNotice agenda={data} />}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button variant="secondary" size="icon" onClick={() => set({ m: shiftMonth(month, -1) })} aria-label="Mês anterior"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="secondary" size="icon" onClick={() => set({ m: shiftMonth(month, 1) })} aria-label="Mês seguinte"><ChevronRight className="h-4 w-4" /></Button>
          <h2 className="ml-2 text-lg font-bold capitalize text-cacau">{monthTitle.format(parseDay(`${month}-01`))}</h2>
          {month !== today.slice(0, 7) && <Button variant="ghost" size="sm" className="ml-1" onClick={() => set({ m: undefined })}>Hoje</Button>}
          {isFetching && !isLoading && <span className="ml-2 h-2 w-2 animate-pulse rounded-full bg-po-fundo" aria-label="A atualizar" />}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 text-xs text-cacau/70">
            <Switch checked={showGoogle} onChange={(v) => set({ google: v ? undefined : '0' })} label="Google Calendar" />
            <Switch checked={includeClosed} onChange={(v) => set({ closed: v ? '1' : undefined })} label="Canceladas" />
          </div>
          <div className="inline-flex overflow-hidden rounded-lg border border-linha bg-white">
            {/* Without an explicit choice: list on phones, month grid from md up. */}
            {view === undefined ? (
              <>
                <button onClick={() => set({ view: 'month' })} className="hidden items-center gap-1.5 bg-cacau px-3 py-1.5 text-xs font-semibold text-acucar md:inline-flex"><LayoutGrid className="h-3.5 w-3.5" aria-hidden /> Mês</button>
                <button onClick={() => set({ view: 'month' })} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cacau/70 hover:bg-creme md:hidden"><LayoutGrid className="h-3.5 w-3.5" aria-hidden /> Mês</button>
                <button onClick={() => set({ view: 'list' })} className="inline-flex items-center gap-1.5 bg-cacau px-3 py-1.5 text-xs font-semibold text-acucar md:bg-transparent md:text-cacau/70 md:hover:bg-creme"><List className="h-3.5 w-3.5" aria-hidden /> Lista</button>
              </>
            ) : (
              <>
                {viewToggle('month', 'Mês', LayoutGrid)}
                {viewToggle('list', 'Lista', List)}
              </>
            )}
          </div>
        </div>
      </div>

      {data && (
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <Badge className="bg-[#dcebdc] text-[#245524]">{confirmed} confirmada(s)</Badge>
          <Badge className="bg-po text-cacau">{pending} por confirmar</Badge>
          <Badge className="bg-white text-cacau/70 ring-1 ring-linha">{upcoming} por fazer este mês</Badge>
        </div>
      )}

      {error ? (
        <p className="text-sm text-[#b4534b]">{apiErrorMessage(error)}</p>
      ) : isLoading || !data ? (
        <Skeleton className="h-[480px] w-full" />
      ) : (
        <>
          <div className={cn(view === 'list' ? 'hidden' : view === 'month' ? 'block' : 'hidden md:block', 'overflow-x-auto')}>
            <div className="min-w-[640px]"><MonthView days={grid.days} month={month} today={data.today} entries={entries} /></div>
          </div>
          <div className={cn(view === 'month' ? 'hidden' : view === 'list' ? 'block' : 'md:hidden')}>
            <ListView days={grid.days.filter((d) => d >= grid.first && d <= grid.last)} today={data.today} entries={entries} />
          </div>
        </>
      )}
    </>
  )
}

export default function AgendaRoute() {
  return (
    <Suspense>
      <AgendaPage />
    </Suspense>
  )
}
