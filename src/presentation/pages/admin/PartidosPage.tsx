import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Pencil, Plus, Target, Trash2 } from 'lucide-react'

import { usePartidoAdminStore } from '@/presentation/store/partido-admin.store'
import { useJornadaStore } from '@/presentation/store/jornada.store'
import { useEquipoStore } from '@/presentation/store/equipo.store'
import { useAuthStore } from '@/presentation/store/auth.store'

import { jornadaUseCase } from '@/infrastructure/factories/jornada.factory'
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
  PartidoAdmin,
  PartidoDia,
  PartidoEstado,
} from '@/domain/entities/partido-admin.entity'
import { formatTime } from '@/presentation/utils/formatters'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const partidoSchema = z.object({
  jornada: z.coerce.number().int().positive('Selecciona una jornada'),
  numero_partido: z.coerce.number().int().min(1).max(5),
  dia: z.enum(['sabado', 'domingo']),
  hora: z.string().optional(),
  equipo_local: z.coerce.number().int().positive('Selecciona el local'),
  equipo_visitante: z.coerce.number().int().positive('Selecciona el visitante'),
  equipo_vocal: z.coerce.number().int().optional(),
  estado: z.enum([
    'programado',
    'en_curso',
    'finalizado',
    'suspendido',
    'cancelado',
  ]),
  observaciones: z.string().optional(),
})

type PartidoForm = z.infer<typeof partidoSchema>

const resultadoSchema = z.object({
  goles_local: z.coerce.number().int().min(0),
  goles_visitante: z.coerce.number().int().min(0),
  observaciones: z.string().optional(),
})

type ResultadoForm = z.infer<typeof resultadoSchema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const DIAS: { value: PartidoDia; label: string }[] = [
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
]
const HORARIOS = [
  { value: '08:00:00', label: '08:00' },
  { value: '10:00:00', label: '10:00' },
  { value: '12:00:00', label: '12:00' },
  { value: '14:00:00', label: '14:00' },
  { value: '16:00:00', label: '16:00' },
]
const ESTADOS: {
  value: PartidoEstado
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}[] = [
    { value: 'programado', label: 'Programado', variant: 'outline' },
    { value: 'en_curso', label: 'En curso', variant: 'default' },
    { value: 'finalizado', label: 'Finalizado', variant: 'secondary' },
    { value: 'suspendido', label: 'Suspendido', variant: 'destructive' },
    { value: 'cancelado', label: 'Cancelado', variant: 'destructive' },
  ]

function estadoVariant(estado: PartidoEstado) {
  return ESTADOS.find((e) => e.value === estado)?.variant ?? 'outline'
}

