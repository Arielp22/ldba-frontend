import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

import { useCategoriaStore } from '@/presentation/store/categoria.store'
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
import type { Categoria } from '@/domain/entities/categoria.entity'

// ─── Schema del formulario ────────────────────────────────────────────────────

const categoriaSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  descripcion: z.string().optional().nullable(),
  activa: z.boolean(),
})

type CategoriaForm = z.infer<typeof categoriaSchema>

// ─── Página ───────────────────────────────────────────────────────────────────

export default function CategoriasPage() {
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user && (user.is_superuser || user.groups.includes('Comision Tecnica'))

  const {
    items,
    total,
    page,
    pageSize,
    search,
    filterActiva,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setSearch,
    setFilterActiva,
    create,
    update,
    remove,
    clearError,
  } = useCategoriaStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [deleting, setDeleting] = useState<Categoria | null>(null)

  const form = useForm<CategoriaForm>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: { nombre: '', descripcion: '', activa: true },
  })

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditing(null)
    form.reset({ nombre: '', descripcion: '', activa: true })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(cat: Categoria) {
    setEditing(cat)
    form.reset({
      nombre: cat.nombre,
      descripcion: cat.descripcion ?? '',
      activa: cat.activa,
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: CategoriaForm) {
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

  // ─── Columnas de la tabla ────────────────────────────────────────────────────

  const columns: Column<Categoria>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      cell: (row) => <span className="font-medium">{row.nombre}</span>,
    },
    {
      key: 'descripcion',
      header: 'Descripción',
      cell: (row) => (
        <span className="text-sm text-muted-foreground line-clamp-1">
          {row.descripcion || '—'}
        </span>
      ),
    },
    {
      key: 'activa',
      header: 'Estado',
      cell: (row) => (
        <Badge variant={row.activa ? 'default' : 'secondary'}>
          {row.activa ? 'Activa' : 'Inactiva'}
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
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorías</h1>
          <p className="text-sm text-muted-foreground">
            Masculino, Femenino, Infantil y otras categorías de la liga.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva categoría
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
          value={filterActiva === undefined ? 'all' : String(filterActiva)}
          onValueChange={(v) => {
            if (v === 'all') setFilterActiva(undefined)
            else setFilterActiva(v === 'true')
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
        emptyMessage="No hay categorías registradas."
      />

      {/* Paginación */}
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        disabled={isLoading}
      />

      {/* Dialog: crear / editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Editar categoría' : 'Nueva categoría'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualiza los datos de la categoría.'
                : 'Completa los datos para crear una nueva categoría.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                placeholder="Ej: Masculino"
                {...form.register('nombre')}
              />
              {form.formState.errors.nombre && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.nombre.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                placeholder="Descripción opcional…"
                rows={3}
                {...form.register('descripcion')}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activa"
                className="h-4 w-4"
                {...form.register('activa')}
              />
              <Label htmlFor="activa" className="cursor-pointer">
                Categoría activa
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
                {editing ? 'Guardar cambios' : 'Crear categoría'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm: eliminar */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar categoría"
        description={
          deleting
            ? `¿Seguro que quieres eliminar "${deleting.nombre}"? Esta acción no se puede deshacer.`
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
