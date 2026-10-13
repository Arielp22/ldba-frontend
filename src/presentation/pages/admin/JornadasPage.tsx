import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Calendar, Eye, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

import { useJornadaStore } from '@/presentation/store/jornada.store'
import { useTemporadaStore } from '@/presentation/store/temporada.store'
import { useCategoriaStore } from '@/presentation/store/categoria.store'
import { useAuthStore } from '@/presentation/store/auth.store'

import { temporadaUseCase } from '@/infrastructure/factories/temporada.factory'
import { categoriaUseCase } from '@/infrastructure/factories/categoria.factory'

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
import type { Jornada, JornadaEstado } from '@/domain/entities/jornada.entity'
import { formatDate } from '@/presentation/utils/formatters'

// ─── Schema ───────────────────────────────────────────────────────────────────

const jornadaSchema = z
  .object({
    temporada: z.coerce.number().int().positive('Selecciona una temporada'),
    categoria: z.coerce.number().int().positive('Selecciona una categoría'),
    numero: z.coerce
      .number()
      .int('Debe ser un entero')
      .min(1, 'Mínimo 1'),
    fecha_sabado: z.string().min(1, 'Requerido'),
    fecha_domingo: z.string().min(1, 'Requerido'),
    estado: z.enum(['planificada', 'en_curso', 'finalizada', 'cancelada']),
  })
  .refine(
    (data) => new Date(data.fecha_domingo) > new Date(data.fecha_sabado),
    {
      message: 'El domingo debe ser posterior al sábado',
      path: ['fecha_domingo'],
    },
  )

type JornadaForm = z.infer<typeof jornadaSchema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADOS: { value: JornadaEstado; label: string }[] = [
  { value: 'planificada', label: 'Planificada' },
  { value: 'en_curso', label: 'En curso' },
  { value: 'finalizada', label: 'Finalizada' },
  { value: 'cancelada', label: 'Cancelada' },
]

const ESTADO_VARIANT: Record<
  JornadaEstado,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  planificada: 'outline',
  en_curso: 'default',
  finalizada: 'secondary',
  cancelada: 'destructive',
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function JornadasPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user && (user.is_superuser || user.groups.includes('Comision Tecnica'))

  const {
    items,
    total,
    page,
    pageSize,
    search,
    filterTemporada,
    filterCategoria,
    filterEstado,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setSearch,
    setFilterTemporada,
    setFilterCategoria,
    setFilterEstado,
    create,
    update,
    remove,
    clearError,
  } = useJornadaStore()

  const temporadas = useTemporadaStore((s) => s.items)
  const categorias = useCategoriaStore((s) => s.items)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Jornada | null>(null)
  const [deleting, setDeleting] = useState<Jornada | null>(null)

  const form = useForm<JornadaForm>({
    resolver: zodResolver(jornadaSchema),
    defaultValues: {
      temporada: 0,
      categoria: 0,
      numero: 1,
      fecha_sabado: '',
      fecha_domingo: '',
      estado: 'planificada',
    },
  })

  useEffect(() => {
    load()
    temporadaUseCase.list({ pageSize: 200 }).then((r) => {
      useTemporadaStore.setState({ items: r.results })
    })
    categoriaUseCase.list({ pageSize: 200, activa: true }).then((r) => {
      useCategoriaStore.setState({ items: r.results })
    })
  }, [load])

  function openCreate() {
    setEditing(null)
    form.reset({
      temporada: filterTemporada ?? 0,
      categoria: filterCategoria ?? 0,
      numero: 1,
      fecha_sabado: '',
      fecha_domingo: '',
      estado: 'planificada',
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(j: Jornada) {
    setEditing(j)
    form.reset({
      temporada: j.temporada,
      categoria: j.categoria,
      numero: j.numero,
      fecha_sabado: j.fecha_sabado,
      fecha_domingo: j.fecha_domingo,
      estado: j.estado,
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: JornadaForm) {
    try {
      if (editing) {
        await update(editing.id, data)
      } else {
        await create(data)
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

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<Jornada>[] = [
    {
      key: 'numero',
      header: 'Jornada',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">J{row.numero}</span>
        </div>
      ),
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
      key: 'fechas',
      header: 'Fechas',
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span>Sáb {formatDate(row.fecha_sabado)}</span>
          <span className="text-muted-foreground">
            Dom {formatDate(row.fecha_domingo)}
          </span>
        </div>
      ),
    },
    {
      key: 'partidos',
      header: 'Partidos',
      cell: (row) => (
        <Badge variant="secondary">
          {row.partidos_count} / 10
        </Badge>
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
            onClick={() => navigate(`/admin/jornadas/${row.id}`)}
            title="Ver detalle"
          >
            <Eye className="h-4 w-4 text-primary" />
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
          <h1 className="text-2xl font-bold tracking-tight">Jornadas</h1>
          <p className="text-sm text-muted-foreground">
            Fechas del fixture por temporada y categoría.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva jornada
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
          value={filterEstado ?? 'all'}
          onValueChange={(v) => setFilterEstado(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="md:w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
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
        emptyMessage="No hay jornadas registradas."
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar jornada' : 'Nueva jornada'}
            </DialogTitle>
            <DialogDescription>
              Una jornada tiene 5 partidos el sábado y 5 el domingo.
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
                  onValueChange={(v) => form.setValue('temporada', Number(v))}
                  disabled={!!editing}
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
                  onValueChange={(v) => form.setValue('categoria', Number(v))}
                  disabled={!!editing}
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="numero">Número</Label>
                <Input
                  id="numero"
                  type="number"
                  {...form.register('numero')}
                />
                {form.formState.errors.numero && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.numero.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Estado</Label>
                <Select
                  value={form.watch('estado')}
                  onValueChange={(v) =>
                    form.setValue('estado', v as JornadaEstado)
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
                <Label htmlFor="fecha_sabado">Sábado</Label>
                <Input
                  id="fecha_sabado"
                  type="date"
                  {...form.register('fecha_sabado')}
                />
                {form.formState.errors.fecha_sabado && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.fecha_sabado.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="fecha_domingo">Domingo</Label>
                <Input
                  id="fecha_domingo"
                  type="date"
                  {...form.register('fecha_domingo')}
                />
                {form.formState.errors.fecha_domingo && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.fecha_domingo.message}
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
                {editing ? 'Guardar cambios' : 'Crear jornada'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar jornada"
        description={
          deleting
            ? `¿Eliminar la jornada J${deleting.numero} de ${deleting.temporada_nombre} · ${deleting.categoria_nombre}? Se eliminarán también sus partidos.`
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
