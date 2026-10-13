import type { Capitan } from '../entities/capitan.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListCapitanesParams {
  page?: number
  pageSize?: number
  temporada?: number
  categoria?: number
  equipo?: number
  jugador?: number
  activo?: boolean
}

export interface CreateCapitanPayload {
  equipo: number
  jugador: number
  temporada: number
  categoria: number
  activo?: boolean
}

export interface CapitanRepository {
  list(params: ListCapitanesParams): Promise<PaginatedResult<Capitan>>
  create(payload: CreateCapitanPayload): Promise<Capitan>
  update(
    id: number,
    payload: Partial<CreateCapitanPayload>,
  ): Promise<Capitan>
  remove(id: number): Promise<void>
}
