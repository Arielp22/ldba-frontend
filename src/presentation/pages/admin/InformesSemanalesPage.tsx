import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { BarChart3, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

import { useInformeFinancieroStore } from '@/presentation/store/informe-financiero.store'
import { useAuthStore } from '@/presentation/store/auth.store'

import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
import { Label } from '@/presentation/components/ui/label'
import { Badge } from '@/presentation/components/ui/badge'
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
  InformeFinancieroSemanal,
  InformeEstado,
} from '@/domain/entities/informe-financiero.entity'
import { formatDate, formatMoney } from '@/presentation/utils/formatters'

// ─── Schema ───────────────────────────────────────────────────────────────────

const informeSchema = z.object({
  numero_semana: z.coerce.number().int().min(1).max(53),
  anio: z.coerce.number().int().min(2000).max(2100),
  fecha_semana: z.string().min(1, 'Requerido'),
  cerveza: z.coerce.number().min(0).optional(),
  boleteria: z.coerce.number().min(0).optional(),
  multas: z.coerce.number().min(0).optional(),
  otros_ingresos: z.coerce.number().min(0).optional(),
  egresos: z.coerce.number().min(0).optional(),
  estado: z.enum(['borrador', 'presentado', 'aprobado']),
  observaciones: z.string().optional(),
})

type InformeForm = z.infer<typeof informeSchema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADOS: {
  value: InformeEstado
  label: string
  variant: 'default' | 'secondary' | 'outline'
}[] = [
  { value: 'borrador', label: 'Borrador', variant: 'outline' },
  { value: 'presentado', label: 'Presentado', variant: 'secondary' },
  { value: 'aprobado', label: 'Aprobado', variant: 'default' },
]

function estadoVariant(estado: InformeEstado) {
  return ESTADOS.find((e) => e.value === estado)?.variant ?? 'outline'
}

