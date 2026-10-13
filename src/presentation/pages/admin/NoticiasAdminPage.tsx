import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  EyeOff,
  Globe,
  Loader2,
  Newspaper,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react'

import { useNoticiaStore } from '@/presentation/store/noticia.store'
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
import type { Noticia } from '@/domain/entities/noticia.entity'
import { formatDate } from '@/presentation/utils/formatters'

// ─── Schema ───────────────────────────────────────────────────────────────────

const noticiaSchema = z.object({
  titulo: z.string().min(3, 'Mínimo 3 caracteres').max(255),
  resumen: z.string().max(500).optional(),
  contenido: z.string().min(10, 'Mínimo 10 caracteres'),
  imagen: z.string().max(500).optional(),
  autor: z.string().max(150).optional(),
  destacada: z.boolean(),
})

type NoticiaForm = z.infer<typeof noticiaSchema>

// ─── Página ───────────────────────────────────────────────────────────────────

export default function NoticiasAdminPage() {
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
    filterPublicada,
    filterDestacada,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setSearch,
    setFilterPublicada,
    setFilterDestacada,
    create,
    update,
    remove,
    publicar,
    despublicar,
    clearError,
  } = useNoticiaStore()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Noticia | null>(null)
  const [deleting, setDeleting] = useState<Noticia | null>(null)

  const form = useForm<NoticiaForm>({
    resolver: zodResolver(noticiaSchema),
    defaultValues: {
      titulo: '',
      resumen: '',
      contenido: '',
      imagen: '',
      autor: '',
      destacada: false,
    },
  })

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditing(null)
    form.reset({
      titulo: '',
      resumen: '',
      contenido: '',
      imagen: '',
      autor: '',
      destacada: false,
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(n: Noticia) {
    setEditing(n)
    form.reset({
      titulo: n.titulo,
      resumen: n.resumen ?? '',
      contenido: n.contenido,
      imagen: n.imagen ?? '',
      autor: n.autor ?? '',
      destacada: n.destacada,
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: NoticiaForm) {
    try {
      if (editing) {
        await update(editing.id, {
          titulo: data.titulo,
          resumen: data.resumen || undefined,
          contenido: data.contenido,
          imagen: data.imagen || undefined,
          autor: data.autor || undefined,
          destacada: data.destacada,
        })
      } else {
        await create({
          titulo: data.titulo,
          resumen: data.resumen || undefined,
          contenido: data.contenido,
          imagen: data.imagen || undefined,
          autor: data.autor || undefined,
          destacada: data.destacada,
          publicada: false,
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

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<Noticia>[] = [
    {
      key: 'titulo',
      header: 'Noticia',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col text-sm">
            <span className="font-medium line-clamp-1">{row.titulo}</span>
            {row.resumen && (
              <span className="text-xs text-muted-foreground line-clamp-1">
                {row.resumen}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'autor',
      header: 'Autor',
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.autor || '—'}
        </span>
      ),
    },
    {
      key: 'fecha',
      header: 'Publicada',
      cell: (row) =>
        row.fecha_publicacion ? (
          <span className="text-xs">{formatDate(row.fecha_publicacion)}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => (
        <div className="flex gap-1">
          <Badge variant={row.publicada ? 'default' : 'secondary'}>
            {row.publicada ? 'Publicada' : 'Borrador'}
          </Badge>
          {row.destacada && (
            <Badge variant="outline" className="gap-1">
              <Star className="h-3 w-3" />
              Destacada
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'acciones',
      header: <span className="text-right">Acciones</span>,
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          {!row.publicada ? (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => publicar(row.id)}
              disabled={!canWrite || isSaving}
              title="Publicar"
            >
              <Globe className="h-4 w-4 text-green-600" />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => despublicar(row.id)}
              disabled={!canWrite || isSaving}
              title="Despublicar"
            >
              <EyeOff className="h-4 w-4 text-orange-600" />
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
          <h1 className="text-2xl font-bold tracking-tight">Noticias</h1>
          <p className="text-sm text-muted-foreground">
            Noticias y comunicados. Las publicadas aparecen en la vista pública.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva noticia
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
          value={
            filterPublicada === undefined ? 'all' : String(filterPublicada)
          }
          onValueChange={(v) => {
            if (v === 'all') setFilterPublicada(undefined)
            else setFilterPublicada(v === 'true')
          }}
        >
          <SelectTrigger className="md:w-44">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="true">Publicadas</SelectItem>
            <SelectItem value="false">Borradores</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={
            filterDestacada === undefined ? 'all' : String(filterDestacada)
          }
          onValueChange={(v) => {
            if (v === 'all') setFilterDestacada(undefined)
            else setFilterDestacada(v === 'true')
          }}
        >
          <SelectTrigger className="md:w-44">
            <SelectValue placeholder="Destacada" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="true">Solo destacadas</SelectItem>
            <SelectItem value="false">No destacadas</SelectItem>
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
        emptyMessage="No hay noticias registradas."
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
              {editing ? 'Editar noticia' : 'Nueva noticia'}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? 'Actualiza el contenido. Para publicar/despublicar usa los botones en la tabla.'
                : 'Las noticias se crean como borrador. Se publican después.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="titulo">Título *</Label>
              <Input id="titulo" {...form.register('titulo')} />
              {form.formState.errors.titulo && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.titulo.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="resumen">Resumen</Label>
              <Textarea
                id="resumen"
                rows={2}
                placeholder="Breve descripción para el listado"
                {...form.register('resumen')}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="contenido">Contenido *</Label>
              <Textarea
                id="contenido"
                rows={6}
                {...form.register('contenido')}
              />
              {form.formState.errors.contenido && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.contenido.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="autor">Autor</Label>
                <Input id="autor" {...form.register('autor')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="imagen">Imagen (ruta o URL)</Label>
                <Input
                  id="imagen"
                  placeholder="noticias/imagen-1.jpg"
                  {...form.register('imagen')}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="destacada"
                className="h-4 w-4"
                {...form.register('destacada')}
              />
              <Label htmlFor="destacada" className="cursor-pointer flex items-center gap-1">
                <Star className="h-4 w-4" />
                Destacar en portada
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
                {editing ? 'Guardar cambios' : 'Crear noticia'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar noticia"
        description={
          deleting
            ? `¿Eliminar la noticia "${deleting.titulo}"?`
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
