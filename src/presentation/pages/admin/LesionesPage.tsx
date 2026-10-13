import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Heart, Loader2, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'

import { useLesionStore } from '@/presentation/store/lesion.store'
import { useJugadorStore } from '@/presentation/store/jugador.store'
import { useEquipoStore } from '@/presentation/store/equipo.store'
import { useAuthStore } from '@/presentation/store/auth.store'

import { jugadorUseCase } from '@/infrastructure/factories/jugador.factory'
import { equipoUseCase } from '@/infrastructure/factories/equipo.factory'

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
  Lesion,
  LesionEstado,
  LesionGravedad,
  LesionTipo,
} from '@/domain/entities/lesion.entity'
import { formatDate, formatMoney } from '@/presentation/utils/formatters'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const lesionSchema = z.object({
  jugador: z.coerce.number().int().positive('Selecciona un jugador'),
  equipo: z.coerce.number().int().optional().nullable(),
  fecha: z.string().min(1, 'Requerido'),
  tipo: z.enum(['esguince', 'fractura', 'desgarro', 'contusion', 'luxacion', 'otro']),
  gravedad: z.enum(['leve', 'moderada', 'grave']),
  descripcion: z.string().optional(),
  monto_apoyo: z.coerce.number().min(0).optional().nullable(),
  observaciones: z.string().optional(),
})

type LesionForm = z.infer<typeof lesionSchema>

const cambiarEstadoSchema = z.object({
  estado: z.enum(['reportada', 'en_revision', 'aprobada', 'rechazada', 'pagada']),
  monto_apoyo: z.coerce.number().min(0).optional().nullable(),
  observaciones: z.string().optional(),
})

type CambiarEstadoForm = z.infer<typeof cambiarEstadoSchema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPOS: { value: LesionTipo; label: string }[] = [
  { value: 'esguince', label: 'Esguince' },
  { value: 'fractura', label: 'Fractura' },
  { value: 'desgarro', label: 'Desgarro' },
  { value: 'contusion', label: 'Contusión' },
  { value: 'luxacion', label: 'Luxación' },
  { value: 'otro', label: 'Otro' },
]

const GRAVEDADES: {
  value: LesionGravedad
  label: string
  variant: 'default' | 'secondary' | 'destructive'
}[] = [
  { value: 'leve', label: 'Leve', variant: 'secondary' },
  { value: 'moderada', label: 'Moderada', variant: 'default' },
  { value: 'grave', label: 'Grave', variant: 'destructive' },
]

const ESTADOS: {
  value: LesionEstado
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}[] = [
  { value: 'reportada', label: 'Reportada', variant: 'outline' },
  { value: 'en_revision', label: 'En revisión', variant: 'default' },
  { value: 'aprobada', label: 'Aprobada', variant: 'secondary' },
  { value: 'rechazada', label: 'Rechazada', variant: 'destructive' },
  { value: 'pagada', label: 'Pagada', variant: 'secondary' },
]

function estadoVariant(estado: LesionEstado) {
  return ESTADOS.find((e) => e.value === estado)?.variant ?? 'outline'
}

function estadoLabel(estado: LesionEstado) {
  return ESTADOS.find((e) => e.value === estado)?.label ?? estado
}

