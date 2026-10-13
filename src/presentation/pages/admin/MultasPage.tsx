import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  CircleDollarSign,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'

import { useMultaStore } from '@/presentation/store/multa.store'
import { useEquipoStore } from '@/presentation/store/equipo.store'
import { useSancionStore } from '@/presentation/store/sancion.store'
import { useAuthStore } from '@/presentation/store/auth.store'

import { equipoUseCase } from '@/infrastructure/factories/equipo.factory'
import { sancionUseCase } from '@/infrastructure/factories/sancion.factory'

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
  Multa,
  MultaEstado,
  MultaFormaPago,
} from '@/domain/entities/multa.entity'
import { formatDate, formatMoney } from '@/presentation/utils/formatters'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const multaSchema = z.object({
  sancion: z.coerce.number().int().optional().nullable(),
  equipo: z.coerce.number().int().optional().nullable(),
  monto: z.coerce.number().positive('Debe ser mayor a 0'),
  motivo: z.string().min(3, 'Mínimo 3 caracteres').max(255),
  estado: z.enum(['pendiente', 'pagada', 'condonada']),
  fecha_pago: z.string().optional().nullable(),
  forma_pago: z
    .enum(['efectivo', 'transferencia', 'deposito', 'otro'])
    .optional()
    .nullable(),
  observaciones: z.string().optional(),
})

type MultaForm = z.infer<typeof multaSchema>

const pagarSchema = z.object({
  fecha_pago: z.string().min(1, 'Requerido'),
  forma_pago: z.enum(['efectivo', 'transferencia', 'deposito', 'otro']),
})

type PagarForm = z.infer<typeof pagarSchema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADOS: {
  value: MultaEstado
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
}[] = [
  { value: 'pendiente', label: 'Pendiente', variant: 'destructive' },
  { value: 'pagada', label: 'Pagada', variant: 'default' },
  { value: 'condonada', label: 'Condonada', variant: 'outline' },
]

const FORMAS: { value: MultaFormaPago; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'deposito', label: 'Depósito' },
  { value: 'otro', label: 'Otro' },
]

function estadoVariant(estado: MultaEstado) {
  return ESTADOS.find((e) => e.value === estado)?.variant ?? 'outline'
}

