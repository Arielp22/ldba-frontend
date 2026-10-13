import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'

interface PaginationProps {
  /** Página actual (1-indexed). */
  page: number
  /** Tamaño de página. */
  pageSize: number
  /** Total de items en el backend. */
  total: number
  /** Callback cuando cambia la página. */
  onPageChange: (page: number) => void
  /** Deshabilitar mientras carga. */
  disabled?: boolean
}

/**
 * Paginación simple con "X-Y de Z".
 * Calcula el total de páginas y muestra los botones Anterior / Siguiente.
 */
export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <p className="text-sm text-muted-foreground">
        {total === 0 ? (
          'Sin resultados'
        ) : (
          <>
            Mostrando <span className="font-medium">{from}</span>–
            <span className="font-medium">{to}</span> de{' '}
            <span className="font-medium">{total}</span>
          </>
        )}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          Página {page} de {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
