import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'

import { sesionUseCase } from '@/infrastructure/factories/sesion.factory'
import { useSesionParticipanteStore } from '@/presentation/store/sesion-participante.store'
import { useAuthStore } from '@/presentation/store/auth.store'

import type { Sesion } from '@/domain/entities/sesion.entity'

import { Button } from '@/presentation/components/ui/button'
import { Input } from '@/presentation/components/ui/input'
import { Label } from '@/presentation/components/ui/label'
import { Badge } from '@/presentation/components/ui/badge'
import { Separator } from '@/presentation/components/ui/separator'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import ConfirmDialog from '@/presentation/components/shared/ConfirmDialog'
import type { SesionParticipante } from '@/domain/entities/sesion-participante.entity'
import { formatDate } from '@/presentation/utils/formatters'

// ─── Schema agregar participante ──────────────────────────────────────────────

const participanteSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(150),
  cargo: z.string().max(150).optional(),
  presente: z.boolean(),
  observaciones: z.string().max(255).optional(),
})

type ParticipanteForm = z.infer<typeof participanteSchema>

// ─── Página ───────────────────────────────────────────────────────────────────

export default function SesionDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user &&
    (user.is_superuser || user.groups.includes('Comision Administrativa'))

  const {
    items: participantes,
    isLoading: loadingParticipantes,
    isSaving: savingParticipante,
    loadBySesion,
    create: crearParticipante,
    update: actualizarParticipante,
    remove: eliminarParticipante,
    clear: limpiarParticipantes,
    clearError: clearParticipanteError,
  } = useSesionParticipanteStore()

  const [sesion, setSesion] = useState<Sesion | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState<SesionParticipante | null>(null)

  const sesionId = Number(id)

  const form = useForm<ParticipanteForm>({
    resolver: zodResolver(participanteSchema),
    defaultValues: {
      nombre: '',
      cargo: '',
      presente: true,
      observaciones: '',
    },
  })

  async function cargarSesion() {
    if (!sesionId) return
    setIsLoading(true)
    setError(null)
    try {
      const s = await sesionUseCase.get(sesionId)
      setSesion(s)
      await loadBySesion(sesionId)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      setError(e.detail ?? e.message ?? 'Error al cargar la sesión')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarSesion()
    return () => {
      limpiarParticipantes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionId])

  async function onFinalizar() {
    if (!sesion) return
    setIsSaving(true)
    try {
      const updated = await sesionUseCase.finalizar(sesion.id)
      setSesion(updated)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      setError(e.detail ?? e.message ?? 'Error al finalizar')
    } finally {
      setIsSaving(false)
    }
  }

  function openAgregar() {
    form.reset({
      nombre: '',
      cargo: '',
      presente: true,
      observaciones: '',
    })
    clearParticipanteError()
    setDialogOpen(true)
  }

  async function onAgregar(data: ParticipanteForm) {
    if (!sesion) return
    try {
      await crearParticipante({
        sesion: sesion.id,
        nombre: data.nombre,
        cargo: data.cargo || undefined,
        presente: data.presente,
        observaciones: data.observaciones || undefined,
      })
      setDialogOpen(false)
    } catch {
      // Error ya en el store
    }
  }

  async function togglePresente(p: SesionParticipante) {
    try {
      await actualizarParticipante(p.id, { presente: !p.presente })
    } catch {
      // Error ya en el store
    }
  }

  async function onEliminar() {
    if (!deleting || !sesion) return
    try {
      await eliminarParticipante(deleting.id, sesion.id)
      setDeleting(null)
    } catch {
      // Error ya en el store
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  if (error && !sesion) {
    return (
      <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    )
  }

  if (!sesion) {
    return <p className="text-muted-foreground">Sesión no encontrada.</p>
  }

  const puedeFinalizar = sesion.estado !== 'finalizada'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/sesiones')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Sesión {formatDate(sesion.fecha)}
            </h1>
            <p className="text-sm text-muted-foreground">
              {sesion.tipo_display}
            </p>
          </div>
        </div>
        {puedeFinalizar && (
          <Button
            onClick={onFinalizar}
            disabled={!canWrite || isSaving}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Finalizar sesión
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">Información</CardTitle>
            <CardDescription>Datos de la sesión</CardDescription>
          </div>
          <Badge
            variant={
              sesion.estado === 'finalizada'
                ? 'secondary'
                : sesion.estado === 'cancelada'
                  ? 'destructive'
                  : 'outline'
            }
          >
            {sesion.estado_display}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {sesion.orden_del_dia && (
            <div className="text-sm">
              <p className="text-muted-foreground mb-1">Orden del día:</p>
              <p className="whitespace-pre-wrap">{sesion.orden_del_dia}</p>
            </div>
          )}

          {sesion.acta && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Acta:</p>
                <p className="whitespace-pre-wrap">{sesion.acta}</p>
              </div>
            </>
          )}

          {sesion.observaciones && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Observaciones:</p>
                <p>{sesion.observaciones}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Participantes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">Participantes</CardTitle>
            <CardDescription>
              {participantes.length} persona(s) ·{' '}
              {participantes.filter((p) => p.presente).length} presente(s)
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={openAgregar}
            disabled={!canWrite}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
        </CardHeader>
        <CardContent>
          {loadingParticipantes ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : participantes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay participantes registrados.
            </p>
          ) : (
            <div className="space-y-2">
              {participantes.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <button
                    onClick={() => togglePresente(p)}
                    disabled={!canWrite || savingParticipante}
                    className="disabled:cursor-not-allowed"
                    title="Clic para cambiar asistencia"
                  >
                    {p.presente ? (
                      <UserCheck className="h-5 w-5 text-green-600" />
                    ) : (
                      <UserX className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{p.nombre}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.cargo || 'Sin cargo'}
                    </div>
                  </div>
                  <Badge variant={p.presente ? 'default' : 'secondary'}>
                    {p.presente ? 'Presente' : 'Ausente'}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleting(p)}
                    disabled={!canWrite}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog agregar participante */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar participante</DialogTitle>
            <DialogDescription>
              Registra a una persona que participó en la sesión.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onAgregar)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input id="nombre" {...form.register('nombre')} />
              {form.formState.errors.nombre && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.nombre.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                placeholder="Presidente Comisión Técnica"
                {...form.register('cargo')}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="presente"
                className="h-4 w-4"
                {...form.register('presente')}
              />
              <Label htmlFor="presente" className="cursor-pointer">
                Presente
              </Label>
            </div>

            <div className="space-y-1">
              <Label htmlFor="obs-part">Observaciones</Label>
              <Input
                id="obs-part"
                {...form.register('observaciones')}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={savingParticipante}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={savingParticipante}>
                {savingParticipante && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Agregar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Quitar participante"
        description={
          deleting
            ? `¿Quitar a "${deleting.nombre}" de la sesión?`
            : ''
        }
        confirmText="Quitar"
        variant="destructive"
        onConfirm={onEliminar}
        isLoading={savingParticipante}
      />
    </div>
  )
}
