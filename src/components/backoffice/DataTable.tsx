'use client'

import { useMemo } from 'react'
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface Pagination {
  page: number
  limit: number
  total: number
  onPageChange: (page: number) => void
}

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[]
  data: T[] | undefined
  loading?: boolean
  /** Shown while a refetch is in flight over existing data. */
  refreshing?: boolean
  error?: string | null
  pagination?: Pagination
  emptyTitle?: string
  emptyDescription?: string
  onRowClick?: (row: T) => void
  rowClassName?: (row: T) => string | undefined
}

/**
 * Server-paginated table. Sorting/filtering are the caller's job (they map to API query params);
 * this only renders rows, the loading skeleton, the empty state and the pager.
 */
export default function DataTable<T>({
  columns,
  data,
  loading = false,
  refreshing = false,
  error,
  pagination,
  emptyTitle = 'Sem resultados',
  emptyDescription,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  const rows = useMemo(() => data ?? [], [data])
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() })
  const pages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1

  return (
    <div className="overflow-hidden rounded-2xl border border-linha bg-white shadow-sm">
      <Table className={cn(refreshing && 'opacity-60 transition-opacity')}>
        <THead>
          {table.getHeaderGroups().map((hg) => (
            <TR key={hg.id}>
              {hg.headers.map((h) => (
                <TH key={h.id} style={{ width: h.getSize() !== 150 ? h.getSize() : undefined }}>
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </TH>
              ))}
            </TR>
          ))}
        </THead>
        <TBody>
          {loading && !data &&
            Array.from({ length: 6 }).map((_, i) => (
              <TR key={`s${i}`}>
                {columns.map((_, j) => (
                  <TD key={j}>
                    <Skeleton className="h-4 w-full max-w-40" />
                  </TD>
                ))}
              </TR>
            ))}
          {!loading && error && (
            <TR>
              <TD colSpan={columns.length} className="py-10 text-center text-sm text-[#b4534b]">
                {error}
              </TD>
            </TR>
          )}
          {!loading && !error && data && data.length === 0 && (
            <TR>
              <TD colSpan={columns.length} className="py-14">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Inbox className="h-8 w-8 text-po-fundo/60" aria-hidden />
                  <p className="text-sm font-medium text-cacau">{emptyTitle}</p>
                  {emptyDescription && <p className="text-xs text-cacau/50">{emptyDescription}</p>}
                </div>
              </TD>
            </TR>
          )}
          {table.getRowModel().rows.map((row) => (
            <TR
              key={row.id}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
              className={cn(onRowClick && 'cursor-pointer hover:bg-creme/60', rowClassName?.(row.original))}
            >
              {row.getVisibleCells().map((cell) => (
                <TD key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TD>
              ))}
            </TR>
          ))}
        </TBody>
      </Table>

      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between gap-4 border-t border-linha px-4 py-3 text-sm text-cacau/60">
          <span>
            {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" disabled={pagination.page <= 1} onClick={() => pagination.onPageChange(pagination.page - 1)} aria-label="Página anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 tabular-nums">
              {pagination.page} / {pages}
            </span>
            <Button variant="ghost" size="icon" disabled={pagination.page >= pages} onClick={() => pagination.onPageChange(pagination.page + 1)} aria-label="Página seguinte">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
