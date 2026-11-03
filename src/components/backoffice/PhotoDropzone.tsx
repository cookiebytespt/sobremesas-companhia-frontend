'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { backofficeApi } from '@/lib/api/backoffice'
import { apiErrorMessage } from '@/lib/api/errors'
import type { Upload, UploadKind } from '@/lib/api/types'
import { cn } from '@/lib/utils'

const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif'

/**
 * Drag-drop / click-to-pick photos. Each file goes to `POST /uploads` straight away and the
 * resulting `Upload` is handed back; failures are listed per file and never block the others.
 */
export default function PhotoDropzone({
  kind,
  onUploaded,
  multiple = true,
  compact = false,
  label = 'Arraste fotografias para aqui ou clique para escolher',
}: {
  kind: UploadKind
  onUploaded: (uploads: Upload[]) => void
  multiple?: boolean
  compact?: boolean
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [over, setOver] = useState(false)

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name))
    if (list.length === 0) return
    setErrors([])
    setPending((n) => n + list.length)
    const done: Upload[] = []
    // Three at a time: enough to feel quick, not enough to swamp the API's image processing.
    const queue = [...list]
    const worker = async () => {
      for (let file = queue.shift(); file; file = queue.shift()) {
        try {
          done.push(await backofficeApi.uploads.upload(file, kind))
        } catch (err) {
          setErrors((e) => [...e, `${file!.name}: ${apiErrorMessage(err)}`])
        } finally {
          setPending((n) => n - 1)
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(3, queue.length) }, worker))
    if (done.length) onUploaded(done)
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); void addFiles(e.dataTransfer.files) }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center text-sm transition-colors',
          compact ? 'px-4 py-5' : 'px-6 py-10',
          over ? 'border-cacau bg-po/40' : 'border-linha bg-white hover:border-po-fundo hover:bg-creme/60'
        )}
      >
        {pending > 0 ? <Loader2 className="h-6 w-6 animate-spin text-cacau/50" aria-hidden /> : <ImagePlus className="h-6 w-6 text-po-fundo" aria-hidden />}
        <span className="text-cacau/70">{pending > 0 ? `A enviar ${pending} fotografia${pending === 1 ? '' : 's'}…` : label}</span>
        {!compact && <span className="text-xs text-cacau/40">JPEG, PNG, WebP ou HEIC · até 15 MB cada · as fotografias são redimensionadas e os dados de localização removidos</span>}
        <input ref={inputRef} type="file" accept={ACCEPT} multiple={multiple} className="hidden" onChange={(e) => { if (e.target.files) void addFiles(e.target.files); e.target.value = '' }} />
      </div>
      {errors.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-[#b4534b]">
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}
    </div>
  )
}
