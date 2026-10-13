import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table'
import { Skeleton } from '@/presentation/components/ui/skeleton'

export interface Column<T> {
  /** Clave única de la columna (usada como key). */
  key: string
  /** Encabezado mostrado en el thead. */
  header: ReactNode
  /** Cómo renderizar la celda para una fila. */
  cell: (row: T) => ReactNode
  /** Clases CSS opcionales para la columna. */
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  /** Función que devuelve una key única para cada fila. */
  rowKey: (row: T) => string | number
  /** Mostrar skeleton mientras carga. */
  isLoading?: boolean
  /** Número de filas del skeleton. */
  skeletonRows?: number
  /** Mensaje cuando no hay datos. */
  emptyMessage?: string
  /** Callback al hacer clic en una fila (opcional). */
  onRowClick?: (row: T) => void
}

/**
 * Tabla de datos genérica y tipada.
 * Reutilizable en todos los módulos CRUD.
 */
export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  skeletonRows = 5,
  emptyMessage = 'Sin resultados.',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'cursor-pointer' : undefined}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className={col.className}>
                    {col.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
