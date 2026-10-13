import { useEffect, useState } from 'react'
import { Calendar, CheckCircle2, Clock, MapPin } from 'lucide-react'

import { publicoUseCase } from '@/infrastructure/factories/publico.factory'
import type { Partido } from '@/domain/entities/partido.entity'

import {
  Card,
  CardContent,
} from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/presentation/components/ui/tabs'
import { formatTime } from '@/presentation/utils/formatters'

// ─── Componente: tarjeta de partido ───────────────────────────────────────────

function PartidoCard({ partido, esResultado }: { partido: Partido; esResultado: boolean }) {
  const tieneResultado =
    partido.goles_local !== null && partido.goles_visitante !== null

  return (
    <div className="rounded-lg border p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="outline">J{partido.jornada_numero}</Badge>
          <Badge variant="secondary">{partido.categoria_nombre}</Badge>
          <span className="text-xs text-muted-foreground capitalize">
            {partido.dia_display} · P{partido.numero_partido}
          </span>
        </div>
        <Badge
          variant={
            partido.estado === 'finalizado'
              ? 'secondary'
              : partido.estado === 'suspendido' || partido.estado === 'cancelado'
                ? 'destructive'
                : 'outline'
          }
        >
          {partido.estado_display}
        </Badge>
      </div>

      {/* Equipos y resultado */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-right">
          <div className="font-medium">{partido.equipo_local.nombre}</div>
          {partido.equipo_local.siglas && (
            <div className="text-xs text-muted-foreground">
              {partido.equipo_local.siglas}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          {tieneResultado ? (
            <div className="text-2xl font-bold font-mono">
              {partido.goles_local} - {partido.goles_visitante}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">vs</div>
          )}
        </div>

        <div className="flex-1">
          <div className="font-medium">{partido.equipo_visitante.nombre}</div>
          {partido.equipo_visitante.siglas && (
            <div className="text-xs text-muted-foreground">
              {partido.equipo_visitante.siglas}
            </div>
          )}
        </div>
      </div>

      {/* Info inferior */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-t pt-2">
        {partido.hora && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(partido.hora)}
          </span>
        )}
        {partido.equipo_vocal && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Vocal: {partido.equipo_vocal.nombre}
          </span>
        )}
        {esResultado && (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Finalizado
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function CalendarioPage() {
  const [proximos, setProximos] = useState<Partido[] | null>(null)
  const [recientes, setRecientes] = useState<Partido[] | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        const [p, r] = await Promise.all([
          publicoUseCase.getProximosPartidos(),
          publicoUseCase.getResultadosRecientes(),
        ])
        setProximos(p)
        setRecientes(r)
      } catch {
        setProximos([])
        setRecientes([])
      }
    }
    cargar()
  }, [])
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Calendar className="h-7 w-7 text-primary" />
          Calendario
        </h1>
        <p className="text-sm text-muted-foreground">
          Próximos partidos y resultados recientes
        </p>
      </div>

      <Tabs defaultValue="proximos">
        <TabsList className="grid w-full grid-cols-2 md:w-80">
          <TabsTrigger value="proximos">Próximos</TabsTrigger>
          <TabsTrigger value="recientes">Resultados</TabsTrigger>
        </TabsList>

        {/* Tab: Próximos */}
        <TabsContent value="proximos" className="space-y-4">
          {proximos === null ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : proximos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No hay partidos programados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {proximos.map((p) => (
                <PartidoCard key={p.id} partido={p} esResultado={false} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Resultados */}
        <TabsContent value="recientes" className="space-y-4">
          {recientes === null ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : recientes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No hay resultados registrados aún.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recientes.map((p) => (
                <PartidoCard key={p.id} partido={p} esResultado={true} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
