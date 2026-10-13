import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2, Trophy } from 'lucide-react'

import { useCapitanStore } from '@/presentation/store/capitan.store'
import { usePlantillaStore } from '@/presentation/store/plantilla.store'
import { useEquipoStore } from '@/presentation/store/equipo.store'
import { useTemporadaStore } from '@/presentation/store/temporada.store'
import { useCategoriaStore } from '@/presentation/store/categoria.store'
import { useInscripcionStore } from '@/presentation/store/inscripcion.store'
import { useAuthStore } from '@/presentation/store/auth.store'

import { equipoUseCase } from '@/infrastructure/factories/equipo.factory'
import { temporadaUseCase } from '@/infrastructure/factories/temporada.factory'
import { categoriaUseCase } from '@/infrastructure/factories/categoria.factory'
import { plantillaUseCase } from '@/infrastructure/factories/plantilla.factory'
import { inscripcionUseCase } from '@/infrastructure/factories/inscripcion.factory'

import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import { Label } from '@/presentation/components/ui/label'
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
import type { Capitan } from '@/domain/entities/capitan.entity'

// ─── Schema ───────────────────────────────────────────────────────────────────

const capitanSchema = z.object({
  equipo: z.coerce.number().int().positive('Selecciona un equipo'),
  jugador: z.coerce.number().int().positive('Selecciona un jugador'),
  temporada: z.coerce.number().int().positive('Selecciona una temporada'),
  categoria: z.coerce.number().int().positive('Selecciona una categoría'),
  activo: z.boolean(),
})

type CapitanForm = z.infer<typeof capitanSchema>

// ─── Página ───────────────────────────────────────────────────────────────────

