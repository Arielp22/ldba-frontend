import type { Lesion } from '../entities/lesion.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListLesionesParams {
  page?: number
  pageSize?: number
  search?: string
  estado?: string
  gravedad?: string
  tipo?: string
  jugador?: number
  equipo?: number
  fecha?: string
}

export interface CreateLesionPayload {
  jugador: number
  equipo?: number | null
  partido?: number | null
  vocalia?: number | null
  fecha: string
  tipo: string
  gravedad?: string
  descripcion?: string
  monto_apoyo?: string | number | null
  estado?: string
  observaciones?: string
}

export interface UpdateLesionPayload {
  fecha?: string
  tipo?: string
  gravedad?: string
  descripcion?: string
  monto_apoyo?: string | number | null
  observaciones?: string
}

export interface CambiarEstadoLesionPayload {
  estado: string
  monto_apoyo?: string | number | null
  observaciones?: string
}

export interface LesionRepository {
  list(params: ListLesionesParams): Promise<PaginatedResult<Lesion>>
  get(id: number): Promise<Lesion>
  create(payload: CreateLesionPayload): Promise<Lesion>
  update(id: number, payload: UpdateLesionPayload): Promise<Lesion>
  remove(id: number): Promise<void>
  cambiarEstado(id: number, payload: CambiarEstadoLesionPayload): Promise<Lesion>
}
