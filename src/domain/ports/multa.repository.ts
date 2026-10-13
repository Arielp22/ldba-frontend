import type { Multa } from '../entities/multa.entity'
import type { PaginatedResult } from './categoria.repository'

export interface ListMultasParams {
  page?: number
  pageSize?: number
  search?: string
  estado?: string
  equipo?: number
  sancion?: number
  forma_pago?: string
}

export interface CreateMultaPayload {
  sancion?: number | null
  equipo?: number | null
  monto: string | number
  motivo: string
  estado?: string
  fecha_pago?: string | null
  forma_pago?: string | null
  observaciones?: string
}

export interface UpdateMultaPayload {
  monto?: string | number
  motivo?: string
  estado?: string
  fecha_pago?: string | null
  forma_pago?: string | null
  observaciones?: string
}

export interface MarcarPagadaPayload {
  fecha_pago: string
  forma_pago: string
}

export interface MultaRepository {
  list(params: ListMultasParams): Promise<PaginatedResult<Multa>>
  get(id: number): Promise<Multa>
  create(payload: CreateMultaPayload): Promise<Multa>
  update(id: number, payload: UpdateMultaPayload): Promise<Multa>
  remove(id: number): Promise<void>
  marcarPagada(id: number, payload: MarcarPagadaPayload): Promise<Multa>
}
