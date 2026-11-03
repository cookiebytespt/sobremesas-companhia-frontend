'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/backoffice/Toaster'
import { apiErrorMessage } from '@/lib/api/errors'
import type { ContactsImportResult } from '@/lib/api/types'
import { useClientMutations } from '@/lib/backoffice/queries'

/**
 * "Importar do Google": a dry run first, so the numbers are on screen before anything is written.
 * Existing clients are linked (never rewritten); the rest become clients.
 */
export default function ImportContactsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast()
  const { importFromGoogle } = useClientMutations()
  const [onlyLabel, setOnlyLabel] = useState(false)
  const [preview, setPreview] = useState<ContactsImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setPreview(null); setError(null)
    importFromGoogle.mutateAsync({ onlyLabel, dryRun: true }).then(setPreview).catch((e) => setError(apiErrorMessage(e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onlyLabel])

  const run = async () => {
    try {
      const r = await importFromGoogle.mutateAsync({ onlyLabel, dryRun: false })
      toast.success(`${r.created} cliente(s) novo(s), ${r.linked} ligado(s) aos contactos existentes.`)
      onClose()
    } catch (e) { toast.error(apiErrorMessage(e)) }
  }

  const busy = importFromGoogle.isPending
  const nothing = preview ? preview.created + preview.linked === 0 : true

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Importar dos Google Contacts"
      description="Os contactos da conta Google ligada passam a clientes. Quem já é cliente (mesmo e-mail, ou mesmo telemóvel) fica apenas ligado ao seu contacto — nada é reescrito."
      footer={<><Button variant="secondary" onClick={onClose} disabled={busy}>Cancelar</Button><Button onClick={run} loading={busy && preview != null} disabled={busy || nothing}>Importar</Button></>}
    >
      <div className="space-y-4">
        <Switch checked={onlyLabel} onChange={setOnlyLabel} label="Só a etiqueta “Sobremesas — clientes”" description="Desligado: todos os contactos da conta com e-mail ou telemóvel." />
        {error && <p className="text-sm text-[#b4534b]">{error}</p>}
        {!error && !preview && <p className="text-sm text-cacau/60">A contar…</p>}
        {preview && (
          <dl className="grid grid-cols-2 gap-3 rounded-xl bg-creme p-4 text-sm sm:grid-cols-4">
            <div><dt className="text-cacau/50">Contactos</dt><dd className="font-display text-xl text-cacau">{preview.total}</dd></div>
            <div><dt className="text-cacau/50">Clientes novos</dt><dd className="font-display text-xl text-cacau">{preview.created}</dd></div>
            <div><dt className="text-cacau/50">A ligar</dt><dd className="font-display text-xl text-cacau">{preview.linked}</dd></div>
            <div><dt className="text-cacau/50">Já ligados / sem dados</dt><dd className="font-display text-xl text-cacau">{preview.alreadyLinked} / {preview.skipped}</dd></div>
          </dl>
        )}
        {preview && nothing && <p className="text-sm text-cacau/60">Nada para importar.</p>}
      </div>
    </Modal>
  )
}
