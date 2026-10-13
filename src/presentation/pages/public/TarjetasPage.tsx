import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

import { publicoUseCase } from '@/infrastructure/factories/publico.factory'
import type { Temporada } from '@/domain/entities/temporada.entity'
import type { Categoria } from '@/domain/entities/categoria.entity'
import type { Tarjeta } from '@/domain/ports/publico.repository'

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

export default function TarjetasPage() {
  const [temporadas, setTemporadas] = useState<Temporada[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [temporadaId, setTemporadaId] = useState<number | undefined>()
  const [categoriaId, setCategoriaId] = useState<number | undefined>()
  const [tarjetas, setTarjetas] = useState<Tarjeta[] | null>(null)
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
      .getTarjetas(temporadaId, categoriaId)
      .then((res) => setTarjetas(res.tarjetas))
      .catch(() => setTarjetas([]))
      .finally(() => setIsLoading(false))
  }, [temporadaId, categoriaId])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-primary" />
            Tarjetas
          </h1>
          <p className="text-sm text-muted-foreground">
            Tarjetas amarillas y rojas por jugador
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
          <CardTitle>Disciplina</CardTitle>
          <CardDescription>
            Jugadores con tarjetas registradas en las vocalías
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !tarjetas || tarjetas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay tarjetas registradas en esta temporada.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jugador</TableHead>
                    <TableHead>Equipo</TableHead>
                    <TableHead className="text-center">
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-block h-4 w-3 bg-yellow-400 rounded" />
                        Amarillas
                      </span>
                    </TableHead>
                    <TableHead className="text-center">
                      <span className="inline-flex items-center gap-1">
                        <span className="inline-block h-4 w-3 bg-red-600 rounded" />
                        Rojas
                      </span>
                    </TableHead>
                    <TableHead className="text-center font-bold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tarjetas.map((t) => (
                    <TableRow key={t.jugador_id}>
                      <TableCell className="font-medium">{t.jugador}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.equipo}
                      </TableCell>
                      <TableCell className="text-center">
                        {t.amarillas > 0 ? (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">
                            {t.amarillas}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {t.rojas > 0 ? (
                          <Badge className="bg-red-600 hover:bg-red-700">
                            {t.rojas}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {t.total}
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
