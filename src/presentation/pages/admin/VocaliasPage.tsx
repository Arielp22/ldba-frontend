import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CheckCircle2,
  Eye,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react'

import { useVocaliaStore } from '@/presentation/store/vocalia.store'
import { usePartidoAdminStore } from '@/presentation/store/partido-admin.store'
import { useAuthStore } from '@/presentation/store/auth.store'
import { partidoAdminUseCase } from '@/infrastructure/factories/partido-admin.factory'

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
  Vocalia,
  VocaliaEstado,
} from '@/domain/entities/vocalia.entity'

// ─── Schema crear/editar ──────────────────────────────────────────────────────

const vocaliaSchema = z.object({
  partido: z.coerce.number().int().optional().nullable(),
  arbitro: z.string().min(2, 'Mínimo 2 caracteres').max(150),
  vocal: z.string().min(2, 'Mínimo 2 caracteres').max(150),
  goles_local: z.coerce.number().int().min(0).optional().nullable(),
  goles_visitante: z.coerce.number().int().min(0).optional().nullable(),
  informe: z.string().optional(),
  estado: z.enum(['borrador', 'enviada', 'aprobada', 'rechazada']),
})

type VocaliaForm = z.infer<typeof vocaliaSchema>

// ─── Schema rechazar ──────────────────────────────────────────────────────────

const rechazarSchema = z.object({
  observaciones_rechazo: z.string().min(3, 'Mínimo 3 caracteres'),
})

type RechazarForm = z.infer<typeof rechazarSchema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADOS: {
  value: VocaliaEstado
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}[] = [
  { value: 'borrador', label: 'Borrador', variant: 'outline' },
  { value: 'enviada', label: 'Enviada', variant: 'default' },
  { value: 'aprobada', label: 'Aprobada', variant: 'secondary' },
  { value: 'rechazada', label: 'Rechazada', variant: 'destructive' },
]

function estadoVariant(estado: VocaliaEstado) {
  return ESTADOS.find((e) => e.value === estado)?.variant ?? 'outline'
}

