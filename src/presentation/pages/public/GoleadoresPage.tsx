import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'

import { publicoUseCase } from '@/infrastructure/factories/publico.factory'
import type { Temporada } from '@/domain/entities/temporada.entity'
import type { Categoria } from '@/domain/entities/categoria.entity'
import type { Goleador } from '@/domain/entities/goleador.entity'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/presentation/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/presentation/components/ui/table'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'

export default function GoleadoresPage() {
  const [temporadas, setTemporadas] = useState<Temporada[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [temporadaId, setTemporadaId] = useState<number | undefined>()
  const [categoriaId, setCategoriaId] = useState<number | undefined>()
  const [goleadores, setGoleadores] = useState<Goleador[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const [temps, cats] = await Promise.all([
          publicoUseCase.getTemporadas(),
          publicoUseCase.getCategorias(),
        ])
        setTemporadas(temps)
        setCategorias(cats)

        const activa =
          temps.find((t) => t.estado === 'en_curso') ?? temps[0]
        if (activa) setTemporadaId(activa.id)
        if (cats[0]) setCategoriaId(cats[0].id)
      } catch {
        setTemporadas([])
        setCategorias([])
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (!temporadaId) return
    setIsLoading(true)
    publicoUseCase
      .getGoleadores(temporadaId, categoriaId)
      .then((res) => setGoleadores(res.goleadores))
      .catch(() => setGoleadores([]))
      .finally(() => setIsLoading(false))
  }, [temporadaId, categoriaId])

  function getMedal(pos: number): string {
    if (pos === 1) return '🥇'
    if (pos === 2) return '🥈'
    if (pos === 3) return '🥉'
    return `${pos}`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-7 w-7 text-primary" />
            Goleadores
          </h1>
          <p className="text-sm text-muted-foreground">
            Ranking de goleadores de la temporada
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={temporadaId ? String(temporadaId) : ''}
            onValueChange={(v) => setTemporadaId(Number(v))}
          >
            <SelectTrigger className="md:w-56">
              <SelectValue placeholder="Temporada" />
            </SelectTrigger>
            <SelectContent>
              {temporadas.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={categoriaId ? String(categoriaId) : 'all'}
            onValueChange={(v) =>
              setCategoriaId(v === 'all' ? undefined : Number(v))
            }
          >
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking</CardTitle>
          <CardDescription>
            Suma de goles registrados en las vocalías de la temporada
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !goleadores || goleadores.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aún no hay goles registrados en esta temporada.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">#</TableHead>
                    <TableHead>Jugador</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead className="text-center font-bold">
                      Goles
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {goleadores.map((g, i) => (
                    <TableRow
                      key={g.jugador_id}
                      className={i < 3 ? 'bg-primary/5' : undefined}
                    >
                      <TableCell className="text-center text-lg">
                        {getMedal(i + 1)}
                      </TableCell>
                      <TableCell className="font-medium">{g.jugador}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {g.equipo}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default" className="text-base px-3">
                          {g.goles}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
