import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'

import { useJugadorStore } from '@/presentation/store/jugador.store'
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
  Jugador,
  JugadorEstadoCalificacion,
} from '@/domain/entities/jugador.entity'
import { formatDate } from '@/presentation/utils/formatters'

// ─── Schema: crear/editar ─────────────────────────────────────────────────────

const jugadorSchema = z.object({
  nombres: z.string().min(2, 'Mínimo 2 caracteres').max(150),
  apellidos: z.string().min(2, 'Mínimo 2 caracteres').max(150),
  cedula: z
    .string()
    .min(5, 'Mínimo 5 caracteres')
    .max(20, 'Máximo 20 caracteres'),
  fecha_nacimiento: z.string().min(1, 'Requerido'),
  telefono: z.string().max(30).optional(),
  email: z.string().email('Email inválido').or(z.literal('')).optional(),
  direccion: z.string().max(255).optional(),
  numero_carnet: z.string().max(30).optional(),
  observaciones: z.string().optional(),
  activo: z.boolean(),
})

type JugadorForm = z.infer<typeof jugadorSchema>

// ─── Schema: calificar ────────────────────────────────────────────────────────

const calificarSchema = z.object({
  estado_calificacion: z.enum([
    'pendiente',
    'calificado',
    'rechazado',
    'inhabilitado',
  ]),
  observaciones: z.string().optional(),
})

type CalificarForm = z.infer<typeof calificarSchema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADOS: {
  value: JugadorEstadoCalificacion
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}[] = [
  { value: 'pendiente', label: 'Pendiente', variant: 'outline' },
  { value: 'calificado', label: 'Calificado', variant: 'default' },
  { value: 'rechazado', label: 'Rechazado', variant: 'destructive' },
  { value: 'inhabilitado', label: 'Inhabilitado', variant: 'secondary' },
]

function estadoVariant(estado: JugadorEstadoCalificacion) {
  return ESTADOS.find((e) => e.value === estado)?.variant ?? 'outline'
}

