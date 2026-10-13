import type { Inscripcion } from '../entities/inscripcion.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListInscripcionesParams {
  page?: number
  pageSize?: number
  temporada?: number
  categoria?: number
  equipo?: number
  activo?: boolean
}

export interface CreateInscripcionPayload {
  equipo: number
  temporada: number
  categoria: number
  activo?: boolean
}

export interface InscripcionRepository {
  list(params: ListInscripcionesParams): Promise<PaginatedResult<Inscripcion>>
  create(payload: CreateInscripcionPayload): Promise<Inscripcion>
  update(id: number, payload: Partial<CreateInscripcionPayload>): Promise<Inscripcion>
  remove(id: number): Promise<void>
}
