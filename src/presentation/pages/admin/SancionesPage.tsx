import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {  
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'

import { useSancionStore } from '@/presentation/store/sancion.store'
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
  Sancion,
  SancionTipo,
  SancionEstado,
} from '@/domain/entities/sancion.entity'
import { formatDate } from '@/presentation/utils/formatters'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const sancionSchema = z.object({
  tipo: z.enum(['jugador', 'equipo']),
  jugador: z.coerce.number().int().optional().nullable(),
  equipo: z.coerce.number().int().optional().nullable(),
  motivo: z.string().min(3, 'Mínimo 3 caracteres').max(255),
  articulo: z.string().max(100).optional(),
  fecha_inicio: z.string().min(1, 'Requerido'),
  fecha_fin: z.string().optional().nullable(),
  dias: z.coerce.number().int().min(0).optional(),
  partidos_sancion: z.coerce.number().int().min(0).optional(),
  observaciones: z.string().optional(),
})

type SancionForm = z.infer<typeof sancionSchema>

const cambiarEstadoSchema = z.object({
  estado: z.enum(['activa', 'cumplida', 'apelada', 'anulada']),
  motivo_cambio: z.string().optional(),
})

type CambiarEstadoForm = z.infer<typeof cambiarEstadoSchema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPOS: { value: SancionTipo; label: string }[] = [
  { value: 'jugador', label: 'Jugador' },
  { value: 'equipo', label: 'Equipo' },
]

const ESTADOS: {
  value: SancionEstado
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}[] = [
  { value: 'activa', label: 'Activa', variant: 'destructive' },
  { value: 'cumplida', label: 'Cumplida', variant: 'secondary' },
  { value: 'apelada', label: 'Apelada', variant: 'outline' },
  { value: 'anulada', label: 'Anulada', variant: 'outline' },
]

function estadoVariant(estado: SancionEstado) {
  return ESTADOS.find((e) => e.value === estado)?.variant ?? 'outline'
}

