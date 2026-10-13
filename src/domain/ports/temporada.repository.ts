import type { Temporada } from '../entities/temporada.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListTemporadasParams {
  page?: number
  pageSize?: number
  search?: string
  estado?: string
  anio?: number
}

export interface TemporadaRepository {
  list(params: ListTemporadasParams): Promise<PaginatedResult<Temporada>>
  get(id: number): Promise<Temporada>
  create(data: Partial<Temporada>): Promise<Temporada>
  update(id: number, data: Partial<Temporada>): Promise<Temporada>
  remove(id: number): Promise<void>
}
