import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'

import { useReciboStore } from '@/presentation/store/recibo.store'
import { useMultaStore } from '@/presentation/store/multa.store'
import { useAuthStore } from '@/presentation/store/auth.store'

import { multaUseCase } from '@/infrastructure/factories/multa.factory'

import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Textarea } from '@/presentation/components/ui/textarea'
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
import type { Recibo } from '@/domain/entities/recibo.entity'
import { formatDate, formatMoney } from '@/presentation/utils/formatters'

// ─── Schema ───────────────────────────────────────────────────────────────────

const reciboSchema = z.object({
  multa: z.coerce.number().int().positive('Selecciona una multa'),
  numero: z.string().min(1, 'Requerido').max(50),
  entregado_a: z.string().min(2, 'Mínimo 2 caracteres').max(150),
  entregado_por: z.string().min(2, 'Mínimo 2 caracteres').max(150),
  fecha_entrega: z.string().min(1, 'Requerido'),
  observaciones: z.string().optional(),
})

type ReciboForm = z.infer<typeof reciboSchema>

// ─── Página ───────────────────────────────────────────────────────────────────

export default function RecibosPage() {
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user && (user.is_superuser || user.groups.includes('Comision Penas'))

  const {
    items,
    total,
    page,
    pageSize,
    search,
    filterMulta,
    isLoading,
    isSaving,
    error,
    load,
    setPage,
    setSearch,
    setFilterMulta,
    create,
    update,
    remove,
    clearError,
  } = useReciboStore()

  const multas = useMultaStore((s) => s.items)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Recibo | null>(null)
  const [deleting, setDeleting] = useState<Recibo | null>(null)

  const form = useForm<ReciboForm>({
    resolver: zodResolver(reciboSchema),
    defaultValues: {
      multa: 0,
      numero: '',
      entregado_a: '',
      entregado_por: '',
      fecha_entrega: '',
      observaciones: '',
    },
  })

  useEffect(() => {
    load()
    multaUseCase.list({ pageSize: 200 }).then((r) => {
      useMultaStore.setState({ items: r.results })
    })
  }, [load])

  function openCreate() {
    setEditing(null)
    form.reset({
      multa: 0,
      numero: '',
      entregado_a: '',
      entregado_por: '',
      fecha_entrega: new Date().toISOString().slice(0, 10),
      observaciones: '',
    })
    clearError()
    setDialogOpen(true)
  }

  function openEdit(r: Recibo) {
    setEditing(r)
    form.reset({
      multa: r.multa,
      numero: r.numero,
      entregado_a: r.entregado_a,
      entregado_por: r.entregado_por,
      fecha_entrega: r.fecha_entrega,
      observaciones: r.observaciones ?? '',
    })
    clearError()
    setDialogOpen(true)
  }

  async function onSubmit(data: ReciboForm) {
    try {
      if (editing) {
        await update(editing.id, {
          numero: data.numero,
          entregado_a: data.entregado_a,
          entregado_por: data.entregado_por,
          fecha_entrega: data.fecha_entrega,
          observaciones: data.observaciones || undefined,
        })
      } else {
        await create({
          multa: data.multa,
          numero: data.numero,
          entregado_a: data.entregado_a,
          entregado_por: data.entregado_por,
          fecha_entrega: data.fecha_entrega,
          observaciones: data.observaciones || undefined,
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

  const columns: Column<Recibo>[] = [
    {
      key: 'numero',
      header: 'Nº Recibo',
      cell: (row) => (
        <span className="font-mono font-medium">{row.numero}</span>
      ),
    },
    {
      key: 'multa',
      header: 'Multa',
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium">{formatMoney(row.multa_monto)}</span>
          <span className="text-muted-foreground line-clamp-1">
            {row.multa_motivo}
          </span>
        </div>
      ),
    },
    {
      key: 'entregado_a',
      header: 'Entregado a',
      cell: (row) => (
        <span className="text-sm">{row.entregado_a}</span>
      ),
    },
    {
      key: 'entregado_por',
      header: 'Entregado por',
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.entregado_por}
        </span>
      ),
    },
    {
      key: 'fecha_entrega',
      header: 'Fecha',
      cell: (row) => (
        <span className="text-sm">{formatDate(row.fecha_entrega)}</span>
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
          <h1 className="text-2xl font-bold tracking-tight">Recibos</h1>
          <p className="text-sm text-muted-foreground">
            Recibos únicos por multa pagada.
          </p>
        </div>
        <Button onClick={openCreate} disabled={!canWrite} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo recibo
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-wrap">
        <Input
          placeholder="Buscar por número o persona…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:max-w-xs"
        />
        <Select
          value={filterMulta ? String(filterMulta) : 'all'}
          onValueChange={(v) =>
            setFilterMulta(v === 'all' ? undefined : Number(v))
          }
        >
          <SelectTrigger className="md:w-72">
            <SelectValue placeholder="Multa" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="all">Todas las multas</SelectItem>
            {multas.map((m) => (
              <SelectItem key={m.id} value={String(m.id)}>
                #{m.id} · {formatMoney(m.monto)} · {m.motivo.slice(0, 30)}
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
        emptyMessage="No hay recibos registrados."
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
              {editing ? 'Editar recibo' : 'Nuevo recibo'}
            </DialogTitle>
            <DialogDescription>
              Un recibo es único por multa. El número debe ser único.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!editing && (
              <div className="space-y-1">
                <Label>Multa *</Label>
                <Select
                  value={form.watch('multa') ? String(form.watch('multa')) : ''}
                  onValueChange={(v) => form.setValue('multa', Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona multa" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {multas.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        #{m.id} · {formatMoney(m.monto)} · {m.motivo.slice(0, 30)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.multa && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.multa.message}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="numero">Nº Recibo *</Label>
                <Input
                  id="numero"
                  placeholder="REC-2026-0001"
                  {...form.register('numero')}
                />
                {form.formState.errors.numero && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.numero.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="fecha_entrega">Fecha entrega *</Label>
                <Input
                  id="fecha_entrega"
                  type="date"
                  {...form.register('fecha_entrega')}
                />
                {form.formState.errors.fecha_entrega && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.fecha_entrega.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="entregado_a">Entregado a *</Label>
                <Input
                  id="entregado_a"
                  {...form.register('entregado_a')}
                />
                {form.formState.errors.entregado_a && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.entregado_a.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="entregado_por">Entregado por *</Label>
                <Input
                  id="entregado_por"
                  {...form.register('entregado_por')}
                />
                {form.formState.errors.entregado_por && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.entregado_por.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="obs-recibo">Observaciones</Label>
              <Textarea
                id="obs-recibo"
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
                {editing ? 'Guardar cambios' : 'Crear recibo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Eliminar recibo"
        description={
          deleting
            ? `¿Eliminar el recibo ${deleting.numero}?`
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