function estadoLabel(estado: JugadorEstadoCalificacion) {
  return ESTADOS.find((e) => e.value === estado)?.label ?? estado
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function JugadoresPage() {
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user &&
    (user.is_superuser || user.groups.includes('Comision Calificaciones'))

  const {
    items,
    total,
    page,
    pageSize,
    search,
    filterEstado,
    filterActivo,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setSearch,
    setFilterEstado,
    setFilterActivo,
    create,
    update,
    remove,
    calificar,
    clearError,
  } = useJugadorStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Jugador | null>(null)
  const [deleting, setDeleting] = useState<Jugador | null>(null)
  const [calificando, setCalificando] = useState<Jugador | null>(null)

  const form = useForm<JugadorForm>({
    resolver: zodResolver(jugadorSchema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      cedula: '',
      fecha_nacimiento: '',
      telefono: '',
      email: '',
      direccion: '',
      numero_carnet: '',
      observaciones: '',
      activo: true,
    },
  })

  const calificarForm = useForm<CalificarForm>({
    resolver: zodResolver(calificarSchema),
    defaultValues: { estado_calificacion: 'pendiente', observaciones: '' },
  })

  useEffect(() => {
    load()
  }, [load])

  // ─── Acciones ────────────────────────────────────────────────────────────────

  function openCreate() {
    setEditing(null)
    form.reset({
      nombres: '',
      apellidos: '',
      cedula: '',
      fecha_nacimiento: '',
      telefono: '',
      email: '',
      direccion: '',
      numero_carnet: '',
      observaciones: '',
      activo: true,
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(j: Jugador) {
    setEditing(j)
    form.reset({
      nombres: j.nombres,
      apellidos: j.apellidos,
      cedula: j.cedula,
      fecha_nacimiento: j.fecha_nacimiento,
      telefono: j.telefono ?? '',
      email: j.email ?? '',
      direccion: j.direccion ?? '',
      numero_carnet: j.numero_carnet ?? '',
      observaciones: j.observaciones ?? '',
      activo: j.activo,
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: JugadorForm) {
    try {
      if (editing) {
        await update(editing.id, {
          nombres: data.nombres,
          apellidos: data.apellidos,
          cedula: data.cedula,
          fecha_nacimiento: data.fecha_nacimiento,
          telefono: data.telefono || undefined,
          email: data.email || undefined,
          direccion: data.direccion || undefined,
          numero_carnet: data.numero_carnet || undefined,
          observaciones: data.observaciones || undefined,
          activo: data.activo,
        })
      } else {
        await create({
          nombres: data.nombres,
          apellidos: data.apellidos,
          cedula: data.cedula,
          fecha_nacimiento: data.fecha_nacimiento,
          telefono: data.telefono || undefined,
          email: data.email || undefined,
          direccion: data.direccion || undefined,
          numero_carnet: data.numero_carnet || undefined,
          observaciones: data.observaciones || undefined,
          activo: data.activo,
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
      // Error ya está en el store
    }
  }

  async function toggleActivo(row: Jugador) {
    try {
      await update(row.id, { activo: !row.activo })
    } catch {
      // Error ya está en el store
    }
  }

  function openCalificar(j: Jugador) {
    setCalificando(j)
    calificarForm.reset({
      estado_calificacion: j.estado_calificacion,
      observaciones: j.observaciones ?? '',
    })
    clearError()
  }

  async function onCalificar(data: CalificarForm) {
    if (!calificando) return
    try {
      await calificar(calificando.id, {
        estado_calificacion: data.estado_calificacion,
        observaciones: data.observaciones || undefined,
      })
      setCalificando(null)
    } catch {
      // Error ya está en el store
    }
  }

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<Jugador>[] = [
    {
      key: 'nombre',
      header: 'Jugador',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.apellidos}, {row.nombres}
          </span>
          <span className="text-xs text-muted-foreground">{row.cedula}</span>
        </div>
      ),
    },
    {
      key: 'fecha_nacimiento',
      header: 'Nacimiento',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.fecha_nacimiento)}
        </span>
      ),
    },
    {
      key: 'telefono',
      header: 'Contacto',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.telefono || row.email || '—'}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Calificación',
      cell: (row) => (
        <Badge variant={estadoVariant(row.estado_calificacion)}>
          {estadoLabel(row.estado_calificacion)}
        </Badge>
      ),
    },
    {
      key: 'activo',
      header: 'Activo',
      cell: (row) => (
        <button
          onClick={() => toggleActivo(row)}
          disabled={!canWrite || isSaving}
          className="disabled:cursor-not-allowed"
          title="Clic para cambiar estado"
        >
          <Badge variant={row.activo ? 'default' : 'secondary'}>
            {row.activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </button>
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
            onClick={() => openCalificar(row)}
            disabled={!canWrite}
            title="Calificar"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
          </Button>
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
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jugadores</h1>
          <p className="text-sm text-muted-foreground">
            Registro de jugadores de la liga y su estado de calificación.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo jugador
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        <Input
          placeholder="Buscar por nombre o cédula…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-sm"
        />
        <Select
          value={filterEstado ?? 'all'}
          onValueChange={(v) => setFilterEstado(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="Calificación" />
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
        <Select
          value={filterActivo === undefined ? 'all' : String(filterActivo)}
          onValueChange={(v) => {
            if (v === 'all') setFilterActivo(undefined)
            else setFilterActivo(v === 'true')
          }}
        >
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Activo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Activos</SelectItem>
            <SelectItem value="false">Inactivos</SelectItem>
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
        emptyMessage="No hay jugadores registrados."
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        disabled={isLoading}
      />

      {/* Dialog crear / editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar jugador' : 'Nuevo jugador'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualiza los datos del jugador.'
                : 'Completa los datos para registrar un nuevo jugador.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="nombres">Nombres *</Label>
                <Input id="nombres" {...form.register('nombres')} />
                {form.formState.errors.nombres && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.nombres.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="apellidos">Apellidos *</Label>
                <Input id="apellidos" {...form.register('apellidos')} />
                {form.formState.errors.apellidos && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.apellidos.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cedula">Cédula *</Label>
                <Input id="cedula" {...form.register('cedula')} />
                {form.formState.errors.cedula && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.cedula.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="fecha_nacimiento">Fecha de nacimiento *</Label>
                <Input
                  id="fecha_nacimiento"
                  type="date"
                  {...form.register('fecha_nacimiento')}
                />
                {form.formState.errors.fecha_nacimiento && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.fecha_nacimiento.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" {...form.register('telefono')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="numero_carnet">Número de carnet</Label>
                <Input id="numero_carnet" {...form.register('numero_carnet')} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" {...form.register('direccion')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                rows={2}
                {...form.register('observaciones')}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                className="h-4 w-4"
                {...form.register('activo')}
              />
              <Label htmlFor="activo" className="cursor-pointer">
                Jugador activo
              </Label>
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
                {editing ? 'Guardar cambios' : 'Crear jugador'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog calificar */}
      <Dialog
        open={!!calificando}
        onOpenChange={(open) => !open && setCalificando(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Calificar jugador</DialogTitle>
            <DialogDescription>
              {calificando
                ? `${calificando.apellidos}, ${calificando.nombres} — Cédula ${calificando.cedula}`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={calificarForm.handleSubmit(onCalificar)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label>Estado de calificación</Label>
              <Select
                value={calificarForm.watch('estado_calificacion')}
                onValueChange={(v) =>
                  calificarForm.setValue(
                    'estado_calificacion',
                    v as JugadorEstadoCalificacion,
                  )
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
              <Label htmlFor="obs-calificar">Observaciones</Label>
              <Textarea
                id="obs-calificar"
                rows={3}
                placeholder="Documentación completa. Carnet emitido."
                {...calificarForm.register('observaciones')}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCalificando(null)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm eliminar */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar jugador"
        description={
          deleting
            ? `¿Seguro que quieres eliminar a "${deleting.apellidos}, ${deleting.nombres}"?`
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
