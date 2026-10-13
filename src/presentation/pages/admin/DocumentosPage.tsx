import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FileText, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

import { useDocumentoStore } from '@/presentation/store/documento.store'
import { useJugadorStore } from '@/presentation/store/jugador.store'
import { useEquipoStore } from '@/presentation/store/equipo.store'
import { useSesionStore } from '@/presentation/store/sesion.store'
import { useAuthStore } from '@/presentation/store/auth.store'

import { jugadorUseCase } from '@/infrastructure/factories/jugador.factory'
import { equipoUseCase } from '@/infrastructure/factories/equipo.factory'
import { sesionUseCase } from '@/infrastructure/factories/sesion.factory'

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
  Documento,
  DocumentoTipo,
} from '@/domain/entities/documento.entity'
import { formatDate } from '@/presentation/utils/formatters'

// ─── Schema ───────────────────────────────────────────────────────────────────

const documentoSchema = z.object({
  tipo: z.enum(['cedula', 'acta', 'factura', 'informe', 'carnet', 'otro']),
  titulo: z.string().min(3, 'Mínimo 3 caracteres').max(255),
  descripcion: z.string().optional(),
  archivo: z.string().min(1, 'Requerido').max(500),
  mime_type: z.string().max(100).optional(),
  jugador: z.coerce.number().int().optional().nullable(),
  equipo: z.coerce.number().int().optional().nullable(),
  sesion: z.coerce.number().int().optional().nullable(),
})

type DocumentoForm = z.infer<typeof documentoSchema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPOS: { value: DocumentoTipo; label: string }[] = [
  { value: 'cedula', label: 'Cédula' },
  { value: 'acta', label: 'Acta' },
  { value: 'factura', label: 'Factura' },
  { value: 'informe', label: 'Informe' },
  { value: 'carnet', label: 'Carnet' },
  { value: 'otro', label: 'Otro' },
]

// ─── Página ───────────────────────────────────────────────────────────────────