function estadoLabel(estado: SancionEstado) {
  return ESTADOS.find((e) => e.value === estado)?.label ?? estado
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function SancionesPage() {
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user && (user.is_superuser || user.groups.includes('Comision Penas'))

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
    cambiarEstado,
    clearError,
  } = useSancionStore()

  const jugadores = useJugadorStore((s) => s.items)
  const equipos = useEquipoStore((s) => s.items)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Sancion | null>(null)
  const [deleting, setDeleting] = useState<Sancion | null>(null)
  const [cambiando, setCambiando] = useState<Sancion | null>(null)

  const form = useForm<SancionForm>({
    resolver: zodResolver(sancionSchema),
    defaultValues: {
      tipo: 'jugador',
      jugador: null,
      equipo: null,
      motivo: '',
      articulo: '',
      fecha_inicio: '',
      fecha_fin: '',
      dias: 0,
      partidos_sancion: 0,
      observaciones: '',
    },
  })

  const cambiarForm = useForm<CambiarEstadoForm>({
    resolver: zodResolver(cambiarEstadoSchema),
    defaultValues: { estado: 'activa', motivo_cambio: '' },
  })

  const tipoActual = form.watch('tipo')

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
      tipo: 'jugador',
      jugador: null,
      equipo: null,
      motivo: '',
      articulo: '',
      fecha_inicio: '',
      fecha_fin: '',
      dias: 0,
      partidos_sancion: 0,
      observaciones: '',
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(s: Sancion) {
    setEditing(s)
    form.reset({
      tipo: s.tipo,
      jugador: s.jugador,
      equipo: s.equipo,
      motivo: s.motivo,
      articulo: s.articulo ?? '',
      fecha_inicio: s.fecha_inicio,
      fecha_fin: s.fecha_fin ?? '',
      dias: s.dias,
      partidos_sancion: s.partidos_sancion,
      observaciones: s.observaciones ?? '',
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: SancionForm) {
    try {
      if (editing) {
        await update(editing.id, {
          motivo: data.motivo,
          articulo: data.articulo || undefined,
          fecha_inicio: data.fecha_inicio,
          fecha_fin: data.fecha_fin || null,
          dias: data.dias,
          partidos_sancion: data.partidos_sancion,
          observaciones: data.observaciones || undefined,
        })
      } else {
        await create({
          tipo: data.tipo,
          jugador: data.tipo === 'jugador' ? data.jugador : null,
          equipo: data.tipo === 'equipo' ? data.equipo : null,
          motivo: data.motivo,
          articulo: data.articulo || undefined,
          fecha_inicio: data.fecha_inicio,
          fecha_fin: data.fecha_fin || null,
          dias: data.dias,
          partidos_sancion: data.partidos_sancion,
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

  function openCambiarEstado(s: Sancion) {
    setCambiando(s)
    cambiarForm.reset({ estado: s.estado, motivo_cambio: '' })
    clearError()
  }

  async function onCambiarEstado(data: CambiarEstadoForm) {
    if (!cambiando) return
    try {
      await cambiarEstado(cambiando.id, {
        estado: data.estado,
        motivo_cambio: data.motivo_cambio || undefined,
      })
      setCambiando(null)
    } catch {
      // Error ya en el store
    }
  }

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<Sancion>[] = [
    {
      key: 'objetivo',
      header: 'Sancionado',
      cell: (row) => (
        <div className="flex flex-col text-sm">
          <span className="font-medium">
            {row.tipo === 'jugador' ? row.jugador_nombre : row.equipo_nombre}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {row.tipo_display}
          </span>
        </div>
      ),
    },
    {
      key: 'motivo',
      header: 'Motivo',
      cell: (row) => (
        <div className="flex flex-col text-sm">
          <span className="line-clamp-1">{row.motivo}</span>
          {row.articulo && (
            <span className="text-xs text-muted-foreground">
              {row.articulo}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'fechas',
      header: 'Fechas',
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span>{formatDate(row.fecha_inicio)}</span>
          {row.fecha_fin && (
            <span className="text-muted-foreground">
              → {formatDate(row.fecha_fin)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'duracion',
      header: 'Duración',
      cell: (row) => (
        <div className="flex flex-col text-xs">
          {row.dias > 0 && <span>{row.dias} días</span>}
          {row.partidos_sancion > 0 && (
            <span className="text-muted-foreground">
              {row.partidos_sancion} partidos
            </span>
          )}
          {row.dias === 0 && row.partidos_sancion === 0 && (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
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
          <h1 className="text-2xl font-bold tracking-tight">Sanciones</h1>
          <p className="text-sm text-muted-foreground">
            Sanciones a jugadores o equipos de la liga.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva sanción
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        <Input
          placeholder="Buscar por motivo o artículo…"
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
        emptyMessage="No hay sanciones registradas."
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
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar sanción' : 'Nueva sanción'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Solo se pueden editar los datos básicos. El estado se cambia desde "Cambiar estado".'
                : 'Registra una sanción para un jugador o equipo.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!editing && (
              <>
                <div className="space-y-1">
                  <Label>Tipo de sanción</Label>
                  <Select
                    value={form.watch('tipo')}
                    onValueChange={(v) =>
                      form.setValue('tipo', v as SancionTipo)
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

                {tipoActual === 'jugador' ? (
                  <div className="space-y-1">
                    <Label>Jugador *</Label>
                    <Select
                      value={
                        form.watch('jugador')
                          ? String(form.watch('jugador'))
                          : ''
                      }
                      onValueChange={(v) =>
                        form.setValue('jugador', Number(v))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona jugador" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        {jugadores.map((j) => (
                          <SelectItem key={j.id} value={String(j.id)}>
                            {j.apellidos}, {j.nombres} — {j.cedula}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label>Equipo *</Label>
                    <Select
                      value={
                        form.watch('equipo')
                          ? String(form.watch('equipo'))
                          : ''
                      }
                      onValueChange={(v) => form.setValue('equipo', Number(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipos.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)}>
                            {e.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            <div className="space-y-1">
              <Label htmlFor="motivo">Motivo *</Label>
              <Input
                id="motivo"
                placeholder="Tarjeta roja por conducta violenta"
                {...form.register('motivo')}
              />
              {form.formState.errors.motivo && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.motivo.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="articulo">Artículo</Label>
                <Input
                  id="articulo"
                  placeholder="Art. 45"
                  {...form.register('articulo')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fecha_inicio">Fecha inicio *</Label>
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
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fecha_fin">Fecha fin</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  {...form.register('fecha_fin')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dias">Días</Label>
                <Input
                  id="dias"
                  type="number"
                  min={0}
                  {...form.register('dias')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="partidos_sancion">Partidos</Label>
                <Input
                  id="partidos_sancion"
                  type="number"
                  min={0}
                  {...form.register('partidos_sancion')}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
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
                {editing ? 'Guardar cambios' : 'Crear sanción'}
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
            <DialogTitle>Cambiar estado de sanción</DialogTitle>
            <DialogDescription>
              {cambiando
                ? `Sanción #${cambiando.id} — ${cambiando.motivo}`
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
                  cambiarForm.setValue('estado', v as SancionEstado)
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
              <Label htmlFor="motivo_cambio">Motivo del cambio</Label>
              <Textarea
                id="motivo_cambio"
                rows={2}
                placeholder="El jugador cumplió los partidos de sanción…"
                {...cambiarForm.register('motivo_cambio')}
              />
              <p className="text-xs text-muted-foreground">
                Se registrará en el historial de la sanción.
              </p>
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

      {/* Confirm eliminar */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar sanción"
        description={
          deleting
            ? `¿Eliminar la sanción "${deleting.motivo}"? También se eliminará su historial.`
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
