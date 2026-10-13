import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  ChevronRight,
  Newspaper,
  Star,
  TrendingUp,
  Trophy,
} from 'lucide-react'

import { publicoUseCase } from '@/infrastructure/factories/publico.factory'
import type { Partido } from '@/domain/entities/partido.entity'
import type { Posicion } from '@/domain/entities/posicion.entity'
import type { Goleador } from '@/domain/entities/goleador.entity'
import type { NoticiaPublica } from '@/domain/entities/noticia.entity'
import type { Temporada } from '@/domain/entities/temporada.entity'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { Button } from '@/presentation/components/ui/button'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { formatDate, formatTime } from '@/presentation/utils/formatters'

// ─── Widget: Próximos partidos ────────────────────────────────────────────────

function ProximosPartidos({
  partidos,
}: {
  partidos: Partido[] | null
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Próximos partidos</CardTitle>
          <CardDescription>Fixture por jugar</CardDescription>
        </div>
        <Calendar className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {!partidos ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : partidos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin partidos programados.
          </p>
        ) : (
          <ul className="space-y-3">
            {partidos.slice(0, 5).map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 text-sm border-b last:border-0 pb-2 last:pb-0"
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {p.equipo_local.nombre} vs {p.equipo_visitante.nombre}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {p.dia_display} · {p.hora ? formatTime(p.hora) : '—'} ·{' '}
                    {p.categoria_nombre}
                  </span>
                </div>
                <Badge variant="outline">J{p.jornada_numero}</Badge>
              </li>
            ))}
          </ul>
        )}
        <Button variant="ghost" size="sm" className="w-full mt-3 gap-1" asChild>
          <Link to="/calendario">
            Ver todo el calendario
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Widget: Top 5 tabla ──────────────────────────────────────────────────────

function TopTabla({ tabla }: { tabla: Posicion[] | null }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Tabla de posiciones</CardTitle>
          <CardDescription>Top 5</CardDescription>
        </div>
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {!tabla ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : tabla.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay partidos finalizados.
          </p>
        ) : (
          <ul className="space-y-2">
            {tabla.slice(0, 5).map((row) => (
              <li
                key={row.equipo_id}
                className="flex items-center gap-2 text-sm"
              >
                <span className="w-5 font-bold text-muted-foreground">
                  {row.posicion}
                </span>
                <span className="flex-1 truncate">{row.equipo}</span>
                <span className="font-mono text-xs">{row.pts} pts</span>
              </li>
            ))}
          </ul>
        )}
        <Button variant="ghost" size="sm" className="w-full mt-3 gap-1" asChild>
          <Link to="/tabla">
            Ver tabla completa
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Widget: Top 5 goleadores ─────────────────────────────────────────────────

function TopGoleadores({ goleadores }: { goleadores: Goleador[] | null }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Goleadores</CardTitle>
          <CardDescription>Top 5</CardDescription>
        </div>
        <Trophy className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {!goleadores ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : goleadores.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin goles registrados.</p>
        ) : (
          <ul className="space-y-2">
            {goleadores.slice(0, 5).map((g, i) => (
              <li key={g.jugador_id} className="flex items-center gap-2 text-sm">
                <span className="w-5 font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <div className="flex-1 truncate">
                  <div className="font-medium">{g.jugador}</div>
                  <div className="text-xs text-muted-foreground">
                    {g.equipo}
                  </div>
                </div>
                <span className="font-mono text-xs">{g.goles}</span>
              </li>
            ))}
          </ul>
        )}
        <Button variant="ghost" size="sm" className="w-full mt-3 gap-1" asChild>
          <Link to="/goleadores">
            Ver todos los goleadores
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Widget: Últimas noticias ─────────────────────────────────────────────────

function UltimasNoticias({ noticias }: { noticias: NoticiaPublica[] | null }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base">Últimas noticias</CardTitle>
          <CardDescription>Comunicados de la liga</CardDescription>
        </div>
        <Newspaper className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {!noticias ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : noticias.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Sin noticias publicadas.
          </p>
        ) : (
          <ul className="space-y-3">
            {noticias.slice(0, 5).map((n) => (
              <li key={n.id} className="text-sm">
                <Link
                  to={`/noticias/${n.id}`}
                  className="font-medium line-clamp-1 hover:text-primary"
                >
                  {n.titulo}
                </Link>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {n.fecha_publicacion && (
                    <span>{formatDate(n.fecha_publicacion)}</span>
                  )}
                  {n.destacada && (
                    <Badge variant="outline" className="gap-1 text-xs">
                      <Star className="h-3 w-3" />
                      Destacada
                    </Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <Button variant="ghost" size="sm" className="w-full mt-3 gap-1" asChild>
          <Link to="/noticias">
            Ver todas las noticias
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function PublicHomePage() {
  const [proximos, setProximos] = useState<Partido[] | null>(null)
  const [tabla, setTabla] = useState<Posicion[] | null>(null)
  const [goleadores, setGoleadores] = useState<Goleador[] | null>(null)
  const [noticias, setNoticias] = useState<NoticiaPublica[] | null>(null)
  const [temporadaActiva, setTemporadaActiva] = useState<Temporada | null>(null)

  useEffect(() => {
    async function cargar() {
      try {
        // Cargar todo en paralelo
        const [prox, temps, cats, nots] = await Promise.all([
          publicoUseCase.getProximosPartidos(),
          publicoUseCase.getTemporadas(),
          publicoUseCase.getCategorias(),
          publicoUseCase.getNoticias(1, 5),
        ])

        setProximos(prox)
        setNoticias(nots.results)

        // Buscar temporada "en_curso" o la más reciente
        const activa =
          temps.find((t) => t.estado === 'en_curso') ?? temps[0] ?? null
        setTemporadaActiva(activa)

        if (activa) {
          // Cargar tabla y goleadores de la primera categoría activa
          const categoriaId = cats[0]?.id

          const [tab, gol] = await Promise.all([
            publicoUseCase.getTablaPosiciones(activa.id, categoriaId),
            publicoUseCase.getGoleadores(activa.id, categoriaId, 5),
          ])

          setTabla(tab.tabla)
          setGoleadores(gol.goleadores)
        } else {
          setTabla([])
          setGoleadores([])
        }
      } catch {
        // Silencioso — los widgets muestran placeholder
        setProximos([])
        setTabla([])
        setGoleadores([])
        setNoticias([])
      }
    }

    cargar()
  }, [])

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-lg border bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-10">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Liga Barrial La Armenia
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Fútbol barrial, comunidad y pasión. Consulta la tabla de
            posiciones, los goleadores, el calendario y las últimas noticias.
          </p>
          {temporadaActiva && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Badge variant="default">{temporadaActiva.nombre}</Badge>
              <Badge variant="outline">
                {temporadaActiva.estado === 'en_curso'
                  ? 'En curso'
                  : temporadaActiva.estado}
              </Badge>
            </div>
          )}
        </div>
      </section>

      {/* Grid de widgets */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ProximosPartidos partidos={proximos} />
        <TopTabla tabla={tabla} />
        <TopGoleadores goleadores={goleadores} />
      </section>

      {/* Noticias (ancho completo) */}
      <section>
        <UltimasNoticias noticias={noticias} />
      </section>
    </div>
  )
}