function estadoLabel(estado: VocaliaEstado) {
  return ESTADOS.find((e) => e.value === estado)?.label ?? estado
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function VocaliasPage() {
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
    filterEstado,
    filterPartido,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setSearch,
    setFilterEstado,
    setFilterPartido,
    create,
    update,
    remove,
    aprobar,
    rechazar,
    sincronizarResultado,
    clearError,
  } = useVocaliaStore()

  const partidos = usePartidoAdminStore((s) => s.items)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Vocalia | null>(null)
  const [deleting, setDeleting] = useState<Vocalia | null>(null)
  const [rechazando, setRechazando] = useState<Vocalia | null>(null)

  const form = useForm<VocaliaForm>({
    resolver: zodResolver(vocaliaSchema),
    defaultValues: {
      partido: null,
      arbitro: '',
      vocal: '',
      goles_local: null,
      goles_visitante: null,
      informe: '',
      estado: 'borrador',
    },
  })

  const rechazarForm = useForm<RechazarForm>({
    resolver: zodResolver(rechazarSchema),
    defaultValues: { observaciones_rechazo: '' },
  })

  useEffect(() => {
    load()
    // Cargar partidos para el select
    partidoAdminUseCase.list({ pageSize: 200 }).then((r) => {
      usePartidoAdminStore.setState({ items: r.results })
    })
  }, [load])

  function openCreate() {
    setEditing(null)
    form.reset({
      partido: null,
      arbitro: '',
      vocal: '',
      goles_local: null,
      goles_visitante: null,
      informe: '',
      estado: 'borrador',
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(v: Vocalia) {
    setEditing(v)
    form.reset({
      partido: v.partido,
      arbitro: v.arbitro,
      vocal: v.vocal,
      goles_local: v.goles_local,
      goles_visitante: v.goles_visitante,
      informe: v.informe ?? '',
      estado: v.estado,
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: VocaliaForm) {
    try {
      if (editing) {
        await update(editing.id, {
          arbitro: data.arbitro,
          vocal: data.vocal,
          goles_local: data.goles_local,
          goles_visitante: data.goles_visitante,
          informe: data.informe || undefined,
          estado: data.estado,
        })
      } else {
        await create({
          partido: data.partido,
          arbitro: data.arbitro,
          vocal: data.vocal,
          goles_local: data.goles_local,
          goles_visitante: data.goles_visitante,
          informe: data.informe || undefined,
          estado: data.estado,
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

  async function onAprobar(v: Vocalia) {
    try {
      await aprobar(v.id)
    } catch {
      // Error ya en el store
    }
  }

  function openRechazar(v: Vocalia) {
    setRechazando(v)
    rechazarForm.reset({ observaciones_rechazo: '' })
    clearError()
  }

  async function onRechazar(data: RechazarForm) {
    if (!rechazando) return
    try {
      await rechazar(rechazando.id, data.observaciones_rechazo)
      setRechazando(null)
    } catch {
      // Error ya en el store
    }
  }

  async function onSincronizar(v: Vocalia) {
    try {
      await sincronizarResultado(v.id)
    } catch {
      // Error ya en el store
    }
  }

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<Vocalia>[] = [
    {
      key: 'partido',
      header: 'Partido',
      cell: (row) => (
        <div className="flex flex-col text-sm">
          {row.partido_info ? (
            <>
              <span className="font-medium">
                {row.partido_info.equipo_local} vs{' '}
                {row.partido_info.equipo_visitante}
              </span>
              <span className="text-xs text-muted-foreground">
                J{row.partido_info.jornada_numero} ·{' '}
                {row.partido_info.dia} P{row.partido_info.numero_partido}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Sin partido</span>
          )}
        </div>
      ),
    },
    {
      key: 'arbitro_vocal',
      header: 'Árbitro / Vocal',
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span>Árbitro: {row.arbitro}</span>
          <span className="text-muted-foreground">Vocal: {row.vocal}</span>
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
            onClick={() => navigate(`/admin/vocalias/${row.id}`)}
            title="Ver detalle"
          >
            <Eye className="h-4 w-4 text-primary" />
          </Button>

          {row.estado !== 'aprobada' && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onAprobar(row)}
              disabled={!canWrite || isSaving}
              title="Aprobar"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </Button>
          )}

          {row.estado !== 'rechazada' && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => openRechazar(row)}
              disabled={!canWrite}
              title="Rechazar"
            >
              <XCircle className="h-4 w-4 text-orange-600" />
            </Button>
          )}

          {row.goles_local !== null &&
            row.goles_visitante !== null &&
            row.estado === 'aprobada' && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onSincronizar(row)}
                disabled={!canWrite || isSaving}
                title="Sincronizar resultado al partido"
              >
                <RefreshCw className="h-4 w-4 text-blue-600" />
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
          <h1 className="text-2xl font-bold tracking-tight">Vocalías</h1>
          <p className="text-sm text-muted-foreground">
            Hojas de vocalía de cada partido. Un partido = una vocalía.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva vocalía
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        <Input
          placeholder="Buscar por árbitro o vocal…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-xs"
        />
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
        <Select
          value={filterPartido ? String(filterPartido) : 'all'}
          onValueChange={(v) =>
            setFilterPartido(v === 'all' ? undefined : Number(v))
          }
        >
          <SelectTrigger className="md:w-72">
            <SelectValue placeholder="Partido" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los partidos</SelectItem>
            {partidos.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                J{p.jornada_numero} · {p.dia} P{p.numero_partido} ·{' '}
                {p.equipo_local_nombre} vs {p.equipo_visitante_nombre}
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
        emptyMessage="No hay vocalías registradas."
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
              {editing ? 'Editar vocalía' : 'Nueva vocalía'}
            </DialogTitle>
            <DialogDescription>
              Árbitro y vocal se escriben a mano — no hay catálogo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!editing && (
              <div className="space-y-1">
                <Label>Partido</Label>
                <Select
                  value={
                    form.watch('partido')
                      ? String(form.watch('partido'))
                      : ''
                  }
                  onValueChange={(v) =>
                    form.setValue('partido', Number(v))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona partido" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {partidos.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        J{p.jornada_numero} · {p.dia} P{p.numero_partido} ·{' '}
                        {p.equipo_local_nombre} vs {p.equipo_visitante_nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="arbitro">Árbitro *</Label>
                <Input id="arbitro" {...form.register('arbitro')} />
                {form.formState.errors.arbitro && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.arbitro.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="vocal">Vocal *</Label>
                <Input id="vocal" {...form.register('vocal')} />
                {form.formState.errors.vocal && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.vocal.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="goles_local">Goles local</Label>
                <Input
                  id="goles_local"
                  type="number"
                  min={0}
                  {...form.register('goles_local')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="goles_visitante">Goles visitante</Label>
                <Input
                  id="goles_visitante"
                  type="number"
                  min={0}
                  {...form.register('goles_visitante')}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="informe">Informe</Label>
              <Textarea
                id="informe"
                rows={3}
                placeholder="Observaciones del partido…"
                {...form.register('informe')}
              />
            </div>

            <div className="space-y-1">
              <Label>Estado</Label>
              <Select
                value={form.watch('estado')}
                onValueChange={(v) =>
                  form.setValue('estado', v as VocaliaEstado)
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
                {editing ? 'Guardar cambios' : 'Crear vocalía'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog rechazar */}
      <Dialog
        open={!!rechazando}
        onOpenChange={(open) => !open && setRechazando(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar vocalía</DialogTitle>
            <DialogDescription>
              Explica el motivo del rechazo. Es obligatorio.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={rechazarForm.handleSubmit(onRechazar)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="obs-rechazo">Observaciones de rechazo *</Label>
              <Textarea
                id="obs-rechazo"
                rows={3}
                placeholder="Ej: Faltan firmas del árbitro."
                {...rechazarForm.register('observaciones_rechazo')}
              />
              {rechazarForm.formState.errors.observaciones_rechazo && (
                <p className="text-xs text-destructive">
                  {rechazarForm.formState.errors.observaciones_rechazo.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRechazando(null)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Rechazar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirm eliminar */}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar vocalía"
        description={
          deleting
            ? `¿Eliminar la vocalía de ${deleting.arbitro}? Se perderá toda la información del partido.`
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
