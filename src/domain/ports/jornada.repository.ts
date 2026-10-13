import type { Jornada } from '../entities/jornada.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListJornadasParams {
  page?: number
  pageSize?: number
  search?: string
  temporada?: number
  categoria?: number
  estado?: string
  numero?: number
}

export interface CreateJornadaPayload {
  temporada: number
  categoria: number
  numero: number
  fecha_sabado: string
  fecha_domingo: string
  estado?: string
}

export interface JornadaRepository {
  list(params: ListJornadasParams): Promise<PaginatedResult<Jornada>>
  get(id: number): Promise<Jornada>
  create(payload: CreateJornadaPayload): Promise<Jornada>
  update(id: number, payload: Partial<CreateJornadaPayload>): Promise<Jornada>
  remove(id: number): Promise<void>
}
