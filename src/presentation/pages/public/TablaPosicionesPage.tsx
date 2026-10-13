import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'

import { publicoUseCase } from '@/infrastructure/factories/publico.factory'
import type { Temporada } from '@/domain/entities/temporada.entity'
import type { Categoria } from '@/domain/entities/categoria.entity'
import type { Posicion } from '@/domain/entities/posicion.entity'

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
import { Skeleton } from '@/presentation/components/ui/skeleton'

export default function TablaPosicionesPage() {
  const [temporadas, setTemporadas] = useState<Temporada[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [temporadaId, setTemporadaId] = useState<number | undefined>()
  const [categoriaId, setCategoriaId] = useState<number | undefined>()
  const [tabla, setTabla] = useState<Posicion[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar temporadas y categorías al montar
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

  // Cargar tabla cuando cambia temporada o categoría
  useEffect(() => {
    if (!temporadaId) return
    setIsLoading(true)
    publicoUseCase
      .getTablaPosiciones(temporadaId, categoriaId)
      .then((res) => setTabla(res.tabla))
      .catch(() => setTabla([]))
      .finally(() => setIsLoading(false))
  }, [temporadaId, categoriaId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-primary" />
            Tabla de posiciones
          </h1>
          <p className="text-sm text-muted-foreground">
            Clasificación actual de la liga
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
          <CardTitle>Clasificación</CardTitle>
          <CardDescription>
            Puntos: 3 victoria · 1 empate · 0 derrota. Desempate por diferencia
            de goles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !tabla || tabla.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Aún no hay partidos finalizados para esta temporada.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead className="text-center">PJ</TableHead>
                    <TableHead className="text-center">PG</TableHead>
                    <TableHead className="text-center">PE</TableHead>
                    <TableHead className="text-center">PP</TableHead>
                    <TableHead className="text-center">GF</TableHead>
                    <TableHead className="text-center">GC</TableHead>
                    <TableHead className="text-center">DG</TableHead>
                    <TableHead className="text-center font-bold">PTS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tabla.map((row) => (
                    <TableRow
                      key={row.equipo_id}
                      className={
                        row.posicion <= 3 ? 'bg-primary/5' : undefined
                      }
                    >
                      <TableCell className="font-bold">
                        {row.posicion}
                      </TableCell>
                      <TableCell className="font-medium">
                        {row.equipo}
                      </TableCell>
                      <TableCell className="text-center">{row.pj}</TableCell>
                      <TableCell className="text-center">{row.pg}</TableCell>
                      <TableCell className="text-center">{row.pe}</TableCell>
                      <TableCell className="text-center">{row.pp}</TableCell>
                      <TableCell className="text-center">{row.gf}</TableCell>
                      <TableCell className="text-center">{row.gc}</TableCell>
                      <TableCell className="text-center">
                        {row.dg > 0 ? `+${row.dg}` : row.dg}
                      </TableCell>
                      <TableCell className="text-center font-bold text-primary">
                        {row.pts}
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
