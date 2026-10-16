'use client'

import { Button, type ButtonVariant } from '@/components/ui/button'
import { Modal } from '@/components/ui/dialog'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  variant = 'primary',
  loading = false,
  confirmDisabled = false,
  size = 'sm',
  children,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  variant?: ButtonVariant
  loading?: boolean
  /** Keeps the confirm button off until a condition is met (a typed name, a loaded preview). */
  confirmDisabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  children?: React.ReactNode
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading} disabled={confirmDisabled}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children ?? <p className="text-sm text-cacau/70">Esta ação não pode ser anulada.</p>}
    </Modal>
  )
}