function estadoLabel(estado: MultaEstado) {
  return ESTADOS.find((e) => e.value === estado)?.label ?? estado
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function MultasPage() {
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user && (user.is_superuser || user.groups.includes('Comision Penas'))

  const {
    items,
    total,
    page,
    pageSize,
    search,
    filterEstado,
    filterEquipo,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setSearch,
    setFilterEstado,
    setFilterEquipo,
    create,
    update,
    remove,
    marcarPagada,
    clearError,
  } = useMultaStore()

  const equipos = useEquipoStore((s) => s.items)
  const sanciones = useSancionStore((s) => s.items)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Multa | null>(null)
  const [deleting, setDeleting] = useState<Multa | null>(null)
  const [pagando, setPagando] = useState<Multa | null>(null)

  const form = useForm<MultaForm>({
    resolver: zodResolver(multaSchema),
    defaultValues: {
      sancion: null,
      equipo: null,
      monto: 0,
      motivo: '',
      estado: 'pendiente',
      fecha_pago: null,
      forma_pago: null,
      observaciones: '',
    },
  })

  const pagarForm = useForm<PagarForm>({
    resolver: zodResolver(pagarSchema),
    defaultValues: { fecha_pago: '', forma_pago: 'efectivo' },
  })

  useEffect(() => {
    load()
    equipoUseCase.list({ pageSize: 200, activo: true }).then((r) => {
      useEquipoStore.setState({ items: r.results })
    })
    sancionUseCase.list({ pageSize: 200 }).then((r) => {
      useSancionStore.setState({ items: r.results })
    })
  }, [load])

  function openCreate() {
    setEditing(null)
    form.reset({
      sancion: null,
      equipo: null,
      monto: 0,
      motivo: '',
      estado: 'pendiente',
      fecha_pago: null,
      forma_pago: null,
      observaciones: '',
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(m: Multa) {
    setEditing(m)
    form.reset({
      sancion: m.sancion,
      equipo: m.equipo,
      monto: Number(m.monto),
      motivo: m.motivo,
      estado: m.estado,
      fecha_pago: m.fecha_pago,
      forma_pago: m.forma_pago,
      observaciones: m.observaciones ?? '',
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: MultaForm) {
    try {
      if (editing) {
        await update(editing.id, {
          monto: data.monto,
          motivo: data.motivo,
          estado: data.estado,
          fecha_pago: data.fecha_pago || null,
          forma_pago: data.forma_pago || null,
          observaciones: data.observaciones || undefined,
        })
      } else {
        await create({
          sancion: data.sancion,
          equipo: data.equipo,
          monto: data.monto,
          motivo: data.motivo,
          estado: data.estado,
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

  function openPagar(m: Multa) {
    setPagando(m)
    pagarForm.reset({
      fecha_pago: new Date().toISOString().slice(0, 10),
      forma_pago: 'efectivo',
    })
    clearError()
  }

  async function onPagar(data: PagarForm) {
    if (!pagando) return
    try {
      await marcarPagada(pagando.id, {
        fecha_pago: data.fecha_pago,
        forma_pago: data.forma_pago,
      })
      setPagando(null)
    } catch {
      // Error ya en el store
    }
  }

  // ─── Columnas ────────────────────────────────────────────────────────────────

  const columns: Column<Multa>[] = [
    {
      key: 'equipo',
      header: 'Equipo',
      cell: (row) => (
        <span className="text-sm font-medium">
          {row.equipo_nombre || '—'}
        </span>
      ),
    },
    {
      key: 'motivo',
      header: 'Motivo',
      cell: (row) => (
        <span className="text-sm line-clamp-1">{row.motivo}</span>
      ),
    },
    {
      key: 'monto',
      header: 'Monto',
      cell: (row) => (
        <span className="font-mono font-medium">
          {formatMoney(row.monto)}
        </span>
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
      key: 'pago',
      header: 'Pago',
      cell: (row) =>
        row.fecha_pago ? (
          <div className="flex flex-col text-xs">
            <span>{formatDate(row.fecha_pago)}</span>
            {row.forma_pago_display && (
              <span className="text-muted-foreground">
                {row.forma_pago_display}
              </span>
            )}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'acciones',
      header: <span className="text-right">Acciones</span>,
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end gap-1">
          {row.estado === 'pendiente' && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => openPagar(row)}
              disabled={!canWrite || isSaving}
              title="Marcar como pagada"
            >
              <CircleDollarSign className="h-4 w-4 text-green-600" />
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
          <h1 className="text-2xl font-bold tracking-tight">Multas</h1>
          <p className="text-sm text-muted-foreground">
            Multas aplicadas a equipos. Algunas pueden venir de una sanción.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva multa
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        <Input
          placeholder="Buscar por motivo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-xs"
        />
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
        emptyMessage="No hay multas registradas."
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
              {editing ? 'Editar multa' : 'Nueva multa'}
            </DialogTitle>
            <DialogDescription>
              Puede estar asociada a una sanción y a un equipo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!editing && (
              <>
                <div className="space-y-1">
                  <Label>Sanción (opcional)</Label>
                  <Select
                    value={
                      form.watch('sancion')
                        ? String(form.watch('sancion'))
                        : 'none'
                    }
                    onValueChange={(v) =>
                      form.setValue(
                        'sancion',
                        v === 'none' ? null : Number(v),
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sin sanción" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      <SelectItem value="none">Sin sanción</SelectItem>
                      {sanciones.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          #{s.id} · {s.motivo.slice(0, 40)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Equipo (opcional)</Label>
                  <Select
                    value={
                      form.watch('equipo')
                        ? String(form.watch('equipo'))
                        : 'none'
                    }
                    onValueChange={(v) =>
                      form.setValue(
                        'equipo',
                        v === 'none' ? null : Number(v),
                      )
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
                <Label htmlFor="monto">Monto (USD) *</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...form.register('monto')}
                />
                {form.formState.errors.monto && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.monto.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Estado</Label>
                <Select
                  value={form.watch('estado')}
                  onValueChange={(v) =>
                    form.setValue('estado', v as MultaEstado)
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

            <div className="space-y-1">
              <Label htmlFor="motivo">Motivo *</Label>
              <Input
                id="motivo"
                placeholder="Multa por tarjeta roja"
                {...form.register('motivo')}
              />
              {form.formState.errors.motivo && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.motivo.message}
                </p>
              )}
            </div>

            {editing && form.watch('estado') === 'pagada' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="fecha_pago">Fecha de pago</Label>
                  <Input
                    id="fecha_pago"
                    type="date"
                    {...form.register('fecha_pago')}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Forma de pago</Label>
                  <Select
                    value={form.watch('forma_pago') ?? ''}
                    onValueChange={(v) =>
                      form.setValue('forma_pago', v as MultaFormaPago)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {FORMAS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="obs-multa">Observaciones</Label>
              <Textarea
                id="obs-multa"
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
                {editing ? 'Guardar cambios' : 'Crear multa'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog marcar pagada */}
      <Dialog
        open={!!pagando}
        onOpenChange={(open) => !open && setPagando(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar multa como pagada</DialogTitle>
            <DialogDescription>
              {pagando
                ? `${formatMoney(pagando.monto)} — ${pagando.motivo}`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={pagarForm.handleSubmit(onPagar)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="fecha_pago_modal">Fecha de pago *</Label>
              <Input
                id="fecha_pago_modal"
                type="date"
                {...pagarForm.register('fecha_pago')}
              />
              {pagarForm.formState.errors.fecha_pago && (
                <p className="text-xs text-destructive">
                  {pagarForm.formState.errors.fecha_pago.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Forma de pago *</Label>
              <Select
                value={pagarForm.watch('forma_pago')}
                onValueChange={(v) =>
                  pagarForm.setValue('forma_pago', v as MultaFormaPago)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMAS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setPagando(null)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Marcar como pagada
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar multa"
        description={
          deleting
            ? `¿Eliminar la multa de ${formatMoney(deleting.monto)}?`
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