export default function CapitanesPage() {
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user &&
    (user.is_superuser || user.groups.includes('Comision Calificaciones'))

  const {
    items,
    total,
    page,
    pageSize,
    filterTemporada,
    filterCategoria,
    filterEquipo,
    filterActivo,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setFilterTemporada,
    setFilterCategoria,
    setFilterEquipo,
    setFilterActivo,
    create,
    update,
    remove,
    clearError,
  } = useCapitanStore()

  // Catálogos
  const equipos = useEquipoStore((s) => s.items)
  const temporadas = useTemporadaStore((s) => s.items)
  const categorias = useCategoriaStore((s) => s.items)
  const inscripciones = useInscripcionStore((s) => s.items)
  const plantillas = usePlantillaStore((s) => s.items)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState<Capitan | null>(null)

  const form = useForm<CapitanForm>({
    resolver: zodResolver(capitanSchema),
    defaultValues: {
      equipo: 0,
      jugador: 0,
      temporada: 0,
      categoria: 0,
      activo: true,
    },
  })

  // Cargar datos al montar
  useEffect(() => {
    load()
    temporadaUseCase.list({ pageSize: 200 }).then((r) => {
      useTemporadaStore.setState({ items: r.results })
    })
    categoriaUseCase.list({ pageSize: 200, activa: true }).then((r) => {
      useCategoriaStore.setState({ items: r.results })
    })
    equipoUseCase.list({ pageSize: 200, activo: true }).then((r) => {
      useEquipoStore.setState({ items: r.results })
    })
  }, [load])

  // Cargar catálogos del form al abrir el dialog
  useEffect(() => {
    if (dialogOpen) {
      equipoUseCase.list({ pageSize: 200, activo: true }).then((r) => {
        useEquipoStore.setState({ items: r.results })
      })
      temporadaUseCase.list({ pageSize: 200 }).then((r) => {
        useTemporadaStore.setState({ items: r.results })
      })
      categoriaUseCase.list({ pageSize: 200, activa: true }).then((r) => {
        useCategoriaStore.setState({ items: r.results })
      })
    }
  }, [dialogOpen])

  // Cargar inscripciones al cambiar temporada+categoría
  useEffect(() => {
    const temp = form.watch('temporada')
    const cat = form.watch('categoria')
    if (dialogOpen && temp && cat) {
      inscripcionUseCase
        .list({ temporada: temp, categoria: cat, activo: true, pageSize: 200 })
        .then((r) => {
          useInscripcionStore.setState({ items: r.results })
        })
    }
  }, [dialogOpen, form.watch('temporada'), form.watch('categoria')])

  // Cargar plantilla del equipo seleccionado
  useEffect(() => {
    const equipo = form.watch('equipo')
    const temp = form.watch('temporada')
    const cat = form.watch('categoria')
    if (dialogOpen && equipo && temp && cat) {
      plantillaUseCase
        .list({
          equipo,
          temporada: temp,
          categoria: cat,
          activo: true,
          pageSize: 200,
        })
        .then((r) => {
          usePlantillaStore.setState({ items: r.results })
        })
    }
  }, [dialogOpen, form.watch('equipo'), form.watch('temporada'), form.watch('categoria')])

  // Resetear jugador si no está en la plantilla
  useEffect(() => {
    const jugador = form.watch('jugador')
    const equipo = form.watch('equipo')
    if (jugador && equipo && plantillas.length > 0) {
      const exists = plantillas.some((p) => p.jugador === jugador)
      if (!exists) form.setValue('jugador', 0)
    }
  }, [plantillas, form])

  function openCreate() {
    form.reset({
      equipo: 0,
      jugador: 0,
      temporada: filterTemporada ?? 0,
      categoria: filterCategoria ?? 0,
      activo: true,
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: CapitanForm) {
    try {
      await create({
        equipo: data.equipo,
        jugador: data.jugador,
        temporada: data.temporada,
        categoria: data.categoria,
        activo: data.activo,
      })
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

  async function toggleActivo(row: Capitan) {
    try {
      await update(row.id, { activo: !row.activo })
    } catch {
      // Error ya en el store
    }
  }

  // Equipos filtrados por inscripción
  const equiposDisponibles =
    form.watch('temporada') && form.watch('categoria') && inscripciones.length > 0
      ? equipos.filter((e) => inscripciones.some((i) => i.equipo === e.id))
      : equipos

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<Capitan>[] = [
    {
      key: 'jugador',
      header: 'Capitán',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="font-medium">{row.jugador_nombre}</span>
        </div>
      ),
    },
    {
      key: 'equipo',
      header: 'Equipo',
      cell: (row) => <span className="text-sm">{row.equipo_nombre}</span>,
    },
    {
      key: 'temporada',
      header: 'Temporada',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.temporada_nombre}
        </span>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      cell: (row) => <Badge variant="outline">{row.categoria_nombre}</Badge>,
    },
    {
      key: 'activo',
      header: 'Estado',
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
          <h1 className="text-2xl font-bold tracking-tight">Capitanes</h1>
          <p className="text-sm text-muted-foreground">
            Capitán oficial de cada equipo por temporada y categoría.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Designar capitán
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        <Select
          value={filterTemporada ? String(filterTemporada) : 'all'}
          onValueChange={(v) =>
            setFilterTemporada(v === 'all' ? undefined : Number(v))
          }
        >
          <SelectTrigger className="md:w-56">
            <SelectValue placeholder="Temporada" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las temporadas</SelectItem>
            {temporadas.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterCategoria ? String(filterCategoria) : 'all'}
          onValueChange={(v) =>
            setFilterCategoria(v === 'all' ? undefined : Number(v))
          }
        >
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterEquipo ? String(filterEquipo) : 'all'}
          onValueChange={(v) =>
            setFilterEquipo(v === 'all' ? undefined : Number(v))
          }
        >
          <SelectTrigger className="md:w-56">
            <SelectValue placeholder="Equipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los equipos</SelectItem>
            {equipos.map((e) => (
              <SelectItem key={e.id} value={String(e.id)}>
                {e.nombre}
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
            <SelectValue placeholder="Estado" />
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

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No hay capitanes designados."
      />

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        disabled={isLoading}
      />

      {/* Dialog crear */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Designar capitán</DialogTitle>
            <DialogDescription>
              Selecciona temporada, categoría y equipo. Solo aparecerán los
              jugadores que estén en la plantilla del equipo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Temporada</Label>
                <Select
                  value={
                    form.watch('temporada')
                      ? String(form.watch('temporada'))
                      : ''
                  }
                  onValueChange={(v) => {
                    form.setValue('temporada', Number(v))
                    form.setValue('equipo', 0)
                    form.setValue('jugador', 0)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {temporadas.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.temporada && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.temporada.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Categoría</Label>
                <Select
                  value={
                    form.watch('categoria')
                      ? String(form.watch('categoria'))
                      : ''
                  }
                  onValueChange={(v) => {
                    form.setValue('categoria', Number(v))
                    form.setValue('equipo', 0)
                    form.setValue('jugador', 0)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoria && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.categoria.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Equipo</Label>
              <Select
                value={form.watch('equipo') ? String(form.watch('equipo')) : ''}
                onValueChange={(v) => {
                  form.setValue('equipo', Number(v))
                  form.setValue('jugador', 0)
                }}
                disabled={!form.watch('temporada') || !form.watch('categoria')}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !form.watch('temporada') || !form.watch('categoria')
                        ? 'Primero temporada y categoría'
                        : 'Selecciona equipo'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {equiposDisponibles.length === 0 ? (
                    <SelectItem value="0" disabled>
                      Sin equipos inscritos
                    </SelectItem>
                  ) : (
                    equiposDisponibles.map((e) => (
                      <SelectItem key={e.id} value={String(e.id)}>
                        {e.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.equipo && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.equipo.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Jugador (de la plantilla)</Label>
              <Select
                value={
                  form.watch('jugador') ? String(form.watch('jugador')) : ''
                }
                onValueChange={(v) => form.setValue('jugador', Number(v))}
                disabled={!form.watch('equipo')}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !form.watch('equipo')
                        ? 'Primero selecciona equipo'
                        : 'Selecciona jugador'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {plantillas.length === 0 ? (
                    <SelectItem value="0" disabled>
                      Sin jugadores en la plantilla
                    </SelectItem>
                  ) : (
                    plantillas.map((p) => (
                      <SelectItem key={p.jugador} value={String(p.jugador)}>
                        {p.jugador_nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.jugador && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.jugador.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo-cap"
                className="h-4 w-4"
                {...form.register('activo')}
              />
              <Label htmlFor="activo-cap" className="cursor-pointer">
                Capitán activo
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
                Designar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm eliminar */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Quitar capitán"
        description={
          deleting
            ? `¿Quitar a "${deleting.jugador_nombre}" como capitán de "${deleting.equipo_nombre}"?`
            : ''
        }
        confirmText="Quitar"
        variant="destructive"
        onConfirm={onDelete}
        isLoading={isSaving}
      />
    </div>
  )
}