function estadoLabel(estado: InformeEstado) {
  return ESTADOS.find((e) => e.value === estado)?.label ?? estado
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function InformesSemanalesPage() {
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
    filterEstado,
    filterAnio,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setSearch,
    setFilterEstado,
    setFilterAnio,
    create,
    update,
    remove,
    clearError,
  } = useInformeFinancieroStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<InformeFinancieroSemanal | null>(null)
  const [deleting, setDeleting] = useState<InformeFinancieroSemanal | null>(
    null,
  )

  const form = useForm<InformeForm>({
    resolver: zodResolver(informeSchema),
    defaultValues: {
      numero_semana: 1,
      anio: new Date().getFullYear(),
      fecha_semana: '',
      cerveza: 0,
      boleteria: 0,
      multas: 0,
      otros_ingresos: 0,
      egresos: 0,
      estado: 'borrador',
      observaciones: '',
    },
  })

  // Resumen de semana actual
  const totalSemana =
    (Number(form.watch('cerveza') ?? 0) +
      Number(form.watch('boleteria') ?? 0) +
      Number(form.watch('multas') ?? 0) +
      Number(form.watch('otros_ingresos') ?? 0)) -
    Number(form.watch('egresos') ?? 0)

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditing(null)
    form.reset({
      numero_semana: 1,
      anio: new Date().getFullYear(),
      fecha_semana: new Date().toISOString().slice(0, 10),
      cerveza: 0,
      boleteria: 0,
      multas: 0,
      otros_ingresos: 0,
      egresos: 0,
      estado: 'borrador',
      observaciones: '',
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(i: InformeFinancieroSemanal) {
    setEditing(i)
    form.reset({
      numero_semana: i.numero_semana,
      anio: i.anio,
      fecha_semana: i.fecha_semana,
      cerveza: Number(i.cerveza),
      boleteria: Number(i.boleteria),
      multas: Number(i.multas),
      otros_ingresos: Number(i.otros_ingresos),
      egresos: Number(i.egresos),
      estado: i.estado,
      observaciones: i.observaciones ?? '',
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: InformeForm) {
    try {
      if (editing) {
        await update(editing.id, {
          cerveza: data.cerveza,
          boleteria: data.boleteria,
          multas: data.multas,
          otros_ingresos: data.otros_ingresos,
          egresos: data.egresos,
          estado: data.estado,
          observaciones: data.observaciones || undefined,
        })
      } else {
        await create({
          numero_semana: data.numero_semana,
          anio: data.anio,
          fecha_semana: data.fecha_semana,
          cerveza: data.cerveza,
          boleteria: data.boleteria,
          multas: data.multas,
          otros_ingresos: data.otros_ingresos,
          egresos: data.egresos,
          estado: data.estado,
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

  const columns: Column<InformeFinancieroSemanal>[] = [
    {
      key: 'semana',
      header: 'Semana',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col text-sm">
            <span className="font-medium">
              S{row.numero_semana} / {row.anio}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(row.fecha_semana)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'ingresos',
      header: 'Desglose',
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span>🍺 {formatMoney(row.cerveza)}</span>
          <span>🎫 {formatMoney(row.boleteria)}</span>
          <span>💰 {formatMoney(row.multas)}</span>
        </div>
      ),
    },
    {
      key: 'total_ingresos',
      header: 'Total ingresos',
      cell: (row) => (
        <span className="font-mono text-sm text-green-600">
          {formatMoney(row.total_ingresos)}
        </span>
      ),
    },
    {
      key: 'egresos',
      header: 'Egresos',
      cell: (row) => (
        <span className="font-mono text-sm text-red-600">
          {formatMoney(row.egresos)}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      cell: (row) => {
        const balance = Number(row.balance)
        return (
          <span
            className={`font-mono font-bold ${
              balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatMoney(row.balance)}
          </span>
        )
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => (
        <Badge variant={estadoVariant(row.estado)}>
          {estadoLabel(row.estado)}
        </Badge>
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
          <h1 className="text-2xl font-bold tracking-tight">
            Informes semanales
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen financiero semanal de la liga.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo informe
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        <Input
          placeholder="Buscar…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-xs"
        />
        <Select
          value={filterEstado ?? 'all'}
          onValueChange={(v) => setFilterEstado(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {ESTADOS.map((e) => (
              <SelectItem key={e.value} value={e.value}>
                {e.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Año"
          value={filterAnio ?? ''}
          onChange={(e) =>
            setFilterAnio(e.target.value ? Number(e.target.value) : undefined)
          }
          className="md:max-w-[120px]"
        />
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
        emptyMessage="No hay informes registrados."
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar informe' : 'Nuevo informe semanal'}
            </DialogTitle>
            <DialogDescription>
              Resumen de ingresos y egresos de la semana.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="numero_semana">Nº semana *</Label>
                <Input
                  id="numero_semana"
                  type="number"
                  min={1}
                  max={53}
                  disabled={!!editing}
                  {...form.register('numero_semana')}
                />
                {form.formState.errors.numero_semana && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.numero_semana.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="anio">Año *</Label>
                <Input
                  id="anio"
                  type="number"
                  disabled={!!editing}
                  {...form.register('anio')}
                />
                {form.formState.errors.anio && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.anio.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="fecha_semana">Fecha sábado *</Label>
                <Input
                  id="fecha_semana"
                  type="date"
                  {...form.register('fecha_semana')}
                />
                {form.formState.errors.fecha_semana && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.fecha_semana.message}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-md border bg-muted/40 p-3 space-y-3">
              <p className="text-sm font-medium">Ingresos</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="cerveza">🍺 Cerveza</Label>
                  <Input
                    id="cerveza"
                    type="number"
                    step="0.01"
                    min={0}
                    {...form.register('cerveza')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="boleteria">🎫 Boletería</Label>
                  <Input
                    id="boleteria"
                    type="number"
                    step="0.01"
                    min={0}
                    {...form.register('boleteria')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="multas">💰 Multas</Label>
                  <Input
                    id="multas"
                    type="number"
                    step="0.01"
                    min={0}
                    {...form.register('multas')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="otros_ingresos">➕ Otros</Label>
                  <Input
                    id="otros_ingresos"
                    type="number"
                    step="0.01"
                    min={0}
                    {...form.register('otros_ingresos')}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="egresos">➖ Egresos</Label>
              <Input
                id="egresos"
                type="number"
                step="0.01"
                min={0}
                {...form.register('egresos')}
              />
            </div>

            {/* Preview del balance */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Balance calculado</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold font-mono ${
                    totalSemana >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatMoney(totalSemana)}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-1">
              <Label>Estado</Label>
              <Select
                value={form.watch('estado')}
                onValueChange={(v) =>
                  form.setValue('estado', v as InformeEstado)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="obs-inf">Observaciones</Label>
              <Textarea
                id="obs-inf"
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
                {editing ? 'Guardar cambios' : 'Crear informe'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar informe"
        description={
          deleting
            ? `¿Eliminar el informe S${deleting.numero_semana}/${deleting.anio}?`
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
