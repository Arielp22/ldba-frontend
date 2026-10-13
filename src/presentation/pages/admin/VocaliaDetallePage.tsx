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
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react'

import { vocaliaUseCase } from '@/infrastructure/factories/vocalia.factory'
import { plantillaUseCase } from '@/infrastructure/factories/plantilla.factory'
import { useVocaliaJugadorStore } from '@/presentation/store/vocalia-jugador.store'
import { usePlantillaStore } from '@/presentation/store/plantilla.store'
import { useAuthStore } from '@/presentation/store/auth.store'

import type { Vocalia } from '@/domain/entities/vocalia.entity'
import type { VocaliaJugador } from '@/domain/entities/vocalia-jugador.entity'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import ConfirmDialog from '@/presentation/components/shared/ConfirmDialog'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const agregarSchema = z.object({
  jugador: z.coerce.number().int().positive('Selecciona un jugador'),
  equipo: z.coerce.number().int().positive('Selecciona un equipo'),
  goles: z.coerce.number().int().min(0),
  tarjeta_amarilla: z.boolean(),
  tarjeta_roja: z.boolean(),
  es_capitan: z.boolean(),
  ingreso_minuto: z.union([z.coerce.number().int().min(0), z.nan()]).nullable(),
  salida_minuto: z.union([z.coerce.number().int().min(0), z.nan()]).nullable(),
})

type AgregarForm = z.infer<typeof agregarSchema>

const rechazarSchema = z.object({
  observaciones_rechazo: z.string().min(3, 'Mínimo 3 caracteres'),
})

