'use client'

import { useCallback, useRef, useState } from 'react'

/**
 * Native HTML5 drag-and-drop reordering for a list of ids — no library, works for
 * table rows and grid cards alike. Spread `handleProps(id)` on the grip element and
 * `itemProps(id)` on the row/card; `onReorder` receives the new id order on drop.
 * The handle also accepts ArrowUp/ArrowDown for keyboard users.
 */
export function useDragReorder(ids: string[], onReorder: (ids: string[]) => void) {
  const [dragging, setDragging] = useState<string | null>(null)
  const [over, setOver] = useState<{ id: string; after: boolean } | null>(null)
  const armed = useRef(false) // a handle is being pressed — only then may the item start a drag
  // The drag events can arrive faster than React re-renders, so the handlers read refs and
  // the state is only there to paint the row being dragged and the drop line.
  const draggingRef = useRef<string | null>(null)
  const overRef = useRef<{ id: string; after: boolean } | null>(null)
  const dropped = useRef(false)

  const reset = useCallback(() => {
    draggingRef.current = null
    overRef.current = null
    dropped.current = false
    armed.current = false
    setDragging(null)
    setOver(null)
  }, [])

  const move = useCallback(
    (id: string, to: number) => {
      const from = ids.indexOf(id)
      if (from < 0 || to < 0 || to >= ids.length || from === to) return
      const next = [...ids]
      next.splice(from, 1)
      next.splice(to, 0, id)
      onReorder(next)
    },
    [ids, onReorder]
  )

  /** Applies the pending drag using the row last hovered. */
  const commit = useCallback(() => {
    const dragged = draggingRef.current
    const target = overRef.current
    if (!dragged || !target || target.id === dragged) return
    const to = ids.indexOf(target.id) + (target.after ? 1 : 0)
    const from = ids.indexOf(dragged)
    move(dragged, to > from ? to - 1 : to)
  }, [ids, move])

  const handleProps = useCallback(
    (id: string) => ({
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': 'Arrastar para reordenar',
    title: 'Arrastar (ou ↑/↓ no teclado)',
    onMouseDown: () => {
      armed.current = true
    },
    onMouseUp: () => {
      armed.current = false
    },
      onKeyDown: (e: React.KeyboardEvent) => {
        const i = ids.indexOf(id)
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          move(id, i - 1)
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          move(id, i + 1)
        }
      },
    }),
    [ids, move]
  )

  const itemProps = useCallback(
    (id: string) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        if (!armed.current) {
          e.preventDefault()
          return
        }
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', id)
        draggingRef.current = id
        setDragging(id)
      },
      onDragOver: (e: React.DragEvent) => {
        const from = draggingRef.current
        if (!from || from === id) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        const rect = e.currentTarget.getBoundingClientRect()
        // Rows: compare vertically; grid cards: whichever axis is bigger.
        const vertical = rect.height >= rect.width || Math.abs(e.clientY - (rect.top + rect.height / 2)) > Math.abs(e.clientX - (rect.left + rect.width / 2))
        const after = vertical ? e.clientY > rect.top + rect.height / 2 : e.clientX > rect.left + rect.width / 2
        overRef.current = { id, after }
        setOver({ id, after })
      },
      onDragLeave: () => {
        if (overRef.current?.id === id) overRef.current = null
        setOver((o) => (o?.id === id ? null : o))
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault()
        if (!draggingRef.current || draggingRef.current === id) return
        overRef.current = overRef.current ?? { id, after: false }
        dropped.current = true
        commit()
        reset()
      },
      // Chromium swallows `drop` when the pointer is released over some controls, so the
      // drag is also committed here — `dragend` always fires, and `dragleave` clears the
      // target when the pointer left the list, which is what makes a cancelled drag a no-op.
      onDragEnd: () => {
        if (!dropped.current) commit()
        reset()
      },
    }),
    [commit, reset]
  )

  return { dragging, over, handleProps, itemProps, move }
}
