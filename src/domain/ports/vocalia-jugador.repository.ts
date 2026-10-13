import type { VocaliaJugador } from '../entities/vocalia-jugador.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListVocaliaJugadoresParams {
  page?: number
  pageSize?: number
  search?: string
  vocalia?: number
  jugador?: number
  equipo?: number
}

export interface CreateVocaliaJugadorPayload {
  vocalia: number
  jugador: number
  equipo: number
  goles?: number
  tarjeta_amarilla?: boolean
  tarjeta_roja?: boolean
  es_capitan?: boolean
  ingreso_minuto?: number | null
  salida_minuto?: number | null
}

export interface UpdateVocaliaJugadorPayload {
  goles?: number
  tarjeta_amarilla?: boolean
  tarjeta_roja?: boolean
  es_capitan?: boolean
  ingreso_minuto?: number | null
  salida_minuto?: number | null
}

export interface VocaliaJugadorRepository {
  list(
    params: ListVocaliaJugadoresParams,
  ): Promise<PaginatedResult<VocaliaJugador>>
  create(payload: CreateVocaliaJugadorPayload): Promise<VocaliaJugador>
  update(
    id: number,
    payload: UpdateVocaliaJugadorPayload,
  ): Promise<VocaliaJugador>
  remove(id: number): Promise<void>
}
