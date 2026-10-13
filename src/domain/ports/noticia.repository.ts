import type { Noticia } from '../entities/noticia.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListNoticiasParams {
  page?: number
  pageSize?: number
  search?: string
  publicada?: boolean
  destacada?: boolean
}

export interface CreateNoticiaPayload {
  titulo: string
  resumen?: string
  contenido: string
  imagen?: string
  autor?: string
  publicada?: boolean
  destacada?: boolean
  fecha_publicacion?: string | null
}

export interface UpdateNoticiaPayload {
  titulo?: string
  resumen?: string
  contenido?: string
  imagen?: string
  autor?: string
  publicada?: boolean
  destacada?: boolean
  fecha_publicacion?: string | null
}

export interface NoticiaRepository {
  list(params: ListNoticiasParams): Promise<PaginatedResult<Noticia>>
  get(id: number): Promise<Noticia>
  create(payload: CreateNoticiaPayload): Promise<Noticia>
  update(id: number, payload: UpdateNoticiaPayload): Promise<Noticia>
  remove(id: number): Promise<void>
  publicar(id: number): Promise<Noticia>
  despublicar(id: number): Promise<Noticia>
}
