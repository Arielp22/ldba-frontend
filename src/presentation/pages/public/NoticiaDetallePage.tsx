import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle, Calendar, Star, User } from 'lucide-react'

import { publicoUseCase } from '@/infrastructure/factories/publico.factory'
import type { NoticiaPublica } from '@/domain/entities/noticia.entity'

import { Button } from '@/presentation/components/ui/button'
import { Badge } from '@/presentation/components/ui/badge'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { Separator } from '@/presentation/components/ui/separator'
import { formatDate } from '@/presentation/utils/formatters'

export default function NoticiaDetallePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [noticia, setNoticia] = useState<NoticiaPublica | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    setError(null)

    publicoUseCase
      .getNoticiaDetalle(Number(id))
      .then(setNoticia)
      .catch((err: unknown) => {
        const e = err as { detail?: string; message?: string }
        setError(e.detail ?? e.message ?? 'No se encontró la noticia')
      })
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (error || !noticia) {
    return (
      <div className="mx-auto max-w-3xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/noticias')}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a noticias
        </Button>
        <div className="rounded-md bg-destructive/10 px-4 py-6 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error ?? 'Noticia no encontrada'}
        </div>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      {/* Volver */}
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="gap-2 -ml-3"
      >
        <Link to="/noticias">
          <ArrowLeft className="h-4 w-4" />
          Volver a noticias
        </Link>
      </Button>

      {/* Header */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {noticia.destacada && (
            <Badge variant="default" className="gap-1">
              <Star className="h-3 w-3" />
              Destacada
            </Badge>
          )}
          {noticia.fecha_publicacion && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(noticia.fecha_publicacion)}
            </span>
          )}
          {noticia.autor && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="h-3 w-3" />
              {noticia.autor}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          {noticia.titulo}
        </h1>

        {noticia.resumen && (
          <p className="text-lg text-muted-foreground">{noticia.resumen}</p>
        )}
      </header>

      <Separator />

      {/* Imagen */}
      {noticia.imagen && (
        <div className="aspect-video w-full overflow-hidden rounded-lg border bg-muted">
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
            className="h-full w-full object-cover"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Contenido */}
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap text-base leading-relaxed">
          {noticia.contenido}
        </p>
      </div>

      {/* Footer CTA */}
      <Separator />
      <div className="text-center">
        <Button variant="outline" asChild>
          <Link to="/noticias">Ver más noticias</Link>
        </Button>
      </div>
    </article>
  )
}
