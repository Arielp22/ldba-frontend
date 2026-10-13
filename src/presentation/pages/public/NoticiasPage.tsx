import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Newspaper, Star } from 'lucide-react'

import { publicoUseCase } from '@/infrastructure/factories/publico.factory'
import type { NoticiaPublica } from '@/domain/entities/noticia.entity'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/presentation/components/ui/card'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import Pagination from '@/presentation/components/shared/Pagination'
import { formatDate } from '@/presentation/utils/formatters'

const PAGE_SIZE = 9

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<NoticiaPublica[] | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    publicoUseCase
      .getNoticias(page, PAGE_SIZE)
      .then((res) => {
        setNoticias(res.results)
        setTotal(res.count)
      })
      .catch(() => {
        setNoticias([])
        setTotal(0)
      })
      .finally(() => setIsLoading(false))
  }, [page])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Newspaper className="h-7 w-7 text-primary" />
          Noticias
        </h1>
        <p className="text-sm text-muted-foreground">
          Comunicados oficiales de la liga
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : !noticias || noticias.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No hay noticias publicadas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {noticias.map((n) => (
              <Card
                key={n.id}
                className="flex flex-col hover:shadow-md transition-shadow"
              >
                {n.imagen && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                    <img
                      src={n.imagen}
                      alt={n.titulo}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        // Si la imagen no carga, ocultarla
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2 pb-1">
                    {n.destacada && (
                      <Badge variant="default" className="gap-1">
                        <Star className="h-3 w-3" />
                        Destacada
                      </Badge>
                    )}
                    {n.fecha_publicacion && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(n.fecha_publicacion)}
                      </span>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{n.titulo}</CardTitle>
                  {n.resumen && (
                    <CardDescription className="line-clamp-3">
                      {n.resumen}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="mt-auto">
                  <Link
                    to={`/noticias/${n.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Leer más →
                  </Link>
                  {n.autor && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Por {n.autor}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
            disabled={isLoading}
          />
        </>
      )}
    </div>
  )
}
