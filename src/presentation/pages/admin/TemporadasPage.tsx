import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

import { useTemporadaStore } from '@/presentation/store/temporada.store'
import { useAuthStore } from '@/presentation/store/auth.store'
import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Badge } from '@/presentation/components/ui/badge'
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
import type { Temporada, TemporadaEstado } from '@/domain/entities/temporada.entity'
import { formatDate } from '@/presentation/utils/formatters'

// ─── Schema ───────────────────────────────────────────────────────────────────

const temporadaSchema = z
  .object({
    nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100),
    anio: z.coerce
      .number()
      .int('Debe ser un entero')
      .min(2000, 'Año inválido')
      .max(2100, 'Año inválido'),
    fecha_inicio: z.string().min(1, 'Requerido'),
    fecha_fin: z.string().min(1, 'Requerido'),
    estado: z.enum(['planificada', 'en_curso', 'finalizada', 'cancelada']),
  })
  .refine(
    (data) => new Date(data.fecha_fin) > new Date(data.fecha_inicio),
    {
      message: 'La fecha de fin debe ser posterior a la de inicio',
      path: ['fecha_fin'],
    },
  )

type TemporadaForm = z.infer<typeof temporadaSchema>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADOS: { value: TemporadaEstado; label: string }[] = [
  { value: 'planificada', label: 'Planificada' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizada', label: 'Finalizada' },
  { value: 'cancelada', label: 'Cancelada' },
]

const ESTADO_VARIANT: Record<
  TemporadaEstado,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  planificada: 'outline',
  en_curso: 'default',
  finalizada: 'secondary',
  cancelada: 'destructive',
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function TemporadasPage() {
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user && (user.is_superuser || user.groups.includes('Comision Tecnica'))

  const {
    items,
    total,
    page,
    pageSize,
    search,
    filterEstado,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setSearch,
    setFilterEstado,
    create,
    update,
    remove,
    clearError,
  } = useTemporadaStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Temporada | null>(null)
  const [deleting, setDeleting] = useState<Temporada | null>(null)

  const form = useForm<TemporadaForm>({
    resolver: zodResolver(temporadaSchema),
    defaultValues: {
      nombre: '',
      anio: new Date().getFullYear(),
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'planificada',
    },
  })

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditing(null)
    form.reset({
      nombre: '',
      anio: new Date().getFullYear(),
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'planificada',
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(temp: Temporada) {
    setEditing(temp)
    form.reset({
      nombre: temp.nombre,
      anio: temp.anio,
      fecha_inicio: temp.fecha_inicio,
      fecha_fin: temp.fecha_fin,
      estado: temp.estado,
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: TemporadaForm) {
    try {
      if (editing) {
        await update(editing.id, data)
      } else {
        await create(data)
      }
      setDialogOpen(false)
    } catch {
      // El error ya está en el store
    }
  }

  async function onDelete() {
    if (!deleting) return
    try {
      await remove(deleting.id)
      setDeleting(null)
    } catch {
      // El error ya está en el store
    }
  }

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<Temporada>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      cell: (row) => <span className="font-medium">{row.nombre}</span>,
    },
    {
      key: 'anio',
      header: 'Año',
      cell: (row) => <span className="tabular-nums">{row.anio}</span>,
    },
    {
      key: 'fechas',
      header: 'Fechas',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.fecha_inicio)} → {formatDate(row.fecha_fin)}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => (
        <Badge variant={ESTADO_VARIANT[row.estado]}>
          {ESTADOS.find((e) => e.value === row.estado)?.label ?? row.estado}
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
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDeleting(row)}
            disabled={!canWrite}
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
          <h1 className="text-2xl font-bold tracking-tight">Temporadas</h1>
          <p className="text-sm text-muted-foreground">
            Campeonatos de la liga por año.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva temporada
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          placeholder="Buscar por nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-xs"
        />
        <Select
          value={filterEstado ?? 'all'}
          onValueChange={(v) => setFilterEstado(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="md:w-48">
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
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Tabla */}
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No hay temporadas registradas."
      />

      {/* Paginación */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        disabled={isLoading}
      />

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar temporada' : 'Nueva temporada'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualiza los datos de la temporada.'
                : 'Completa los datos para crear una nueva temporada.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Ej: Temporada 2025"
                {...form.register('nombre')}
              />
              {form.formState.errors.nombre && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.nombre.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="anio">Año</Label>
                <Input
                  id="anio"
                  type="number"
                  {...form.register('anio')}
                />
                {form.formState.errors.anio && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.anio.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={form.watch('estado')}
                  onValueChange={(v) =>
                    form.setValue('estado', v as TemporadaEstado)
                  }
                >
                  <SelectTrigger id="estado">
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fecha_inicio">Fecha inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  {...form.register('fecha_inicio')}
                />
                {form.formState.errors.fecha_inicio && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.fecha_inicio.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="fecha_fin">Fecha fin</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  {...form.register('fecha_fin')}
                />
                {form.formState.errors.fecha_fin && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.fecha_fin.message}
                  </p>
                )}
              </div>
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
                {editing ? 'Guardar cambios' : 'Crear temporada'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm eliminar */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar temporada"
        description={
          deleting
            ? `¿Seguro que quieres eliminar "${deleting.nombre}"? Se eliminarán también sus jornadas, partidos, etc.`
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