function estadoLabel(estado: PartidoEstado) {
  return ESTADOS.find((e) => e.value === estado)?.label ?? estado
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PartidosPage() {
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user && (user.is_superuser || user.groups.includes('Comision Tecnica'))

  const {
    items,
    total,
    page,
    pageSize,
    filterJornada,
    filterDia,
    filterEstado,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setFilterJornada,
    setFilterDia,
    setFilterEstado,
    create,
    update,
    remove,
    registrarResultado,
    clearError,
  } = usePartidoAdminStore()

  const jornadas = useJornadaStore((s) => s.items)
  const equipos = useEquipoStore((s) => s.items)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<PartidoAdmin | null>(null)
  const [deleting, setDeleting] = useState<PartidoAdmin | null>(null)
  const [resultadoDe, setResultadoDe] = useState<PartidoAdmin | null>(null)

  const form = useForm<PartidoForm>({
    resolver: zodResolver(partidoSchema),
    defaultValues: {
      jornada: 0,
      numero_partido: 1,
      dia: 'sabado',
      hora: '',
      equipo_local: 0,
      equipo_visitante: 0,
      equipo_vocal: undefined,
      estado: 'programado',
      observaciones: '',
    },
  })

  const resultadoForm = useForm<ResultadoForm>({
    resolver: zodResolver(resultadoSchema),
    defaultValues: { goles_local: 0, goles_visitante: 0, observaciones: '' },
  })

  useEffect(() => {
    load()
    jornadaUseCase.list({ pageSize: 200 }).then((r) => {
      useJornadaStore.setState({ items: r.results })
    })
    equipoUseCase.list({ pageSize: 200, activo: true }).then((r) => {
      useEquipoStore.setState({ items: r.results })
    })
  }, [load])

  function openCreate() {
    setEditing(null)
    form.reset({
      jornada: filterJornada ?? 0,
      numero_partido: 1,
      dia: 'sabado',
      hora: '',
      equipo_local: 0,
      equipo_visitante: 0,
      equipo_vocal: undefined,
      estado: 'programado',
      observaciones: '',
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(p: PartidoAdmin) {
    setEditing(p)
    form.reset({
      jornada: p.jornada,
      numero_partido: p.numero_partido,
      dia: p.dia,
      hora: p.hora ?? '',
      equipo_local: p.equipo_local,
      equipo_visitante: p.equipo_visitante,
      equipo_vocal: p.equipo_vocal ?? undefined,
      estado: p.estado,
      observaciones: p.observaciones ?? '',
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: PartidoForm) {
    try {
      const payload = {
        jornada: data.jornada,
        numero_partido: data.numero_partido,
        dia: data.dia,
        hora: data.hora || undefined,
        equipo_local: data.equipo_local,
        equipo_visitante: data.equipo_visitante,
        equipo_vocal: data.equipo_vocal || undefined,
        estado: data.estado,
        observaciones: data.observaciones || undefined,
      }

      if (editing) {
        await update(editing.id, {
          numero_partido: payload.numero_partido,
          dia: payload.dia,
          hora: payload.hora,
          equipo_local: payload.equipo_local,
          equipo_visitante: payload.equipo_visitante,
          equipo_vocal: payload.equipo_vocal,
          estado: payload.estado,
          observaciones: payload.observaciones,
        })
      } else {
        await create(payload)
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

  function openResultado(p: PartidoAdmin) {
    setResultadoDe(p)
    resultadoForm.reset({
      goles_local: p.goles_local ?? 0,
      goles_visitante: p.goles_visitante ?? 0,
      observaciones: p.observaciones ?? '',
    })
    clearError()
  }

  async function onRegistrarResultado(data: ResultadoForm) {
    if (!resultadoDe) return
    try {
      await registrarResultado(resultadoDe.id, {
        goles_local: data.goles_local,
        goles_visitante: data.goles_visitante,
        observaciones: data.observaciones || undefined,
      })
      setResultadoDe(null)
    } catch {
      // Error ya está en el store
    }
  }

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<PartidoAdmin>[] = [
    {
      key: 'jornada',
      header: 'Jornada',
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium">J{row.jornada_numero}</span>
          <span className="text-muted-foreground">
            {row.categoria_nombre}
          </span>
        </div>
      ),
    },
    {
      key: 'dia',
      header: 'Día',
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span className="capitalize">{row.dia_display}</span>
          <span className="text-muted-foreground">P{row.numero_partido}</span>
        </div>
      ),
    },
    {
      key: 'hora',
      header: 'Hora',
      cell: (row) => (
        <span className="font-mono text-xs">
          {row.hora ? formatTime(row.hora) : '—'}
        </span>
      ),
    },
    {
      key: 'partido',
      header: 'Partido',
      cell: (row) => (
        <div className="flex flex-col text-sm">
          <span className="font-medium">
            {row.equipo_local_nombre} vs {row.equipo_visitante_nombre}
          </span>
          {row.equipo_vocal_nombre && (
            <span className="text-xs text-muted-foreground">
              Vocal: {row.equipo_vocal_nombre}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'resultado',
      header: 'Resultado',
      cell: (row) =>
        row.goles_local !== null && row.goles_visitante !== null ? (
          <span className="font-mono font-bold">
            {row.goles_local} - {row.goles_visitante}
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
            onClick={() => openResultado(row)}
            disabled={!canWrite}
            title="Registrar resultado"
          >
            <Target className="h-4 w-4 text-primary" />
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
          <h1 className="text-2xl font-bold tracking-tight">Partidos</h1>
          <p className="text-sm text-muted-foreground">
            Partidos del fixture. 5 por día, sábado y domingo.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo partido
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        <Select
          value={filterJornada ? String(filterJornada) : 'all'}
          onValueChange={(v) =>
            setFilterJornada(v === 'all' ? undefined : Number(v))
          }
        >
          <SelectTrigger className="md:w-64">
            <SelectValue placeholder="Jornada" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las jornadas</SelectItem>
            {jornadas.map((j) => (
              <SelectItem key={j.id} value={String(j.id)}>
                J{j.numero} · {j.categoria_nombre} · {j.temporada_nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterDia ?? 'all'}
          onValueChange={(v) => setFilterDia(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Día" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los días</SelectItem>
            {DIAS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
        emptyMessage="No hay partidos registrados."
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        disabled={isLoading}
      />

      {/* Dialog crear / editar partido */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar partido' : 'Nuevo partido'}
            </DialogTitle>
            <DialogDescription>
              El equipo vocal se puede dejar vacío y asignar luego con el sorteo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Jornada</Label>
                <Select
                  value={
                    form.watch('jornada') ? String(form.watch('jornada')) : ''
                  }
                  onValueChange={(v) => form.setValue('jornada', Number(v))}
                  disabled={!!editing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona jornada" />
                  </SelectTrigger>
                  <SelectContent>
                    {jornadas.map((j) => (
                      <SelectItem key={j.id} value={String(j.id)}>
                        J{j.numero} · {j.categoria_nombre} · {j.temporada_nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.jornada && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.jornada.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Nº partido</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    {...form.register('numero_partido')}
                  />
                  {form.formState.errors.numero_partido && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.numero_partido.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label>Día</Label>
                  <Select
                    value={form.watch('dia')}
                    onValueChange={(v) =>
                      form.setValue('dia', v as PartidoDia)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DIAS.map((d) => (
                        <SelectItem key={d.value} value={d.value}>
                          {d.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Hora</Label>
                <Select
                  value={form.watch('hora') || ''}
                  onValueChange={(v) => form.setValue('hora', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona horario" />
                  </SelectTrigger>
                  <SelectContent>
                    {HORARIOS.map((h) => (
                      <SelectItem key={h.value} value={h.value}>
                        {h.label}
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
                    form.setValue('estado', v as PartidoEstado)
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Equipo local</Label>
                <Select
                  value={
                    form.watch('equipo_local')
                      ? String(form.watch('equipo_local'))
                      : ''
                  }
                  onValueChange={(v) =>
                    form.setValue('equipo_local', Number(v))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Local" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipos.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.equipo_local && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.equipo_local.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Equipo visitante</Label>
                <Select
                  value={
                    form.watch('equipo_visitante')
                      ? String(form.watch('equipo_visitante'))
                      : ''
                  }
                  onValueChange={(v) =>
                    form.setValue('equipo_visitante', Number(v))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Visitante" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipos.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.equipo_visitante && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.equipo_visitante.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Equipo vocal (opcional)</Label>
              <Select
                value={
                  form.watch('equipo_vocal')
                    ? String(form.watch('equipo_vocal'))
                    : 'none'
                }
                onValueChange={(v) =>
                  form.setValue(
                    'equipo_vocal',
                    v === 'none' ? undefined : Number(v),
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {equipos.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {editing ? 'Guardar cambios' : 'Crear partido'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog registrar resultado */}
      <Dialog
        open={!!resultadoDe}
        onOpenChange={(open) => !open && setResultadoDe(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar resultado</DialogTitle>
            <DialogDescription>
              {resultadoDe
                ? `${resultadoDe.equipo_local_nombre} vs ${resultadoDe.equipo_visitante_nombre}`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={resultadoForm.handleSubmit(onRegistrarResultado)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Goles local</Label>
                <Input
                  type="number"
                  min={0}
                  {...resultadoForm.register('goles_local')}
                />
              </div>
              <div className="space-y-1">
                <Label>Goles visitante</Label>
                <Input
                  type="number"
                  min={0}
                  {...resultadoForm.register('goles_visitante')}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="obs-resultado">Observaciones</Label>
              <Textarea
                id="obs-resultado"
                rows={2}
                {...resultadoForm.register('observaciones')}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setResultadoDe(null)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar resultado
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm eliminar */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar partido"
        description={
          deleting
            ? `¿Eliminar el partido ${deleting.equipo_local_nombre} vs ${deleting.equipo_visitante_nombre}?`
            : ''
        }
        confirmText="Eliminar"
        variant="destructive"
        onConfirm={onDelete}
        isLoading={isSaving}
      />
    </div >
  )
}