export default function DocumentosPage() {
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
    filterJugador,    
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setSearch,
    setFilterTipo,
    setFilterJugador,    
    create,
    update,
    remove,
    clearError,
  } = useDocumentoStore()

  const jugadores = useJugadorStore((s) => s.items)
  const equipos = useEquipoStore((s) => s.items)
  const sesiones = useSesionStore((s) => s.items)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Documento | null>(null)
  const [deleting, setDeleting] = useState<Documento | null>(null)

  const form = useForm<DocumentoForm>({
    resolver: zodResolver(documentoSchema),
    defaultValues: {
      tipo: 'otro',
      titulo: '',
      descripcion: '',
      archivo: '',
      mime_type: '',
      jugador: null,
      equipo: null,
      sesion: null,
    },
  })

  useEffect(() => {
    load()
    jugadorUseCase.list({ pageSize: 500, activo: true }).then((r) => {
      useJugadorStore.setState({ items: r.results })
    })
    equipoUseCase.list({ pageSize: 200, activo: true }).then((r) => {
      useEquipoStore.setState({ items: r.results })
    })
    sesionUseCase.list({ pageSize: 200 }).then((r) => {
      useSesionStore.setState({ items: r.results })
    })
  }, [load])

  function openCreate() {
    setEditing(null)
    form.reset({
      tipo: 'otro',
      titulo: '',
      descripcion: '',
      archivo: '',
      mime_type: '',
      jugador: null,
      equipo: null,
      sesion: null,
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(d: Documento) {
    setEditing(d)
    form.reset({
      tipo: d.tipo,
      titulo: d.titulo,
      descripcion: d.descripcion ?? '',
      archivo: d.archivo,
      mime_type: d.mime_type ?? '',
      jugador: d.jugador,
      equipo: d.equipo,
      sesion: d.sesion,
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: DocumentoForm) {
    try {
      if (editing) {
        await update(editing.id, {
          tipo: data.tipo,
          titulo: data.titulo,
          descripcion: data.descripcion || undefined,
          archivo: data.archivo,
          mime_type: data.mime_type || undefined,
          jugador: data.jugador,
          equipo: data.equipo,
          sesion: data.sesion,
        })
      } else {
        await create({
          tipo: data.tipo,
          titulo: data.titulo,
          descripcion: data.descripcion || undefined,
          archivo: data.archivo,
          mime_type: data.mime_type || undefined,
          jugador: data.jugador,
          equipo: data.equipo,
          sesion: data.sesion,
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

  const columns: Column<Documento>[] = [
    {
      key: 'titulo',
      header: 'Documento',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col text-sm">
            <span className="font-medium line-clamp-1">{row.titulo}</span>
            <span className="text-xs text-muted-foreground font-mono">
              {row.archivo}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      cell: (row) => <Badge variant="outline">{row.tipo_display}</Badge>,
    },
    {
      key: 'relacionado',
      header: 'Asociado a',
      cell: (row) => {
        if (row.jugador_nombre)
          return (
            <span className="text-xs text-muted-foreground">
              👤 {row.jugador_nombre}
            </span>
          )
        if (row.equipo_nombre)
          return (
            <span className="text-xs text-muted-foreground">
              🛡 {row.equipo_nombre}
            </span>
          )
        if (row.sesion)
          return (
            <span className="text-xs text-muted-foreground">
              📋 Sesión #{row.sesion}
            </span>
          )
        return <span className="text-xs text-muted-foreground">—</span>
      },
    },
    {
      key: 'created_at',
      header: 'Fecha',
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.created_at)}
        </span>
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
          <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
          <p className="text-sm text-muted-foreground">
            Metadatos de archivos (cédulas, actas, facturas, informes).
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo documento
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
          value={filterJugador ? String(filterJugador) : 'all'}
          onValueChange={(v) =>
            setFilterJugador(v === 'all' ? undefined : Number(v))
          }
        >
          <SelectTrigger className="md:w-56">
            <SelectValue placeholder="Jugador" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">Todos los jugadores</SelectItem>
            {jugadores.map((j) => (
              <SelectItem key={j.id} value={String(j.id)}>
                {j.apellidos}, {j.nombres}
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
        emptyMessage="No hay documentos registrados."
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
              {editing ? 'Editar documento' : 'Nuevo documento'}
            </DialogTitle>
            <DialogDescription>
              Solo se guardan metadatos (ruta del archivo). No se sube el
              archivo en sí.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select
                  value={form.watch('tipo')}
                  onValueChange={(v) =>
                    form.setValue('tipo', v as DocumentoTipo)
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
              <div className="space-y-1">
                <Label htmlFor="titulo">Título *</Label>
                <Input id="titulo" {...form.register('titulo')} />
                {form.formState.errors.titulo && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.titulo.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="archivo">Archivo (ruta o URL) *</Label>
              <Input
                id="archivo"
                placeholder="documentos/cedulas/1712345678.pdf"
                {...form.register('archivo')}
              />
              {form.formState.errors.archivo && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.archivo.message}
                </p>
              )}
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
              <Label>Asociar a jugador (opcional)</Label>
              <Select
                value={
                  form.watch('jugador') ? String(form.watch('jugador')) : 'none'
                }
                onValueChange={(v) =>
                  form.setValue('jugador', v === 'none' ? null : Number(v))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin jugador" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="none">Sin jugador</SelectItem>
                  {jugadores.map((j) => (
                    <SelectItem key={j.id} value={String(j.id)}>
                      {j.apellidos}, {j.nombres}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Asociar a equipo (opcional)</Label>
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

            <div className="space-y-1">
              <Label>Asociar a sesión (opcional)</Label>
              <Select
                value={
                  form.watch('sesion') ? String(form.watch('sesion')) : 'none'
                }
                onValueChange={(v) =>
                  form.setValue('sesion', v === 'none' ? null : Number(v))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin sesión" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="none">Sin sesión</SelectItem>
                  {sesiones.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {formatDate(s.fecha)} — {s.tipo_display}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                {editing ? 'Guardar cambios' : 'Crear documento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar documento"
        description={
          deleting
            ? `¿Eliminar el documento "${deleting.titulo}"?`
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
