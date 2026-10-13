import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle2,
  Eye,
  Loader2,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

import { useSesionStore } from '@/presentation/store/sesion.store'
import { useAuthStore } from '@/presentation/store/auth.store'

import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
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
import type {
  Sesion,
  SesionEstado,
  SesionTipo,
} from '@/domain/entities/sesion.entity'
import { formatDate } from '@/presentation/utils/formatters'

// ─── Schema ───────────────────────────────────────────────────────────────────

const sesionSchema = z.object({
  fecha: z.string().min(1, 'Requerido'),
  tipo: z.enum(['ordinaria', 'extraordinaria']),
  orden_del_dia: z.string().optional(),
  acta: z.string().optional(),
  estado: z.enum(['programada', 'en_curso', 'finalizada', 'cancelada']),
  observaciones: z.string().optional(),
})

type SesionForm = z.infer<typeof sesionSchema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPOS: { value: SesionTipo; label: string }[] = [
  { value: 'ordinaria', label: 'Ordinaria' },
  { value: 'extraordinaria', label: 'Extraordinaria' },
]

const ESTADOS: {
  value: SesionEstado
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}[] = [
  { value: 'programada', label: 'Programada', variant: 'outline' },
  { value: 'en_curso', label: 'En curso', variant: 'default' },
  { value: 'finalizada', label: 'Finalizada', variant: 'secondary' },
  { value: 'cancelada', label: 'Cancelada', variant: 'destructive' },
]

function estadoVariant(estado: SesionEstado) {
  return ESTADOS.find((e) => e.value === estado)?.variant ?? 'outline'
}

function estadoLabel(estado: SesionEstado) {
  return ESTADOS.find((e) => e.value === estado)?.label ?? estado
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function SesionesPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user &&
    (user.is_superuser || user.groups.includes('Comision Administrativa'))

  const {
    items,
    total,
    page,
    pageSize,
    search,
    filterTipo,
    filterEstado,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setSearch,
    setFilterTipo,
    setFilterEstado,
    create,
    update,
    remove,
    finalizar,
    clearError,
  } = useSesionStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Sesion | null>(null)
  const [deleting, setDeleting] = useState<Sesion | null>(null)

  const form = useForm<SesionForm>({
    resolver: zodResolver(sesionSchema),
    defaultValues: {
      fecha: new Date().toISOString().slice(0, 10),
      tipo: 'ordinaria',
      orden_del_dia: '',
      acta: '',
      estado: 'programada',
      observaciones: '',
    },
  })

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditing(null)
    form.reset({
      fecha: new Date().toISOString().slice(0, 10),
      tipo: 'ordinaria',
      orden_del_dia: '',
      acta: '',
      estado: 'programada',
      observaciones: '',
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(s: Sesion) {
    setEditing(s)
    form.reset({
      fecha: s.fecha,
      tipo: s.tipo,
      orden_del_dia: s.orden_del_dia ?? '',
      acta: s.acta ?? '',
      estado: s.estado,
      observaciones: s.observaciones ?? '',
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: SesionForm) {
    try {
      if (editing) {
        await update(editing.id, data)
      } else {
        await create(data)
      }
      setDialogOpen(false)
    } catch {
      // Error ya en el store
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

  async function onFinalizar(s: Sesion) {
    try {
      await finalizar(s.id)
    } catch {
      // Error ya en el store
    }
  }

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<Sesion>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatDate(row.fecha)}</span>
        </div>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      cell: (row) => (
        <Badge variant="outline">{row.tipo_display}</Badge>
      ),
    },
    {
      key: 'orden_dia',
      header: 'Orden del día',
      cell: (row) => (
        <span className="text-xs text-muted-foreground line-clamp-1">
          {row.orden_del_dia || '—'}
        </span>
      ),
    },
    {
      key: 'participantes',
      header: 'Participantes',
      cell: (row) => (
        <Badge variant="secondary">{row.participantes_count}</Badge>
      ),
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
            onClick={() => navigate(`/admin/sesiones/${row.id}`)}
            title="Ver detalle"
          >
            <Eye className="h-4 w-4 text-primary" />
          </Button>
          {row.estado !== 'finalizada' && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onFinalizar(row)}
              disabled={!canWrite || isSaving}
              title="Finalizar"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </Button>
          )}
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
          <h1 className="text-2xl font-bold tracking-tight">Sesiones</h1>
          <p className="text-sm text-muted-foreground">
            Sesiones de los martes: actas, orden del día y participantes.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva sesión
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
          value={filterTipo ?? 'all'}
          onValueChange={(v) => setFilterTipo(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="md:w-44">
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
        <Select
          value={filterEstado ?? 'all'}
          onValueChange={(v) => setFilterEstado(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="md:w-44">
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
        emptyMessage="No hay sesiones registradas."
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
              {editing ? 'Editar sesión' : 'Nueva sesión'}
            </DialogTitle>
            <DialogDescription>
              Sesiones de la liga. El acta se puede escribir al finalizar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input id="fecha" type="date" {...form.register('fecha')} />
              </div>
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select
                  value={form.watch('tipo')}
                  onValueChange={(v) => form.setValue('tipo', v as SesionTipo)}
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
                <Label>Estado</Label>
                <Select
                  value={form.watch('estado')}
                  onValueChange={(v) =>
                    form.setValue('estado', v as SesionEstado)
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
            </div>

            <div className="space-y-1">
              <Label htmlFor="orden_del_dia">Orden del día</Label>
              <Textarea
                id="orden_del_dia"
                rows={4}
                placeholder="1. Lectura del acta anterior&#10;2. Informe financiero&#10;3. ..."
                {...form.register('orden_del_dia')}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="acta">Acta</Label>
              <Textarea
                id="acta"
                rows={4}
                {...form.register('acta')}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="obs-ses">Observaciones</Label>
              <Textarea
                id="obs-ses"
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
                {editing ? 'Guardar cambios' : 'Crear sesión'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar sesión"
        description={
          deleting
            ? `¿Eliminar la sesión del ${formatDate(deleting.fecha)}? También se eliminarán sus participantes.`
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
