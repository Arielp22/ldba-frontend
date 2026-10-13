import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Dices,
  Loader2,
  AlertCircle,
} from 'lucide-react'

import { jornadaUseCase } from '@/infrastructure/factories/jornada.factory'
import { partidoAdminUseCase } from '@/infrastructure/factories/partido-admin.factory'
import { useAuthStore } from '@/presentation/store/auth.store'
import { usePartidoAdminStore } from '@/presentation/store/partido-admin.store'

import type {
  PartidoAdmin,
  SorteoVocaliasResponse,
} from '@/domain/entities/partido-admin.entity'
import type { Jornada } from '@/domain/entities/jornada.entity'

import { Button } from '@/presentation/components/ui/button'
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
  DialogHeader,
  DialogTitle,
} from '@/presentation/components/ui/dialog'
import { formatDate, formatTime } from '@/presentation/utils/formatters'

// ─── Constantes ───────────────────────────────────────────────────────────────

const ESTADO_VARIANT: Record<
  PartidoAdmin['estado'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  programado: 'outline',
  en_curso: 'default',
  finalizado: 'secondary',
  suspendido: 'destructive',
  cancelado: 'destructive',
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function JornadaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const canWrite =
    !!user && (user.is_superuser || user.groups.includes('Comision Tecnica'))

  const sortearVocalias = usePartidoAdminStore((s) => s.sortearVocalias)
  const isSaving = usePartidoAdminStore((s) => s.isSaving)

  const [jornada, setJornada] = useState<Jornada | null>(null)
  const [partidos, setPartidos] = useState<PartidoAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sorteoResult, setSorteoResult] = useState<SorteoVocaliasResponse | null>(
    null,
  )
  const [sorteoOpen, setSorteoOpen] = useState(false)

  const jornadaId = Number(id)

  async function cargar() {
    if (!jornadaId) return
    setIsLoading(true)
    setError(null)
    try {
      const [j, p] = await Promise.all([
        jornadaUseCase.get(jornadaId),
        partidoAdminUseCase.list({ jornada: jornadaId, pageSize: 100 }),
      ])
      setJornada(j)
      setPartidos(p.results)
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string }
      setError(e.detail ?? e.message ?? 'Error al cargar la jornada')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jornadaId])

  async function onSortear() {
    if (!jornadaId) return
    try {
      const result = await sortearVocalias(jornadaId)
      setSorteoResult(result)
      setSorteoOpen(true)
      await cargar()
    } catch {
      // Error ya está en el store
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center gap-2">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    )
  }

  if (!jornada) {
    return <p className="text-muted-foreground">Jornada no encontrada.</p>
  }

  const partidosSabado = partidos.filter((p) => p.dia === 'sabado')
  const partidosDomingo = partidos.filter((p) => p.dia === 'domingo')

  function PartidoRow({ p }: { p: PartidoAdmin }) {
    return (
      <div className="flex items-center gap-3 py-2 border-b last:border-0">
        <Badge variant="outline" className="w-12 justify-center">
          P{p.numero_partido}
        </Badge>
        <span className="font-mono text-xs w-12 text-muted-foreground">
          {p.hora ? formatTime(p.hora) : '—'}
        </span>
        <div className="flex-1 flex items-center gap-2 text-sm">
          <span className="font-medium">{p.equipo_local_nombre}</span>
          {p.goles_local !== null && p.goles_visitante !== null ? (
            <span className="font-mono font-bold">
              {p.goles_local} - {p.goles_visitante}
            </span>
          ) : (
            <span className="text-muted-foreground">vs</span>
          )}
          <span className="font-medium">{p.equipo_visitante_nombre}</span>
        </div>
        {p.equipo_vocal_nombre && (
          <Badge variant="secondary" className="text-xs">
            Vocal: {p.equipo_vocal_nombre}
          </Badge>
        )}
        <Badge variant={ESTADO_VARIANT[p.estado]}>
          {p.estado_display}
        </Badge>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con botón volver */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/jornadas')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Jornada J{jornada.numero}
            </h1>
            <p className="text-sm text-muted-foreground">
              {jornada.temporada_nombre} · {jornada.categoria_nombre}
            </p>
          </div>
        </div>
        <Button
          onClick={onSortear}
          disabled={!canWrite || isSaving || partidos.length < 10}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Dices className="h-4 w-4" />
          )}
          Sortear vocalías
        </Button>
      </div>

      {/* Info de jornada */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base">Información</CardTitle>
            <CardDescription>
              {partidos.length} / 10 partidos creados
            </CardDescription>
          </div>
          <Calendar className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Sábado:</span>{' '}
              <span className="font-medium">
                {formatDate(jornada.fecha_sabado)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Domingo:</span>{' '}
              <span className="font-medium">
                {formatDate(jornada.fecha_domingo)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Estado:</span>{' '}
              <Badge>{jornada.estado}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partidos sábado */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sábado</CardTitle>
          <CardDescription>
            {partidosSabado.length} partido(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {partidosSabado.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay partidos creados para el sábado.
            </p>
          ) : (
            partidosSabado
              .sort((a, b) => a.numero_partido - b.numero_partido)
              .map((p) => <PartidoRow key={p.id} p={p} />)
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Partidos domingo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Domingo</CardTitle>
          <CardDescription>
            {partidosDomingo.length} partido(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {partidosDomingo.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay partidos creados para el domingo.
            </p>
          ) : (
            partidosDomingo
              .sort((a, b) => a.numero_partido - b.numero_partido)
              .map((p) => <PartidoRow key={p.id} p={p} />)
          )}
        </CardContent>
      </Card>

      {/* Dialog resultado del sorteo */}
      <Dialog open={sorteoOpen} onOpenChange={setSorteoOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Resultado del sorteo</DialogTitle>
            <DialogDescription>
              Estas son las vocalías asignadas según el emparejamiento
              P1→P3, P2→P1, P3→P2, P4↔P5.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto space-y-3">
            {sorteoResult?.asignaciones.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-md border p-3 text-sm"
              >
                <Badge variant="outline">{a.dia}</Badge>
                <span className="font-medium">P{a.partido}</span>
                {a.error ? (
                  <span className="text-destructive text-xs">{a.error}</span>
                ) : (
                  <>
                    <span className="text-muted-foreground text-xs">
                      ← vocaliza P{a.vocaliza_partido}
                    </span>
                    <span className="ml-auto font-medium text-primary">
                      {a.equipo_vocal}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