function gravedadVariant(g: LesionGravedad) {
  return GRAVEDADES.find((x) => x.value === g)?.variant ?? 'secondary'
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function LesionesPage() {
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user && (user.is_superuser || user.groups.includes('Comision Seguro'))

  const {
    items,
    total,
    page,
    pageSize,
    search,
    filterEstado,
    filterGravedad,
    filterTipo,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setSearch,
    setFilterEstado,
    setFilterGravedad,
    setFilterTipo,
    create,
    update,
    remove,
    cambiarEstado,
    clearError,
  } = useLesionStore()

  const jugadores = useJugadorStore((s) => s.items)
  const equipos = useEquipoStore((s) => s.items)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Lesion | null>(null)
  const [deleting, setDeleting] = useState<Lesion | null>(null)
  const [cambiando, setCambiando] = useState<Lesion | null>(null)

  const form = useForm<LesionForm>({
    resolver: zodResolver(lesionSchema),
    defaultValues: {
      jugador: 0,
      equipo: null,
      fecha: new Date().toISOString().slice(0, 10),
      tipo: 'otro',
      gravedad: 'leve',
      descripcion: '',
      monto_apoyo: null,
      observaciones: '',
    },
  })

  const cambiarForm = useForm<CambiarEstadoForm>({
    resolver: zodResolver(cambiarEstadoSchema),
    defaultValues: { estado: 'reportada', monto_apoyo: null, observaciones: '' },
  })

  useEffect(() => {
    load()
    jugadorUseCase.list({ pageSize: 500, activo: true }).then((r) => {
      useJugadorStore.setState({ items: r.results })
    })
    equipoUseCase.list({ pageSize: 200, activo: true }).then((r) => {
      useEquipoStore.setState({ items: r.results })
    })
  }, [load])

  function openCreate() {
    setEditing(null)
    form.reset({
      jugador: 0,
      equipo: null,
      fecha: new Date().toISOString().slice(0, 10),
      tipo: 'otro',
      gravedad: 'leve',
      descripcion: '',
      monto_apoyo: null,
      observaciones: '',
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(l: Lesion) {
    setEditing(l)
    form.reset({
      jugador: l.jugador,
      equipo: l.equipo,
      fecha: l.fecha,
      tipo: l.tipo,
      gravedad: l.gravedad,
      descripcion: l.descripcion ?? '',
      monto_apoyo: l.monto_apoyo ? Number(l.monto_apoyo) : null,
      observaciones: l.observaciones ?? '',
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: LesionForm) {
    try {
      if (editing) {
        await update(editing.id, {
          fecha: data.fecha,
          tipo: data.tipo,
          gravedad: data.gravedad,
          descripcion: data.descripcion || undefined,
          monto_apoyo: data.monto_apoyo,
          observaciones: data.observaciones || undefined,
        })
      } else {
        await create({
          jugador: data.jugador,
          equipo: data.equipo,
          fecha: data.fecha,
          tipo: data.tipo,
          gravedad: data.gravedad,
          descripcion: data.descripcion || undefined,
          monto_apoyo: data.monto_apoyo,
          observaciones: data.observaciones || undefined,
        })
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

  function openCambiarEstado(l: Lesion) {
    setCambiando(l)
    cambiarForm.reset({
      estado: l.estado,
      monto_apoyo: l.monto_apoyo ? Number(l.monto_apoyo) : null,
      observaciones: '',
    })
    clearError()
  }

  async function onCambiarEstado(data: CambiarEstadoForm) {
    if (!cambiando) return
    try {
      await cambiarEstado(cambiando.id, {
        estado: data.estado,
        monto_apoyo: data.monto_apoyo,
        observaciones: data.observaciones || undefined,
      })
      setCambiando(null)
    } catch {
      // Error ya en el store
    }
  }

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<Lesion>[] = [
    {
      key: 'jugador',
      header: 'Jugador',
      cell: (row) => (
        <div className="flex flex-col text-sm">
          <span className="font-medium">{row.jugador_nombre}</span>
          {row.equipo_nombre && (
            <span className="text-xs text-muted-foreground">
              {row.equipo_nombre}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'fecha',
      header: 'Fecha',
      cell: (row) => (
        <span className="text-sm">{formatDate(row.fecha)}</span>
      ),
    },
    {
      key: 'lesion',
      header: 'Lesión',
      cell: (row) => (
        <div className="flex flex-col gap-1 text-xs">
          <span>{row.tipo_display}</span>
          <Badge variant={gravedadVariant(row.gravedad)} className="w-fit">
            {row.gravedad_display}
          </Badge>
        </div>
      ),
    },
    {
      key: 'monto',
      header: 'Apoyo',
      cell: (row) =>
        row.monto_apoyo ? (
          <span className="font-mono text-sm">
            {formatMoney(row.monto_apoyo)}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
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
            onClick={() => openCambiarEstado(row)}
            disabled={!canWrite}
            title="Cambiar estado"
          >
            <RefreshCw className="h-4 w-4 text-primary" />
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Lesiones
          </h1>
          <p className="text-sm text-muted-foreground">
            Casos de lesión y apoyo económico a jugadores.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva lesión
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
        <Select
          value={filterGravedad ?? 'all'}
          onValueChange={(v) => setFilterGravedad(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Gravedad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {GRAVEDADES.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        emptyMessage="No hay lesiones registradas."
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
              {editing ? 'Editar lesión' : 'Nueva lesión'}
            </DialogTitle>
            <DialogDescription>
              Registra una lesión de un jugador y el apoyo económico si aplica.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!editing && (
              <>
                <div className="space-y-1">
                  <Label>Jugador *</Label>
                  <Select
                    value={
                      form.watch('jugador') ? String(form.watch('jugador')) : ''
                    }
                    onValueChange={(v) => form.setValue('jugador', Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona jugador" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {jugadores.map((j) => (
                        <SelectItem key={j.id} value={String(j.id)}>
                          {j.apellidos}, {j.nombres}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.jugador && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.jugador.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Equipo (opcional)</Label>
                  <Select
                    value={
                      form.watch('equipo') ? String(form.watch('equipo')) : 'none'
                    }
                    onValueChange={(v) =>
                      form.setValue('equipo', v === 'none' ? null : Number(v))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin equipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin equipo</SelectItem>
                      {equipos.map((e) => (
                        <SelectItem key={e.id} value={String(e.id)}>
                          {e.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fecha">Fecha *</Label>
                <Input id="fecha" type="date" {...form.register('fecha')} />
              </div>
              <div className="space-y-1">
                <Label>Gravedad</Label>
                <Select
                  value={form.watch('gravedad')}
                  onValueChange={(v) =>
                    form.setValue('gravedad', v as LesionGravedad)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRAVEDADES.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Tipo de lesión</Label>
              <Select
                value={form.watch('tipo')}
                onValueChange={(v) => form.setValue('tipo', v as LesionTipo)}
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
              <Label htmlFor="monto_apoyo">Monto de apoyo (USD)</Label>
              <Input
                id="monto_apoyo"
                type="number"
                step="0.01"
                min="0"
                {...form.register('monto_apoyo')}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                rows={2}
                {...form.register('descripcion')}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="obs-les">Observaciones</Label>
              <Textarea
                id="obs-les"
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
                {editing ? 'Guardar cambios' : 'Crear lesión'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog cambiar estado */}
      <Dialog
        open={!!cambiando}
        onOpenChange={(open) => !open && setCambiando(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar estado de lesión</DialogTitle>
            <DialogDescription>
              {cambiando
                ? `${cambiando.jugador_nombre} — ${cambiando.tipo_display}`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={cambiarForm.handleSubmit(onCambiarEstado)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label>Nuevo estado</Label>
              <Select
                value={cambiarForm.watch('estado')}
                onValueChange={(v) =>
                  cambiarForm.setValue('estado', v as LesionEstado)
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
              <Label htmlFor="monto_cambio">Monto de apoyo (USD)</Label>
              <Input
                id="monto_cambio"
                type="number"
                step="0.01"
                min="0"
                {...cambiarForm.register('monto_apoyo')}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="obs_cambio">Observaciones</Label>
              <Textarea
                id="obs_cambio"
                rows={2}
                {...cambiarForm.register('observaciones')}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCambiando(null)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Cambiar estado
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar lesión"
        description={
          deleting
            ? `¿Eliminar la lesión de ${deleting.jugador_nombre}?`
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
