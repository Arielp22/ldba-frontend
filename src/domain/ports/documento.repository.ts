import type { Documento } from '../entities/documento.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListDocumentosParams {
  page?: number
  pageSize?: number
  search?: string
  tipo?: string
  jugador?: number
  equipo?: number
  sesion?: number
}

export interface CreateDocumentoPayload {
  tipo: string
  titulo: string
  descripcion?: string
  archivo: string
  mime_type?: string
  tamano_bytes?: number
  jugador?: number | null
  equipo?: number | null
  sesion?: number | null
}

export interface UpdateDocumentoPayload {
  tipo?: string
  titulo?: string
  descripcion?: string
  archivo?: string
  mime_type?: string
  tamano_bytes?: number
  jugador?: number | null
  equipo?: number | null
  sesion?: number | null
}

export interface DocumentoRepository {
  list(params: ListDocumentosParams): Promise<PaginatedResult<Documento>>
  get(id: number): Promise<Documento>
  create(payload: CreateDocumentoPayload): Promise<Documento>
  update(id: number, payload: UpdateDocumentoPayload): Promise<Documento>
  remove(id: number): Promise<void>
}