type RechazarForm = z.infer<typeof rechazarSchema>

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADO_VARIANT: Record<
  Vocalia['estado'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  borrador: 'outline',
  enviada: 'default',
  aprobada: 'secondary',
  rechazada: 'destructive',
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function VocaliaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user && (user.is_superuser || user.groups.includes('Comision Tecnica'))

  const {
    items: jugadores,
    isLoading: loadingJugadores,
    isSaving: savingJugador,
    loadByVocalia,
    create: crearJugador,
    remove: eliminarJugador,
    clear: limpiarJugadores,
    clearError: clearJugadorError,
  } = useVocaliaJugadorStore()

  const plantillas = usePlantillaStore((s) => s.items)

  const [vocalia, setVocalia] = useState<Vocalia | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [rechazarOpen, setRechazarOpen] = useState(false)
  const [deletingJugador, setDeletingJugador] =
    useState<VocaliaJugador | null>(null)

  const vocaliaId = Number(id)

  const agregarForm = useForm<AgregarForm>({
    resolver: zodResolver(agregarSchema),
    defaultValues: {
      jugador: 0,
      equipo: 0,
      goles: 0,
      tarjeta_amarilla: false,
      tarjeta_roja: false,
      es_capitan: false,
      ingreso_minuto: null,
      salida_minuto: null,
    },
  })

  const rechazarForm = useForm<RechazarForm>({
    resolver: zodResolver(rechazarSchema),
    defaultValues: { observaciones_rechazo: '' },
  })

  async function cargarVocalia() {
    if (!vocaliaId) return
    setIsLoading(true)
    setError(null)
    try {
      const v = await vocaliaUseCase.get(vocaliaId)
      setVocalia(v)
      await loadByVocalia(vocaliaId)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      setError(e.detail ?? e.message ?? 'Error al cargar la vocalía')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarVocalia()
    return () => {
      limpiarJugadores()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vocaliaId])

  // ─── Acciones sobre la vocalía ────────────────────────────────────────────────

  async function onAprobar() {
    if (!vocalia) return
    setIsSaving(true)
    try {
      const updated = await vocaliaUseCase.aprobar(vocalia.id)
      setVocalia(updated)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      setError(e.detail ?? e.message ?? 'Error al aprobar')
    } finally {
      setIsSaving(false)
    }
  }

  async function onRechazar(data: RechazarForm) {
    if (!vocalia) return
    setIsSaving(true)
    try {
      const updated = await vocaliaUseCase.rechazar(
        vocalia.id,
        data.observaciones_rechazo,
      )
      setVocalia(updated)
      setRechazarOpen(false)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      setError(e.detail ?? e.message ?? 'Error al rechazar')
    } finally {
      setIsSaving(false)
    }
  }

  async function onSincronizar() {
    if (!vocalia) return
    setIsSaving(true)
    try {
      const updated = await vocaliaUseCase.sincronizarResultado(vocalia.id)
      setVocalia(updated)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      setError(e.detail ?? e.message ?? 'Error al sincronizar')
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Acciones sobre jugadores ─────────────────────────────────────────────────

  function openAgregar() {
    agregarForm.reset({
      jugador: 0,
      equipo: 0,
      goles: 0,
      tarjeta_amarilla: false,
      tarjeta_roja: false,
      es_capitan: false,
      ingreso_minuto: null,
      salida_minuto: null,
    })
    clearJugadorError()
    setDialogOpen(true)

    // Cargar plantilla de los 2 equipos del partido
    if (vocalia?.partido_info) {
      // En lugar de cargar todos, cargamos la plantilla completa
      // (podría filtrarse por los 2 equipos si supiéramos los IDs)
      plantillaUseCase.list({ pageSize: 500, activo: true }).then((r) => {
        usePlantillaStore.setState({ items: r.results })
      })
    }
  }

  async function onAgregar(data: AgregarForm) {
    if (!vocalia) return
    try {
      await crearJugador({
        vocalia: vocalia.id,
        jugador: data.jugador,
        equipo: data.equipo,
        goles: data.goles ?? 0,
        tarjeta_amarilla: data.tarjeta_amarilla ?? false,
        tarjeta_roja: data.tarjeta_roja ?? false,
        es_capitan: data.es_capitan ?? false,
        ingreso_minuto: data.ingreso_minuto ?? null,
        salida_minuto: data.salida_minuto ?? null,
      })
      setDialogOpen(false)
    } catch {
      // Error ya está en el store
    }
  }

  async function onEliminarJugador() {
    if (!deletingJugador || !vocalia) return
    try {
      await eliminarJugador(deletingJugador.id, vocalia.id)
      setDeletingJugador(null)
    } catch {
      // Error ya está en el store
    }
  }

  // ─── Cálculo de plantillas únicas para el select ────────────────────────────

  const jugadoresUnicos = plantillas.reduce<Record<number, string>>(
    (acc, p) => {
      if (!acc[p.jugador]) acc[p.jugador] = p.jugador_nombre
      return acc
    },
    {},
  )

  const equiposUnicos = plantillas.reduce<Record<number, string>>(
    (acc, p) => {
      if (!acc[p.equipo]) acc[p.equipo] = p.equipo_nombre
      return acc
    },
    {},
  )

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

  if (error && !vocalia) {
    return (
      <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    )
  }

  if (!vocalia) {
    return <p className="text-muted-foreground">Vocalía no encontrada.</p>
  }

  const puedeAprobar = vocalia.estado !== 'aprobada'
  const puedeRechazar = vocalia.estado !== 'rechazada'
  const puedeSincronizar =
    vocalia.estado === 'aprobada' &&
    vocalia.goles_local !== null &&
    vocalia.goles_visitante !== null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/vocalias')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Vocalía #{vocalia.id}
            </h1>
            <p className="text-sm text-muted-foreground">
              {vocalia.partido_info
                ? `${vocalia.partido_info.equipo_local} vs ${vocalia.partido_info.equipo_visitante}`
                : 'Sin partido asociado'}
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {puedeAprobar && (
            <Button
              onClick={onAprobar}
              disabled={!canWrite || isSaving}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Aprobar
            </Button>
          )}
          {puedeRechazar && (
            <Button
              variant="destructive"
              onClick={() => setRechazarOpen(true)}
              disabled={!canWrite || isSaving}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Rechazar
            </Button>
          )}
          {puedeSincronizar && (
            <Button
              variant="outline"
              onClick={onSincronizar}
              disabled={!canWrite || isSaving}
              className="gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Sincronizar resultado
            </Button>
          )}
        </div>
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
            <CardDescription>Datos del partido y la vocalía</CardDescription>
          </div>
          <Badge variant={ESTADO_VARIANT[vocalia.estado]}>
            {vocalia.estado_display}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {vocalia.partido_info && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Jornada:</span>{' '}
                <span className="font-medium">
                  J{vocalia.partido_info.jornada_numero}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Día / Nº:</span>{' '}
                <span className="font-medium">
                  {vocalia.partido_info.dia} P
                  {vocalia.partido_info.numero_partido}
                </span>
              </div>
              {vocalia.partido_info.hora && (
                <div>
                  <span className="text-muted-foreground">Hora:</span>{' '}
                  <span className="font-mono">
                    {vocalia.partido_info.hora.slice(0, 5)}
                  </span>
                </div>
              )}
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">Árbitro:</span>{' '}
              <span className="font-medium">{vocalia.arbitro}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Vocal:</span>{' '}
              <span className="font-medium">{vocalia.vocal}</span>
            </div>
          </div>

          {(vocalia.goles_local !== null ||
            vocalia.goles_visitante !== null) && (
              <div className="rounded-md bg-muted/40 p-3 text-center">
                <div className="text-3xl font-bold font-mono">
                  {vocalia.goles_local ?? '—'} - {vocalia.goles_visitante ?? '—'}
                </div>
                <div className="text-xs text-muted-foreground">Resultado</div>
              </div>
            )}

          {vocalia.informe && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Informe:</p>
                <p className="whitespace-pre-wrap">{vocalia.informe}</p>
              </div>
            </>
          )}

          {vocalia.observaciones_rechazo && (
            <>
              <Separator />
              <div className="rounded-md bg-destructive/10 p-3 text-sm">
                <p className="font-medium text-destructive mb-1">
                  Motivo del rechazo:
                </p>
                <p>{vocalia.observaciones_rechazo}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Jugadores */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">Jugadores</CardTitle>
            <CardDescription>
              {jugadores.length} jugador(es) registrado(s)
            </CardDescription>
          </div>
          <Button
            size="sm"
            onClick={openAgregar}
            disabled={!canWrite}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar jugador
          </Button>
        </CardHeader>
        <CardContent>
          {loadingJugadores ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : jugadores.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay jugadores registrados en esta vocalía.
            </p>
          ) : (
            <div className="space-y-2">
              {jugadores.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {j.jugador_nombre}
                      {j.es_capitan && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Capitán
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {j.equipo_nombre}
                      {j.ingreso_minuto !== null &&
                        ` · Ingresó min ${j.ingreso_minuto}`}
                      {j.salida_minuto !== null &&
                        ` · Salió min ${j.salida_minuto}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {j.goles > 0 && (
                      <Badge variant="default" className="text-xs">
                        ⚽ {j.goles}
                      </Badge>
                    )}
                    {j.tarjeta_amarilla && (
                      <Badge className="bg-yellow-500 text-xs">🟨</Badge>
                    )}
                    {j.tarjeta_roja && (
                      <Badge className="bg-red-600 text-xs">🟥</Badge>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeletingJugador(j)}
                      disabled={!canWrite}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog agregar jugador */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar jugador</DialogTitle>
            <DialogDescription>
              Selecciona un jugador y el equipo con el que actuó en este
              partido.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={agregarForm.handleSubmit(onAgregar)}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label>Equipo</Label>
              <Select
                value={
                  agregarForm.watch('equipo')
                    ? String(agregarForm.watch('equipo'))
                    : ''
                }
                onValueChange={(v) =>
                  agregarForm.setValue('equipo', Number(v))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona equipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(equiposUnicos).map(([id, nombre]) => (
                    <SelectItem key={id} value={id}>
                      {nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {agregarForm.formState.errors.equipo && (
                <p className="text-xs text-destructive">
                  {agregarForm.formState.errors.equipo.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Jugador</Label>
              <Select
                value={
                  agregarForm.watch('jugador')
                    ? String(agregarForm.watch('jugador'))
                    : ''
                }
                onValueChange={(v) =>
                  agregarForm.setValue('jugador', Number(v))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona jugador" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {Object.entries(jugadoresUnicos).map(([id, nombre]) => (
                    <SelectItem key={id} value={id}>
                      {nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {agregarForm.formState.errors.jugador && (
                <p className="text-xs text-destructive">
                  {agregarForm.formState.errors.jugador.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="goles">Goles</Label>
                <Input
                  id="goles"
                  type="number"
                  min={0}
                  {...agregarForm.register('goles')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ingreso">Ingreso min</Label>
                <Input
                  id="ingreso"
                  type="number"
                  min={0}
                  {...agregarForm.register('ingreso_minuto')}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="salida">Salida min</Label>
                <Input
                  id="salida"
                  type="number"
                  min={0}
                  {...agregarForm.register('salida_minuto')}
                />
              </div>
            </div>

            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...agregarForm.register('tarjeta_amarilla')}
                />
                Amarilla
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...agregarForm.register('tarjeta_roja')}
                />
                Roja
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...agregarForm.register('es_capitan')}
                />
                Capitán
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={savingJugador}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={savingJugador}>
                {savingJugador && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Agregar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog rechazar */}
      <Dialog open={rechazarOpen} onOpenChange={setRechazarOpen}>
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
              <Label htmlFor="obs">Observaciones de rechazo *</Label>
              <Input
                id="obs"
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
                onClick={() => setRechazarOpen(false)}
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

      {/* Confirm eliminar jugador */}
      <ConfirmDialog
        open={!!deletingJugador}
        onOpenChange={(open) => !open && setDeletingJugador(null)}
        title="Quitar jugador"
        description={
          deletingJugador
            ? `¿Quitar a "${deletingJugador.jugador_nombre}" de esta vocalía?`
            : ''
        }
        confirmText="Quitar"
        variant="destructive"
        onConfirm={onEliminarJugador}
        isLoading={savingJugador}
      />
    </div>
  )
}
