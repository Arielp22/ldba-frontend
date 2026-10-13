import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  Pencil,
  Plus,
  TrendingDown,
  TrendingUp,
  Trash2,
  Wallet,
} from 'lucide-react'

import { useMovimientoFinancieroStore } from '@/presentation/store/movimiento-financiero.store'
import { useAuthStore } from '@/presentation/store/auth.store'

import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Label } from '@/presentation/components/ui/label'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  Card,
  CardContent,  
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import DataTable, { type Column } from '@/presentation/components/shared/DataTable'
import Pagination from '@/presentation/components/shared/Pagination'
import ConfirmDialog from '@/presentation/components/shared/ConfirmDialog'
import type {
  MovimientoFinanciero,
  MovimientoTipo,
} from '@/domain/entities/movimiento-financiero.entity'
import { formatDate, formatMoney } from '@/presentation/utils/formatters'

// ─── Schema ───────────────────────────────────────────────────────────────────

const movimientoSchema = z.object({
  tipo: z.enum(['ingreso', 'egreso']),
  concepto: z.string().min(3, 'Mínimo 3 caracteres').max(255),
  fecha: z.string().min(1, 'Requerido'),
  valor: z.coerce.number().positive('Debe ser mayor a 0'),
  responsable: z.string().max(150).optional(),
  comprobante: z.string().max(255).optional(),
  observaciones: z.string().optional(),
})

type MovimientoForm = z.infer<typeof movimientoSchema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPOS: { value: MovimientoTipo; label: string }[] = [
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'egreso', label: 'Egreso' },
]

// ─── Widget de resumen ────────────────────────────────────────────────────────

