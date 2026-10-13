import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'

import { useInscripcionStore } from '@/presentation/store/inscripcion.store'
import { useEquipoStore } from '@/presentation/store/equipo.store'
import { useTemporadaStore } from '@/presentation/store/temporada.store'
import { useCategoriaStore } from '@/presentation/store/categoria.store'
import { useAuthStore } from '@/presentation/store/auth.store'

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
import type { Inscripcion } from '@/domain/entities/inscripcion.entity'

// ─── Schema ───────────────────────────────────────────────────────────────────

const inscripcionSchema = z.object({
  equipo: z.coerce.number().int().positive('Selecciona un equipo'),
  temporada: z.coerce.number().int().positive('Selecciona una temporada'),
  categoria: z.coerce.number().int().positive('Selecciona una categoría'),
  activo: z.boolean(),
})

type InscripcionForm = z.infer<typeof inscripcionSchema>

// ─── Página ───────────────────────────────────────────────────────────────────

export default function InscripcionesPage() {
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user && (user.is_superuser || user.groups.includes('Comision Tecnica'))

  const {
    items,
    total,
    page,
    pageSize,
    filterTemporada,
    filterCategoria,
    filterActivo,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setFilterTemporada,
    setFilterCategoria,
    setFilterActivo,
    create,
    update,
    remove,
    clearError,
  } = useInscripcionStore()

  // Catálogos para los selects
  const equipos = useEquipoStore((s) => s.items)
  const loadEquipos = useEquipoStore((s) => s.load)
  const temporadas = useTemporadaStore((s) => s.items)
  const loadTemporadas = useTemporadaStore((s) => s.load)
  const categorias = useCategoriaStore((s) => s.items)
  const loadCategorias = useCategoriaStore((s) => s.load)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState<Inscripcion | null>(null)

  const form = useForm<InscripcionForm>({
    resolver: zodResolver(inscripcionSchema),
    defaultValues: {
      equipo: 0,
      temporada: 0,
      categoria: 0,
      activo: true,
    },
  })

  useEffect(() => {
    load()
  }, [load])

  // Cargar catálogos la primera vez que se abre el dialog
  useEffect(() => {
    if (dialogOpen) {
      // Cargamos con un pageSize grande para tener todo en el select
      loadEquipos()
      loadTemporadas()
      loadCategorias()
    }
  }, [dialogOpen, loadEquipos, loadTemporadas, loadCategorias])

  function openCreate() {
    form.reset({
      equipo: 0,
      temporada: filterTemporada ?? 0,
      categoria: filterCategoria ?? 0,
      activo: true,
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: InscripcionForm) {
    try {
      await create({
        equipo: data.equipo,
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

  async function toggleActivo(row: Inscripcion) {
    try {
      await update(row.id, { activo: !row.activo })
    } catch {
      // Error ya en el store
    }
  }

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<Inscripcion>[] = [
    {
      key: 'equipo',
      header: 'Equipo',
      cell: (row) => <span className="font-medium">{row.equipo_nombre}</span>,
    },
    {
      key: 'temporada',
      header: 'Temporada',
      cell: (row) => (
        <span className="text-sm">{row.temporada_nombre}</span>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      cell: (row) => (
        <Badge variant="outline">{row.categoria_nombre}</Badge>
      ),
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
            {row.activo ? 'Activa' : 'Inactiva'}
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
            title="Eliminar inscripción"
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
          <h1 className="text-2xl font-bold tracking-tight">Inscripciones</h1>
          <p className="text-sm text-muted-foreground">
            Qué equipos participan en cada temporada y categoría.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva inscripción
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
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="true">Activas</SelectItem>
            <SelectItem value="false">Inactivas</SelectItem>
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
        emptyMessage="No hay inscripciones registradas."
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
            <DialogTitle>Nueva inscripción</DialogTitle>
            <DialogDescription>
              Inscribe un equipo en una temporada y categoría. No se puede
              duplicar la misma combinación.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Equipo</Label>
              <Select
                value={form.watch('equipo') ? String(form.watch('equipo')) : ''}
                onValueChange={(v) => form.setValue('equipo', Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un equipo" />
                </SelectTrigger>
                <SelectContent>
                  {equipos.length === 0 ? (
                    <SelectItem value="0" disabled>
                      Sin equipos
                    </SelectItem>
                  ) : (
                    equipos.map((e) => (
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
              <Label>Temporada</Label>
              <Select
                value={
                  form.watch('temporada') ? String(form.watch('temporada')) : ''
                }
                onValueChange={(v) => form.setValue('temporada', Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una temporada" />
                </SelectTrigger>
                <SelectContent>
                  {temporadas.length === 0 ? (
                    <SelectItem value="0" disabled>
                      Sin temporadas
                    </SelectItem>
                  ) : (
                    temporadas.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.nombre}
                      </SelectItem>
                    ))
                  )}
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
                  form.watch('categoria') ? String(form.watch('categoria')) : ''
                }
                onValueChange={(v) => form.setValue('categoria', Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.length === 0 ? (
                    <SelectItem value="0" disabled>
                      Sin categorías
                    </SelectItem>
                  ) : (
                    categorias.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {form.formState.errors.categoria && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.categoria.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activo"
                className="h-4 w-4"
                {...form.register('activo')}
              />
              <Label htmlFor="activo" className="cursor-pointer">
                Inscripción activa
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
                Crear inscripción
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm eliminar */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar inscripción"
        description={
          deleting
            ? `¿Quitar a "${deleting.equipo_nombre}" de ${deleting.temporada_nombre} · ${deleting.categoria_nombre}?`
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