function ResumenWidgets() {
  const resumen = useMovimientoFinancieroStore((s) => s.resumen)
  const isLoading = useMovimientoFinancieroStore((s) => s.isLoadingResumen)

  if (isLoading && !resumen) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    )
  }

  if (!resumen) return null

  const ingresos = Number(resumen.total_ingresos)
  const egresos = Number(resumen.total_egresos)
  const balance = Number(resumen.balance)
  const positivo = balance >= 0

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatMoney(ingresos)}
          </div>
          <p className="text-xs text-muted-foreground">
            {resumen.cantidad_movimientos} movimientos totales
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Egresos</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatMoney(egresos)}
          </div>
          <p className="text-xs text-muted-foreground">Total de gastos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Balance</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              positivo ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatMoney(balance)}
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {positivo ? (
              <>
                <TrendingUp className="h-3 w-3" /> Superávit
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3" /> Déficit
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function MovimientosFinancierosPage() {
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user &&
    (user.is_superuser || user.groups.includes('Comision Financiera'))

  const {
    items,
    total,
    page,
    pageSize,
    search,
    filterTipo,
    filterFecha,
    isLoading,
    isSaving,
    error,
    load,
    loadResumen,
    setPage,
    setSearch,
    setFilterTipo,
    setFilterFecha,
    create,
    update,
    remove,
    clearError,
  } = useMovimientoFinancieroStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<MovimientoFinanciero | null>(null)
  const [deleting, setDeleting] = useState<MovimientoFinanciero | null>(null)

  const form = useForm<MovimientoForm>({
    resolver: zodResolver(movimientoSchema),
    defaultValues: {
      tipo: 'ingreso',
      concepto: '',
      fecha: new Date().toISOString().slice(0, 10),
      valor: 0,
      responsable: '',
      comprobante: '',
      observaciones: '',
    },
  })

  useEffect(() => {
    load()
    loadResumen()
  }, [load, loadResumen])

  function openCreate() {
    setEditing(null)
    form.reset({
      tipo: 'ingreso',
      concepto: '',
      fecha: new Date().toISOString().slice(0, 10),
      valor: 0,
      responsable: '',
      comprobante: '',
      observaciones: '',
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(m: MovimientoFinanciero) {
    setEditing(m)
    form.reset({
      tipo: m.tipo,
      concepto: m.concepto,
      fecha: m.fecha,
      valor: Number(m.valor),
      responsable: m.responsable ?? '',
      comprobante: m.comprobante ?? '',
      observaciones: m.observaciones ?? '',
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: MovimientoForm) {
    try {
      if (editing) {
        await update(editing.id, {
          tipo: data.tipo,
          concepto: data.concepto,
          fecha: data.fecha,
          valor: data.valor,
          responsable: data.responsable || undefined,
          comprobante: data.comprobante || undefined,
          observaciones: data.observaciones || undefined,
        })
      } else {
        await create({
          tipo: data.tipo,
          concepto: data.concepto,
          fecha: data.fecha,
          valor: data.valor,
          responsable: data.responsable || undefined,
          comprobante: data.comprobante || undefined,
          observaciones: data.observaciones || undefined,
        })
      }
      setDialogOpen(false)
    } catch {
      // Error ya está en el store
    }
  }

  async function onDelete() {
    if (!deleting) return
    try {
      await remove(deleting.id)
      setDeleting(null)
    } catch {
      // Error ya en el store
    }
  }

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<MovimientoFinanciero>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      cell: (row) => (
        <span className="text-sm">{formatDate(row.fecha)}</span>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      cell: (row) => (
        <Badge
          variant={row.tipo === 'ingreso' ? 'default' : 'destructive'}
          className={
            row.tipo === 'ingreso'
              ? 'bg-green-600 hover:bg-green-700'
              : ''
          }
        >
          {row.tipo_display}
        </Badge>
      ),
    },
    {
      key: 'concepto',
      header: 'Concepto',
      cell: (row) => (
        <div className="flex flex-col text-sm">
          <span className="font-medium line-clamp-1">{row.concepto}</span>
          {row.responsable && (
            <span className="text-xs text-muted-foreground">
              {row.responsable}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'valor',
      header: 'Valor',
      cell: (row) => (
        <span
          className={`font-mono font-medium ${
            row.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {row.tipo === 'ingreso' ? '+' : '-'}
          {formatMoney(row.valor)}
        </span>
      ),
    },
    {
      key: 'acciones',
      header: <span className="text-right">Acciones</span>,
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => openEdit(row)}
            disabled={!canWrite}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDeleting(row)}
            disabled={!canWrite}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ]

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Finanzas</h1>
          <p className="text-sm text-muted-foreground">
            Ingresos y egresos de la liga.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo movimiento
        </Button>
      </div>

      {/* Widgets de resumen */}
      <ResumenWidgets />

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        <Input
          placeholder="Buscar por concepto…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-xs"
        />
        <Select
          value={filterTipo ?? 'all'}
          onValueChange={(v) => setFilterTipo(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {TIPOS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filterFecha ?? ''}
          onChange={(e) => setFilterFecha(e.target.value || undefined)}
          className="md:max-w-[180px]"
        />
        {filterFecha && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilterFecha(undefined)}
          >
            Limpiar fecha
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No hay movimientos registrados."
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        disabled={isLoading}
      />

      {/* Dialog crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar movimiento' : 'Nuevo movimiento'}
            </DialogTitle>
            <DialogDescription>
              Registra un ingreso o egreso financiero.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select
                  value={form.watch('tipo')}
                  onValueChange={(v) =>
                    form.setValue('tipo', v as MovimientoTipo)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input
                  id="fecha"
                  type="date"
                  {...form.register('fecha')}
                />
                {form.formState.errors.fecha && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.fecha.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="concepto">Concepto *</Label>
              <Input
                id="concepto"
                placeholder="Venta de cerveza jornada 1"
                {...form.register('concepto')}
              />
              {form.formState.errors.concepto && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.concepto.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="valor">Valor (USD) *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...form.register('valor')}
                />
                {form.formState.errors.valor && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.valor.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="responsable">Responsable</Label>
                <Input id="responsable" {...form.register('responsable')} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="comprobante">Comprobante</Label>
              <Input
                id="comprobante"
                placeholder="fact-001.pdf"
                {...form.register('comprobante')}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="obs-mov">Observaciones</Label>
              <Textarea
                id="obs-mov"
                rows={2}
                {...form.register('observaciones')}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? 'Guardar cambios' : 'Crear movimiento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar movimiento"
        description={
          deleting
            ? `¿Eliminar "${deleting.concepto}" (${formatMoney(deleting.valor)})?`
            : ''
        }
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={onDelete}
        isLoading={isSaving}
      />
    </div>
  )
}
